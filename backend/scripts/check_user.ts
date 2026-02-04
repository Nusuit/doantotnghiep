
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { profile: { displayName: { contains: "Huy Hoàng", mode: "insensitive" } } },
                { profile: { firstName: { contains: "Huy", mode: "insensitive" } } },
                { email: { contains: "huyhoang", mode: "insensitive" } }
            ]
        },
        include: { profile: true }
    });

    console.log("Found users:", JSON.stringify(users, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
