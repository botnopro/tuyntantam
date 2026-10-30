import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { DELETE, GET as getOne, PATCH } from "@/app/api/v1/admin/properties/[id]/route";
import { GET as list, POST as create } from "@/app/api/v1/admin/properties/route";
import { properties, sessions } from "@/lib/db/schema";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { setCookie } from "../helpers/request-context";
import { closeDb, db, insertProperty, loginAs, resetDb } from "../helpers/db";
import { ctx, getRequest, jsonRequest } from "../helpers/http";

beforeEach(resetDb);
afterAll(closeDb);

const del = (id: string, headers: Record<string, string> = { origin: "http://localhost:3000" }) =>
  DELETE(new Request(`http://localhost:3000/api/v1/admin/properties/${id}`, { method: "DELETE", headers }), ctx({ id }));
const patch = (id: string, body: unknown) => PATCH(jsonRequest(`/api/v1/admin/properties/${id}`, body, { method: "PATCH" }), ctx({ id }));
const find = async (id: string) => (await db().select().from(properties).where(eq(properties.id, id)))[0];

describe("Admin API — xác thực", () => {
  it("GET danh sách không có phiên → 401", async () => {
    const res = await list(getRequest("/api/v1/admin/properties"), ctx());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toEqual({ code: "unauthorized", message: "Bạn cần đăng nhập" });
  });

  it("cookie phiên giả / không tồn tại → 401", async () => {
    setCookie(SESSION_COOKIE, "token-khong-ton-tai");
    expect((await list(getRequest("/api/v1/admin/properties"), ctx())).status).toBe(401);
  });

  it("phiên hết hạn → 401", async () => {
    const user = await loginAs("ADMIN");
    await db()
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(sessions.userId, user.id));
    expect((await list(getRequest("/api/v1/admin/properties"), ctx())).status).toBe(401);
  });

  it("PATCH/DELETE/POST không có phiên → 401, dữ liệu không đổi", async () => {
    const p = await insertProperty();
    expect((await patch(p.id, { title: "Tiêu đề bị sửa trộm" })).status).toBe(401);
    expect((await del(p.id)).status).toBe(401);
    expect(
      (await create(jsonRequest("/api/v1/admin/properties", { title: "Tin mới trộm", listingType: "RENT", propertyType: "can-ho" }), ctx()))
        .status,
    ).toBe(401);
    expect((await find(p.id))!.title).toBe(p.title);
  });

  it("có phiên nhưng Origin lạ → 403 (CSRF)", async () => {
    await loginAs("ADMIN");
    const p = await insertProperty();
    const res = await del(p.id, { origin: "https://evil.example" });
    expect(res.status).toBe(403);
    expect(await find(p.id)).toBeDefined();
  });
});

describe("Admin API — phân quyền", () => {
  it("EDITOR xem được danh sách (mọi trạng thái)", async () => {
    await loginAs("EDITOR");
    await insertProperty({ status: "draft" });
    await insertProperty();
    const res = await list(getRequest("/api/v1/admin/properties"), ctx());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.meta.total).toBe(2);
  });

  it("EDITOR PATCH được; trường không gửi lên giữ nguyên", async () => {
    await loginAs("EDITOR");
    const p = await insertProperty({
      status: "published",
      featured: true,
      amenities: ["Thang máy"],
      images: [{ src: "/images/a.jpg", alt: "Ảnh" }],
      city: "Hà Nội",
    });
    const res = await patch(p.id, { title: "<b>Tiêu đề</b> đã sửa" });
    expect(res.status).toBe(200);
    const row = (await find(p.id))!;
    expect(row.title).toBe("Tiêu đề đã sửa");
    expect(row).toMatchObject({
      status: "published",
      featured: true,
      amenities: ["Thang máy"],
      images: [{ src: "/images/a.jpg", alt: "Ảnh" }],
    });
    expect(row.publishedAt).toEqual(p.publishedAt);
  });

  it("PATCH dữ liệu sai → 400 kèm chi tiết", async () => {
    await loginAs("EDITOR");
    const p = await insertProperty();
    const res = await patch(p.id, { lat: 21 });
    expect(res.status).toBe(400);
    expect((await res.json()).error.details).toEqual([{ field: "lat", message: "Cần nhập cả vĩ độ và kinh độ" }]);
  });

  it("PATCH id không phải uuid hoặc không tồn tại → 404", async () => {
    await loginAs("EDITOR");
    expect((await patch("khong-phai-uuid", { title: "Tiêu đề hợp lệ" })).status).toBe(404);
    expect((await patch("00000000-0000-4000-8000-000000000000", { title: "Tiêu đề hợp lệ" })).status).toBe(404);
  });

  it("EDITOR DELETE → 403, tin vẫn còn", async () => {
    await loginAs("EDITOR");
    const p = await insertProperty();
    const res = await del(p.id);
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("forbidden");
    expect(await find(p.id)).toBeDefined();
  });

  it("ADMIN DELETE → 204, tin bị xoá; xoá lần hai → 404", async () => {
    await loginAs("ADMIN");
    const p = await insertProperty();
    const res = await del(p.id);
    expect(res.status).toBe(204);
    expect(await find(p.id)).toBeUndefined();
    expect((await del(p.id)).status).toBe(404);
  });

  it("EDITOR tạo tin: nội dung được làm sạch, slug sinh từ tiêu đề", async () => {
    await loginAs("EDITOR");
    const res = await create(
      jsonRequest("/api/v1/admin/properties", {
        title: "Căn hộ Đống Đa",
        listingType: "RENT",
        propertyType: "can-ho",
        status: "published",
        descriptionHtml: '<p>Mô tả</p><script>alert(1)</script><a href="javascript:x()">x</a>',
        videoYoutubeId: "https://youtu.be/dQw4w9WgXcQ",
        virtualTourUrl: "https://evil.example/tour",
      }),
      ctx(),
    );
    expect(res.status).toBe(201);
    const { data } = await res.json();
    expect(data).toMatchObject({
      slug: "can-ho-dong-da",
      status: "published",
      source: "admin",
      descriptionHtml: "<p>Mô tả</p><a>x</a>",
      videoYoutubeId: "dQw4w9WgXcQ",
      virtualTourUrl: null,
    });
    expect(data.publishedAt).not.toBeNull();
  });

  it("GET chi tiết theo id", async () => {
    await loginAs("EDITOR");
    const p = await insertProperty({ status: "draft" });
    const res = await getOne(getRequest(`/api/v1/admin/properties/${p.id}`), ctx({ id: p.id }));
    expect(res.status).toBe(200);
    expect((await res.json()).data.id).toBe(p.id);
  });
});
