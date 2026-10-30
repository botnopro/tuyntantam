# CLAUDE.md — Website BĐS "Tuyn Tận Tâm"

Website bất động sản cho thương hiệu môi giới cá nhân **Tuyn Tận Tâm** (môi giới cho thuê BĐS Hà Nội).
Thiết kế theo Stitch "Modern Real Estate Portal" + bố cục/tính năng theme Houzez; **nội dung 100% từ https://tuyntantam.com/**.
Kế hoạch tổng thể: `docs/PLAN.md`. Gap analysis: `design-reference/gap-analysis.md`.

## Quy tắc bất biến

1. **Không bịa nội dung.** Mọi chữ, số liệu, ảnh, tên người, liên hệ hiển thị cho người dùng phải lấy từ `data/*.json` (crawl từ tuyntantam.com) hoặc do admin nhập. Không dùng chữ/ảnh/tên/số liệu mẫu của Stitch hay Houzez. Thiếu dữ liệu → ẩn khu vực, hoặc hiện empty-state có hành động thật; ghi vào `docs/MISSING-CONTENT.md`.
   - Ngoại lệ duy nhất: nhãn giao diện chung (nút "Gửi", "Tìm kiếm", "Sắp xếp", thông báo lỗi…) do mình viết, tiếng Việt, không mang tính khẳng định về doanh nghiệp.
2. **Giao diện tiếng Việt** (`<html lang="vi">`), định dạng số/tiền theo `vi-VN`, ngày `dd/MM/yyyy`, múi giờ `Asia/Ho_Chi_Minh`.
3. **Bảo mật theo skill `security-checklist`** — đọc trước khi viết API, auth, form, upload.
4. **UI theo skill `design-tokens`** — không đặt màu/font/bóng ngoài token.
5. Bí mật chỉ ở biến môi trường. Không commit `.env*` (trừ `.env.example`).

## Stack (chốt ở GĐ3, xem lý do ở `docs/PLAN.md` §3 và README)

| Lớp | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, `output: "standalone"`) |
| Ngôn ngữ | TypeScript `strict` |
| UI | Tailwind CSS v4 (`@theme` tokens trong `src/app/globals.css`), font Be Vietnam Pro qua `next/font/google` (subset `vietnamese`), tông xanh Zalo + dark mode (class `.dark`), icon `lucide-react` |
| DB | PostgreSQL 16 — prod: Neon (free); local: Docker (`docker compose up -d db`) |
| ORM | Drizzle ORM + `pg` (truy vấn tham số hóa), migrations bằng `drizzle-kit` |
| Validate | Zod 4 (dùng chung client/server, server là nguồn sự thật) |
| Auth | Phiên lưu DB (bảng `sessions`, token băm SHA-256), cookie `HttpOnly; Secure; SameSite=Lax`, mật khẩu `@node-rs/argon2` (argon2id), vai trò `ADMIN` / `EDITOR` |
| Rich text | `sanitize-html` theo whitelist trước khi lưu và khi render |
| Rate limit | Bảng `rate_limits` trên Postgres (cửa sổ cố định), không cần dịch vụ ngoài |
| Chống spam | Honeypot + thời gian tối thiểu điền form; Cloudflare Turnstile khi có `TURNSTILE_SECRET_KEY` |
| Email | Resend khi có `RESEND_API_KEY` (không có thì chỉ lưu DB + log) |
| Upload ảnh | Vercel Blob khi có `BLOB_READ_WRITE_TOKEN`, ngược lại ghi `public/uploads/` (dev/Docker volume) |
| Bản đồ | Leaflet + OpenStreetMap (chỉ hiện khi BĐS có toạ độ) |
| Test | Vitest (unit + API route handlers với DB test) |
| Lint/format | ESLint (next config) + Prettier |
| Deploy | Vercel + Neon; dự phòng `Dockerfile` (Railway/Render/VPS) |

## Cấu trúc thư mục

```
src/
  app/
    (site)/            # trang công khai: page.tsx, kho-nguon/, blog/, gioi-thieu/, dich-vu/, ...
    admin/             # khu quản trị (layout kiểm tra phiên)
    api/v1/            # REST API công khai + admin
    sitemap.ts robots.ts layout.tsx globals.css
  components/
    ui/                # nút, input, badge... (thuần trình bày)
    site/              # header, footer, floating-contact, section blocks
    property/ blog/ admin/
  lib/
    db/                # client, schema.ts, queries/
    auth/ security/ validation/ seo/ content/ utils/
  server/              # service layer dùng chung cho API + Server Actions
data/                  # JSON crawl từ tuyntantam.com (nguồn nội dung)
scripts/               # seed.ts, import-content.ts, create-admin.ts
drizzle/               # migrations SQL sinh bởi drizzle-kit
public/images/         # ảnh đã tải từ tuyntantam.com
design-reference/      # Stitch (ảnh, HTML), design-notes, houzez-analysis, gap-analysis
docs/                  # PLAN, API.md, MISSING-CONTENT, ACCEPTANCE, báo cáo
tests/
```

## Quy ước

- File/thư mục: `kebab-case`. Component React: `PascalCase` export, file `kebab-case.tsx`. Hàm/biến `camelCase`, hằng `SCREAMING_SNAKE_CASE`, bảng DB `snake_case` số nhiều.
- Route công khai dùng slug tiếng Việt không dấu: `/kho-nguon` (danh sách BĐS, menu "Kho nguồn"), `/blog`, `/gioi-thieu`, `/dich-vu`, `/lien-he`. URL cũ `/bat-dong-san`, `/tin-tuc` chuyển hướng 301.
- Server Component mặc định; chỉ `"use client"` khi cần state/sự kiện.
- Mọi đầu vào từ ngoài (query, body, form, params) đi qua schema Zod trong `src/lib/validation/`.
- API trả JSON dạng `{ data, meta? }` hoặc `{ error: { code, message } }`; không lộ stack trace.
- Commit: `type(scope): mô tả` (feat, fix, chore, docs, refactor, test, sec).

## Lệnh

```bash
npm install
docker compose up -d db          # Postgres local (cổng 5432)
cp .env.example .env.local       # rồi điền giá trị
npm run db:migrate               # áp migration
npm run db:seed                  # nạp data/*.json + tạo admin từ ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                      # http://localhost:3000
npm run lint && npm run typecheck && npm test
npm run build && npm start       # kiểm tra bản production
```

## Skill dự án (`.claude/skills/`)

- `design-tokens` — trước khi viết/sửa UI.
- `content-import` — khi crawl lại, cập nhật `data/`, seed.
- `security-checklist` — khi viết API, auth, form, upload, và GĐ5.
- `seo-checklist` — khi thêm trang, metadata, sitemap, schema.org.
- `deploy` — khi deploy hoặc đổi biến môi trường.
