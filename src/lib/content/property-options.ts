// Danh mục giá trị cho tin BĐS (nhãn giao diện, không phải nội dung doanh nghiệp)

export const PROPERTY_TYPES = {
  "can-ho": "Căn hộ chung cư",
  "chung-cu-mini": "Chung cư mini",
  "can-ho-dich-vu": "Căn hộ dịch vụ",
  studio: "Studio",
  "phong-tro": "Phòng trọ",
  "nha-rieng": "Nhà riêng",
  "nha-pho": "Nhà mặt phố",
  "biet-thu": "Biệt thự",
  "van-phong": "Văn phòng",
  "mat-bang": "Mặt bằng kinh doanh",
  dat: "Đất",
} as const;

export type PropertyTypeKey = keyof typeof PROPERTY_TYPES;
export const PROPERTY_TYPE_KEYS = Object.keys(PROPERTY_TYPES) as [PropertyTypeKey, ...PropertyTypeKey[]];

export const LISTING_TYPES = { RENT: "Cho thuê", SALE: "Bán" } as const;

export const SORT_OPTIONS = {
  newest: "Mới nhất",
  "price-asc": "Giá thấp đến cao",
  "price-desc": "Giá cao đến thấp",
  "area-desc": "Diện tích lớn nhất",
  featured: "Nổi bật trước",
} as const;
export type SortKey = keyof typeof SORT_OPTIONS;

export const FURNISHING = {
  full: "Đầy đủ nội thất",
  basic: "Nội thất cơ bản",
  none: "Không nội thất",
} as const;

export const propertyTypeLabel = (key: string) => PROPERTY_TYPES[key as PropertyTypeKey] ?? key;
