import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function getPrisma() {
  if (!global.__prisma) {
    const url = process.env.DATABASE_URL ?? "";
    const separator = url.includes("?") ? "&" : "?";
    global.__prisma = new PrismaClient({
      datasources: {
        db: {
          url: `${url}${separator}connection_limit=20&statement_cache_size=250`,
        },
      },
    });
  }
  return global.__prisma;
}
