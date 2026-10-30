import { describe, expect, it } from "vitest";
import { readJson } from "@/lib/api/respond";
import { memoryRateLimit } from "@/lib/security/rate-limit";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { looseSettingsSchema } from "@/lib/validation/settings";

describe("memoryRateLimit", () => {
  it("chặn khi vượt giới hạn và mở lại khi hết cửa sổ", () => {
    const t0 = 1_000_000;
    const key = `t-${Math.random()}`;
    expect(memoryRateLimit(key, 2, 60, t0).ok).toBe(true);
    expect(memoryRateLimit(key, 2, 60, t0).ok).toBe(true);
    expect(memoryRateLimit(key, 2, 60, t0).ok).toBe(false);
    expect(memoryRateLimit(key, 2, 60, t0 + 61_000).ok).toBe(true);
  });
});

describe("id heading", () => {
  it("giữ id dạng slug, bỏ id có thể ghi đè thuộc tính DOM", () => {
    expect(sanitizeRichText('<h2 id="muc-luc-1">A</h2>')).toBe('<h2 id="muc-luc-1">A</h2>');
    expect(sanitizeRichText('<h2 id="__proto__">A</h2>')).toBe("<h2>A</h2>");
    expect(sanitizeRichText('<h3 id="cookie x">A</h3>')).toBe("<h3>A</h3>");
  });
});

describe("cấu hình tự do (home/agent/donate)", () => {
  it("từ chối link javascript: và ảnh host lạ ở bất kỳ độ sâu nào", () => {
    expect(looseSettingsSchema.safeParse({ community: { url: "https://facebook.com/groups/x" } }).success).toBe(true);
    expect(looseSettingsSchema.safeParse({ community: { url: "javascript:alert(1)" } }).success).toBe(false);
    expect(looseSettingsSchema.safeParse({ items: [{ logo: { src: "https://evil.com/a.png" } }] }).success).toBe(false);
    expect(looseSettingsSchema.safeParse({ items: [{ logo: { src: "/images/a.png" } }] }).success).toBe(true);
  });
});

describe("readJson", () => {
  it("dừng đọc body chunked vượt giới hạn (không có Content-Length)", async () => {
    const big = new ReadableStream<Uint8Array>({
      pull(c) {
        c.enqueue(new Uint8Array(64_000).fill(32));
      },
    });
    const req = new Request("http://localhost/api", { method: "POST", body: big, duplex: "half" } as RequestInit);
    await expect(readJson(req, 200_000)).rejects.toMatchObject({ status: 413 });
  });

  it("đọc JSON bình thường", async () => {
    const req = new Request("http://localhost/api", { method: "POST", body: JSON.stringify({ a: 1 }) });
    await expect(readJson(req)).resolves.toEqual({ a: 1 });
  });
});
