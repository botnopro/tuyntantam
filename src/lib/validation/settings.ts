import { z } from "zod";
import { IMAGE_SRC_RE, imageSrcSchema } from "./common";

const text = (max: number) => z.string().trim().max(max);
const nullableText = (max: number) =>
  z.preprocess((v) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), z.string().trim().max(max).nullable());
const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^https:\/\//.test(v), "Đường dẫn phải bắt đầu bằng https://");
const nullableUrl = z.preprocess((v) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), httpsUrl.nullable());
// Đường dẫn nội bộ ("/...") hoặc https — chặn javascript:, data:, //host
const safeHref = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//.test(v), "Chỉ nhận đường dẫn /... hoặc https://");
const imageRef = z.object({
  src: imageSrcSchema,
  alt: z.string().trim().max(200).nullable(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

/** Phần cấu hình site admin được sửa (site_settings["site"]). */
export const siteSettingsSchema = z.object({
  name: text(100).min(2),
  tagline: text(200),
  description: text(400),
  logo: imageRef,
  logoFooter: imageRef.nullable(),
  contacts: z.object({
    phone: text(20).regex(/^\+?\d{8,15}$/, "Số điện thoại chỉ gồm chữ số"),
    phoneDisplay: text(30).min(8),
    phoneE164: text(20).regex(/^\+\d{8,15}$/, "Dạng +84xxxxxxxxx"),
    emails: z.array(z.email()).min(1).max(5),
    primaryEmail: z.email(),
    zalo: nullableUrl,
    address: nullableText(250),
    area: nullableText(120),
  }),
  socials: z
    .array(
      z.object({
        platform: z.enum(["facebook", "x", "youtube", "telegram", "zalo", "tiktok", "instagram"]),
        url: httpsUrl,
        label: text(60),
      }),
    )
    .max(10),
  community: z.object({ text: text(200), url: httpsUrl, buttonLabel: text(60) }).nullable(),
  propertySources: z.object({ rentGroupUrl: nullableUrl, saleGroupUrl: nullableUrl }),
  footerDonate: z.object({ text: text(400), url: safeHref(200), buttonImage: imageRef.nullable() }).nullable(),
  copyright: text(200),
  seo: z.object({ title: text(70).min(5), description: text(170), ogImage: nullableText(500) }),
});

export type SiteSettingsInput = z.output<typeof siteSettingsSchema>;

/** Kiểm tra lỏng cho các khoá còn lại (home/agent/donate) — cấu trúc tự do nhưng giới hạn kích thước. */
const SAFE_LINK_RE = /^(\/(?!\/)|https:\/\/|mailto:|tel:|#)/i;

/** Duyệt toàn bộ giá trị: trường url/href phải là link an toàn, trường src phải là ảnh hợp lệ. */
function unsafeLinkPath(value: unknown, path = ""): string | null {
  if (Array.isArray(value)) {
    for (const [i, v] of value.entries()) {
      const bad = unsafeLinkPath(v, `${path}[${i}]`);
      if (bad) return bad;
    }
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const here = path ? `${path}.${k}` : k;
      if (typeof v === "string" && v) {
        if (/^(url|href)$/i.test(k) && !SAFE_LINK_RE.test(v.trim())) return here;
        if (k === "src" && !IMAGE_SRC_RE.test(v.trim())) return here;
      }
      const bad = unsafeLinkPath(v, here);
      if (bad) return bad;
    }
  }
  return null;
}

export const looseSettingsSchema = z
  .record(z.string(), z.unknown())
  .refine((v) => JSON.stringify(v).length < 200_000, "Dữ liệu quá lớn")
  .superRefine((v, ctx) => {
    const bad = unsafeLinkPath(v);
    if (bad) ctx.addIssue({ code: "custom", message: `Đường dẫn không hợp lệ ở "${bad}"` });
  });

export const SETTINGS_KEYS = ["site", "home", "agent", "donate"] as const;
