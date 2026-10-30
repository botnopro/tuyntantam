import { z } from "zod";
import { PROPERTY_TYPE_KEYS, SORT_OPTIONS, type SortKey } from "@/lib/content/property-options";
import { imageSrcSchema, limitParam, optionalInt, optionalNumber, optionalText, pageParam, slugSchema } from "./common";

const sortKeys = Object.keys(SORT_OPTIONS) as [SortKey, ...SortKey[]];

/** Bộ lọc danh sách BĐS — dùng cho trang /kho-nguon và GET /api/v1/properties */
export const propertyFilterSchema = z.object({
  q: optionalText(100),
  listingType: z.enum(["RENT", "SALE"]).optional().catch(undefined),
  type: z.enum(PROPERTY_TYPE_KEYS).optional().catch(undefined),
  district: optionalText(60),
  minPrice: optionalNumber(0, 1e13),
  maxPrice: optionalNumber(0, 1e13),
  minArea: optionalNumber(0, 1e6),
  maxArea: optionalNumber(0, 1e6),
  bedrooms: optionalInt(0, 20),
  bathrooms: optionalInt(0, 20),
  amenities: z
    .preprocess((v) => (v == null ? [] : Array.isArray(v) ? v : [v]), z.array(z.string().trim().min(1).max(60)).max(20))
    .catch([]),
  featured: z
    .preprocess((v) => v === "1" || v === "true" || v === true, z.boolean())
    .optional()
    .catch(undefined),
  sort: z.enum(sortKeys).catch("newest").default("newest"),
  page: pageParam,
  limit: limitParam(12, 50),
});

export type PropertyFilters = z.output<typeof propertyFilterSchema>;

const imageSchema = z.object({
  src: imageSrcSchema,
  alt: z.string().trim().max(200).nullable().default(null),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

const nullableInt = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(min).max(max).nullable());
const nullableNum = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(min).max(max).nullable());
const nullableText = (max: number) =>
  z.preprocess((v) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), z.string().trim().max(max).nullable());

/** Dữ liệu tạo/sửa BĐS (admin) */
const propertyBaseSchema = z.object({
  title: z.string().trim().min(5, "Tiêu đề tối thiểu 5 ký tự").max(200),
  slug: slugSchema.optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  listingType: z.enum(["RENT", "SALE"]),
  propertyType: z.enum(PROPERTY_TYPE_KEYS),
  price: nullableNum(0, 1e13),
  priceNote: nullableText(100),
  area: nullableNum(0, 1e6),
  bedrooms: nullableInt(0, 50),
  bathrooms: nullableInt(0, 50),
  floors: nullableInt(0, 200),
  direction: nullableText(50),
  furnishing: nullableText(50),
  address: nullableText(250),
  ward: nullableText(80),
  district: nullableText(80),
  city: z.string().trim().min(1).max(80).default("Hà Nội"),
  lat: nullableNum(-90, 90),
  lng: nullableNum(-180, 180),
  summary: nullableText(500),
  descriptionHtml: nullableText(50_000),
  amenities: z.array(z.string().trim().min(1).max(60)).max(50).default([]),
  images: z.array(imageSchema).max(40).default([]),
  videoYoutubeId: nullableText(200),
  virtualTourUrl: nullableText(500),
  featured: z.boolean().default(false),
  seoTitle: nullableText(70),
  seoDescription: nullableText(170),
});

const geoPair = (d: { lat?: number | null; lng?: number | null }) => (d.lat == null) === (d.lng == null);
const geoMessage = { message: "Cần nhập cả vĩ độ và kinh độ", path: ["lat"] };

export const propertyInputSchema = propertyBaseSchema.refine(geoPair, geoMessage);
export type PropertyInput = z.output<typeof propertyInputSchema>;
// PATCH: bỏ giá trị mặc định — trường không gửi lên phải giữ nguyên (không reset status/ảnh/tiện ích...)
const { shape } = propertyBaseSchema;
export const propertyPatchSchema = propertyBaseSchema
  .extend({
    status: shape.status.unwrap(),
    city: shape.city.unwrap(),
    amenities: shape.amenities.unwrap(),
    images: shape.images.unwrap(),
    featured: shape.featured.unwrap(),
  })
  .partial()
  .refine(geoPair, geoMessage);
