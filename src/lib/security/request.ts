import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * IP client — chỉ tin header do proxy của mình đặt, để không ai giả IP vượt rate limit.
 * - Vercel (tự nhận qua biến VERCEL): x-real-ip / x-forwarded-for do Vercel ghi đè.
 * - Docker/VPS sau nginx/Caddy (TRUST_PROXY=proxy, mặc định): phần tử CUỐI của x-forwarded-for
 *   (proxy nối IP thật vào cuối; phần đầu client tự gửi được).
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (env().TRUST_PROXY === "vercel") {
    return headers.get("x-real-ip")?.trim() || xff?.split(",")[0]!.trim() || "unknown";
  }
  const last = xff?.split(",").at(-1)?.trim();
  return last || headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${env().SESSION_SECRET}:ip:${ip}`).digest("hex").slice(0, 32);
}

function allowedOrigins(): string[] {
  const { APP_URL, CORS_ORIGINS } = env();
  const extra =
    CORS_ORIGINS?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? [];
  return [new URL(APP_URL).origin, ...extra];
}

/**
 * Chống CSRF cho request thay đổi dữ liệu: Origin (hoặc Referer) phải khớp origin của site
 * hoặc Host của chính request (cho preview deploy).
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin =
    headers.get("origin") ??
    (() => {
      const ref = headers.get("referer");
      try {
        return ref ? new URL(ref).origin : null;
      } catch {
        return null;
      }
    })();
  if (!origin) return false;
  if (allowedOrigins().includes(origin)) return true;
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function corsHeaders(headers: Headers): Record<string, string> {
  const origin = headers.get("origin");
  if (origin && allowedOrigins().includes(origin)) {
    return { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  }
  return {};
}

/* ---------- Token chống spam cho form công khai ----------
 * Form nhận token = "<issuedAtMs>.<hmac>" khi render. Server chỉ chấp nhận nếu chữ ký đúng
 * và đã qua tối thiểu MIN_FILL_MS (bot gửi ngay lập tức) và chưa quá MAX_AGE_MS. */
const MIN_FILL_MS = 3_000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function sign(value: string): string {
  return createHmac("sha256", env().SESSION_SECRET).update(`form:${value}`).digest("base64url");
}

export function issueFormToken(now = Date.now()): string {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

export type FormTokenCheck = "ok" | "invalid" | "too_fast" | "expired";

export function verifyFormToken(token: string | null | undefined, now = Date.now()): FormTokenCheck {
  if (!token) return "invalid";
  const [ts, mac] = token.split(".");
  if (!ts || !mac || !/^\d{13}$/.test(ts)) return "invalid";
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const age = now - Number(ts);
  if (age < MIN_FILL_MS) return "too_fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}

export async function verifyTurnstile(token: string | null | undefined, ip: string): Promise<boolean> {
  const secret = env().TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5_000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function maskEmail(email?: string | null): string {
  if (!email) return "";
  const [u, d] = email.split("@");
  return `${u?.slice(0, 2)}***@${d ?? ""}`;
}
