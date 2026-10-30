# Rà soát backend: độ bền, khả năng chịu tải, bảo mật

Ngày rà soát: 23/10/2026. Phạm vi: `src/lib/db`, `src/server/*`, `src/lib/{api,auth,security,validation}`, `src/app/api/v1/*`, `src/app/admin/actions.ts`, `src/components/forms/actions.ts`, `src/app/uploads/[...path]/route.ts`, `next.config.ts`, `docker-compose.yml`, `Dockerfile`.
Đợt này chỉ đọc code, không sửa mã nguồn.

## Kết luận ngắn (trả lời chủ website)

**1. Lưu dữ liệu bằng PostgreSQL + Drizzle có ổn không?** Ổn, và là lựa chọn đúng. Postgres (Neon) thừa sức cho một website môi giới cá nhân với vài chục đến vài nghìn tin. Mọi truy vấn đều được tham số hoá qua Drizzle, schema có ràng buộc và index cho các truy vấn chính. Chưa cần đổi sang công nghệ khác.

**2. Đông người vào có dễ sập không?** Phần lớn trang công khai không truy vấn DB ở mỗi lượt xem. Trang chủ, bài viết, chi tiết BĐS, giới thiệu và dịch vụ được prerender hoặc lấy từ `"use cache"` (`cacheLife("hours"/"days")`). Vì vậy lượng khách thật không phải mối lo chính. Có 3 điểm cần sửa trước khi chạy thật:
- Pool kết nối `pg` **chưa có trình xử lý sự kiện `error`**. Khi DB ngắt một kết nối đang rảnh (Neon tự tạm dừng, khởi động lại, lỗi mạng), Node.js gặp sự kiện `error` không ai xử lý nên **tiến trình sập**. Đây là nguy cơ "sập" thực tế nhất, và chỉ cần thêm một dòng code.
- Mỗi lần gọi API công khai đều **ghi một dòng** vào bảng `rate_limits`. Các trang lọc/tìm kiếm (`/bat-dong-san?q=...`, `/tin-tuc?q=...`) không có giới hạn tần suất, và mỗi từ khoá mới đều bỏ qua cache để chạy `ILIKE '%...%'`. Kẻ phá có thể dùng chỗ này để dồn tải lên DB (pool chỉ có 5 kết nối).
- Thân request JSON công khai (`/api/v1/leads`, `/api/v1/auth/login`) được đọc hết vào RAM rồi mới kiểm tra kích thước, nếu client gửi kiểu chunked không kèm `Content-Length`. Trên Vercel, nền tảng tự chặn ở 4,5 MB. Trên Docker/VPS thì không có giới hạn nào.

**3. Có dễ bị hack không?** Nền tảng bảo mật **tốt**: mật khẩu argon2id, phiên lưu DB với token băm, cookie `__Host-`/HttpOnly/SameSite, phân quyền ở server cho mọi API admin và mọi Server Action, chống CSRF bằng kiểm tra Origin, sanitize HTML theo whitelist cả khi lưu lẫn khi hiển thị, upload kiểm tra magic bytes, chặn path traversal, CSP và các header bảo mật. `npm audit --omit=dev` báo **0 lỗ hổng**. Không tìm thấy SQL injection, XSS từ form khách hay IDOR. Các điểm yếu còn lại chủ yếu là **chống lạm dụng / DoS** và **cấu hình khi tự host bằng Docker**:
- Khi tự host, IP lấy từ phần tử đầu của `X-Forwarded-For` nên có thể giả mạo. Kẻ tấn công dùng cách này để vượt mọi giới hạn tần suất (đăng nhập, form liên hệ).
- Giới hạn đăng nhập chỉ tính theo cặp IP+email. Đổi email liên tục sẽ không bị chặn, mà mỗi lần thử tốn khoảng 19 MB RAM cho argon2. Đây là đường DoS và đường dò mật khẩu phân tán.
- `docker-compose.yml` mở Postgres ra `0.0.0.0:5432` với mật khẩu mặc định có sẵn trong repo. Máy dev hiện tại đang lắng nghe đúng như vậy. Nếu dùng file này trên VPS, DB sẽ lộ ra Internet. Docker còn bỏ qua cả `ufw`.

