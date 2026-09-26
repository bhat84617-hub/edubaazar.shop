# Security Audit — edubaazar.shop (26 Sep 2026, round 2)

Tools used (ek-ek karke): `npx tsc`, `npm run lint` (eslint), `npm run check:assets`,
`npm run build`, manual grep (secrets/XSS/eval/innerHTML), `next.config.ts` headers review,
`.env`/`.gitignore` hygiene check, Supabase RLS SQL review, API route-by-route review,
Telegram/email flow review, `legacy/` dead-code review, client-side DB-write grep.

Verify status: **tsc clean, eslint clean, assets clean, build pass** (after fixes).

## FIXED round 1 (pehle push ho chuka)

| # | Severity | Bug | File | Fix |
|---|----------|-----|------|-----|
| 1 | High | JSON-LD XSS via `?cat=` — `</script>` breakout | `src/app/shop/page.tsx` | `cat` sanitized + JSON-LD escaped |
| 2 | Medium | No Content-Security-Policy | `next.config.ts` | CSP header added |
| 3 | High | `GET /api/orders?email=` — no rate limit, limit 50, cacheable | `src/app/api/orders/route.ts` | 20 req/min/IP, limit 20, `no-store` |
| 4 | High | Public email oracle — `signup`/`order` spam | `src/app/api/send-email/route.ts` | Per-email/order 10-min cooldown, `EDU-` check, CRLF strip |
| 5 | High | Weak passwords — SHA-256, min 4 chars | `auth/login` + `register` | scrypt, min 8 chars, auto-upgrade |
| 6 | Low | `GET /api/telegram/channel` leaked channel ID | `telegram/channel/route.ts` | Admin-only GET |
| 7 | Medium | `PATCH orders/status` stored `javascript:` URLs | `admin/orders/status/route.ts` | http/https-only + generic errors |
| 8 | Medium | approve/reject HTML escape gaps | `approve/reject/route.ts` | Full `&<>"'` escape |
| 9 | Medium | UTR + phone in plaintext `localStorage` | `src/lib/store.tsx` | Persist stripped copy |
| 10 | Medium | Admin login `!==` compare, hardcoded email | `admin/login/route.ts` | Constant-time compare, env override |
| 11 | Critical | `legacy/` hardcoded `admin123`, plaintext auth, XSS, Aadhaar image | `legacy/*` | 6 files git se deleted |

## FIXED round 2 (is push me)

| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 12 | High | Client-computed `total`/`status` + fake UTR insert (RLS `WITH CHECK(true)`) | **Naya `POST /api/orders`**: total/status/server-catalog se compute, UTR format enforce (paid pe 10–14 digits), **duplicate UTR 409 reject** (bot wale `utr\|tg:` match samet). `placeOrder` ab isi API ko call karta hai — browser se direct DB write **khatm** |
| 13 | High | UTR reuse + web/bot format mismatch | Upar wale API me fix (duplicate check + format). Note: purane duplicate UTRs DB me ho sakte hain — naya rule sirf naye orders pe lagega |
| 14 | Medium | Rate limits bikhre hue, har file me alag copy | **Naya `src/lib/security.ts`**: shared `isRateLimited` + `getClientIp` + `isSameOriginRequest`. Sab routes (auth x2, orders, send-email, admin login, webhook) isi pe. **Upstash Redis optional**: `UPSTASH_REDIS_REST_URL/TOKEN` + packages lagate hi global limiting, bina uske in-memory fallback |
| 15 | Medium | Admin CSRF — token nahi, `GET` state-change | `POST/PATCH` mutations (approve, reject, status, send-notification, channel, setup, send-email) pe **Origin/Referer check**. `telegram/setup` ka `GET` **405** (curl POST instructions samet). Logout `GET` rakha (sirf logout hota hai, low risk) |
| 16 | Medium | Telegram webhook no-throttle | Global 120/min + per-chat 30/min throttle |
| 17 | Medium | `send-notification` pending-check bypass + subject CRLF | `pending`-only guard (`.eq("status","pending")`), same-state pe **resend-only** (row rewrite nahi), `orderId` CRLF strip |
| 19 | Low | Register `409` enumeration | Ab **200 + `alreadyRegistered`** — frontend login pe bhejta hai, status-code oracle khatm. Password `minLength` 4→8 |
| 12b | High | Strict RLS SQL purana tha (anon INSERT allow) | `supabase-fix-rls-strict.sql` rewrite: **anon ka users+orders pe ZERO access** (sirf `service_role`). Pehle code deploy karo, **phir** ye SQL Supabase me run karo (rollback: `supabase-fix-rls.sql`) |

## OPEN — sirf tum kar sakte ho (paise/access chahiye)

| # | Severity | Kya karna hai |
|---|----------|---------------|
| 18 | Low | **9 products me download link missing** (p1,p2,p3,t2,t3,b2,b3,d1,d2) — asli Drive/MediaFire links bhejo, mai `products.ts` me bhar dunga |
| 20a | Medium | **CAPTCHA** (register + checkout): Cloudflare Turnstile keys (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + secret) banao aur bhejo |
| 20b | Medium | **Upstash Redis**: free account banao, `UPSTASH_REDIS_REST_URL/TOKEN` Vercel env me dalo + `npm i @upstash/ratelimit @upstash/redis` (code ready hai) |
| 20c | Info | `ADMIN_SESSION_SECRET` 32+ chars, Vercel env me set; leak lage to rotate |
| 20d | Info | Strict SQL Supabase dashboard me run karna (code deploy ke BAAD) + checkout test order karke verify |

## Ruled out (check kiya, saaf hai)

- SQL injection: nahi — sab bound queries
- SSRF: nahi — koi user-URL fetch nahi
- Committed live secrets: nahi — git me sirf `.env.example`
- `eval`/`document.write`/`innerHTML=` in live `src/`: nahi
- Client-side DB writes: **ab zero** (sirf server routes `service_role` se)
- Build: `npm run build` pass, `tsc` clean, `eslint` clean

