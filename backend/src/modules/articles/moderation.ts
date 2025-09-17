import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function reportArticle(
  articleId: string,
  userId: string,
  reason: string
) {
  await prisma.articleReport.create({
    data: { articleId, userId, reason, createdAt: new Date() },
  });
}

export async function blockArticle(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { blocked: true },
  });
}

export async function muteUser(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { muted: true } });
}
