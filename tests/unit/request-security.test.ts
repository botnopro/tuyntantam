import { describe, expect, it } from "vitest";
import { clientIp, hashIp, isSameOrigin, issueFormToken, verifyFormToken } from "@/lib/security/request";

describe("form token", () => {
  const t0 = 1_760_000_000_000;

  it("ok khi đã qua ≥ 3 giây", () => {
    const token = issueFormToken(t0);
    expect(verifyFormToken(token, t0 + 3_000)).toBe("ok");
    expect(verifyFormToken(token, t0 + 60_000)).toBe("ok");
  });

  it("too_fast khi gửi trong vòng 3 giây", () => {
    const token = issueFormToken(t0);
    expect(verifyFormToken(token, t0)).toBe("too_fast");
    expect(verifyFormToken(token, t0 + 2_999)).toBe("too_fast");
  });

  it("expired khi quá 24 giờ", () => {
    const token = issueFormToken(t0);
    expect(verifyFormToken(token, t0 + 24 * 3_600_000)).toBe("ok");
    expect(verifyFormToken(token, t0 + 24 * 3_600_000 + 1)).toBe("expired");
  });

  it("invalid khi token bị sửa, thiếu hoặc sai định dạng", () => {
    const token = issueFormToken(t0);
    const [ts, mac] = token.split(".");
    const flipped = mac!.slice(0, -1) + (mac!.endsWith("A") ? "B" : "A");
    expect(verifyFormToken(`${ts}.${flipped}`, t0 + 5_000)).toBe("invalid");
    // đổi thời điểm phát hành nhưng giữ chữ ký cũ
    expect(verifyFormToken(`${t0 - 10_000}.${mac}`, t0 + 5_000)).toBe("invalid");
    expect(verifyFormToken(null, t0)).toBe("invalid");
    expect(verifyFormToken("", t0)).toBe("invalid");
    expect(verifyFormToken("abc", t0)).toBe("invalid");
    expect(verifyFormToken(`${ts}.`, t0 + 5_000)).toBe("invalid");
    expect(verifyFormToken(`123.${mac}`, t0 + 5_000)).toBe("invalid");
  });
});

describe("isSameOrigin", () => {
  const h = (init: Record<string, string>) => new Headers(init);

  it("chấp nhận Origin trùng APP_URL", () => {
    expect(isSameOrigin(h({ origin: "http://localhost:3000" }))).toBe(true);
  });

  it("từ chối Origin lạ và khi thiếu cả Origin lẫn Referer", () => {
    expect(isSameOrigin(h({ origin: "https://evil.com" }))).toBe(false);
    expect(isSameOrigin(h({ origin: "http://localhost:3000.evil.com" }))).toBe(false);
    expect(isSameOrigin(h({}))).toBe(false);
    expect(isSameOrigin(h({ origin: "null" }))).toBe(false);
  });

  it("dùng Referer khi không có Origin", () => {
    expect(isSameOrigin(h({ referer: "http://localhost:3000/lien-he?x=1" }))).toBe(true);
    expect(isSameOrigin(h({ referer: "https://evil.com/lien-he" }))).toBe(false);
    expect(isSameOrigin(h({ referer: "khong-phai-url" }))).toBe(false);
  });

  it("chấp nhận Origin trùng Host của chính request (preview deploy)", () => {
    expect(isSameOrigin(h({ origin: "https://preview-abc.vercel.app", host: "preview-abc.vercel.app" }))).toBe(true);
    expect(isSameOrigin(h({ origin: "https://preview-abc.vercel.app", "x-forwarded-host": "preview-abc.vercel.app" }))).toBe(true);
    expect(isSameOrigin(h({ origin: "https://evil.com", host: "preview-abc.vercel.app" }))).toBe(false);
  });
});

describe("clientIp / hashIp", () => {
  it("sau reverse proxy: lấy phần tử CUỐI của x-forwarded-for (phần đầu client tự giả được)", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": " 6.6.6.6 , 1.2.3.4" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(clientIp(new Headers())).toBe("unknown");
  });

  it("băm IP ổn định, không chứa IP gốc", () => {
    expect(hashIp("1.2.3.4")).toBe(hashIp("1.2.3.4"));
    expect(hashIp("1.2.3.4")).not.toBe(hashIp("1.2.3.5"));
    expect(hashIp("1.2.3.4")).toMatch(/^[0-9a-f]{32}$/);
  });
});
