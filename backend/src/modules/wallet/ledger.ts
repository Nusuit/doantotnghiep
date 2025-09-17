import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createLedgerEntry(
  userId: string,
  type: "debit" | "credit",
  amount: number,
  ref: string
) {
  await prisma.ledger.create({
    data: {
      userId,
      type,
      amount,
      ref,
      createdAt: new Date(),
    },
  });
}

export async function getBalance(userId: string) {
  const credits = await prisma.ledger.aggregate({
    where: { userId, type: "credit" },
    _sum: { amount: true },
  });
  const debits = await prisma.ledger.aggregate({
    where: { userId, type: "debit" },
    _sum: { amount: true },
  });
  return (credits._sum.amount || 0) - (debits._sum.amount || 0);
}
