# REST API v1 — Tuyn Tận Tâm

Base URL: `https://<domain>/api/v1`. Mọi phản hồi là JSON UTF-8:

```jsonc
// thành công
{ "data": ..., "meta": { "total": 12, "page": 1, "limit": 12, "pages": 1 } }
// lỗi (không bao giờ kèm stack trace)
{ "error": { "code": "validation_error", "message": "Tham số không hợp lệ", "details": [ { "field": "minPrice", "message": "..." } ] } }
```

| Mã lỗi | HTTP | Ý nghĩa |
|---|---|---|
| `validation_error` | 400 | Tham số/body sai (chi tiết trong `details`) |
| `invalid_json` | 400 | Body không phải JSON |
| `unauthorized` / `invalid_credentials` | 401 | Chưa đăng nhập / sai thông tin đăng nhập |
| `forbidden` / `forbidden_origin` | 403 | Không đủ quyền / Origin không hợp lệ (chống CSRF) |
| `not_found` | 404 | Không tìm thấy |
| `payload_too_large` | 413 | Body/ảnh quá lớn |
| `rate_limited` | 429 | Vượt giới hạn (header `Retry-After`) |
| `internal_error` | 500 | Lỗi máy chủ |

**Giới hạn tần suất:** API đọc công khai 120 request/phút/IP; `POST /leads` 5 lần/10 phút/IP; đăng nhập 5 lần/15 phút; upload 60 lần/10 phút.
**CORS:** chỉ same-origin; thêm origin qua biến `CORS_ORIGINS`. Request ghi dữ liệu (POST/PATCH/PUT/DELETE) phải có header `Origin` (hoặc `Referer`) cùng site.

---

## Công khai

### `GET /properties`
Danh sách BĐS đang hiển thị (`status = published`).

| Query | Kiểu | Ghi chú |
|---|---|---|
| `q` | string ≤ 100 | Tìm trong tiêu đề, địa chỉ, quận, tóm tắt |
| `listingType` | `RENT` \| `SALE` | |
| `type` | `can-ho`, `chung-cu-mini`, `can-ho-dich-vu`, `studio`, `phong-tro`, `nha-rieng`, `nha-pho`, `biet-thu`, `van-phong`, `mat-bang`, `dat` | |
| `district` | string | Khớp chính xác tên quận |
| `minPrice`, `maxPrice` | số (VND) | Thuê: giá/tháng; Bán: tổng giá |
| `minArea`, `maxArea` | số (m²) | |
| `bedrooms`, `bathrooms` | số nguyên | "từ N trở lên" |
| `amenities` | lặp lại tham số | Phải có đủ các tiện ích: `?amenities=Điều hoà&amenities=Máy giặt` |
| `featured` | `1` | Chỉ tin nổi bật |
| `sort` | `newest` (mặc định), `price-asc`, `price-desc`, `area-desc`, `featured` | |
| `page`, `limit` | số | `limit` mặc định 12, tối đa 50 |

```bash
curl "https://<domain>/api/v1/properties?listingType=RENT&district=C%E1%BA%A7u%20Gi%E1%BA%A5y&maxPrice=10000000&sort=price-asc"
```

### `GET /properties/:slug`
Chi tiết một tin đã đăng (không trả trường nội bộ `status`, `source`). 404 nếu không có hoặc chưa đăng.

### `GET /properties/by-slugs?slugs=a,b,c`
Tối đa 10 slug — dùng cho trang Yêu thích / So sánh.

### `GET /posts`
| Query | Ghi chú |
|---|---|
| `q` | Tìm trong tiêu đề, trích đoạn, nội dung |
| `category` | slug chuyên mục (gồm cả chuyên mục con) |
| `tag` | tên thẻ |
| `page`, `limit` | `limit` mặc định 6, tối đa 50 |

### `GET /posts/:slug`
Chi tiết bài viết (HTML đã sanitize, `categories`, `tags`, `readingMinutes`…).

### `GET /form-token`
Trả `{ data: { token } }` — token HMAC có thời điểm phát, form gửi kèm khi tạo lead (chống bot).

