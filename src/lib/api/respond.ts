import "server-only";
import { ZodError } from "zod";
import { AuthError, requireRole, type Role } from "@/lib/auth/guard";
import type { SessionUser } from "@/lib/auth/session";
import { memoryRateLimit, rateLimit } from "@/lib/security/rate-limit";
import { clientIp, corsHeaders, hashIp, isSameOrigin } from "@/lib/security/request";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function json<T>(data: T, init: { status?: number; meta?: Record<string, unknown>; headers?: HeadersInit } = {}) {
  return Response.json(init.meta ? { data, meta: init.meta } : { data }, {
    status: init.status ?? 200,
    headers: init.headers,
  });
}

export function apiError(status: number, code: string, message: string, details?: unknown, headers?: HeadersInit) {
  return Response.json({ error: { code, message, ...(details ? { details } : {}) } }, { status, headers });
}

type Ctx<P> = { params: Promise<P> };
type Options = {
  /** Vai trò tối thiểu; bỏ trống = công khai */
  role?: Role;
  /** Giới hạn request/phút/IP */
  rateLimit?: { limit: number; windowSec: number; bucket: string };
};

/**
 * Bọc route handler: rate limit, xác thực + phân quyền, kiểm tra Origin cho request ghi (CSRF),
 * và chuyển mọi lỗi về JSON không lộ stack trace.
 */
export function route<P = Record<string, string>>(
  opts: Options,
  handler: (req: Request, ctx: { params: P; user: SessionUser | null }) => Promise<Response>,
) {
  return async (req: Request, ctx: Ctx<P>): Promise<Response> => {
    const cors = corsHeaders(req.headers);
    try {
      const mutating = !["GET", "HEAD", "OPTIONS"].includes(req.method);
      if (mutating && !isSameOrigin(req.headers)) {
        throw new ApiError(403, "forbidden_origin", "Yêu cầu không hợp lệ (origin)");
      }
      if (opts.rateLimit) {
        const { limit, windowSec, bucket } = opts.rateLimit;
        const key = `${bucket}:${hashIp(clientIp(req.headers))}`;
        // Đọc: đếm trong bộ nhớ (không tốn lượt ghi DB); ghi: đếm trên Postgres (chung mọi instance)
        const rl = mutating ? await rateLimit(key, limit, windowSec) : memoryRateLimit(key, limit, windowSec);
        if (!rl.ok) {
          const retry = Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000));
          return apiError(429, "rate_limited", "Quá nhiều yêu cầu, vui lòng thử lại sau", undefined, {
            ...cors,
            "Retry-After": String(retry),
          });
        }
      }
      const user = opts.role ? await requireRole(opts.role) : null;
      const res = await handler(req, { params: await ctx.params, user });
      for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    } catch (err) {
      if (err instanceof ApiError) return apiError(err.status, err.code, err.message, err.details, cors);
      if (err instanceof AuthError) {
        return apiError(err.status, err.status === 401 ? "unauthorized" : "forbidden", err.message, undefined, cors);
      }
      if (err instanceof ZodError) {
        return apiError(400, "validation_error", "Tham số không hợp lệ", zodDetails(err.issues), cors);
      }
      if (err instanceof SyntaxError) return apiError(400, "invalid_json", "Dữ liệu JSON không hợp lệ", undefined, cors);
      console.error(`[api] ${req.method} ${new URL(req.url).pathname}:`, err instanceof Error ? err.message : err);
      return apiError(500, "internal_error", "Đã có lỗi xảy ra, vui lòng thử lại sau", undefined, cors);
    }
  };
}

/** Đọc JSON body có giới hạn kích thước. */
export async function readJson(req: Request, maxBytes = 200_000): Promise<unknown> {
  const tooLarge = () => new ApiError(413, "payload_too_large", "Dữ liệu gửi lên quá lớn");
  if (Number(req.headers.get("content-length") ?? 0) > maxBytes) throw tooLarge();
  if (!req.body) return {};
  // Đọc theo luồng, dừng ngay khi vượt giới hạn (body chunked không có Content-Length)
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw tooLarge();
    }
    chunks.push(value);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

export function zodDetails(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.map((i) => ({ field: i.path.map(String).join("."), message: i.message }));
}

export const PUBLIC_READ_LIMIT = { limit: 120, windowSec: 60, bucket: "api-read" } as const;
