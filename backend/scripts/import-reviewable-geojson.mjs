#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = {
    file: "",
    dryRun: false,
    limit: 0,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--file" && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
    } else if (token === "--dry-run") {
      args.dryRun = true;
    } else if (token === "--limit" && argv[i + 1]) {
      args.limit = Number(argv[i + 1]) || 0;
      i += 1;
    }
  }

  return args;
}

const REVIEWABLE_AMENITIES = new Set([
  "restaurant",
  "cafe",
  "fast_food",
  "bar",
  "pub",
  "biergarten",
  "food_court",
  "nightclub",
]);

const REVIEWABLE_LEISURE = new Set([
  "amusement_arcade",
  "water_park",
  "theme_park",
]);

const REVIEWABLE_TOURISM = new Set([
  "attraction",
  "museum",
  "zoo",
  "aquarium",
]);

function normalizeCategory(tags) {
  const amenity = String(tags.amenity || "").trim().toLowerCase();
  const leisure = String(tags.leisure || "").trim().toLowerCase();
  const tourism = String(tags.tourism || "").trim().toLowerCase();

  if (REVIEWABLE_AMENITIES.has(amenity)) return `amenity:${amenity}`;
  if (REVIEWABLE_LEISURE.has(leisure)) return `leisure:${leisure}`;
  if (REVIEWABLE_TOURISM.has(tourism)) return `tourism:${tourism}`;
  return null;
}

function getTags(properties) {
  const rawTags = properties?.tags;
  if (rawTags && typeof rawTags === "object" && !Array.isArray(rawTags)) {
    return rawTags;
  }
  const tags = {};
  for (const [key, value] of Object.entries(properties || {})) {
    if (typeof value !== "string") continue;
    if (key === "amenity" || key === "leisure" || key === "tourism" || key.startsWith("addr:") || key === "name") {
      tags[key] = value;
    }
  }
  return tags;
}

function extractAddress(tags) {
  const direct = tags["addr:full"] || tags.address;
  if (direct) return String(direct).trim();

  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:ward"],
    tags["addr:district"],
    tags["addr:city"],
    tags["addr:province"],
  ]
    .filter(Boolean)
    .map((item) => String(item).trim());

  return parts.length ? parts.join(", ") : null;
}

function sourceRefFromProperties(properties) {
  const candidates = [
    properties?.["@id"],
    properties?.id,
    properties?.osm_id,
    properties?.osmid,
  ];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue;
    return String(candidate);
  }
  return null;
}

function isPointFeature(feature) {
  return feature?.geometry?.type === "Point" && Array.isArray(feature?.geometry?.coordinates);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) {
    throw new Error("Missing --file <geojson-path>");
  }

  const filePath = path.resolve(args.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`GeoJSON file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const features = Array.isArray(parsed?.features) ? parsed.features : [];

  let readCount = 0;
  let keptCount = 0;
  let upsertedCount = 0;
  let skippedCount = 0;

  for (const feature of features) {
    if (args.limit > 0 && readCount >= args.limit) break;
    readCount += 1;

    if (!isPointFeature(feature)) {
      skippedCount += 1;
      continue;
    }

    const [longitude, latitude] = feature.geometry.coordinates;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      skippedCount += 1;
      continue;
    }

    const properties = feature.properties || {};
    const tags = getTags(properties);
    const category = normalizeCategory(tags);
    if (!category) {
      skippedCount += 1;
      continue;
    }

    const name = String(tags.name || properties.name || "").trim();
    if (!name) {
      skippedCount += 1;
      continue;
    }

    const sourceRef = sourceRefFromProperties(properties);
    const payload = {
      type: "PLACE",
      name,
      description: null,
      category,
      address: extractAddress(tags),
      latitude,
      longitude,
      source: "OSM",
      sourceRef,
    };

    keptCount += 1;
    if (args.dryRun) continue;

    if (sourceRef) {
      await prisma.context.upsert({
        where: {
          source_sourceRef: {
            source: "OSM",
            sourceRef,
          },
        },
        create: payload,
        update: {
          name: payload.name,
          category: payload.category,
          address: payload.address,
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      });
      upsertedCount += 1;
      continue;
    }

    const existing = await prisma.context.findFirst({
      where: {
        type: "PLACE",
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      select: { id: true },
    });

    if (existing) {
      skippedCount += 1;
      continue;
    }

    await prisma.context.create({ data: payload });
    upsertedCount += 1;
  }

  console.log("Import finished", {
    file: filePath,
    readCount,
    keptCount,
    upsertedCount,
    skippedCount,
    dryRun: args.dryRun,
  });
}

main()
  .catch((error) => {
    console.error("[import-reviewable-geojson] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
