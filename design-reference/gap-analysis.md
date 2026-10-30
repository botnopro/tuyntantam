# Gap analysis — Houzez demo25 × Stitch × dữ liệu tuyntantam.com

Nguồn: `houzez-analysis.md` (≈40 trang demo25 đã xác minh), `design-notes.md` (4 screen Stitch), crawl tuyntantam.com.
**Ràng buộc dữ liệu:** tuyntantam.com có 0 tin BĐS → mọi tính năng phụ thuộc tin đăng được **làm khung đầy đủ nhưng tự ẩn** khi chưa có tin `published`; chúng tự hiện khi admin đăng tin đầu tiên (điều kiện hiển thị kiểm tra ở server).

Ký hiệu quyết định: **Làm** · **Làm (ẩn đến khi có tin)** · **Rút gọn** · **Bỏ**.

## 1. Trang

| Trang | Houzez | Stitch | Quyết định | Ghi chú |
|---|---|---|---|---|
| Trang chủ | Có | Có | **Làm** | Layout Stitch Home; khối listing/khu vực/testimonial chỉ hiện khi có dữ liệu |
| Danh sách BĐS | Có | Có | **Làm** | Có empty-state dẫn tới Kho nguồn + form gửi nhu cầu khi 0 tin |
| Chi tiết BĐS | Có (v1–v7) | Chưa | **Làm (ẩn đến khi có tin)** | Bố cục Houzez v1 rút gọn + token Stitch |
| Giới thiệu (agent) | Có (`/about-me/`) | Có | **Làm** | Nội dung trang Giới Thiệu |
| Danh sách agent / agency | Có / Một phần | Chưa | **Bỏ** | Site một người |
| Tin tức (danh sách) | Có | Có | **Làm** | 6 bài + chuyên mục |
| Bài viết chi tiết | Có | Chưa | **Làm** | Theo Houzez single post + token Stitch |
| Chuyên mục | Có | Một phần (pill) | **Làm** | `/tin-tuc/danh-muc/[slug]` |
| Liên hệ | Có | Chưa (gộp About) | **Làm** | Nội dung "Liên Hệ & Hợp Tác" |
| Dịch vụ + 4 trang con | Có (icon box) | Có (card) | **Làm** | 3 trang con "đang cập nhật" ở nguồn → hiện tóm tắt + nhãn "cần bổ sung" (chỉ trong báo cáo, không hiện cho khách) |
| Môi Giới, Đầu Tư (trang kiến thức dài) | — | — | **Làm** | Template bài viết dài, có mục lục |
| Kho nguồn (thuê/bán) | — | — | **Làm** | Link 2 nhóm Facebook + **form ký gửi native** thay 2 Google Form |
| Ủng hộ (Donate) | — | — | **Làm** | Nội dung trang Donate |
| Định giá nhà (`/how-much-is-my-home-worth/`) | Có | Một phần | **Rút gọn** | Gộp thành form ký gửi trong Kho nguồn |
| Yêu thích / So sánh | Có | Một phần / Chưa | **Làm (ẩn đến khi có tin)** | localStorage, `noindex` |
| Đăng nhập/đăng ký người dùng, dashboard | Có | Chưa | **Bỏ** | Chỉ có `/admin` cho chủ site |

## 2. Tìm kiếm & danh sách

