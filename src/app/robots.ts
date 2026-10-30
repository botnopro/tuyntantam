import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/so-sanh", "/yeu-thich"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