Tổng thể: **an toàn để đưa lên Vercel + Neon** sau khi sửa 2 mục mức Cao và các mục mức Trung bình dưới đây. Nếu tự host bằng Docker, phải sửa thêm mục IP/proxy và mục docker-compose.

## Kiểm tra đã chạy

| Kiểm tra | Kết quả |
|---|---|
| `npx tsc --noEmit` | Đạt (0 lỗi) |
| `npm test` (Vitest, DB riêng `tuyntantam_test`) | **8 file, 154/154 test đạt** |
| `npm audit --omit=dev` | **0 lỗ hổng** |
| Thống kê DB dev (chỉ đọc) | `sessions`: 1 (0 hết hạn) · `rate_limits`: 6 (cả 6 đã hết hạn, chưa dọn) · `properties`: 16 published (dữ liệu demo do người khác thêm, không đụng tới) · `leads`: 0 · `posts`: 6 · `max_connections` = 100 |
| Dữ liệu test tạo ra | **Không có.** Đợt này không tạo bản ghi nào, DB dev giữ nguyên |
| Load test và thử tấn công bằng curl trên `http://localhost:3000` | **Chưa chạy được.** Lúc rà soát, cổng 3000 không có tiến trình nào lắng nghe (curl trả `000`), và Docker/Postgres có lúc tạm dừng. Theo yêu cầu, không tự khởi động lại server. Script load test đã soạn sẵn (xem mục "Load test") |

## Trạng thái xử lý (23/10/2026)

**Đã sửa:** 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 16, 17.
- Mục 4: biến `TRUST_PROXY` có 2 giá trị, `vercel` (tự nhận) và `proxy` (mặc định, lấy phần tử cuối của XFF).
- Mục 7a: GET công khai dùng bộ đếm trong bộ nhớ; POST vẫn đếm trên Postgres.
- Mục 10: dọn bảng vẫn chạy ngay trong request, nhưng nay đã có index `rate_limits_reset_idx` nên không còn quét toàn bảng.
- Mục 13: kiểm tra mọi trường `url`/`href`/`src` ở mọi độ sâu.

**Chưa sửa, có lý do:**
- 11: CSP nonce buộc mọi trang phải render động, mất lợi thế trang tĩnh.
- 14: gắn IP vào token form làm khách dùng 4G (IP đổi liên tục) bị đánh dấu spam. Khuyên bật Turnstile trên production.
- 18: cân nhắc khi có traffic thật trên Vercel.

**Đã chạy lại trên bản build production** (máy dev, 1 tiến trình Node, 50 kết nối đồng thời, 10 giây mỗi trang):

| Trang | req/s | p50 | p99 | Lỗi |
|---|---|---|---|---|
| `/` | 150 | 324 ms | 461 ms | 0 |
| `/tin-tuc` | 33 | 1,6 s | 3,9 s | 0 |
| `/bat-dong-san` | 23 | 1,9 s | 5,6 s | 0 |
| `/api/v1/properties` | 885 | 53 ms | 121 ms | 0 (8.727 lần trả 429 đúng thiết kế: 120 request/phút/IP) |

- `/tin-tuc` và `/bat-dong-san` chậm hơn vì phần danh sách render theo query mỗi request. Phần chậm là CPU render chứ không phải DB: dữ liệu đã nằm trong cache.
- Trên Vercel các request này được chia cho nhiều instance.
- Không có request nào lỗi, tiến trình không sập.

**Thử tấn công (đã chạy):**
- Path traversal `/uploads/../../.env.local`, `%2e%2e`, `..%5c` → 404.
- API admin không có cookie hoặc với cookie giả → 401.
- POST lead từ `Origin: https://evil.com` → 403.
- SQLi trong `q`/`sort`/`slug` → 200 với danh sách rỗng hoặc 404, không có lỗi 500.
- Body chunked 600 KB → 413.

## Bảng phát hiện

