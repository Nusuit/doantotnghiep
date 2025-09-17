import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveArticleVersion(articleId: string, content: string) {
  await prisma.articleVersion.create({
    data: { articleId, content, createdAt: new Date() },
  });
}

export async function getArticleVersions(articleId: string) {
  return prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
  });
}
