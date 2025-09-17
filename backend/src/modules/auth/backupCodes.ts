import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export async function generateBackupCodes(userId: string) {
  const codes = Array.from({ length: 10 }, () =>
    randomBytes(4).toString("hex")
  );
  await prisma.user.update({
    where: { id: userId },
    data: { backupCodes: codes },
  });
  return codes;
}

export async function useBackupCode(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.backupCodes?.includes(code))
    throw new Error("Invalid code");
  const newCodes = user.backupCodes.filter((c: string) => c !== code);
  await prisma.user.update({
    where: { id: userId },
    data: { backupCodes: newCodes },
  });
}
