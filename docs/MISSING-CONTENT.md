# Nội dung còn thiếu / cần chủ site bổ sung

Website chỉ dùng nội dung có thật trên tuyntantam.com. Các mục dưới đây **không có ở site gốc** (hoặc có nhưng chưa hoàn chỉnh), nên đang được ẩn hoặc hiển thị rút gọn. Bổ sung trong `/admin` là website tự cập nhật.

## Ưu tiên cao (ảnh hưởng tính năng chính)

| # | Nội dung | Hiện trạng trên web | Bổ sung ở đâu |
|---|---|---|---|
| 1 | **Tin bất động sản** (tiêu đề, giá, diện tích, số phòng, địa chỉ/quận, ảnh, tiện ích, toạ độ nếu muốn hiện bản đồ) | Site gốc không có tin nào → trang `/bat-dong-san` hiện thông báo "Danh sách đang được cập nhật" kèm link nhóm Kho nguồn và form gửi nhu cầu. Menu "Bất động sản", khối "Bất động sản mới", "Khu vực", bộ lọc, bản đồ, yêu thích, so sánh **tự hiện khi có ≥ 1 tin "Hiển thị"**. | `/admin/bat-dong-san` → "Đăng tin mới" |
| 2 | **Số Zalo** | Không có Zalo cá nhân → nút Zalo nổi đang ẩn (chỉ có Gọi, WhatsApp, Email) | `/admin/cau-hinh` → "Link Zalo" (dạng `https://zalo.me/09…`) |
| 3 | **Nội dung 3 trang dịch vụ**: Tư Vấn Thuê Nhà, Tư Vấn Đầu Tư, Tư Vấn Setup Nội Thất | Site gốc ghi "Nội dung đang được cập nhật" → trang chi tiết chỉ hiện mô tả ngắn (lấy từ trang Dịch Vụ) + form liên hệ | `/admin/noi-dung` → mục Dịch vụ (đang gắn nhãn "Cần bổ sung nội dung") |
| 4 | **Email nhận thông báo khi có khách liên hệ** | Lead vẫn lưu đầy đủ trong `/admin/khach-lien-he`, nhưng chưa gửi email | Biến môi trường `LEAD_NOTIFY_EMAIL`, `RESEND_API_KEY`, `MAIL_FROM` (xem README) |

## Ưu tiên trung bình

| # | Nội dung | Ghi chú |
|---|---|---|
| 5 | Địa chỉ văn phòng cụ thể | Site gốc chỉ ghi khu vực "Cầu Giấy, Hà Nội" → web hiển thị khu vực, không có bản đồ văn phòng. Thêm ở `/admin/cau-hinh` nếu muốn công khai. |
| 6 | Tài khoản Telegram thật | Site gốc trỏ tới `web.telegram.org` chung (không phải tài khoản) → đã bỏ khỏi danh sách mạng xã hội. Thêm ở `/admin/cau-hinh` → Mạng xã hội. |
| 7 | Ảnh chia sẻ mạng xã hội (og:image) cho trang chủ & các trang | Site gốc không có → tạm dùng `public/images/site/og-default.png` (logo + chức danh trong `data/agent.json`, sinh bằng `node scripts/og-image.mjs`). Nên thay bằng ảnh thật 1200×630. |
| 8 | Ảnh riêng cho từng dịch vụ | Không có → thẻ dịch vụ dùng icon. |
| 9 | Mô tả ảnh (alt) | Toàn bộ thư viện ảnh gốc để trống alt; một số alt tự sinh vô nghĩa ("Hình chữ nhật", "z5780311…"). Bài/ảnh mới nên điền alt trong trình upload. |
| 10 | Video trong bài "6 Trang bất động sản uy tín" | File mp4 32,8 MB vẫn trỏ tới `tuyntantam.com/wp-content/...`. **Nếu tắt site WordPress cũ video sẽ mất** → nên đưa lên YouTube và chèn link. |
| 11 | Logo phiên bản nền tối / logo vector | Có logo chữ trắng nhưng footer theo thiết kế dùng nền sáng nên đang dùng logo thường. |

## Nội dung có ở site gốc nhưng cần chủ site xác nhận

| # | Nội dung | Vì sao cần xác nhận |
|---|---|---|
| 12 | Thông tin chuyển khoản trên trang **Ủng hộ** (số tài khoản, tên chủ tài khoản, QR) | Được chuyển nguyên từ trang /donate công khai của site gốc; đây cũng là nơi duy nhất xuất hiện họ tên đầy đủ. Xác nhận vẫn muốn công khai. |
| 13 | Số năm kinh nghiệm | Không thống nhất ở site gốc: trang chủ "hơn 5 năm", Giới thiệu "4 năm" (viết 2024), "4 năm 6 tháng" tính từ 23/02/2021–23/08/2024 (thực tế 3 năm 6 tháng). Web giữ nguyên câu chữ gốc. |
| 14 | Bài "100 triệu/tháng": "111.000.000 VNĐ ( Một trăm mười một Việt Nam đồng )" | Thiếu chữ "triệu" ở site gốc — giữ nguyên, sửa trong `/admin/tin-tuc` nếu muốn. |
| 15 | Lỗi chính tả gốc ("rủi do", "chung chư mini", "Poscast", "slaes", thẻ "thue-bat-ddoognj-san-ha-noi"…) | Giữ nguyên để không tự ý sửa nội dung; chủ site sửa trong admin. |
| 16 | Trang tuyển dụng Cường Phát Land (`/cuong-phat-land-tuyen-dung`) | Còn tiêu đề mẫu "Thêm tiêu đề của bạn ở đây" từ site gốc → đã loại khỏi sitemap; sửa trong `/admin/noi-dung` rồi có thể đưa lại. |
| 17 | Testimonial | Cùng 3 khách nhưng site gốc ghi chức danh khác nhau ở 2 trang chủ ("Khách thuê nhà" / "Nhà đầu tư") → web dùng bản trang chủ hiện tại ("Khách thuê nhà"). |
| 18 | Tên đối tác | Đọc từ chữ in trên logo (FAMOUS LAND, SEAHOUSE, Cường Phát Land) — site gốc không có chữ riêng. |