| # | Mức | Vị trí | Bằng chứng | Cách sửa (mức code) |
|---|---|---|---|---|
| 1 | **Cao** | `src/lib/db/index.ts:11-20` | `new Pool({...})` không có `pool.on("error", ...)`. Theo tài liệu `pg`, một client đang rảnh mà bị DB ngắt (Neon tự tạm dừng compute, restart, lỗi mạng) sẽ phát sự kiện `error` trên Pool. Không có listener thì Node ném lỗi và **tiến trình thoát** (Docker/VPS sập; trên Vercel thì function chết) | Trong `createPool()`: `const pool = new Pool({...}); pool.on("error", (err) => console.error("[db] idle client error:", err.message)); return pool;` |
| 2 | **Cao** (nếu dùng compose trên VPS) | `docker-compose.yml` (`ports: "5432:5432"`, `POSTGRES_PASSWORD: tuyn_local_dev`) | Postgres lắng nghe `0.0.0.0:5432` (đã xác nhận bằng `netstat` trên máy dev) với mật khẩu công khai trong repo. Docker tự thêm luật iptables nên bỏ qua `ufw` | Đổi thành `ports: ["127.0.0.1:5432:5432"]` và `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?đặt trong .env}`. Ghi rõ trong README: không dùng compose này cho production, hoặc bỏ hẳn `ports` khi app và DB chạy chung network |
| 3 | Trung bình | `src/lib/db/index.ts:14-20` | Không có `statement_timeout`/`query_timeout`. Một truy vấn chậm (ví dụ ILIKE trên `content_html`) giữ 1 trong 5 kết nối vô thời hạn, các request khác phải xếp hàng rồi lỗi sau `connectionTimeoutMillis` 10 giây | Thêm `statement_timeout: 8_000, query_timeout: 10_000` vào cấu hình Pool. Trên Vercel Fluid thì thêm `import { attachDatabasePool } from "@vercel/functions"; attachDatabasePool(pool);` để đóng client rảnh khi function bị tạm dừng. `DATABASE_URL` phải là URL **pooled** của Neon (host `-pooler`) |
| 4 | Trung bình | `src/lib/security/request.ts:6-10` | `clientIp` lấy **phần tử đầu** của `X-Forwarded-For`. Trên Vercel không sao vì header do Vercel ghi đè. Sau nginx (`proxy_add_x_forwarded_for`) thì phần tử đầu do client tự đặt, nên chỉ cần gửi `X-Forwarded-For: <ngẫu nhiên>` là vượt mọi rate limit (đăng nhập 5/15 phút, lead 5/10 phút, API 120/phút) | Thêm env `TRUST_PROXY` (`vercel` / `nginx` / `none`). `vercel`: dùng `x-real-ip` (Vercel đặt), fallback XFF[0]. `nginx`: dùng `x-real-ip` do nginx đặt (`proxy_set_header X-Real-IP $remote_addr;`) hoặc phần tử **cuối** của XFF. `none`: trả `"unknown"` và ghi cảnh báo. Ghi cấu hình nginx mẫu vào `docs/` |
| 5 | Trung bình | `src/server/admin/users.ts:16-24`, `src/app/api/v1/auth/login/route.ts:9` | Rate limit đăng nhập có khoá `login:<ip>:<email>`, nên (a) đổi email mỗi lần thì không bao giờ bị chặn, và mỗi lần thử chạy argon2id (m = 19 MiB) nên 50 request song song tốn khoảng 1 GB RAM, gây DoS trên VPS nhỏ; (b) dò mật khẩu admin từ nhiều IP chỉ bị giới hạn 5 lần mỗi IP | Thêm 2 lớp giới hạn trước `verifyPassword`: `rateLimit(\`login-ip:${hashIp(ip)}\`, 20, 900)` và `rateLimit(\`login-acct:${email}\`, 30, 3600)` (theo tài khoản, không phụ thuộc IP). Thêm semaphore trong tiến trình giới hạn tối đa khoảng 4 lần argon2 chạy đồng thời (ví dụ biến đếm + hàng đợi trong `password.ts`); vượt mức thì trả 429 |
| 6 | Trung bình | `src/lib/api/respond.ts:84-90` | `readJson` chỉ so `Content-Length` (có thể bỏ trống khi dùng `Transfer-Encoding: chunked`) rồi gọi `await req.text()` đọc **toàn bộ** thân request vào RAM, xong mới kiểm tra độ dài. Các route công khai `/api/v1/leads` và `/api/v1/auth/login` dùng hàm này. Trên Docker có thể đẩy hàng trăm MB vào và làm hết RAM | Đọc theo stream có giới hạn byte: `const reader = req.body?.getReader(); let size = 0; const chunks = []; for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > maxBytes) { await reader.cancel(); throw new ApiError(413, ...); } chunks.push(value); }` rồi `new TextDecoder().decode(Buffer.concat(chunks))`. Áp dụng tương tự cho upload (`src/app/api/v1/admin/uploads/route.ts:6-8`, chỉ EDITOR+) |
| 7 | Trung bình | `src/lib/api/respond.ts:53-55, 96`; `src/lib/security/rate-limit.ts:13-20`; `src/server/properties.ts:58-83, 100-115`; `src/server/posts.ts:53-56` | (a) Mọi GET API công khai đều chạy một câu `INSERT … ON CONFLICT DO UPDATE` lên `rate_limits` **trước** khi đọc cache, nên request đọc nào cũng thành một lần ghi DB và chiếm 1 trong 5 kết nối, kể cả khi dữ liệu đã có sẵn trong cache. (b) Các trang `/bat-dong-san`, `/tin-tuc`, `/tin-tuc/the/*` nhận `q`, `district`, `minPrice`… tuỳ ý. Mỗi tổ hợp mới là một khoá `"use cache"` mới, nên chạy 2 truy vấn (count + select) với `ILIKE '%q%'` trên 4 cột (bài viết còn quét cả `content_html`), không có rate limit nào. Đây là đường dồn tải lên DB | (a) Bỏ rate limit DB cho GET công khai đã cache (dựa vào CDN/WAF của Vercel), hoặc chỉ áp cho `by-slugs`. Nếu vẫn muốn giữ thì dùng bộ đếm in-memory (LRU Map) theo IP cho GET và giữ Postgres cho POST. (b) Bỏ `contentHtml` khỏi tìm kiếm công khai (`posts.ts:55`), hoặc thêm cột `search_text` + index `pg_trgm`: `CREATE EXTENSION pg_trgm; CREATE INDEX properties_trgm ON properties USING gin ((title \|\| ' ' \|\| coalesce(address,'') \|\| ' ' \|\| coalesce(district,'')) gin_trgm_ops);`. Chuẩn hoá `q` (lowercase, cắt 60 ký tự) để giảm số khoá cache. Chạy song song count + select bằng `Promise.all` |
| 8 | Trung bình | `src/lib/validation/post.ts:21-24`; `src/lib/validation/property.ts:33-38`; dùng tại `src/components/blog/post-card.tsx:16-17`, `src/components/property/property-card.tsx:64-65` | `coverImage.src` của bài viết **không kiểm tra gì** (chỉ `max(500)`). `images[].src` của BĐS nhận mọi `https://…` và cả `//host/…`. `next/image` **ném lỗi khi render** nếu host không nằm trong `images.remotePatterns` hoặc đường dẫn không bắt đầu bằng `/`. Chỉ cần một EDITOR nhập sai là trang chủ, `/tin-tuc` và `/bat-dong-san` trả trang lỗi | Dùng chung một schema ảnh: `src.refine(v => (v.startsWith("/") && !v.startsWith("//")) \|\| /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(v))` cho cả post lẫn property. Ở component, bọc thêm hàm `isOptimizable(src)`: nếu false thì render `<Image unoptimized>` hoặc bỏ ảnh |
| 9 | Thấp | `src/lib/db/schema.ts:82-95`; `src/lib/auth/session.ts` | Phiên hết hạn không bao giờ bị xoá, bảng `sessions` cứ phình dần (ít, vì chỉ admin dùng) | Trong `createSession`: `await db.delete(sessions).where(lt(sessions.expiresAt, new Date()))` (rẻ), hoặc cron hằng ngày |
| 10 | Thấp | `src/lib/security/rate-limit.ts:24-26`; `schema.ts:275-279` | Cứ khoảng 1% request thì chạy `DELETE … WHERE reset_at < now() - 1 day` mà không có index trên `reset_at`, nên quét toàn bảng ngay trong luồng request. Khi bị tấn công bằng IP giả (mục 4), bảng có thể lên tới hàng triệu dòng | Thêm `index("rate_limits_reset_idx").on(t.resetAt)` + migration. Chạy việc dọn trong `after(() => …)` để không chặn phản hồi |
| 11 | Thấp | `next.config.ts:20` | `script-src 'unsafe-inline'`, nên nếu có lỗ XSS thì CSP không chặn được script inline (đã ghi nhận trong `SECURITY.md`) | Khi có thời gian: CSP nonce qua `proxy.ts` (Next 16 hỗ trợ `nonce` cho script của framework); đánh đổi là các trang phải render động |
| 12 | Thấp | `src/lib/security/sanitize.ts:49-51` | Thuộc tính `id` của h2–h4 được giữ nguyên giá trị, trái với ghi chú "giới hạn ký tự". Có thể gây DOM clobbering (ví dụ `id="__next"`), dù chỉ EDITOR mới nhập được | Trong `transformTags` cho h2/h3/h4: giữ `id` chỉ khi khớp `/^[a-z0-9-]{1,80}$/` và không bắt đầu bằng `__` |
| 13 | Thấp | `src/lib/validation/settings.ts:63`; dùng tại `src/app/(site)/page.tsx:218`, `src/components/site/author-box.tsx:25` | Cấu hình `home`/`agent`/`donate` chỉ kiểm tra lỏng (`record<string, unknown>`), nên ADMIN có thể đặt `community.url`/`socials[].url` là chuỗi bất kỳ. React 19 đã chặn `javascript:` trong `href`, nhưng vẫn còn `data:`/URL lạ | Viết schema chặt cho `home`/`agent` (tái sử dụng `httpsUrl`/`safeHref`), hoặc lọc qua `safeHref` khi render |
| 14 | Thấp | `src/lib/security/request.ts:75-86` | Token form không gắn với gì, **dùng lại được** trong 24 giờ. Bot chỉ cần lấy một token rồi dùng mãi, vì token chỉ chứng minh đã chờ đủ 3 giây | Chấp nhận được vì đã có rate limit + Turnstile. Muốn chặt hơn: nhúng `hashIp(ip)` vào phần ký HMAC, hoặc bật `TURNSTILE_SECRET_KEY` trên production |
| 15 | Thấp | `src/server/leads.ts:199` | Chống CSV injection đã có cho các ký tự `= + - @ \t \r`. Còn thiếu `\|` và `%` (một số bản Excel/LibreOffice), cũng như dấu `＝` full-width | Đổi regex thành `/^[=+\-@\t\r\|%＝＋－＠]/` |
| 16 | Thấp | `src/lib/db/index.ts:13, 19` | SSL bị tắt chỉ khi host là `localhost`/`127.0.0.1`. Nếu chạy Docker với Postgres cùng network (`@db:5432`), app sẽ ép SSL `rejectUnauthorized: true` và kết nối thất bại | Tôn trọng `sslmode` trong URL: `ssl: /sslmode=disable/.test(url) \|\| isLocal ? false : { rejectUnauthorized: true }` |
| 17 | Thấp | `src/server/admin/posts.ts:112-113, 125-126` | Tạo/sửa bài viết rồi đặt chuyên mục bằng 2–3 câu lệnh tách rời, không có transaction. Nếu lỗi giữa chừng, bài viết có thể mất chuyên mục | Bọc trong `getDb().transaction(async (tx) => { … })` |
| 18 | Thấp | `src/server/properties.ts:101-103` (cùng mẫu ở `posts.ts`, `pages.ts`, `settings.ts`) | Handler mặc định của `"use cache"` lưu **trong bộ nhớ từng instance**. Trên serverless, mỗi instance mới (cold start) lại truy vấn DB, và `revalidateTag` chỉ chắc chắn có hiệu lực trên instance đang xử lý. Bài hẹn giờ (`publishedAt` ở tương lai) có thể hiện muộn tới vài giờ vì `cacheLife("hours")` | Trên Vercel: cân nhắc `"use cache: remote"` cho các hàm đọc dùng chung. Nếu cần hẹn giờ đăng chính xác: dùng `cacheLife("minutes")` cho `listPosts`/`latestPosts`, hoặc gọi `invalidate(TAGS.posts)` qua cron |

