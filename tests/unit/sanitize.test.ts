import { describe, expect, it } from "vitest";
import { extractYoutubeId, safeVirtualTourUrl, sanitizeRichText, stripTags } from "@/lib/security/sanitize";

describe("sanitizeRichText", () => {
  it("loại bỏ <script> cùng nội dung", () => {
    const out = sanitizeRichText("<p>Xin chào</p><script>alert(1)</script>");
    expect(out).toBe("<p>Xin chào</p>");
  });

  it("loại bỏ thuộc tính on*", () => {
    const out = sanitizeRichText('<p onclick="alert(1)">A</p><img src="https://x.com/a.jpg" onerror="alert(1)">');
    expect(out).not.toMatch(/onclick|onerror|alert/);
    expect(out).toContain('<img src="https://x.com/a.jpg" loading="lazy" />');
  });

  it("bỏ href javascript: / data:", () => {
    expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeRichText('<a href="JaVaScRiPt:alert(1)">x</a>')).toBe("<a>x</a>");
    expect(sanitizeRichText('<img src="data:image/svg+xml;base64,AAAA">')).not.toContain("data:");
  });

  it("loại bỏ iframe, SVG, style, form", () => {
    const out = sanitizeRichText(
      '<iframe src="https://evil.com"></iframe><svg onload="alert(1)"><circle /></svg><style>p{}</style><form><input></form><p>OK</p>',
    );
    expect(out).toBe("<p>OK</p>");
  });

  it("giữ các thẻ được phép", () => {
    const html =
      '<h2 id="muc-1">Tiêu đề</h2><p><strong>Đậm</strong> <em>nghiêng</em></p><ul><li>Một</li></ul><blockquote>Trích</blockquote><table><tbody><tr><td colspan="2">Ô</td></tr></tbody></table>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("link ngoài có target=_blank và rel=noopener noreferrer nofollow", () => {
    const out = sanitizeRichText('<a href="https://example.com/x" rel="dofollow">x</a>');
    expect(out).toBe('<a href="https://example.com/x" rel="noopener noreferrer nofollow" target="_blank">x</a>');
  });

  it("link nội bộ chỉ giữ href/title", () => {
    expect(sanitizeRichText('<a href="/lien-he" target="_blank" title="Liên hệ">x</a>')).toBe('<a href="/lien-he" title="Liên hệ">x</a>');
    expect(sanitizeRichText('<a href="https://tuyntantam.com/blog" target="_blank">x</a>')).toBe(
      '<a href="https://tuyntantam.com/blog">x</a>',
    );
  });

  it("giữ marker <p data-form> dù đoạn rỗng; bỏ đoạn rỗng khác", () => {
    expect(sanitizeRichText('<p data-form="lead"></p>')).toBe('<p data-form="lead"></p>');
    expect(sanitizeRichText("<p>  </p><p>Có chữ</p>")).toBe("<p>Có chữ</p>");
  });

  it("giữ xuống dòng của nội dung dán: <div> → <p>, <h1> → <h2>", () => {
    expect(sanitizeRichText("<div>Dòng 1</div><div>Dòng 2</div><h1>Tiêu đề</h1>")).toBe("<p>Dòng 1</p><p>Dòng 2</p><h2>Tiêu đề</h2>");
  });

  it("không cho id ở thẻ không phải heading", () => {
    expect(sanitizeRichText('<p id="x" class="y" style="color:red">A</p>')).toBe("<p>A</p>");
  });
});

describe("stripTags", () => {
  it("bỏ mọi thẻ và giải mã entity", () => {
    expect(stripTags('<p>Giá 5 &lt; 10 triệu &amp; "đẹp"</p>')).toBe('Giá 5 < 10 triệu & "đẹp"');
    expect(stripTags("<b>Xin</b> <i>chào</i><script>alert(1)</script>")).toBe("Xin chào");
    expect(stripTags("  <img src=x onerror=alert(1)>Tên  ")).toBe("Tên");
  });
});

describe("extractYoutubeId", () => {
  it.each([
    ["dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("nhận %s", (input, id) => {
    expect(extractYoutubeId(input)).toBe(id);
  });

  it.each([
    "https://evil.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ",
    "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=short",
    "javascript:alert(1)",
    "",
  ])("từ chối %s", (input) => {
    expect(extractYoutubeId(input)).toBeNull();
  });
});

describe("safeVirtualTourUrl", () => {
  it("chỉ nhận https từ host trong danh sách cho phép", () => {
    expect(safeVirtualTourUrl("https://my.matterport.com/show/?m=abc")).toBe("https://my.matterport.com/show/?m=abc");
    expect(safeVirtualTourUrl("https://kuula.co/share/abc")).toBe("https://kuula.co/share/abc");
    expect(safeVirtualTourUrl("http://my.matterport.com/show/?m=abc")).toBeNull();
    expect(safeVirtualTourUrl("https://evil.com/tour")).toBeNull();
    expect(safeVirtualTourUrl("https://my.matterport.com.evil.com/")).toBeNull();
    expect(safeVirtualTourUrl("javascript:alert(1)")).toBeNull();
    expect(safeVirtualTourUrl("khong phai url")).toBeNull();
    expect(safeVirtualTourUrl(null)).toBeNull();
  });
});
