/**
 * Ánh xạ URL WordPress cũ (tuyntantam.com) → route mới. Dùng chung cho:
 * - scripts/seed.ts: viết lại link nội bộ trong HTML import
 * - next.config.ts: redirect 301 giữ SEO cho link cũ
 */

export const SERVICE_SLUGS = ["tu-van-thue-nha", "dan-khach-xem-nha", "tu-van-dau-tu", "tu-van-setup-noi-that"] as const;

/** Trang WP → route mới (khác đường dẫn). Trang giữ nguyên đường dẫn không cần liệt kê. */
export const PAGE_ROUTE_MAP: Record<string, string> = {
  "/lien-he-hop-tac": "/lien-he",
  "/donate": "/ung-ho",
  "/nguon-bds-thue": "/kho-nguon",
  "/nguon-bds-ban": "/kho-nguon",
  "/tin-tuc": "/blog",
  "/bat-dong-san": "/kho-nguon",
  "/trang-chu": "/",
  "/trang-chu-02": "/",
  "/maintenance-page": "/",
  ...Object.fromEntries(SERVICE_SLUGS.map((s) => [`/${s}`, `/dich-vu/${s}`])),
};

export const postPath = (slug: string) => `/blog/${slug}`;
export const categoryPath = (slug: string) => `/blog/danh-muc/${slug}`;
export const tagPath = (slug: string) => `/blog/the/${slug}`;
export const propertyPath = (slug: string) => `/kho-nguon/${slug}`;
export const servicePath = (slug: string) => `/dich-vu/${slug}`;

/**
 * Chuyển một href (tuyệt đối tới tuyntantam.com hoặc tương đối) sang route mới.
 * postSlugs: tập slug bài viết để nhận diện link dạng "/<slug>" hoặc "/blog/<slug>/.html".
 */
export function mapLegacyHref(href: string, postSlugs: ReadonlySet<string>): string {
  let path = href.trim();
  const abs = path.match(/^https?:\/\/(?:www\.)?tuyntantam\.com(\/[^?#]*)?([?#].*)?$/i);
  if (abs) path = (abs[1] || "/") + (abs[2] ?? "");
  if (!path.startsWith("/")) return href;

  // Tách tại ký tự ?/# đầu tiên (split theo mọi ?/# sẽ làm mất #hash khi có cả query)
  const cut = path.search(/[?#]/);
  const pathname = cut < 0 ? path : path.slice(0, cut);
  const suffix = cut < 0 ? "" : path.slice(cut);
  const clean = pathname.replace(/\/\.html$/, "").replace(/\/+$/, "") || "/";

  const blog = clean.match(/^\/blog\/([^/]+)$/);
  if (blog && postSlugs.has(blog[1]!)) return postPath(blog[1]!) + suffix;
  const bare = clean.match(/^\/([^/]+)$/);
  if (bare && postSlugs.has(bare[1]!)) return postPath(bare[1]!) + suffix;

  const cat = clean.match(/^\/danh-muc\/(?:.+\/)?([^/]+)$/);
  if (cat) return categoryPath(cat[1]!) + suffix;
  const tag = clean.match(/^\/the\/([^/]+)$/) ?? clean.match(/^\/tag\/([^/]+)$/);
  if (tag) return tagPath(tag[1]!) + suffix;

  if (PAGE_ROUTE_MAP[clean]) return PAGE_ROUTE_MAP[clean]! + (PAGE_ROUTE_MAP[clean]!.includes("#") ? "" : suffix);
  return clean + suffix;
}
