import { PrismaClient } from "@prisma/client";
import { generateTOTPSecret, verifyTOTP } from "../../utils/totp";

const prisma = new PrismaClient();

export async function setupTOTP(userId: string) {
  const secret = generateTOTPSecret();
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: secret.base32 },
  });
  return secret.otpauth_url;
}

export async function verifyUserTOTP(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.totpSecret) throw new Error("TOTP not setup");
  return verifyTOTP(token, user.totpSecret);
}
