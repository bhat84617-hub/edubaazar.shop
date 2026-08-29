"use client";

import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, X, Send, Bot, User, Loader2, 
  ChevronDown, ChevronUp, Star, Tag, IndianRupee,
  CheckCircle, AlertCircle, Zap, BookOpen, Code, Shield, Search
} from "lucide-react";
import { products, getProductById, CATEGORIES } from "@/lib/products";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: any[];
}

const CATEGORY_ICONS: Record<string, any> = {
  Hacking: Shield,
  Programming: Code,
  Trading: Zap,
  Books: BookOpen,
  Tools: Tag,
  Design: Star,
  Marketing: Star
};

const QUICK_REPLIES = [
  "Courses dikhao",
  "Hacking courses kaunse hain?",
  "Python course price kya hai?",
  "Sabse bestseller course?",
  "Free courses hain kya?",
  "Order kaise track karu?",
  "Download link nahi mila",
  "Refund policy kya hai?"
];

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
    p.id.toLowerCase().includes(q)
  );
  return results.slice(0, 8);
}

function findByCategory(category: string): any[] {
  return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

function findByKind(kind: string): any[] {
  return products.filter(p => p.kind === kind);
}

function getFeatured(): any[] {
  return products.filter(p => p.featured).slice(0, 6);
}

function getBestsellers(): any[] {
  return products.filter(p => p.badge === "Bestseller").slice(0, 6);
}

function getFreeCourses(): any[] {
  return products.filter(p => p.price === 0 && p.kind === "course").slice(0, 6);
}

function getProductDetail(id: string): any {
  return getProductById(id);
}

function matchIntent(message: string): { intent: string; entities: any } {
  const msg = message.toLowerCase();
  
  // Greeting
  if (/^(hi|hello|hey|namaste|hii|hlo)/.test(msg)) return { intent: "greeting", entities: {} };
  
  // Thanks
  if (/(thanks|thank you|thx|shukriya|dhanyawad)/.test(msg)) return { intent: "thanks", entities: {} };
  
  // Price queries
  const priceMatch = msg.match(/(price|cost|rate|kitna|kya price|kitne ka)/);
  if (priceMatch) {
    const productQuery = msg.replace(/(price|cost|rate|kitna|kya price|kitne ka|hai|ka|ki|ke)/g, "").trim();
    return { intent: "price_query", entities: { query: productQuery } };
  }
  
  // Category queries
  for (const cat of CATEGORIES) {
    if (msg.includes(cat.key.toLowerCase())) {
      if (/(course|book|tool|kaunse|kaun|which|list|show|dikhao|batao)/.test(msg)) {
        return { intent: "category_list", entities: { category: cat.key } };
      }
    }
  }
  
  // Bestseller/Featured/Hot
  if (/(bestseller|best seller|top|popular|hot|featured|sabse achha|sabse best)/.test(msg)) {
    return { intent: "featured", entities: {} };
  }
  
  // Free courses
  if (/(free|muft|free course|free book|0 rs|zero)/.test(msg)) {
    return { intent: "free_courses", entities: {} };
  }
  
  // Specific product by ID
  const idMatch = msg.match(/\b(h\d+|p\d+|t\d+|b\d+|d\d+)\b/);
  if (idMatch) {
    return { intent: "product_detail", entities: { id: idMatch[1] } };
  }
  
  // Order/Support queries
  if (/(order|track|download|refund|payment| utr|pending|approved|rejected|status)/.test(msg)) {
    return { intent: "support", entities: {} };
  }
  
  // Course recommendation
  if (/(recommend|suggest|kaunsa|kaun sa|which|best for|beginner|shuru|start)/.test(msg)) {
    return { intent: "recommendation", entities: {} };
  }
  
  // Search fallback
  if (msg.length > 2) {
    return { intent: "search", entities: { query: msg } };
  }
  
  return { intent: "unknown", entities: {} };
}

function generateResponse(message: string): { text: string; products?: any[] } {
  const { intent, entities } = matchIntent(message);
  
  switch (intent) {
    case "greeting":
      return {
        text: `Namaste! 👋 Main **EduBazar Assistant** hoon — aapka course guide.\n\nMain aapki help kar sakta hoon:\n• 📚 **Courses dhundne mein** — "Hacking courses dikhao"\n• 💰 **Price check karne mein** — "Python course kitne ka hai?"\n• 🏷️ **Category browse** — "Trading books kaunse hain?"\n• ⭐ **Best sellers** — "Sabse popular course?"\n• 🆓 **Free courses** — "Free courses hain kya?"\n• 📦 **Order support** — "Download link nahi mila"\n\nKya dhundh rahe hain aaj?`
      };
    
    case "thanks":
      return {
        text: "Welcome! 😊 Koi aur help chahiye toh pooch sakte hain. Happy learning! 🚀"
      };
    
    case "price_query":
      const searchResults = findProducts(entities.query || "");
      if (searchResults.length === 1) {
        const p = searchResults[0];
        return {
          text: `"${p.title}" ka price: **${formatPrice(p.price)}**${p.oldPrice > p.price ? ` (MRP: ${formatPrice(p.oldPrice)})` : ""}.\n\n${p.desc}\n\nLevel: ${p.level} | Duration: ${p.duration} | Rating: ⭐ ${p.rating}`,
          products: [p]
        };
      } else if (searchResults.length > 1) {
        return {
          text: `Maine ${searchResults.length} courses dhundhe — niche list hai:`,
          products: searchResults
        };
      }
      return { text: "Sorry, us topic ka course nahi mila. Kya aap category ya keyword try karenge?" };
    
    case "category_list":
      const catProducts = findByCategory(entities.category);
      if (catProducts.length === 0) {
        return { text: `"${entities.category}" category mein abhi koi course nahi hai.` };
      }
      return {
        text: `"${entities.category}" category ke **${catProducts.length} courses** hain:`,
        products: catProducts.slice(0, 8)
      };
    
    case "featured":
      const featured = getFeatured();
      return {
        text: `Ye rahe hamare **Featured & Bestseller courses** (${featured.length}):`,
        products: featured
      };
    
    case "free_courses":
      const free = getFreeCourses();
      return {
        text: `Ye rahe **${free.length} FREE courses/books**:`,
        products: free
      };
    
    case "product_detail":
      const product = getProductDetail(entities.id);
      if (!product) {
        return { text: `Product ID "${entities.id}" nahi mila. Sahi ID try karein (jaise: h1, p1, t1).` };
      }
      return {
        text: `**${product.title}**\n\n${product.fullDesc || product.desc}\n\n💰 **Price:** ${formatPrice(product.price)}${product.oldPrice > product.price ? ` (Was ${formatPrice(product.oldPrice)})` : ""}\n📊 **Level:** ${product.level} | ⏱️ **Duration:** ${product.duration}\n⭐ **Rating:** ${product.rating}/5 (${product.reviewCount} reviews)\n👨‍🏫 **Instructor:** ${product.instructor}\n🌐 **Language:** ${product.language}\n\n${product.includes.map((i: string) => `✅ ${i}`).join("\n")}`,
        products: [product]
      };
    
    case "support":
      return {
        text: `**Order/Support Help** 📋\n\n**Common Issues:**\n• **Download link nahi mila** → Admin approve karega tab milta hai. Apna Order ID share karein.\n• **Order pending hai** → Admin verify karta hai (usually 1-2 hours).\n• **Refund chahiye** → 7 din ke andar request karein agar course access nahi mila.\n• **Payment verify** → UTR number share karein WhatsApp pe.\n\n**Direct Contact:**\n📱 WhatsApp: +91-9759131256\n📧 Email: support@edubaazar.shop\n\nApna **Order ID** batayein, main check karke bataunga.`
      };
    
    case "recommendation":
      const beginnerCourses = products.filter(p => p.level === "Beginner" || p.level === "All Levels").slice(0, 6);
      return {
        text: `Shuru kar rahe hain? Ye **Beginner-friendly courses** best hain:\n\nAgar specific field batao (hacking, programming, trading, design) toh better suggest kar paunga.`,
        products: beginnerCourses
      };
    
    case "search":
      const results = findProducts(entities.query);
      if (results.length === 0) {
        return { text: `"${entities.query}" ke liye koi course nahi mila. Alag keywords try karein ya category bolo.` };
      }
      return {
        text: `"${entities.query}" ke liye **${results.length} results** mile:`,
        products: results
      };
    
    default:
      return {
        text: `Samajh nahi aaya 😅 Thoda alag puchhein jaise:\n\n• "Hacking courses dikhao"\n• "Python course price kya hai?"\n• "Free courses hain kya?"\n• "Bestseller course batao"\n• "Order ID #1234 track karo"\n• "h1 course ke bare mein batao"\n\nYa WhatsApp karein: +91-9759131256`
      };
  }
}

// ============ COMPONENT ============
export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (isOpen) setHasUnread(false); }, [isOpen]);

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    setShowQuickReplies(false);
    
    const newUserMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    // Simulate thinking delay
    setTimeout(() => {
      const response = generateResponse(userMessage);
      const assistantMsg: Message = {
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        products: response.products
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
      if (!isOpen) setHasUnread(true);
    }, 400 + Math.random() * 600);
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    sendMessage();
  };

  const renderProductCard = (product: any) => (
    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-2">
        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{product.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary font-semibold">{formatPrice(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-gray-400 line-through text-xs">{formatPrice(product.oldPrice)}</span>
            )}
            {product.badge && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                {product.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.desc}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</span>
        <a 
          href={`/product/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline font-medium"
        >
          View Details →
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
        aria-label="Open chat with EduBazar Assistant"
      >
        <MessageSquare className="w-7 h-7" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            1
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={messagesEndRef}
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm md:max-w-md lg:max-w-lg h-[calc(100vh-3rem)] max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up"
          role="dialog"
          aria-label="EduBazar Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">EduBazar Assistant</h3>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Online • Instant replies (no API key needed)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && showQuickReplies && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Namaste! 👋 Main **EduBazar Assistant** hoon — bina kisi API key ke, fully free.\n\nSab courses mere paas hain. Kya help chahiye?
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-start">
                  {QUICK_REPLIES.slice(0, 4).map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-start">
                  {QUICK_REPLIES.slice(4).map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === "user" ? "order-2" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 opacity-70 ${msg.role === "user" ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                      {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  
                  {/* Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.products.map(renderProductCard)}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{animationDelay: "0ms"}} />
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{animationDelay: "150ms"}} />
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{animationDelay: "300ms"}} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              🆓 **100% Free** • No API key • Powered by EduBazar catalog •{" "}
              <a href="https://wa.me/919759131256" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Human support
              </a>
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </>
  );
}