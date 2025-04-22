import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configure SSL and connection pooling for Neon
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
   
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.includes("sslmode=require")
          ? process.env.DATABASE_URL
          : `${process.env.DATABASE_URL}?sslmode=require&pgbouncer=true&connect_timeout=15`
      }
    }
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}