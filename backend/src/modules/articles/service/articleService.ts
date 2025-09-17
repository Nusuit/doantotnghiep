import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createArticle(data: any) {
  // Tách logic tạo bài viết ra khỏi controller
  return prisma.article.create({ data });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({ where: { id } });
}

export async function updateArticle(id: string, data: any) {
  return prisma.article.update({ where: { id }, data });
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
}

export async function getFeaturedArticles(
  skip: number,
  take: number,
  weekAgo: Date
) {
  return prisma.article.findMany({
    where: { createdAt: { gte: weekAgo } },
    orderBy: [{ upvotes: "desc" }],
    skip,
    take,
    include: { author: { select: { id: true, name: true, reputation: true } } },
  });
}