### Các mục đã kiểm tra và đạt

- **AuthN/AuthZ**: mọi route `/api/v1/admin/*` đều dùng `route({ role: "EDITOR" })`. DELETE và PUT settings gọi thêm `requireRole("ADMIN")`. Mọi Server Action trong `src/app/admin/actions.ts` đều gọi `requireRole` trước khi làm việc, trừ `loginAction`/`logoutAction` theo thiết kế. Vai trò đọc lại từ DB ở mỗi request (`session.ts:45-56`), nên hạ quyền có hiệu lực ngay. Không có IDOR, vì đây là site một chủ và EDITOR được phép xem mọi lead theo thiết kế.
- **Phiên**: token 32 byte do server sinh nên không có session fixation. DB chỉ lưu SHA-256 của token. Có gia hạn trượt. Đổi mật khẩu thì xoá các phiên khác. Xoá user thì cascade xoá phiên.
- **CSRF**: API ghi dữ liệu kiểm tra `Origin`/`Referer` (`respond.ts:49-52`). Server Actions dùng kiểm tra Origin có sẵn của Next. Cookie đặt `SameSite=Lax`. Không có GET nào gây tác dụng phụ.
- **XSS**: form khách đi qua `stripTags`, và React tự escape khi hiển thị ở trang admin (không có `dangerouslySetInnerHTML` nào trong `/admin`). Rich text được sanitize khi lưu (`admin/posts.ts:30`, `admin/properties.ts:166`) và sanitize lại khi render (`rich-content.tsx:20`, `page.tsx:165`). JSON-LD escape `<` (`json-ld.tsx:8`). Email thông báo escape toàn bộ giá trị (`leads.ts:101,132`).
- **SQL injection**: mọi `sql\`\`` chỉ nội suy tham số hoặc cột Drizzle (`properties.ts:80,159,176,215-218`, `posts.ts:35,59-63,143,166`). `ORDER BY` lấy theo whitelist. LIKE có escape.
- **Mass assignment**: schema Zod `object` mặc định loại bỏ khoá lạ. `source`/`publishedAt` (BĐS) không có trong schema. PATCH dùng `.partial()` và không có giá trị mặc định.
- **Upload**: nhận diện theo magic bytes (JPEG/PNG/WebP/AVIF), từ chối SVG, tối đa 5 MB/ảnh và 20 ảnh, tên file UUID. Route `/uploads` chỉ nhận segment khớp `^[a-zA-Z0-9._-]+$` cộng kiểm tra `resolve().startsWith(root + sep)`, chỉ đuôi ảnh, có `nosniff`.
- **Open redirect**: `loginAction` chỉ nhận `next` khớp `^/admin(/[a-z0-9/-]*)?$`.
- **SSRF**: chỉ có một `fetch` ra ngoài, tới URL Turnstile cố định, timeout 5 giây. `images.remotePatterns` chỉ cho phép Vercel Blob.
- **Lỗi và log**: lỗi trả về dạng `{ error: { code, message } }`, không kèm stack (`respond.ts:68-79`). Trang `error.tsx` chỉ hiện digest. Gửi mail trong `after()` có `.catch` (`leads.ts:61`). Server Action lead bọc try/catch.
- **ReDoS**: các regex validate (`vnPhone`, slug, giờ, YouTube) đều tuyến tính. `withHeadingIds` (`html.ts:56`) chỉ chạy trên HTML đã sanitize do EDITOR nhập.
- **Bí mật**: chỉ `.env.example` được commit. Không có bí mật nào mang tiền tố `NEXT_PUBLIC_`. `SESSION_SECRET` ≥ 32 ký tự được kiểm tra trong `env.ts`.