| Tính năng | Houzez | Stitch | Quyết định | Ghi chú |
|---|---|---|---|---|
| Loại hình, trạng thái thuê/bán, khu vực (quận), từ khoá | Có | Có | **Làm (ẩn đến khi có tin)** | Giá trị lọc lấy từ dữ liệu thật trong DB (distinct), không hard-code danh sách quận |
| Khoảng giá, khoảng diện tích | Có | Chưa | **Làm (ẩn đến khi có tin)** | Ô min/max |
| Phòng ngủ, phòng tắm | Có | Một phần | **Làm (ẩn đến khi có tin)** | |
| Tiện ích (checkbox) | Có | Chưa | **Làm (ẩn đến khi có tin)** | Danh sách tiện ích lấy từ bảng `amenities` |
| Property ID / MLS | Có | Chưa | **Bỏ** | Không áp dụng |
| Search trên mobile (sheet) | Có | Chưa | **Làm** | Bottom sheet "Bộ lọc" |
| Grid / List | Có | Một phần | **Làm** | Toggle lưu trên URL `?view=` |
| Bản đồ (half map) | Có | Chưa | **Rút gọn** | Leaflet + OSM, chỉ hiện khi ≥1 tin có toạ độ; không cluster |
| Sắp xếp | Có (8) | Một phần | **Rút gọn** | Mới nhất, Giá tăng, Giá giảm, Diện tích lớn, Nổi bật trước |
| Phân trang số + đếm kết quả | Có | Có | **Làm** | |
| Tabs trạng thái (Tất cả/Thuê/Bán) | Có | Một phần | **Làm** | Chip segmented như Stitch |
| Nhãn "Nổi bật" + ưu tiên | Có | Một phần | **Làm** | Trường `featured` |
| Card: Yêu thích, So sánh | Có | Một phần | **Làm (ẩn đến khi có tin)** | |
| Card: Preview lightbox | Có | Chưa | **Bỏ** | Ít giá trị, thêm JS |
| Saved search | Một phần | Chưa | **Bỏ** | Cần tài khoản người dùng |

## 3. Chi tiết BĐS (ẩn đến khi có tin)

| Tính năng | Houzez | Stitch | Quyết định | Ghi chú |
|---|---|---|---|---|
| Gallery + lightbox | Có | Chưa | **Làm** | Lưới ảnh kiểu v6 + lightbox bàn phím |
| Video YouTube | Có | Chưa | **Làm** | Chỉ khi có video id; `youtube-nocookie`, tải lười |
| Tour 360° | Có | Chưa | **Rút gọn** | Trường URL, chỉ nhúng host trong allowlist (Matterport, Kuula); không có thì ẩn |
| Street View | Có | Chưa | **Bỏ** | Cần Google Maps key |
| Sơ đồ mặt bằng | Có | Chưa | **Bỏ** | Ít dùng với nhà cho thuê; ảnh sơ đồ có thể đưa vào gallery |
| Dải Overview (loại, PN, WC, m², tầng, hướng) | Có | Chưa | **Làm** | |
| Mô tả, bảng chi tiết, tiện ích | Có | Chưa | **Làm** | Rich text đã sanitize |
| Địa chỉ + bản đồ | Có | Chưa | **Rút gọn** | Leaflet khi có toạ độ + link "Mở trên Google Maps" |
| Form đặt lịch xem nhà (ngày, giờ, trực tiếp/video) | Có | Một phần | **Làm** | Lưu lead `type=VIEWING` |
| Form hỏi thông tin (tin nhắn điền sẵn tên BĐS) | Có | Một phần | **Làm** | Sidebar sticky có tab "Đặt lịch xem / Hỏi thông tin" |
| Thanh liên hệ dính đáy (mobile) | Có | Chưa | **Làm** | Gọi · WhatsApp · Nhắn tin |
| BĐS tương tự | Có | Chưa | **Làm** | Cùng loại/quận, tối đa 3 |
| Máy tính vay | Có | Một phần | **Rút gọn** | Chỉ với tin **Bán**; người dùng tự nhập lãi suất (không đặt sẵn số liệu), ra trả góp/tháng + tổng lãi |
| Nav section dính | Có | Chưa | **Rút gọn** | Thanh anchor đơn giản |
| Breadcrumb | Có | Chưa | **Làm** | + JSON-LD BreadcrumbList |
| Chia sẻ | Có | Chưa | **Rút gọn** | Web Share API (mobile) + Facebook + Sao chép link |
| In | Có | Chưa | **Rút gọn** | CSS `@media print` gọn, không nút riêng |
| Đánh giá (reviews) | Có | Chưa | **Bỏ** | Không có dữ liệu, rủi ro spam |
| Walkscore, Energy class | Một phần / Không | Chưa | **Bỏ** | Không áp dụng VN |

