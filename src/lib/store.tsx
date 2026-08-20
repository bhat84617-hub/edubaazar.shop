"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getProductById, products } from "./products";
import { supabase } from "./config";

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
  toggleCompare: (id: string) => void;
  login: (user: NonNullable<User>) => void;
  logout: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  placeOrder: (data: { name: string; email: string; phone: string; utr?: string }) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
};

const Ctx = createContext<StoreCtx | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [user, setUser] = useState<User>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    setCart(read<CartItem[]>("edubazar_cart", []));
    setWishlist(read<string[]>("edubazar_wishlist", []));
    setCompare(read<string[]>("edubazar_compare", []));
    setUser(read<User>("edubazar_user_auth", null));
    setOrders(read<Order[]>("edubazar_orders", []));
    setMounted(true);
  }, []);

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
    if (mounted) localStorage.setItem("edubazar_orders", JSON.stringify(orders));
  }, [orders, mounted]);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const addToCart = useCallback(
    (id: string, qty = 1, variant?: string) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === id);
        if (existing) {
          return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
        }
        return [...prev, { id, qty, variant }];
      });
      const p = getProductById(id);
      showToast(`${p?.title ?? "Item"} added to cart!`);
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
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev; 
      return [...prev, id];
    });
  }, []);

  const login = useCallback((u: NonNullable<User>) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const placeOrder = useCallback(
    async (data: { name: string; email: string; phone: string; utr?: string }): Promise<Order | null> => {
      const cartSnapshot = [...cart];
      const items: OrderItem[] = cartSnapshot.map((i) => {
        const p = getProductById(i.id);
        return {
          id: i.id,
          name: p?.title ?? i.id,
          price: p?.price ?? 0,
          img: p?.images?.[0] ?? "",
          qty: i.qty,
          downloadUrl: p?.downloadUrl ?? null,
        };
      });
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);
      const order: Order = {
        orderId: "EDU-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        items,
        total,
        status: total <= 0 ? "approved" : "pending",
        paymentMethod: "upi_qr",
        utr: data.utr ?? "",
        date: new Date().toISOString(),
      };

      setOrders((prev) => [order, ...prev]);
      setCart([]);

      try {
        await supabase.from("orders").insert([
          {
            order_id: order.orderId,
            name: order.name,
            email: order.email,
            phone: order.phone,
            items: JSON.stringify(order.items),
            total: order.total,
            status: order.status,
            payment_method: order.paymentMethod,
            utr: order.utr,
            date: order.date,
          },
        ]);
      } catch {
        // offline fallback: order is already saved locally
      }

      return order;
    },
    [cart, setCart, setOrders]
  );

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    const prev = read<Order[]>("edubazar_orders", []);
    const next = prev.map((o) => (o.orderId === orderId ? { ...o, status } : o));
    setOrders(next);
    try {
      await supabase.from("orders").update({ status }).eq("order_id", orderId);
    } catch {
      // ignore
    }
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
      login,
      logout,
      showToast,
      placeOrder,
      updateOrderStatus,
    }),
    [mounted, cart, wishlist, compare, user, orders, toasts, addToCart, removeFromCart, setQty, clearCart, cartCount, cartSubtotal, toggleWishlist, toggleCompare, login, logout, showToast, placeOrder, updateOrderStatus]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const categoryCount = (category: string) => products.filter((p) => p.category.toLowerCase() === category.toLowerCase()).length;