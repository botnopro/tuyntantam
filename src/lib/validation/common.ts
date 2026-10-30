import { z } from "zod";

// Thông báo lỗi mặc định bằng tiếng Việt
z.config(z.locales.vi());

/**
 * Đường dẫn ảnh: chỉ ảnh nội bộ ("/...") hoặc Vercel Blob — đúng các nguồn next/image được cấu hình.
 * Nguồn khác làm next/image ném lỗi lúc render → sập cả trang chủ/danh sách.
 */
export const IMAGE_SRC_RE = /^(\/(?!\/)|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/)/i;
export const imageSrcSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => IMAGE_SRC_RE.test(v), "Ảnh phải tải lên qua trang quản trị (đường dẫn /... hoặc Vercel Blob)");

/** Chuỗi tuỳ chọn: chuỗi rỗng → undefined */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Số nguyên dương từ query string; rỗng/không hợp lệ → undefined */
export const optionalInt = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(min).max(max).optional());

export const optionalNumber = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().min(min).max(max).optional());

export const pageParam = z.preprocess((v) => (v === "" || v == null ? 1 : Number(v)), z.number().int().min(1).max(1000).catch(1));

export const limitParam = (def: number, max = 50) =>
  // Quá giới hạn → kẹp về max; không hợp lệ → mặc định
  z.preprocess((v) => (v === "" || v == null ? def : Math.min(max, Math.trunc(Number(v)))), z.number().int().min(1).max(max).catch(def));

/** Số điện thoại VN: 0xxxxxxxxx hoặc +84xxxxxxxxx (cho phép dấu chấm/cách) */
export const vnPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.\-()]/g, ""))
  .pipe(z.string().regex(/^(?:\+?84|0)(?:3|5|7|8|9|2\d)\d{7,8}$/, "Số điện thoại không hợp lệ"));

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang");

export const uuidSchema = z.uuid();

/** Đổi URLSearchParams / searchParams object thành object phẳng (lấy giá trị đầu) */
export function flattenParams(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
  multi: string[] = [],
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  if (input instanceof URLSearchParams) {
    for (const key of new Set(input.keys())) {
      out[key] = multi.includes(key) ? input.getAll(key) : (input.get(key) ?? undefined);
    }
    return out;
  }
  for (const [k, v] of Object.entries(input)) {
    out[k] = multi.includes(k) ? (Array.isArray(v) ? v : v ? [v] : []) : Array.isArray(v) ? v[0] : v;
  }
  return out;
}
