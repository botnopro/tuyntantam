/**
 * Tạo tài khoản quản trị hoặc đặt lại mật khẩu (khi quên mật khẩu).
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
 * Nếu email đã tồn tại: đặt lại mật khẩu, nâng vai trò ADMIN và đăng xuất mọi phiên của tài khoản đó.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { hashPassword, PASSWORD_MIN } from "@/lib/auth/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Đặt ADMIN_EMAIL hợp lệ");
  if (password.length < PASSWORD_MIN) throw new Error(`ADMIN_PASSWORD tối thiểu ${PASSWORD_MIN} ký tự`);

  const db = getDb();
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    await db.update(users).set({ passwordHash, role: "ADMIN" }).where(eq(users.id, existing.id));
    await db.delete(sessions).where(eq(sessions.userId, existing.id));
    console.log(`✓ Đã đặt lại mật khẩu cho ${email} (các phiên cũ đã bị đăng xuất)`);
  } else {
    await db.insert(users).values({ email, name: process.env.ADMIN_NAME?.trim() || "Quản trị viên", passwordHash, role: "ADMIN" });
    console.log(`✓ Đã tạo quản trị viên ${email}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Thất bại:", err instanceof Error ? err.message : err);
  process.exit(1);
});
