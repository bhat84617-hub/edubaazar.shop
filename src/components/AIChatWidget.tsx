"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, X, Send, Bot, User, Loader2,
  ChevronDown, ChevronUp, Star, Tag, IndianRupee,
  CheckCircle, AlertCircle, Zap, BookOpen, Code, Shield, Search,
  GraduationCap, Sparkles, HeadphonesIcon, ShieldCheck, Clock,
  CreditCard, Package, FileText, RefreshCw, Phone, Mail,
  ShoppingCart, Gift, TrendingUp, ArrowRight, Info, MapPin,
  Award, Users, Globe, Lock, ExternalLink, Copy, Check
} from "lucide-react";
import { products, getProductById, CATEGORIES } from "@/lib/products";

// ============ TYPES ============
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: any[];
  suggestedActions?: string[];
}

// ============ DESIGN TOKENS ============
const DESIGN = {
  colors: {
    bg: "#F4F1EA",
    surface: "#F9F6F0",
    surfaceElevated: "#F5F2EB",
    surfaceHover: "#EFECE3",
    border: "#DDD8CE",
    borderHover: "#C4BBAA",
    primary: "#2C5F7A",
    primaryGlow: "rgba(44, 95, 122, 0.25)",
    primaryLight: "#3A7A9A",
    accent: "#C4953A",
    accentGlow: "rgba(196, 149, 58, 0.3)",
    success: "#2A7A4E",
    error: "#A83D3D",
    warning: "#C4953A",
    text: "#1E1E1E",
    textSecondary: "#5A5350",
    textMuted: "#8A827A",
  },
  gradients: {
    primary: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
    accent: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    glow: "radial-gradient(circle, rgba(44, 95, 122, 0.25) 0%, transparent 70%)",
    surface: "linear-gradient(180deg, rgba(26, 34, 53, 0.8) 0%, rgba(17, 24, 39, 0.95) 100%)",
  }
};

// ============ RULE ENGINE ============
function formatPrice(price: number): string {
  if (price === 0) return "FREE";
  return `₹${price.toLocaleString("en-IN")}`;
}

function findProducts(query: string): any[] {
  const q = query.toLowerCase();
  const results = products.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q) ||
    p.tags?.some(t => t.toLowerCase().includes(q)) ||
    p.category.toLowerCase().includes(q) ||
    p.id.toLowerCase().includes(q) ||
    p.instructor?.toLowerCase().includes(q) ||
    p.level?.toLowerCase().includes(q)
  );
  return results.slice(0, 10);
}

