import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

export type RateLimitResult = { ok: boolean; remaining: number; resetAt: Date };

/**
 * Giới hạn tần suất cửa sổ cố định, lưu trên Postgres (dùng được trên serverless, không cần Redis).
 * Một câu UPSERT nguyên tử: hết cửa sổ thì đặt lại count = 1.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const db = getDb();
  const result = await db.execute<{ count: number; reset_at: Date }>(sql`
    INSERT INTO rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSec}))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
      reset_at = CASE WHEN rate_limits.reset_at < now() THEN now() + make_interval(secs => ${windowSec}) ELSE rate_limits.reset_at END
    RETURNING count, reset_at
  `);
  const row = result.rows[0]!;
  const count = Number(row.count);
  // Dọn bản ghi hết hạn thỉnh thoảng (~1% request) để bảng không phình
  if (Math.random() < 0.01) {
    await db.execute(sql`DELETE FROM rate_limits WHERE reset_at < now() - interval '1 day'`);
  }
  return { ok: count <= limit, remaining: Math.max(0, limit - count), resetAt: new Date(row.reset_at) };
}

export async function resetRateLimit(key: string): Promise<void> {
  await getDb().execute(sql`DELETE FROM rate_limits WHERE key = ${key}`);
}

/* ---------- Bộ đếm trong bộ nhớ cho request ĐỌC công khai ----------
 * Trang/API đọc đã được cache; ghi vào Postgres cho mỗi lượt GET sẽ biến lượt đọc rẻ thành lượt ghi DB.
 * Mỗi instance đếm riêng (đủ để chặn một nguồn spam), giới hạn số khoá để không phình RAM. */
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();
const MEMORY_MAX_KEYS = 10_000;

export function memoryRateLimit(key: string, limit: number, windowSec: number, now = Date.now()): RateLimitResult {
  let entry = memoryBuckets.get(key);
  if (!entry || entry.resetAt <= now) {
    if (memoryBuckets.size >= MEMORY_MAX_KEYS) {
      for (const [k, v] of memoryBuckets) if (v.resetAt <= now) memoryBuckets.delete(k);
      if (memoryBuckets.size >= MEMORY_MAX_KEYS) memoryBuckets.clear();
    }
    entry = { count: 0, resetAt: now + windowSec * 1000 };
    memoryBuckets.set(key, entry);
  }
  entry.count++;
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: new Date(entry.resetAt) };
}
