import { z } from "zod";
import { imageSrcSchema, limitParam, optionalText, pageParam, slugSchema } from "./common";

export const postFilterSchema = z.object({
  q: optionalText(100),
  category: optionalText(140),
  tag: optionalText(140),
  page: pageParam,
  limit: limitParam(6, 50),
});
export type PostFilters = z.output<typeof postFilterSchema>;

const nullableText = (max: number) =>
  z.preprocess((v) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), z.string().trim().max(max).nullable());

export const postInputSchema = z.object({
  title: z.string().trim().min(5, "Tiêu đề tối thiểu 5 ký tự").max(200),
  slug: slugSchema.optional(),
  excerpt: nullableText(400),
  contentHtml: z.string().max(200_000).default(""),
  coverImage: z
    .object({ src: imageSrcSchema, alt: z.string().trim().max(200).nullable().default(null) })
    .nullable()
    .default(null),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  categorySlugs: z.array(slugSchema).max(10).default([]),
  authorName: nullableText(100),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  seoTitle: nullableText(70),
  seoDescription: nullableText(170),
  publishedAt: z.preprocess((v) => (v ? new Date(String(v)) : null), z.date().nullable()).optional(),
});
export type PostInput = z.output<typeof postInputSchema>;
// PATCH: bỏ giá trị mặc định — trường không gửi lên phải giữ nguyên (không xoá nội dung/ảnh/thẻ, không về nháp)
const { shape } = postInputSchema;
export const postPatchSchema = postInputSchema
  .extend({
    contentHtml: shape.contentHtml.unwrap(),
    coverImage: shape.coverImage.unwrap(),
    tags: shape.tags.unwrap(),
    categorySlugs: shape.categorySlugs.unwrap(),
    status: shape.status.unwrap(),
    featured: shape.featured.unwrap(),
  })
  .partial();
