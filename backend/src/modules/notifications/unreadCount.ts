import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markReadUpTo(userId: string, pointer: string) {
  await prisma.notification.updateMany({
    where: { userId, id: { lte: pointer } },
    data: { read: true },
  });
}
