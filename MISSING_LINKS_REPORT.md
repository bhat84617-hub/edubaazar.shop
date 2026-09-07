# Missing Download Links Audit — EduBazar.shop

Date: 2026-09-02
Source: src/lib/products.ts

Valid URL criteria: `downloadUrl` exists, starts with `http`, not empty, not `#`, not ending with `/account`

Total products in source: 49
Restricted (filtered out via splice): 11 (h24, h25, h26, h27, h28, h29, h3, h30, h35, h4, h7)
Effective visible products: 38

Products WITH valid downloadUrl: 29
Products WITHOUT valid downloadUrl: 9

## Products Missing Valid Link (9)

| # | ID | Title | Slug | Category | Price | Current downloadUrl |
|---|----|-------|------|----------|-------|----------------------|
| 1 | p1 | Python Complete Course: Beginner to Advanced | python-complete-course-beginner-to-advanced | Programming | 199 | MISSING (field absent) |
| 2 | p2 | Complete JavaScript Mastery | complete-javascript-mastery | Programming | 249 | MISSING (field absent) |
| 3 | p3 | React & Next.js Developer Guide | react-nextjs-developer-guide | Programming | 199 | MISSING (field absent) |
| 4 | t2 | Crypto Trading Pro: Bitcoin & Altcoins | crypto-trading-pro-bitcoin-altcoins | Trading | 249 | MISSING (field absent) |
| 5 | t3 | Forex Trading: Complete Beginners Guide | forex-trading-complete-beginners-guide | Trading | 199 | MISSING (field absent) |
| 6 | b2 | Trading Psychology: Master Your Mind | trading-psychology-master-your-mind | Books | 1 | MISSING (field absent) |
| 7 | b3 | Python Crash Course: Complete Guide | python-crash-course-complete-guide | Books | 1 | MISSING (field absent) |
| 8 | d1 | UI/UX Design Complete Course | ui-ux-design-complete-course | Design | 199 | MISSING (field absent) |
| 9 | d2 | UI/UX Design Fundamentals | ui-ux-design-fundamentals | Design | 249 | MISSING (field absent) |

### Summary (IDs)

p1, p2, p3, t2, t3, b2, b3, d1, d2

### Notes
- These 9 courses currently have no `downloadUrl` field at all (value is `undefined`). They will fallback to empty string in order handling (`src/app/api/admin/orders/status/route.ts:84-86`) and show NO Download button in `src/app/account/page.tsx:78` (filtered out).
- All other 29 effective products have valid `https://www.mediafire.com/...` or `https://1024terabox.com/...` links.
- Restricted 11 products are hidden from shop via `restrictedProductIds` splice (lines 1216-1219) and not counted.