## Đánh giá chịu tải theo trang

| Trang / API | Có truy vấn DB mỗi request? |
|---|---|
| `/`, `/tin-tuc/[slug]`, `/bat-dong-san/[slug]`, `/gioi-thieu`, `/dich-vu/*`, sitemap | Không. Shell được prerender, dữ liệu lấy từ `"use cache"` (giờ/ngày) |
| `/tin-tuc`, `/bat-dong-san` không có tham số | Không (cache theo bộ lọc mặc định) |
| `/tin-tuc?q=…`, `/bat-dong-san?q=…&minPrice=…` | **Có** với mỗi tổ hợp tham số mới: 2 truy vấn (count + select), không có rate limit (mục 7) |
| `GET /api/v1/properties`, `/posts`, `/[slug]` | **Có**: 1 lần ghi `rate_limits` mỗi request. Dữ liệu thì lấy từ cache |
| `GET /api/v1/properties/by-slugs` | **Có**: 1 lần ghi rate limit + 1 truy vấn không cache (≤ 10 dòng) |
| `POST /api/v1/leads`, Server Action lead | Có (rate limit + insert). Mail gửi sau phản hồi |
| Admin | Có (theo thiết kế, không cache) |

Khi DB sập: shell tĩnh và các mục còn trong `"use cache"` vẫn phục vụ được. Phần động sẽ lỗi rồi hiện `error.tsx`, trang "Đã có lỗi xảy ra" kèm digest. Riêng `getSettings` (`settings.ts:14`) nằm trong layout, nên khi cache cấu hình đã hết hạn thì toàn bộ khu công khai báo lỗi. Nếu chưa sửa mục 1, một sự cố DB còn có thể **làm sập hẳn tiến trình** chứ không chỉ trả trang lỗi.

