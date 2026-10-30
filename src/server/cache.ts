import "server-only";
import { revalidateTag } from "next/cache";

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
