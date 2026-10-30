# Design Notes — Website Bất Động Sản (nguồn: Stitch "Modern Real Estate Portal")

> Tài liệu duy nhất (single source of truth) cho việc build UI bằng **Next.js + Tailwind CSS v4**, ngôn ngữ giao diện **tiếng Việt**.
> Nguồn: Stitch project `16892240939811613878`. Design system tên "Terracotta & Slate Luxury Estates".
>
> **Độ tin cậy của nguồn:**
> - **Home**: có HTML gốc (`stitch/home.html`), nên class và token ở đây là **chính xác**.
> - **Properties / About / Blog**: `mcp__stitch__download_file` trả về lỗi `Requested entity was not found` cho cả 3 file HTML (`projects/16892240939811613878/screens/<id>/fileEntries/html`). Thử thêm biến thể `projects/.../files/html_<id>` và curl `downloadUrl` (HTTP 404) đều không được. Trong khi đó Home vẫn tải được với cùng định dạng tên. Vì vậy **không có** `properties.html`, `about.html`, `blog.html`. Mọi thông số của 3 trang này **đo từ screenshot** (1280px, 1x): sai số khoảng ±2–4px; tên class Tailwind là **suy luận** theo quy ước của Home.
> - Token chính thức: `designTheme.designMd` của project (lấy qua `get_project`), đã đối chiếu với `tailwind.config` trong `home.html`.
> - Màu nền và màu thành phần đã được kiểm tra bằng cách lấy mẫu pixel trên screenshot.

---

## a) Design tokens

### a.1 Bảng màu

Lưu ý quan trọng về cách đặt tên: trong HTML của Stitch, **`primary` = #9A442D** (terracotta đậm, dùng cho chữ nhấn/label) và **`primary-container` = #E07A5F** (terracotta tươi, **màu nền CTA chính**). Còn designMd gọi #E07A5F là "Primary". Khi build, giữ tên Stitch để port markup dễ, đồng thời thêm alias ngữ nghĩa (xem mục f).

