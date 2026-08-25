import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis;

// Lean pool: max 1 connection per instance, immediate 1-second idle release
const pool =
    globalForPrisma.pgPoolLatest ??
    new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 3000,
        allowExitOnIdle: true,
    });

globalForPrisma.pgPoolLatest = pool;

const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prismaClient_v3 ??
    new PrismaClient({
        adapter,
    });

globalForPrisma.prismaClient_v3 = prisma;