import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/** DB riêng cho test — KHÔNG trỏ vào DB dev `tuyntantam` (test sẽ TRUNCATE bảng). */
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://tuyn:tuyn_local_dev@localhost:5432/tuyntantam_test";

export default defineConfig({
  resolve: {
    alias: {
      "@": r("./src"),
      // "server-only" ném lỗi ngoài điều kiện react-server — thay bằng module rỗng khi test
      "server-only": r("./tests/stubs/empty.ts"),
    },
  },
  test: {
    environment: "node",
    // NODE_ENV do Vitest đặt là "test"
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      APP_URL: "http://localhost:3000",
      SESSION_SECRET: "test-session-secret-chi-dung-cho-vitest-0123456789",
      // Tắt dịch vụ ngoài trong test
      TURNSTILE_SECRET_KEY: "",
      RESEND_API_KEY: "",
      BLOB_READ_WRITE_TOKEN: "",
      LEAD_NOTIFY_EMAIL: "",
      CORS_ORIGINS: "",
    },
    setupFiles: ["./tests/setup/next-mocks.ts"],
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/unit/**/*.test.ts"] },
      },
      {
        extends: true,
        test: {
          name: "api",
          include: ["tests/api/**/*.test.ts"],
          globalSetup: ["./tests/setup/global-db.ts"],
          // Các file dùng chung một DB test → chạy tuần tự
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
