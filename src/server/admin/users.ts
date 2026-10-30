import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, rotateAllSessions } from "@/lib/auth/session";
import { rateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/request";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_SEC = 15 * 60;
// Chặn đổi email liên tục để dò mật khẩu / làm tốn RAM-CPU (argon2 ~19 MB mỗi lần)
const LOGIN_IP_LIMIT = 20;
const LOGIN_ACCOUNT_LIMIT = 30;
const MAX_CONCURRENT_VERIFY = 4;
let verifying = 0;

export type LoginResult = { ok: true } | { ok: false; message: string };

/** Đăng nhập: giới hạn 5 lần/15 phút theo IP+email, thông báo lỗi chung, thời gian đồng đều. */
export async function login(emailRaw: string, password: string, ip: string, userAgent: string | null): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase().slice(0, 200);
  const key = `login:${hashIp(ip)}:${email}`;
  const [rl, rlIp, rlAccount] = await Promise.all([
    rateLimit(key, LOGIN_LIMIT, LOGIN_WINDOW_SEC),
    rateLimit(`login-ip:${hashIp(ip)}`, LOGIN_IP_LIMIT, LOGIN_WINDOW_SEC),
    rateLimit(`login-acct:${email}`, LOGIN_ACCOUNT_LIMIT, 60 * 60),
  ]);
  if (!rl.ok || !rlIp.ok || !rlAccount.ok) return { ok: false, message: "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút." };
  if (verifying >= MAX_CONCURRENT_VERIFY) return { ok: false, message: "Hệ thống đang bận, vui lòng thử lại sau ít giây." };

  const [user] = await getDb().select().from(users).where(eq(users.email, email)).limit(1);
  verifying++;
  let valid: boolean;
  try {
    valid = await verifyPassword(user?.passwordHash, password);
  } finally {
    verifying--;
  }
  if (!user || !valid) return { ok: false, message: "Email hoặc mật khẩu không đúng" };

  await resetRateLimit(key);
  await getDb().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id, userAgent);
  return { ok: true };
}

export async function changePassword(userId: string, current: string, next: string, userAgent: string | null): Promise<LoginResult> {
  // Phiên bị đánh cắp không được dùng ô "mật khẩu hiện tại" để dò mật khẩu
  const rl = await rateLimit(`pwchange:${userId}`, LOGIN_LIMIT, LOGIN_WINDOW_SEC);
  if (!rl.ok) return { ok: false, message: "Nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút." };
  const [user] = await getDb().select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !(await verifyPassword(user.passwordHash, current))) return { ok: false, message: "Mật khẩu hiện tại không đúng" };
  await getDb()
    .update(users)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(users.id, userId));
  await resetRateLimit(`pwchange:${userId}`);
  await rotateAllSessions(userId, userAgent);
  return { ok: true };
}

export async function listUsers() {
  return getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));
}

export async function createUser(input: { email: string; name: string; password: string; role: "ADMIN" | "EDITOR" }) {
  const email = input.email.trim().toLowerCase();
  const [exists] = await getDb().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists) return { ok: false as const, message: "Email đã được sử dụng" };
  await getDb()
    .insert(users)
    .values({ email, name: input.name.trim(), passwordHash: await hashPassword(input.password), role: input.role });
  return { ok: true as const };
}

export async function deleteUser(id: string, actorId: string) {
  if (id === actorId) return { ok: false as const, message: "Không thể xoá chính tài khoản đang đăng nhập" };
  const all = await listUsers();
  const target = all.find((u) => u.id === id);
  if (!target) return { ok: false as const, message: "Không tìm thấy tài khoản" };
  if (target.role === "ADMIN" && all.filter((u) => u.role === "ADMIN").length <= 1) {
    return { ok: false as const, message: "Phải còn ít nhất một quản trị viên" };
  }
  await getDb().delete(users).where(eq(users.id, id));
  return { ok: true as const };
}
