import type { NextRequest } from "next/server";

// ── Shared server-side guards: rate limiting + same-origin (CSRF) checks ─────
// Rate limiting is in-memory per instance by default. If the owner adds Upstash
// Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) and installs
// @upstash/ratelimit + @upstash/redis, limits are enforced globally instead.
// Without Upstash it gracefully falls back to the in-memory limiter.

type Entry = { count: number; reset: number };
const mem = new Map<string, Entry>();

let upstashChecked = false;
let upstashAvailable = false;

async function tryUpstash(limit: number, windowMs: number, key: string): Promise<boolean | null> {
  // Returns null when Upstash is not configured/available → caller falls back.
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  try {
    if (!upstashChecked) {
      upstashChecked = true;
      const modName = "@upstash/ratelimit";
      const mod = (await import(/* webpackIgnore: true */ modName as string)) as {
        Ratelimit?: new (o: unknown) => { limit: (k: string) => Promise<{ success: boolean }> };
      };
      upstashAvailable = Boolean(mod?.Ratelimit);
      if (!upstashAvailable) return null;
    } else if (!upstashAvailable) {
      return null;
    }
    const { Ratelimit } = (await import(/* webpackIgnore: true */ "@upstash/ratelimit" as string)) as {
      Ratelimit: new (o: unknown) => { limit: (k: string) => Promise<{ success: boolean }> };
    };
    const { Redis } = (await import(/* webpackIgnore: true */ "@upstash/redis" as string)) as {
      Redis: { fromEnv: () => unknown };
    };
    const rl = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: (Ratelimit as unknown as { slidingWindow: (n: number, w: string) => unknown }).slidingWindow(
        limit,
        `${Math.max(1, Math.round(windowMs / 1000))} s`
      ),
      prefix: "edubazar",
    });
    const res = await rl.limit(key);
    return !res.success;
  } catch {
    return null;
  }
}

function memLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const e = mem.get(key);
  if (!e || now > e.reset) {
    // Opportunistic cleanup so the map can't grow forever
    if (mem.size > 5000) {
      for (const [k, v] of mem) {
        if (v.reset < now) mem.delete(k);
        if (mem.size <= 4000) break;
      }
    }
    mem.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  e.count++;
  return e.count > limit;
}

/** True when the caller exceeded `limit` requests per `windowMs`. Async (Upstash). */
export async function isRateLimited(key: string, limit: number, windowMs = 60_000): Promise<boolean> {
  const remote = await tryUpstash(limit, windowMs, key);
  if (remote !== null) return remote;
  return memLimited(key, limit, windowMs);
}

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return (req.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

function siteHosts(): string[] {
  const hosts = ["www.edubaazar.shop", "edubaazar.shop"];
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) {
    try {
      hosts.push(new URL(env).hostname);
    } catch {
      /* ignore bad env */
    }
  }
  return hosts;
}

/**
 * CSRF defense-in-depth for state-changing routes. Browsers always send
 * Origin (or Referer) on cross-site requests; same-origin fetch/form posts
 * carry our own host. Non-browser clients (curl/SSR) send neither → allowed.
 */
export function isSameOriginRequest(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (!origin && !referer) return true;
  const hosts = new Set(siteHosts());
  // The request's own host is always same-origin (covers preview deployments)
  const reqHost = req.headers.get("host")?.split(":")[0];
  if (reqHost) hosts.add(reqHost);
  try {
    if (origin && hosts.has(new URL(origin).hostname)) return true;
  } catch {
    return false;
  }
  try {
    if (referer && hosts.has(new URL(referer).hostname)) return true;
  } catch {
    return false;
  }
  return false;
}
