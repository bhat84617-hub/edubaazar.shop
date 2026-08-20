import type { Metadata } from "next";
import { League_Spartan, Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";

const league = League_Spartan({
  variable: "--font-league",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://edubaazar-shop.vercel.app"),
  title: {
    default: "EduBazar.shop — Learn. Grow. Succeed.",
    template: "%s | EduBazar.shop",
  },
  description:
    "EduBazar.shop — Learn Hacking, Programming, Trading & more with expert courses. Premium courses, digital books and tools at affordable prices. India's top online learning platform.",
  keywords: [
    "hacking courses",
    "programming courses",
    "trading courses",
    "online education",
    "ethical hacking",
    "python",
    "javascript",
    "react",
    "digital books",
    "EduBazar",
  ],
  openGraph: {
    title: "EduBazar.shop — Learn. Grow. Succeed.",
    description:
      "Premium courses, digital books & tools. Hacking, Programming, Trading and more.",
    url: "https://edubaazar-shop.vercel.app",
    siteName: "EduBazar.shop",
    type: "website",
    images: ["/logo/edulogo.jpeg"],
  },
  icons: {
    icon: "/logo/edulogo.jpeg",
  },
};

export const viewport = {
  themeColor: "#114639",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${league.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}