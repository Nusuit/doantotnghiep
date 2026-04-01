import { PrismaClient, TaxonomyType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(params: {
  email: string;
  passwordHash: string;
  role?: "ADMIN" | "USER" | "MODERATOR";
  displayName: string;
  avatarUrl?: string;
  reputationScore?: number;
  knowUBalance?: number;
  knowGBalance?: number;
  isEmailVerified?: boolean;
  accountStatus?: "ACTIVE" | "PENDING_VERIFY" | "SUSPENDED" | "BANNED";
}) {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
    select: { id: true },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        role: params.role ?? "USER",
        reputationScore: params.reputationScore ?? 0,
        knowUBalance: params.knowUBalance ?? 0,
        knowGBalance: params.knowGBalance ?? 0,
        accountStatus: params.accountStatus ?? "ACTIVE",
        security: {
          upsert: {
            create: {
              passwordHash: params.passwordHash,
              isEmailVerified: params.isEmailVerified ?? true,
            },
            update: {
              passwordHash: params.passwordHash,
              isEmailVerified: params.isEmailVerified ?? true,
            },
          },
        },
        profile: {
          upsert: {
            create: {
              displayName: params.displayName,
              avatarUrl: params.avatarUrl ?? null,
            },
            update: {
              displayName: params.displayName,
              avatarUrl: params.avatarUrl ?? null,
            },
          },
        },
      },
      select: { id: true, email: true },
    });
  }

  return prisma.user.create({
    data: {
      email: params.email,
      role: params.role ?? "USER",
      accountStatus: params.accountStatus ?? "ACTIVE",
      reputationScore: params.reputationScore ?? 0,
      knowUBalance: params.knowUBalance ?? 0,
      knowGBalance: params.knowGBalance ?? 0,
      security: {
        create: {
          passwordHash: params.passwordHash,
          isEmailVerified: params.isEmailVerified ?? true,
        },
      },
      profile: {
        create: {
          displayName: params.displayName,
          avatarUrl: params.avatarUrl ?? null,
        },
      },
    },
    select: { id: true, email: true },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const user = await upsertUser({
    email: "admin@example.com",
    passwordHash,
    role: "ADMIN",
    displayName: "Admin",
    isEmailVerified: true,
    accountStatus: "ACTIVE",
  });

  const cloneUsers = [
    { name: "Ngan Ngu Ngo", email: "ngan.ngungo@example.com", avatar: "https://i.pravatar.cc/150?u=1", score: 15000, knowU: 500, knowG: 120.5 },
    { name: "Huyen Nguyen", email: "huyen.nguyen@example.com", avatar: "https://i.pravatar.cc/150?u=2", score: 12400, knowU: 450, knowG: 80.0 },
    { name: "Han Phan", email: "han.phan@example.com", avatar: "https://i.pravatar.cc/150?u=3", score: 11200, knowU: 300, knowG: 65.5 },
    { name: "Luis Mel", email: "luis.mel@example.com", avatar: "https://i.pravatar.cc/150?u=4", score: 9800, knowU: 250, knowG: 45.0 },
    { name: "YasuA", email: "yasua@example.com", avatar: "https://i.pravatar.cc/150?u=5", score: 8500, knowU: 200, knowG: 30.0 },
    { name: "Be Bua", email: "be.bua@example.com", avatar: "https://i.pravatar.cc/150?u=6", score: 7200, knowU: 180, knowG: 25.5 },
    { name: "Anh Thu", email: "anh.thu@example.com", avatar: "https://i.pravatar.cc/150?u=7", score: 6500, knowU: 150, knowG: 20.0 },
    { name: "Thu Pham", email: "thu.pham@example.com", avatar: "https://i.pravatar.cc/150?u=8", score: 5400, knowU: 100, knowG: 15.0 },
    { name: "Hoang Giap", email: "hoang.giap@example.com", avatar: "https://i.pravatar.cc/150?u=9", score: 4300, knowU: 80, knowG: 10.0 },
    { name: "Hoi Nguyen", email: "hoi.nguyen@example.com", avatar: "https://i.pravatar.cc/150?u=10", score: 3200, knowU: 50, knowG: 5.0 },
    { name: "Tam Phan", email: "tam.phan@example.com", avatar: "https://i.pravatar.cc/150?u=11", score: 2100, knowU: 30, knowG: 2.0 },
  ];

  for (const u of cloneUsers) {
    await upsertUser({
      email: u.email,
      passwordHash,
      role: "USER",
      displayName: u.name,
      avatarUrl: u.avatar,
      reputationScore: u.score,
      knowUBalance: u.knowU,
      knowGBalance: u.knowG,
      isEmailVerified: true,
      accountStatus: "ACTIVE",
    });
  }

  const categories = [
    { slug: "PLACE_BASED_KNOWLEDGE", name: "Place-based Knowledge" },
    { slug: "CULTURE_HISTORY", name: "Culture & History" },
    { slug: "BOOK_FILM", name: "Book & Film" },
    { slug: "SCIENCE_KNOWLEDGE", name: "Science Knowledge" },
    { slug: "PRACTICAL_GUIDE", name: "Practical Guide" },
    { slug: "ABSTRACT_TOPIC", name: "Abstract Topic" },
  ];

  for (const category of categories) {
    await prisma.taxonomy.upsert({
      where: { slug: category.slug },
      update: { name: category.name, type: TaxonomyType.CATEGORY },
      create: { slug: category.slug, name: category.name, type: TaxonomyType.CATEGORY },
    });
  }

  const places = [
    {
      name: "Pho Hoa Pasteur",
      description: "Pho truyen thong",
      address: "Pasteur, Quan 1, TP.HCM",
      latitude: 10.7769,
      longitude: 106.6917,
      category: "pho",
      source: "seed",
      sourceRef: "seed:pho-hoa-pasteur",
    },
    {
      name: "Banh mi Huynh Hoa",
      description: "Banh mi noi tieng",
      address: "Le Thi Rieng, Quan 1, TP.HCM",
      latitude: 10.7701,
      longitude: 106.6894,
      category: "banh-mi",
      source: "seed",
      sourceRef: "seed:banh-mi-huynh-hoa",
    },
    {
      name: "Com tam Suon Nuong",
      description: "Com tam truyen thong",
      address: "Quan 3, TP.HCM",
      latitude: 10.7824,
      longitude: 106.6841,
      category: "com-tam",
      source: "seed",
      sourceRef: "seed:com-tam-suon-nuong",
    },
  ];

  for (const place of places) {
    const exists = await prisma.context.findFirst({
      where: {
        latitude: place.latitude,
        longitude: place.longitude,
      },
      select: { id: true },
    });

    if (!exists) {
      await prisma.context.create({
        data: {
          type: "PLACE",
          name: place.name,
          description: place.description,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          category: place.category,
          source: place.source,
          sourceRef: place.sourceRef,
        },
      });
    }
  }

  console.log("Seeded:", { user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