#### Màu thương hiệu và màu nhấn (dùng thực tế)
| Token (Stitch) | Hex | Vai trò |
|---|---|---|
| `primary-container` | `#E07A5F` | **Brand terracotta**: nền nút CTA chính, nav active, badge "Open House", nút search, thanh accent trên đầu form card, trang hiện tại trong pagination, pill category đang chọn |
| `terracotta-hover` | `#C86247` | Hover của nút CTA (search, submit) |
| `primary` | `#9A442D` | Terracotta đậm: **chữ** eyebrow/label-caps, giá, link "Xem tất cả", icon nhấn, hover của nút ở header. Thanh trượt (slider) và đường chart ở Properties/Blog |
| `on-primary` | `#FFFFFF` | Chữ trên nền terracotta |
| `on-primary-container` | `#5B1604` | Chữ trên nav pill active (nền #E07A5F) |
| `coral-subtle` | `#FBEAE5` | Nền tint: chip hero, ô icon dịch vụ, section testimonial (About), newsletter strip, glow blob |
| `primary-fixed` | `#FFDBD2` | (dự phòng) tint terracotta đậm hơn |
| `primary-fixed-dim` / `inverse-primary` | `#FFB4A1` | Icon dấu ngoặc kép (quote) của testimonial (About), chấm nhạt |
| `secondary` | `#356380` | Teal/navy: badge "For Rent", nút "Schedule Tour" (Properties), badge category blog, avatar chữ cái "KM" |
| (designMd) secondary gốc | `#08415C` | Theo designMd dùng cho viền nút secondary/ghost. **HTML không dùng**, thay bằng `#356380` |
| `secondary-fixed` | `#C7E7FF` | Glow blob ở hero Home (opacity 40%), badge "Turnkey"/"30-YR FIXED" (tint xanh) |
| `secondary-container` | `#AFDDFE` | (ít dùng) |
| `tertiary` | `#805349` | Badge category nâu (Blog "Finance & Relocation"), dự phòng |
| `tertiary-container` | `#BF897E` | Badge "Acreage" (Properties) |
| designMd tertiary gốc | `#E9AFA3` | Soft blush coral (designMd). HTML dùng `coral-subtle` thay thế |
| `gold-accent` | `#D97706` | Sao đánh giá, icon `workspace_premium` |

#### Màu chữ / neutral
| Token | Hex | Vai trò |
|---|---|---|
| `slate-dark` | `#0F172A` | **Tiêu đề** (h1–h4), badge "For Sale" (85–90% opacity), gradient overlay ảnh |
| `on-surface` / `on-background` | `#111C2D` | Chữ chính, giá trị select, số thông số |
| designMd neutral | `#1E293B` | Slate navy (designMd). Có thể dùng thay `on-surface` |
| `on-surface-variant` | `#55423E` | **Body text** (nâu ấm), label form, link nav chưa active |
| `outline` | `#88726D` | Icon phụ (location nhỏ), ngày đăng blog, "Find me on" |
| `outline-variant` | `#DBC1BA` | Placeholder input |
| `inverse-surface` | `#263143` | (dự phòng) |

#### Surface / nền
| Token | Hex | Vai trò |
|---|---|---|
| `surface-container-lowest` | `#FFFFFF` | Card, header (90% + blur), form card |
| `surface` / `background` | `#F9F9FF` | **Nền body mặc định**, section listings/services/blog (Home), nền nội dung Properties/Blog |
| `surface-warm` | `#FDFBF9` | Nền ấm: section About/Contact (Home), Communities (Home), hero Properties/About, card dịch vụ/thống kê (About), panel nội dung featured post (Blog) |
| `surface-neutral` | `#F8FAFC` | Hero Home, section Philosophy và Communities (About), spec strip, ô filter |
| `surface-muted` | `#F1F5F9` | Track slider, nền phụ |
| `surface-container-low` | `#F0F3FF` | **Footer**, nền input/select (Home), spec strip của card (Home), pill category chưa chọn, hộp stats featured (Blog), nút prev/next |
| `surface-container` | `#E7EEFF` | Hover nút trắng, chip "Sale/Rent" chưa chọn |
| `surface-container-high` | `#DEE8FF` | Nền placeholder khi ảnh chưa tải |
| `surface-container-highest` / `surface-variant` | `#D8E3FB` | (dự phòng) |
| `surface-dim` | `#CFDAF2` | Placeholder bản đồ (About) |
| `border-subtle` | `#E2E8F0` | Hairline border 1px, vạch chia trong spec strip và filter bar |

#### Trạng thái
| Token | Hex |
|---|---|
| `error` | `#BA1A1A` |
| `on-error` | `#FFFFFF` |
| `error-container` | `#FFDAD6` |
| `on-error-container` | `#93000A` |

> **Accessibility:** chữ trắng trên `#E07A5F` có độ tương phản ≈ **2.95:1**, chưa đạt AA cho chữ 13px. Stitch vẫn dùng như vậy. Khi build: giữ chữ **bold, uppercase, ≥13px** như thiết kế và chấp nhận đây là "large-ish UI text", hoặc nếu cần đạt AA thì dùng chữ `#5B1604` (như nav active, 4.56:1). Chữ `#9A442D` trên nền trắng đạt 6.5:1.

### a.2 Font

- **Display / tiêu đề:** `Playfair Display` (serif). Google Fonts, trục 400–900 và italic. Dùng cho mọi h1–h5, tên agent, tiêu đề card, tên khu vực (community).
- **Sans / body:** `Plus Jakarta Sans`. Google Fonts, 200–800 và italic. Dùng cho body, label, nút, giá, thông số.
- **Icon:** `Material Symbols Outlined` (Google Fonts, variable: `opsz 20..48, wght 100..700, FILL 0..1, GRAD -50..200`). Mặc định FILL 0, wght 400. Sao đánh giá trong HTML đặt `font-variation-settings: 'FILL' 1`, nhưng screenshot render ra dạng outline; khi build hãy dùng **sao đặc (FILL 1)** đúng như designMd.
- **Tiếng Việt:** cả Playfair Display và Plus Jakarta Sans đều có subset `vietnamese`. Với `next/font/google` cần `subsets: ['latin','vietnamese']`. Chữ hoa tiếng Việt có dấu chồng (Ữ, Ẩ, Ộ) dễ bị cắt khi `label-caps` chỉ có line-height 14px, nên tăng lên ≥16px (`leading-[1.4]`) cho label-caps tiếng Việt. Playfair Display ở cỡ 48px với tracking âm vẫn ổn với dấu, nhưng cần kiểm tra lại "Đ", "ư", "ơ".
- Số trong thống kê của Home (20+, 100+) dùng Playfair nên ra kiểu old-style numerals. Ở About, số thống kê dùng **Plus Jakarta Sans 800**.

### a.3 Type scale (từ `tailwind.config` của Home và designMd, hai nguồn khớp nhau)

| Token | Font | Size | Weight | Line-height | Letter-spacing | Mobile |
|---|---|---|---|---|---|---|
| `headline-xl` | Playfair | 48px | 600 | 56px | -0.02em | **34px / 42px / -0.01em** (`headline-xl-mobile`) |
| `headline-lg` | Playfair | 36px | 600 | 44px | -0.015em | **28px / 36px / -0.01em** (`headline-lg-mobile`) |
| `headline-md` | Playfair | 26px | 600 | 34px | 0 | giữ nguyên (có thể dùng 24px) |
| `headline-sm` | Playfair | 20px | 600 | 28px | 0 | giữ nguyên |
| `subheading` | Jakarta | 13px | 700 | 20px | 0.08em (HTML thường ghi đè bằng `tracking-wider` = 0.05em hoặc `tracking-widest` = 0.1em), luôn UPPERCASE | giữ nguyên |
| `body-lg` | Jakarta | 18px | 400 | 28px | 0 | 16px / 26px (khuyến nghị) |
| `body-md` | Jakarta | 15px | 400 | 24px | 0 | giữ nguyên |
| `body-sm` | Jakarta | 13px | 400 | 20px | 0 | giữ nguyên |
| `spec-num` | Jakarta | 14px | 700 | 18px | 0 | giữ nguyên |
| `label-caps` | Jakarta | 11px | 700 | 14px | 0.06em (HTML thường dùng `tracking-wider`/`tracking-widest`), UPPERCASE | tăng line-height lên 16px cho tiếng Việt |
| `price-display` | Jakarta | 22px | 800 | 28px | -0.01em | giữ nguyên |

Cỡ chữ đo trên screenshot ở các trang chưa có HTML:
- Số thống kê About: Jakarta khoảng **40px / 800**, tiêu đề phụ 17px/600.
- Tiêu đề featured post (Blog): khoảng **36–38px** Playfair (dùng `headline-lg`).
- Tiêu đề card listing/blog ở Properties/Blog: khoảng **20–22px** Playfair (`headline-sm`).
- Giá trên ảnh (Properties): Jakarta 22–24px / 800 màu trắng.

Quy ước trong HTML: tiêu đề section dùng `font-headline-lg text-headline-lg text-slate-dark font-semibold`. Eyebrow dùng `font-label-caps text-label-caps text-primary uppercase tracking-widest font-bold`.

### a.4 Spacing scale (named, từ config và designMd)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `space-xs` | 0.375rem (6px) | gap nhỏ, padding dọc của nút header |
| `space-sm` | 0.75rem (12px) | padding ô search, gap grid nhỏ |
| `space-md` | 1.25rem (20px) | padding body card, gap grid blog |
| `space-lg` | 2rem (32px) | gap grid listing/services, padding form card |
| `space-xl` | 3.5rem (56px) | **padding dọc section** (`py-space-xl`) |
| `gutter` | 1.5rem (24px) | padding ngang container (`px-gutter`) |
| `gutter-mobile` | 1rem (16px) | gutter cột trên mobile |
| `margin` | 3rem (48px) | lề trang desktop (theo designMd; **HTML không dùng**) |
| `margin-mobile` | 1.25rem (20px) | lề trang mobile |

Nhịp dọc đo được:
- Section Home: `py-space-xl` (56px). Section ở About/Blog rộng hơn, khoảng **80–96px** (ví dụ Services About: tiêu đề bắt đầu sau ~96px). Khuyến nghị: `py-14 lg:py-20`.
- Footer có `mt-space-xl` (56px) tách khỏi main.

### a.5 Border radius

**Cảnh báo:** `tailwind.config` của Stitch **ghi đè** thang radius mặc định:
`DEFAULT: 0.125rem (2px)`, `lg: 0.25rem (4px)`, `xl: 0.5rem (8px)`, `full: 0.75rem (12px)`.
Nghĩa là `rounded-full` trong HTML **không phải hình tròn** mà chỉ là 12px. Avatar 32–44px và nút icon tròn render ra dạng **squircle**, đúng như screenshot (nút tim, icon social ở footer, nút ↗).

Thang radius chuẩn hoá cho build (khớp designMd `sm/DEFAULT/md/lg/xl`):

| Token v4 | px | Thay cho class HTML | Dùng cho |
|---|---|---|---|
| `rounded-xs` | 2px | `rounded` | Nút header, status badge, price overlay, input newsletter/footer, tag blog, nút "Schedule Tour", chip thông tin |
| `rounded-sm` | 4px | `rounded-lg` | Nav pill active, ô search, nút search, input/select form, nút submit, ô icon dịch vụ, tile community (Home), pagination, pill category |
| `rounded-md` | 6px | (không có) | Ô icon nhỏ (About features), avatar chữ cái (Blog) |
| `rounded-lg` | 8px | `rounded-xl` | **Card** (property, blog, service, testimonial), panel search, form card, ảnh hero, newsletter box, tile community (About) |
| `rounded-xl` | 12px | `rounded-full` | Chip/pill hero, nút icon vuông-tròn (tim, ↗, social), avatar trong agent card |
| `rounded-full` | 9999px | – | Avatar tròn thật (designMd: "Avatars & Feature Icons: full circular"), chấm eyebrow, thumb slider, donut |

Riêng form card ở About (Schedule a Strategy Meeting) trông khoảng 16px, có thể dùng `rounded-2xl` (16px) hoặc giữ 8–12px để đồng bộ.

### a.6 Shadows (CSS chính xác)

| Token | CSS | Dùng cho |
|---|---|---|
| `shadow-header` | `0 1px 8px rgba(0,0,0,0.04)` | Header cố định, input footer, icon social |
| `shadow-card` | `0 4px 20px -2px rgba(15,23,42,0.05)` | Property card, blog card (trạng thái nghỉ) |
| `shadow-card-hover` | `0 12px 28px -4px rgba(15,23,42,0.10)` | Card khi hover (kèm `translateY(-3px…-4px)`) |
| `shadow-float` | `0 16px 36px -6px rgba(15,23,42,0.08)` | Panel search nổi, filter bar Properties, form card About |
| `shadow-form` | `0 8px 30px rgba(0,0,0,0.06)` | Card "Contact Me" ở Home |
| `shadow-xs`* | `0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1)` | `shadow-sm` của Tailwind v3 (CDN): card thống kê, service card, testimonial, nút social |
| `shadow-md`* | `0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1)` | Nút search/submit, hover service card |
| `shadow-lg`* | `0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)` | Badge nổi trên ảnh hero |
| `shadow-xl`* | `0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1)` | Khung ảnh hero, badge "20+ Years" (About), note card "Discreet representation" |

\* **Chú ý khi chuyển v3 sang v4:** Tailwind v4 đổi tên shadow: `shadow-sm` của v3 thành `shadow-xs` trong v4, còn `shadow` của v3 thành `shadow-sm` trong v4. Khi port class từ HTML Stitch (v3) phải đổi `shadow-sm` sang `shadow-xs`. Tương tự `rounded-sm` của v3 thành `rounded-xs` của v4 (nhưng ở đây ta đã có thang radius riêng, xem a.5).

Kính mờ (glass) theo designMd:
- Sáng: `background: rgba(255,255,255,0.92); backdrop-filter: blur(8px)` (HTML: `bg-surface-container-lowest/90 backdrop-blur-md`).
- Tối: `background: rgba(15,23,42,0.7); backdrop-filter: blur(8px)` (HTML: `bg-slate-dark/85 backdrop-blur-sm`).

### a.7 Container, breakpoint, grid

- **Container:** `max-w-7xl` (1280px) `mx-auto px-gutter` (24px). Ở viewport 1280, nội dung rộng 1232px (x = 24 đến 1256). Khuyến nghị: `px-5 md:px-8 lg:px-6` (20px mobile theo `margin-mobile`, 32px tablet theo designMd, 24px desktop theo HTML).
- **Breakpoint:** mặc định Tailwind: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. HTML dùng cả bốn. designMd: Mobile <768 (4 cột, gutter 16px), Tablet 768–1023 (8 cột, gutter 20px), Desktop ≥1024 (12 cột, gutter 24px).
- **Grid:** layout desktop dựa trên `grid-cols-12`:
  - Hero Home: 7/5.
  - About + Contact (Home): 7/5, gap 56px.
  - Properties: main **8** / sidebar **4**, gap 32px.
  - Blog: main 8 / sidebar 4.
  - Featured post Blog: ảnh 7 / nội dung 5.
  - About hero: 7/5. Philosophy: 5/7. Contact About: 5/7.
- **Header** cao **80px** (`h-20`), main có `pt-20`.

---

## b) Layout từng trang (từ trên xuống, chiều cao đo ở 1280px)

### b.1 Home (5634px) — HTML có sẵn

| # | Section | y / cao | Nền | Layout & thành phần chính |
|---|---|---|---|---|
| 0 | Header (fixed) | 0–80 | trắng/90 + blur | Xem c.1 |
| 1 | **Hero + floating search** | 80–818 (~738) | `surface-neutral` + 2 glow blob (coral-subtle `w-96 h-96 blur-3xl opacity-70` ở góc trên phải `-top-24 -right-24`; secondary-fixed `w-80 h-80 opacity-40` ở `top-1/2 -left-32`) | `grid lg:grid-cols-12 gap-space-lg items-center`, `pt-space-lg lg:pt-space-xl`. **Trái (7):** chip `verified` + "Premier…" (coral-subtle, rounded-xl), H2 `headline-xl` slate-dark, tagline `subheading` primary uppercase tracking-widest, đoạn `body-lg` on-surface-variant `max-w-xl`, dòng liên hệ (icon `location_on`, `phone_in_talk` màu primary), hàng social "Find me on" gồm 4 nút 32px. **Phải (5):** ảnh chân dung `aspect-[4/5] max-w-md rounded-xl shadow-xl`, gradient `from-slate-dark/70 via-transparent`, thẻ nổi đáy ảnh (`bottom-4 left-4 right-4`, trắng/95 blur, label-caps primary + headline-sm, icon `workspace_premium` gold 30px). **Search panel** ở dưới, `lg:-mt-6` đè lên đáy hero (xem c.2) |
| 2 | About ngắn + Form liên hệ | 818–1436 (~618) | `surface-warm` | `grid lg:grid-cols-12 gap-space-xl`. **Trái (7):** eyebrow có vạch (`h-0.5 w-6 bg-primary`) + "About Me", H3 `headline-lg`, 3 đoạn `body-md leading-relaxed`, rồi 3 thẻ thống kê `grid-cols-3 gap-space-sm` (trắng, `rounded-xl` cũ, `shadow-sm`, số `headline-lg` primary). **Phải (5):** form card (xem c.21) |
| 3 | Listing mới nhất | 1436–2606 (~1170) | `surface` | Header section dạng split (eyebrow + H3 bên trái, link "View all →" bên phải, `md:flex-row md:items-end`). Grid `1 / md:2 / lg:3`, `gap-space-lg` (32px), 6 property card (biến thể Home, c.5a) |
| 4 | Newsletter strip | 2606–2824 (~218) | `coral-subtle` | `py-space-lg`. Hộp trắng/80 blur `rounded-xl p-space-md lg:p-space-lg shadow-sm`, grid 12: chữ 4 cột + form 8 cột (2 input + nút). Xem c.17 |
| 5 | Khu vực (communities) | 2824–3290 (~466) | `surface-warm` | Header split. Grid `2 / md:3 / lg:6`, `gap-space-sm` (12px), tile `aspect-[3/4]` (xem c.22) |
| 6 | Dịch vụ | 3290–4091 (~801) | `surface` | Header căn giữa `max-w-2xl` (eyebrow, H3, `body-md`), `mb-space-xl`. Grid `1 / md:2 / lg:3`, gap 32px, 6 service card (c.23) |
| 7 | Testimonials | 4091–4614 (~523) | `coral-subtle/40` (render #F9F3F4) | Header giữa: 5 sao gold, label-caps, H3. Grid `1 / md:3`, gap 32px, 3 card (c.10a) |
| 8 | Blog preview | 4614–5256 (~642) | `surface` | Header split ("Read my blog →"). Grid `1 / sm:2 / lg:4`, `gap-space-md` (20px), 4 blog card (c.11a) |
| 9 | Footer | 5256–5634 (~378) | `surface-container-low` | Xem c.3 |
| – | Nút nổi "Buy Now / Templates" | fixed bottom-6 right-6 | – | **Artifact demo của Stitch, KHÔNG làm** |

### b.2 Properties / Danh sách BĐS (2574px), đo từ screenshot

| # | Section | y / cao | Nền | Layout & thành phần |
|---|---|---|---|---|
| 0 | Header | 0–80 | trắng | Nav active = "Properties" |
| 1 | **Page hero** | 80–386 (~303) | `surface-warm` | Container, `pt ~56px`. Eyebrow dạng **chấm tròn 8px primary-container + label-caps primary**. H1 `headline-xl` (2 dòng, rộng khoảng 7/12). Mô tả `body-lg` on-surface-variant, `max-w ~ 640px`. **Bên phải, căn đáy:** stat card nhỏ (trắng, rounded-xs, shadow-xs, p 12–16px): số "148" Jakarta 22px/800 + label-caps "VERIFIED LISTINGS", ô icon 40×40 coral-subtle chứa icon primary (`real_estate_agent`/`holiday_village`) |
| 2 | **Filter bar** | 386–470 (84px) | trắng, full-bleed + `shadow-float` | Hàng ngang trong container: 6 ô filter + nút reset + nút "Filter" (c.13). Khuyến nghị cho `sticky top-20 z-40` trên lg |
| 3 | **Nội dung: list + sidebar** | 470–2196 | `surface` (#F9F9FF) | `pt ~56px pb ~100px`. `grid lg:grid-cols-12 gap-8`. **Main (8 cột, rộng 811px):** toolbar (c.14 và c.15), grid card `md:grid-cols-2 gap-5` (20px) với 6 card biến thể Properties (c.5b, mỗi card cao ~448px), pagination (c.12a) cách 52px. **Sidebar (4 cột, rộng 389px), gap dọc 32px:** agent card (c.9), Mortgage Estimator (c.24), Hot Enclaves (c.22b), form "Request Property Docket" (c.21b) |
| 4 | Footer | 2196–2574 | `surface-container-low` | Giống Home |

### b.3 About / Giới thiệu (6505px), đo từ screenshot

| # | Section | y / cao | Nền | Layout & thành phần |
|---|---|---|---|---|
| 1 | **Hero giới thiệu** | 80–832 (~750) | `surface-warm` | Grid 12, 7/5, `items-center`. **Trái:** eyebrow dạng **vạch ngang 24px (1px primary-container) + label-caps primary**. H1 `headline-xl` 3 dòng. Đoạn `body-lg`. Hàng **info chip** (trắng, rounded-xs, shadow-xs, `px-4 py-2.5`, icon primary 16px + body-sm; chip cuối là label-caps; icon: `location_on`, `chat`/`sms`, `verified`). 2 nút: **primary lớn** (`px-6 py-4`, label-caps/subheading, `arrow_forward`, shadow-md) và **secondary trắng** (nền trắng, chữ slate-dark, shadow-xs). **Phải:** ảnh `aspect-[4/5]` (~448×560) `rounded-lg`. **Phía sau ảnh** là một panel `coral-subtle` lệch ra ngoài khoảng 8–24px và **xoay khoảng 2°** (`rotate-2`). Overlay chữ label-caps trắng ở đáy ảnh. **Badge nổi** đè góc dưới trái (`-left-6 -bottom-6`): trắng, rounded-sm, shadow-xl, p-5, ô icon 48px coral-subtle (`workspace_premium` primary), số "20+ …" Jakarta 22px/700 và body-sm |
| 2 | **4 thẻ thống kê** | 832–1146 (~314) | trắng | Grid `lg:grid-cols-4 gap-8`. Card nền `surface-warm`, rounded-sm/lg, shadow-xs rất nhạt, p-6. Hàng trên: label-caps primary và icon primary 18px bên phải (`history_edu`, `monitoring`, `favorite`, `hub`). Số Jakarta **40px/800** slate-dark, tiêu đề 17px/600, mô tả body-sm. Xem c.20 |
| 3 | **Triết lý (ảnh + văn bản)** | 1146–1979 (~833) | `surface-neutral` | Grid 12, 5/7, gap ~56px. **Trái:** ảnh cao ~640px, `rounded-lg`, shadow. **Note card** đè lên cạnh phải-dưới ảnh (trắng, rounded-sm, shadow-xl, p-5, w ~256px): icon `shield`/`verified_user` primary + label-caps slate "…" + body-sm. **Phải:** eyebrow có vạch, H2 `headline-lg` 2 dòng, 3 đoạn `body-md`, rồi grid 2 cột "feature" (ô icon 32px coral-subtle rounded-md + tiêu đề Playfair 17px/600 + body-sm) |
| 4 | **Dịch vụ (6 card)** | 1979–3091 (~1112) | trắng | Header **split**: trái là eyebrow có vạch + H2 `headline-lg` 2 dòng; phải (cột 7–12, căn đáy) là đoạn `body-md`. Grid `lg:grid-cols-3 gap-8`, mỗi card cao ~360px (c.23b) |
| 5 | **Khu vực (5 tile)** | 3091–3587 (~496) | `surface-neutral` | Header split (eyebrow + H2, link "View all …" bên phải). Grid `lg:grid-cols-5 gap-5`, tile ~230×288 (`aspect-[4/5]`), `rounded-lg` |
| 6 | **Testimonials** | 3587–4295 (~708) | `coral-subtle` (đậm hơn Home) | Header giữa: 5 sao gold, label-caps primary, H2 `headline-lg` giữa. Grid 3 cột gap 32px, card trắng p-8 (c.10b) |
| 7 | **Liên hệ** | 4295–5250 (~955) | trắng | Grid 12, 5/7, gap ~56px. **Trái:** eyebrow, H2 2 dòng, `body-md`, 3 **info card** (nền surface-warm, rounded-sm, p-5, icon primary 24px `location_on`/`smartphone`/`verified` + tiêu đề Playfair 17px + body-sm + label-caps on-surface-variant), **placeholder bản đồ** (`surface-dim`, rounded-lg, cao ~192px, giữa có chip trắng chứa icon `map` + chữ 14px/600). **Phải:** form card lớn (c.21c) |
| 8 | **Bài viết (4 card)** | 5250–5833 (~583) | `surface-warm` | Header split. Grid `lg:grid-cols-4 gap-5` (c.11c) |
| 9 | **Newsletter banner** | 5833–6071 (~238) | `surface-neutral` (band) | Box `coral-subtle`, rounded-lg/xl, `p-10`, grid 2 cột: trái là label-caps primary + `headline-md` + body-sm; phải là form inline 2 input (trắng, h-11) + nút primary-container "SUBSCRIBE" (c.17b) |
| 10 | Footer | 6127–6505 | `surface-container-low` | Giống Home (56px khoảng trắng `surface` ở trên) |

### b.4 Blog / Tin tức & Thị trường (3873px), đo từ screenshot

| # | Section | y / cao | Nền | Layout & thành phần |
|---|---|---|---|---|
| 1 | **Page hero** | 80–~430 | `surface` + glow coral rất nhạt ở góc phải trên | Eyebrow dạng **vạch 32px (2px primary) + label-caps primary**. H1 `headline-xl` 2 dòng. Mô tả `body-lg`. **Phải, căn đáy:** stat card trắng (giá trị primary bold + label-caps + icon `auto_graph` primary). **Hàng category pill** cách ~32px (c.12b) |
| 2 | **Featured post** | 462–1075 (~613) | card | Card ngang full-width, `rounded-lg overflow-hidden shadow-card`, grid 12: ảnh 7 cột (cover, 2 badge góc trên trái), panel nội dung 5 cột nền `surface-warm` padding ~56px (c.11b) |
| 3 | **Grid bài + sidebar** | 1131–~2700 | `surface` | Grid 12, gap 32px. **Main 8:** grid `md:grid-cols-2 gap-8`, 6 blog card (c.11d), sau đó thanh pagination (c.12c). **Sidebar 4** (gap dọc 32px): newsletter card gradient (c.17c), mini property card (c.5c), chart "Median price per sqft" (c.25), tag cloud (c.26), CTA "Questions on a deal?" (c.18b) |
| 4 | **Testimonials** | 2901–3439 (~538) | `coral-subtle/50` (render #FAF0F1) | Header giữa, 3 card với khối tác giả nền surface-warm và avatar chữ cái (c.10c) |
| 5 | Footer | 3495–3873 | `surface-container-low` | Giống Home |

---

## c) Inventory component (spec chi tiết)

> Ký hiệu: class viết theo thang **đã chuẩn hoá** ở mục a.5/f (ví dụ `rounded-lg` = 8px). Khi đọc HTML Stitch nhớ đổi radius.
> Icon: **Material Symbols Outlined** (tên icon in nghiêng). Những icon chỉ thấy trên screenshot ghi "(≈)" vì là ước lượng.

### c.1 Header / Navbar
- **Cấu trúc:** `header.fixed.top-0.inset-x-0.z-50.bg-white/90.backdrop-blur-xl.shadow-header`, bên trong là `div.h-20.max-w-7xl.mx-auto.px-gutter.flex.items-center.justify-between`.
- **Không trong suốt trên hero.** Header luôn trắng 90% + blur, cố định (sticky) trên mọi trang. Main phải có `pt-20`.
- **Logo:** khối 2 dòng `flex flex-col`: tên `font-display text-headline-sm font-semibold tracking-tight text-on-surface` và dòng phụ `label-caps text-primary uppercase tracking-widest`. Khi build, thay bằng logo/thương hiệu thật.
- **Nav (`hidden lg:flex items-center gap-8`):** link `font-sans text-subheading uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors`.
  - **Active:** `bg-primary-container text-on-primary-container rounded-sm px-3 py-1.5` (pill terracotta, chữ nâu đậm #5B1604). Dùng `aria-current="page"`.
- **Bên phải (`flex items-center gap-5`):**
  - Hotline (`hidden xl:flex flex-col text-right`): label-caps on-surface-variant + `spec-num` on-surface.
  - Nút CTA (`hidden sm:inline-flex`): `bg-primary-container text-white text-subheading uppercase tracking-wider px-5 py-1.5 rounded-xs hover:bg-primary transition-colors`, icon *event* `text-sm mr-1`.
  - Avatar 32px (`rounded-xl` = squircle) shadow-header. Trên screenshot đây là ảnh lỗi ("DU"); khi build thay bằng logo/avatar thật hoặc bỏ.
- **Mobile:** HTML **không có** hamburger (nav chỉ ẩn đi). Xem c.1b.

### c.1b Mobile menu (tự thiết kế, Stitch không có)
- Dưới `lg`: hiện nút icon 40×40 `rounded-sm hover:bg-surface-container-low` với icon *menu* (khi mở đổi thành *close*), đặt cuối hàng bên phải. Ẩn hotline; nút CTA hiện từ `sm`.
- Panel: drawer phủ dưới header `fixed inset-x-0 top-20 bottom-0 bg-white/95 backdrop-blur-xl`, `px-5 py-6`. Link dạng danh sách `text-subheading uppercase tracking-wider py-3 border-b border-border-subtle`; mục active dùng chữ `text-primary` kèm vạch trái 2px primary-container. Cuối panel: hotline và nút CTA full-width.
- Chuyển động: `transition-[opacity,transform] duration-300`, từ `opacity-0 -translate-y-2` sang `opacity-100 translate-y-0`. Khoá scroll body khi mở, đóng bằng phím Esc, có focus trap.

### c.3 Footer
- `footer.bg-surface-container-low.text-on-surface.mt-space-xl`, bên trong `max-w-7xl px-gutter py-space-xl`.
- Grid `1 / md:2 / lg:4`, `gap-8 mb-8`:
  1. **Thương hiệu:** tên `headline-sm` Playfair, tagline label-caps primary `tracking-widest mb-5`, 3 dòng liên hệ `body-sm on-surface-variant` có icon primary 16px (*location_on*, *call*, *mail*), `space-y-1.5`.
  2. **Liên kết nhanh:** tiêu đề `text-subheading uppercase tracking-wider mb-5`, `ul.space-y-1.5` mỗi mục có icon *chevron_right* 14px màu outline + `body-sm on-surface-variant hover:text-on-surface`.
  3. **Bản tin:** tiêu đề + mô tả `body-sm`, input (trắng, `rounded-xs`, `px-3 py-1.5`, shadow-header, `focus:ring-1 ring-primary`) và nút full-width primary-container `rounded-xs py-1.5 uppercase` `hover:bg-primary`.
  4. **Kết nối:** tiêu đề + `body-sm` + 4 nút social **36×36** (`w-9 h-9 rounded-xl bg-white shadow-header text-on-surface-variant hover:text-primary`), icon 18px (*public*, *share*, *mark_email_unread*, *verified*). Khi build nên thay bằng icon mạng xã hội thật (Facebook, Zalo, YouTube…; Material Symbols không có logo thương hiệu, nên dùng SVG riêng).
- Hàng dưới: `pt-8 flex flex-col sm:flex-row justify-between gap-3 body-sm on-surface-variant` gồm copyright bên trái và 3 link (Chính sách bảo mật, Điều khoản, Sitemap) `gap-5 hover:text-on-surface`.
- Footer cao ~378px ở desktop.

### c.4 Hero + floating search bar (Home)
- Xem bố cục ở b.1 #1.
- **Search panel:** `form.bg-white.rounded-lg.shadow-float.p-3.lg:p-5.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-5.gap-3.items-center`, đặt trong `div.mt-8.lg:-mt-6.relative.z-20`.
  - **Ô field** (×4): `flex flex-col px-3 py-1 bg-surface-container-low rounded-sm`. Label `label-caps uppercase tracking-wider on-surface-variant mb-1 flex items-center gap-1` có icon 12px primary (*location_city*, *apartment*, *sell*, *bed*). `select.bg-transparent.text-subheading.text-on-surface.focus:outline-none.cursor-pointer`. Trên screenshot, chữ giá trị là Jakarta 13–14px/700 có tracking.
  - **Nút Search:** `w-full h-full min-h-[50px] bg-primary-container hover:bg-terracotta-hover text-white text-subheading uppercase tracking-widest rounded-sm flex items-center justify-center gap-1.5 shadow-md transition-colors`, icon *search* 18px.
- designMd mô tả phiên bản khác: các segment cách nhau bằng vạch dọc `#E2E8F0` và nút SEARCH "edge-to-edge". HTML dùng ô nền tint có khe hở. **Theo HTML.**

### c.5 Property card

**c.5a — Biến thể grid (Home), class chính xác:**
```
article.group.bg-white.rounded-lg.overflow-hidden.shadow-card
  hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col
├─ div.relative.aspect-[4/3].overflow-hidden.bg-surface-container-high
│   img.w-full.h-full.object-cover.group-hover:scale-105.transition-transform.duration-500
│   div.absolute.top-3.left-3.flex.gap-2 → status badge(s) (c.6)
│   div.absolute.bottom-3.left-3.bg-white/90.backdrop-blur-md.px-3.py-1.rounded-xs
│       span.text-price-display.text-primary.font-extrabold  (giá)
│       span.text-body-sm.text-on-surface-variant.ml-1.font-medium  (giá phụ: /tháng, /m²)
└─ div.p-5.flex.flex-col.flex-1.justify-between
    span.label-caps.text-primary.tracking-widest.mb-1   (loại BĐS)
    h4.font-display.text-headline-sm.text-slate-dark.group-hover:text-primary.transition-colors
    p.body-sm.on-surface-variant.mt-1 (icon location_on 14px màu outline + địa chỉ)
    div (spec strip): pt-5 mt-5 bg-surface-container-low -mx-5 -mb-5 px-5 py-3 flex justify-between
        3 × span.flex.items-center.gap-1.text-spec-num (icon 16px primary: bed, bathtub, square_foot)
        button.w-8.h-8.rounded-xl.bg-white.text-primary.shadow-xs hover:bg-primary hover:text-white (icon north_east)
```
Card cao ~466px ở cột 389px (ảnh 4:3 ~292px).

**c.5b — Biến thể Properties (đầy đủ hơn), đo từ screenshot (card rộng 395px, cao ~448px):**
- Ảnh **`aspect-video`** (16:9, cao ~224px). Gradient đáy `from-slate-dark/70 to-transparent` để chữ trắng đọc được.
- Góc trên trái: 2 badge (c.6). Góc trên phải (`top-3 right-3`): **nút yêu thích** 32×32 `rounded-xl bg-white/90 backdrop-blur` icon *favorite* 18px màu on-surface. Hover: chữ primary; khi active: icon FILL 1 màu primary-container.
- Đáy trái (`bottom-3 left-3`): **giá màu trắng** Jakarta 22–24px/800 kèm dòng phụ 12px/600 trắng/90 tracking-wide (ví dụ "…/tháng (ước tính)").
- Đáy phải: **tag khu vực** nền trắng, `rounded-xs px-2 py-1`, label-caps slate-dark.
- Body `p-5`:
  - Dòng địa chỉ: label-caps **primary** `tracking-widest` có icon *location_on* 14px.
  - Tiêu đề `headline-sm` slate-dark (mt-2).
  - Mô tả `body-sm on-surface-variant line-clamp-2` (mt-1).
  - **Spec strip** (c.7) (mt-4).
  - Hàng cuối `mt-4 flex justify-between items-center`: loại BĐS bằng label-caps **on-surface-variant** (màu nâu muted), và nút **"Đặt lịch xem →"** dạng nút secondary đặc: `bg-secondary text-white label-caps tracking-wider px-3 py-1.5 rounded-xs hover:bg-[#08415C]`, icon *arrow_forward* 14px.
- Card: `bg-white rounded-sm/lg shadow-card` (screenshot trông bo khoảng 4px; nên dùng `rounded-lg` 8px để đồng bộ). Hover giống c.5a.

**c.5c — Mini property card (sidebar Blog):** ảnh cao ~192px (`aspect-[2/1]`), 2 badge, **price chip** trắng/90 ở đáy trái (`price-display` primary + "/ …" body-sm). Body p-5: label-caps primary, `headline-sm` (có ký tự "•" giữa tên loại và khu vực), body-sm 2 dòng, spec strip, nút full-width **nền `surface-container`/`secondary-fixed` nhạt, chữ slate-dark** `text-subheading uppercase tracking-wider py-3 rounded-xs hover:bg-secondary hover:text-white`.

**c.5d — Biến thể list (Stitch không vẽ, cần cho toggle "list"):** dùng `md:flex-row`: ảnh `md:w-2/5 md:aspect-auto md:min-h-[240px]`, body `md:w-3/5 p-6`. Giữ thứ tự nội dung như c.5b, mô tả `line-clamp-3`, spec strip và hàng CTA ở đáy (`mt-auto`). Dưới `md` thì quay về layout dọc của grid card.

### c.6 Status badges
- Base: `px-2.5 py-1 rounded-xs label-caps uppercase tracking-wider` (11px/700).
- Biến thể:
  - **Đang bán / For Sale:** `bg-slate-dark/85 text-surface-warm backdrop-blur-sm`.
  - **Cho thuê / For Rent:** `bg-secondary text-white` (Home). Ở Properties, "For Rent" dùng `bg-primary-container` (không nhất quán; khuyến nghị **secondary cho thuê**).
  - **Nổi bật / Open House / Exclusive:** `bg-primary-container text-white`.
  - **Thuộc tính phụ** (view, nội thất…): `bg-secondary text-white` hoặc `bg-secondary-fixed text-slate-dark` (Turnkey), `bg-tertiary-container text-on-tertiary-container` (Acreage), `bg-slate-dark text-white` (Furnished).
  - **Featured cover / read time (Blog):** primary-container hoặc slate-dark, cùng kích thước.
- Badge category trên ảnh blog (Home): `top-2.5 right-2.5 px-2 py-0.5 rounded-xs bg-white/90 backdrop-blur-sm label-caps text-primary`.
- Đặt nhóm badge trong `absolute top-3 left-3 flex gap-2`.

### c.7 Spec strip (thông số phòng ngủ / phòng tắm / diện tích)
- **Home:** dải nền `surface-container-low` tràn sát mép card (`-mx-5 -mb-5 px-5 py-3`), item `flex items-center gap-1 text-spec-num text-on-surface`, `gap-4`, icon 16px primary: *bed*, *bathtub*, *square_foot*. Nút ↗ ở bên phải.
- **Properties/Blog:** hộp `bg-surface-neutral rounded-xs px-3 py-2.5 grid grid-cols-3`, mỗi ô `flex items-center gap-1.5` có **vạch chia dọc 1px `border-subtle`** (`divide-x divide-border-subtle`). Ô 1 căn trái, ô 2 căn giữa, ô 3 căn phải. Số `font-bold` 14px on-surface + đơn vị body-sm on-surface-variant (ví dụ "4 PN", "2 WC", "120 m²"). Icon diện tích ở sidebar Blog là *straighten* (≈).
- Tiếng Việt: dùng **"PN" / "WC" / "m²"** hoặc "phòng ngủ" / "phòng tắm"; sq ft đổi thành m².

### c.8 Hiển thị giá
- `text-price-display` (22px/800/-0.01em), màu `text-primary` (#9A442D) khi nằm trên chip trắng; màu trắng khi nằm trực tiếp trên gradient ảnh.
- Giá phụ: `body-sm font-medium on-surface-variant ml-1` (trên chip) hoặc 12px/600 trắng/90 (trên ảnh).
- Chip giá: `bg-white/90 backdrop-blur-md px-3 py-1 rounded-xs`.
- VN: định dạng "12,5 tỷ", "25 triệu/tháng", "85 triệu/m²". Dùng `Intl.NumberFormat('vi-VN')`. Không dùng ký hiệu $.

### c.9 Agent card (sidebar Properties)
- `bg-white rounded-lg shadow-card p-5`.
- Đầu card: avatar **64×64 `rounded-xl`** object-cover + khối tên: tên `headline-sm` Playfair 22px slate-dark; chức danh label-caps **primary**; dòng đánh giá gồm icon *star* gold 16px + điểm `spec-num` + số đánh giá body-sm on-surface-variant.
- Bio `body-sm on-surface-variant mt-4`.
- Stats strip: `mt-4 bg-surface-neutral rounded-xs grid grid-cols-3 py-3 text-center`, số Jakarta 15px/700 slate, nhãn 11px uppercase **outline** (#88726D) font-normal.
- Nút gọi: `mt-4 w-full bg-surface-neutral py-2.5 rounded-xs text-spec-num text-slate-dark` với icon *call* primary. Hover `bg-surface-container`.
- CTA: `mt-2 w-full btn-primary` với icon *mail* và chữ uppercase tracking-wider.

### c.10 Testimonial card
- **a (Home):** `bg-white p-8 rounded-lg shadow-xs flex flex-col justify-between`. Trích dẫn `body-md text-on-surface italic leading-relaxed mb-5` có dấu “ ”. Footer tác giả tràn mép: `-mx-8 -mb-8 px-8 py-3 bg-surface-warm rounded-b-lg flex items-center gap-3`, avatar 44px (`rounded-xl` squircle), tên Playfair **16px** (`text-base leading-tight`) slate-dark, vai trò label-caps primary.
- **b (About):** card trắng p-8 cao hơn (~366px). Đầu card có icon *format_quote* (≈) 28px màu `primary-fixed-dim` (#FFB4A1). Quote italic body-md. Tác giả ở đáy (`mt-auto`): avatar 48px rounded-md + tên Playfair 17px + vai trò label-caps primary.
- **c (Blog):** card trắng p-8. Khối tác giả `mt-5 bg-surface-warm rounded-xs p-2 flex gap-3`, **avatar chữ cái** 40×40 `rounded-md` nền primary-container / secondary / primary, chữ trắng 14px/700. Tên Jakarta 14px/700, vai trò label-caps slate.
- **Header section:** 5 sao (*star*, FILL 1, `text-gold-accent text-xl`, `gap-1`), label-caps (on-surface-variant hoặc primary), H2 `headline-lg` căn giữa.

### c.11 Blog card
- **a (Home, 4 cột):** `article.group.bg-white.rounded-lg.overflow-hidden.shadow-xs.hover:shadow-md.transition-all.flex.flex-col.justify-between`. Ảnh `aspect-video` có `group-hover:scale-105 duration-500`, badge category ở góc **trên phải** (trắng/90, chữ primary). Body `p-5`: ngày (*calendar_today* 12px + body-sm, màu outline, mb-2); tiêu đề `headline-sm leading-snug line-clamp-2 group-hover:text-primary`; excerpt `body-sm line-clamp-2 mt-2`. Footer `px-5 pb-5`: link "Đọc tiếp →" `text-subheading uppercase tracking-wider text-primary group-hover:translate-x-1 transition-transform`.
- **b (Featured, Blog):** card ngang (ảnh 7 / nội dung 5).
  - Badge trên ảnh: "Bài nổi bật" primary-container + "6 phút đọc" slate-dark.
  - Panel nội dung `bg-surface-warm p-14 flex flex-col justify-center`. Meta: label-caps primary (danh mục) và ngày body-sm on-surface-variant có icon *schedule* ở bên phải.
  - Tiêu đề `headline-lg` (36–38px) slate-dark, 3 dòng. Excerpt `body-md on-surface-variant`.
  - Hộp số liệu `bg-surface-container-low rounded-xs p-3 grid grid-cols-3`: giá trị `spec-num` có màu (primary / slate / secondary) + label-caps on-surface-variant.
  - Hàng tác giả: avatar 40px + tên 14px/700 + chức danh label-caps; bên phải link "Đọc toàn bộ →" `text-subheading text-primary`.
- **c (About, 4 cột):** ảnh `aspect-[16/10]`, body p-5. Meta là label-caps **primary** (danh mục) + chấm "•" + "5 phút đọc" body-sm. Tiêu đề Playfair 17–18px 2 dòng, excerpt body-sm 2 dòng, link label-caps primary "Đọc tiếp →".
- **d (Blog grid, 2 cột, card rộng 389px):**
  - Ảnh cao ~224px. Badge category **có màu** ở góc trên trái (`bg-secondary` / `bg-primary` / `bg-primary-container` / `bg-tertiary`, chữ trắng, label-caps, `px-2 py-0.5 rounded-xs`). Badge thời gian đọc ở góc dưới phải (`bg-slate-dark/85 text-white text-[11px] font-semibold px-2 py-0.5 rounded-xs`).
  - Body p-5: ngày (icon *calendar_today* primary 14px + label-caps slate-dark), tiêu đề `headline-sm` (22px) 2 dòng, excerpt `body-md` `line-clamp-3`.
  - Footer: avatar chữ cái **24px tròn** + tên 12px/600, và link "ĐỌC TIẾP →" `text-subheading text-primary`.
- **Underline động** cho tiêu đề (theo designMd "animated underline on hover"): HTML chỉ đổi màu. Khi build dùng utility `.link-underline` (mục f).

### c.12 Pagination / Category pills
- **a (Properties):** các ô `w-9 h-9 rounded-xs grid place-items-center text-sm font-bold`. Trang hiện tại `bg-primary-container text-white`. Trang khác `bg-white text-slate-dark hover:bg-surface-container`. Dấu "…" là chữ outline. Bên phải có nút "TRANG SAU ›" (`bg-white h-9 px-5 text-subheading uppercase text-primary`). Toàn hàng `flex justify-between items-center`.
- **b (Category pills, Blog):** `h-8 px-5 rounded-xs text-subheading uppercase tracking-wider`. Pill active `bg-primary-container text-white`. Pill thường `bg-surface-container-low text-slate-dark hover:bg-surface-container`. Hàng `flex flex-wrap gap-2`. Mobile: `overflow-x-auto flex-nowrap` có scroll-snap.
- **c (Blog):** thanh pagination nằm trong card trắng `rounded-lg p-5 shadow-xs flex justify-between`. Trái: "Hiển thị **1–6** trên 24 bài viết" (body-sm). Phải: prev/next 36×36 `bg-surface-container-low` (icon *chevron_left*/*chevron_right*, disabled thì màu outline), các số trang 36×36 nền trắng shadow-xs, trang active primary-container.

### c.13 Filter bar (Properties)
- Band trắng full-width có `shadow-float`, cao 84px. Bên trong container: `flex items-center gap-3` (desktop). Các ô cao 48px.
  - **Ô Vị trí** (rộng ~195px): `bg-surface-neutral rounded-xs px-3 flex items-center gap-2`, icon *search* outline, label-caps on-surface-variant + `input` body-sm (placeholder outline).
  - **Ô select** (×3, ~195px): label-caps on-surface-variant + giá trị body-md/sm on-surface + *expand_more* ở bên phải.
  - **Segmented "Hình thức"**: label-caps + 3 chip `h-7 px-2.5 rounded-xs text-[12px] uppercase`. Chip active `bg-primary-container text-white`; chip thường `bg-surface-container text-secondary`. Ô nền `surface-neutral`.
  - **Nút reset**: 40×40 nền trắng viền `border-subtle` `rounded-xs`, icon *refresh* (≈ *restart_alt*), `hover:bg-surface-neutral`.
  - **Nút "Lọc"**: `btn-primary h-10 px-10` có icon *tune*.
- designMd: tablet chuyển thành ma trận 2×2, mobile chuyển sang drawer/sheet (xem d).

### c.14 Sort dropdown + c.15 View toggle (toolbar Properties)
- Toolbar: `bg-surface-warm rounded-xs h-14 px-3 flex items-center justify-between`.
  - Trái: "ĐANG HIỂN THỊ:" (label-caps on-surface-variant) + "6 bất động sản" (Jakarta 15px/600 slate).
  - Phải: "Sắp xếp:" (body-sm on-surface-variant) + `select` không viền `text-subheading tracking-wider text-slate-dark` có *expand_more*.
- **View toggle:** 2 nút 32×32 `rounded-xs`, icon *grid_view* / *view_agenda*. Nút active `bg-white shadow-xs text-primary`; nút còn lại `text-outline hover:text-on-surface`. Dùng `aria-pressed`.

### c.16 Buttons
| Biến thể | Class | Hover / Focus |
|---|---|---|
| **Primary** | `inline-flex items-center justify-center gap-1.5 bg-primary-container text-white font-sans text-subheading uppercase tracking-widest rounded-sm px-5 py-3 shadow-md transition-colors` | `hover:bg-terracotta-hover` (một số chỗ trong HTML dùng `hover:bg-primary`), `focus-visible:ring-2 ring-primary ring-offset-2`, `active:translate-y-px` |
| Primary nhỏ (header) | `px-5 py-1.5 rounded-xs tracking-wider` (không shadow) | `hover:bg-primary` |
| Primary lớn (About) | `px-6 py-4 rounded-xs shadow-md`, icon *arrow_forward* | như trên |
| **Secondary đặc** (Properties "Đặt lịch xem") | `bg-secondary text-white label-caps tracking-wider px-3 py-1.5 rounded-xs` | `hover:bg-[#08415C]` |
| **Secondary outline** (designMd) | `border border-[#08415C] text-[#08415C] bg-transparent rounded-xs px-5 py-3 uppercase tracking-[0.04em] font-semibold` | `hover:bg-[#08415C] hover:text-white` |
| **Trắng / Ghost** (About "Xem thành tích") | `bg-white text-slate-dark shadow-xs px-6 py-4 rounded-xs text-subheading uppercase` | `hover:bg-surface-container-low` |
| **Text link + arrow** | `inline-flex items-center gap-1 text-subheading uppercase tracking-wider text-primary`, icon *arrow_forward* 16px | `hover:text-terracotta-hover`, mũi tên `group-hover:translate-x-1` |
| **Icon button** (↗ / tim / social) | `w-8 h-8` (hoặc `w-9 h-9`) `rounded-xl bg-white shadow-xs text-primary grid place-items-center` | ↗: `hover:bg-primary hover:text-white`; social: `hover:text-primary hover:bg-coral-subtle` |
| **Tint** (sidebar Blog "Xem chi tiết") | `bg-surface-container text-slate-dark py-3 w-full rounded-xs text-subheading uppercase` | `hover:bg-secondary hover:text-white` |

designMd quy định primary là "4px radius, weight 600, tracking 0.04em". HTML dùng 700 và tracking-widest. **Theo HTML.**

### c.17 Newsletter block
- **a (Home strip):** section `bg-coral-subtle py-8`, hộp `bg-white/80 backdrop-blur-sm rounded-lg p-5 lg:p-8 shadow-xs grid lg:grid-cols-12 gap-5 items-center`. Chữ chiếm 4 cột (eyebrow, `headline-sm`, body-sm). Form chiếm 8 cột `flex flex-col sm:flex-row gap-1.5`: 2 input `bg-white rounded-xs px-3 py-2.5 shadow-xs` + nút primary `sm:w-auto whitespace-nowrap`.
- **b (About banner):** box `bg-coral-subtle rounded-lg p-10`, chữ ở trái (`headline-md`), form inline ở phải (input trắng h-11, không viền), nút "ĐĂNG KÝ".
- **c (Blog sidebar):** card `rounded-lg shadow-card p-8 bg-gradient-to-br from-coral-subtle to-surface-warm`. Đầu card: icon *mark_email_unread* primary + label-caps primary. Tiếp theo: `headline-sm`, body-sm. Label label-caps slate, input trắng h-10. Nút full-width primary có icon *send*. Ghi chú 11px/600 căn giữa.
- **d (Footer):** xem c.3.

### c.18 CTA banners
- **a:** Newsletter banner About (c.17b) đóng vai trò CTA cuối trang.
- **b (Blog sidebar "Questions on a deal?"):** card `bg-surface-warm rounded-lg p-8 text-center`, avatar/logo 64px, `headline-sm`, body-sm, nút full-width primary có icon *call* "GỌI …".
- **c:** form card "Contact Me" ở Home (c.21a) có thanh accent 6px primary-container ở mép trên.
- Khuyến nghị thêm 1 banner CTA dùng chung cho trang chi tiết: box `bg-coral-subtle rounded-lg p-10 grid md:grid-cols-2 items-center`.

### c.19 Inputs / Selects / Textarea / Checkbox
- **Kiểu Home (nền tint, không viền):** `w-full px-3 py-2.5 rounded-sm bg-surface-container-low text-on-surface text-body-sm placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary`. Textarea thêm `resize-none rows-3`.
- **Kiểu About (nền trắng trong card warm):** `h-12 px-4 bg-white rounded-xs text-body-md shadow-xs border-0 focus:ring-1 ring-primary`, textarea cao ~120px (`resize-y`).
- **Label:** `block label-caps uppercase tracking-wider text-on-surface-variant mb-1` (Home) hoặc `text-slate-dark` (About).
- **Select:** dùng mũi tên native trong Stitch; khi build nên `appearance-none` và tự vẽ icon *expand_more* ở `right-3`.
- **Checkbox (About):** 16px, `accent-primary-container`, label body-sm on-surface-variant.
- **Range slider (Mortgage):** track 4px `bg-border-subtle` với phần đã chọn `bg-primary`, thumb 14px tròn `bg-primary`.
- **Lỗi:** `ring-1 ring-error` + text 12px `text-error`.

### c.20 Stats counters
- **Home:** 3 card `bg-white p-5 rounded-lg shadow-xs text-center`, số `font-display text-headline-lg text-primary font-bold`, nhãn label-caps on-surface-variant.
- **About:** 4 card `bg-surface-warm p-6 rounded-sm shadow-xs`. Hàng trên: label-caps primary và icon bên phải. Số Jakarta 40px/800 slate-dark, tiêu đề 17px/600, mô tả body-sm.
- **Agent card:** stats strip (c.9).
- **Animation đếm số:** Stitch không có; tuỳ chọn count-up khi vào viewport (IntersectionObserver, 1.2s, ease-out) và tôn trọng `prefers-reduced-motion`.

### c.21 Form liên hệ (inquiry card)
- **a (Home "Contact Me"):** `bg-white rounded-lg p-8 shadow-form relative overflow-hidden` + thanh `absolute top-0 inset-x-0 h-1.5 bg-primary-container`. Nội dung: eyebrow label-caps primary, `headline-md`. Form `space-y-3`: select "Tôi quan tâm", grid `sm:grid-cols-2 gap-1.5` (họ tên, điện thoại), email, textarea. Nút submit full-width primary `py-3` có icon *arrow_forward*.
- **b (Properties sidebar "Request Property Docket"):** card trắng p-5, eyebrow, `headline-sm`, label OBJECTIVE, select + 2 input + textarea (nền `surface-neutral` hoặc trắng viền border-subtle, h-9), nút primary icon *send*.
- **c (About "Schedule a Strategy Meeting"):** `bg-surface-warm rounded-2xl p-12 shadow-float`. Nội dung: eyebrow, `headline-md`, grid 2 cột (Nhu cầu | Thời gian; Họ tên | Điện thoại), email full, textarea, checkbox NDA, nút **full-width primary h-[60px]**, ghi chú bảo mật body-sm căn giữa.

### c.22 Community / khu vực tile
- **a (Home):** `a.group.relative.aspect-[3/4].rounded-sm.overflow-hidden.shadow-xs.flex.flex-col.justify-end.p-3.hover:-translate-y-1.transition-transform.duration-300`. Ảnh `absolute inset-0 object-cover group-hover:scale-110 duration-500`. Overlay `bg-gradient-to-t from-slate-dark/85 via-slate-dark/25 to-transparent`. Tên `headline-sm` trắng. "Khám phá →" label-caps `text-coral-subtle` `group-hover:translate-x-1`.
- **b (Properties sidebar "Hot Enclaves"):** grid 2×2 `gap-2`, tile `aspect-video rounded-xs`, tên label-caps trắng bold + "42 tin" 10px trắng/80.
- **c (About):** 5 tile `aspect-[4/5] rounded-lg`, tên Playfair 17px.

### c.23 Service card
- **a (Home):** `bg-white p-8 rounded-lg shadow-xs hover:shadow-md transition-shadow group`. Ô icon `w-12 h-12 rounded-sm bg-coral-subtle text-primary grid place-items-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors`, icon 24px. Tiêu đề `headline-sm mb-2`, mô tả `body-md leading-relaxed`.
  - Icon: *person_search*, *home_work*, *handshake*, *trending_up*, *key*, *support_agent*.
- **b (About):** `bg-surface-warm p-8 rounded-sm`, ô icon 56px. Có thêm link label-caps primary + → ở đáy (`mt-auto pt-8`).
  - Icon (≈): *travel_explore*, *real_estate_agent*, *trending_up*, *business_center*, *price_check*, *support_agent*.

### c.24 Mortgage estimator (sidebar Properties)
- Card `bg-surface-warm rounded-lg p-5 shadow-xs`.
- Đầu card: icon *calculate* primary + `headline-sm`; badge "30 NĂM CỐ ĐỊNH" `bg-secondary-fixed/60 text-secondary label-caps px-2 py-0.5 rounded-xs`.
- 2 hàng slider: label body-sm + giá trị spec-num bold căn phải.
- Hộp kết quả: `bg-white rounded-xs p-4 flex justify-between`, label-caps on-surface-variant, giá trị `price-display text-primary` (26px) + "/tháng" body-sm. Donut 48px (stroke primary-container và secondary).
- Ghi chú body-sm on-surface-variant.

### c.25 Mini chart (sidebar Blog)
- Card trắng p-5. Tiêu đề label-caps slate 13px + khoảng thời gian label-caps primary.
- Area chart: line `stroke #9A442D` 2px, area gradient `#E07A5F` từ 30% về 0, điểm tròn 4px (điểm cuối màu primary-container), gridline dashed `#E2E8F0`.
- Hàng giá trị spec-num 12px (giá trị cuối màu primary). Mô tả body-sm.
- Build bằng SVG inline hoặc Recharts.

### c.26 Tag cloud (sidebar Blog)
- Card trắng p-5. Tiêu đề label-caps slate. Pills `bg-surface-container-low text-slate-dark text-[12px] font-semibold tracking-wide px-3 py-1.5 rounded-xs hover:bg-coral-subtle hover:text-primary`, xếp `flex flex-wrap gap-2`.

### c.27 Breadcrumbs (Stitch không có, đề xuất)
- Đặt trên H1 của page hero (Properties/Blog/chi tiết): `nav[aria-label=breadcrumb] flex items-center gap-1.5 label-caps tracking-wider text-on-surface-variant`. Separator là *chevron_right* 14px màu outline. Mục cuối `text-primary` có `aria-current="page"`. Link `hover:text-primary`.

### c.28 Section header (dùng lại nhiều lần)
- **Eyebrow:** 3 kiểu:
  - (1) vạch `h-0.5 w-6 bg-primary` + chữ (Home About, Blog hero dùng 32px);
  - (2) vạch 24px 1px primary-container (About);
  - (3) chấm 8px primary-container (Properties hero);
  - (4) chỉ chữ (Home các section khác).
  - Chữ luôn là `label-caps text-primary uppercase tracking-widest font-bold`.
- **Kiểu split:** `flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8`, trái là eyebrow + `h2.headline-lg.text-slate-dark`, phải là link + arrow.
- **Kiểu centered:** `text-center max-w-2xl mx-auto mb-14`.

---

## d) Responsive (HTML làm gì ở mỗi breakpoint, kèm đề xuất cho phần Stitch chưa có)

| Component | < sm / mobile | md (≥768) | lg (≥1024) | xl (≥1280) |
|---|---|---|---|---|
| Header | Logo + (đề xuất) hamburger; CTA ẩn dưới `sm` | CTA hiện từ `sm` | Nav ngang hiện (`hidden lg:flex`) | Hotline hiện (`hidden xl:flex`) |
| Hero Home | 1 cột: chữ trước, ảnh sau (ảnh `max-w-md` căn giữa), `pt-8` | như mobile | 12 cột 7/5, `pt-14` | – |
| Search panel | 1 cột, `mt-8`, `p-3` | `sm:grid-cols-2` | `lg:grid-cols-5`, `lg:-mt-6` (đè hero), `lg:p-5` | – |
| About + Contact (Home) | 1 cột (form xuống dưới) | 1 cột | 7/5 | – |
| Stats (Home) | **vẫn `grid-cols-3`** (chật; đề xuất `grid-cols-3 gap-2` và chữ nhỏ hơn, hoặc `grid-cols-1 sm:grid-cols-3`) | 3 | 3 | – |
| Listing grid | 1 | 2 (`md:grid-cols-2`) | 3 | – |
| Section header split | xếp dọc (`flex-col`) | `md:flex-row md:items-end` | – | – |
| Newsletter strip | input/nút xếp dọc full-width | `sm:flex-row`, nút `sm:w-auto` | 4/8 cột | – |
| Communities | 2 cột | 3 cột | 6 cột (Home) / 5 cột (About) | – |
| Services | 1 | 2 | 3 | – |
| Testimonials | 1 | 3 (`md:grid-cols-3`) | 3 | – |
| Blog cards (Home) | 1 | 2 (`sm:grid-cols-2`) | 4 | – |
| Footer | 1 cột; hàng đáy xếp dọc căn giữa | 2 cột; `sm:flex-row` hàng đáy | 4 cột | – |
| Form 2 field (Home) | 1 cột | `sm:grid-cols-2` | – | – |
| **Properties** (đề xuất) | Filter bar thu thành nút "Bộ lọc" mở bottom sheet; toolbar `flex-wrap`; card 1 cột; sidebar xuống dưới list (giữ agent card + form, ẩn Hot Enclaves) | Filter dạng lưới 2×2 (designMd), card 2 cột | 8/4, filter ngang 1 hàng, có thể sticky | – |
| **Blog** (đề xuất) | Pills scroll ngang; featured xếp dọc (ảnh `aspect-video` ở trên, panel `p-6`); card 1 cột; sidebar xuống dưới | card 2 cột; featured vẫn dọc | featured 7/5 ngang, main 8 / sidebar 4 | – |
| **About** (đề xuất) | Hero 1 cột (ảnh dưới, bỏ rotate-panel hoặc giảm offset, badge nổi chuyển về `left-4 -bottom-4`); stats 1→2 cột; philosophy ảnh trên; services 1 cột; communities scroll ngang `snap-x`; contact form dưới info | stats 2, services 2, communities 3 | 4 / 3 / 5 cột như desktop | – |
| Typography | H1 `text-headline-xl-mobile`, H2 `text-headline-lg-mobile` (HTML **không** áp dụng nhưng designMd có token) | – | `lg:text-headline-xl`, `lg:text-headline-lg` | – |
| Section padding | `py-12` | `py-14` | `py-14` (Home) / `py-20` (About, Blog) | – |

---

## e) Motion và interaction

| Hiệu ứng | Chi tiết (theo HTML) |
|---|---|
| **Hover lift card** | `transition-all duration-300 hover:-translate-y-1` (4px; designMd nói -3px) và shadow chuyển `shadow-card` → `shadow-card-hover` |
| **Zoom ảnh** | `group-hover:scale-105` (card) / `scale-110` (tile community), `transition-transform duration-500` (ease mặc định `cubic-bezier(0.4,0,0.2,1)`) |
| **Đổi màu tiêu đề** | `group-hover:text-primary transition-colors` (150ms) |
| **Mũi tên trượt** | `group-hover:translate-x-1 transition-transform` trên "Đọc tiếp →", "Khám phá →" |
| **Nút** | `transition-colors` (150ms): primary-container → terracotta-hover / primary |
| **Ô icon dịch vụ** | `group-hover:bg-primary group-hover:text-white` + card `hover:shadow-md transition-shadow` |
| **Nút ↗ / social** | nền chuyển primary, chữ trắng; social chuyển `bg-coral-subtle text-primary` (`transition-all`) |
| **Underline động** (designMd, cho tiêu đề blog và link nav) | `background: linear-gradient(currentColor,currentColor) 0 100% / 0 1px no-repeat; transition: background-size .3s ease` và khi hover `background-size: 100% 1px` |
| **Header** | Cố định, blur nền; không có hiệu ứng khi scroll. Đề xuất: tăng shadow khi `scrollY > 8` |
| **Focus** | Input `focus:ring-1 focus:ring-primary`. Đề xuất thêm `focus-visible:ring-2 ring-primary ring-offset-2` cho mọi nút/link |
| **Reduced motion** | Bọc lift/zoom/count-up bằng `motion-safe:` |

---

## f) Tailwind v4: khối `@theme` (dán vào `app/globals.css`)

```css
@import "tailwindcss";

/* Font: nạp bằng next/font (Playfair_Display, Plus_Jakarta_Sans, subsets latin + vietnamese)
   với variable: '--font-playfair' và '--font-jakarta'. */
@theme inline {
  --font-display: var(--font-playfair), "Playfair Display", Georgia, serif;
  --font-sans: var(--font-jakarta), "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
}

@theme {
  /* ===== Brand / accent ===== */
  --color-primary: #9a442d;               /* terracotta đậm: chữ nhấn, giá, eyebrow */
  --color-on-primary: #ffffff;
  --color-primary-container: #e07a5f;     /* BRAND: nền CTA */
  --color-on-primary-container: #5b1604;
  --color-terracotta-hover: #c86247;
  --color-primary-fixed: #ffdbd2;
  --color-primary-fixed-dim: #ffb4a1;
  --color-on-primary-fixed: #3c0800;
  --color-on-primary-fixed-variant: #7c2e19;
  --color-inverse-primary: #ffb4a1;
  --color-coral-subtle: #fbeae5;

  --color-secondary: #356380;
  --color-on-secondary: #ffffff;
  --color-secondary-deep: #08415c;        /* designMd secondary gốc: viền/hover nút secondary */
  --color-secondary-container: #afddfe;
  --color-on-secondary-container: #34627f;
  --color-secondary-fixed: #c7e7ff;
  --color-secondary-fixed-dim: #9fcced;
  --color-on-secondary-fixed: #001e2e;
  --color-on-secondary-fixed-variant: #194b67;

  --color-tertiary: #805349;
  --color-on-tertiary: #ffffff;
  --color-tertiary-container: #bf897e;
  --color-on-tertiary-container: #49241d;
  --color-tertiary-fixed: #ffdad3;
  --color-tertiary-fixed-dim: #f4b9ac;
  --color-blush: #e9afa3;                 /* designMd tertiary gốc */

  --color-gold-accent: #d97706;

  /* ===== Text / neutral ===== */
  --color-slate-dark: #0f172a;            /* tiêu đề */
  --color-slate-navy: #1e293b;            /* designMd neutral */
  --color-on-surface: #111c2d;
  --color-on-background: #111c2d;
  --color-on-surface-variant: #55423e;    /* body */
  --color-outline: #88726d;
  --color-outline-variant: #dbc1ba;
  --color-inverse-surface: #263143;
  --color-inverse-on-surface: #ecf1ff;

  /* ===== Surfaces ===== */
  --color-surface: #f9f9ff;
  --color-background: #f9f9ff;
  --color-surface-bright: #f9f9ff;
  --color-surface-dim: #cfdaf2;
  --color-surface-warm: #fdfbf9;
  --color-surface-neutral: #f8fafc;
  --color-surface-muted: #f1f5f9;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f0f3ff;
  --color-surface-container: #e7eeff;
  --color-surface-container-high: #dee8ff;
  --color-surface-container-highest: #d8e3fb;
  --color-surface-variant: #d8e3fb;
  --color-surface-tint: #9a442d;
  --color-border-subtle: #e2e8f0;

  /* ===== Status ===== */
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;

  /* ===== Alias ngữ nghĩa (tuỳ chọn, dễ đọc hơn) ===== */
  --color-brand: #e07a5f;
  --color-brand-hover: #c86247;
  --color-accent: #9a442d;
  --color-heading: #0f172a;
  --color-body: #55423e;
  --color-muted: #88726d;

  /* ===== Type scale ===== */
  --text-headline-xl: 48px;
  --text-headline-xl--line-height: 56px;
  --text-headline-xl--letter-spacing: -0.02em;
  --text-headline-xl--font-weight: 600;
  --text-headline-xl-mobile: 34px;
  --text-headline-xl-mobile--line-height: 42px;
  --text-headline-xl-mobile--letter-spacing: -0.01em;
  --text-headline-xl-mobile--font-weight: 600;
  --text-headline-lg: 36px;
  --text-headline-lg--line-height: 44px;
  --text-headline-lg--letter-spacing: -0.015em;
  --text-headline-lg--font-weight: 600;
  --text-headline-lg-mobile: 28px;
  --text-headline-lg-mobile--line-height: 36px;
  --text-headline-lg-mobile--letter-spacing: -0.01em;
  --text-headline-lg-mobile--font-weight: 600;
  --text-headline-md: 26px;
  --text-headline-md--line-height: 34px;
  --text-headline-md--font-weight: 600;
  --text-headline-sm: 20px;
  --text-headline-sm--line-height: 28px;
  --text-headline-sm--font-weight: 600;
  --text-subheading: 13px;
  --text-subheading--line-height: 20px;
  --text-subheading--letter-spacing: 0.08em;
  --text-subheading--font-weight: 700;
  --text-body-lg: 18px;
  --text-body-lg--line-height: 28px;
  --text-body-md: 15px;
  --text-body-md--line-height: 24px;
  --text-body-sm: 13px;
  --text-body-sm--line-height: 20px;
  --text-spec-num: 14px;
  --text-spec-num--line-height: 18px;
  --text-spec-num--font-weight: 700;
  --text-label-caps: 11px;
  --text-label-caps--line-height: 16px;   /* designMd 14px; nới cho dấu tiếng Việt */
  --text-label-caps--letter-spacing: 0.06em;
  --text-label-caps--font-weight: 700;
  --text-price-display: 22px;
  --text-price-display--line-height: 28px;
  --text-price-display--letter-spacing: -0.01em;
  --text-price-display--font-weight: 800;

  /* ===== Spacing (named) ===== */
  --spacing-space-xs: 0.375rem;
  --spacing-space-sm: 0.75rem;
  --spacing-space-md: 1.25rem;
  --spacing-space-lg: 2rem;
  --spacing-space-xl: 3.5rem;
  --spacing-gutter: 1.5rem;
  --spacing-gutter-mobile: 1rem;
  --spacing-margin: 3rem;
  --spacing-margin-mobile: 1.25rem;

  /* ===== Radius (chuẩn hoá theo designMd, xem a.5) ===== */
  --radius-xs: 0.125rem;   /* 2px  = class `rounded` trong HTML Stitch */
  --radius-sm: 0.25rem;    /* 4px  = `rounded-lg` Stitch */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px  = `rounded-xl` Stitch (card) */
  --radius-xl: 0.75rem;    /* 12px = `rounded-full` Stitch (squircle) */
  --radius-2xl: 1rem;      /* form card About */
  /* --radius-full giữ mặc định 9999px cho avatar tròn thật */

  /* ===== Shadows ===== */
  --shadow-header: 0 1px 8px rgba(0, 0, 0, 0.04);
  --shadow-card: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  --shadow-card-hover: 0 12px 28px -4px rgba(15, 23, 42, 0.10);
  --shadow-float: 0 16px 36px -6px rgba(15, 23, 42, 0.08);
  --shadow-form: 0 8px 30px rgba(0, 0, 0, 0.06);
  /* shadow-xs/sm/md/lg/xl: dùng mặc định Tailwind v4 (nhớ: v3 shadow-sm = v4 shadow-xs) */

  /* ===== Motion ===== */
  --ease-out-soft: cubic-bezier(0.4, 0, 0.2, 1);
}

@layer base {
  body { @apply bg-surface font-sans text-body-md text-on-surface antialiased; }
  h1, h2, h3, h4, h5 { @apply font-display text-slate-dark; }
  .material-symbols-outlined {
    font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    line-height: 1; user-select: none;
  }
}
```

### Custom utilities nên định nghĩa (`@utility`)
```css
@utility container-page { @apply mx-auto w-full max-w-7xl px-5 md:px-8 lg:px-6; }
@utility section-y { @apply py-12 md:py-14 lg:py-20; }
@utility eyebrow { @apply font-sans text-label-caps uppercase tracking-widest text-primary; }
@utility eyebrow-line { @apply inline-flex items-center gap-2 font-sans text-label-caps uppercase tracking-widest text-primary before:h-0.5 before:w-6 before:bg-primary before:content-['']; }
@utility eyebrow-dot { @apply inline-flex items-center gap-2 font-sans text-label-caps uppercase tracking-widest text-primary before:size-2 before:rounded-full before:bg-primary-container before:content-['']; }
@utility card { @apply rounded-lg bg-white shadow-card; }
@utility card-lift { @apply transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover; }
@utility img-zoom { @apply transition-transform duration-500 group-hover:scale-105; }
@utility glass-light { background: rgb(255 255 255 / 0.92); backdrop-filter: blur(8px); }
@utility glass-dark { background: rgb(15 23 42 / 0.7); backdrop-filter: blur(8px); }
@utility btn { @apply inline-flex items-center justify-center gap-1.5 font-sans text-subheading uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50; }
@utility btn-primary { @apply btn rounded-sm bg-primary-container px-5 py-3 text-white shadow-md hover:bg-terracotta-hover; }
@utility btn-secondary { @apply btn rounded-xs border border-secondary-deep px-5 py-3 text-secondary-deep hover:bg-secondary-deep hover:text-white; }
@utility btn-ghost { @apply btn rounded-xs bg-white px-6 py-3 text-slate-dark shadow-xs hover:bg-surface-container-low; }
@utility btn-icon { @apply grid size-8 place-items-center rounded-xl bg-white text-primary shadow-xs transition-colors hover:bg-primary hover:text-white; }
@utility badge { @apply rounded-xs px-2.5 py-1 font-sans text-label-caps uppercase tracking-wider; }
@utility field { @apply w-full rounded-sm bg-surface-container-low px-3 py-2.5 text-body-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-primary; }
@utility link-arrow { @apply inline-flex items-center gap-1 font-sans text-subheading uppercase tracking-wider text-primary transition-colors hover:text-terracotta-hover; }
@utility link-underline {
  background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
  transition: background-size .3s var(--ease-out-soft);
  &:hover { background-size: 100% 1px; }
}
@utility overlay-bottom { background-image: linear-gradient(to top, rgb(15 23 42 / 0.85), rgb(15 23 42 / 0.25) 50%, transparent); }
```
(Các utility `@apply` lồng `btn` bên trong `btn-primary`: nếu phiên bản v4 đang dùng không hỗ trợ `@apply` một custom utility, hãy chép trực tiếp các class của `btn` vào.)

### Icon (Material Symbols Outlined) dùng trong thiết kế
*verified, location_on, phone_in_talk, call, mail, mark_email_unread, photo_camera, thumb_up, play_circle, share, public, event, workspace_premium, location_city, apartment, sell, bed, bathtub, square_foot, straighten (≈), search, arrow_forward, north_east, chevron_right, chevron_left, calendar_today, schedule, star, person_search, home_work, handshake, trending_up, key, support_agent, favorite, tune, refresh (≈), expand_more, grid_view, view_agenda, calculate, send, map, smartphone, shield (≈), history_edu (≈), monitoring (≈), hub (≈), travel_explore (≈), real_estate_agent (≈), business_center (≈), price_check (≈), auto_graph (≈), format_quote (≈), menu/close (mobile)*.
Cách nạp: dùng link Google Fonts `Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200` với `&display=block` (tránh nháy tên icon dạng chữ), hoặc package `material-symbols` (self-host). Nếu muốn tối ưu bundle thì có thể thay bằng `@material-symbols/svg-400` hoặc tương đương. Logo mạng xã hội cần SVG riêng.

---

## g) KHÔNG sao chép (placeholder của Stitch, chỉ lấy layout/style)

Website thật **không được** dùng bất kỳ nội dung nào dưới đây. Mọi text phải viết lại bằng tiếng Việt cho thương hiệu thật; mọi ảnh phải là ảnh thật hoặc ảnh có bản quyền.

**Thương hiệu và con người**
- "Belén Mendoza", "Belén", "BM", "Belén Mendoza Luxury Estates", "Luxury Estates", "Luxury Estates & Private Brokerage", title trang "Belén Mendoza Luxury Estates", "Houzez" (screen label "Houzez Luxury Real Estate", và mọi ảnh/link từ demo25.houzez.co).
- Tên khách hàng/nhân vật: Rita Roy, John Siy, Kalye Moore ("KM"), Sterling Hayes, Eleanor Vance.
- Chức danh mẫu: "Principal Luxury Broker", "Principal Broker & Advisory Partner", "Luxury Real Estate Specialist in South Florida", "Premier Florida Brokerage", "Top 1% Producer", "Top 0.5% Producer".

**Liên hệ**
- Điện thoại (800) 987 6543, (987) 654 3210, (555) 000-0000.
- Email: concierge@belenmendoza.com, belen.mendoza@belenmendoza.com, client@luxuryestate.com, sterling.hayes@domain.com, eleanor@vancecapital.com.
- Địa chỉ "135 Bradley Pl, Palm Beach, FL 33480", "Palm Beach Headquarters", "Palm Beach Advisory Office", giờ "Mon – Sat, 8:00 AM – 7:30 PM EST", "WhatsApp".

**Địa danh** (Florida/Mỹ): South Florida, Palm Beach, West Palm Beach, Miami, Miami-Dade, Brickell, Biscayne Blvd, Key Biscayne, Fort/Ft Lauderdale, Las Olas (Blvd/Isles), Sarasota, Siesta Key, Coconut Grove, Coral Gables, Wellington, Aero Club Way, Harbor Dr, Gulf of Mexico Dr, Star Island, Indian Creek, Broward, Gold Coast, Intracoastal.

**Tin đăng và giá**
- Tên BĐS: Luxury Family Residence/Home, Modern Biscayne/Bayfront Apartment, Las Olas Family Villa, Relaxing Studio Ocean View, Gorgeous Studio/Villa Bay Front, Amazing Villa Bay Front, Equestrian Family Home, "Single Family Home • Palm Beach".
- Giá: $670,000, $450,000, $250,000, $990,000, $11,500/mo, $12,000/mo, $25,000/mo, $1,300/mo, $2,800/sq ft, $2,300/sq ft, $31,000/sq ft, $6,500/sq ft, $134,000, $3,420/mo.
- Thông số: 4 beds/2 baths/1,200 sq ft, 2,149 / 4,300 / 2,700 / 3,780 / 2,200 sq ft…
- Mô tả tin ("Impeccably restored Spanish revival…", "Equine haven… Winter Equestrian Festival…"), tag/badge mẫu (Bay View, Turnkey, Acreage, Furnished, Exclusive, "Prime Intracoastal", "Long or Short Term").
- Bộ đếm "148 Verified Listings", số tin theo khu vực 42/28/35/19.

**Thống kê và số liệu**: 20+ năm, 100+ properties sold, 15+ affiliate partners, 150+ happy homeowners, $250M+, $240M+ closed volume, "5.0 (84 verified reviews)", "Over 38% of our luxury portfolio…", +18.4% YoY, 32 days on market, "Ultra-Prime", Q1 2025 market report, lãi suất 6.4%, "30-YR FIXED", chart $1,450 / $2,120 / $2,800 per sqft (2021–2024).

**Nội dung biên tập**
- Mọi đoạn bio/giới thiệu ("I am dedicated to bringing knowledge… more than 20 years", "Over Two Decades Curating…", "Knowledge, Endurance…"), mô tả dịch vụ, mọi testimonial (3 đoạn trích), footer quick links (Palm Beach Waterfronts, Penthouse Collections, Private Estates & Villas, Curated Market Intelligence, Private Wealth Advisory), các tagline newsletter.
- Tiêu đề blog: "Skills That You Can Learn In The Real Estate Market", "Learn The Truth About Real Estate Industry", "10 Quick Tips About Business Development", "14 Common Misconceptions About Business Development / Property Value / Property Acquisition", "The Rise of Waterfront Villas in Miami & Palm Beach", "Tax Advantages & Relocation Guide to South Florida", "Top 5 Interior Design Trends in Modern Luxury Condos".
- Ngày (March 9, 2025 / March 5, 8, 9, 2024 / February 21, 28, 2024), thời gian đọc, lorem ipsum, hashtag (#PalmBeachLuxury, #MiamiCondos…), danh mục (Business, Construction, Real Estate, Advisory…).
- Copyright "© 2025 Belén Mendoza Luxury Estates. All rights reserved. Equal Housing Opportunity." ("Equal Housing Opportunity" là thuật ngữ pháp lý của Mỹ.)
- Placeholder form ("Tell me about your preferred timeline…", "Share your preferred aesthetic, square footage, deepwater access…").

**Ảnh và tài sản**
- **Tất cả ảnh** từ `lh3.googleusercontent.com/aida-public/...` và `/aida/...` (chân dung, nhà, khu vực, blog). Nhiều ảnh trong screenshot còn **dính ảnh chụp màn hình website khác** (thanh nav "Trang Chủ / Mua / Thuê", trang houzez).
- Avatar lỗi "DU" ở header/Blog.
- Nút nổi "Buy Now / Templates" (artifact demo).
- Alert JS ("Inquiry received. Belén Mendoza concierge will contact you shortly.").

**Đơn vị và quy ước Mỹ cần bản địa hoá**: $ sang VND (tỷ/triệu), sq ft sang m², định dạng điện thoại Mỹ sang VN (09xx xxx xxx), ngày "March 9, 2025" sang "09/03/2025" hoặc "9 tháng 3, 2025", "EST" sang giờ VN.
