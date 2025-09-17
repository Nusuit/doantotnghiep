import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Seed users, articles, places, etc.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
