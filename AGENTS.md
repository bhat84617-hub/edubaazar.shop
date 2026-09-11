<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# EduBazar.shop — Agent Guide

Next.js 16 App Router e-commerce for online courses (Hacking, Programming, Trading, Books, Tools, Design, Marketing).

## Project structure
- `src/app/`: routes — `page.tsx` (home), `shop/page.tsx`, `product/[slug]/page.tsx`, `cart/`, `checkout/`, `account/`, `admin/`, `api/`
- `src/app/robots.ts`: robots rules (allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
- `src/app/sitemap.ts`: sitemap generator
- `src/components/`: `Header.tsx`, `Footer.tsx`, `ProductCard.tsx`, `ProductBuy.tsx`, `ProductTabs.tsx`, `CopyForAI.tsx`, `AIChatWidget.tsx`
- `src/lib/`: `products.ts` (catalog source of truth), `store.tsx`, `seo-audit.ts`, `config.ts`
- `public/`: `llms.txt` (AI index), `llms-full.txt` (extended catalog), `ai.txt`, `images/`, `logo/`
- `skill.md`: capabilities for AI agents
- `agent-permissions.json`: agent access rules and rate limits

## Docs and APIs
- Live site: https://www.edubaazar.shop
- AI index: https://www.edubaazar.shop/llms.txt
- Full catalog: https://www.edubaazar.shop/llms-full.txt
- Sitemap: https://www.edubaazar.shop/sitemap.xml
- Internal APIs: `src/app/api/auth/*`, `src/app/api/admin/*`, `src/app/api/send-email/route.ts`, `src/app/api/telegram/*`

## Dev setup
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Audit AEO: `npx agentic-seo` or `npx agentic-seo --url https://www.edubaazar.shop`

## Conventions
- App Router server components by default; add `"use client"` only for interactive widgets (cart, copy button, chat).
- Product data: edit `src/lib/products.ts` only; slugs must match `generateStaticParams` in `product/[slug]/page.tsx`.
- SEO: every product page must keep Product + Course + FAQPage + BreadcrumbList + Speakable JSON-LD.
- Prices in INR; FREE products use price 0.
- Never expose `/api/*`, `/admin/*`, `/account/*` in llms.txt or sitemap.
- Images go in `public/images/`; run `npm run check:assets` before commit.
