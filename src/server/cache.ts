import "server-only";
import { revalidateTag } from "next/cache";

// Không dùng "use cache: remote": đo trên Vercel (31/10/2026) lần trúng cache remote ~0,8 s, chậm hơn truy vấn DB trực tiếp.
export const TAGS = {
  settings: "settings",
  posts: "posts",
  post: (slug: string) => `post:${slug}`,
  categories: "categories",
  properties: "properties",
  property: (slug: string) => `property:${slug}`,
  pages: "pages",
  page: (slug: string) => `page:${slug}`,
  services: "services",
} as const;

/** Huỷ cache ngay (không phục vụ bản cũ) — dùng sau thao tác admin để thấy thay đổi tức thì. */
export function invalidate(...tags: string[]) {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}
