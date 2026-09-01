import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Wishlist — Saved Courses | EduBazar.shop",
  description: "Your saved courses at EduBazar.shop. Wishlist your favorite Hacking, Programming, Trading courses.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.edubaazar.shop/wishlist" },
};
export default function WishlistLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
