# Security Audit — edubaazar.shop (26 Sep 2026)

Tools used (ek-ek karke): `npx tsc`, `npm run lint` (eslint), `npm run check:assets`,
`npm run build`, manual grep (secrets/XSS/eval/innerHTML), `next.config.ts` headers review,
`.env`/`.gitignore` hygiene check, Supabase RLS SQL review, API route-by-route review,
Telegram/email flow review, `legacy/` dead-code review.

Verify status: **tsc clean, eslint clean, assets clean, build pass** (after fixes).

## FIXED (code me fix + verify ho gaya)

| # | Severity | Bug | File | Fix |
|---|----------|-----|------|-----|
| 1 | High | JSON-LD XSS via `?cat=` — `</script>` breakout | `src/app/shop/page.tsx` | `cat` sanitized (`<>&"'` strip, 100 char cap) + JSON-LD escaped (`\u003c\u003e\u0026`) |
| 2 | Medium | No Content-Security-Policy | `next.config.ts` | CSP header added (self + unsafe-inline/eval for Next, supabase/resend connect) |
| 3 | High | `GET /api/orders?email=` — no rate limit, limit 50, cacheable | `src/app/api/orders/route.ts` | 20 req/min/IP limit, limit 50→20, `Cache-Control: no-store` everywhere |
| 4 | High | Public email oracle — `signup`/`order` spam, no cooldown, weak orderId check | `src/app/api/send-email/route.ts` | Per-email + per-order 10-min cooldown, `EDU-` format check, CRLF strip, order-status field validation |
| 5 | High | Weak passwords — SHA-256 single round, min 4 chars, predictable rehash salt | `src/app/api/auth/login` + `register/route.ts` | scrypt(64B) for new hashes, backward-compat verify (scrypt→SHA256→plaintext) + auto-upgrade, min 8 chars, `randomBytes` salt |
| 6 | Low | `GET /api/telegram/channel` leaked channel ID without auth | `src/app/api/telegram/channel/route.ts` | Admin session required for GET |
| 7 | Medium | `PATCH orders/status` stored `javascript:/data:` URLs | `src/app/api/admin/orders/status/route.ts` | `safeHttpUrl` (http/https only) + generic error messages (no `error.message` leak) |
| 8 | Medium | approve/reject HTML escape missing `'"` | `approve/route.ts`, `reject/route.ts` | Full `escHtml` (`&<>"'`) + 64-char cap |
| 9 | Medium | UTR + full phone in plaintext `localStorage` | `src/lib/store.tsx` | Persist stripped copy (`phone:"", utr:""`); full data in-memory + server only |
| 10 | Medium | Admin login `!==` compare, hardcoded email only | `src/app/api/admin/login/route.ts` | Constant-time `safeEqual`, `ADMIN_EMAIL` env override, password length cap |
| 11 | Critical/High | `legacy/` — hardcoded `admin123`, plaintext auth, stored-XSS `innerHTML`, Aadhaar image in git | `legacy/archive/*`, `legacy/addhar update slip.png` | 5 dangerous HTML files + Aadhaar image deleted from git (`.vercelignore` already excluded `legacy/` from deploy) |

## OPEN — tumhe manually karna hai (code se fix nahi ho sakta)

| # | Severity | Bug | Kya karna hai |
|---|----------|-----|---------------|
| 12 | High | Supabase RLS `WITH CHECK(true)` — koi bhi anon **kuch bhi** insert kar sakta hai (fake total/status/UTR) | `supabase-fix-rls-strict.sql` Supabase SQL Editor me run karo; server-side order API banao (client-computed `total`/`status` kabhi trust mat karo) |
| 13 | High | UTR verification fully manual — same/fake UTR reuse possible, web (10–14 digits) vs bot (8–18 alnum) mismatch | UTR uniqueness check + server-side format check + Razorpay/UPI auto-verify lagao |
| 14 | Medium | Rate limits in-memory per-instance — `x-forwarded-for` spoof + Vercel multi-instance bypass | Redis/Upstash rate limiting lagao (auth, orders, send-email, webhook sab pe) |
| 15 | Medium | Admin CSRF — koi anti-CSRF token nahi, `GET` state-change (logout, telegram/setup, approve-link) | POST-only mutations + Origin check + CSRF token; `telegram/setup` ka `GET` hatao |
| 16 | Medium | Telegram webhook no-throttle — DB/order spam + email bomb | Webhook pe rate limit + `TELEGRAM_WEBHOOK_SECRET` rotate karo |
| 17 | Medium | `send-notification` pending-check bypass — koi bhi order re-approve/reject | `status` route jaisa `pending`-only guard lagao (resend flow test karke) |
| 18 | Low | 9 products me `downloadUrl` missing (p1,p2,p3,t2,t3,b2,b3,d1,d2) | Asli Drive links `products.ts` me bharo — dekho `MISSING_LINKS_REPORT.md` |
| 19 | Low | Register `409` user-enumeration, no email verify/CAPTCHA | Generic response + email OTP + Turnstile CAPTCHA lagao |
| 20 | Info | `ADMIN_SESSION_SECRET` hi poori admin security hai — rotation/revoke nahi | Strong 32+ char secret, Vercel env me set, leak ho to turant rotate |

## Ruled out (check kiya, saaf hai)

- SQL injection: nahi — sab Supabase bound queries (`eq/select/insert/update`)
- SSRF: nahi — koi route user-URL fetch nahi karta
- Committed live secrets: nahi — `.env.local` exists nahi, git me sirf `.env.example` (placeholders)
- `eval`/`document.write`/`innerHTML=` in live `src/`: nahi (sirf `legacy/` me tha — hataya)
- Build: `npm run build` pass, `tsc` clean, `eslint` clean, `check:assets` clean (12 refs)
