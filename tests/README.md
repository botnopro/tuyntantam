# Kiểm thử (Vitest)

```bash
docker compose up -d db          # Postgres local — cần cho nhóm test "api"
npm test                         # chạy toàn bộ (unit + api)
npx vitest run --project unit    # chỉ unit, không cần DB
npx vitest run --project api     # chỉ API integration
npm run test:watch               # chế độ theo dõi
```

## Cấu trúc

- `tests/unit/` — validate (Zod), sanitize, token form/Origin, ánh xạ URL cũ, định dạng tiền/slug, nhận diện ảnh theo magic bytes.
- `tests/api/` — gọi trực tiếp handler trong `src/app/api/v1/**/route.ts` bằng `new Request(...)`: leads (spam, CSRF, rate limit), danh sách/chi tiết BĐS, quyền admin.
- `tests/setup/next-mocks.ts` — mock `next/cache`, `next/server` (`after` bị bỏ qua → không gửi email), `next/headers` (cookie jar giả trong `tests/helpers/request-context.ts`).
- `tests/setup/global-db.ts` — tạo database test và áp migration `./drizzle` trước nhóm "api".

## Database test

- Dùng database **riêng** `tuyntantam_test` (cùng container `db`): `postgres://tuyn:tuyn_local_dev@localhost:5432/tuyntantam_test`.
  Đổi bằng biến `TEST_DATABASE_URL` (tên DB bắt buộc kết thúc bằng `_test`).
- Database được tạo tự động nếu chưa có. Các bảng bị `TRUNCATE` giữa các test — **không bao giờ** trỏ vào DB dev `tuyntantam`.
- Biến môi trường cho test đặt trong `vitest.config.ts` (`test.env`); không đọc `.env.local`. Turnstile, Resend, Vercel Blob đều tắt.
- Dữ liệu BĐS/người dùng trong test là dữ liệu giả lập chỉ dùng cho kiểm thử, không hiển thị trên site.
