import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addTagToArticle(articleId: string, tag: string) {
  await prisma.articleTag.create({ data: { articleId, tag } });
}

export async function getArticleTags(articleId: string) {
  return prisma.articleTag.findMany({ where: { articleId } });
}
