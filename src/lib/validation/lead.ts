import { z } from "zod";
import { LEAD_INTERESTS, type LeadInterest } from "@/lib/content/lead-options";
import { optionalText, vnPhone } from "./common";

export const LEAD_TYPES = ["CONTACT", "VIEWING", "PROPERTY_INQUIRY", "CONSIGNMENT"] as const;

export { LEAD_INTERESTS, type LeadInterest };

/** Lead gửi từ form công khai (POST /api/v1/leads và Server Action). */
export const leadInputSchema = z
  .object({
    type: z.enum(LEAD_TYPES).default("CONTACT"),
    name: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100, "Họ tên quá dài"),
    phone: z.preprocess((v) => (v === "" ? undefined : v), vnPhone.optional()),
    email: z.preprocess((v) => (v === "" ? undefined : v), z.email("Email không hợp lệ").max(150).optional()),
    message: optionalText(3000),
    interest: z
      .enum(Object.keys(LEAD_INTERESTS) as [LeadInterest, ...LeadInterest[]])
      .optional()
      .catch(undefined),
    propertySlug: optionalText(140),
    preferredDate: z
      .preprocess((v) => (v === "" ? undefined : v), z.iso.date("Ngày không hợp lệ").optional())
      .refine((d) => !d || new Date(d) >= new Date(new Date().toDateString()), "Ngày xem phải từ hôm nay trở đi"),
    preferredTime: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
        .optional(),
    ),
    tourType: z.enum(["in-person", "video"]).optional().catch(undefined),
    // ký gửi
    consignmentType: z.enum(["RENT", "SALE"]).optional().catch(undefined),
    propertyAddress: optionalText(250),
    expectedPrice: optionalText(100),
    sourcePage: optionalText(200),
    consent: z.preprocess(
      (v) => v === true || v === "on" || v === "true" || v === "1",
      z.literal(true, { error: "Bạn cần đồng ý để Tuyn liên hệ lại" }),
    ),
    // chống spam
    website: z.string().max(200).optional(), // honeypot — người dùng thật để trống
    formToken: z.string().max(200).optional(),
    turnstileToken: z.string().max(4000).optional(),
  })
  .refine((d) => d.phone || d.email, { message: "Vui lòng nhập số điện thoại hoặc email", path: ["phone"] })
  .refine((d) => d.type !== "VIEWING" || d.preferredDate, { message: "Vui lòng chọn ngày xem nhà", path: ["preferredDate"] })
  .refine((d) => d.type !== "CONSIGNMENT" || d.consignmentType, {
    message: "Vui lòng chọn hình thức ký gửi",
    path: ["consignmentType"],
  });

export type LeadInput = z.output<typeof leadInputSchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "DONE", "SPAM"]).optional(),
  adminNote: z.string().trim().max(2000).nullable().optional(),
});

export const leadListSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "DONE", "SPAM"]).optional().catch(undefined),
  type: z.enum(LEAD_TYPES).optional().catch(undefined),
  q: optionalText(100),
  page: z.preprocess((v) => (v ? Number(v) : 1), z.number().int().min(1).max(10000).catch(1)),
  limit: z.preprocess((v) => (v ? Number(v) : 20), z.number().int().min(1).max(100).catch(20)),
});
