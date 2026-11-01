---
name: design-tokens
description: Hệ thống thiết kế của website Tuyn Tận Tâm (rút từ Stitch "Modern Real Estate Portal" + Houzez) — màu, font, type scale, spacing, bo góc, đổ bóng, layout grid và spec component (header, footer, card BĐS, card tin tức, form, filter, badge…). Dùng trước khi viết hoặc sửa bất kỳ UI nào, khi port layout từ Stitch, hoặc review giao diện.
---

# Design tokens — Tuyn Tận Tâm

Spec đầy đủ (layout từng trang, 28 component, responsive, motion): **`design-reference/design-notes.md`**. Ảnh gốc: `design-reference/stitch/{home,properties,about,blog}.png` (+ `slices/`). Tính năng bổ sung từ Houzez: `design-reference/gap-analysis.md`.
Tokens đã cài trong `src/app/globals.css` (`@theme`). **Không** dùng hex trực tiếp trong component — luôn dùng class token.

## 1. Hướng thiết kế (đã chốt)
- Bố cục Stitch/Houzez, tông xanh Zalo (khớp logo), nhiều khoảng trắng, card viền mảnh/bóng nhẹ, Be Vietnam Pro. Hỗ trợ sáng/tối (nút ở header, mặc định theo hệ điều hành).
- Chủ thể thật: **một môi giới cho thuê ở Hà Nội viết blog chia sẻ nghề** — giọng gần gũi, đáng tin; ưu tiên bài viết, câu chuyện, dịch vụ và kênh liên hệ. Không giả "luxury brokerage".
- Một điểm nhấn duy nhất mỗi trang (hero), phần còn lại tiết chế. Không fade-in từng section; motion chỉ khi người dùng tương tác (hover card, mở menu, gửi form) và tôn trọng `prefers-reduced-motion`.
- Eyebrow (chữ hoa nhỏ màu primary) chỉ dùng khi mang thông tin (chuyên mục, loại BĐS, tên section điều hướng) — không gắn trên mọi tiêu đề.
- Không thêm "→" vào mọi link; chỉ link "Xem tất cả"/"Đọc tiếp" có icon mũi tên SVG.

## 2. Màu (class Tailwind) — tông xanh Zalo, có dark mode
Giá trị sáng ở `@theme`, giá trị tối ghi đè trong `.dark` (`globals.css`). Component chỉ dùng class token, **không** dùng `bg-white`/hex — nền card/panel/input là `bg-surface-card`. Dùng `dark:` khi thật cần (variant gắn với class `.dark` trên `<html>`).

| Vai trò | Token | Sáng / Tối |
|---|---|---|
| Nền nút/badge chữ trắng (xanh Zalo, 4.75:1) | `brand-strong` | #0068FF |
| Hover nút nền xanh | `brand-hover` | #0050C8 |
| Mảng trang trí, pill active (chữ `on-primary-container` = trắng) | `primary-container` | #0068FF |
| Chữ nhấn, link, giá, eyebrow | `primary` | #0050C8 / #6AA8FF |
| Tint nền (chip, ô icon, khối nhấn) | `brand-subtle` | #E8F1FF / #12233D |
| Chữ nhấn trên dải tối `ink` | `primary-fixed-dim` | #9CC3FF |
| Secondary (badge "Cho thuê", nút Email nổi) | `secondary` / `secondary-deep` | #1E3A5F / #2D5A8C |
| Tiêu đề | `slate-dark` | #253246 / #DFE5EE |
| Chữ chính / body (dịu, không đen tuyền — đỡ mỏi mắt) | `on-surface` / `on-surface-variant` | #3A4658, #5D6A7E / #C5CDD9, #929EB0 |
| Nền trang / card | `surface` / `surface-card` | #F5F7FA, #FFF / #0D1219, #161E2A |
| Nền phụ | `surface-warm`, `surface-neutral`, `surface-container-low/…/high` | xem `globals.css` |
| Nền tối cố định (ảnh phủ, dải tối, badge trên ảnh) | `ink` | #0F172A (không đổi) |
| Hairline | `border-subtle` | #E2E8F0 / #263142 |
| Nút Gọi | `call` / `call-hover` | #15803D / #166534 |
| Mạng xã hội | `zalo` #0068FF, `facebook` #0866FF, `youtube` #FF0000, `telegram` #26A5E4, `x` đen (tối: trắng) | dùng `SOCIAL_BUTTON[platform]` trong `icons/social.tsx` |

