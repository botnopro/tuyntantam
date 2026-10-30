# Báo cáo bảo mật (Giai đoạn 5) — theo skill `security-checklist`

Ngày rà soát: 22/10/2026. Ký hiệu: ✅ đạt · ⚠️ đạt có điều kiện / ghi chú · ⏳ kiểm tra sau deploy.

## 1. Xác thực & phiên
| Mục | Trạng thái | Vị trí |
|---|---|---|
| Mật khẩu argon2id (m=19 MiB, t=2, p=1) | ✅ | `src/lib/auth/password.ts` |
| Token phiên 32 byte ngẫu nhiên, DB chỉ lưu SHA-256 | ✅ | `src/lib/auth/session.ts` |
| Cookie `__Host-tt_session` (prod), `HttpOnly`, `Secure`, `SameSite=Lax`, 7 ngày, gia hạn trượt | ✅ | `session.ts` |
| Đăng xuất xoá phiên; đổi mật khẩu xoá phiên khác; reset mật khẩu bằng CLI xoá mọi phiên | ✅ | `session.ts`, `scripts/create-admin.ts` |
| Lỗi đăng nhập chung, thời gian đồng đều (hash giả) | ✅ | `server/admin/users.ts`, `password.ts` |
| Rate limit đăng nhập 5 lần / 15 phút / IP+email | ✅ | `server/admin/users.ts` |
| Phân quyền ở server: mọi API admin (`route({role})`), mọi Server Action (`requireRole`), trang admin (`requireAdminPage`); xoá & cấu hình chỉ ADMIN | ✅ | `src/lib/api/respond.ts`, `src/app/admin/actions.ts` |
| Proxy chuyển hướng sớm khi thiếu cookie (lớp phụ) | ✅ | `src/proxy.ts` |
| Chống open redirect sau đăng nhập (`next` chỉ nhận `/admin/...`) | ✅ | `loginAction` |

## 2. Đầu vào
| Mục | Trạng thái |
|---|---|
| Mọi query/body/form/params qua Zod (thông báo lỗi tiếng Việt) | ✅ `src/lib/validation/*` |
| Truy vấn qua Drizzle (tham số hoá); `sql\`\`` chỉ dùng placeholder; LIKE escape `%_\` | ✅ |
| Sắp xếp theo whitelist (`SORT_OPTIONS`) | ✅ |
| Rich text sanitize khi lưu **và** khi render (whitelist thẻ, `id` chỉ cho h2–h4, link ngoài `nofollow noopener`) | ✅ `src/lib/security/sanitize.ts` |
| Văn bản form công khai: bỏ toàn bộ thẻ | ✅ `stripTags` |
| URL cấu hình chỉ nhận `https://` hoặc `/...`; YouTube chỉ lưu ID; tour 360° chỉ host trong allowlist | ✅ |
| JSON-LD escape `<` | ✅ `components/site/json-ld.tsx` |

## 3. CSRF
| Mục | Trạng thái |
|---|---|
| Cookie `SameSite=Lax` | ✅ |
| API ghi dữ liệu kiểm tra `Origin`/`Referer` khớp `APP_URL`/`CORS_ORIGINS`/Host | ✅ `route()` → `isSameOrigin` |
| Server Actions: kiểm tra Origin tích hợp của Next.js | ✅ (đặt `serverActions.allowedOrigins` nếu chạy sau proxy đổi Host) |

## 4. Chống lạm dụng
| Mục | Trạng thái |
|---|---|
| `POST /leads`: 5 lần / 10 phút / IP (băm) | ✅ |
| Honeypot `website` + token HMAC có thời gian (≥ 3 s, ≤ 24 h) | ✅ — lead nghi spam **được lưu với trạng thái `SPAM`** (không gửi email) để admin xem lại, tránh mất lead thật khi JS lỗi |
| Cloudflare Turnstile khi có `TURNSTILE_SECRET_KEY` | ✅ |
| API đọc công khai 120 / phút / IP; `limit` ≤ 50 | ✅ |
| IP lấy từ `x-forwarded-for` | ⚠️ Tin cậy trên Vercel (header do proxy đặt). Khi tự host bằng Docker phải đặt sau reverse proxy ghi đè `X-Forwarded-For`, nếu không kẻ tấn công có thể giả IP để né rate limit. |

## 5. Upload
| Mục | Trạng thái |
|---|---|
| Chỉ người đăng nhập (EDITOR+), rate limit 60 / 10 phút | ✅ |
| Kiểm tra magic bytes (JPEG/PNG/WebP/AVIF), từ chối SVG/GIF/HTML | ✅ `sniffImage` |
| ≤ 5 MB/ảnh, ≤ 20 ảnh/lần; tên file UUID | ✅ |
| Phục vụ file local: chặn path traversal, `nosniff`, chỉ đuôi ảnh | ✅ `src/app/uploads/[...path]/route.ts` |

