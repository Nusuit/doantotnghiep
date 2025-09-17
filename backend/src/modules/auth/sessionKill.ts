import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function killAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
