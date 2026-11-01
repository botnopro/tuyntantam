# Tuyn Tận Tâm — Website bất động sản

Website cho thương hiệu môi giới cho thuê bất động sản **Tuyn Tận Tâm** (Hà Nội).

- **Giao diện:** theo thiết kế Stitch "Modern Real Estate Portal" (Terracotta & Slate), bổ sung bố cục/tính năng từ theme Houzez. Ngôn ngữ giao diện là tiếng Việt.
- **Nội dung:** 100% từ https://tuyntantam.com/ (crawl ngày 22/10/2026).
- **Tính năng:** trang chủ, giới thiệu, blog/tin tức, dịch vụ, kho nguồn + ký gửi, liên hệ, module bất động sản (lọc, sắp xếp, lưới/danh sách/bản đồ, chi tiết, đặt lịch xem, yêu thích, so sánh, máy tính vay), REST API, trang quản trị, SEO đầy đủ.

> Site gốc **chưa có tin bất động sản nào**. Module BĐS đã làm đủ nhưng tự ẩn cho tới khi có tin "Hiển thị" trong `/admin`. Xem [docs/MISSING-CONTENT.md](docs/MISSING-CONTENT.md).

## Công nghệ

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Framework | Next.js 16 (App Router, Cache Components) + TypeScript strict | Frontend và backend trong 1 repo, render tĩnh + cache theo tag, SEO tốt |
| Giao diện | Tailwind CSS v4, `next/font` (Playfair Display, Plus Jakarta Sans có tiếng Việt), lucide icons | Đúng token của Stitch, nhẹ |
| Database | PostgreSQL (Neon free) + Drizzle ORM | Truy vấn tham số hoá, migration SQL rõ ràng, không cần bước generate |
| Bảo mật | argon2id, phiên lưu DB + cookie HttpOnly, Zod, sanitize-html, rate limit trên Postgres, CSP/HSTS | Xem [docs/SECURITY.md](docs/SECURITY.md) |
| Email | Resend (tuỳ chọn) | Gói free 3.000 email/tháng, API đơn giản |
| Ảnh upload | Vercel Blob (tuỳ chọn) hoặc thư mục `storage/` | |
| Bản đồ | Leaflet + OpenStreetMap | Không cần API key |

### So sánh phương án deploy (GĐ3)

| | **Vercel + Neon** (chọn) | Cloudflare Workers (OpenNext) + Neon | Railway / Render + Docker |
|---|---|---|---|
| Độ dễ | Dễ nhất: nối GitHub là xong, HTTPS/CDN tự động | Trung bình: cần adapter OpenNext, R2 cho ISR, argon2 native không chạy | Trung bình: tự build Docker, tự cấu hình proxy |
| Chi phí | Hobby $0; **Pro $20/tháng nếu dùng thương mại** | Free 100k request/ngày (giới hạn CPU 10 ms/request quá chặt cho SSR) | Render free ngủ sau 15 phút (khởi động lại 30–50 s); Railway ~$5/tháng |
| Bảo trì | Gần như không | Theo dõi tương thích adapter | Cập nhật image, sao lưu |
| Giới hạn | Gói Hobby chỉ dành cho mục đích cá nhân, phi thương mại | Image optimization tính phí riêng | Free tier ngủ / dùng thử |

→ Chọn **Vercel + Neon** vì dễ deploy và ít bảo trì nhất. Có sẵn `Dockerfile` làm phương án dự phòng. Lưu ý điều khoản: website kinh doanh nên dùng Vercel Pro hoặc chuyển sang Docker.

## Chạy trên máy (local)

Yêu cầu: Node.js ≥ 20.9 (khuyên dùng 24), Docker Desktop.

```bash
npm install
docker compose up -d db              # Postgres 16 tại localhost:5432
cp .env.example .env.local           # điền SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate                   # tạo bảng
npm run db:seed                      # nạp nội dung từ data/*.json + tạo tài khoản admin
npm run dev                          # http://localhost:3000  — quản trị: /admin
```

Các lệnh khác:

