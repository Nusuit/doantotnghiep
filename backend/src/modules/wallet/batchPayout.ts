import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function processBatchPayout(
  payouts: Array<{ userId: string; amount: number }>
) {
  for (const payout of payouts) {
    await prisma.ledger.create({
      data: {
        userId: payout.userId,
        type: "debit",
        amount: payout.amount,
        ref: "batch_payout",
        createdAt: new Date(),
      },
    });
    // Audit log, notification, v.v. có thể bổ sung tại đây
  }
}
