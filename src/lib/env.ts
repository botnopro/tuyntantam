import "server-only";
import { z } from "zod";
import { siteUrl } from "@/lib/seo/url";

const optional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "Thiếu DATABASE_URL"),
  // Trống (hoặc localhost trên Vercel) → tên miền production của Vercel (xem siteUrl)
  APP_URL: z
    .url()
    .optional()
    .transform(() => siteUrl()),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET phải dài ít nhất 32 ký tự"),
  LEAD_NOTIFY_EMAIL: optional.pipe(z.email().optional()),
  RESEND_API_KEY: optional,
  MAIL_FROM: optional,
  BLOB_READ_WRITE_TOKEN: optional,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optional,
  TURNSTILE_SECRET_KEY: optional,
  CORS_ORIGINS: optional,
  // Nguồn IP client tin cậy: "vercel" hoặc "proxy" (nginx/Caddy nối IP vào cuối X-Forwarded-For)
  TRUST_PROXY: z.enum(["vercel", "proxy"]).default(process.env.VERCEL ? "vercel" : "proxy"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Cấu hình môi trường không hợp lệ — ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = () => process.env.NODE_ENV === "production";
