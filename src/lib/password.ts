import { createHash, timingSafeEqual, scryptSync, randomBytes } from "node:crypto";

// ---- Password hashing (shared by /api/auth/login, /api/auth/register, /api/admin/login) ----
// Current format: scrypt:<32-hex-salt>:<128-hex-hash>
// Legacy formats (auto-upgraded on next successful login):
//   - <32-hex-salt>:<64-hex-sha256>
//   - plaintext (oldest)
// OAuth-only accounts: oauth:unusable:<hex> (can never verify — Google login only)

function hashLegacy(password: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function hashScrypt(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

/** Hash a new password with scrypt (CPU+memory hard). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${hashScrypt(password, salt)}`;
}

/** Placeholder hash for OAuth-only accounts — verifyPassword always rejects it. */
export function unusablePassword(): string {
  return `oauth:unusable:${randomBytes(24).toString("hex")}`;
}

export function verifyPassword(stored: string, password: string): boolean {
  if (!stored || !password) return false;
  // OAuth-only accounts can never log in with a password
  if (stored.startsWith("oauth:")) return false;
  // Current format: scrypt:<salt-hex>:<hash-hex>
  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3 || !/^[0-9a-f]{32}$/i.test(parts[1]) || !/^[0-9a-f]{128}$/i.test(parts[2])) return false;
    const actual = hashScrypt(password, parts[1]);
    const a = Buffer.from(parts[2], "hex");
    const b = Buffer.from(actual, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  // Legacy format: <salt-hex>:<sha256-hex>
  const sep = stored.indexOf(":");
  if (sep > 0 && /^[0-9a-f]{32}$/i.test(stored.slice(0, sep)) && /^[0-9a-f]{64}$/i.test(stored.slice(sep + 1))) {
    const salt = stored.slice(0, sep);
    const expected = stored.slice(sep + 1);
    const actual = hashLegacy(password, salt);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(actual, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  }
  // Oldest legacy: plaintext (migrated on next successful login)
  const a = Buffer.from(stored, "utf8");
  const b = Buffer.from(password, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function needsUpgrade(stored: string): boolean {
  return !stored.startsWith("scrypt:");
}
