# Kế hoạch: báo khách đặt lịch / liên hệ về điện thoại (Telegram)

Ngày lập: 01/11/2026. Trạng thái: **đã code** (`src/server/telegram.ts`) — chỉ cần đặt 2 biến môi trường.

## 1. Chọn Telegram hay Zalo?

| | Telegram Bot | Zalo |
|---|---|---|
| Chi phí | Miễn phí | OA miễn phí nhưng muốn chủ động nhắn phải dùng **ZNS — tính phí từng tin**, mẫu tin phải được Zalo duyệt |
| Đăng ký | Chat với `@BotFather` → có token sau 1 phút | Tạo Zalo Official Account (cần xác thực doanh nghiệp/cá nhân), tạo app ở developers.zalo.me, liên kết OA |
| Token | Không hết hạn | Access token hết hạn ~25 giờ → phải lưu và tự làm mới bằng refresh token |
| Giới hạn | Không đáng kể với vài chục tin/ngày | OA chỉ được nhắn người đã quan tâm OA và tương tác trong 7 ngày |
| Code | 1 lệnh `fetch` POST | OAuth + lưu token vào DB + xử lý hết hạn |

**Chọn Telegram** — đơn giản hơn hẳn, miễn phí, gần như không phải bảo trì. Zalo chỉ đáng làm nếu bắt buộc nhận trên Zalo.

## 2. Việc anh/chị cần làm (≈ 5 phút)

1. Cài Telegram, mở chat với **@BotFather** → gõ `/newbot` → đặt tên → nhận **token** (dạng `123456:ABC…`).
2. Mở chat với bot vừa tạo, bấm **Start** (bắt buộc — bot không nhắn được cho người chưa bấm Start).
   Muốn cả nhóm cùng nhận: tạo nhóm Telegram, thêm bot vào nhóm.
3. Lấy **chat ID**: mở `https://api.telegram.org/bot<TOKEN>/getUpdates` trên trình duyệt, tìm `"chat":{"id": …}` (nhóm là số âm).
4. Vercel → Settings → Environment Variables: thêm `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` → Redeploy.

## 3. Việc phía code

| Bước | File | Nội dung |
|---|---|---|
| 1 | `src/lib/env.ts`, `.env.example`, `README.md` | Thêm `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (tuỳ chọn; trống = tắt) |
| 2 | `src/server/telegram.ts` (mới) | `sendTelegram(text)`: POST `https://api.telegram.org/bot<token>/sendMessage` (`parse_mode: "HTML"`, tắt xem trước link), timeout 5 giây, lỗi chỉ ghi log — **không** làm hỏng việc lưu lead |
| 3 | `src/server/leads.ts` → `notifyNewLead()` | Tách phần dựng danh sách dòng dùng chung cho email + Telegram; gửi song song cả hai (`Promise.allSettled`) trong `after()` như hiện tại. Lead nghi spam vẫn **không** gửi |
| 4 | Nội dung tin | `🔔 Đặt lịch xem nhà` · Họ tên · **SĐT bấm gọi được** · BĐS (tên) · Ngày/giờ xem · Hình thức · Lời nhắn · link mở trang quản trị. Mọi chữ của khách được escape HTML |
| 5 | `next.config.ts` | Không cần đổi CSP (gọi từ server, không từ trình duyệt) |
| 6 | `tests/unit/telegram.test.ts` | Dựng nội dung tin (escape, bỏ dòng trống), không gửi khi thiếu biến môi trường, lỗi mạng không ném ra ngoài |
| 7 | `docs/API.md`, `docs/SECURITY.md` | Ghi biến mới; token là bí mật, chỉ để ở biến môi trường |

Ước lượng: ~1–2 giờ code + test. Không đổi DB, không đổi giao diện.

## 4. Mở rộng sau (tuỳ chọn)

- Nút "Đã liên hệ" ngay trong tin Telegram (webhook cập nhật trạng thái lead) — cần thêm route webhook có mã bí mật.
- Nếu sau này vẫn muốn Zalo: dùng ZNS qua đối tác (eSMS, Stringee…) — trả phí theo tin, cần duyệt mẫu.
