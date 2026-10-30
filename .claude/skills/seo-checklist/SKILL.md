---
name: seo-checklist
description: Checklist SEO cho website Tuyn Tận Tâm — metadata từng trang, Open Graph, sitemap.xml, robots.txt, schema.org (RealEstateListing, Article, Person/RealEstateAgent, BreadcrumbList), redirect URL cũ của WordPress và Core Web Vitals. Dùng khi thêm/sửa trang công khai, đổi slug, hoặc trước khi deploy.
---

# SEO checklist

## Metadata (Next.js Metadata API)
- [ ] `src/app/layout.tsx`: `metadataBase = new URL(APP_URL)`, `title.template = "%s | Tuyn Tận Tâm"`, `description` mặc định lấy từ `data/site.json` (`seo.description`), `openGraph.locale = "vi_VN"`, `alternates.canonical`.
- [ ] Mỗi trang động dùng `generateMetadata`: title ≤ 60 ký tự, description 120–160 ký tự (ưu tiên SEO gốc từ tuyntantam.com — `seo.title/description` trong JSON; không có thì cắt từ excerpt).
- [ ] `openGraph.images` = ảnh bìa (1200×630 nếu có; không có thì ảnh og mặc định của site gốc). `twitter.card = "summary_large_image"`.
- [ ] Trang admin, trang so sánh/yêu thích, kết quả lọc có query → `robots: { index: false }`.
- [ ] Mỗi trang đúng **một** `<h1>`.

## Sitemap & robots
- [ ] `src/app/sitemap.ts`: trang tĩnh + bài viết + chuyên mục + dịch vụ + BĐS `published`, có `lastModified`.
- [ ] `src/app/robots.ts`: cho phép tất cả, chặn `/admin`, `/api`, `/so-sanh`, `/yeu-thich`; trỏ sitemap.

## Structured data (JSON-LD, component `<JsonLd>`; escape `<` trong JSON)
- [ ] Toàn site: `Organization` + `WebSite` (tên, logo, `sameAs` = mạng xã hội trong `site.json`).
- [ ] `/gioi-thieu`: `Person` (+ `RealEstateAgent` nếu phù hợp) — chỉ trường có thật.
- [ ] `/tin-tuc/[slug]`: `Article` (headline, image, datePublished, dateModified, author, publisher).
- [ ] `/bat-dong-san/[slug]`: `RealEstateListing` (name, description, url, image, datePosted, `offers` {price, priceCurrency "VND", availability}, `itemOffered`/`about` {`floorSize`, `numberOfRooms`, `address`}).
- [ ] Trang có breadcrumb: `BreadcrumbList`.
- [ ] Kiểm tra bằng Rich Results Test sau deploy.

## URL & redirect
- [ ] Giữ thứ hạng URL cũ WordPress bằng `redirects()` 301 trong `next.config.ts`:
  - `/blog/:slug/.html` và `/blog/:slug` → `/tin-tuc/:slug`
  - `/blog` → `/tin-tuc`; `/danh-muc/:path*` → `/tin-tuc/danh-muc/:last`
  - `/lien-he-hop-tac` → `/lien-he`; `/donate` → `/ung-ho`; `/nguon-bds-thue` → `/kho-nguon#thue`; `/nguon-bds-ban` → `/kho-nguon#ban`
  - `/tu-van-thue-nha`, `/dan-khach-xem-nha`, `/tu-van-dau-tu`, `/tu-van-setup-noi-that` → `/dich-vu/:slug`
- [ ] Không có link nội bộ trỏ tới URL cũ (dùng URL mới).

## Core Web Vitals (mục tiêu Lighthouse ≥ 90 mobile)
- [ ] Ảnh qua `next/image`, `sizes` đúng, ảnh hero `priority` + `fetchPriority="high"`, còn lại lazy.
- [ ] Font `next/font` (self-host, `display: swap`, subset `vietnamese` + `latin`).
- [ ] JS client tối thiểu: chỉ đảo thành client component cho bộ lọc, gallery, yêu thích/so sánh, form.
- [ ] Bản đồ Leaflet nạp động (`dynamic(..., { ssr: false })`) chỉ khi có toạ độ.
- [ ] Không CLS: kích thước ảnh cố định / `aspect-ratio`.
- [ ] Trang tĩnh dùng ISR/`revalidate` hoặc static; revalidate theo tag khi admin sửa nội dung.
- [ ] Chạy Lighthouse (mobile) cho `/`, `/bat-dong-san`, `/tin-tuc/[slug]` và ghi điểm vào báo cáo.
