# Báo cáo cuối — Website BĐS Tuyn Tận Tâm

Ngày: 22/10/2026 · Mã nguồn: thư mục dự án này (Git, nhánh `main`).

## 1. Link website / hướng dẫn deploy

Chưa deploy lên Internet vì phiên làm việc không có quyền vào tài khoản Vercel, Neon hay GitHub của bạn (máy không có Vercel CLI và `gh`).
Mọi thứ cần để deploy đã sẵn sàng:

- `vercel.json`: region Singapore. Lệnh build tự chạy migration rồi `next build`.
- `Dockerfile` + `.dockerignore`: phương án dự phòng cho Railway, Render hoặc VPS. Image chạy migration khi khởi động.
- Hướng dẫn từng bước trong [README.md](../README.md), mục "Deploy lên Vercel + Neon", "Deploy bằng Docker", "Trỏ tên miền". Checklist sau deploy nằm trong `.claude/skills/deploy/SKILL.md`.

Tóm tắt các bước bạn cần làm (khoảng 15 phút):
1. Tạo database trên neon.tech (region Singapore), copy 2 chuỗi kết nối *pooled* và *direct*.
2. Đẩy repo lên GitHub (private), rồi trên vercel.com chọn *Add New Project* và import repo.
3. Thêm biến môi trường: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `APP_URL`, `SESSION_SECRET` (tuỳ chọn thêm `LEAD_NOTIFY_EMAIL`, `RESEND_API_KEY`, `MAIL_FROM`, Blob, Turnstile), rồi bấm Deploy.
4. Từ máy local, chạy `npm run db:seed` trỏ vào DB Neon để nạp nội dung và tạo admin, rồi bấm Redeploy.
5. Trỏ tên miền `tuyntantam.com` theo README. Các URL cũ của WordPress đã có redirect 301.

## 2. Tài khoản admin ban đầu

- Đăng nhập tại `/admin/dang-nhap`.
- **Local:** tài khoản `admin@tuyntantam.local`. Mật khẩu ngẫu nhiên được sinh vào file `.env.local` (biến `ADMIN_PASSWORD`; file này không commit).
- **Production:** admin được tạo khi bạn chạy `npm run db:seed` với `ADMIN_EMAIL` và `ADMIN_PASSWORD` do bạn tự chọn (≥ 10 ký tự). Sau đó xoá hai biến này khỏi môi trường.
- **Đổi mật khẩu:** vào `/admin` → **Tài khoản** → *Đổi mật khẩu*. Các phiên đăng nhập khác sẽ tự đăng xuất.
- **Quên mật khẩu:** chạy `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create` trên máy có quyền vào DB. Lệnh này đặt lại mật khẩu và đăng xuất mọi phiên.
- **Phân quyền:** *Quản trị viên* có toàn quyền. *Biên tập viên* sửa được nội dung và xử lý khách liên hệ, nhưng không xoá được và không sửa được cấu hình.

## 3. Công nghệ và lý do

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Framework | **Next.js 16** (App Router, Cache Components) + TypeScript strict | Frontend, backend và API trong một repo. Trang được prerender tĩnh và cache theo tag; admin sửa là cập nhật ngay. |
| UI | Tailwind CSS v4 với token lấy từ Stitch; Playfair Display + Plus Jakarta Sans (có tiếng Việt, variable font); lucide icons | Bám sát design system Stitch, trang nhẹ |
| DB | **PostgreSQL** (Neon free) + **Drizzle ORM** | Truy vấn tham số hoá, migration SQL rõ ràng, chạy tốt trên serverless |
| Bảo mật | argon2id, phiên lưu DB + cookie `__Host-` HttpOnly/Secure/SameSite, Zod, sanitize-html, rate limit trên Postgres, honeypot + token HMAC (+ Turnstile tuỳ chọn), CSP/HSTS… | Chi tiết trong [SECURITY.md](SECURITY.md) |
| Email, ảnh | Resend, Vercel Blob (đều tuỳ chọn, bật bằng biến môi trường) | Gói free, không phải bảo trì |
| Bản đồ | Leaflet + OpenStreetMap | Không cần API key |
| Deploy | **Vercel + Neon**; dự phòng Docker | Dễ deploy nhất, ít bảo trì. Bảng so sánh 3 phương án trong README. **Lưu ý:** gói Vercel Hobby chỉ dành cho mục đích phi thương mại; site kinh doanh nên dùng Pro ($20/tháng) hoặc Docker. |

