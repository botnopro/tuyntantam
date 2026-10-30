import { describe, expect, it } from "vitest";
import { leadInputSchema } from "@/lib/validation/lead";

const isoDay = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const base = { name: "Nguyễn Văn Test", phone: "0912345678", consent: true };

function errors(input: unknown) {
  const r = leadInputSchema.safeParse(input);
  expect(r.success).toBe(false);
  const out: Record<string, string> = {};
  for (const i of r.error!.issues) out[i.path.join(".")] ??= i.message;
  return out;
}

describe("leadInputSchema", () => {
  it("chấp nhận lead hợp lệ và chuẩn hoá SĐT", () => {
    const r = leadInputSchema.parse({ ...base, phone: "+84 912.345.678", email: "", message: "  Xin chào  " });
    expect(r.type).toBe("CONTACT");
    expect(r.phone).toBe("+84912345678");
    expect(r.email).toBeUndefined();
    expect(r.message).toBe("Xin chào");
    expect(r.consent).toBe(true);
  });

  it("chấp nhận chỉ có email (không SĐT)", () => {
    const r = leadInputSchema.parse({ name: "Khách", email: "khach@example.com", consent: "on" });
    expect(r.email).toBe("khach@example.com");
    expect(r.phone).toBeUndefined();
  });

  it("thiếu cả SĐT và email → lỗi ở trường phone", () => {
    const e = errors({ name: "Khách", consent: true });
    expect(e.phone).toBe("Vui lòng nhập số điện thoại hoặc email");
  });

  it.each(["12345", "0112345678", "091234567a", "+1 202 555 0100"])("từ chối SĐT không hợp lệ: %s", (phone) => {
    expect(errors({ ...base, phone }).phone).toBe("Số điện thoại không hợp lệ");
  });

  it.each(["0912345678", "0387654321", "+84912345678", "84 912 345 678", "091-234-5678", "02412345678"])(
    "chấp nhận SĐT Việt Nam: %s",
    (phone) => {
      expect(leadInputSchema.safeParse({ ...base, phone }).success).toBe(true);
    },
  );

  it("từ chối email sai định dạng", () => {
    expect(errors({ ...base, email: "khong-phai-email" }).email).toBe("Email không hợp lệ");
  });

  it("bắt buộc đồng ý (consent)", () => {
    expect(errors({ ...base, consent: undefined }).consent).toBe("Bạn cần đồng ý để Tuyn liên hệ lại");
    expect(errors({ ...base, consent: "off" }).consent).toBe("Bạn cần đồng ý để Tuyn liên hệ lại");
    expect(leadInputSchema.safeParse({ ...base, consent: "true" }).success).toBe(true);
  });

  it("họ tên tối thiểu 2 ký tự", () => {
    expect(errors({ ...base, name: " A " }).name).toBe("Vui lòng nhập họ tên");
  });

  it("VIEWING bắt buộc preferredDate", () => {
    expect(errors({ ...base, type: "VIEWING" }).preferredDate).toBe("Vui lòng chọn ngày xem nhà");
  });

  it("VIEWING từ chối ngày trong quá khứ", () => {
    expect(errors({ ...base, type: "VIEWING", preferredDate: isoDay(-3) }).preferredDate).toBe("Ngày xem phải từ hôm nay trở đi");
    expect(errors({ ...base, type: "VIEWING", preferredDate: "2020-01-01" }).preferredDate).toBe("Ngày xem phải từ hôm nay trở đi");
  });

  it("VIEWING chấp nhận ngày tương lai và giờ hợp lệ", () => {
    const r = leadInputSchema.parse({ ...base, type: "VIEWING", preferredDate: isoDay(5), preferredTime: "09:30", tourType: "video" });
    expect(r.preferredDate).toBe(isoDay(5));
    expect(r.preferredTime).toBe("09:30");
    expect(r.tourType).toBe("video");
  });

  it("VIEWING từ chối ngày sai định dạng và giờ sai", () => {
    expect(errors({ ...base, type: "VIEWING", preferredDate: "31/12/2099" }).preferredDate).toBeDefined();
    expect(errors({ ...base, type: "VIEWING", preferredDate: isoDay(5), preferredTime: "25:00" }).preferredTime).toBeDefined();
  });

  it("CONSIGNMENT bắt buộc consignmentType", () => {
    expect(errors({ ...base, type: "CONSIGNMENT" }).consignmentType).toBe("Vui lòng chọn hình thức ký gửi");
    expect(errors({ ...base, type: "CONSIGNMENT", consignmentType: "GIFT" }).consignmentType).toBe("Vui lòng chọn hình thức ký gửi");
    expect(leadInputSchema.parse({ ...base, type: "CONSIGNMENT", consignmentType: "SALE" }).consignmentType).toBe("SALE");
  });

  it("lời nhắn tối đa 3000 ký tự", () => {
    expect(leadInputSchema.safeParse({ ...base, message: "a".repeat(3000) }).success).toBe(true);
    expect(errors({ ...base, message: "a".repeat(3001) }).message).toBeDefined();
  });

  it("loại lead không hợp lệ bị từ chối; interest không hợp lệ bị bỏ qua", () => {
    expect(errors({ ...base, type: "HACK" }).type).toBeDefined();
    expect(leadInputSchema.parse({ ...base, interest: "khong-co" }).interest).toBeUndefined();
    expect(leadInputSchema.parse({ ...base, interest: "thue-nha" }).interest).toBe("thue-nha");
  });
});
