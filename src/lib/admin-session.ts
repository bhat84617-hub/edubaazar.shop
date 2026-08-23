import { createHmac, timingSafeEqual } from "node:crypto";

const sessionLifetimeSeconds = 60 * 60 * 8;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = `admin.${expires}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isValidAdminSession(token: string | undefined) {
  if (!token || !secret()) return false;
  const [role, expiresText, signature] = token.split(".");
  const payload = `${role}.${expiresText}`;
  if (role !== "admin" || !expiresText || !signature || Number(expiresText) < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
