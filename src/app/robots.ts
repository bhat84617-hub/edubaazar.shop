import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/checkout/", "/account/", "/login", "/register"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/checkout/"],
      },
    ],
    sitemap: "https://edubaazar.shop/sitemap.xml",
    host: "https://edubaazar.shop",
  };
}
