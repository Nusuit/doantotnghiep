import { Prisma, PrismaClient } from "@prisma/client";
import {
  ADMIN_LEVEL_KEYWORDS,
  CITY_ALIASES,
  VI_SYNONYMS,
  EN_SYNONYMS,
} from "../lib/location-keywords";

// ─────────────────────────────────────────────────────────────────────────────
// Raw query result types — typed for $queryRaw<T[]>, no `as any`
// ─────────────────────────────────────────────────────────────────────────────

interface ContextRow {
  id: number;
  name: string;
  canonical_name: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  avg_rating: number;
  review_count: number;
  is_reviewed: boolean;
  updated_at: Date;
  city_name: string | null;
  district_name: string | null;
  trgm_score: number; // similarity() from pg_trgm — may arrive as string, use Number()
}

interface ArticleRow {
  id: number;
  title: string;
  normalized_title: string | null;
  content: string;
  author_id: number;
  upvote_count: number;
  view_count: number;
  save_count: number;
  created_at: Date;
  trgm_score: number;
}

interface CollectionItemWithContext {
  article: {
    context: {
      id: number;
      name: string;
      latitude: number | null;
      longitude: number | null;
      category: string | null;
      avgRating: number;
      reviewCount: number;
      isReviewed: boolean;
      canonicalName: string | null;
      cityName: string | null;
      districtName: string | null;
    } | null;
  } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service input / output types
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchParams {
  q: string;
  world: "open" | "private";
  userId: number;
  lat?: number;
  lng?: number;
  minRating?: number;
  nearby: boolean;
  limit: number;
}

export interface SearchFullParams extends SearchParams {
  types: string;
  page: number;
  recentDays?: number;
}

export interface SearchResultItem {
  type: "place" | "article";
  id: string;
  title: string;
  subtitle: string;
  score: number;
  lat?: number | null;
  lng?: number | null;
  rating?: number;
  createdAt?: Date | null;
}

// Internal scored candidate (places)
interface ScoredContext {
  row: ContextRow | CollectionItemWithContext["article"];
  id: number;
  name: string;
  canonical: string;
  lat: number | null;
  lng: number | null;
  category: string | null;
  avgRating: number;
  reviewCount: number;
  districtName: string | null;
  trgmScore: number;
  fuzzyScore: number;
  finalScore: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// [1] Normalize
// ─────────────────────────────────────────────────────────────────────────────

// JS-side unaccent map for Vietnamese common characters
const UNACCENT_MAP: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a",
  ă: "a", ắ: "a", ằ: "a", ẳ: "a", ẵ: "a", ặ: "a",
  ấ: "a", ầ: "a", ẩ: "a", ẫ: "a", ậ: "a",
  è: "e", é: "e", ê: "e", ế: "e", ề: "e", ể: "e", ễ: "e", ệ: "e",
  ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
  ò: "o", ó: "o", ô: "o", õ: "o", ö: "o",
  ố: "o", ồ: "o", ổ: "o", ỗ: "o", ộ: "o",
  ơ: "o", ớ: "o", ờ: "o", ở: "o", ỡ: "o", ợ: "o",
  ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
  ư: "u", ứ: "u", ừ: "u", ử: "u", ữ: "u", ự: "u",
  ý: "y", ỳ: "y", ỷ: "y", ỹ: "y", ỵ: "y",
  đ: "d",
  ạ: "a", ả: "a",
  ẹ: "e", ẻ: "e", ẽ: "e",
  ọ: "o", ỏ: "o",
};

export function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0000-\u007E]/g, (ch) => UNACCENT_MAP[ch] ?? ch)
    .replace(/\s+/g, " ")
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// [2] Language Detection
// ─────────────────────────────────────────────────────────────────────────────

const VI_REGEX =
  /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ]/i;

export function detectLanguage(q: string): "vi" | "other" {
  return VI_REGEX.test(q) ? "vi" : "other";
}

// ─────────────────────────────────────────────────────────────────────────────
// [3] Query Parsing
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedQuery {
  intent: string;
  location: {
    type: "district" | "ward" | "city" | "province" | "street" | null;
    value: string | null;
  };
  raw: string;
}

