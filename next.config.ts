import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We generate the Prisma client to a custom location (src/generated/prisma
  // instead of the default node_modules/.prisma/client). Next.js's automatic
  // serverless bundling ("output file tracing") only special-cases the
  // default location, so on Vercel the query engine binary gets silently
  // left out of the deployed function unless we include it explicitly here.
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
