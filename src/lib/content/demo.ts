// Tin BĐS mẫu (scripts/seed-demo.ts) — nhận diện qua tiền tố slug để gắn nhãn "Tin mẫu" và xoá hàng loạt.
export const DEMO_SLUG_PREFIX = "demo-";
export const isDemoListing = (slug: string) => slug.startsWith(DEMO_SLUG_PREFIX);

// Ảnh toàn cảnh khu vực Hà Nội (Unsplash License, xem public/images/demo/CREDITS.md) cho lưới "Khu vực"
export const AREA_IMAGES: Record<string, string> = {
  "Tây Hồ": "/images/demo/area-tay-ho.jpg",
  "Cầu Giấy": "/images/demo/area-cau-giay.jpg",
  "Hoàng Mai": "/images/demo/area-hoang-mai.jpg",
  "Thanh Xuân": "/images/demo/area-thanh-xuan.jpg",
  "Ba Đình": "/images/demo/area-ba-dinh.jpg",
};