Pool: `max: 5` cho mỗi instance là hợp lý với serverless + Neon pooled (pgbouncer). Với Docker một tiến trình có thể nâng lên 10. Postgres local có `max_connections` = 100.

## Load test

**Chưa đo được** vì lúc rà soát không có server nào lắng nghe trên `localhost:3000`, và theo yêu cầu thì không được tự khởi động lại. Script đã soạn sẵn (50 kết nối đồng thời, 20 giây cho mỗi đường dẫn: `/`, `/tin-tuc`, `/bat-dong-san`, `/api/v1/properties`):

```bash
node C:/Users/nguye/AppData/Local/Temp/claude/E--A-Tuyn-web-web/c2e6e4d3-61f5-4c02-b272-7c6d9f09c52f/scratchpad/loadtest.mjs http://localhost:3000 50 20
```

Kết quả dự kiến khi chạy từ một IP duy nhất: `/api/v1/properties` sẽ trả **429** sau khoảng 120 request mỗi phút. Đó là rate limit hoạt động đúng, không phải lỗi. Muốn đo thông lượng thật thì xem số request trước khi gặp 429, hoặc tạm đặt giới hạn cao trên môi trường test.

## Thử tấn công cần chạy lại khi server bật

```bash
B=http://localhost:3000
# Path traversal → mong đợi 404
MSYS_NO_PATHCONV=1 curl -s -o /dev/null -w "%{http_code}\n" "$B/uploads/..%2f..%2fpackage.json"
MSYS_NO_PATHCONV=1 curl -s -o /dev/null -w "%{http_code}\n" "$B/uploads/2026/10/x.jpg%00.txt"
# Gọi API admin không có cookie → 401
curl -s -o /dev/null -w "%{http_code}\n" $B/api/v1/admin/leads
# POST từ origin khác → 403
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Origin: https://evil.example" -H "Content-Type: application/json" --data '{}' $B/api/v1/leads
# SQLi trong query → 200 với danh sách rỗng, không lỗi 500
curl -s "$B/api/v1/properties?q=%27%20OR%201%3D1--&district=%27%3Bdrop%20table%20x--" | head -c 200
# Giả IP để vượt rate limit (mục 4): trên Docker không có proxy, request thứ 6 vẫn được 201
for i in $(seq 1 7); do curl -s -o /dev/null -w "%{http_code} " -X POST -H "Origin: $B" -H "X-Forwarded-For: 10.0.0.$i" -H "Content-Type: application/json" --data-binary @lead.json $B/api/v1/leads; done
```

Sau khi thử, xoá lead đã tạo: `DELETE FROM leads WHERE ip_hash IS NOT NULL AND created_at > now() - interval '1 hour';`, rồi kiểm tra lại DB.

## npm audit

`npm audit --omit=dev`: **found 0 vulnerabilities** (23/10/2026). Các cảnh báo trong dependency dev (`eslint-config-next`, `drizzle-kit`) không nằm trong bản build production, đã ghi ở `docs/SECURITY.md` §8.
