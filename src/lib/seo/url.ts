/**
 * URL công khai của site. Ưu tiên APP_URL; trên Vercel nếu chưa đặt thì dùng tên miền production
 * Vercel cấp (tự chuyển sang tên miền riêng khi đã gắn) — tránh canonical/sitemap trỏ về localhost.
 * Trên Vercel, APP_URL trỏ localhost (chép nhầm từ .env.example) bị bỏ qua.
 */
export function siteUrl(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const appUrl = process.env.APP_URL?.trim();
  const usable = appUrl && !(vercel && /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(appUrl)) ? appUrl : undefined;
  return (usable || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}
