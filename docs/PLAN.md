# Kế hoạch dự án — Website BĐS "Tuyn Tận Tâm"

> Cập nhật: 2026-10-22. Tài liệu sống, cập nhật cuối mỗi giai đoạn.

## 0. Kết quả khảo sát ban đầu (quan trọng)

| Nguồn | Phát hiện | Hệ quả |
|---|---|---|
| tuyntantam.com | WordPress + Elementor + Rank Math, **REST API `/wp-json/wp/v2` mở**. 17 trang, 6 bài viết, 86 ảnh. | Crawl bằng REST API (sạch, đủ trường), bổ sung bằng HTML render cho header/footer/SEO. |
| tuyntantam.com | **Không có tin đăng BĐS nào.** "Kho Nguồn / Nguồn BĐS Thuê / Bán" chỉ trỏ sang 2 nhóm Facebook + 2 Google Form "ký gửi". 3/4 trang dịch vụ ghi "Nội dung đang được cập nhật". | Module BĐS (DB, API, lọc, chi tiết, admin) vẫn xây đủ, nhưng **dữ liệu = 0** → các khu vực BĐS ẩn/hiện empty-state dẫn về Kho Nguồn; admin nhập tin thật sau. Không bịa tin. |
| tuyntantam.com | Thương hiệu cá nhân: Tuyn — môi giới cho thuê BĐS Hà Nội, 5+ năm. Có SĐT, 2 email, WhatsApp, Facebook/Group, X, YouTube. Không có Zalo, không có địa chỉ. | Nút nổi: Gọi + WhatsApp (Zalo ẩn đến khi có số). Bản đồ văn phòng ẩn. |
| Stitch | 4 screen + design system "Terracotta & Slate" (Playfair Display + Plus Jakarta Sans, primary #E07A5F, secondary #08415C, bo góc 4–8px). | Dùng làm design tokens chính. Ảnh 1280px đã tải; HTML lấy qua MCP. |
| Houzez demo25 | Nguồn bổ sung cho trang/tính năng Stitch thiếu: chi tiết BĐS, liên hệ, dịch vụ, so sánh, yêu thích, máy tính vay… | Lập bảng Gap analysis. |

## 1. Sơ đồ trang (content mapping)

| Route | Thiết kế gốc | Nội dung từ tuyntantam.com |
|---|---|---|
| `/` | Stitch "Trang chủ" | Lời chào blog, Về Tuyn, Dịch vụ, số liệu (đúng như site), bài viết mới, CTA cộng đồng 1000+ môi giới, form liên hệ. Khu "BĐS nổi bật" chỉ hiện khi có tin. |
| `/bat-dong-san` | Stitch "Properties" + Houzez (lọc, sắp xếp, lưới/danh sách/bản đồ) | Dữ liệu từ DB (hiện 0) → empty-state + link Kho Nguồn + form ký gửi. |
| `/bat-dong-san/[slug]` | Houzez property detail | Chỉ khi có tin (admin nhập). |
| `/gioi-thieu` | Stitch "About" | Trang Giới Thiệu (câu chuyện, hành trình). |
| `/tin-tuc`, `/tin-tuc/[slug]`, `/danh-muc/[slug]` | Stitch "Blog" | 6 bài + chuyên mục. |
| `/moi-gioi`, `/dau-tu` | Houzez page template (dạng bài dài) | 2 trang kiến thức dài. |
| `/dich-vu`, `/dich-vu/[slug]` | Houzez services | 4 dịch vụ; 3 trang "đang cập nhật" → hiện tóm tắt từ trang Dịch Vụ, đánh dấu "cần bổ sung". |
| `/kho-nguon` | Houzez CTA blocks | Kho nguồn thuê/bán + form ký gửi (native, thay Google Form). |
| `/lien-he` | Houzez contact | Liên Hệ & Hợp Tác + form lead. |
| `/ung-ho` | — | Donate. |
| `/so-sanh`, `/yeu-thich` | Houzez | Khung sẵn, ẩn khi 0 tin. |
| `/admin/*` | Houzez dashboard (rút gọn) | Quản trị. |

## 2. Giai đoạn & cách thực thi

| GĐ | Việc | Thực thi | Đầu ra |
|---|---|---|---|
| 0 | Nạp skill (frontend-design, ui-ux-pro-max, senior-*), CLAUDE.md, 5 skill dự án | Agent chính | `CLAUDE.md`, `.claude/skills/*/SKILL.md` |
| 1a | Phân tích Stitch: tải HTML 3 screen còn lại qua MCP, trích tokens/layout/component | **Subagent A** (song song) | `design-reference/design-notes.md`, `stitch/*.html` |
| 1b | Duyệt demo25.houzez.co + trang templates, kiểm kê tính năng thật | **Subagent B** (song song) | `design-reference/houzez-analysis.md` |
| 2 | Crawl toàn bộ tuyntantam.com → JSON + ảnh + báo cáo | **Subagent C** (song song) | `data/*.json`, `public/images/**`, `data/crawl-report.md` |
| 1c | Gộp → bảng Gap analysis + quyết định | Agent chính | `design-reference/gap-analysis.md` |
| 3 | Web search so sánh stack/hosting, chốt | Agent chính (trong lúc A/B/C chạy) | mục Stack trong `CLAUDE.md` |
| 4 | Scaffold, DB schema, seed, UI theo tokens, API v1, admin, SEO | Agent chính; test viết bởi **Subagent D** | mã nguồn, `API.md` |
| 5 | Bảo mật theo `security-checklist` | Agent chính + `/security-review` | checklist tick |
| 6 | Lint, test, build, Git, README, deploy | Agent chính | URL hoặc hướng dẫn deploy |
| 7 | Nghiệm thu độc lập (link/ảnh/console/form/mobile/so khớp Stitch/nội dung) | **Subagent E** chưa xem quá trình | `docs/ACCEPTANCE.md` |

## 3. Stack dự kiến (chốt ở GĐ3 sau khi tra cứu)

- Next.js (App Router) + TypeScript strict + Tailwind CSS v4.
- PostgreSQL (Neon free) + Prisma; local dùng Postgres trong Docker.
- Auth: phiên đăng nhập lưu DB, cookie `HttpOnly; Secure; SameSite=Lax`, mật khẩu argon2/bcrypt, vai trò `ADMIN`/`EDITOR`.
- Zod validate, sanitize-html cho rich text, rate-limit lưu ở Postgres (không cần dịch vụ ngoài), honeypot + Turnstile (bật khi có key).
- Email lead: Resend (bật khi có `RESEND_API_KEY`).
- Upload ảnh admin: Vercel Blob (prod) / thư mục local (dev), kiểm tra MIME + dung lượng.
- Deploy: Vercel + Neon; dự phòng Dockerfile (Railway/Render/Fly).

## 4. Rủi ro & cách xử lý

| Rủi ro | Xử lý |
|---|---|
| Không có tin BĐS → trang chủ/danh sách trống | Ẩn khu vực, empty-state có CTA thật (Kho Nguồn, ký gửi); admin nhập tin thật sau. |
| HTML Stitch cần xác thực Google | Lấy qua Stitch MCP `download_file`. |
| Không có quyền tài khoản Vercel/Neon | Chuẩn bị `vercel.json`, `Dockerfile`, hướng dẫn từng bước; deploy khi người dùng đăng nhập CLI. |
| Ảnh hotlink/ảnh lớn | Tải về, đổi tên theo slug, giới hạn 1920px; ghi lỗi vào báo cáo. |
| Nội dung Elementor nhiều markup | Làm sạch bằng sanitize-html theo whitelist, giữ heading/list/link/img. |
