import { sendMail } from "../../utils/email";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function requestEmailVerification(userId: string, email: string) {
  const token = uuidv4();
  await prisma.emailVerification.create({
    data: {
      userId,
      email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendMail(
    email,
    "Verify your email",
    `<a href="${link}">Verify Email</a>`
  );
}

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerification.findUnique({
    where: { token },
  });
  if (!record || record.expiresAt < new Date())
    throw new Error("Invalid or expired token");
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });
  await prisma.emailVerification.delete({ where: { token } });
}
