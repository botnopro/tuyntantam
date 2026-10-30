import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as getOne } from "@/app/api/v1/properties/[slug]/route";
import { GET as list } from "@/app/api/v1/properties/route";
import { closeDb, insertProperty, resetDb } from "../helpers/db";
import { ctx, getRequest } from "../helpers/http";

type Item = { slug: string; price: number | null };
type ListBody = { data: Item[]; meta: { total: number; page: number; limit: number; pages: number } };

async function search(qs = "") {
  const res = await list(getRequest(`/api/v1/properties${qs}`), ctx());
  expect(res.status).toBe(200);
  return (await res.json()) as ListBody;
}
const slugs = (b: ListBody) => b.data.map((i) => i.slug).sort();

// Dữ liệu giả lập CHỈ dùng trong test
beforeAll(async () => {
  await resetDb();
  await insertProperty({
    slug: "thue-can-ho-a",
    title: "Căn hộ ban công rộng",
    listingType: "RENT",
    propertyType: "can-ho",
    district: "Quận A",
    price: 8_000_000,
    bedrooms: 2,
    amenities: ["Thang máy", "Ban công"],
  });
  await insertProperty({
    slug: "thue-studio-b",
    title: "Studio nhỏ gọn",
    listingType: "RENT",
    propertyType: "studio",
    district: "Quận B",
    price: 5_000_000,
    bedrooms: 1,
    amenities: ["Thang máy"],
    address: "Ngõ 100% test_x",
  });
  await insertProperty({
    slug: "ban-nha-rieng-c",
    title: "Nhà riêng 4 tầng",
    listingType: "SALE",
    propertyType: "nha-rieng",
    district: "Quận A",
    price: 6_000_000_000,
    bedrooms: 4,
  });
  await insertProperty({
    slug: "thue-thoa-thuan-d",
    title: "Phòng trọ giá thoả thuận",
    propertyType: "phong-tro",
    district: "Quận C",
    price: null,
  });
  await insertProperty({ slug: "nhap-e", title: "Căn hộ nháp", status: "draft", price: 1_000_000 });
  await insertProperty({ slug: "luu-tru-f", title: "Căn hộ lưu trữ", status: "archived", price: 1_000_000 });
});
afterAll(closeDb);

describe("GET /api/v1/properties", () => {
  it("chỉ trả tin đã đăng (published)", async () => {
    const b = await search();
    expect(slugs(b)).toEqual(["ban-nha-rieng-c", "thue-can-ho-a", "thue-studio-b", "thue-thoa-thuan-d"]);
    expect(b.meta).toMatchObject({ total: 4, page: 1, limit: 12, pages: 1 });
    // Trường nội bộ không có trong danh sách
    expect(b.data[0]).not.toHaveProperty("status");
    expect(b.data[0]).not.toHaveProperty("source");
  });

  it("lọc theo listingType, type, district", async () => {
    expect(slugs(await search("?listingType=SALE"))).toEqual(["ban-nha-rieng-c"]);
    expect(slugs(await search("?type=studio"))).toEqual(["thue-studio-b"]);
    expect(slugs(await search("?district=Qu%E1%BA%ADn%20A"))).toEqual(["ban-nha-rieng-c", "thue-can-ho-a"]);
    expect(slugs(await search("?listingType=RENT&district=Qu%E1%BA%ADn%20A"))).toEqual(["thue-can-ho-a"]);
  });

  it("lọc theo khoảng giá và số phòng ngủ tối thiểu", async () => {
    expect(slugs(await search("?minPrice=6000000&maxPrice=9000000"))).toEqual(["thue-can-ho-a"]);
    expect(slugs(await search("?maxPrice=7000000"))).toEqual(["thue-studio-b"]);
    expect(slugs(await search("?bedrooms=2"))).toEqual(["ban-nha-rieng-c", "thue-can-ho-a"]);
  });

  it("lọc theo tiện ích (phải có đủ tất cả)", async () => {
    expect(slugs(await search("?amenities=Thang%20m%C3%A1y"))).toEqual(["thue-can-ho-a", "thue-studio-b"]);
    expect(slugs(await search("?amenities=Thang%20m%C3%A1y&amenities=Ban%20c%C3%B4ng"))).toEqual(["thue-can-ho-a"]);
  });

  it("tìm theo từ khoá q (không phân biệt hoa thường, ký tự % _ được escape)", async () => {
    expect(slugs(await search("?q=BAN%20C%C3%94NG"))).toEqual(["thue-can-ho-a"]);
    expect(slugs(await search("?q=100%25"))).toEqual(["thue-studio-b"]);
    expect(slugs(await search("?q=%25"))).toEqual(["thue-studio-b"]);
    expect(slugs(await search("?q=khong-co-ket-qua"))).toEqual([]);
  });

  it("sắp xếp theo giá tăng/giảm (giá null xếp cuối)", async () => {
    const asc = (await search("?sort=price-asc")).data.map((i) => i.slug);
    expect(asc).toEqual(["thue-studio-b", "thue-can-ho-a", "ban-nha-rieng-c", "thue-thoa-thuan-d"]);
    const desc = (await search("?sort=price-desc")).data.map((i) => i.slug);
    expect(desc).toEqual(["ban-nha-rieng-c", "thue-can-ho-a", "thue-studio-b", "thue-thoa-thuan-d"]);
  });

  it("phân trang: meta total/pages đúng", async () => {
    const p1 = await search("?sort=price-asc&limit=3");
    expect(p1.data).toHaveLength(3);
    expect(p1.meta).toMatchObject({ total: 4, page: 1, limit: 3, pages: 2 });
    const p2 = await search("?sort=price-asc&limit=3&page=2");
    expect(p2.data.map((i) => i.slug)).toEqual(["thue-thoa-thuan-d"]);
    expect(p2.meta.page).toBe(2);
  });

  it("limit vượt 50 không được chấp nhận", async () => {
    expect((await search("?limit=500")).meta.limit).toBeLessThanOrEqual(50);
  });

  it("tham số không hợp lệ → 400 JSON, không lộ stack trace", async () => {
    const res = await list(getRequest("/api/v1/properties?minPrice=-5"), ctx());
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
    expect(body.error.message).toBe("Tham số không hợp lệ");
    expect(JSON.stringify(body)).not.toMatch(/at\s.+\(|stack|\.ts:\d+/);
  });

  it("không bật CORS cho origin lạ", async () => {
    const res = await list(getRequest("/api/v1/properties", { origin: "https://evil.example" }), ctx());
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("GET /api/v1/properties/:slug", () => {
  const one = (slug: string) => getOne(getRequest(`/api/v1/properties/${slug}`), ctx({ slug }));

  it("200 cho tin đã đăng, không có source/status", async () => {
    const res = await one("thue-can-ho-a");
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data).toMatchObject({ slug: "thue-can-ho-a", title: "Căn hộ ban công rộng", price: 8_000_000 });
    expect(data).not.toHaveProperty("source");
    expect(data).not.toHaveProperty("status");
  });

  it.each(["nhap-e", "luu-tru-f", "khong-ton-tai", "SLUG HỎNG", "../etc/passwd"])("404 cho %s", async (slug) => {
    const res = await one(slug);
    expect(res.status).toBe(404);
    expect((await res.json()).error).toEqual({ code: "not_found", message: "Không tìm thấy bất động sản" });
  });
});