**Chất lượng đã kiểm chứng:**
- ESLint, TypeScript và Prettier đều sạch.
- 154 test Vitest (unit + API trên DB test riêng) đều pass.
- `next build` production thành công, 68 trang.
- Không có lỗi console; không tràn ngang trên mobile (390px).
- Lighthouse mobile, đo sau một lượt warm-up:

| Trang | Hiệu năng |
|---|---|
| Trang chủ | 90–91 |
| Tin tức | 92–94 |
| Bài viết | 91 |
| Bất động sản | 92 |
| Giới thiệu | 91 |
| Liên hệ | 93 |

Accessibility, Best Practices và SEO đều đạt 100. Riêng trang Ủng hộ có Best Practices 96 vì ảnh QR gốc lớn.

## 4. Gap analysis cuối cùng

Chi tiết từng dòng trong [design-reference/gap-analysis.md](../design-reference/gap-analysis.md). Tóm tắt kết quả:

| Nhóm | Đã làm | Làm, tự hiện khi có tin BĐS | Rút gọn | Bỏ (lý do) |
|---|---|---|---|---|
| Trang | Trang chủ, Giới thiệu, Tin tức (danh sách, chuyên mục, thẻ, chi tiết), Dịch vụ + 4 trang con, Môi giới, Đầu tư, Liên hệ & Hợp tác, Kho nguồn + ký gửi, Ủng hộ, 404 | Danh sách BĐS (khi chưa có tin thì hiện empty-state), Chi tiết BĐS, Yêu thích, So sánh | Định giá nhà → gộp thành form ký gửi | Danh sách agent/agency, đăng ký người dùng (site một người) |
| Tìm kiếm | Tìm bài viết | Lọc theo hình thức, loại hình, khu vực, giá, diện tích, phòng ngủ, phòng tắm, tiện ích, từ khoá; lưới/danh sách; phân trang; nhãn nổi bật | Bản đồ Leaflet (không cluster); 5 kiểu sắp xếp | Saved search, Property ID |
| Chi tiết BĐS | — | Gallery + lightbox, overview, mô tả, tiện ích, BĐS tương tự, form đặt lịch xem (ngày/giờ, trực tiếp/video) và hỏi thông tin, sidebar dính, thanh liên hệ đáy mobile, JSON-LD | Video YouTube, tour 360° (allowlist), bản đồ vị trí, máy tính vay (chỉ tin Bán, người dùng tự nhập lãi suất), chia sẻ, nav section | Street View, sơ đồ mặt bằng, đánh giá, Walkscore |
| Blog | Bài nổi bật, lưới + sidebar (tìm kiếm, chuyên mục, chủ đề), mục lục, author box, bài liên quan, trước/sau, thời gian đọc, chia sẻ | — | — | Bình luận (spam), widget biểu đồ giá (không có số liệu thật) |
| Marketing & khác | Dịch vụ, testimonials (3 khách thật), số liệu 5+/200+/20+, đối tác, CTA cộng đồng 1000+ môi giới (thay cho newsletter), nút liên hệ nổi Gọi/WhatsApp/Email, back-to-top, menu mobile, checkbox đồng ý xử lý dữ liệu | Lưới "Khu vực" (sinh tự động từ tin) | Zalo (ẩn đến khi nhập số) | Newsletter (site gốc không có), đa tiền tệ/ngôn ngữ, dark mode, cookie banner |
| Backend | REST API v1 + `docs/API.md`, admin (khách liên hệ + xuất CSV, BĐS, tin tức, trang & dịch vụ, cấu hình, tài khoản), upload ảnh, email thông báo, SEO (metadata, sitemap, robots, JSON-LD, redirect 301) | — | — | — |

## 5. Nội dung còn thiếu

Xem [MISSING-CONTENT.md](MISSING-CONTENT.md). Các mục chính:
1. **Tin bất động sản:** site gốc có 0 tin. Hiện có 16 **tin mẫu** (`npm run db:seed:demo`, có nhãn "Tin mẫu") để xem giao diện. Trước khi chạy thật hãy xoá chúng (`npm run db:seed:demo -- --remove`) rồi đăng tin thật trong `/admin/bat-dong-san`.
2. **Số Zalo.**
3. **Nội dung 3 trang dịch vụ** đang ghi "đang cập nhật" ở site gốc.
4. **Email nhận thông báo lead** và tài khoản Resend.
5. Địa chỉ văn phòng, Telegram thật, ảnh og:image, alt ảnh.
6. **Video mp4** trong một bài vẫn nằm trên host WordPress cũ, nên chuyển sang YouTube.
7. Một số điểm cần bạn xác nhận: thông tin chuyển khoản trên trang Ủng hộ, số năm kinh nghiệm không thống nhất, lỗi chính tả ở site gốc, trang tuyển dụng Cường Phát Land còn tiêu đề mẫu.

