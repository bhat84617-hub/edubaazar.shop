import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = "https://edubaazar.shop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EduBazar.shop — Online Courses, Digital Books & Hacking Tools",
    template: "%s | EduBazar.shop",
  },
  description:
    "Buy premium online courses in Ethical Hacking, Programming, Python, JavaScript, Stock Market Trading, Digital Marketing & more. Instant delivery, secure UPI payment.",
  keywords: [
    "online courses", "hacking courses", "ethical hacking course",
    "programming courses", "python course", "javascript course",
    "stock market course", "trading course", "digital marketing course",
    "cyber security course", "penetration testing", "web development course",
    "UI UX design course", "digital books", "hacking tools",
    "free courses", "cheap courses India", "EduBazar",
    "buy courses online", "learn hacking online", "learn programming online",
    "UPI payment courses", "instant download courses",
  ],
  authors: [{ name: "EduBazar.shop" }],
  creator: "EduBazar.shop",
  publisher: "EduBazar.shop",
  openGraph: {
    title: "EduBazar.shop — Online Courses, Digital Books & Hacking Tools",
    description: "Premium courses in Hacking, Programming, Trading & more. Instant access after payment.",
    url: SITE_URL,
    siteName: "EduBazar.shop",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/logo/edulogo.jpeg", width: 512, height: 512, alt: "EduBazar.shop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduBazar.shop — Online Courses, Digital Books & Hacking Tools",
    description: "Premium courses in Hacking, Programming, Trading & more.",
    images: ["/logo/edulogo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: SITE_URL, languages: { "en": SITE_URL } },
  icons: { icon: "/logo/edulogo.jpeg" },
};

export const viewport = {
  themeColor: "#edece9",
  width: "device-width",
  initialScale: 1,
};

const SITE = "https://edubaazar.shop";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EduBazar.shop",
  url: SITE,
  description: "Buy premium online courses in Ethical Hacking, Programming, Stock Market Trading & more.",
  potentialAction: {
    "@type": "SearchAction",
    target: SITE + "/shop?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "EduBazar.shop",
    url: SITE,
    logo: { "@type": "ImageObject", url: SITE + "/logo/edulogo.jpeg" },
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EduBazar.shop",
  url: SITE,
  logo: SITE + "/logo/edulogo.jpeg",
  contactPoint: { "@type": "ContactPoint", telephone: "+91-9759131256", contactType: "customer service" },
  sameAs: ["https://instagram.com/edubazarshop", "https://wa.me/919759131256"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jost.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
      </head>
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
