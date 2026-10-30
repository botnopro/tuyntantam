import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __ttPool?: Pool; __ttDb?: Db };

function createPool() {
  const url = env().DATABASE_URL;
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    // Một truy vấn treo không giữ kết nối mãi (pool chỉ có 5 kết nối)
    statement_timeout: 8_000,
    query_timeout: 10_000,
    // Docker nội bộ (vd. @db:5432) dùng ?sslmode=disable; còn lại bắt buộc TLS có xác thực
    ssl: isLocal || /sslmode=disable/.test(url) ? false : { rejectUnauthorized: true },
  });
  // Kết nối rảnh bị DB cắt (Neon tự ngủ, restart, mạng chập chờn) → chỉ log; không có listener Node sẽ crash
  pool.on("error", (e) => console.error("[db] idle client error:", e.message));
  // Vercel Fluid: đóng kết nối rảnh trước khi function bị tạm dừng (không rò kết nối Neon); ngoài Vercel không làm gì
  attachDatabasePool(pool);
  return pool;
}

export function getDb(): Db {
  if (!globalForDb.__ttDb) {
    globalForDb.__ttPool = createPool();
    globalForDb.__ttDb = drizzle(globalForDb.__ttPool, { schema });
  }
  return globalForDb.__ttDb;
}

export { schema };
