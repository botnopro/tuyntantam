import { createHash, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { properties, sessions, users, type NewProperty } from "@/lib/db/schema";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { setCookie } from "./request-context";

export const db = () => getDb();

/** Xoá dữ liệu giữa các test (chỉ chạy trên DB *_test — xem tests/setup/global-db.ts). */
export async function resetDb() {
  const name = new URL(process.env.DATABASE_URL!).pathname.slice(1);
  if (!name.endsWith("_test")) throw new Error(`Từ chối TRUNCATE trên DB không phải test: ${name}`);
  await getDb().execute(
    sql`truncate table leads, sessions, media, post_categories, posts, categories, properties, users, rate_limits restart identity cascade`,
  );
}

export async function closeDb() {
  const g = globalThis as unknown as { __ttPool?: { end(): Promise<void> }; __ttDb?: unknown };
  await g.__ttPool?.end();
  g.__ttPool = undefined;
  g.__ttDb = undefined;
}

let seq = 0;
/** Dữ liệu BĐS giả lập — CHỈ dùng trong test. */
export async function insertProperty(overrides: Partial<NewProperty> = {}) {
  seq += 1;
  const [row] = await getDb()
    .insert(properties)
    .values({
      slug: `bds-test-${seq}`,
      title: `BĐS test ${seq}`,
      status: "published",
      listingType: "RENT",
      propertyType: "can-ho",
      price: 10_000_000,
      district: "Quận A",
      publishedAt: new Date(Date.now() - seq * 1000),
      source: "import",
      ...overrides,
    })
    .returning();
  return row!;
}

/** Tạo user + phiên (token băm SHA-256 như session.ts) và đặt cookie phiên vào jar giả. */
export async function loginAs(role: "ADMIN" | "EDITOR") {
  const [user] = await getDb()
    .insert(users)
    .values({ email: `${role.toLowerCase()}-${randomBytes(4).toString("hex")}@test.local`, name: `Test ${role}`, passwordHash: "x", role })
    .returning();
  const token = randomBytes(32).toString("base64url");
  await getDb()
    .insert(sessions)
    .values({ id: createHash("sha256").update(token).digest("hex"), userId: user!.id, expiresAt: new Date(Date.now() + 7 * 86_400_000) });
  setCookie(SESSION_COOKIE, token);
  return user!;
}
