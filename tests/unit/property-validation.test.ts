import { describe, expect, it } from "vitest";
import { postPatchSchema } from "@/lib/validation/post";
import { propertyFilterSchema, propertyInputSchema, propertyPatchSchema } from "@/lib/validation/property";

describe("propertyFilterSchema", () => {
  it("ép kiểu chuỗi query sang số và áp giá trị mặc định", () => {
    const f = propertyFilterSchema.parse({ minPrice: "5000000", maxPrice: "20000000", bedrooms: "2", page: "3", limit: "24" });
    expect(f).toMatchObject({ minPrice: 5_000_000, maxPrice: 20_000_000, bedrooms: 2, page: 3, limit: 24, sort: "newest" });
    expect(f.amenities).toEqual([]);
  });

  it("mặc định page=1, limit=12, sort=newest khi không có tham số", () => {
    expect(propertyFilterSchema.parse({})).toMatchObject({ page: 1, limit: 12, sort: "newest", amenities: [] });
  });

  it("limit không bao giờ vượt quá 50", () => {
    expect(propertyFilterSchema.parse({ limit: "50" }).limit).toBe(50);
    // quá giới hạn → kẹp về 50; không hợp lệ (≤ 0, không phải số) → về mặc định 12
    for (const limit of ["51", "1000"]) expect(propertyFilterSchema.parse({ limit }).limit).toBe(50);
    for (const limit of ["-1", "0", "abc"]) expect(propertyFilterSchema.parse({ limit }).limit).toBe(12);
  });

  it("sort không hợp lệ → newest; sort hợp lệ giữ nguyên", () => {
    expect(propertyFilterSchema.parse({ sort: "price; drop table" }).sort).toBe("newest");
    expect(propertyFilterSchema.parse({ sort: "price-asc" }).sort).toBe("price-asc");
  });

  it("amenities nhận chuỗi hoặc mảng", () => {
    expect(propertyFilterSchema.parse({ amenities: "Thang máy" }).amenities).toEqual(["Thang máy"]);
    expect(propertyFilterSchema.parse({ amenities: ["Thang máy", "Ban công"] }).amenities).toEqual(["Thang máy", "Ban công"]);
  });

  it("listingType/type không hợp lệ bị bỏ qua", () => {
    const f = propertyFilterSchema.parse({ listingType: "LEASE", type: "lau-dai" });
    expect(f.listingType).toBeUndefined();
    expect(f.type).toBeUndefined();
  });

  it("từ chối minPrice âm và bedrooms không phải số nguyên", () => {
    expect(propertyFilterSchema.safeParse({ minPrice: "-1" }).success).toBe(false);
    expect(propertyFilterSchema.safeParse({ bedrooms: "1.5" }).success).toBe(false);
  });

  it("chuỗi rỗng coi như không lọc", () => {
    const f = propertyFilterSchema.parse({ q: "", minPrice: "", district: "  " });
    expect(f.q).toBeUndefined();
    expect(f.minPrice).toBeUndefined();
    expect(f.district).toBeUndefined();
  });
});

const validProperty = { title: "Căn hộ 2 phòng ngủ", listingType: "RENT", propertyType: "can-ho" };

describe("propertyInputSchema", () => {
  it("áp giá trị mặc định khi tạo mới", () => {
    const p = propertyInputSchema.parse(validProperty);
    expect(p).toMatchObject({
      status: "draft",
      city: "Hà Nội",
      amenities: [],
      images: [],
      featured: false,
      price: null,
      lat: null,
      lng: null,
    });
  });

  it("vĩ độ và kinh độ phải đi cùng nhau", () => {
    const r = propertyInputSchema.safeParse({ ...validProperty, lat: 21.03 });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0]!.path).toEqual(["lat"]);
    expect(r.error!.issues[0]!.message).toBe("Cần nhập cả vĩ độ và kinh độ");
    expect(propertyInputSchema.safeParse({ ...validProperty, lat: 21.03, lng: 105.85 }).success).toBe(true);
    expect(propertyInputSchema.safeParse({ ...validProperty, lat: "", lng: "" }).success).toBe(true);
  });

  it("từ chối toạ độ ngoài phạm vi và ảnh không phải đường dẫn nội bộ / Vercel Blob", () => {
    expect(propertyInputSchema.safeParse({ ...validProperty, lat: 91, lng: 0 }).success).toBe(false);
    expect(propertyInputSchema.safeParse({ ...validProperty, images: [{ src: "javascript:alert(1)" }] }).success).toBe(false);
    expect(propertyInputSchema.safeParse({ ...validProperty, images: [{ src: "http://x.com/a.jpg" }] }).success).toBe(false);
    // host lạ làm next/image ném lỗi khi render → phải bị chặn từ lúc lưu
    expect(propertyInputSchema.safeParse({ ...validProperty, images: [{ src: "https://x.com/a.jpg" }] }).success).toBe(false);
    expect(propertyInputSchema.safeParse({ ...validProperty, images: [{ src: "//x.com/a.jpg" }] }).success).toBe(false);
    expect(propertyInputSchema.safeParse({ ...validProperty, images: [{ src: "/uploads/a.jpg" }] }).success).toBe(true);
    expect(
      propertyInputSchema.safeParse({ ...validProperty, images: [{ src: "https://abc123.public.blob.vercel-storage.com/a.jpg" }] }).success,
    ).toBe(true);
  });

  it("tiêu đề tối thiểu 5 ký tự, slug phải hợp lệ", () => {
    expect(propertyInputSchema.safeParse({ ...validProperty, title: "Nhà" }).success).toBe(false);
    expect(propertyInputSchema.safeParse({ ...validProperty, slug: "Căn Hộ" }).success).toBe(false);
  });
});

describe("propertyPatchSchema", () => {
  it("cho phép cập nhật một phần mà không đặt giá trị mặc định/null cho trường vắng mặt", () => {
    expect(propertyPatchSchema.parse({ title: "Tiêu đề mới đây" })).toEqual({ title: "Tiêu đề mới đây" });
  });

  it("vẫn null hoá trường được gửi rỗng", () => {
    expect(propertyPatchSchema.parse({ summary: "" })).toEqual({ summary: null });
  });

  it("vẫn kiểm tra cặp lat/lng trong bản vá", () => {
    expect(propertyPatchSchema.safeParse({ lat: 21 }).success).toBe(false);
    expect(propertyPatchSchema.safeParse({ lat: 21, lng: 105 }).success).toBe(true);
  });

  it("vẫn kiểm tra giá trị của trường có gửi lên", () => {
    expect(propertyPatchSchema.safeParse({ status: "deleted" }).success).toBe(false);
    expect(propertyPatchSchema.safeParse({ featured: "yes" }).success).toBe(false);
    expect(propertyPatchSchema.parse({ status: "published", featured: true })).toEqual({ status: "published", featured: true });
  });
});

describe("postPatchSchema", () => {
  it("không reset nội dung/ảnh/thẻ/trạng thái khi chỉ sửa tiêu đề", () => {
    expect(postPatchSchema.parse({ title: "Tiêu đề bài viết mới" })).toEqual({ title: "Tiêu đề bài viết mới" });
  });
});
