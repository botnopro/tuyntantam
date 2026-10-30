import { afterEach, vi } from "vitest";
import { clearCookies, cookieJar } from "../helpers/request-context";

// Next APIs không có ngữ cảnh request/cache khi chạy ngoài Next → thay bằng bản giả.
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/server", () => ({
  // Bỏ qua tác vụ sau phản hồi (gửi email thông báo)
  after: vi.fn(),
  connection: vi.fn(async () => undefined),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieJar),
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

afterEach(() => clearCookies());
