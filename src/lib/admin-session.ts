import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "edubazar-admin-secret-2024";
const SESSION_LIFETIME = 60 * 60 * 8;

export function createAdminSession(): string {
  const expires = Math.floor(Date.now() / 1000) + SESSION_LIFETIME;
  const payload = `admin.${expires}`;
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isValidAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [role, expiresText, signature] = parts;
    if (role !== "admin" || !expiresText || !signature) return false;
    const expires = Number(expiresText);
    if (isNaN(expires) || expires < Math.floor(Date.now() / 1000)) return false;
    const payload = `${role}.${expiresText}`;
    const expected = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