## 3. Typography
- Font: `next/font/google` — **Be Vietnam Pro** (`--font-be-vietnam`, 400–800, `subsets: ["latin","vietnamese"]`) cho cả `font-display` (tiêu đề) và `font-sans`.
- Scale (class `text-*`): `headline-xl` 48/56 (mobile `headline-xl-mobile` 34/42), `headline-lg` 36/44 (mobile 28/36) — đậm 700; `headline-md` 26/34, `headline-sm` 20/28 — 600; `subheading` 13/20 700 tracking .08em, `body-lg` 18/28, `body-md` 15/24, `body-sm` 13/20, `spec-num` 14/18 700, `label-caps` 11/16 700 tracking .06em, `price-display` 22/28 800.
- Mobile-first: `text-headline-xl-mobile lg:text-headline-xl`, `text-headline-lg-mobile lg:text-headline-lg`. Body trên mobile tối thiểu 15px; nội dung bài viết dùng 17px/1.75, độ rộng ≤ 70ch.
- Dấu tiếng Việt: kiểm tra "Đ, Ữ, Ộ" không bị cắt.

## 4. Spacing, layout
- Container: utility `container-page` = `mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-6`.
- Section: `section-y` = `py-12 md:py-14 lg:py-20`. Header cố định cao 80px (`h-20`), `main` có `pt-20`.
- Named spacing: `space-xs` 6px, `space-sm` 12px, `space-md` 20px, `space-lg` 32px, `space-xl` 56px, `gutter` 24px.
- Grid desktop 12 cột: hero 7/5; danh sách BĐS 8/4 (sidebar phải); blog 8/4; featured post 7/5. Breakpoint Tailwind mặc định (sm 640, md 768, lg 1024, xl 1280).

## 5. Bo góc & bóng (đã chuẩn hoá — khác class trong HTML Stitch!)
- `rounded-xs` 2px: badge, nút nhỏ header, input footer, chip giá. `rounded-sm` 4px: nút chính, input/select, ô search, pagination, pill. `rounded-md` 6px: ô icon nhỏ. `rounded-lg` 8px: **card**, panel, ảnh. `rounded-xl` 12px: nút icon squircle (tim, social, ↗). `rounded-full`: avatar tròn, chấm.
- Bóng: `shadow-header`, `shadow-card` → hover `shadow-card-hover` + `-translate-y-1`, `shadow-float` (panel search/filter nổi), `shadow-form`, và `shadow-xs/md/xl` mặc định v4. (Port từ Stitch v3: `shadow-sm` → `shadow-xs`.)

## 6. Utilities có sẵn (`globals.css`)
`container-page`, `section-y`, `eyebrow`, `eyebrow-line`, `eyebrow-dot`, `card`, `card-lift`, `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-icon`, `badge`, `field`, `link-arrow`, `link-underline`, `overlay-bottom`, `prose-content` (nội dung bài viết/HTML import).