## 6. Chạy local và cập nhật nội dung

```bash
npm install
docker compose up -d db
cp .env.example .env.local     # điền SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate && npm run db:seed
npm run dev                    # http://localhost:3000, quản trị tại /admin
```

**Cập nhật nội dung:** dùng `/admin` (tin BĐS, tin tức, trang & dịch vụ, cấu hình, khách liên hệ); thay đổi hiện lên web ngay. Muốn nạp lại từ `data/*.json` thì chạy `npm run db:seed`; lệnh này không ghi đè bản ghi đã sửa trong admin. Chi tiết trong [README.md](../README.md).

## 7. Giao diện Houzez demo29, tin mẫu, rà soát backend (23/10/2026)

**Giao diện**
- Trang chủ làm lại theo bố cục Houzez demo29, theo thứ tự:
  1. Hero ảnh Hà Nội toàn màn hình, có thanh tìm kiếm (chip Tất cả / Cho thuê / Bán; loại hình, khu vực, phòng ngủ, ngân sách).
  2. Carousel "Bất động sản nổi bật" có tab theo khu vực và hình thức.
  3. Khối "Về tôi".
  4. Dải CTA Kho nguồn có ảnh nền.
  5. Lưới khu vực dạng bento.
  6. Carousel "Tin cho thuê mới nhất".
  7. Dịch vụ, cảm nhận khách hàng, CTA cộng đồng, blog kèm form liên hệ, logo đối tác.
- Mọi chữ trên trang chủ vẫn lấy từ tuyntantam.com. Riêng ảnh hero, ảnh khu vực và ảnh tin mẫu lấy từ Unsplash.
- Hiệu ứng:
  - Chuyển trang: trang cũ mờ đi, trang mới trồi lên; header đứng yên (React `<ViewTransition>`).
  - Ảnh bìa card "bay" sang ảnh lớn ở trang chi tiết.
  - Đổi tab carousel có crossfade.
  - Các khối hiện dần khi cuộn tới (CSS scroll-driven).
  - Ảnh thứ hai của card hiện khi rê chuột.
- Các hiệu ứng tự tắt khi người dùng bật "giảm chuyển động". Trình duyệt cũ vẫn hoạt động bình thường, chỉ không có hiệu ứng.

**Backend:** kết quả rà soát nằm ở [BACKEND-REVIEW.md](BACKEND-REVIEW.md); đã sửa 15/18 mục.
- 2 mục Cao: tiến trình sập khi DB ngắt kết nối, và Postgres dev mở ra mạng.
- Các mục khác:
  - Giới hạn thời gian truy vấn.
  - Giả IP để vượt rate limit.
  - Dò mật khẩu bằng cách đổi email.
  - Body chunked quá lớn.
  - Ảnh host lạ làm sập trang.
  - GET công khai không còn ghi DB.
  - Dọn phiên hết hạn.
  - id heading.
  - URL trong cấu hình.
  - CSV.
  - Transaction.
- Đã chạy thử tải và thử tấn công trên bản build production: không có lỗi, không sập.

**Hiệu năng sau khi đổi giao diện** (Lighthouse mobile, bản build production):

| Trang | Hiệu năng | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Trang chủ | 80–84 | 100 | 100 | 100 |
| Bất động sản | 86–88 | 100 | 100 | 100 |
| Chi tiết BĐS | 78–89 | 100 | 96 | 100 |
| Giới thiệu | 90 | 100 | 100 | 100 |

- Trang chủ giảm từ 90–91 xuống 80–84 vì LCP giờ là ảnh hero toàn màn hình (LCP khoảng 4,4 giây khi giả lập 4G chậm). Muốn trở lại khoảng 90 thì thay hero ảnh bằng nền màu hoặc ảnh nhỏ hơn.
- Best Practices 96 ở trang chi tiết là do tile bản đồ OSM không tải được trong môi trường đo (máy đo không có mạng ngoài).
- Hiệu ứng chuyển trang chỉ chạy khi bấm link trong site. Lần tải đầu không có hiệu ứng, vì nếu có thì nội dung stream hiện chậm thêm khoảng 0,4 giây (đã đo: 0,4 giây lên 0,8 giây).

**Nghiệm thu độc lập lần trước** bị dừng giữa chừng, chưa có `ACCEPTANCE.md`. Phần đã kiểm chứng:
- Lint, typecheck, 159 test, build production.
- Trang chủ không tràn ngang trên mobile 375px, không có lỗi console.
- Chuyển trang và morph ảnh chạy trên bản production.
