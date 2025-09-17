import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function storeRefreshToken(
  jti: string,
  userId: string,
  iat: number,
  exp: number
) {
  await prisma.refreshToken.create({ data: { jti, userId, iat, exp } });
}

export async function revokeRefreshToken(jti: string) {
  await prisma.refreshToken.delete({ where: { jti } });
}

export async function isRefreshTokenRevoked(jti: string) {
  const token = await prisma.refreshToken.findUnique({ where: { jti } });
  return !token;
}
