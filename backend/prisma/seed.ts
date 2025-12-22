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

  // Seed a few restaurants for the Map demo
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
    const exists = await prisma.restaurant.findFirst({
      where: { userId: user.id, name: r.name },
      select: { id: true },
    });

    if (!exists) {
      await prisma.restaurant.create({
        data: {
          userId: user.id,
          ...r,
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
