import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

/**
 * Chuẩn bị DB test (chạy một lần trước nhóm test "api"):
 * tạo database `tuyntantam_test` nếu chưa có rồi áp migration trong ./drizzle.
 */
const TEST_URL = process.env.TEST_DATABASE_URL ?? "postgres://tuyn:tuyn_local_dev@localhost:5432/tuyntantam_test";

export default async function setup() {
  const url = new URL(TEST_URL);
  const dbName = url.pathname.slice(1);
  if (!/_test$/.test(dbName)) {
    throw new Error(`DB test phải có hậu tố _test (đang là "${dbName}") — từ chối chạy để tránh xoá dữ liệu thật.`);
  }

  const adminUrl = new URL(TEST_URL);
  adminUrl.pathname = "/postgres";
  const admin = new Client({ connectionString: adminUrl.toString() });
  try {
    await admin.connect();
  } catch (e) {
    throw new Error(
      `Không kết nối được Postgres tại ${url.host} (${e instanceof Error ? e.message : e}). ` +
        "Chạy `docker compose up -d db` trước khi chạy test API.",
    );
  }
  try {
    const { rowCount } = await admin.query("select 1 from pg_database where datname = $1", [dbName]);
    if (!rowCount) await admin.query(`create database "${dbName}"`);
  } finally {
    await admin.end();
  }

  const client = new Client({ connectionString: TEST_URL });
  await client.connect();
  try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  } finally {
    await client.end();
  }
}
