import { sendMail } from "../../utils/email";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const token = uuidv4();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendMail(
    email,
    "Reset your password",
    `<a href="${link}">Reset Password</a>`
  );
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date())
    throw new Error("Invalid or expired token");
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hash },
  });
  await prisma.passwordReset.delete({ where: { token } });
}
