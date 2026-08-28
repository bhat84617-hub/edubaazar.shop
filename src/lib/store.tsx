"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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

export type AdminUser = { email: string; role: string };

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
  updateOrderStatus: (orderId: string, status: string, downloadUrls?: Record<string, string>) => Promise<void>;
  allOrders: Order[];
  registerUser: (name: string, email: string, password: string) => boolean;
  loginUser: (email: string, password: string) => boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  isAdmin: boolean;
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

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const ADMIN_PASSWORD = "Admin@123";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [user, setUser] = useState<User>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const toastId = useRef(0);

  useEffect(() => {
    setCart(read<CartItem[]>("edubazar_cart", []));
    setWishlist(read<string[]>("edubazar_wishlist", []));
    setCompare(read<string[]>("edubazar_compare", []));
    setUser(read<User>("edubazar_user_auth", null));
    setOrders(read<Order[]>("edubazar_orders", []));
    setIsAdmin(read<boolean>("edubazar_admin_auth", false));
    setMounted(true);
  }, []);

  useEffect(() => { if (mounted) write("edubazar_cart", cart); }, [cart, mounted]);
  useEffect(() => { if (mounted) write("edubazar_wishlist", wishlist); }, [wishlist, mounted]);
  useEffect(() => { if (mounted) write("edubazar_compare", compare); }, [compare, mounted]);
  useEffect(() => { if (mounted) write("edubazar_user_auth", user); }, [user, mounted]);
  useEffect(() => { if (mounted) write("edubazar_orders", orders); }, [orders, mounted]);
  useEffect(() => { if (mounted) write("edubazar_admin_auth", isAdmin); }, [isAdmin, mounted]);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const addToCart = useCallback((id: string, qty = 1, variant?: string) => {
    const product = getProductById(id);
    const requestedQty = product?.kind === "course" ? 1 : qty;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => i.id === id ? { ...i, qty: product?.kind === "course" ? 1 : i.qty + requestedQty } : i);
      }
      return [...prev, { id, qty: requestedQty, variant }];
    });
    showToast(`${product?.title ?? "Item"} added to cart!`);
  }, [showToast]);

  const removeFromCart = useCallback((id: string) => { setCart((prev) => prev.filter((i) => i.id !== id)); }, []);
  const setQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    const product = getProductById(id);
    const nextQty = product?.kind === "course" ? 1 : qty;
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: nextQty } : i)));
  }, [removeFromCart]);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((id: string) => { setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])); }, []);
  const toggleCompare = useCallback((id: string) => {
    setCompare((prev) => { if (prev.includes(id)) return prev.filter((x) => x !== id); if (prev.length >= 4) return prev; return [...prev, id]; });
  }, []);
  const login = useCallback((u: NonNullable<User>) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const registerUser = useCallback((name: string, email: string, password: string): boolean => {
    const users = read<{ name: string; email: string; password: string }[]>("edubazar_users", []);
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    users.push({ name, email: email.toLowerCase(), password });
    write("edubazar_users", users);
    return true;
  }, []);

  const loginUser = useCallback((email: string, password: string): boolean => {
    const users = read<{ name: string; email: string; password: string }[]>("edubazar_users", []);
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      setUser({ name: found.name, email: found.email });
      return true;
    }
    return false;
  }, []);

  const adminLogin = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => setIsAdmin(false), []);

  const placeOrder = useCallback(async (data: { name: string; email: string; phone: string; utr?: string }): Promise<Order | null> => {
    if (!user) return null;
    const cartSnapshot = [...cart];
    const items: OrderItem[] = cartSnapshot.map((i) => {
      const p = getProductById(i.id);
      return { id: i.id, name: p?.title ?? i.id, price: p?.price ?? 0, img: p?.images?.[0] ?? "", qty: i.qty, downloadUrl: p?.downloadUrl ?? null };
    });
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const order: Order = {
      orderId: "EDU-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase(),
      name: data.name, email: data.email, phone: data.phone, items, total,
      status: total <= 0 ? "approved" : "pending", paymentMethod: "upi_qr", utr: data.utr ?? "", date: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return order;
  }, [cart, user]);

  const allOrders = useMemo(() => {
    const all = read<Order[]>("edubazar_orders", []);
    return all;
  }, [orders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string, downloadUrls?: Record<string, string>) => {
    setOrders((prev) => {
      const next = prev.map((o) => {
        if (o.orderId !== orderId) return o;
        const updated = { ...o, status };
        if (downloadUrls) {
          updated.items = o.items.map((item) => ({ ...item, downloadUrl: downloadUrls[item.id] || item.downloadUrl }));
        }
        return updated;
      });
      write("edubazar_orders", next);
      return next;
    });
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => { const p = getProductById(i.id); return s + (p?.price ?? 0) * i.qty; }, 0);

  const value = useMemo<StoreCtx>(() => ({
    mounted, cart, wishlist, compare, user, orders, toasts, addToCart, removeFromCart, setQty, clearCart,
    cartCount, cartSubtotal, toggleWishlist, toggleCompare, login, logout, showToast, placeOrder,
    updateOrderStatus, allOrders, registerUser, loginUser, adminLogin, adminLogout, isAdmin,
  }), [mounted, cart, wishlist, compare, user, orders, toasts, addToCart, removeFromCart, setQty, clearCart, cartCount, cartSubtotal, toggleWishlist, toggleCompare, login, logout, showToast, placeOrder, updateOrderStatus, allOrders, registerUser, loginUser, adminLogin, adminLogout, isAdmin]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const categoryCount = (category: string) => products.filter((p) => p.category.toLowerCase() === category.toLowerCase()).length;
