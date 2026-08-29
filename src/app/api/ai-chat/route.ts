import { NextRequest, NextResponse } from "next/server";
import { products, getProductById } from "@/lib/products";

const SYSTEM_PROMPT = `You are "EduBazar Assistant" — a helpful, friendly AI sales & support agent for EduBazar.shop.
You have access to the complete product catalog (courses, books, tools).
Your goals:
1. Answer customer questions accurately using the provided product data
2. Guide customers to the right course/book based on their needs
3. Help with purchase decisions, pricing, features
4. Handle support questions (orders, downloads, access)
5. Be concise, helpful, and conversational in Hinglish/English mix
6. Never make up information — only use provided product data
7. If asked about something not in catalog, say you don't know and suggest contacting support

Available product categories: Hacking, Programming, Trading, Books, Tools, Design, Marketing
Product types: course, book, tool

Current date: ${new Date().toLocaleDateString('en-IN')}`;

const FUNCTIONS = [
  {
    name: "search_products",
    description: "Search products by keyword, category, price range, or level",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (course name, topic, keyword)" },
        category: { type: "string", description: "Category filter: Hacking, Programming, Trading, Books, Tools, Design, Marketing" },
        kind: { type: "string", enum: ["course", "book", "tool"], description: "Product type filter" },
        maxPrice: { type: "number", description: "Maximum price in INR" },
        level: { type: "string", description: "Level filter: Beginner, Intermediate, Advanced, All Levels" },
        featured: { type: "boolean", description: "Only featured products" }
      },
      required: []
    }
  },
  {
    name: "get_product_details",
    description: "Get complete details of a specific product by ID or slug",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "Product ID (e.g., h1, p1, t1) or slug" }
      },
      required: ["id"]
    }
  },
  {
    name: "get_products_by_category",
    description: "Get all products in a specific category",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string", description: "Category: Hacking, Programming, Trading, Books, Tools, Design, Marketing" }
      },
      required: ["category"]
    }
  },
  {
    name: "get_featured_products",
    description: "Get all featured/bestseller/hot products",
    parameters: { type: "object", properties: {} }
  }
];

function searchProducts(args: any) {
  let results = [...products];
  
  if (args.query) {
    const q = args.query.toLowerCase();
    results = results.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (args.category) {
    results = results.filter(p => p.category.toLowerCase() === args.category.toLowerCase());
  }
  if (args.kind) {
    results = results.filter(p => p.kind === args.kind);
  }
  if (args.maxPrice) {
    results = results.filter(p => p.price <= args.maxPrice);
  }
  if (args.level) {
    results = results.filter(p => p.level.toLowerCase() === args.level.toLowerCase());
  }
  if (args.featured) {
    results = results.filter(p => p.featured === true);
  }
  
  return results.slice(0, 10).map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    kind: p.kind,
    price: p.price,
    oldPrice: p.oldPrice,
    desc: p.desc,
    level: p.level,
    duration: p.duration,
    rating: p.rating,
    reviewCount: p.reviewCount,
    badge: p.badge,
    downloadUrl: p.downloadUrl ? "Available after purchase" : "Contact support"
  }));
}

function getProductDetails(args: any) {
  const product = products.find(p => p.id === args.id || p.slug === args.id);
  if (!product) return { error: "Product not found" };
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category,
    kind: product.kind,
    price: product.price,
    oldPrice: product.oldPrice,
    images: product.images,
    desc: product.desc,
    fullDesc: product.fullDesc,
    level: product.level,
    duration: product.duration,
    students: product.students,
    rating: product.rating,
    reviewCount: product.reviewCount,
    includes: product.includes,
    downloadUrl: product.downloadUrl ? "Available after purchase" : "Contact support",
    variants: product.variants,
    featured: product.featured,
    badge: product.badge,
    tags: product.tags,
    createdAt: product.createdAt,
    instructor: product.instructor,
    language: product.language,
    lastUpdated: product.lastUpdated
  };
}

function getProductsByCategory(args: any) {
  const results = products.filter(p => p.category.toLowerCase() === args.category.toLowerCase());
  return results.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    oldPrice: p.oldPrice,
    desc: p.desc,
    level: p.level,
    duration: p.duration,
    rating: p.rating,
    badge: p.badge
  }));
}

function getFeaturedProducts() {
  return products.filter(p => p.featured).map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    price: p.price,
    oldPrice: p.oldPrice,
    desc: p.desc,
    rating: p.rating,
    badge: p.badge
  }));
}

const FUNCTION_HANDLERS: Record<string, Function> = {
  search_products: searchProducts,
  get_product_details: getProductDetails,
  get_products_by_category: getProductsByCategory,
  get_featured_products: getFeaturedProducts
};

async function callOpenAI(messages: any[], functions: any[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      tools: functions.map(f => ({ type: "function", function: f })),
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${err}`);
  }
  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const conversation = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    let response = await callOpenAI(conversation, FUNCTIONS);
    let message = response.choices[0].message;

    // Handle function calls
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments);
        const handler = FUNCTION_HANDLERS[fnName];
        
        if (handler) {
          const result = await handler(fnArgs);
          conversation.push(message);
          conversation.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          } as any);
        }
      }
      // Get final response after function calls
      response = await callOpenAI(conversation, FUNCTIONS);
      message = response.choices[0].message;
    }

    return NextResponse.json({ 
      reply: message.content,
      usage: response.usage
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ 
      error: error.message || "AI service temporarily unavailable",
      reply: "Sorry, main abhi available nahi hoon. Please try again later or contact support at +91-9759131256."
    }, { status: 500 });
  }
}