```bash
npm run lint && npm run typecheck    # kiểm tra mã
npm test                             # Vitest (dùng DB riêng tuyntantam_test — xem tests/README.md)
npm run build && npm start           # chạy bản production
npm run screenshots -- ./shots http://localhost:3000 / /tin-tuc   # chụp ảnh full-page desktop + mobile
```

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✔ | Chuỗi kết nối Postgres (Neon: dùng chuỗi **pooled**) |
| `DATABASE_URL_UNPOOLED` | khuyên dùng với Neon | Chuỗi **direct**, dùng khi chạy migration |
| `APP_URL` | ✔ | URL công khai, ví dụ `https://tuyntantam.com` |
| `SESSION_SECRET` | ✔ | Chuỗi ngẫu nhiên ≥ 32 ký tự: `openssl rand -base64 48` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | khi seed | Tạo admin đầu tiên (mật khẩu ≥ 10 ký tự); xoá khỏi môi trường sau khi tạo |
| `LEAD_NOTIFY_EMAIL` | | Email nhận thông báo khách liên hệ |
| `RESEND_API_KEY`, `MAIL_FROM` | | Gửi email qua Resend (`MAIL_FROM` thuộc domain đã xác minh) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | | Báo khách liên hệ/đặt lịch về Telegram (xem `docs/KE-HOACH-THONG-BAO-TELEGRAM.md`). Token là bí mật |
| `BLOB_READ_WRITE_TOKEN` hoặc `BLOB_STORE_ID` | **bắt buộc trên Vercel để admin tải ảnh** | Tự có khi gắn Vercel Blob store (store kiểu mới chỉ cấp `BLOB_STORE_ID` + OIDC — cũng được nhận). Store *public* → ảnh qua CDN; store *private* → ảnh phục vụ qua `/uploads/...` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | | Bật Cloudflare Turnstile cho form |
| `CORS_ORIGINS` | | Origin ngoài được gọi API (phân tách dấu phẩy) |
| `TRUST_PROXY` | | Cách lấy IP khách cho rate limit: tự là `vercel` trên Vercel; mặc định `proxy` (phần tử cuối của `X-Forwarded-For` do nginx/Caddy nối vào). Docker **phải** chạy sau reverse proxy |
| `UPLOAD_DIR` | | Thư mục lưu ảnh khi không dùng Blob (mặc định `./storage/uploads`) |

## Tài khoản quản trị

- Tài khoản đầu tiên được tạo khi chạy `npm run db:seed` với `ADMIN_EMAIL` và `ADMIN_PASSWORD`.
- **Đổi mật khẩu:** đăng nhập `/admin` → **Tài khoản** → *Đổi mật khẩu*. Các phiên đăng nhập khác sẽ bị đăng xuất.
- **Quên mật khẩu:** trên máy có quyền vào DB, chạy:
  ```bash
  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='mat-khau-moi-du-dai' npm run admin:create
  ```
  Lệnh này đặt lại mật khẩu (hoặc tạo mới nếu chưa có) và đăng xuất mọi phiên của tài khoản đó.
- Thêm biên tập viên: **Tài khoản** → *Thêm tài khoản* (chỉ quản trị viên).

## Deploy lên Vercel + Neon