### `POST /leads`
Khách gửi liên hệ / đặt lịch xem / hỏi thông tin / ký gửi. Body JSON:

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `type` | | `CONTACT` (mặc định), `VIEWING`, `PROPERTY_INQUIRY`, `CONSIGNMENT` |
| `name` | ✔ | 2–100 ký tự |
| `phone` / `email` | ✔ một trong hai | SĐT Việt Nam; email hợp lệ |
| `consent` | ✔ | `true` — đồng ý lưu thông tin và được liên hệ |
| `message` | | ≤ 3000 ký tự (HTML bị loại bỏ) |
| `interest` | | `thue-nha`, `cho-thue`, `ban-nha`, `mua-nha`, `hoc-moi-gioi`, `dau-tu`, `hop-tac`, `khac` |
| `propertySlug` | | Tin BĐS liên quan |
| `preferredDate` (YYYY-MM-DD), `preferredTime` (HH:mm), `tourType` (`in-person`/`video`) | `preferredDate` bắt buộc với `VIEWING` | Ngày không được ở quá khứ |
| `consignmentType` (`RENT`/`SALE`), `propertyAddress`, `expectedPrice` | `consignmentType` bắt buộc với `CONSIGNMENT` | |
| `formToken` | nên có | Từ `GET /form-token` |
| `website` | | Honeypot — phải để trống |
| `turnstileToken` | khi bật Turnstile | |

Phản hồi `201 { data: { received: true } }`. Lead thiếu/sai token hoặc dính honeypot vẫn trả 201 nhưng được lưu ở trạng thái `SPAM` và không gửi email.

---

## Xác thực

| Endpoint | Mô tả |
|---|---|
| `POST /auth/login` `{ email, password }` | Tạo phiên, đặt cookie `HttpOnly` (`__Host-tt_session` ở production) |
| `POST /auth/logout` | Huỷ phiên |
| `GET /auth/me` | Người dùng hiện tại `{ id, email, name, role }` |

Các endpoint `/admin/*` dùng cookie phiên này. Vai trò: `EDITOR` (sửa nội dung, xem/xử lý khách liên hệ), `ADMIN` (toàn quyền, thêm xoá, cấu hình).

## Quản trị (`/admin/*`)

| Method & path | Quyền | Mô tả |
|---|---|---|
| `GET /admin/properties?q=&status=&page=&limit=` | EDITOR | Mọi trạng thái (`draft`/`published`/`archived`) |
| `POST /admin/properties` | EDITOR | Tạo tin (schema: `src/lib/validation/property.ts` → `propertyInputSchema`) |
| `GET /admin/properties/:id` | EDITOR | |
| `PATCH /admin/properties/:id` | EDITOR | Cập nhật một phần |
| `DELETE /admin/properties/:id` | ADMIN | 204 |
| `GET /admin/posts`, `POST /admin/posts` | EDITOR | Schema `postInputSchema` (`categorySlugs`, `tags`, `coverImage`…) |
| `GET/PATCH /admin/posts/:id` | EDITOR | |
| `DELETE /admin/posts/:id` | ADMIN | |
| `GET /admin/leads?status=&type=&q=&page=&limit=` | EDITOR | `status`: `NEW`, `IN_PROGRESS`, `DONE`, `SPAM` |
| `GET /admin/leads/:id`, `PATCH /admin/leads/:id` `{ status?, adminNote? }` | EDITOR | |
| `DELETE /admin/leads/:id` | ADMIN | |
| `GET /admin/leads/export?status=&type=` | EDITOR | Tải CSV (UTF-8 BOM, mở được bằng Excel) |
| `GET /admin/settings/:key` | EDITOR | `key`: `site`, `home`, `agent`, `donate` |
| `PUT /admin/settings/:key` | ADMIN | `site` kiểm tra chặt theo `siteSettingsSchema` |
| `POST /admin/uploads` (multipart, trường `files`) | EDITOR | ≤ 20 ảnh, ≤ 5 MB/ảnh, JPG/PNG/WebP/AVIF (kiểm tra magic bytes). Trả `[{ ok, url, width, height }]` |

Ví dụ (giữ cookie):

```bash
curl -c jar.txt -H "Origin: https://<domain>" -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"..."}' https://<domain>/api/v1/auth/login
curl -b jar.txt -H "Origin: https://<domain>" -H "Content-Type: application/json" \
  -d '{"title":"Căn hộ 2PN Cầu Giấy","listingType":"RENT","propertyType":"can-ho","price":12000000,"status":"draft"}' \
  https://<domain>/api/v1/admin/properties
```
