---
name: security-checklist
description: Danh sách kiểm tra bảo mật bắt buộc cho website Tuyn Tận Tâm. Dùng khi viết hoặc review API route, Server Action, đăng nhập/phiên, form công khai (leads), upload ảnh, cấu hình headers/CORS, biến môi trường, và trước mỗi lần deploy (Giai đoạn 5).
---

# Security checklist

Đánh dấu từng mục khi kiểm tra. Mục nào không áp dụng ghi rõ lý do. Kết quả ghi vào `docs/SECURITY.md`.

## 1. Xác thực & phiên
- [ ] Mật khẩu băm `argon2id` (`@node-rs/argon2`), không bao giờ log/trả mật khẩu hay hash.
- [ ] Token phiên: 32 byte ngẫu nhiên (`crypto.randomBytes`), DB chỉ lưu SHA-256 của token.
- [ ] Cookie `__Host-tt_session` (prod) / `tt_session` (dev): `HttpOnly`, `Secure` (prod), `SameSite=Lax`, `Path=/`, hết hạn 7 ngày, gia hạn trượt. Đổi tên cookie phải sửa cả `src/proxy.ts`.
- [ ] Đăng xuất xoá bản ghi phiên; đổi mật khẩu xoá mọi phiên khác.
- [ ] Đăng nhập trả lỗi chung "Email hoặc mật khẩu không đúng" (không lộ email tồn tại), thời gian phản hồi đồng đều (verify với hash giả khi không có user).
- [ ] Rate limit đăng nhập: 5 lần / 15 phút / IP+email, thêm 20 / 15 phút / IP và 30 / giờ / tài khoản; tối đa 4 lần argon2 chạy đồng thời.
- [ ] Phân quyền theo vai trò ở **server** (`requireRole("ADMIN")`) cho mọi route `/api/v1/admin/*`, Server Action và trang `/admin/*`. Middleware/proxy chỉ là lớp phụ.

## 2. Đầu vào
- [ ] Mọi query/body/params/form/headers dùng parse bằng Zod (`safeParse`), giới hạn độ dài chuỗi, số trong khoảng hợp lệ, enum cho trường phân loại.
- [ ] Truy vấn DB qua Drizzle (tham số hoá). Cấm nối chuỗi SQL với input; `sql\`\`` chỉ dùng placeholder.
- [ ] Sắp xếp/lọc chỉ nhận giá trị trong whitelist (không đưa tên cột từ client vào SQL).
- [ ] Rich text (nội dung bài viết/BĐS) sanitize bằng `sanitize-html` whitelist khi lưu **và** khi render; không `dangerouslySetInnerHTML` với dữ liệu chưa sanitize.
- [ ] URL do người dùng nhập (ảnh, video) chỉ chấp nhận `https:`; YouTube chỉ lưu video id.

## 3. CSRF
- [ ] Cookie `SameSite=Lax` + kiểm tra header `Origin`/`Host` khớp `APP_URL` cho mọi request thay đổi dữ liệu (POST/PUT/PATCH/DELETE) tới `/api/v1/*` có dùng cookie.
- [ ] Server Actions: dựa trên kiểm tra Origin tích hợp của Next.js, cấu hình `serverActions.allowedOrigins` khi dùng domain riêng.

## 4. Chống lạm dụng
- [ ] `POST /api/v1/leads`: rate limit 5 / 10 phút / IP, honeypot field `website` phải rỗng, token `GET /api/v1/form-token` (HMAC, ≥ 3 giây, ≤ 24 giờ), Turnstile khi có `TURNSTILE_SECRET_KEY`. Lead nghi spam lưu `status = SPAM` thay vì bỏ.
- [ ] API công khai GET: rate limit 120 / phút / IP đếm trong bộ nhớ (không ghi DB); POST đếm trên Postgres; `limit` tối đa 50.
- [ ] IP theo `TRUST_PROXY`: `vercel` → `x-real-ip`/XFF đầu; `proxy` (Docker sau nginx/Caddy) → phần tử CUỐI của XFF. Lưu dạng băm khi ghi vào leads.
- [ ] Ảnh (post, BĐS, cấu hình) chỉ nhận `/...` hoặc Vercel Blob (`imageSrcSchema`) — host lạ làm next/image sập trang.
- [ ] `readJson` đọc body theo luồng, cắt ở `maxBytes` (body chunked không có Content-Length).
- [ ] Pool `pg` có `on("error")` + `statement_timeout`; Postgres dev chỉ mở trên 127.0.0.1.

## 5. Upload
- [ ] Chỉ admin. Chỉ `image/jpeg`, `image/png`, `image/webp`, `image/avif`; kiểm tra **magic bytes**, không tin `Content-Type`/đuôi file.
- [ ] Tối đa 5 MB/file, 20 file/lần. Đổi tên file thành `<uuid>.<ext>`, không dùng tên gốc trong đường dẫn.
- [ ] Không cho SVG (XSS).

## 6. Headers & CORS (`next.config.ts` → `headers()`)
- [ ] `Content-Security-Policy`: `default-src 'self'`; `img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.tile.openstreetmap.org https://i.ytimg.com`; `frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com`; `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com` (Next cần inline bootstrap; nâng lên nonce nếu có thời gian); `style-src 'self' 'unsafe-inline'`; `connect-src 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`; `object-src 'none'`.
- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (chỉ prod).
- [ ] `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`.
- [ ] `poweredByHeader: false`.
- [ ] CORS: không bật `Access-Control-Allow-Origin: *`. API chỉ phục vụ same-origin; nếu cần mở cho domain khác, whitelist qua `CORS_ORIGINS`.

## 7. Lỗi & log
- [ ] Handler bọc `try/catch` chung → trả `{ error: { code, message } }` tiếng Việt, status phù hợp; chi tiết chỉ `console.error` phía server.
- [ ] Trang `error.tsx` / `not-found.tsx` không in stack.
- [ ] Không log PII đầy đủ (che SĐT/email trong log).

## 8. Bí mật & phụ thuộc
- [ ] `.env.example` liệt kê mọi biến, không chứa giá trị thật. `.gitignore` chặn `.env*`.
- [ ] `src/lib/env.ts` validate biến môi trường bằng Zod lúc khởi động; thiếu biến bắt buộc → lỗi rõ ràng.
- [ ] Không biến bí mật nào mang tiền tố `NEXT_PUBLIC_`.
- [ ] `npm audit --omit=dev` không còn mức high/critical (ghi lại ngoại lệ nếu có và lý do).
- [ ] Chạy `/security-review` trên diff cuối.

## 9. Kiểm thử bảo mật tối thiểu
- [ ] Test: lead thiếu trường/sai định dạng → 400; honeypot có giá trị hoặc token sai → 201 nhưng lưu trạng thái `SPAM` (không gửi email); vượt rate limit → 429.
- [ ] Test: gọi API admin không cookie → 401; vai trò EDITOR gọi route chỉ ADMIN → 403.
- [ ] `curl -I` trang chủ prod có đủ security headers.
