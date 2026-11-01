import { describe, expect, it } from "vitest";
import { pastedToHtml, plainTextToHtml } from "@/components/admin/paste-html";

describe("plainTextToHtml", () => {
  it("giữ từng dòng (<br>) và tách đoạn ở dòng trống", () => {
    const text = "🏠 Phòng studio Cầu Giấy\n💰 Giá: 4tr5\n\n✅ Full đồ\r\n✅ Giờ tự do";
    expect(plainTextToHtml(text)).toBe("<p>🏠 Phòng studio Cầu Giấy<br>💰 Giá: 4tr5</p><p>✅ Full đồ<br>✅ Giờ tự do</p>");
  });

  it("escape ký tự HTML, bỏ đoạn rỗng", () => {
    expect(plainTextToHtml("Giá < 5tr & <b>đẹp</b>\n\n\n   \n")).toBe("<p>Giá &lt; 5tr &amp; &lt;b&gt;đẹp&lt;/b&gt;</p>");
  });
});

describe("pastedToHtml", () => {
  it("không có HTML → dùng chữ thuần", () => {
    expect(pastedToHtml("", "A\nB")).toBe("<p>A<br>B</p>");
  });

  it("HTML mất xuống dòng (chỉ <span>) → quay về chữ thuần", () => {
    // test chạy trong Node (không có DOMParser) → giả lập tối thiểu
    const g = globalThis as Record<string, unknown>;
    const had = "DOMParser" in g;
    if (!had) {
      g.Node = { TEXT_NODE: 3, ELEMENT_NODE: 1 };
      g.DOMParser = class {
        parseFromString(html: string) {
          const text = { nodeType: 3, textContent: html.replace(/<[^>]*>/g, ""), childNodes: [] };
          return { body: { childNodes: [text] } };
        }
      };
    }
    try {
      expect(pastedToHtml("<span>Dòng 1 Dòng 2 Dòng 3</span>", "Dòng 1\nDòng 2\nDòng 3")).toBe("<p>Dòng 1<br>Dòng 2<br>Dòng 3</p>");
    } finally {
      if (!had) {
        delete g.DOMParser;
        delete g.Node;
      }
    }
  });

  it("không có gì để dán → chuỗi rỗng (để trình duyệt xử lý, ví dụ dán ảnh)", () => {
    expect(pastedToHtml("", "")).toBe("");
  });
});
