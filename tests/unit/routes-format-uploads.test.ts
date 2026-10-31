import { describe, expect, it } from "vitest";
import { mapLegacyHref } from "@/lib/content/routes";
import { formatPrice, formatVnd, plainText, slugify } from "@/lib/utils/format";
import { sniffImage } from "@/server/admin/uploads";

describe("mapLegacyHref", () => {
  const posts = new Set(["kinh-nghiem-thue-nha"]);
  const map = (href: string) => mapLegacyHref(href, posts);

  it.each([
    ["https://tuyntantam.com/kinh-nghiem-thue-nha/", "/blog/kinh-nghiem-thue-nha"],
    ["https://www.tuyntantam.com/blog/kinh-nghiem-thue-nha/.html", "/blog/kinh-nghiem-thue-nha"],
    ["/blog/kinh-nghiem-thue-nha/.html", "/blog/kinh-nghiem-thue-nha"],
    ["/kinh-nghiem-thue-nha?utm_source=fb#muc-2", "/blog/kinh-nghiem-thue-nha?utm_source=fb#muc-2"],
    ["/danh-muc/kien-thuc/thue-nha/", "/blog/danh-muc/thue-nha"],
    ["/danh-muc/kien-thuc", "/blog/danh-muc/kien-thuc"],
    ["/tag/chung-cu", "/blog/the/chung-cu"],
    ["/lien-he-hop-tac/", "/lien-he"],
    ["https://tuyntantam.com/lien-he-hop-tac", "/lien-he"],
    ["/tu-van-thue-nha", "/dich-vu/tu-van-thue-nha"],
    ["/tu-van-setup-noi-that/", "/dich-vu/tu-van-setup-noi-that"],
    ["/nguon-bds-thue?x=1", "/kho-nguon?x=1"],
    ["/tin-tuc", "/blog"],
    ["https://tuyntantam.com", "/"],
    ["https://tuyntantam.com/", "/"],
    ["/trang-khac/", "/trang-khac"],
  ])("%s → %s", (input, expected) => {
    expect(map(input)).toBe(expected);
  });

  it.each([
    "https://facebook.com/tuyntantam",
    "https://tuyntantam.com.evil.com/x",
    "mailto:a@b.c",
    "tel:0912345678",
    "#muc-1",
    "zalo.me/0912",
  ])("giữ nguyên link ngoài: %s", (href) => {
    expect(map(href)).toBe(href);
  });

  it("/blog/<slug> không phải bài viết đã biết thì vẫn giữ nguyên đường dẫn", () => {
    expect(map("/blog/bai-khong-ton-tai")).toBe("/blog/bai-khong-ton-tai");
  });
});

describe("formatVnd / formatPrice", () => {
  it("định dạng theo vi-VN với đơn vị tỷ/triệu/nghìn", () => {
    expect(formatVnd(12_500_000_000)).toBe("12,5 tỷ");
    expect(formatVnd(3_000_000_000)).toBe("3 tỷ");
    expect(formatVnd(25_000_000)).toBe("25 triệu");
    expect(formatVnd(7_500_000)).toBe("7,5 triệu");
    expect(formatVnd(800_000)).toBe("800 nghìn");
    expect(formatVnd(500)).toBe("500 đ");
  });

  it("trả null cho giá không hợp lệ", () => {
    for (const v of [null, undefined, 0, -5, Number.NaN, Number.POSITIVE_INFINITY]) expect(formatVnd(v)).toBeNull();
  });

  it("formatPrice: thuê có /tháng, bán không có đơn vị, không giá → ghi chú hoặc Thoả thuận", () => {
    expect(formatPrice(8_000_000, "RENT")).toEqual({ main: "8 triệu", unit: "/tháng" });
    expect(formatPrice(5_200_000_000, "SALE")).toEqual({ main: "5,2 tỷ", unit: null });
    expect(formatPrice(null, "RENT")).toEqual({ main: "Thoả thuận", unit: null });
    expect(formatPrice(null, "SALE", "Liên hệ")).toEqual({ main: "Liên hệ", unit: null });
  });
});

describe("slugify", () => {
  it.each([
    ["Căn hộ Đống Đa giá rẻ!", "can-ho-dong-da-gia-re"],
    ["Phường Đội Cấn, Ba Đình", "phuong-doi-can-ba-dinh"],
    ["  --Xin chào thế giới--  ", "xin-chao-the-gioi"],
    ["Nhà 3 tầng ở Hà Nội (mới)", "nha-3-tang-o-ha-noi-moi"],
    ["Ưu đãi ỨNG dụng ỷ ỹ", "uu-dai-ung-dung-y-y"],
    ["", ""],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("giới hạn 120 ký tự", () => {
    expect(slugify("a".repeat(300)).length).toBe(120);
  });
});

describe("plainText", () => {
  it("bỏ thẻ và giải mã thực thể đúng một lần", () => {
    expect(plainText("<p>Liên Hệ &amp; Hợp Tác</p><p>A&nbsp;&#8211;&#x20;B</p>")).toBe("Liên Hệ & Hợp Tác A – B");
  });
  it("giữ nguyên thực thể lạ", () => {
    expect(plainText("x &foo; &#0; y")).toBe("x &foo; &#0; y");
  });
});

describe("sniffImage (magic bytes)", () => {
  const bytes = (...parts: (number[] | string)[]) =>
    new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

  it("nhận JPEG, PNG, WebP, AVIF", () => {
    expect(sniffImage(bytes([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]))).toEqual({ mime: "image/jpeg", ext: "jpg" });
    expect(sniffImage(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toEqual({ mime: "image/png", ext: "png" });
    expect(sniffImage(bytes("RIFF", [0x24, 0, 0, 0], "WEBPVP8 "))).toEqual({ mime: "image/webp", ext: "webp" });
    expect(sniffImage(bytes([0, 0, 0, 0x1c], "ftypavif", [0, 0, 0, 0]))).toEqual({ mime: "image/avif", ext: "avif" });
    expect(sniffImage(bytes([0, 0, 0, 0x1c], "ftypavis", [0, 0, 0, 0]))).toEqual({ mime: "image/avif", ext: "avif" });
  });

  it.each([
    ["SVG", bytes('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>')],
    ["SVG có khai báo XML", bytes('<?xml version="1.0"?><svg></svg>')],
    ["HTML", bytes("<!doctype html><script>alert(1)</script>")],
    ["GIF", bytes("GIF89a", [1, 0, 1, 0])],
    ["HEIC", bytes([0, 0, 0, 0x18], "ftypheic", [0, 0, 0, 0])],
    ["RIFF không phải WebP (WAV)", bytes("RIFF", [0x24, 0, 0, 0], "WAVEfmt ")],
    ["rỗng", new Uint8Array()],
  ])("từ chối %s", (_name, buf) => {
    expect(sniffImage(buf)).toBeNull();
  });
});
