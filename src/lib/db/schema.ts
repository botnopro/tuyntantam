import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  bigint,
  numeric,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type ImageRef = {
  src: string;
  alt: string | null;
  width?: number | null;
  height?: number | null;
};

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const userRole = pgEnum("user_role", ["ADMIN", "EDITOR"]);
export const publishStatus = pgEnum("publish_status", ["draft", "published", "archived"]);
export const contentSource = pgEnum("content_source", ["import", "admin"]);
export const listingType = pgEnum("listing_type", ["RENT", "SALE"]);
export const leadType = pgEnum("lead_type", ["CONTACT", "VIEWING", "PROPERTY_INQUIRY", "CONSIGNMENT"]);
export const leadStatus = pgEnum("lead_status", ["NEW", "IN_PROGRESS", "DONE", "SPAM"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("EDITOR"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 của token trong cookie; token gốc không bao giờ lưu
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    status: publishStatus("status").notNull().default("draft"),
    listingType: listingType("listing_type").notNull(),
    propertyType: text("property_type").notNull(),
    // VND. Thuê: giá/tháng; Bán: tổng giá. null = thoả thuận
    price: bigint("price", { mode: "number" }),
    priceNote: text("price_note"),
    area: numeric("area", { precision: 10, scale: 2, mode: "number" }),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    floors: integer("floors"),
    direction: text("direction"),
    furnishing: text("furnishing"),
    address: text("address"),
    ward: text("ward"),
    district: text("district"),
    city: text("city").notNull().default("Hà Nội"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    summary: text("summary"),
    descriptionHtml: text("description_html"),
    amenities: text("amenities")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    images: jsonb("images").$type<ImageRef[]>().notNull().default([]),
    videoYoutubeId: text("video_youtube_id"),
    virtualTourUrl: text("virtual_tour_url"),
    featured: boolean("featured").notNull().default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    source: contentSource("source").notNull().default("admin"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("properties_status_idx").on(t.status, t.publishedAt),
    index("properties_filter_idx").on(t.listingType, t.propertyType, t.district),
    index("properties_price_idx").on(t.price),
  ],
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  parentSlug: text("parent_slug"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    contentHtml: text("content_html").notNull().default(""),
    coverImage: jsonb("cover_image").$type<ImageRef | null>(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    authorName: text("author_name"),
    status: publishStatus("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    source: contentSource("source").notNull().default("admin"),
    sourceUrl: text("source_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("posts_status_idx").on(t.status, t.publishedAt)],
);

export const postCategories = pgTable(
  "post_categories",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.categoryId] })],
);

// Trang nội dung tĩnh (giới thiệu, môi giới, đầu tư, liên hệ, kho nguồn, donate...)
export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  contentHtml: text("content_html").notNull().default(""),
  images: jsonb("images").$type<ImageRef[]>().notNull().default([]),
  isPlaceholder: boolean("is_placeholder").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  source: contentSource("source").notNull().default("admin"),
  sourceUrl: text("source_url"),
  ...timestamps,
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  contentHtml: text("content_html").notNull().default(""),
  image: jsonb("image").$type<ImageRef | null>(),
  icon: text("icon"),
  isPlaceholder: boolean("is_placeholder").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  source: contentSource("source").notNull().default("admin"),
  sourceUrl: text("source_url"),
  ...timestamps,
});

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: leadType("type").notNull().default("CONTACT"),
    status: leadStatus("status").notNull().default("NEW"),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    message: text("message"),
    interest: text("interest"),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
    preferredDate: date("preferred_date"),
    preferredTime: text("preferred_time"),
    tourType: text("tour_type"),
    // Thông tin ký gửi: loại hình, địa chỉ, giá mong muốn...
    details: jsonb("details").$type<Record<string, string>>(),
    sourcePage: text("source_page"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    adminNote: text("admin_note"),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    handledBy: uuid("handled_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("leads_status_idx").on(t.status, t.createdAt)],
);

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  alt: text("alt"),
  mime: text("mime").notNull(),
  bytes: integer("bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(0),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("rate_limits_reset_idx").on(t.resetAt)],
);

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Lead = typeof leads.$inferSelect;
