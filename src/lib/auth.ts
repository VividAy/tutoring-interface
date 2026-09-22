import { createHmac, timingSafeEqual } from "node:crypto";

// Lightweight cookie-based access gate — not a full auth system. Each
// tutor's password defaults to their first name + "123" (see
// src/lib/password.ts and prisma/seed.ts); the admin area uses the single
// password below. Replace these before this ever leaves a trusted
// local/internal network.
const AUTH_SECRET =
  process.env.AUTH_SECRET || "lvaep-tutor-portal-dev-secret-v2-change-me";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export const ADMIN_COOKIE = "lvaep_admin";

export function tutorCookieName(tutorId: string): string {
  return `lvaep_tutor_${tutorId}`;
}

function sign(scope: string): string {
  return createHmac("sha256", AUTH_SECRET).update(scope).digest("hex");
}

export function makeToken(scope: string): string {
  return sign(scope);
}

export function verifyToken(scope: string, token: string | undefined): boolean {
  if (!token) return false;
  const expected = sign(scope);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// No `maxAge`: this is a browser session cookie, so closing the browser
// (not just the tab) clears it and the next visit starts logged out.
export const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};
