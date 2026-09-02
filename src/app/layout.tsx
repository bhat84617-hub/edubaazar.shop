import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Jost } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";
import AIChatWidget from "@/components/AIChatWidget";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.edubaazar.shop";
const SITE_NAME = "EduBazar.shop";
const SITE_TITLE = "EduBazar.shop — Online Courses, Digital Books & Hacking Tools";
const SITE_DESCRIPTION =
  "Buy premium online courses in Ethical Hacking, Programming, Python, JavaScript, Stock Market Trading, Digital Marketing & more. Instant delivery, secure UPI payment. Starting at just ₹49 with lifetime access.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_TITLE,
    template: "%s | EduBazar.shop",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "online courses",
    "hacking courses",
    "ethical hacking course",
    "programming courses",
    "python course",
    "javascript course",
    "stock market course",
    "trading course",
    "digital marketing course",
    "cyber security course",
    "penetration testing",
    "web development course",
    "UI UX design course",
    "digital books",
    "hacking tools",
    "free courses",
    "cheap courses India",
    "EduBazar",
    "buy courses online",
    "learn hacking online",
    "learn programming online",
    "UPI payment courses",
    "instant download courses",
    "Kali Linux course",
    "React Next.js course",
    "forex trading course",
    "crypto trading course",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Education",
  classification: "Education / Online Learning / E-commerce",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    title: SITE_TITLE,
    description:
      "Premium courses in Hacking, Programming, Trading & more. 30+ courses starting at ₹49. Instant access after UPI payment — lifetime validity.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    alternateLocale: ["hi_IN", "en_US"],
    type: "website",
    images: [
      {
        url: "/logo/edulogo.jpeg",
        width: 512,
        height: 512,
        alt: "EduBazar.shop — India's Affordable Learning Platform",
        type: "image/jpeg",
      },
      {
        url: "/images/complete ethical hacking & penetration testing.jpeg",
        width: 800,
        height: 600,
        alt: "EduBazar.shop featured courses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@edubazarshop",
    creator: "@edubazarshop",
    title: SITE_TITLE,
    description: "Premium courses in Hacking, Programming, Trading & more. Starting at ₹49. Instant UPI delivery.",
    images: [SITE_URL + "/logo/edulogo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IN": SITE_URL,
      "en": SITE_URL,
      "hi-IN": `${SITE_URL}/hi`,
      "x-default": SITE_URL,
    },
  },
  icons: {
    icon: [
      { url: "/logo/edulogo.jpeg", type: "image/jpeg" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/logo/edulogo.jpeg", sizes: "180x180", type: "image/jpeg" }],
    shortcut: "/logo/edulogo.jpeg",
  },
  manifest: "/manifest.webmanifest",
  archives: [SITE_URL + "/shop"],
  assets: [SITE_URL + "/logo/edulogo.jpeg"],
  bookmarks: [SITE_URL + "/shop"],
  other: {
    "ai:purpose": "education e-commerce online courses",
    "ai:content-type": "educational marketplace",
    "llms-txt": SITE_URL + "/llms.txt",
    "theme-color": "#2A74ED",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2A74ED" },
    { media: "(prefers-color-scheme: dark)", color: "#242424" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light",
};

const SITE = SITE_URL;

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE + "/#website",
  name: SITE_NAME,
  alternateName: "EduBazar",
  url: SITE,
  description: SITE_DESCRIPTION,
  inLanguage: "en-IN",
  publisher: { "@id": SITE + "/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: SITE + "/shop?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": SITE + "/#organization",
  name: SITE_NAME,
  alternateName: "EduBazar",
  url: SITE,
  logo: {
    "@type": "ImageObject",
    url: SITE + "/logo/edulogo.jpeg",
    width: 512,
    height: 512,
    caption: SITE_NAME,
  },
  image: SITE + "/logo/edulogo.jpeg",
  description: SITE_DESCRIPTION,
  foundingDate: "2024-01-01",
  email: "edubazarshop@gmail.com",
  telephone: "+91-9759131256",
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+91-9759131256",
      contactType: "customer service",
      availableLanguage: ["en", "hi"],
      areaServed: "IN",
      contactOption: "TollFree",
    },
    {
      "@type": "ContactPoint",
      telephone: "+91-9759131256",
      contactType: "sales",
      availableLanguage: ["en", "hi"],
      areaServed: "IN",
    },
  ],
  sameAs: [
    "https://instagram.com/edubazarshop",
    "https://wa.me/919759131256",
    "https://www.youtube.com/@edubazarshop",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
    addressRegion: "India",
    addressLocality: "India",
  },
  knowsAbout: [
    "Ethical Hacking",
    "Programming",
    "Python",
    "JavaScript",
    "Stock Market Trading",
    "Digital Marketing",
    "Cyber Security",
    "Penetration Testing",
  ],
};

const jsonLdLocalBusiness = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": SITE + "/#store",
  name: SITE_NAME,
  url: SITE,
  image: SITE + "/logo/edulogo.jpeg",
  logo: SITE + "/logo/edulogo.jpeg",
  description: SITE_DESCRIPTION,
  priceRange: "₹49 - ₹999",
  telephone: "+91-9759131256",
  email: "edubazarshop@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
    addressRegion: "India",
    addressLocality: "India",
    postalCode: "110001",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "28.6139",
    longitude: "77.2090",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  paymentAccepted: "UPI, Google Pay, PhonePe, Paytm, Cash",
  currenciesAccepted: "INR",
  hasMap: "https://maps.google.com/?q=India",
  sameAs: ["https://instagram.com/edubazarshop", "https://wa.me/919759131256"],
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    { "@type": "ListItem", position: 2, name: "Shop", item: SITE + "/shop" },
    { "@type": "ListItem", position: 3, name: "About Us", item: SITE + "/about" },
    { "@type": "ListItem", position: 4, name: "Contact Us", item: SITE + "/contact" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jost.variable}>
      <head>
        <link rel="preconnect" href="https://zzkjeimlnawgrkuwbban.supabase.co" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="ai:purpose" content="education marketplace online courses" />
        <meta name="ai:content-type" content="courses books tools e-commerce" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="sitemap" type="application/xml" href={SITE + "/sitemap.xml"} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
        {/* Google tag (gtag.js) - G-EMKR761SSQ - single tag for entire site */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-EMKR761SSQ" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-EMKR761SSQ');`}</Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1" itemScope itemType="https://schema.org/WebPage">
            {children}
          </main>
          <Footer />
          <Toaster />
          <AIChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
