---
name: deploy
description: Quy trình deploy website Tuyn Tận Tâm lên Vercel + Neon (chính) hoặc Docker (dự phòng) — biến môi trường, migration, seed, tạo admin, trỏ tên miền và kiểm tra sau deploy. Dùng khi deploy, đổi môi trường, thêm biến môi trường hoặc xử lý sự cố production.
---

# Deploy

## 0. Trước khi deploy
1. `npm run lint && npm run typecheck && npm test && npm run build` đều xanh.
2. Đọc lại skill `security-checklist` mục 6–8; `npm audit --omit=dev`.
3. `.env.example` đã liệt kê đủ biến mới.

## 1. Biến môi trường

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `DATABASE_URL` | Có | Neon: dùng **pooled** connection string (`-pooler`), `sslmode=require` |
| `DATABASE_URL_UNPOOLED` | Có (migrate) | Neon direct connection, dùng cho `drizzle-kit migrate` |
| `APP_URL` | Có | `https://<domain>` — dùng cho metadataBase, kiểm tra Origin |
| `SESSION_SECRET` | Có | ≥ 32 ký tự ngẫu nhiên (`openssl rand -base64 48`) — ký HMAC token form |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Chỉ khi seed | Tạo admin đầu tiên; xoá khỏi env sau khi seed |
| `LEAD_NOTIFY_EMAIL` | Không | Email nhận thông báo lead |
| `RESEND_API_KEY`, `MAIL_FROM` | Không | Gửi email qua Resend (domain đã verify) |
| `BLOB_READ_WRITE_TOKEN` | Không | Vercel Blob cho upload ảnh admin (tự có khi gắn Blob store) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Không | Bật Cloudflare Turnstile cho form |
| `CORS_ORIGINS` | Không | Danh sách origin ngoài được gọi API, phân tách bằng dấu phẩy |

## 2. Vercel + Neon (phương án chính)
1. Tạo DB Neon (region gần VN: `aws-ap-southeast-1` Singapore). Lấy 2 connection string (pooled + direct).
2. Đẩy code lên GitHub (repo private). Vercel → Add New Project → import repo. Framework: Next.js, region Functions: `sin1`.
3. Settings → Environment Variables: thêm các biến ở mục 1 cho Production (và Preview nếu cần DB riêng — dùng Neon branch).
4. (Tuỳ chọn) Storage → Blob → Connect để có `BLOB_READ_WRITE_TOKEN`.
5. Migration + seed từ máy local trỏ DB prod:
   ```bash
   DATABASE_URL="<pooled>" DATABASE_URL_UNPOOLED="<direct>" npm run db:migrate
   DATABASE_URL="<pooled>" ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed
   ```
   (PowerShell: `$env:DATABASE_URL="..."; npm run db:migrate`.)
6. Deploy (push nhánh `main` hoặc `npx vercel --prod`).
7. Lưu ý điều khoản: gói Hobby chỉ cho mục đích cá nhân phi thương mại; khi site dùng cho kinh doanh nên nâng Pro hoặc chuyển phương án Docker.

## 3. Docker (dự phòng: Railway / Render / VPS)
```bash
docker build -t tuyntantam-web .
docker run -p 3000:3000 --env-file .env.production -v tt_uploads:/app/public/uploads tuyntantam-web
```
Migration: `docker run --rm --env-file .env.production tuyntantam-web npm run db:migrate` (image có kèm drizzle-kit ở stage migrate) — hoặc chạy từ máy local như mục 2.5.

## 4. Tên miền
- Vercel → Settings → Domains → thêm `tuyntantam.com` và `www.tuyntantam.com`; tại nhà cung cấp DNS: `A @ 76.76.21.21`, `CNAME www cname.vercel-dns.com` (theo giá trị Vercel hiển thị).
- Cập nhật `APP_URL` → redeploy.
- Nếu thay site WordPress cũ: các redirect 301 trong `next.config.ts` giữ link cũ (xem `seo-checklist`).

## 5. Kiểm tra sau deploy
- [ ] `curl -sI https://<domain>/` → 200, có HSTS, CSP, X-Frame-Options…; `http://` chuyển `https://`.
- [ ] `/sitemap.xml`, `/robots.txt` trả đúng.
- [ ] `GET /api/v1/properties?limit=1`, `GET /api/v1/posts?limit=1` → 200 JSON.
- [ ] Gửi form liên hệ thật → lead xuất hiện trong `/admin/leads` (+ email nếu cấu hình).
- [ ] Đăng nhập `/admin`, đổi mật khẩu admin mặc định.
- [ ] Mở trang chủ trên điện thoại; không lỗi console.
- [ ] Ghi URL + thời điểm vào `docs/DEPLOY-LOG.md`.

## 6. Rollback
Vercel → Deployments → chọn bản trước → Promote to Production. DB: Neon → Branches → restore theo thời điểm (PITR trong giới hạn gói).
