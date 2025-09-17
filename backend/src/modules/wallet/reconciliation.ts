import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function reconcilePayment(
  ref: string,
  status: "success" | "failed"
) {
  await prisma.payment.update({
    where: { ref },
    data: { status },
  });
}

export async function retryWebhook(ref: string) {
  // Logic retry webhook theo backoff
}
