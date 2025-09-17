import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function upvoteComment(commentId: string, userId: string) {
  // Chống double vote bằng unique constraint (commentId, userId)
  await prisma.commentVote.upsert({
    where: { commentId_userId: { commentId, userId } },
    update: { type: "upvote" },
    create: { commentId, userId, type: "upvote" },
  });
}

export async function downvoteComment(commentId: string, userId: string) {
  await prisma.commentVote.upsert({
    where: { commentId_userId: { commentId, userId } },
    update: { type: "downvote" },
    create: { commentId, userId, type: "downvote" },
  });
}