## 4. Blog

| Tính năng | Houzez | Stitch | Quyết định | Ghi chú |
|---|---|---|---|---|
| Featured post + lưới 2 cột + sidebar | Có | Có | **Làm** | |
| Pill chuyên mục | Có | Có | **Làm** | Từ categories thật |
| Tag cloud | Có | Có | **Làm** khi bài có tag | |
| Thời gian đọc | Không | Có | **Làm** | Tính từ số từ |
| Breadcrumb, meta, mục lục | Có | Chưa | **Làm** | Mục lục tự sinh từ h2/h3 |
| Author box | Có | Một phần | **Làm** | Từ `agent.json` |
| Bài liên quan, Bài trước/sau | Có | Chưa | **Làm** | |
| Chia sẻ bài | Không thấy | Chưa | **Rút gọn** | Như chi tiết BĐS |
| Bình luận | Có | Chưa | **Bỏ** | Spam, cần kiểm duyệt |
| Widget biểu đồ giá/m², mini property | — | Có | **Bỏ / ẩn** | Không có số liệu thật; mini property chỉ khi có tin |

## 5. Khối marketing, header, footer, khác

| Tính năng | Houzez | Stitch | Quyết định | Ghi chú |
|---|---|---|---|---|
| Header sticky, hotline, CTA | Có | Có | **Làm** | CTA "Liên hệ Tuyn" |
| Menu mobile (drawer) | Có | Chưa | **Làm** | |
| Header trong suốt trên hero | Có | Chưa | **Bỏ** | Theo Stitch (nền trắng) |
| Dịch vụ (icon box) | Có | Có | **Làm** | 4 dịch vụ thật |
| Counter thống kê | Có | Có | **Rút gọn** | Chỉ hiện số có thật trên site gốc (đúng giá trị nguồn); số "0+" bị ẩn |
| Testimonials | Có | Có | **Ẩn** | Chỉ hiện nếu site gốc có (theo crawl) |
| Lưới khu vực | Có | Có | **Làm (ẩn đến khi có tin)** | Sinh từ quận của các tin, ảnh = ảnh tin đầu tiên |
| Newsletter | Có | Có | **Thay thế** | Site gốc không có bản tin → thay bằng CTA thật "Tham gia cộng đồng môi giới" (nhóm Facebook) |
| CTA banner | Có | Có | **Làm** | Dùng nội dung thật (Kho nguồn, Liên hệ & Hợp tác) |
| Form ký gửi / định giá + FAQ | Có | Một phần | **Rút gọn** | Form ký gửi; FAQ chỉ khi site gốc có |
| Partners / logos | Không | Chưa | **Bỏ** | |
| Nút liên hệ nổi (Gọi, WhatsApp, Zalo) | Không (chỉ ở chi tiết) | Chưa | **Làm** | Theo yêu cầu dự án; Zalo ẩn đến khi admin nhập số Zalo |
| Back-to-top | Có | Chưa | **Làm** | |
| Đồng ý xử lý dữ liệu cá nhân trong form | Có (GDPR) | Một phần | **Làm** | Checkbox bắt buộc (NĐ 13/2023) |
| Đa tiền tệ, đổi đơn vị, đa ngôn ngữ, dark mode | Theme có, demo không | Chưa | **Bỏ** | Chỉ tiếng Việt, VND, m² |
| Cookie notice | Không | Chưa | **Bỏ** | Không dùng cookie theo dõi; chỉ cookie phiên admin |
| Recently viewed | Có | Chưa | **Bỏ** | |
| Đăng tin frontend, membership, CRM | Có | Chưa | **Bỏ** | Admin nội bộ thay thế; khách liên hệ có trang quản lý trong `/admin/leads` |