1. **Neon:** tạo project (region Singapore), lấy 2 chuỗi kết nối *pooled* và *direct*.
2. **GitHub:** đẩy repo lên (private).
3. **Vercel:** *Add New Project* → chọn repo. Ở **Environment Variables** thêm `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), `APP_URL`, `SESSION_SECRET` và các biến tuỳ chọn ở trên.
   `vercel.json` đã đặt region `sin1` và lệnh build `node scripts/migrate.mjs && next build`, nên **migration chạy tự động mỗi lần deploy**.
4. **Storage → Blob → Create/Connect** (chọn *Public*) rồi **Redeploy** — thiếu bước này admin không tải ảnh BĐS lên được (Vercel không cho ghi đĩa).
5. **Nạp nội dung lần đầu** (từ máy local, trỏ vào DB production):
   ```bash
   # macOS/Linux
   DATABASE_URL="<pooled>" SESSION_SECRET="<như trên Vercel>" ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run db:seed
   # Windows PowerShell
   $env:DATABASE_URL="<pooled>"; $env:SESSION_SECRET="..."; $env:ADMIN_EMAIL="..."; $env:ADMIN_PASSWORD="..."; npm run db:seed
   ```
6. Bấm **Redeploy** để các trang tĩnh build lại với dữ liệu mới.
7. Kiểm tra theo checklist trong `.claude/skills/deploy/SKILL.md` (header bảo mật, sitemap, gửi thử form, đăng nhập admin).

### Deploy bằng Docker (Railway / Render / VPS)

```bash
DOCKER_BUILDKIT=1 docker build --secret id=database_url,env=DATABASE_URL --build-arg APP_URL=https://tuyntantam.com -t tuyntantam-web .
docker run -d -p 3000:3000 --env-file .env.production -v tt_storage:/app/storage tuyntantam-web
```

Container tự chạy migration khi khởi động. **Bắt buộc** đặt sau reverse proxy có HTTPS (Caddy, Nginx, hoặc proxy của Railway/Render): app lấy IP khách từ phần tử cuối của `X-Forwarded-For` do proxy nối vào. Nếu mở thẳng cổng 3000 ra Internet, kẻ xấu có thể giả IP để vượt giới hạn tần suất.

`docker-compose.yml` trong repo **chỉ dùng cho máy dev** (Postgres mở trên `127.0.0.1`, mật khẩu mẫu). Trên VPS hãy dùng mật khẩu riêng và không publish cổng 5432; nếu DB chạy cùng mạng Docker thì thêm `?sslmode=disable` vào `DATABASE_URL`.

## Trỏ tên miền

1. Vercel → **Settings → Domains** → thêm `tuyntantam.com` và `www.tuyntantam.com`.
2. Tại nơi quản lý DNS: tạo bản ghi **A** `@` trỏ tới IP Vercel hiển thị (thường là `76.76.21.21`) và **CNAME** `www` → `cname.vercel-dns.com`.
3. Đổi `APP_URL` thành `https://tuyntantam.com` rồi Redeploy.
4. Các đường dẫn cũ của WordPress (`/blog/<bài>/.html`, `/<bài>`, `/lien-he-hop-tac`, `/donate`, `/danh-muc/...`, các trang dịch vụ) đã được **chuyển hướng 301** sang đường dẫn mới, nên thứ hạng Google được giữ.

## Cập nhật nội dung

| Muốn sửa | Ở đâu |
|---|---|
| Đăng / sửa tin BĐS (ảnh, giá, vị trí, tiện ích) | `/admin/bat-dong-san` |
| Viết / sửa bài blog | `/admin/tin-tuc` |
| Trang Giới thiệu, Môi giới, Đầu tư, Liên hệ, Kho nguồn, Ủng hộ; 4 dịch vụ | `/admin/noi-dung` |
| SĐT, email, Zalo, mạng xã hội, cộng đồng, SEO trang chủ | `/admin/cau-hinh` |
| Khách liên hệ (đánh dấu đã xử lý, xuất CSV) | `/admin/khach-lien-he` |
| Nạp lại toàn bộ từ `data/*.json` | Sửa JSON → `npm run db:seed` (chỉ ghi đè bản ghi nhập từ site gốc mà chưa bị sửa trong admin; thêm `-- --force-settings` để ghi đè cấu hình) |

Thay đổi trong admin hiện lên website ngay (cache được làm mới theo tag).

### Tin BĐS mẫu (để xem giao diện)

Site gốc chưa có tin BĐS nào nên trang chủ, danh sách và chi tiết BĐS sẽ ẩn. Để xem đầy đủ giao diện, nạp 16 căn hộ **mẫu** ở Hà Nội:

```bash
npm run db:seed:demo               # nạp hoặc cập nhật tin mẫu
npm run db:seed:demo -- --remove   # xoá toàn bộ tin mẫu
```

- Tin mẫu có slug bắt đầu bằng `demo-`, có nhãn **"Tin mẫu"** trên card và dòng ghi chú trên trang chi tiết, để khách không nhầm là tin thật.
- Ảnh trong `public/images/demo/` lấy từ Unsplash (giấy phép miễn phí, xem `CREDITS.md`).
- **Trước khi chạy thật:** xoá tin mẫu (`--remove`) rồi đăng tin thật trong `/admin/bat-dong-san`. Ảnh nền trang chủ và ảnh khu vực vẫn được giữ.
- Chạy lệnh khi server đang chạy thì cần restart server, hoặc lưu một tin bất kỳ trong admin, để làm mới cache.

## Cấu trúc & tài liệu

- `CLAUDE.md` — quy ước dự án; `.claude/skills/` — design tokens, content import, bảo mật, SEO, deploy.
- `docs/PLAN.md` (kế hoạch), `docs/API.md` (REST API), `docs/SECURITY.md`, `docs/MISSING-CONTENT.md`.
- `design-reference/` — ảnh Stitch, `design-notes.md`, `houzez-analysis.md`, `gap-analysis.md`.
- `data/` — nội dung crawl từ tuyntantam.com (+ `crawl-report.md`).
