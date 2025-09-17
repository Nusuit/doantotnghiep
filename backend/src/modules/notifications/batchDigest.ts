import { PrismaClient } from "@prisma/client";
import { sendMail } from "../../utils/email";

const prisma = new PrismaClient();

export async function sendBatchDigest(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId, read: false },
  });
  if (notifications.length === 0) return;
  const email = await prisma.user
    .findUnique({ where: { id: userId } })
    .then((u) => u?.email);
  if (!email) return;
  const html = notifications.map((n) => `<li>${n.message}</li>`).join("");
  await sendMail(email, "Your notifications digest", `<ul>${html}</ul>`);
}
