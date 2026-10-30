// Áp migration SQL trong ./drizzle — dùng ở production/Docker (không cần drizzle-kit).
// DATABASE_URL_UNPOOLED (Neon direct) được ưu tiên, sau đó tới DATABASE_URL.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// Build Preview trên Vercel (nhánh chưa merge) không được đổi schema DB production;
// muốn migrate DB riêng của Preview (Neon branch) thì đặt MIGRATE_ON_PREVIEW=1
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" && process.env.MIGRATE_ON_PREVIEW !== "1") {
  console.log(`Bỏ qua migration (VERCEL_ENV=${process.env.VERCEL_ENV})`);
  process.exit(0);
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("Thiếu DATABASE_URL");
  process.exit(1);
}
const isLocal = /@(localhost|127\.0\.0\.1|db)[:/]/.test(url);
const pool = new pg.Pool({ connectionString: url, max: 1, ssl: isLocal ? false : { rejectUnauthorized: true } });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("✓ Đã áp migration");
} catch (err) {
  console.error("Migration thất bại:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
