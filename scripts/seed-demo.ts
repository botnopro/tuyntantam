/**
 * Nạp / xoá TIN BĐS MẪU (dữ liệu minh hoạ để xem giao diện — KHÔNG phải tin thật của tuyntantam.com).
 * - Mọi tin mẫu có slug bắt đầu bằng "demo-" và hiện nhãn "Tin mẫu" trên web.
 * - Ảnh: public/images/demo/ (Unsplash License, xem public/images/demo/CREDITS.md).
 * Chạy:  npm run db:seed:demo            # nạp (chạy lại sẽ cập nhật)
 *        npm run db:seed:demo -- --remove # xoá toàn bộ tin mẫu trước khi dùng thật
 * Sau khi chạy trên server đang chạy: vào /admin lưu một tin bất kỳ hoặc restart để làm mới cache.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });

import { like } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { properties, type ImageRef } from "@/lib/db/schema";
import { DEMO_SLUG_PREFIX } from "@/lib/content/demo";

const img = (name: string, alt: string): ImageRef => ({ src: `/images/demo/${name}.jpg`, alt, width: 1600, height: 1200 });

type Demo = {
  slug: string;
  title: string;
  listingType: "RENT" | "SALE";
  propertyType: string;
  price: number | null;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  floors?: number;
  direction?: string;
  furnishing: "full" | "basic" | "none";
  address: string;
  ward: string;
  district: string;
  lat: number;
  lng: number;
  summary: string;
  amenities: string[];
  images: [string, string][];
  featured?: boolean;
};

const DEMOS: Demo[] = [
  {
    slug: "can-ho-2pn-view-ho-tay",
    title: "Căn hộ 2 phòng ngủ view Hồ Tây",
    listingType: "RENT",
    propertyType: "can-ho",
    price: 18_000_000,
    area: 78,
    bedrooms: 2,
    bathrooms: 2,
    direction: "Đông Nam",
    furnishing: "full",
    address: "Đường Lạc Long Quân",
    ward: "Xuân La",
    district: "Tây Hồ",
    lat: 21.0655,
    lng: 105.8095,
    summary: "Căn góc tầng cao, ban công nhìn thẳng ra Hồ Tây, nội thất gỗ sáng màu, sẵn sàng vào ở ngay.",
    amenities: ["Điều hoà", "Máy giặt", "Ban công", "Thang máy", "Bảo vệ 24/7", "Chỗ để ô tô"],
    images: [
      ["living-06", "Phòng khách"],
      ["bedroom-01", "Phòng ngủ master"],
      ["kitchen-01", "Bếp"],
      ["building-02", "Toà nhà"],
    ],
    featured: true,
  },
  {
    slug: "studio-full-do-cau-giay",
    title: "Studio full đồ gần Công viên Cầu Giấy",
    listingType: "RENT",
    propertyType: "studio",
    price: 7_500_000,
    area: 35,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "full",
    address: "Phố Dịch Vọng Hậu",
    ward: "Dịch Vọng Hậu",
    district: "Cầu Giấy",
    lat: 21.0313,
    lng: 105.7845,
    summary: "Studio thiết kế mở, cửa sổ lớn đón sáng, đi bộ 5 phút tới công viên và các trường đại học.",
    amenities: ["Điều hoà", "Máy giặt", "Tủ lạnh", "Thang máy", "Khoá vân tay"],
    images: [
      ["living-11", "Không gian sinh hoạt"],
      ["bedroom-03", "Góc ngủ"],
      ["building-01", "Toà nhà"],
    ],
    featured: true,
  },
  {
    slug: "can-ho-dich-vu-1pn-ba-dinh",
    title: "Căn hộ dịch vụ 1 phòng ngủ phố Kim Mã",
    listingType: "RENT",
    propertyType: "can-ho-dich-vu",
    price: 12_000_000,
    area: 50,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "full",
    address: "Phố Kim Mã",
    ward: "Kim Mã",
    district: "Ba Đình",
    lat: 21.0322,
    lng: 105.8205,
    summary: "Dọn phòng 2 lần/tuần, bao phí dịch vụ và internet, phù hợp chuyên gia và người đi làm.",
    amenities: ["Điều hoà", "Máy giặt", "Dọn phòng", "Internet", "Thang máy", "Bảo vệ 24/7"],
    images: [
      ["living-09", "Phòng khách"],
      ["bedroom-02", "Phòng ngủ"],
      ["dining-01", "Bàn ăn"],
    ],
    featured: true,
  },
  {
    slug: "can-ho-3pn-thanh-xuan",
    title: "Căn hộ 3 phòng ngủ rộng rãi cho gia đình",
    listingType: "RENT",
    propertyType: "can-ho",
    price: 16_000_000,
    area: 105,
    bedrooms: 3,
    bathrooms: 2,
    direction: "Nam",
    furnishing: "basic",
    address: "Đường Nguyễn Trãi",
    ward: "Thượng Đình",
    district: "Thanh Xuân",
    lat: 20.9985,
    lng: 105.8155,
    summary: "Ba phòng ngủ đủ ánh sáng, gần trường học và trung tâm thương mại, nội thất cơ bản.",
    amenities: ["Điều hoà", "Ban công", "Thang máy", "Chỗ để ô tô", "Sân chơi trẻ em"],
    images: [
      ["living-01", "Phòng khách"],
      ["bedroom-04", "Phòng ngủ"],
      ["building-03", "Toà nhà"],
    ],
  },
  {
    slug: "chung-cu-mini-hoang-mai",
    title: "Chung cư mini mới xây gần hồ Linh Đàm",
    listingType: "RENT",
    propertyType: "chung-cu-mini",
    price: 5_500_000,
    area: 32,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "full",
    address: "Đường Nguyễn Hữu Thọ",
    ward: "Hoàng Liệt",
    district: "Hoàng Mai",
    lat: 20.9655,
    lng: 105.8285,
    summary: "Phòng mới, cửa sổ thoáng, có thang máy và chỗ để xe máy, giờ giấc tự do.",
    amenities: ["Điều hoà", "Máy giặt chung", "Thang máy", "Khoá vân tay"],
    images: [
      ["living-10", "Phòng chính"],
      ["building-01", "Toà nhà"],
    ],
  },
  {
    slug: "penthouse-duplex-tay-ho",
    title: "Penthouse duplex sân vườn riêng",
    listingType: "RENT",
    propertyType: "can-ho",
    price: 55_000_000,
    area: 220,
    bedrooms: 4,
    bathrooms: 4,
    floors: 2,
    direction: "Tây Nam",
    furnishing: "full",
    address: "Phố Xuân Diệu",
    ward: "Quảng An",
    district: "Tây Hồ",
    lat: 21.0628,
    lng: 105.8282,
    summary: "Hai tầng thông thuỷ, sân vườn trên mái, phòng khách trần cao, nội thất cao cấp.",
    amenities: ["Điều hoà", "Máy giặt", "Sân vườn", "Bể bơi chung", "Phòng gym", "Chỗ để ô tô", "Bảo vệ 24/7"],
    images: [
      ["living-05", "Phòng khách"],
      ["stairs-01", "Cầu thang thông tầng"],
      ["bedroom-01", "Phòng ngủ"],
      ["dining-01", "Phòng ăn"],
    ],
    featured: true,
  },
  {
    slug: "can-ho-2pn-nam-tu-liem",
    title: "Căn hộ 2 phòng ngủ gần Mỹ Đình",
    listingType: "RENT",
    propertyType: "can-ho",
    price: 11_000_000,
    area: 70,
    bedrooms: 2,
    bathrooms: 2,
    direction: "Đông",
    furnishing: "full",
    address: "Đường Lê Đức Thọ",
    ward: "Mỹ Đình 2",
    district: "Nam Từ Liêm",
    lat: 21.0335,
    lng: 105.7675,
    summary: "Toà nhà có bể bơi và phòng gym, gần sân vận động Mỹ Đình và bến xe.",
    amenities: ["Điều hoà", "Máy giặt", "Bể bơi chung", "Phòng gym", "Thang máy"],
    images: [
      ["living-04", "Phòng khách"],
      ["bedroom-03", "Phòng ngủ"],
      ["kitchen-01", "Bếp"],
    ],
  },
  {
    slug: "studio-ban-cong-dong-da",
    title: "Studio có ban công phố Thái Hà",
    listingType: "RENT",
    propertyType: "studio",
    price: 6_800_000,
    area: 30,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "full",
    address: "Phố Thái Hà",
    ward: "Trung Liệt",
    district: "Đống Đa",
    lat: 21.0115,
    lng: 105.8205,
    summary: "Studio nhỏ gọn có ban công trồng cây, gần nhiều quán ăn và trạm xe buýt.",
    amenities: ["Điều hoà", "Máy giặt", "Ban công", "Tủ lạnh"],
    images: [
      ["living-07", "Không gian chính"],
      ["building-02", "Toà nhà"],
    ],
  },
  {
    slug: "can-ho-1pn-hai-ba-trung",
    title: "Căn hộ 1 phòng ngủ gần Times City",
    listingType: "RENT",
    propertyType: "can-ho",
    price: 9_500_000,
    area: 48,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "full",
    address: "Phố Minh Khai",
    ward: "Vĩnh Tuy",
    district: "Hai Bà Trưng",
    lat: 20.9965,
    lng: 105.8685,
    summary: "Căn hộ gọn gàng, có bếp riêng và máy giặt, đi bộ tới trung tâm thương mại.",
    amenities: ["Điều hoà", "Máy giặt", "Thang máy", "Bảo vệ 24/7"],
    images: [
      ["living-08", "Phòng khách"],
      ["bedroom-02", "Phòng ngủ"],
    ],
  },
  {
    slug: "van-phong-tron-goi-cau-giay",
    title: "Văn phòng trọn gói 60 m² phố Duy Tân",
    listingType: "RENT",
    propertyType: "van-phong",
    price: 22_000_000,
    area: 60,
    bedrooms: null,
    bathrooms: 1,
    furnishing: "full",
    address: "Phố Duy Tân",
    ward: "Dịch Vọng Hậu",
    district: "Cầu Giấy",
    lat: 21.0305,
    lng: 105.7835,
    summary: "Văn phòng đã có bàn ghế, phòng họp chung và lễ tân, vào làm việc ngay.",
    amenities: ["Điều hoà", "Internet", "Phòng họp", "Lễ tân", "Thang máy", "Chỗ để ô tô"],
    images: [
      ["office-01", "Không gian làm việc"],
      ["office-02", "Toà nhà"],
    ],
  },
  {
    slug: "biet-thu-san-vuon-tay-ho",
    title: "Biệt thự sân vườn có bể bơi",
    listingType: "RENT",
    propertyType: "biet-thu",
    price: 85_000_000,
    area: 300,
    bedrooms: 5,
    bathrooms: 5,
    floors: 3,
    direction: "Đông Nam",
    furnishing: "full",
    address: "Đường Đặng Thai Mai",
    ward: "Quảng An",
    district: "Tây Hồ",
    lat: 21.0602,
    lng: 105.8235,
    summary: "Biệt thự ba tầng, bể bơi riêng, sân vườn rộng, phù hợp gia đình chuyên gia nước ngoài.",
    amenities: ["Bể bơi riêng", "Sân vườn", "Gara ô tô", "Điều hoà", "Máy giặt", "Bảo vệ 24/7"],
    images: [
      ["villa-01", "Mặt tiền"],
      ["villa-03", "Bể bơi"],
      ["living-03", "Phòng khách"],
      ["bedroom-04", "Phòng ngủ"],
    ],
    featured: true,
  },
  {
    slug: "can-ho-2pn-ban-ba-dinh",
    title: "Bán căn hộ 2 phòng ngủ sổ đỏ chính chủ",
    listingType: "SALE",
    propertyType: "can-ho",
    price: 5_200_000_000,
    area: 82,
    bedrooms: 2,
    bathrooms: 2,
    direction: "Đông Nam",
    furnishing: "basic",
    address: "Phố Liễu Giai",
    ward: "Ngọc Khánh",
    district: "Ba Đình",
    lat: 21.0335,
    lng: 105.8155,
    summary: "Căn hộ đã có sổ, tầng trung, view hồ Ngọc Khánh, bàn giao nội thất cơ bản.",
    amenities: ["Ban công", "Thang máy", "Chỗ để ô tô", "Bảo vệ 24/7"],
    images: [
      ["living-02", "Phòng khách"],
      ["bedroom-03", "Phòng ngủ"],
      ["building-03", "Toà nhà"],
    ],
    featured: true,
  },
  {
    slug: "nha-pho-4-tang-dong-da",
    title: "Bán nhà phố 4 tầng ngõ ô tô",
    listingType: "SALE",
    propertyType: "nha-rieng",
    price: 9_800_000_000,
    area: 52,
    bedrooms: 4,
    bathrooms: 4,
    floors: 4,
    direction: "Bắc",
    furnishing: "basic",
    address: "Phố Tây Sơn",
    ward: "Quang Trung",
    district: "Đống Đa",
    lat: 21.0085,
    lng: 105.8235,
    summary: "Nhà xây kiên cố, ngõ ô tô tránh, gần chợ và trường học, sổ đỏ vuông vắn.",
    amenities: ["Chỗ để ô tô", "Sân thượng", "Ban công"],
    images: [
      ["villa-04", "Mặt tiền"],
      ["living-09", "Phòng khách"],
      ["bedroom-02", "Phòng ngủ"],
    ],
  },
  {
    slug: "biet-thu-hien-dai-nam-tu-liem",
    title: "Bán biệt thự hiện đại khu đô thị",
    listingType: "SALE",
    propertyType: "biet-thu",
    price: 32_000_000_000,
    area: 250,
    bedrooms: 5,
    bathrooms: 6,
    floors: 3,
    direction: "Nam",
    furnishing: "full",
    address: "Khu đô thị Ciputra",
    ward: "Phú Thượng",
    district: "Tây Hồ",
    lat: 21.0775,
    lng: 105.8015,
    summary: "Thiết kế hiện đại, kính lớn, bể bơi và sân vườn, khu đô thị an ninh 24/7.",
    amenities: ["Bể bơi riêng", "Sân vườn", "Gara ô tô", "Bảo vệ 24/7", "Thang máy"],
    images: [
      ["villa-02", "Mặt tiền"],
      ["villa-05", "Sân trước"],
      ["living-05", "Phòng khách"],
    ],
  },
  {
    slug: "can-ho-3pn-ban-cau-giay",
    title: "Bán căn hộ 3 phòng ngủ tầng cao",
    listingType: "SALE",
    propertyType: "can-ho",
    price: 7_600_000_000,
    area: 112,
    bedrooms: 3,
    bathrooms: 2,
    direction: "Tây Bắc",
    furnishing: "full",
    address: "Đường Trần Duy Hưng",
    ward: "Trung Hoà",
    district: "Cầu Giấy",
    lat: 21.0105,
    lng: 105.7995,
    summary: "Căn hộ tầng cao view thành phố, tặng toàn bộ nội thất, sổ hồng lâu dài.",
    amenities: ["Điều hoà", "Bể bơi chung", "Phòng gym", "Thang máy", "Chỗ để ô tô"],
    images: [
      ["living-03", "Phòng khách"],
      ["bedroom-01", "Phòng ngủ"],
      ["dining-01", "Phòng ăn"],
    ],
  },
  {
    slug: "can-ho-1pn-thanh-xuan",
    title: "Căn hộ 1 phòng ngủ có bếp riêng",
    listingType: "RENT",
    propertyType: "can-ho",
    price: null,
    area: 45,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "basic",
    address: "Phố Hoàng Đạo Thuý",
    ward: "Nhân Chính",
    district: "Thanh Xuân",
    lat: 21.0065,
    lng: 105.8045,
    summary: "Căn hộ yên tĩnh, bếp riêng, giá linh hoạt theo thời hạn thuê.",
    amenities: ["Điều hoà", "Thang máy", "Bảo vệ 24/7"],
    images: [
      ["living-10", "Phòng khách"],
      ["kitchen-01", "Bếp"],
    ],
  },
];

const PARAGRAPHS = (d: Demo) =>
  [
    `<p><strong>Đây là tin mẫu minh hoạ giao diện</strong>, không phải tin đăng thật.</p>`,
    `<p>${d.summary}</p>`,
    `<h3>Vị trí</h3><p>${d.address}, phường ${d.ward}, quận ${d.district}, Hà Nội.</p>`,
    `<h3>Tiện ích</h3><ul>${d.amenities.map((a) => `<li>${a}</li>`).join("")}</ul>`,
  ].join("");

async function main() {
  const db = getDb();
  const removed = await db
    .delete(properties)
    .where(like(properties.slug, `${DEMO_SLUG_PREFIX}%`))
    .returning({ slug: properties.slug });
  if (process.argv.includes("--remove")) {
    console.log(`Đã xoá ${removed.length} tin mẫu.`);
    return;
  }
  const now = Date.now();
  await db.insert(properties).values(
    DEMOS.map((d, i) => ({
      slug: `${DEMO_SLUG_PREFIX}${d.slug}`,
      title: d.title,
      status: "published" as const,
      listingType: d.listingType,
      propertyType: d.propertyType,
      price: d.price,
      priceNote: d.price == null ? "Thoả thuận" : null,
      area: d.area,
      bedrooms: d.bedrooms,
      bathrooms: d.bathrooms,
      floors: d.floors ?? null,
      direction: d.direction ?? null,
      furnishing: d.furnishing,
      address: d.address,
      ward: d.ward,
      district: d.district,
      city: "Hà Nội",
      lat: d.lat,
      lng: d.lng,
      summary: d.summary,
      descriptionHtml: PARAGRAPHS(d),
      amenities: d.amenities,
      images: d.images.map(([name, alt]) => img(name, alt)),
      featured: d.featured ?? false,
      source: "admin" as const,
      // Giãn ngày đăng để sắp xếp "mới nhất" có thứ tự ổn định
      publishedAt: new Date(now - i * 36e5 * 7),
    })),
  );
  console.log(`Đã nạp ${DEMOS.length} tin mẫu (thay ${removed.length} tin cũ). Xoá bằng: npm run db:seed:demo -- --remove`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
