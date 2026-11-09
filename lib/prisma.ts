import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: connectionUrl
      ? { db: { url: connectionUrl } }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
