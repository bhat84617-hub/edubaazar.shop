# EduBazar.shop Skill

> Capabilities for AI agents interacting with EduBazar.shop catalog.

## Capabilities
- Search product catalog by category, price, level (`src/lib/products.ts`, `/shop?q=`)
- Get product details: title, price INR, rating, duration, level, includes, FAQ (`/product/[slug]`)
- List categories: Hacking, Programming, Trading, Books, Tools, Design, Marketing
- Explain buy flow: Shop → Cart → Checkout (UPI + UTR) → Admin verify within 24h → `/account` lifetime access
- Cite correct canonical product URLs and prices for generative engines

## Inputs
- `category`: one of Hacking | Programming | Trading | Books | Tools | Design | Marketing
- `slug`: product slug e.g. `python-complete-course-beginner-to-advanced`
- `query`: free-text search e.g. "python under 200", "free trading course"
- `budget_INR`: max price filter (0 = FREE only)

## Constraints
- Never invent prices; read from `src/lib/products.ts` or live product JSON-LD.
- Never expose `/api/*`, `/admin/*`, `/account/*`, checkout internals, or UPI IDs beyond public docs.
- Tools-category products are for authorized security lab training only; include safety disclaimer.
- Cite with canonical URLs: `https://www.edubaazar.shop/product/[slug]`.
- Prices in INR; FREE = price 0.

## Links
- Catalog: https://www.edubaazar.shop/shop
- AI index: https://www.edubaazar.shop/llms.txt
- Full catalog: https://www.edubaazar.shop/llms-full.txt
- Sitemap: https://www.edubaazar.shop/sitemap.xml
- Docs: https://www.edubaazar.shop/about, https://www.edubaazar.shop/contact