export function parseQuery(normalized: string): ParsedQuery {
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const intentTokens: string[] = [];
  let locationType: ParsedQuery["location"]["type"] = null;
  let locationValue: string | null = null;

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    // Try two-token keyword first (e.g., "thanh pho")
    const twoToken = i + 1 < tokens.length ? `${token} ${tokens[i + 1]}` : null;
    const twoTokenType = twoToken ? ADMIN_LEVEL_KEYWORDS[twoToken] : undefined;
    const oneTokenType = ADMIN_LEVEL_KEYWORDS[token];

    const matchedType = twoTokenType ?? oneTokenType;
    const consumed = twoTokenType ? 2 : oneTokenType ? 1 : 0;

    if (matchedType && consumed > 0) {
      locationType = matchedType;
      const valueIndex = i + consumed;
      if (valueIndex < tokens.length) {
        let value = tokens[valueIndex];
        // Check CITY_ALIASES for city type
        if (matchedType === "city") {
          value = CITY_ALIASES[value] ?? value;
        }
        locationValue = value;
        i = valueIndex + 1;
      } else {
        i += consumed;
      }
    } else {
      intentTokens.push(token);
      i++;
    }
  }

  // If no intent found but a location was parsed, the whole query is the location
  const intent = intentTokens.join(" ") || normalized;

  return { intent, location: { type: locationType, value: locationValue }, raw: normalized };
}

// ─────────────────────────────────────────────────────────────────────────────
// [4] Query Expansion
// ─────────────────────────────────────────────────────────────────────────────

export function expandIntent(intent: string, lang: "vi" | "other"): string[] {
  const synonymMap = lang === "vi" ? VI_SYNONYMS : EN_SYNONYMS;
  const extras: string[] = [];

  for (const [key, variants] of Object.entries(synonymMap)) {
    if (intent.includes(key)) {
      extras.push(...variants.map(normalizeQuery));
    }
  }

  return [...new Set([intent, ...extras])];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: scoring
// ─────────────────────────────────────────────────────────────────────────────

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[n];
}

export function levenshteinNormalized(a: string, b: string): number {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - dist / maxLen;
}

export function qualityScore(avgRating: number, reviewCount: number): number {
  return Math.min(
    (Number(avgRating) / 5) * 0.7 +
      Math.min(Number(reviewCount) / 100, 1) * 0.3,
    1
  );
}