function findByCategory(category: string): any[] {
  return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

function findByKind(kind: string): any[] {
  return products.filter(p => p.kind === kind).slice(0, 6);
}

function getFeatured(): any[] {
  return products.filter(p => p.featured).slice(0, 6);
}

function getBestsellers(): any[] {
  return products.filter(p => p.badge === "Bestseller").slice(0, 6);
}

function getNewCourses(): any[] {
  return products.filter(p => p.badge === "New").slice(0, 6);
}

function getHotDeals(): any[] {
  return products.filter(p => p.badge === "Hot" || (p.oldPrice > p.price && p.price > 0)).slice(0, 6);
}

function getFreeCourses(): any[] {
  return products.filter(p => p.price === 0).slice(0, 6);
}

function getProductDetail(id: string): any {
  return getProductById(id);
}

function getCourseStats() {
  return {
    total: products.length,
    courses: products.filter(p => p.kind === "course").length,
    books: products.filter(p => p.kind === "book").length,
    tools: products.filter(p => p.kind === "tool").length,
    categories: CATEGORIES.length,
    students: "2,50,000+"
  };
}

// ============ ENHANCED INTENT MATCHING ============
function matchIntent(message: string): { intent: string; entities: any } {
  const msg = message.toLowerCase().trim();

  // === GREETINGS ===
  if (/^(hi|hello|hey|namaste|namaskar|greeting|konnichiwa|salaam)/.test(msg)) {
    return { intent: "greeting", entities: {} };
  }

  // === THANKS ===
  if (/(thanks|thank you|thx|shukriya|dhanyawad|appreciate)/.test(msg)) {
    return { intent: "thanks", entities: {} };
  }

  // === HELP ===
  if (/(help|assist|support|guide|main|kaise|kya)/.test(msg) && msg.length < 15) {
    return { intent: "help", entities: {} };
  }

  // === PRICE QUERIES ===
  const priceMatch = msg.match(/(price|cost|rate|kitna|kya price|kitne ka|paisa|rupees)/);
  if (priceMatch) {
    const productQuery = msg
      .replace(/(price|cost|rate|kitna|kya price|kitne ka|paisa|rupees|hai|ka|ki|ke|the|is|are|a|an)/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return { intent: "price_query", entities: { query: productQuery } };
  }

  // === CATEGORY QUERIES ===
  if (/(sab|all|all categories|saari|poori|list|kya kya|hain|available|catalog|kitni|categories)/.test(msg) && /(category|categories|cat|kya hai|kaun|kaunsi|konsi)/.test(msg)) {
    return { intent: "all_categories", entities: {} };
  }

  // === SPECIFIC CATEGORY ===
  const categoryKeywords: Record<string, string> = {
    hacking: "Hacking", pentest: "Hacking", cyber: "Hacking", security: "Hacking", ethical: "Hacking",
    programming: "Programming", coding: "Programming", python: "Programming", javascript: "Programming", java: "Programming", react: "Programming",
    trading: "Trading", share: "Trading", market: "Trading", stock: "Trading", forex: "Trading", crypto: "Trading", bitcoin: "Trading",
    books: "Books", ebook: "Books", pdf: "Books", book: "Books",
    design: "Design", ui: "Design", ux: "Design", photoshop: "Design", illustrator: "Design",
    marketing: "Marketing", seo: "Marketing", ads: "Marketing", facebook: "Marketing", digital: "Marketing",
    tools: "Tools", software: "Tools", rat: "Tools", tool: "Tools",
  };

  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (msg.includes(keyword)) {
      return { intent: "category_list", entities: { category } };
    }
  }

  for (const cat of CATEGORIES) {
    if (msg.includes(cat.key.toLowerCase())) {
      return { intent: "category_list", entities: { category: cat.key } };
    }
  }

  // === FEATURED/BESTSELLER/HOT ===
  if (/(bestseller|best seller|bestselling|top selling|most popular)/.test(msg)) {
    return { intent: "bestsellers", entities: {} };
  }
  if (/(featured|special|top picks|recommended|handpicked)/.test(msg)) {
    return { intent: "featured", entities: {} };
  }
  if (/(hot|deal|offer|discount|reduced|sale)/.test(msg)) {
    return { intent: "hot_deals", entities: {} };
  }
  if (/(new|latest|recent|launch|sabse naya)/.test(msg)) {
    return { intent: "new_courses", entities: {} };
  }

  // === FREE ===
  if (/(free|muft|zero.*cost|0.*rs|no.*charge|freebies)/.test(msg)) {
    return { intent: "free_courses", entities: {} };
  }

  // === ALL COURSES ===
  if (/(sab|all|poore|pura|saare|saari|everything|dikhao|list|show|browse|shop|dekhna|catalog|kitne|kitni|kya kya)/.test(msg) && /(course|courses|product|products|item|items|hai|hain|available|dekhna|browse)/.test(msg)) {
    return { intent: "all_courses", entities: {} };
  }

  // === SPECIFIC PRODUCT BY ID ===
  const idMatch = msg.match(/\b(h\d+|p\d+|t\d+|b\d+|d\d+|m\d+)\b/);
  if (idMatch) {
    return { intent: "product_detail", entities: { id: idMatch[1] } };
  }

  // === COURSE DETAIL BY NAME ===
  for (const product of products) {
    const titleWords = product.title.toLowerCase().split(/\s+/).slice(0, 3).join(" ");
    if (msg.includes(titleWords.substring(0, 15)) || product.title.toLowerCase().includes(msg.substring(0, 20))) {
      return { intent: "product_detail", entities: { id: product.id } };
    }
  }

  // === ORDER/SUPPORT QUERIES ===
  const supportPatterns = /(order|track|download|refund|payment| utr |pending|approved|rejected|status|cancel|track|delivery|shipping)/;
  if (supportPatterns.test(msg)) {
    if (/(download|link|nahi|not.*found|missing)/.test(msg)) {
      return { intent: "download_issue", entities: {} };
    }
    if (/(refund|money.*back|return)/.test(msg)) {
      return { intent: "refund", entities: {} };
    }
    if (/(payment|paise|utr|transaction|transfer)/.test(msg)) {
      return { intent: "payment_issue", entities: {} };
    }
    return { intent: "support", entities: {} };
  }

  // === COURSE RECOMMENDATION ===
  if (/(recommend|suggest|kaunsa|kaun sa|which.*best|best.*for|beginner|shuru|start|should.*take|interested|take.*course)/.test(msg)) {
    return { intent: "recommendation", entities: {} };
  }

  // === LEVEL-BASED ===
  if (/(beginner|new.*to|start.*with|basic|foundation|first)/.test(msg)) {
    return { intent: "beginner_courses", entities: {} };
  }
  if (/(advanced|pro|expert|experienced|master)/.test(msg)) {
    return { intent: "advanced_courses", entities: {} };
  }

  // === STATS/CATALOG ===
  if (/(kitne|how many|total|stats|statistics|catalog|库存|kya kya|konsa|konsi)/.test(msg) &&
      /(course|courses|hain|available|havai)/.test(msg)) {
    return { intent: "catalog_stats", entities: {} };
  }

  // === ABOUT/WHO ARE YOU ===
  if (/(who.*you|what.*you|about.*you|tell.*about|kya hai tu|kon hai)/.test(msg)) {
    return { intent: "about_bot", entities: {} };
  }

  // === CONTACT ===
  if (/(contact|reach|talk|phone|whatsapp|email|mail|connect|call|number)/.test(msg)) {
    return { intent: "contact", entities: {} };
  }

  // === PAYMENT INFO ===
  if (/(pay|payment|upi|gpay|phonepe|paytm|card|bank|how.*buy|buy.*kaise|purchase)/.test(msg)) {
    return { intent: "how_to_buy", entities: {} };
  }

  // === SEARCH FALLBACK ===
  if (msg.length > 2) {
    return { intent: "search", entities: { query: msg } };
  }

  return { intent: "unknown", entities: {} };
}

// ============ COMPREHENSIVE RESPONSE GENERATOR ============
function generateResponse(message: string): { text: string; products?: any[]; suggestedActions?: string[] } {
  const { intent, entities } = matchIntent(message);
  const stats = getCourseStats();

  switch (intent) {
    // === GREETING ===
    case "greeting":
      return {
        text: `🙏 *Namaste!* Main hoon *EduBot* — aapka personal course guide!

Main aapki har sawal ka jawaab de sakta hoon!

📚 *Mere paas hain:*
• ${stats.courses}+ Premium Courses & Books
• ${stats.categories} Categories

🗂️ *Categories:*
${CATEGORIES.map(c => `• ${c.label}: ${products.filter(p => p.category === c.key).length} items`).join("\n")}

🔥 *Popular queries:*
"Saari categories dikhao" • "Hacking courses dekho"
"Python course ka price?" • "Free courses hain?"
"Best seller batao" • "Payment kaise karu?"
"Order track kaise karu?" • "Contact info do"

Kya poochna hai aapko? 😊`,
        suggestedActions: ["Saari categories", "Free courses dikhao", "Hacking courses", "Best seller course"]
      };

    // === HELP ===
    case "help":
      return {
        text: `🎯 *Main aapki kaise help kar sakta hoon?*

Maine har course ki poori jaankari apne paas:
• 💰 Price aur discount details
• ⭐ Rating aur reviews
• 📚 Course content aur duration
• 👨‍🏫 Instructor info
• 🎓 Level (Beginner/Intermediate/Advanced)
• 📦 Download link aur access info

*Common queries:*
🔹 "Python course kitne ka hai?" → Price bataunga
🔹 "Hacking courses dikhao" → Category list
🔹 "Order track karo" → Order status
🔹 "Refund chahiye" → Refund policy
🔹 "Payment kaise karu?" → Step-by-step guide

Apna sawaal poocho! 🚀`,
        suggestedActions: ["Hacking courses dikhao", "Price check karo", "How to buy guide", "Contact support"]
      };

    // === THANKS ===
    case "thanks":
      return {
        text: `Aapka shukriya! 🙏

Ye yaad rahe - agar koi aur sawaal ho toh poochna mat hesitate karein. Main 24/7 available hoon!

Agar aapne abhi course purchase kiya hai, toh download link 1-2 hours mein activate ho jayega. Koi issue ho toh WhatsApp karein: +91-9759131256

Happy Learning! 📚✨`,
        suggestedActions: ["More courses dekho", "Order track karo", "Contact on WhatsApp"]
      };

    // === PRICE QUERY ===
    case "price_query": {
      const results = findProducts(entities.query || "");
      if (results.length === 1) {
        const p = results[0];
        const discount = p.oldPrice > p.price ? Math.round((1 - p.price/p.oldPrice) * 100) : 0;
        return {
          text: `💰 *${p.title}*\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📍 Category: ${p.category}\n` +
            `📊 Level: ${p.level}\n` +
            `⏱️ Duration: ${p.duration}\n` +
            `🎓 Students: ${p.students}\n` +
            `⭐ Rating: ${p.rating}/5 (${p.reviewCount} reviews)\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💵 *Price:* **${formatPrice(p.price)}**` +
            (discount > 0 ? ` ~~₹${p.oldPrice}~~ (${discount}% OFF!)` : "") + "\n" +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `${p.desc.substring(0, 150)}...\n\n` +
            `✨ *Includes:*\n${p.includes.slice(0, 3).map((i: string) => `• ${i}`).join("\n")}`,
          products: [p],
          suggestedActions: [`Buy now - ${formatPrice(p.price)}`, "Full details dekho", "Similar courses dekho"]
        };
      } else if (results.length > 1) {
        return {
          text: `🔍 *"${entities.query}"* ke liye ${results.length} results milay!\n\n` +
            `Sorted by relevance:`,
          products: results,
          suggestedActions: ["Price range mein dekho", "Free wale filter karo", "Categories dekho"]
        };
      }
      return {
        text: `😕 *Koi exact match nahi mila "${entities.query}" ke liye*\n\n` +
          `Suggestions:\n` +
          `• Course ka full naam likhein\n` +
          `• Category bolo: "Trading courses"\n` +
          `• Ya direct product ID dein (jaise: h1, p1)\n\n` +
          `📞 Still stuck? WhatsApp karein: +91-9759131256`,
        suggestedActions: ["All courses dekho", "Categories browse karo", "Contact support"]
      };
    }

    // === ALL CATEGORIES ===
    case "all_categories": {
      const catList = CATEGORIES.map(cat => {
        const catProducts = products.filter(p => p.category === cat.key);
        const freeCount = catProducts.filter(p => p.price === 0).length;
        const minPrice = catProducts.length > 0 ? Math.min(...catProducts.map(p => p.price)) : 0;
        const maxPrice = catProducts.length > 0 ? Math.max(...catProducts.map(p => p.price)) : 0;
        return `📂 *${cat.label}*\n   → ${catProducts.length} items | ₹${minPrice} - ₹${maxPrice}` + (freeCount > 0 ? ` | ${freeCount} FREE` : "");
      }).join("\n\n");
      const allProducts = products.slice(0, 10);
      return {
        text: `🗂️ *EduBazar - ALL Categories*\n\n` +
          `Total: ${CATEGORIES.length} categories | ${products.length} products\n\n` +
          `${catList}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `🔍 *Kisi bhi category mein detail dekhne ke liye bolo:*\n` +
          `• "Hacking courses dikhao"\n` +
          `• "Programming ka sab dikha"\n` +
          `• "Trading mein kya hai?"\n` +
          `• "Books list karo"\n` +
          `• "Design courses"\n` +
          `• "Marketing courses"\n` +
          `• "Tools & Software"\n\n` +
          `Ya koi bhi course ka naam pucho - poori detail milegi! 🚀`,
        products: allProducts,
        suggestedActions: ["Hacking courses", "Programming courses", "Trading courses", "Free courses", "Books dekho"]
      };
    }

    // === CATEGORY LIST ===
    case "category_list": {
      const catProducts = findByCategory(entities.category);
      const catInfo = CATEGORIES.find(c => c.key.toLowerCase() === entities.category.toLowerCase());
      const catLabel = catInfo?.label || entities.category;
      if (catProducts.length === 0) {
        return {
          text: `📭 *"${catLabel}"* mein abhi koi product nahi hai.\n\nAvailable categories:\n${CATEGORIES.map(c => `• ${c.label}`).join("\n")}`,
          suggestedActions: CATEGORIES.slice(0, 4).map(c => `${c.label} courses`)
        };
      }
      const freeItems = catProducts.filter(p => p.price === 0);
      const paidItems = catProducts.filter(p => p.price > 0);
      const priceRange = paidItems.length > 0 ? `₹${Math.min(...paidItems.map(p => p.price))} - ₹${Math.max(...paidItems.map(p => p.price))}` : "FREE only";
      const avgPrice = paidItems.length > 0 ? Math.round(paidItems.reduce((s, p) => s + p.price, 0) / paidItems.length) : 0;

      const itemsList = catProducts.map(p => {
        const disc = p.oldPrice > p.price ? ` (${Math.round((1 - p.price / p.oldPrice) * 100)}% OFF)` : "";
        const badge = p.badge ? ` [${p.badge}]` : "";
        return `  • *${p.title}* — ${formatPrice(p.price)}${p.oldPrice > p.price ? ` ~~₹${p.oldPrice}~~` : ""}${disc}${badge}\n    Level: ${p.level} | Duration: ${p.duration} | ⭐ ${p.rating}`;
      }).join("\n\n");

      return {
        text: `📚 *${catLabel} - ${catProducts.length} items found*\n\n` +
          `💰 Price range: ${priceRange}\n` +
          `📊 Avg price: ${formatPrice(avgPrice)}` +
          (freeItems.length > 0 ? `\n🆓 ${freeItems.length} FREE items available!` : "") +
          `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +
          `${itemsList}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `💡 Kisi course ki full details ke liye naam bolo!`,
        products: catProducts.slice(0, 8),
        suggestedActions: [`${catLabel} mein sab dekho`, "Free courses", "Compare karo", "Back to all categories"]
      };
    }

    // === ALL COURSES ===
    case "all_courses": {
      const topProducts = products.slice(0, 10);
      const totalFree = products.filter(p => p.price === 0).length;
      return {
        text: `📚 *EduBazar - ALL ${products.length} Products*\n\n` +
          `📂 ${CATEGORIES.length} Categories | ${totalFree} FREE items\n\n` +
          `Showing top products across all categories:\n` +
          `Bolo kisi specific category ka naam aur saari details milengi! 🚀`,
        products: topProducts,
        suggestedActions: ["Saari categories", "Free courses", "Hacking courses", "Programming courses", "Trading courses"]
      };
    }

    // === BESTSELLERS ===
    case "bestsellers": {
      const bestsellers = getBestsellers();
      return {
        text: `🏆 *India's Best Selling Courses!*\n\n` +
          `Sabse zyada enrolled aur highest rated courses:\n` +
          `⭐ Rated 4.7+ by thousands of students\n` +
          `📚 Created by expert instructors\n\n` +
          `Ye hain top picks:`,
        products: bestsellers,
        suggestedActions: ["All bestsellers dekho", "Browse by category", "Compare prices"]
      };
    }

    // === FEATURED ===
    case "featured":
    case "hot_deals":
    case "new_courses": {
      const featured = intent === "featured" ? getFeatured() :
                       intent === "new_courses" ? getNewCourses() : getHotDeals();
      const title = intent === "featured" ? "⭐ Featured Courses" :
                    intent === "new_courses" ? "✨ New Arrivals" : "🔥 Hot Deals & Offers";
      return {
        text: `${title}!\n\n` +
          `Handpicked by our experts. Limited time offers! ⏰`,
        products: featured,
        suggestedActions: ["All deals dekho", "Category wise dekho", "Price filter karo"]
      };
    }

    // === FREE COURSES ===
    case "free_courses": {
      const free = getFreeCourses();
      return {
        text: `🆓 *FREE Courses & Resources!*\n\n` +
          `${free.length} completely free items available:\n` +
          `• Full course content\n` +
          `• No hidden charges\n` +
          `• Instant access after order\n\n` +
          `Best free resources:`,
        products: free,
        suggestedActions: ["All free items dekho", "Premium mein upgrade karo", "Course compare karo"]
      };
    }

    // === BEGINNER COURSES ===
    case "beginner_courses": {
      const beginners = products.filter(p => p.level === "Beginner" || p.level === "All Levels").slice(0, 6);
      return {
        text: `🌱 *Beginner Friendly Courses!*\n\n` +
          `Perfect for those starting fresh. No prior knowledge needed!\n\n` +
          `Featured beginner courses:`,
        products: beginners,
        suggestedActions: ["All beginner courses", "Browse by category", "Get course recommendations"]
      };
    }

    // === ADVANCED COURSES ===
    case "advanced_courses": {
      const advanced = products.filter(p => p.level === "Advanced" || p.level === "Intermediate").slice(0, 6);
      return {
        text: `🎓 *Advanced & Professional Courses!*\n\n` +
          `For experienced learners ready to master their skills.\n\n` +
          `Top advanced courses:`,
        products: advanced,
        suggestedActions: ["All advanced courses", "Compare skill levels", "Get personalized recommendation"]
      };
    }

    // === CATALOG STATS ===
    case "catalog_stats":
      return {
        text: `📊 *EduBazar Complete Catalog*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📚 Total Products: ${products.length}\n` +
          `📖 Courses: ${stats.courses} | Books: ${stats.books} | Tools: ${stats.tools}\n` +
          `👨‍🎓 Students: ${stats.students}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📂 *Categories Breakdown:*\n\n` +
          CATEGORIES.map(c => {
            const items = products.filter(p => p.category === c.key);
            const free = items.filter(p => p.price === 0).length;
            return `*${c.label}* — ${items.length} items` + (free > 0 ? ` (${free} FREE)` : "");
          }).join("\n") +
          `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +
          `💡 *Tip:* "saari categories" bolo aur sab dekho!`,
        suggestedActions: ["Saari categories dekho", "Free courses", "Browse shop", "Bestsellers"]
      };

    // === PRODUCT DETAIL ===
    case "product_detail": {
      const product = getProductDetail(entities.id);
      if (!product) {
        return {
          text: `❌ Product ID "${entities.id}" nahi mila.\n\n` +
            `Valid IDs format: h1, h2, p1, p2, t1, b1, d1, m1\n` +
            `Example: "h1 course details"\n\n` +
            `📞 Help chahiye? WhatsApp: +91-9759131256`,
          suggestedActions: ["All courses dekho", "Search karo", "Contact support"]
        };
      }
      const discount = product.oldPrice > product.price ? Math.round((1 - product.price/product.oldPrice) * 100) : 0;
      return {
        text: `🎓 *${product.title}*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🏷️ ID: ${product.id} | Category: ${product.category}\n` +
          `📊 Level: ${product.level} | Duration: ${product.duration}\n` +
          `👨‍🏫 Instructor: ${product.instructor}\n` +
          `🌐 Language: ${product.language}\n` +
          `👨‍🎓 ${product.students} students enrolled\n` +
          `⭐ Rating: ${product.rating}/5 (${product.reviewCount} reviews)\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `💰 *Price:* **${formatPrice(product.price)}**` +
          (discount > 0 ? `\n~~₹${product.oldPrice}~~ → Save ${discount}%!` : "") + "\n\n" +
          `📝 *Description:*\n${product.fullDesc?.substring(0, 300) || product.desc}...\n\n` +
          `✅ *What you'll get:*\n${product.includes.slice(0, 4).map((i: string) => `• ${i}`).join("\n")}` +
          (product.lastUpdated ? `\n\n📅 Last updated: ${product.lastUpdated}` : ""),
        products: [product],
        suggestedActions: [`Buy now - ${formatPrice(product.price)}`, "Add to cart", "View all details"]
      };
    }

    // === SUPPORT ===
    case "support":
      return {
        text: `📋 *Order & Support Help*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🔍 *Common Issues & Solutions:*\n\n` +
          `📥 *Download Link nahi mila?*\n` +
          `→ Admin approve karta hai order ko\n` +
          `→ Usually 1-2 hours lagta hai\n` +
          `→ WhatsApp pe Order ID share karein\n\n` +
          `⏳ *Order Status:*\n` +
          `→ Pending: Admin verification mein\n` +
          `→ Approved: Download link mil jayega\n` +
          `→ Issues: WhatsApp pe contact karein\n\n` +
          `💰 *Payment Issues:*\n` +
          `→ UTR number share karein WhatsApp pe\n` +
          `→ Payment verify hoti hai 1-2 hours mein\n\n` +
          `🔄 *Refund Policy:*\n` +
          `→ 7 din ke andar request karein\n` +
          `→ Course access nahi mila toh refund possible\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📞 *Direct Contact:*\n` +
          `WhatsApp: +91-9759131256\n` +
          `Email: support@edubaazar.shop`,
        suggestedActions: ["Track my order", "Report payment issue", "Request refund", "Contact on WhatsApp"]
      };

    // === DOWNLOAD ISSUE ===
    case "download_issue":
      return {
        text: `📥 *Download Link Issue?*\n\n` +
          `Steps to resolve:\n\n` +
          `1️⃣ *Check email* - Download link email pe bhi jaata hai\n\n` +
          `2️⃣ *Wait 1-2 hours* - Order approval time leti hai\n\n` +
          `3️⃣ *Check spam folder* - Email spam mein bhi check karo\n\n` +
          `4️⃣ *WhatsApp pe contact karo* - Apna Order ID share karein\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📱 WhatsApp: +91-9759131256\n\n` +
          `Format: "Hi, mera Order ID [number] hai, download link nahi mila"\n\n` +
          `⏰ Working hours: 10 AM - 10 PM`,
        suggestedActions: ["Contact on WhatsApp", "Track order status", "Report issue via email"]
      };

    // === REFUND ===
    case "refund":
      return {
        text: `💰 *Refund Policy & Process*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `✅ *Refund possible hai agar:*\n` +
          `• Course download/link nahi mila\n` +
          `• Technical issue hai jo resolve nahi ho raha\n` +
          `• Wrong course deliver hua hai\n\n` +
          `⏰ *Timeline:*\n` +
          `• 7 din ke andar request karein\n` +
          `• 3-5 din mein refund process hota hai\n\n` +
          `📋 *Process:*\n` +
          `1. WhatsApp pe refund request karein\n` +
          `2. Order ID aur reason batao\n` +
          `3. UPI/bank details provide karein\n` +
          `4. Refund initiate hoga\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📱 WhatsApp: +91-9759131256\n` +
          `📧 Email: support@edubaazar.shop`,
        suggestedActions: ["Request refund via WhatsApp", "Check refund status", "Learn about policy"]
      };

    // === PAYMENT ISSUE ===
    case "payment_issue":
      return {
        text: `💳 *Payment & UTR Help*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📱 *Payment Methods:*\n` +
          `• UPI (GPay, PhonePe, Paytm)\n` +
          `• Bank Transfer\n` +
          `• QR Code Payment\n\n` +
          `📋 *After Payment:*\n` +
          `1. Screenshot lo payment ka\n` +
          `2. UTR number note karo\n` +
          `3. WhatsApp pe bhejo:\n` +
          `   Order ID + UTR Number + Screenshot\n\n` +
          `⏱️ *Verification:*\n` +
          `• Usually 1-2 hours mein approve hota hai\n` +
          `• Download link mil jayega\n\n` +
          `⚠️ *Common Issues:*\n` +
          `• Payment failed → Try again with different method\n` +
          `• Amount deducted but no confirmation → Wait 24 hours\n` +
          `• UTR not received → Contact your bank\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📞 WhatsApp: +91-9759131256`,
        suggestedActions: ["Send UTR on WhatsApp", "Retry payment", "Contact support"]
      };

    // === HOW TO BUY ===
    case "how_to_buy":
      return {
        text: `🛒 *How to Buy Courses - Step by Step*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📋 *Step 1: Choose Course*\n` +
          `Browse courses ya direct product ID se dhundho\n\n` +
          `📋 *Step 2: Add to Cart*\n` +
          `Click "Add to Cart" ya "Buy Now"\n\n` +
          `📋 *Step 3: Make Payment*\n` +
          `• UPI: edu@okicici / @edubazaar\n` +
          `• Bank: Account details dekhenge aapko\n` +
          `• QR Code: Available on request\n\n` +
          `📋 *Step 4: Share Details*\n` +
          `WhatsApp pe bhejo:\n` +
          `• Order ID\n` +
          `• Course Name\n` +
          `• Payment UTR Number\n` +
          `• Payment Screenshot\n\n` +
          `📋 *Step 5: Get Access*\n` +
          `• 1-2 hours mein approve hoga\n` +
          `• Download link WhatsApp pe milega\n` +
          `• Email bhi hoga\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `💡 *Pro Tip:* WhatsApp pe order karo - fastest response!\n\n` +
          `📱 WhatsApp: +91-9759131256`,
        suggestedActions: ["Browse courses", "Send order on WhatsApp", "View payment options"]
      };

    // === CONTACT ===
    case "contact":
      return {
        text: `📞 *Contact EduBazar Support*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📱 *WhatsApp (Fastest):*\n` +
          `+91-9759131256\n` +
          `Timing: 10 AM - 10 PM\n\n` +
          `📧 *Email:*\n` +
          `support@edubaazar.shop\n` +
          `Response: Within 24 hours\n\n` +
          `💬 *What we help with:*\n` +
          `• Order status & tracking\n` +
          `• Download link issues\n` +
          `• Payment verification\n` +
          `• Refund requests\n` +
          `• Course recommendations\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `⚡ *For fastest response:*\n` +
          `WhatsApp pe message karein with:\n` +
          `• Your Name\n` +
          `• Order ID (if existing)\n` +
          `• Issue description\n\n` +
          `⏰ Usually 1-2 hours mein reply aata hai!`,
        suggestedActions: ["Open WhatsApp", "Send email", "Browse FAQ"]
      };

    // === ABOUT BOT ===
    case "about_bot":
      return {
        text: `🤖 *Meet EduBot - Your Course Guide!*\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `Main hoon EduBot - EduBazar ka AI assistant!\n\n` +
          `✨ *What I can do:*\n` +
          `• 📚 Course recommendations\n` +
          `• 💰 Price aur discount info\n` +
          `• 📋 Order support & tracking\n` +
          `• 💳 Payment guidance\n` +
          `• ❓ General queries\n\n` +
          `🎯 *My specialties:*\n` +
          `• ${stats.courses}+ courses ki jaankari\n` +
          `• Sabhi categories ka knowledge\n` +
          `• Real-time availability check\n` +
          `• Student reviews & ratings\n\n` +
          `⚡ *Best part:*\n` +
          `Instant replies, 24/7 available\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `Still have questions? Human support available!\n` +
          `📱 WhatsApp: +91-9759131256`,
        suggestedActions: ["Show me courses", "Help me find course", "Contact human support"]
      };

    // === RECOMMENDATION ===
    case "recommendation":
      const beginnerCourses = products.filter(p => p.level === "Beginner" || p.level === "All Levels").slice(0, 6);
      return {
        text: `🎯 *Personalized Course Recommendations*\n\n` +
          `Based on your interest, here are some great starting points:\n\n` +
          `🌱 *For Beginners:*\n` +
          `No prior knowledge needed. Start here!\n\n` +
          `Let me know your interest area:\n` +
          `• 🛡️ Hacking & Cybersecurity\n` +
          `• 💻 Programming & Development\n` +
          `• 📈 Trading & Investment\n` +
          `• 🎨 Design & Creative\n` +
          `• 📢 Marketing & Growth\n\n` +
          `Batao ki aap kis field mein interested hain, main best courses recommend karunga! 🚀`,
        products: beginnerCourses,
        suggestedActions: ["Hacking courses recommed", "Programming suggest karo", "Trading courses dekho"]
      };

    // === SEARCH ===
    case "search": {
      const results = findProducts(entities.query);
      if (results.length === 0) {
        return {
          text: `🔍 *"${entities.query}"* ke liye koi result nahi mila.\n\n` +
            `Tips for better search:\n` +
            `• Course ka full naam likhein\n` +
            `• Category name try karo\n` +
            `• Ya product ID use karo\n\n` +
            `Examples:\n` +
            `• "Python programming course"\n` +
            `• "Trading books"\n` +
            `• "h1" (for specific product)`,
          suggestedActions: ["Try different search", "Browse categories", "Contact support"]
        };
      }
      return {
        text: `🔍 *Search Results for "${entities.query}"*\n\n` +
          `${results.length} courses found:\n` +
          `Showing most relevant:`,
        products: results,
        suggestedActions: ["Show more results", "Filter by price", "Browse category"]
      };
    }

    // === UNKNOWN ===
    default:
      return {
        text: `🤔 *Hmm, main samajh nahi paaya completely*\n\n` +
          `Try these common queries:\n\n` +
          `📚 *Categories:*\n` +
          `• "Saari categories dikhao" → All categories\n` +
          `• "Hacking courses" → Hacking category\n` +
          `• "Programming mein kya hai?"\n` +
          `• "Trading courses list"\n\n` +
          `🔍 *Search & Details:*\n` +
          `• "Python course ka price?"\n` +
          `• "Free courses hain kya?"\n` +
          `• "Bestseller courses batao"\n\n` +
          `🛒 *Orders & Support:*\n` +
          `• "Order track karo"\n` +
          `• "Payment kaise karu?"\n` +
          `• "Contact info do"\n\n` +
          `📞 *WhatsApp:* +91-9759131256`,
        suggestedActions: ["Saari categories", "Free courses", "How to buy", "Contact support"]
      };
  }
}

// ============ PRODUCT CARD COMPONENT ============
const ProductCard = ({ product, onBuy }: { product: any; onBuy?: () => void }) => {
  const discount = product.oldPrice > product.price ? Math.round((1 - product.price/product.oldPrice) * 100) : 0;

  return (
    <div className="product-card">
      <div className="product-header">
        <div className="product-image">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} />
          ) : (
            <div className="product-image-placeholder">
              <BookOpen size={20} />
            </div>
          )}
          {product.badge && (
            <span className={`product-badge ${product.badge.toLowerCase()}`}>
              {product.badge}
            </span>
          )}
        </div>
        <div className="product-info">
          <h4 className="product-title">{product.title}</h4>
          <div className="product-meta">
            <span className="product-category">{product.category}</span>
            <span className="product-level">{product.level}</span>
          </div>
          <p className="product-desc">{product.desc.substring(0, 80)}...</p>
          <div className="product-stats">
            <span className="product-rating">⭐ {product.rating}</span>
            <span className="product-students">👨‍🎓 {product.students}</span>
          </div>
        </div>
      </div>
      <div className="product-footer">
        <div className="product-price">
          <span className="price-current">{formatPrice(product.price)}</span>
          {discount > 0 && (
            <>
              <span className="price-old">₹{product.oldPrice}</span>
              <span className="price-discount">{discount}% OFF</span>
            </>
          )}
        </div>
        <a
          href={`/product/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="product-action"
        >
          View <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput("");
    setShowQuickReplies(false);

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: userMessageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate thinking with realistic delay
    const thinkingTime = 500 + Math.random() * 800;
    setTimeout(() => {
      const response = generateResponse(userMessageText);
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        products: response.products,
        suggestedActions: response.suggestedActions
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
      if (!isOpen) setHasUnread(true);
    }, thinkingTime);
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    sendMessage();
  };

  const handleSuggestedAction = (action: string) => {
    setInput(action);
    sendMessage();
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const QUICK_REPLIES = [
    { icon: "📚", text: "All courses dekho" },
    { icon: "💰", text: "Free courses dikhao" },
    { icon: "🔥", text: "Hot deals batao" },
    { icon: "🛒", text: "How to buy?" },
    { icon: "📞", text: "Contact support" },
    { icon: "⭐", text: "Best seller courses" },
  ];

  const parseMarkdown = (text: string) => {
    // Parse **bold**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      <style>{`
        /* === DESIGN TOKENS === */
        .edubot-* {
          --edubot-bg: #F4F1EA;
          --edubot-surface: #F9F6F0;
          --edubot-surface-elevated: #F5F2EB;
          --edubot-surface-hover: #EFECE3;
          --edubot-border: #DDD8CE;
          --edubot-border-hover: #C4BBAA;
          --edubot-primary: #2C5F7A;
          --edubot-primary-glow: rgba(44, 95, 122, 0.25);
          --edubot-primary-light: #3A7A9A;
          --edubot-accent: #C4953A;
          --edubot-accent-glow: rgba(196, 149, 58, 0.3);
          --edubot-success: #2A7A4E;
          --edubot-text: #1E1E1E;
          --edubot-text-secondary: #5A5350;
          --edubot-text-muted: #8A827A;
        }

        /* === ANIMATIONS === */
        @keyframes edubot-glow-pulse {
          0%, 100% { box-shadow: 0 0 20px var(--edubot-primary-glow), 0 0 40px rgba(44, 95, 122, 0.2); }
          50% { box-shadow: 0 0 30px var(--edubot-primary-glow), 0 0 60px rgba(44, 95, 122, 0.25); }
        }

        @keyframes edubot-slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes edubot-typing-dot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }

        @keyframes edubot-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .edubot-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2C5F7A 0%, #1E4058 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F4F1EA;
          box-shadow: 0 4px 20px rgba(44, 95, 122, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: edubot-glow-pulse 3s ease-in-out infinite;
        }

        .edubot-launcher:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(44, 95, 122, 0.5);
        }

        .edubot-launcher svg {
          width: 28px;
          height: 28px;
          transition: transform 0.3s ease;
        }

        .edubot-launcher:hover svg {
          transform: rotate(10deg);
        }

        .edubot-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: edubot-slide-in 0.3s ease;
          border: 2px solid #F4F1EA;
        }

        /* === CHAT WINDOW (Robot Body) === */
        .edubot-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          z-index: 9998;
          width: 360px;
          max-width: calc(100vw - 32px);
          height: 520px;
          max-height: calc(100vh - 120px);
          background: #F4F1EA;
          border-radius: 30px;
          border: 2px solid #DDD8CE;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: edubot-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.15),
            0 0 0 4px #F4F1EA;
        }

        /* Robot antenna */
        .edubot-antenna {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 14px;
          background: #2C5F7A;
          border-radius: 2px;
          z-index: -1;
        }

        .edubot-antenna-dot {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #C4953A;
          border: 2px solid #2C5F7A;
        }

        /* Robot eyes */
        .edubot-eyes {
          position: absolute;
          top: 22px;
          right: 70px;
          display: flex;
          gap: 16px;
          z-index: 10;
        }

        .edubot-eye {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #2C5F7A;
          box-shadow: 0 0 8px rgba(44, 95, 122, 0.5);
        }

        /* Robot chest panel */
        .edubot-chest {
          position: absolute;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 40px;
          background: #2C5F7A;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 2px solid #1E4058;
          box-shadow: 0 4px 12px rgba(44, 95, 122, 0.3);
        }

        .edubot-chest .led {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2A7A4E;
          animation: edubot-led-pulse 2s ease-in-out infinite;
        }

        @keyframes edubot-led-pulse {
          0%, 100% { box-shadow: 0 0 6px #2A7A4E, 0 0 12px rgba(42, 122, 78, 0.5); }
          50% { box-shadow: 0 0 12px #2A7A4E, 0 0 20px rgba(42, 122, 78, 0.8); }
        }

        /* === HEADER === */
        .edubot-header {
          padding: 20px;
          background: linear-gradient(135deg, #F5F2EB 0%, #F9F6F0 100%);
          border-bottom: 1px solid #DDD8CE;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .edubot-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .edubot-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(44, 95, 122, 0.25);
          position: relative;
          overflow: hidden;
        }

        .edubot-avatar::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          animation: edubot-shimmer 3s infinite;
        }

        .edubot-avatar svg {
          width: 26px;
          height: 26px;
          position: relative;
          z-index: 1;
        }

        .edubot-header-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1E1E1E;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .edubot-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #5A5350;
        }

        .edubot-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2A7A4E;
          box-shadow: 0 0 8px #2A7A4E;
          animation: edubot-glow-pulse 2s ease-in-out infinite;
        }

        .edubot-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #F9F6F0;
          border: 1px solid #DDD8CE;
          color: #5A5350;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .edubot-close:hover {
          background: #EFECE3;
          color: #1E1E1E;
          border-color: #C4BBAA;
        }

        /* === MESSAGES === */
        .edubot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }

        .edubot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .edubot-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .edubot-messages::-webkit-scrollbar-thumb {
          background: #DDD8CE;
          border-radius: 3px;
        }

        .edubot-messages::-webkit-scrollbar-thumb:hover {
          background: #C4BBAA;
        }

        /* === WELCOME MESSAGE === */
        .edubot-welcome {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .edubot-welcome-header {
          display: flex;
          gap: 12px;
        }

        .edubot-welcome-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2C5F7A 0%, #1E4058 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F4F1EA;
          flex-shrink: 0;
        }

        .edubot-welcome-bubble {
          background: #F9F6F0;
          border: 1px solid #DDD8CE;
          border-radius: 16px;
          border-top-left-radius: 4px;
          padding: 16px;
          max-width: 100%;
        }

        .edubot-welcome-bubble p {
          color: #1E1E1E;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .edubot-welcome-bubble p:last-child {
          margin-bottom: 0;
        }

        /* === QUICK REPLIES === */
        .edubot-quick-replies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-left: 52px;
        }

        .edubot-quick-btn {
          padding: 8px 14px;
          border-radius: 20px;
          background: #F9F6F0;
          border: 1px solid #DDD8CE;
          color: #5A5350;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .edubot-quick-btn:hover {
          background: #EFECE3;
          border-color: #2C5F7A;
          color: #3A7A9A;
          transform: translateY(-1px);
        }

        /* === MESSAGE BUBBLES === */
        .edubot-message {
          display: flex;
          gap: 10px;
          animation: edubot-slide-in 0.3s ease;
        }

        .edubot-message.user {
          flex-direction: row-reverse;
        }

        .edubot-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2C5F7A 0%, #1E4058 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F4F1EA;
          flex-shrink: 0;
        }

        .edubot-message.user .edubot-message-avatar {
          background: #EFECE3;
        }

        .edubot-message-content {
          max-width: 85%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .edubot-message-bubble {
          padding: 14px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          color: #1E1E1E;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .edubot-message.assistant .edubot-message-bubble {
          background: #F9F6F0;
          border: 1px solid #DDD8CE;
          border-radius: 16px 16px 16px 4px;
        }

        .edubot-message.user .edubot-message-bubble {
          background: linear-gradient(135deg, #2C5F7A 0%, #1E4058 100%);
          color: #F4F1EA;
          border-radius: 16px 16px 4px 16px;
        }

        .edubot-message-time {
          font-size: 10px;
          color: #8A827A;
          padding: 0 4px;
        }

        .edubot-message.user .edubot-message-time {
          text-align: right;
        }

        /* === TYPING INDICATOR === */
        .edubot-typing {
          display: flex;
          gap: 10px;
          animation: edubot-slide-in 0.3s ease;
        }

        .edubot-typing-avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2C5F7A 0%, #1E4058 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F4F1EA;
          flex-shrink: 0;
        }

        .edubot-typing-bubble {
          background: #F9F6F0;
          border: 1px solid #DDD8CE;
          border-radius: 16px 16px 16px 4px;
          padding: 14px 18px;
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .edubot-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2C5F7A;
          animation: edubot-typing-dot 1.4s ease-in-out infinite;
        }

        .edubot-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .edubot-typing-dot:nth-child(3) { animation-delay: 0.4s; }

        /* === PRODUCT CARDS === */
        .edubot-products {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .edubot-products-title {
          font-size: 12px;
          color: #5A5350;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0 4px;
        }

        .product-card {
          background: #F9F6F0;
          border: 1px solid #DDD8CE;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .product-card:hover {
          border-color: #C4BBAA;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .product-header {
          display: flex;
          gap: 12px;
          padding: 12px;
        }

        .product-image {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--edubot-surface);
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8A827A;
        }

        .product-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .product-badge.hot {
          background: linear-gradient(135deg, #A83D3D 0%, #7A2B2B 100%);
          color: #F4F1EA;
        }

        .product-badge.bestseller {
          background: linear-gradient(135deg, #C4953A 0%, #95752C 100%);
          color: #F4F1EA;
        }

        .product-badge.new {
          background: linear-gradient(135deg, #2A7A4E 0%, #1E5E3A 100%);
          color: #F4F1EA;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-title {
          font-size: 13px;
          font-weight: 600;
          color: #1E1E1E;
          margin: 0 0 4px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-meta {
          display: flex;
          gap: 6px;
          margin-bottom: 4px;
        }

        .product-category,
        .product-level {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--edubot-surface);
          color: #5A5350;
        }

        .product-desc {
          font-size: 11px;
          color: #8A827A;
          margin: 0 0 6px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-stats {
          display: flex;
          gap: 10px;
          font-size: 10px;
          color: #5A5350;
        }

        .product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--edubot-surface);
          border-top: 1px solid #DDD8CE;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price-current {
          font-size: 15px;
          font-weight: 700;
          color: #C4953A;
        }

        .price-old {
          font-size: 11px;
          color: #8A827A;
          text-decoration: line-through;
        }

        .price-discount {
          font-size: 10px;
          font-weight: 600;
          color: #2A7A4E;
          background: rgba(42, 122, 78, 0.15);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .product-action {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #3A7A9A;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .product-action:hover {
          color: #2C5F7A;
        }

        /* === SUGGESTED ACTIONS === */
        .edubot-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding-left: 42px;
        }

        .edubot-suggestion-btn {
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(44, 95, 122, 0.1);
          border: 1px solid rgba(44, 95, 122, 0.25);
          color: #3A7A9A;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .edubot-suggestion-btn:hover {
          background: rgba(44, 95, 122, 0.2);
          border-color: #2C5F7A;
          transform: translateY(-1px);
        }

        /* === INPUT AREA === */
        .edubot-input-area {
          padding: 16px 20px;
          background: var(--edubot-surface);
          border-top: 1px solid #DDD8CE;
        }

        .edubot-input-wrapper {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .edubot-input-container {
          flex: 1;
          position: relative;
        }

        .edubot-input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 40px;
          background: #F9F6F0;
          border: 1px solid #DDD8CE;
          border-radius: 12px;
          color: #1E1E1E;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          outline: none;
          transition: all 0.2s ease;
          min-height: 46px;
          max-height: 120px;
        }

        .edubot-input::placeholder {
          color: #8A827A;
        }

        .edubot-input:focus {
          border-color: #2C5F7A;
          box-shadow: 0 0 0 3px rgba(44, 95, 122, 0.2);
        }

        .edubot-char-count {
          position: absolute;
          right: 12px;
          bottom: 12px;
          font-size: 10px;
          color: #8A827A;
        }

        .edubot-send-btn {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .edubot-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .edubot-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .edubot-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
          font-size: 10px;
          color: #8A827A;
        }

        .edubot-footer a {
          color: #3A7A9A;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .edubot-footer a:hover {
          color: #2C5F7A;
        }

        .edubot-footer-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #8A827A;
        }

        /* === DARK MODE OVERRIDES === */
        @media (prefers-color-scheme: light) {
          .edubot-window,
          .edubot-launcher {
            /* Keep dark theme always */
          }
        }

        /* === RESPONSIVE === */
        @media (max-width: 480px) {
          .edubot-window {
            width: calc(100vw - 16px);
            right: 8px;
            bottom: 80px;
            height: calc(100vh - 100px);
            max-height: none;
            border-radius: 16px;
          }

          .edubot-launcher {
            bottom: 16px;
            right: 16px;
            width: 54px;
            height: 54px;
          }
        }
      `}</style>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="edubot-launcher"
        aria-label={isOpen ? "Close EduBot" : "Open EduBot - Your course assistant"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && hasUnread && <span className="edubot-badge">1</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="edubot-window" role="dialog" aria-label="EduBot - Course Assistant">
          {/* Robot Decorations */}
          <div className="edubot-antenna">
            <div className="edubot-antenna-dot" />
          </div>
          <div className="edubot-eyes">
            <div className="edubot-eye" />
            <div className="edubot-eye" />
          </div>

          {/* Header */}
          <div className="edubot-header">
            <div className="edubot-header-left">
              <div className="edubot-avatar" style={{ borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(135deg, #C4953A 0%, #95752C 100%)', border: '2px solid #F4F1EA', boxShadow: '0 4px 15px rgba(196, 149, 58, 0.4)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F4F1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="8.5" cy="12" r="1.5" fill="#F4F1EA" stroke="none"/><circle cx="15.5" cy="12" r="1.5" fill="#F4F1EA" stroke="none"/><line x1="12" y1="17" x2="12" y2="19"/><line x1="7" y1="5" x2="7" y2="7"/><line x1="17" y1="5" x2="17" y2="7"/></svg>
              </div>
              <div className="edubot-header-info">
                <h3>EduBot</h3>
                <div className="edubot-status">
                  <span className="edubot-status-dot" />
                  <span>Online • Free & Instant</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="edubot-close"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="edubot-messages" ref={chatContainerRef}>
            {/* Welcome State */}
            {messages.length === 0 && (
              <div className="edubot-welcome">
                <div className="edubot-welcome-header">
                  <div className="edubot-welcome-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="edubot-welcome-bubble">
                    <p>🙏 *Namaste!* Main hoon <strong>EduBot</strong> — aapka personal course guide!</p>
                    <p>Sab courses ki jaankari turant available! 💡</p>
                    <p>Kya poochna hai aapko? Type karo ya niche options mein se choose karo!</p>
                  </div>
                </div>

                {/* Quick Replies */}
                <div className="edubot-quick-replies">
                  {QUICK_REPLIES.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReply(reply.text)}
                      className="edubot-quick-btn"
                    >
                      <span>{reply.icon}</span>
                      <span>{reply.text}</span>
                    </button>
                  ))}
                </div>

                {/* Stats Card */}
                <div className="edubot-stats-card" style={{
                  background: '#F9F6F0',
                  border: '1px solid #DDD8CE',
                  borderRadius: '14px',
                  padding: '16px',
                  marginLeft: '52px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <Sparkles size={16} style={{ color: '#C4953A' }} />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#1E1E1E'
                    }}>EduBazar Statistics</span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#3A7A9A'
                      }}>{getCourseStats().courses}+</div>
                      <div style={{ fontSize: '10px', color: '#8A827A' }}>Courses</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#C4953A'
                      }}>{getCourseStats().categories}</div>
                      <div style={{ fontSize: '10px', color: '#8A827A' }}>Categories</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#2A7A4E'
                      }}>2.5L+</div>
                      <div style={{ fontSize: '10px', color: '#8A827A' }}>Students</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`edubot-message ${msg.role}`}>
                <div className="edubot-message-avatar">
                  {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="edubot-message-content">
                  <div className="edubot-message-bubble">
                    {parseMarkdown(msg.content)}
                  </div>

                  {/* Products */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="edubot-products">
                      <div className="edubot-products-title">
                        {msg.products.length} result{msg.products.length > 1 ? 's' : ''} found
                      </div>
                      {msg.products.slice(0, 3).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                      {msg.products.length > 3 && (
                        <a
                          href="/shop"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px',
                            background: '#F9F6F0',
                            border: '1px solid #DDD8CE',
                            borderRadius: '10px',
                            color: '#3A7A9A',
                            fontSize: '12px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2C5F7A';
                            e.currentTarget.style.background = '#EFECE3';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#DDD8CE';
                            e.currentTarget.style.background = '#F9F6F0';
                          }}
                        >
                          View all {msg.products.length} results <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="edubot-suggestions">
                      {msg.suggestedActions.slice(0, 4).map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestedAction(action)}
                          className="edubot-suggestion-btn"
                        >
                          <ArrowRight size={10} />
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="edubot-message-time">
                    {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="edubot-typing">
                <div className="edubot-typing-avatar">
                  <Bot size={16} />
                </div>
                <div className="edubot-typing-bubble">
                  <span className="edubot-typing-dot" />
                  <span className="edubot-typing-dot" />
                  <span className="edubot-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="edubot-input-area">
            <div className="edubot-input-wrapper">
              <div className="edubot-input-container">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message... (Enter to send)"
                  className="edubot-input"
                  rows={1}
                  disabled={isLoading}
                  maxLength={500}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="edubot-send-btn"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <div className="edubot-footer">
              <a
                href="https://wa.me/919759131256"
                target="_blank"
                rel="noopener noreferrer"
              >
                Human support
              </a>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
