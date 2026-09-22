import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Query over plain HTTPS via Neon's serverless driver instead of Prisma's
// native query-engine binary. There is no compiled binary for Vercel's
// runtime to fail to find — this permanently avoids the
// "Query Engine for runtime rhel-openssl-3.0.x" class of deploy failure.
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeonHTTP(connectionString, {});
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