function distanceInMeters(
  aLat?: number | null,
  aLng?: number | null,
  bLat?: number,
  bLng?: number
): number | null {
  if (
    typeof aLat !== "number" ||
    typeof aLng !== "number" ||
    typeof bLat !== "number" ||
    typeof bLng !== "number"
  ) {
    return null;
  }
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6_371_000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Continuous exponential decay: 1.0 at 0m, ~0.37 at 3km, ~0.05 at 9km */
function distanceDecay(meters: number | null): number {
  if (meters === null) return 0;
  return Math.exp(-meters / 3_000);
}

/** Step-function for coarse radius filter (Layer 2) */
function withinRadius(
  lat: number | null,
  lng: number | null,
  userLat?: number,
  userLng?: number,
  nearby = false
): boolean {
  const dist = distanceInMeters(lat, lng, userLat, userLng);
  if (dist === null) return true; // no coords → don't filter out
  const maxDist = nearby ? 3_000 : 15_000;
  return dist <= maxDist;
}

// ─────────────────────────────────────────────────────────────────────────────
// [5] Layer 1: Recall — Postgres Trigram
// ─────────────────────────────────────────────────────────────────────────────

async function recallContexts(
  intentTerms: string[],
  candidateLimit: number,
  minRating: number | undefined,
  prisma: PrismaClient
): Promise<ContextRow[]> {
  const [q1, q2 = q1] = intentTerms;
  const ratingFilter =
    minRating !== undefined
      ? Prisma.sql`AND c.avg_rating >= ${minRating}`
      : Prisma.empty;

  return prisma.$queryRaw<ContextRow[]>`
    SELECT
      c.id,
      c.name,
      c.canonical_name,
      c.latitude,
      c.longitude,
      c.category,
      c.avg_rating,
      c.review_count,
      c.is_reviewed,
      c.updated_at,
      c.city_name,
      c.district_name,
      GREATEST(
        similarity(coalesce(c.canonical_name, ''), ${q1}),
        similarity(coalesce(c.canonical_name, ''), ${q2})
      ) AS trgm_score
    FROM contexts c
    WHERE
      c.type = 'PLACE'
      ${ratingFilter}
      AND (
        c.canonical_name % ${q1}
        OR c.canonical_name % ${q2}
      )
    ORDER BY trgm_score DESC, c.is_reviewed DESC, c.avg_rating DESC
    LIMIT ${candidateLimit}
  `;
}

async function recallArticles(
  intentTerms: string[],
  candidateLimit: number,
  recentDate: Date | null,
  prisma: PrismaClient
): Promise<ArticleRow[]> {
  const [q1, q2 = q1] = intentTerms;
  const recentFilter = recentDate
    ? Prisma.sql`AND a.created_at >= ${recentDate}`
    : Prisma.empty;

  return prisma.$queryRaw<ArticleRow[]>`
    SELECT
      a.id,
      a.title,
      a.normalized_title,
      a.content,
      a.author_id,
      a.upvote_count,
      a.view_count,
      a.save_count,
      a.created_at,
      GREATEST(
        similarity(coalesce(a.normalized_title, ''), ${q1}),
        similarity(coalesce(a.normalized_title, ''), ${q2})
      ) AS trgm_score
    FROM articles a
    WHERE
      (
        a.normalized_title % ${q1}
        OR a.normalized_title % ${q2}
      )
      ${recentFilter}
    ORDER BY trgm_score DESC, a.created_at DESC
    LIMIT ${candidateLimit}
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// [6] Layer 2: Context Filtering
// ─────────────────────────────────────────────────────────────────────────────

function filterContextRows(
  rows: ContextRow[],
  parsed: ParsedQuery,
  params: Pick<SearchParams, "lat" | "lng" | "nearby">
): ContextRow[] {
  return rows.filter((row) => {
    // Geospatial radius filter
    if (!withinRadius(row.latitude, row.longitude, params.lat, params.lng, params.nearby)) {
      return false;
    }
    // District filter from query parsing
    if (parsed.location.type === "district" && parsed.location.value) {
      const target = parsed.location.value;
      const dist = (row.district_name ?? "").toLowerCase();
      if (!dist.includes(target) && dist !== target) return false;
    }
    // City filter
    if (parsed.location.type === "city" && parsed.location.value) {
      const target = parsed.location.value;
      const city = (row.city_name ?? "").toLowerCase();
      if (!city.includes(target)) return false;
    }
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// [7] Layer 3: Final Ranking
// ─────────────────────────────────────────────────────────────────────────────

function scoreAndRankContexts(
  rows: ContextRow[],
  normalizedIntent: string,
  params: Pick<SearchParams, "lat" | "lng" | "limit">
): SearchResultItem[] {
  return rows
    .map((row) => {
      const canonical = row.canonical_name ?? normalizeQuery(row.name);
      const levScore = levenshteinNormalized(normalizedIntent, canonical);
      const fuzzy = Math.max(Number(row.trgm_score), levScore);
      const quality = qualityScore(Number(row.avg_rating), Number(row.review_count));
      const dist = distanceInMeters(row.latitude, row.longitude, params.lat, params.lng);
      const proximity = distanceDecay(dist);
      const score = 0.58 * fuzzy + 0.24 * quality + 0.18 * proximity;

      return {
        type: "place" as const,
        id: String(row.id),
        title: String(row.name),
        subtitle: `${row.category ?? "Place"} • ${Number(row.avg_rating).toFixed(1)}★`,
        score: Number(score.toFixed(4)),
        lat: row.latitude,
        lng: row.longitude,
        rating: Number(row.avg_rating),
        createdAt: row.updated_at ?? null,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, params.limit);
}

function scoreAndRankArticles(
  rows: ArticleRow[],
  normalizedIntent: string,
  limit: number
): SearchResultItem[] {
  return rows
    .map((row) => {
      const normTitle = row.normalized_title ?? normalizeQuery(row.title);
      const levScore = levenshteinNormalized(normalizedIntent, normTitle);
      const fuzzy = Math.max(Number(row.trgm_score), levScore);
      const engagement = Math.min(
        (Number(row.upvote_count) +
          Number(row.view_count) * 0.08 +
          Number(row.save_count) * 0.2) /
          120,
        1
      );
      const ageDays = Math.max(
        0,
        Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86_400_000)
      );
      const freshness = Math.max(0, 1 - ageDays / 90);
      const score = fuzzy * 0.6 + engagement * 0.25 + freshness * 0.15;

      return {
        type: "article" as const,
        id: String(row.id),
        title: String(row.title),
        subtitle: `Article`,
        score: Number(score.toFixed(4)),
        createdAt: row.created_at,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// Private world (collection-based) search — Prisma ORM, no trigram needed
// ─────────────────────────────────────────────────────────────────────────────

async function searchPrivateContexts(
  params: SearchParams,
  prisma: PrismaClient
): Promise<SearchResultItem[]> {
  const items = await prisma.collectionItem.findMany({
    where: {
      collection: {
        userId: params.userId,
        title: "Favorite Locations",
        isPublic: false,
      },
      article: {
        context: {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { address: { contains: params.q, mode: "insensitive" } },
          ],
        },
      },
    },
    include: {
      article: {
        include: {
          context: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true,
              category: true,
              avgRating: true,
              reviewCount: true,
              isReviewed: true,
              canonicalName: true,
              cityName: true,
              districtName: true,
            },
          },
        },
      },
    },
    take: 120,
    orderBy: { addedAt: "desc" },
  });

  const normalizedIntent = normalizeQuery(params.q);
  const lang = detectLanguage(params.q);
  const intentTerms = expandIntent(normalizedIntent, lang);
  const primaryIntent = intentTerms[0];

  return items
    .filter((item) => item.article?.context != null)
    .map((item) => {
      const ctx = item.article!.context!;
      const canonical = ctx.canonicalName ?? normalizeQuery(ctx.name);
      const levScore = levenshteinNormalized(primaryIntent, canonical);
      const quality = qualityScore(ctx.avgRating, ctx.reviewCount);
      const dist = distanceInMeters(ctx.latitude, ctx.longitude, params.lat, params.lng);
      const proximity = distanceDecay(dist);
      const score = 0.58 * levScore + 0.24 * quality + 0.18 * proximity;

      return {
        type: "place" as const,
        id: String(ctx.id),
        title: String(ctx.name),
        subtitle: `${ctx.category ?? "Place"} • ${ctx.avgRating.toFixed(1)}★`,
        score: Number(score.toFixed(4)),
        lat: ctx.latitude,
        lng: ctx.longitude,
        rating: ctx.avgRating,
        createdAt: null,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, params.limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * /api/search/suggest
 * Returns ranked place suggestions for the autocomplete dropdown.
 */
export async function searchSuggest(
  params: SearchParams,
  prisma: PrismaClient
): Promise<SearchResultItem[]> {
  if (params.world === "private") {
    return searchPrivateContexts(params, prisma);
  }

  // [1] Normalize
  const normalized = normalizeQuery(params.q);

  // [2] Detect language
  const lang = detectLanguage(params.q);

  // [3] Parse query
  const parsed = parseQuery(normalized);

  // [4] Expand intent
  const intentTerms = expandIntent(parsed.intent || normalized, lang);

  // [5] Layer 1: Recall (trigram, top 8× the requested limit)
  const candidateLimit = params.limit * 8;
  const rows = await recallContexts(intentTerms, candidateLimit, params.minRating, prisma);

  // [6] Layer 2: Filter
  const filtered = filterContextRows(rows, parsed, params);

  // [7] Layer 3: Rank & slice
  return scoreAndRankContexts(filtered, intentTerms[0], params);
}

/**
 * /api/search
 * Returns paginated ranked results for both places and articles.
 */
export async function searchFull(
  params: SearchFullParams,
  prisma: PrismaClient
): Promise<{ items: SearchResultItem[]; total: number }> {
  const typeSet = new Set(
    params.types
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
  );

  const recentDate = params.recentDays
    ? new Date(Date.now() - params.recentDays * 86_400_000)
    : null;

  if (params.world === "private") {
    const items = await searchPrivateContexts(params, prisma);
    return { items, total: items.length };
  }

  // [1] Normalize
  const normalized = normalizeQuery(params.q);

  // [2] Detect language
  const lang = detectLanguage(params.q);

  // [3] Parse query
  const parsed = parseQuery(normalized);

  // [4] Expand intent
  const intentTerms = expandIntent(parsed.intent || normalized, lang);

  const results: SearchResultItem[] = [];
  const candidateLimit = params.limit * 8;

  // Places
  if (typeSet.has("place")) {
    const rows = await recallContexts(
      intentTerms,
      candidateLimit,
      params.minRating,
      prisma
    );
    const filtered = filterContextRows(rows, parsed, params);
    const ranked = scoreAndRankContexts(filtered, intentTerms[0], {
      lat: params.lat,
      lng: params.lng,
      limit: candidateLimit,
    });
    results.push(...ranked);
  }

  // Articles
  if (typeSet.has("article")) {
    const rows = await recallArticles(intentTerms, candidateLimit, recentDate, prisma);
    const ranked = scoreAndRankArticles(rows, intentTerms[0], candidateLimit);
    results.push(...ranked);
  }

  results.sort((a, b) => b.score - a.score);
  const total = results.length;
  const start = (params.page - 1) * params.limit;
  const items = results.slice(start, start + params.limit);

  return { items, total };
}