## 6. Headers & CORS (`next.config.ts`)
CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `form-action 'self'`, allowlist ảnh/iframe), HSTS 2 năm (prod), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `poweredByHeader: false`, `/api/*` `no-store`, `/admin/*` `noindex` — ✅.
⚠️ `script-src` còn `'unsafe-inline'` (Next.js cần script inline cho hydrate). Nâng cấp lên CSP nonce là việc có thể làm sau (cần render động toàn site, đánh đổi hiệu năng static).
CORS: mặc định chỉ same-origin; mở thêm qua `CORS_ORIGINS` — ✅.

## 7. Lỗi & log
Handler bọc lỗi → JSON `{ error: { code, message } }` tiếng Việt, không stack; `error.tsx`/`global-error.tsx` chỉ hiện mã digest; log che email (`maskEmail`), không log nội dung lead — ✅.

## 8. Bí mật & phụ thuộc
- `.env.example` đầy đủ, `.gitignore` chặn `.env*`; `src/lib/env.ts` validate lúc dùng — ✅.
- Không biến bí mật nào có tiền tố `NEXT_PUBLIC_` (chỉ site key Turnstile, vốn công khai) — ✅.
- `npm audit --omit=dev`: **0 lỗ hổng** — ✅.
- `npm audit` (gồm dev): 9 cảnh báo (5 high, 4 moderate) nằm trong **công cụ dev** `eslint-config-next` (fast-glob/micromatch/braces ReDoS khi lint) và `drizzle-kit` (esbuild dev server). Không có trong bản build production; chấp nhận, theo dõi bản cập nhật.

## 9. Kiểm thử
Test tự động trong `tests/` (Vitest) — xem `tests/README.md`. Kiểm thử tay đã chạy: lead hợp lệ → 201/NEW; honeypot → SPAM; thiếu Origin → 403; lần gửi thứ 6 → 429; HTML/script trong lời nhắn bị loại; API admin không cookie → 401; `/admin` không cookie → 307 về đăng nhập.

## ⏳ Sau deploy
- `curl -sI https://<domain>/` có đủ header ở mục 6; `http://` → `https://`.
- Đổi mật khẩu admin mặc định; xoá `ADMIN_PASSWORD` khỏi biến môi trường.

## Rà soát lại 30/10/2026

**Đã sửa**
| # | Mức | Vấn đề | Cách sửa |
|---|---|---|---|
| 1 | **Cao** | 9 trang admin (tổng quan, danh sách khách liên hệ có SĐT/email, BĐS, bài viết, nội dung) chỉ dựa vào kiểm tra phiên ở `(panel)/layout.tsx`. Next.js không chạy lại layout khi điều hướng phía client/partial render, nên request RSC kèm cookie giả (qua được `proxy.ts`) có thể render trang mà không qua kiểm tra | Mỗi trang tự gọi `await requireAdminPage()` (có `cache()` nên không tốn thêm truy vấn) |
| 2 | **Cao** | `npm audit --omit=dev`: zod 4.1.11 lồng trong `@vercel/blob → @vercel/oidc → @vercel/cli-config` (GHSA-mrhx-c7xc-m3w5, cạn bộ nhớ) | `overrides` trong `package.json` ép dùng zod của dự án (4.6.7) → 0 lỗ hổng |
| 3 | Trung bình | Ô "mật khẩu hiện tại" khi đổi mật khẩu không có rate limit → phiên bị đánh cắp có thể dò mật khẩu | 5 lần / 15 phút / tài khoản |
| 4 | Trung bình | Đổi mật khẩu giữ nguyên token phiên hiện tại | Xoá mọi phiên của user và cấp phiên mới (`rotateAllSessions`) |
| 5 | Thấp | Gia hạn trượt cho phép một phiên sống vô hạn | Tuổi tối đa tuyệt đối 30 ngày tính từ lúc đăng nhập |
| 6 | Thấp | Đăng nhập lại trên cùng trình duyệt để lại phiên cũ còn hiệu lực | `createSession` xoá phiên cũ của cookie hiện tại |
| 7 | Thấp | Trang `/admin/*` không chặn cache | `Cache-Control: private, no-store`; thêm `X-Permitted-Cross-Domain-Policies: none` cho toàn site |

**Giữ nguyên (đã ghi nhận trước)**: CSP còn `'unsafe-inline'` cho script (nonce buộc render động toàn site); token form dùng lại được trong 24 giờ (khuyên bật Turnstile trên production); IP khi tự host phụ thuộc reverse proxy (`TRUST_PROXY`).
