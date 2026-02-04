import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = "Admin123!";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      isEmailVerified: true,
      profile: {
        create: {
          displayName: "Admin",
        },
      },
    },
    select: { id: true, email: true },
  });

  // Seed Clone Accounts (Realistic Vietnamese Users)
  const cloneUsers = [
    { name: "Ngân Ngu Ngơ", email: "ngan.ngungo@example.com", avatar: "https://i.pravatar.cc/150?u=1", score: 15000, knowU: 500, knowG: 120.5 },
    { name: "Huyền Nguyễn", email: "huyen.nguyen@example.com", avatar: "https://i.pravatar.cc/150?u=2", score: 12400, knowU: 450, knowG: 80.0 },
    { name: "Hân Phan", email: "han.phan@example.com", avatar: "https://i.pravatar.cc/150?u=3", score: 11200, knowU: 300, knowG: 65.5 },
    { name: "Luis Mel", email: "luis.mel@example.com", avatar: "https://i.pravatar.cc/150?u=4", score: 9800, knowU: 250, knowG: 45.0 },
    { name: "YasuA", email: "yasua@example.com", avatar: "https://i.pravatar.cc/150?u=5", score: 8500, knowU: 200, knowG: 30.0 },
    { name: "Bé Bựa", email: "be.bua@example.com", avatar: "https://i.pravatar.cc/150?u=6", score: 7200, knowU: 180, knowG: 25.5 },
    { name: "Anh Thư", email: "anh.thu@example.com", avatar: "https://i.pravatar.cc/150?u=7", score: 6500, knowU: 150, knowG: 20.0 },
    { name: "Thu Phạm", email: "thu.pham@example.com", avatar: "https://i.pravatar.cc/150?u=8", score: 5400, knowU: 100, knowG: 15.0 },
    { name: "Hoàng Giáp", email: "hoang.giap@example.com", avatar: "https://i.pravatar.cc/150?u=9", score: 4300, knowU: 80, knowG: 10.0 },
    { name: "Hội Nguyễn", email: "hoi.nguyen@example.com", avatar: "https://i.pravatar.cc/150?u=10", score: 3200, knowU: 50, knowG: 5.0 },
    { name: "Tâm Phan", email: "tam.phan@example.com", avatar: "https://i.pravatar.cc/150?u=11", score: 2100, knowU: 30, knowG: 2.0 },
  ];

  for (const u of cloneUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        reputationScore: u.score,
        knowUBalance: u.knowU,
        knowGBalance: u.knowG,
      },
      create: {
        email: u.email,
        passwordHash, // Uses same password "Admin123!" for easier testing
        role: "USER",
        isEmailVerified: true,
        reputationScore: u.score,
        knowUBalance: u.knowU,
        knowGBalance: u.knowG,
        profile: {
          create: {
            displayName: u.name,
            avatarUrl: u.avatar,
          },
        },
      },
    });
  }


  // Seed MVP Categories (stable slugs)
  const categories = [
    { slug: "PLACE_BASED_KNOWLEDGE", name: "Place-based Knowledge" },
    { slug: "CULTURE_HISTORY", name: "Culture & History" },
    { slug: "BOOK_FILM", name: "Book & Film" },
    { slug: "SCIENCE_KNOWLEDGE", name: "Science Knowledge" },
    { slug: "PRACTICAL_GUIDE", name: "Practical Guide" },
    { slug: "ABSTRACT_TOPIC", name: "Abstract Topic" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  // Seed a few PLACE contexts for the Map demo (restaurants are an alias)
  const restaurants = [
    {
      name: "Phở Hòa Pasteur",
      description: "Phở truyền thống",
      address: "Pasteur, Quận 1, TP.HCM",
      latitude: 10.7769,
      longitude: 106.6917,
      category: "pho",
      priceLevel: 2,
    },
    {
      name: "Bánh mì Huỳnh Hoa",
      description: "Bánh mì nổi tiếng",
      address: "Lê Thị Riêng, Quận 1, TP.HCM",
      latitude: 10.7701,
      longitude: 106.6894,
      category: "banh-mi",
      priceLevel: 2,
    },
    {
      name: "Cơm tấm Sườn Nướng",
      description: "Cơm tấm truyền thống",
      address: "Quận 3, TP.HCM",
      latitude: 10.7824,
      longitude: 106.6841,
      category: "com-tam",
      priceLevel: 1,
    },
  ];

  for (const r of restaurants) {
    const exists = await prisma.context.findFirst({
      where: {
        type: "PLACE",
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
      },
      select: { id: true },
    });

    if (!exists) {
      await prisma.context.create({
        data: {
          type: "PLACE",
          name: r.name,
          description: r.description,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
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
  .finally(() => prisma.$disconnect());
