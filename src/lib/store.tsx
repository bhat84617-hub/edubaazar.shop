"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProductById, products } from "./products";

export type CartItem = { id: string; qty: number; variant?: string };
export type User = { name: string; email: string } | null;
export type Toast = { id: number; msg: string; type: "success" | "error" };

export type OrderItem = { id: string; name: string; price: number; img: string; qty: number; downloadUrl?: string | null };
export type Order = {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  utr?: string;
  date: string;
};

type StoreCtx = {
  mounted: boolean;
  cart: CartItem[];
  wishlist: string[];
  compare: string[];
  user: User;
  orders: Order[];
  toasts: Toast[];
  addToCart: (id: string, qty?: number, variant?: string) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  toggleWishlist: (id: string) => void;
  toggleCompare: (id: string) => boolean;
  quickViewId: string | null;
  openQuickView: (id: string) => void;
  closeQuickView: () => void;
  login: (user: NonNullable<User>) => void;
  logout: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  placeOrder: (data: { name: string; email: string; phone: string; utr?: string }) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: string, downloadUrls?: Record<string, string>) => Promise<void>;
};

const Ctx = createContext<StoreCtx | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    // Shape validation: prevent wrong-type JSON from crashing render
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      if (fallback.length > 0 && typeof fallback[0] === "object" && fallback[0] !== null) {
        return (parsed.filter((x) => x && typeof x === "object") as T);
      }
      return (parsed.filter((x) => typeof x === "string") as T);
    }
    if (fallback === null || (typeof fallback === "object" && fallback !== null)) {
      if (parsed === null || (typeof parsed === "object" && !Array.isArray(parsed))) return parsed as T;
      return fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

// Prune cart entries whose product no longer exists (ghost items → phantom badge / auto-approved junk orders)
function pruneCart(cart: CartItem[]): CartItem[] {
  return cart.filter((i) => i && typeof i.id === "string" && getProductById(i.id) && typeof i.qty === "number" && i.qty > 0);
}

function pruneIds(ids: string[]): string[] {
  return ids.filter((id) => typeof id === "string" && Boolean(getProductById(id)));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [user, setUser] = useState<User>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const toastId = useRef(0);

  const openQuickView = useCallback((id: string) => setQuickViewId(id), []);
  const closeQuickView = useCallback(() => setQuickViewId(null), []);

  useEffect(() => {
    const t = setTimeout(() => {
      const rawCart = read<CartItem[]>("edubazar_cart", []);
      setCart(Array.isArray(rawCart) ? pruneCart(rawCart) : []);
      setWishlist(pruneIds(read<string[]>("edubazar_wishlist", [])));
      setCompare(pruneIds(read<string[]>("edubazar_compare", [])));
      setUser(read<User>("edubazar_user_auth", null));
      setOrders(read<Order[]>("edubazar_orders", []));
      setMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Cross-tab sync: rehydrate when another tab writes the same key
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "edubazar_cart") setCart(pruneCart(read<CartItem[]>("edubazar_cart", [])));
      else if (e.key === "edubazar_wishlist") setWishlist(pruneIds(read<string[]>("edubazar_wishlist", [])));
      else if (e.key === "edubazar_compare") setCompare(pruneIds(read<string[]>("edubazar_compare", [])));
      else if (e.key === "edubazar_user_auth") setUser(read<User>("edubazar_user_auth", null));
      else if (e.key === "edubazar_orders") setOrders(read<Order[]>("edubazar_orders", []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // PII hygiene: never persist UTR / full phone to localStorage.
  // Any XSS could otherwise exfiltrate payment references. Order details
  // remain fetchable from the server via /api/orders?email=.
  function sanitizeOrderForStorage(o: Order): Order {
    return { ...o, phone: "", utr: "" };
  }

  useEffect(() => {
    if (mounted) localStorage.setItem("edubazar_cart", JSON.stringify(cart));
  }, [cart, mounted]);
  useEffect(() => {
    if (mounted) localStorage.setItem("edubazar_wishlist", JSON.stringify(wishlist));
  }, [wishlist, mounted]);
  useEffect(() => {
    if (mounted) localStorage.setItem("edubazar_compare", JSON.stringify(compare));
  }, [compare, mounted]);
  useEffect(() => {
    if (mounted) localStorage.setItem("edubazar_user_auth", JSON.stringify(user));
  }, [user, mounted]);
  useEffect(() => {
    if (mounted) localStorage.setItem("edubazar_orders", JSON.stringify(orders.map(sanitizeOrderForStorage)));
  }, [orders, mounted]);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => {
      // Cap queue + dedupe identical messages
      const deduped = prev.filter((t) => !(t.msg === msg && t.type === type));
      const next = [...deduped, { id, msg, type }];
      return next.slice(-3);
    });
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const addToCart = useCallback(
    (id: string, qty = 1, variant?: string) => {
      const product = getProductById(id);
      const requestedQty = product?.kind === "course" ? 1 : qty;
      setCart((prev) => {
        const existing = prev.find((i) => i.id === id);
        if (existing) {
          return prev.map((i) =>
            i.id === id
              ? { ...i, qty: product?.kind === "course" ? 1 : i.qty + requestedQty }
              : i
          );
        }
        return [...prev, { id, qty: requestedQty, variant }];
      });
      showToast(`${product?.title ?? "Item"} added to cart!`);
    },
    [showToast]
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        removeFromCart(id);
        return;
      }
      const product = getProductById(id);
      const nextQty = product?.kind === "course" ? 1 : qty;
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: nextQty } : i)));
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleCompare = useCallback((id: string): boolean => {
    let changed = false;
    let capped = false;
    setCompare((prev) => {
      if (prev.includes(id)) {
        changed = true;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) {
        capped = true;
        return prev;
      }
      changed = true;
      return [...prev, id];
    });
    // Note: setState updater runs sync in React 18+ for event handlers
    if (capped) return false;
    return changed;
  }, []);

  const login = useCallback((u: NonNullable<User>) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const placeOrder = useCallback(
    async (data: { name: string; email: string; phone: string; utr?: string }): Promise<Order | null> => {
      if (!user) {
        showToast("Please login to place order", "error");
        return null;
      }
      const validItems = cart.filter((i) => getProductById(i.id));
      if (validItems.length === 0) {
        showToast("Your cart is empty", "error");
        return null;
      }

      // Server-side order creation: price/total/status/UTR-dedup all enforced
      // by POST /api/orders (client values are never trusted).
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            utr: data.utr ?? "",
            items: validItems.map((i) => ({ id: i.id, qty: i.qty })),
          }),
        });
        const payload = (await res.json().catch(() => null)) as { order?: Order; error?: string } | null;
        if (!res.ok || !payload?.order) {
          showToast(payload?.error || "Order could not be saved. Please try again or contact support.", "error");
          return null;
        }
        const order = payload.order;
        setOrders((prev) => [order, ...prev]);
        setCart([]);
        return order;
      } catch {
        showToast("Order could not be saved. Please try again or contact support.", "error");
        return null;
      }
    },
    [cart, user, showToast]
  );

  const updateOrderStatus = useCallback(async (orderId: string, status: string, downloadUrls?: Record<string, string>) => {
    const prev = read<Order[]>("edubazar_orders", []);
    const next = prev.map((o) => {
      if (o.orderId !== orderId) return o;
      const updated = { ...o, status };
      if (downloadUrls) {
        updated.items = o.items.map((item) => ({
          ...item,
          downloadUrl: downloadUrls[item.id] || item.downloadUrl,
        }));
      }
      return updated;
    });
    setOrders(next);
    // Local-only: server status changes must go through admin API routes
    // (service_role). Anon key has no UPDATE on orders (RLS).
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => {
    const p = getProductById(i.id);
    return s + (p?.price ?? 0) * i.qty;
  }, 0);

  const value = useMemo<StoreCtx>(
    () => ({
      mounted,
      cart,
      wishlist,
      compare,
      user,
      orders,
      toasts,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      cartCount,
      cartSubtotal,
      toggleWishlist,
      toggleCompare,
      quickViewId,
      openQuickView,
      closeQuickView,
      login,
      logout,
      showToast,
      placeOrder,
      updateOrderStatus,
    }),
    [mounted, cart, wishlist, compare, user, orders, toasts, quickViewId, openQuickView, closeQuickView, addToCart, removeFromCart, setQty, clearCart, cartCount, cartSubtotal, toggleWishlist, toggleCompare, login, logout, showToast, placeOrder, updateOrderStatus]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const categoryCount = (category: string) => products.filter((p) => p.category.toLowerCase() === category.toLowerCase()).length;