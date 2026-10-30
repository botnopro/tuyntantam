/**
 * URL công khai của site. Ưu tiên APP_URL; trên Vercel nếu chưa đặt thì dùng tên miền production
 * Vercel cấp (tự chuyển sang tên miền riêng khi đã gắn) — tránh canonical/sitemap trỏ về localhost.
 */
export function siteUrl(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (process.env.APP_URL || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}
