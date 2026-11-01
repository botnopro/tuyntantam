import { afterEach, describe, expect, it, vi } from "vitest";
import { formatTelegramMessage, sendTelegram } from "@/server/telegram";

describe("formatTelegramMessage", () => {
  it("escape chữ của khách, bỏ dòng trống, thêm link", () => {
    const text = formatTelegramMessage(
      "Khách mới — Liên hệ",
      [
        ["Họ tên", "<b>An</b> & co"],
        ["Email", null],
        ["Điện thoại", "  "],
        ["Lời nhắn", "dòng 1\ndòng 2"],
      ],
      "https://example.com/admin/khach-lien-he/1",
    );
    expect(text).toContain("<b>Họ tên:</b> &lt;b&gt;An&lt;/b&gt; &amp; co");
    expect(text).not.toContain("Email");
    expect(text).not.toContain("Điện thoại");
    expect(text).toContain("dòng 1\ndòng 2");
    expect(text).toContain('<a href="https://example.com/admin/khach-lien-he/1">');
  });

  it("cắt tin quá dài trong giới hạn Telegram", () => {
    expect(formatTelegramMessage("T", [["Lời nhắn", "x".repeat(5000)]]).length).toBeLessThanOrEqual(4096);
  });
});

describe("sendTelegram", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("không gửi khi thiếu biến môi trường", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendTelegram("hi")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
