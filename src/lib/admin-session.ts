import { createHmac, timingSafeEqual } from "node:crypto";

const sessionLifetimeSeconds = 60 * 60 * 8;

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "Admin@123";
}

export function createAdminSession(): string {
  const expires = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = `admin.${expires}`;
  const signature = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isValidAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [role, expiresText, signature] = parts;
    if (role !== "admin" || !expiresText || !signature) return false;

    const expires = Number(expiresText);
    if (isNaN(expires) || expires < Math.floor(Date.now() / 1000)) return false;

    const payload = `${role}.${expiresText}`;
    const expected = createHmac("sha256", secret).update(payload).digest("base64url");

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actualBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
