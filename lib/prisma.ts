import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.includes("sslmode=require")
          ? process.env.DATABASE_URL
          : `${process.env.DATABASE_URL}?sslmode=require&pgbouncer=true&connect_timeout=15`,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