## 7. Icon
- `lucide-react` (SVG, tree-shake) thay Material Symbols của Stitch (tránh tải font icon, không nháy chữ). Cỡ 16/18/20/24, `aria-hidden` khi trang trí; nút chỉ có icon phải có `aria-label`.
- Bảng đổi: location_on→`MapPin`, call/phone_in_talk→`Phone`, mail→`Mail`, bed→`BedDouble`, bathtub→`Bath`, square_foot→`Ruler`, search→`Search`, tune→`SlidersHorizontal`, grid_view→`LayoutGrid`, view_agenda→`List`, map→`Map`, favorite→`Heart`, compare→`GitCompareArrows`, calendar_today→`CalendarDays`, schedule→`Clock`, arrow_forward→`ArrowRight`, north_east→`ArrowUpRight`, chevron→`ChevronLeft/Right/Down`, star→`Star`, verified→`BadgeCheck`, menu/close→`Menu`/`X`, calculate→`Calculator`, send→`Send`, key→`KeyRound`, handshake→`Handshake`, home_work→`Building2`, trending_up→`TrendingUp`, person_search→`UserSearch`, support_agent→`Headset`, sofa→`Sofa`.
- Logo mạng xã hội (Facebook, YouTube, X, Zalo, Telegram): SVG riêng trong `src/components/icons/social.tsx` (path từ Simple Icons).

## 8. Component chính (tóm tắt — chi tiết ở design-notes §c)
- **Header**: cố định, `bg-surface-card/90 backdrop-blur-xl shadow-header`; logo (`SiteLogo`, tự đổi bản chữ trắng ở dark); nav `text-subheading uppercase tracking-wider`, mục active = pill `bg-primary-container text-on-primary-container rounded-sm px-3 py-1.5` + `aria-current`; nút sáng/tối (không đặt hotline/nút liên hệ ở góc trên); mobile: hamburger 44×44 mở drawer (Esc đóng, khoá scroll, focus trap).
- **Footer**: `bg-surface-container-low`, 4 cột (thương hiệu+liên hệ, liên kết, dịch vụ/kho nguồn, kết nối+social), hàng copyright.
- **Property card** (grid): ảnh 4:3 (`img-zoom`), badge trạng thái góc trên trái, nút tim góc trên phải, chip giá `bg-white/90` góc dưới; body p-5: loại BĐS (eyebrow), tiêu đề `headline-sm`, địa chỉ, spec strip (PN / WC / m²), nút ↗. Biến thể list: `md:flex-row` ảnh 2/5.
- **Blog card**: ảnh 16:9, badge chuyên mục, ngày, tiêu đề `headline-sm line-clamp-2`, excerpt `line-clamp-2`, "Đọc tiếp".
- **Form**: card trắng `shadow-form` + vạch accent 6px `bg-primary-container` trên cùng; input `field`; nhãn `label-caps`; lỗi `ring-1 ring-error` + chữ `text-error` 13px; nút submit full-width `btn-primary`, trạng thái đang gửi disabled.
- **Status badge**: Cho thuê = `bg-secondary text-white`; Bán = `bg-ink/85 text-white`; Nổi bật = `bg-brand-strong text-white`. Badge trên ảnh dùng `bg-ink/85 text-white`.
- **Empty state**: card `surface-warm`, tiêu đề `headline-sm`, 1 câu giải thích, 1–2 hành động thật (Kho nguồn / Gửi nhu cầu).

## 9. Checklist trước khi giao UI (từ ui-ux-pro-max + frontend-design)
- [ ] Không emoji làm icon; icon cùng bộ lucide; `cursor-pointer` cho phần tử click được.
- [ ] Tương phản chữ ≥ 4.5:1 (chữ nhỏ), focus-visible rõ (`ring-2 ring-primary ring-offset-2`).
- [ ] Touch target ≥ 44×44 trên mobile; không cuộn ngang ở 375px; kiểm tra 375 / 768 / 1024 / 1440.
- [ ] Ảnh `next/image` có `alt` (alt null từ nguồn → `alt=""` nếu trang trí, hoặc dùng tiêu đề bài).
- [ ] Hover không làm xô lệch layout; transition 150–300ms; `motion-safe:` cho lift/zoom.
- [ ] Không dùng bất kỳ nội dung trong design-notes §g ("KHÔNG sao chép").
