import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/v1/leads/route";
import { leads } from "@/lib/db/schema";
import { issueFormToken } from "@/lib/security/request";
import { closeDb, db, insertProperty, resetDb } from "../helpers/db";
import { ctx, jsonRequest } from "../helpers/http";

const validLead = () => ({
  name: "Khách Test",
  phone: "0912345678",
  message: "Tôi cần thuê căn hộ",
  consent: true,
  website: "",
  formToken: issueFormToken(Date.now() - 5_000),
});

let ipSeq = 0;
const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(jsonRequest("/api/v1/leads", body, { headers: { "x-forwarded-for": `203.0.113.${++ipSeq}`, ...headers } }), ctx());

const allLeads = () => db().select().from(leads);

beforeEach(resetDb);
afterAll(closeDb);

describe("POST /api/v1/leads", () => {
  it("201 và lưu lead trạng thái NEW khi hợp lệ", async () => {
    const res = await post({ ...validLead(), email: "Khach@Example.com", sourcePage: "/lien-he" });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { received: true } });

    const rows = await allLeads();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      status: "NEW",
      type: "CONTACT",
      name: "Khách Test",
      phone: "0912345678",
      email: "khach@example.com",
      sourcePage: "/lien-he",
    });
    // IP chỉ lưu dạng băm
    expect(rows[0]!.ipHash).toMatch(/^[0-9a-f]{32}$/);
    expect(rows[0]!.ipHash).not.toContain("203.0.113");
  });

  it("liên kết BĐS theo propertySlug", async () => {
    const p = await insertProperty({ slug: "can-ho-lien-ket" });
    const res = await post({ ...validLead(), type: "PROPERTY_INQUIRY", propertySlug: "can-ho-lien-ket" });
    expect(res.status).toBe(201);
    expect((await allLeads())[0]!.propertyId).toBe(p.id);
  });

  it("honeypot `website` có giá trị → vẫn 201 nhưng lưu SPAM", async () => {
    const res = await post({ ...validLead(), website: "http://spam.example" });
    expect(res.status).toBe(201);
    const rows = await allLeads();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.status).toBe("SPAM");
  });

  it("thiếu form token → lưu SPAM", async () => {
    const { formToken: _omit, ...body } = validLead();
    expect((await post(body)).status).toBe(201);
    expect((await allLeads())[0]!.status).toBe("SPAM");
  });

  it("token điền quá nhanh hoặc bị sửa → lưu SPAM", async () => {
    await post({ ...validLead(), formToken: issueFormToken(Date.now()) });
    await post({ ...validLead(), formToken: `${Date.now() - 5_000}.chu-ky-gia` });
    const rows = await allLeads();
    expect(rows.map((r) => r.status)).toEqual(["SPAM", "SPAM"]);
  });

  it("dữ liệu không hợp lệ → 400 kèm lỗi từng trường bằng tiếng Việt, không lưu", async () => {
    const res = await post({ name: "A", phone: "123", consent: false });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("validation_error");
    expect(body.error.message).toBe("Vui lòng kiểm tra lại thông tin");
    expect(body.error.details).toMatchObject({
      name: "Vui lòng nhập họ tên",
      phone: "Số điện thoại không hợp lệ",
      consent: "Bạn cần đồng ý để Tuyn liên hệ lại",
    });
    expect(await allLeads()).toHaveLength(0);
  });

  it("thiếu SĐT và email → 400, lỗi ở phone", async () => {
    const { phone: _p, ...body } = validLead();
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).error.details.phone).toBe("Vui lòng nhập số điện thoại hoặc email");
  });

  it("JSON hỏng → 400 invalid_json", async () => {
    const req = new Request("http://localhost:3000/api/v1/leads", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: "{khong-phai-json",
    });
    const res = await POST(req, ctx());
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("invalid_json");
  });

  it("thiếu Origin → 403", async () => {
    const req = new Request("http://localhost:3000/api/v1/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validLead()),
    });
    const res = await POST(req, ctx());
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("forbidden_origin");
    expect(await allLeads()).toHaveLength(0);
  });

  it("Origin lạ → 403", async () => {
    const res = await post(validLead(), { origin: "https://evil.example" });
    expect(res.status).toBe(403);
    expect(await allLeads()).toHaveLength(0);
  });

  it("request thứ 6 từ cùng IP trong cửa sổ → 429", async () => {
    const ip = { "x-forwarded-for": "198.51.100.7, 10.0.0.1" };
    for (let i = 0; i < 5; i++) expect((await post(validLead(), ip)).status).toBe(201);
    const res = await post(validLead(), ip);
    expect(res.status).toBe(429);
    expect((await res.json()).error.code).toBe("rate_limited");
    expect(await allLeads()).toHaveLength(5);
    // IP khác không bị ảnh hưởng
    expect((await post(validLead(), { "x-forwarded-for": "198.51.100.8" })).status).toBe(201);
  });

  it("HTML trong lời nhắn/họ tên bị loại bỏ", async () => {
    const res = await post({
      ...validLead(),
      name: "<b>Khách</b> Hàng",
      message: '<script>alert(1)</script><p onclick="x()">Cần thuê</p> <img src=x onerror=alert(1)>nhà &amp; đất',
    });
    expect(res.status).toBe(201);
    const [row] = await allLeads();
    expect(row!.name).toBe("Khách Hàng");
    expect(row!.message).toBe("Cần thuê nhà & đất");
  });

  it("body quá lớn → 413", async () => {
    const res = await post({ ...validLead(), message: "a".repeat(25_000) });
    expect(res.status).toBe(413);
  });
});
