import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { sessions, users, type User } from "@/lib/db/schema";
import { isProd } from "@/lib/env";

const SESSION_DAYS = 7;
const RENEW_WHEN_LEFT_MS = 3 * 24 * 60 * 60 * 1000;
// Tuổi tối đa tuyệt đối: gia hạn trượt không giữ một phiên (có thể đã lộ) sống mãi
const SESSION_MAX_AGE_MS = 30 * 86_400_000;

export const SESSION_COOKIE = isProd() ? "__Host-tt_session" : "tt_session";

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function createSession(userId: string, userAgent?: string | null): Promise<void> {
  const jar = await cookies();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  // Dọn phiên hết hạn (đăng nhập hiếm nên chi phí không đáng kể)
  await getDb().delete(sessions).where(lt(sessions.expiresAt, new Date()));
  // Phiên cũ trên trình duyệt này (nếu có) bị thay thế, không để lại token còn hiệu lực
  const previous = jar.get(SESSION_COOKIE)?.value;
  if (previous && previous.length <= 100)
    await getDb()
      .delete(sessions)
      .where(eq(sessions.id, hashToken(previous)));
  await getDb()
    .insert(sessions)
    .values({ id: hashToken(token), userId, expiresAt, userAgent: userAgent?.slice(0, 300) ?? null });
  jar.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/** Đọc phiên hiện tại (request-time). Gia hạn trượt khi còn < 3 ngày. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  // Đánh dấu render tại request trước khi dùng new Date()/Date.now() (Cache Components báo lỗi khi prerender)
  await connection();
  const id = hashToken(token);
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      expiresAt: sessions.expiresAt,
      createdAt: sessions.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date()), gt(sessions.createdAt, new Date(Date.now() - SESSION_MAX_AGE_MS))))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() - Date.now() < RENEW_WHEN_LEFT_MS) {
    // Không gia hạn quá tuổi tối đa của phiên
    const expiresAt = new Date(Math.min(Date.now() + SESSION_DAYS * 86_400_000, row.createdAt.getTime() + SESSION_MAX_AGE_MS));
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
    try {
      jar.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
    } catch {
      // Không ghi được cookie khi đang render Server Component — sẽ gia hạn ở request sau
    }
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
});

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token)
    await getDb()
      .delete(sessions)
      .where(eq(sessions.id, hashToken(token)));
  jar.delete(SESSION_COOKIE);
}

/** Đổi mật khẩu: xoá mọi phiên của user (kể cả phiên hiện tại) rồi cấp phiên mới cho trình duyệt đang dùng. */
export async function rotateAllSessions(userId: string, userAgent?: string | null): Promise<void> {
  await getDb().delete(sessions).where(eq(sessions.userId, userId));
  await createSession(userId, userAgent);
}
