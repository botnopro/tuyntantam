import { readFileSync } from "node:fs";
import type { NextConfig } from "next";
import { PAGE_ROUTE_MAP, SERVICE_SLUGS } from "./src/lib/content/routes";
import { siteUrl } from "./src/lib/seo/url";

const isDev = process.env.NODE_ENV !== "production";
// HSTS + upgrade-insecure-requests chỉ khi site chạy https (tránh gãy khi chạy bản production trên http://localhost)
const isHttps = siteUrl().startsWith("https://");
if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(process.env.APP_URL ?? "")) {
  console.warn(`⚠ APP_URL=${process.env.APP_URL} bị bỏ qua trên Vercel — dùng ${siteUrl()}. Hãy xoá hoặc sửa biến APP_URL.`);
}

// Slug bài viết import từ WordPress — để redirect 301 các URL cũ (/blog/<slug>/.html, /<slug>)
const legacyPostSlugs: string[] = (() => {
  try {
    return (JSON.parse(readFileSync("./data/posts.json", "utf8")) as { slug: string }[]).map((p) => p.slug);
  } catch {
    return [];
  }
})();

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.tile.openstreetmap.org https://i.ytimg.com",
  "font-src 'self' data:",
  "media-src 'self' https://tuyntantam.com",
  "frame-src https://www.google.com https://www.youtube-nocookie.com https://my.matterport.com https://kuula.co https://challenges.cloudflare.com",
  `connect-src 'self' https://challenges.cloudflare.com${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ...(isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
    // Ít worker hơn khi prerender: mỗi worker mở pool kết nối DB; tránh quá tải máy build nhỏ
    cpus: Number(process.env.NEXT_BUILD_CPUS) || 3,
    staticGenerationMinPagesPerWorker: 25,
    staticGenerationMaxConcurrency: 8,
    staticGenerationRetryCount: 1,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      // Trang quản trị chứa dữ liệu khách: không cho trình duyệt/proxy lưu cache
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
    ];
  },
  async redirects() {
    const pageRedirects = Object.entries(PAGE_ROUTE_MAP)
      .filter(([from]) => !SERVICE_SLUGS.some((s) => from === `/${s}`))
      .map(([source, destination]) => ({ source, destination, permanent: true }));
    return [
      ...pageRedirects,
      ...SERVICE_SLUGS.map((s) => ({ source: `/${s}`, destination: `/dich-vu/${s}`, permanent: true })),
      ...legacyPostSlugs.flatMap((slug) => [
        { source: `/${slug}`, destination: `/blog/${slug}`, permanent: true },
        { source: `/blog/${slug}/.html`, destination: `/blog/${slug}`, permanent: true },
      ]),
      { source: "/danh-muc/:parent/:slug", destination: "/blog/danh-muc/:slug", permanent: true },
      { source: "/danh-muc/:slug", destination: "/blog/danh-muc/:slug", permanent: true },
      { source: "/the/:slug", destination: "/blog/the/:slug", permanent: true },
      { source: "/author/:slug", destination: "/gioi-thieu", permanent: true },
      { source: "/feed", destination: "/blog", permanent: false },
      // Đổi tên mục: Tin tức → Blog, Bất động sản → Kho nguồn
      { source: "/tin-tuc/:path*", destination: "/blog/:path*", permanent: true },
      { source: "/bat-dong-san/:path*", destination: "/kho-nguon/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
