# Báo cáo crawl tuyntantam.com

- Thời điểm crawl: 2026-10-22. Nguồn: WordPress REST API `/wp-json/wp/v2` + HTML đã render của từng URL + sitemap Rank Math.
- Nguyên tắc: không bịa nội dung. Trường nào site không có thì để `null` và liệt kê ở mục "Thiếu dữ liệu".
- Đã tải 72 URL HTML (trang, bài viết, chuyên mục, thẻ, tác giả, landing page, floating button, 1 URL 404 thử nghiệm). Tất cả trả về 200, trừ URL 404 cố ý.

## 1. Số lượng

| Loại | API | JSON | Ghi chú |
|---|---|---|---|
| Pages | 17 | 18 | thêm 1 Elementor landing page `cuong-phat-land-tuyen-dung` (id 372, chỉ có trong e-landing-page-sitemap.xml) |
| Posts | 6 | 6 | |
| Categories | 5 | 5 | `dau-tu` có count = 0 |
| Tags | 40 | 40 | 12 thẻ có count = 0 |
| Media (API) | header X-WP-Total = 102, chỉ trả về 88 | — | 14 media không công khai qua API (có thể gắn với bản nháp/private) |
| Ảnh đã tải | — | 53 | 0 lỗi tải; 5 ảnh được resize về rộng 1920px |
| Forms | — | 11 | 4 form Elementor, 2 ô tìm kiếm, 4 Google Form ngoài, 1 khu bình luận |
| Properties (listing) | — | 0 | site không có listing BĐS |
| Comments | 2 | 2 | cả 2 thuộc bài `hay-bat-dau-nghe-moi-gioi-cho-thue-bang-viec-lam-ban-thoi-gian`, lưu trong posts.json |

### Pages

| wpId | slug | trạng thái | ảnh | form | trong menu |
|---|---|---|---|---|---|
| 1546 | `trang-chu-02` | complete | 1 | home-contact | không |
| 1445 | `maintenance-page` | complete | 0 | — | không |
| 1312 | `donate` | complete | 4 | donate-message | không |
| 1159 | `nguon-bds-ban` | complete | 0 | — | có |
| 1157 | `nguon-bds-thue` | complete | 0 | — | có |
| 1155 | `kho-nguon` | complete | 0 | — | có |
| 322 | `tu-van-dau-tu` | placeholder | 0 | — | không |
| 321 | `tu-van-setup-noi-that` | placeholder | 0 | — | không |
| 320 | `tu-van-thue-nha` | placeholder | 0 | — | không |
| 319 | `dan-khach-xem-nha` | complete | 1 | — | không |
| 314 | `dich-vu` | complete | 0 | — | có |
| 235 | `trang-chu` | complete | 7 | — | không |
| 78 | `gioi-thieu` | complete | 7 | — | có |
| 38 | `lien-he-hop-tac` | complete | 0 | lien-he-hop-tac-contact | có |
| 36 | `blog` | placeholder | 0 | — | có |
| 34 | `dau-tu` | complete | 1 | — | có |
| 32 | `moi-gioi` | complete | 0 | moi-gioi-dang-ki | có |
| 372 | `cuong-phat-land-tuyen-dung` | complete | 2 | — | không |

- Trang chủ đang chạy: `trang-chu-02` (id 1546, URL `/`). Trang chủ cũ `trang-chu` (id 235, "Trang chủ 01") vẫn publish tại `/trang-chu` → lưu trong `home.json > legacy` vì có nội dung riêng.
- `blog` (id 36) không có nội dung riêng (WordPress hiển thị archive bài viết, phân trang `/blog/page/2`) → status `placeholder`.
- `maintenance-page` là trang thông báo bảo trì, vẫn publish và có trong sitemap.

### Posts

| wpId | slug | ngày đăng | ảnh | phút đọc |
|---|---|---|---|---|
| 1428 | `moi-gioi-cho-thue-bds-dat-100-trieu-thang` | 2025-08-02 | 3 + cover | 19 |
| 1372 | `3-tieu-chi-thue-nha-tai-ha-noi` | 2025-06-11 | 0 + cover | 4 |
| 261 | `nghe-moi-gioi-cho-thue-bat-dong-san` | 2024-03-18 | 5 + cover | 12 |
| 209 | `6-trang-bat-dong-san-uy-tin` | 2024-03-16 | 6 + cover | 7 |
| 61 | `hay-bat-dau-nghe-moi-gioi-cho-thue-bang-viec-lam-ban-thoi-gian` | 2024-03-14 | 2 + cover | 10 |
| 152 | `giai-quyet-su-tu-choi-trong-nghe-moi-gioi-bat-dong-san-cho-thue` | 2024-03-12 | 5 + cover | 11 |

- `readingMinutes` = số từ / 200 (làm tròn lên) theo yêu cầu. Lưu ý: tiếng Việt đếm theo âm tiết nên con số này cao hơn thực tế.

## 2. Thiếu dữ liệu (để null)

- **Zalo cá nhân**: không có. Chỉ có 1 nhóm Zalo `https://zalo.me/g/oxfecm575` ("Tham gia kho nguồn hàng dòng tiền tại Hà Nội") trên trang chủ cũ → ghi trong property-sources.json, `site.contacts.zalo = null`.
- **Địa chỉ**: không có địa chỉ cụ thể. Footer chỉ nhúng Google Maps với truy vấn "Cầu Giấy, Hà Nội" → `contacts.address = null`, lưu `contacts.mapLocation`.
- **Telegram**: link là `https://web.telegram.org/a/` (trang chung), không phải tài khoản cụ thể.
- **Listing BĐS**: không có. `properties.json = []`. "Kho Nguồn" / "Nguồn BĐS Thuê" / "Nguồn BĐS Bán" chỉ trỏ tới Facebook Group và Google Forms (xem property-sources.json).
- **3 trang dịch vụ là placeholder** ("Nội dung đang được cập nhật. Vui lòng trở về trang chủ!"): `tu-van-thue-nha`, `tu-van-dau-tu`, `tu-van-setup-noi-that`. Chỉ `dan-khach-xem-nha` có nội dung (kèm Google Form đặt lịch).
- **Ảnh riêng cho dịch vụ**: không có. `services[].image` là null, trừ `dan-khach-xem-nha` (dùng chung ảnh chân dung `portrait-standing.png`). Vì vậy thư mục `public/images/services/` không có file nào.
- **Alt text**: tất cả media trong thư viện có `alt_text` rỗng. Alt trong HTML phần lớn do Rank Math tự điền bằng tiêu đề trang (vd "Trang chủ 02", "Giới Thiệu") hoặc lấy từ tên file (vd "Hình chữ nhật", "Thiết kế chưa có tên", "z5780311082723_…"). Đã giữ nguyên như trên site và đánh dấu nguồn trong `media-manifest.json > altSource`. Ảnh trong nội dung bài viết lấy từ API thì alt rỗng → `null`.
- **Meta description**: tất cả 17 page không có `<meta name="description">`; dùng og:description do Rank Math tự sinh từ nội dung (có lẫn chữ rác như "Search Tìm kiếm Kết […]" ở trang chủ). 6 bài viết + landing page có meta description thật.
- **og:image**: không có ở trang chủ, dich-vu, moi-gioi, lien-he-hop-tac, kho-nguon, nguon-*, tu-van-*, blog, maintenance → `seo.ogImage = null`.
- **Menu API, Elementor templates, settings**: trả 401 (không công khai). Menu được đọc từ HTML header.
- **Rank Math getHead** (`/wp-json/rankmath/v1/getHead`): 404 → SEO được parse từ `<head>` của HTML.
- **YouTube embed**: không có video YouTube nào nhúng trong trang/bài. Chỉ có link kênh `https://www.youtube.com/@TuynTanTam`.
- **Video mp4** trong bài `6-trang-bat-dong-san-uy-tin`: `https://tuyntantam.com/wp-content/uploads/2024/03/0316.mp4` (~32,8 MB) — KHÔNG tải về (không phải ảnh, dung lượng lớn); giữ URL gốc trong `<video>` và `posts[].videos`.
- **Momo**: chỉ có ảnh QR, không có số/tên ví dạng chữ.
- **Họ tên đầy đủ**: "Trần Văn Tuyn" chỉ xuất hiện ở tên tài khoản ngân hàng trên trang /donate, không được giới thiệu trực tiếp.
- **Người nhận/hành động của các form Elementor**: không thấy trong HTML (xử lý phía server).
- **Link "Xem thêm"** ở khối "Blog của Tuyn" trên trang chủ có `href="#"` (không trỏ đi đâu).
- **2 slide** trên trang chủ cũ ("Tư Vấn Chọn Thuê Bất Động Sản Miễn Phí", "Dịch Vụ & Sản Phẩm Liên Quan Đến Bất Động Sản") có nút "Tìm Hiểu Ngay" nhưng không có link → `href: null`.

## 3. Nội dung bất thường / cần lưu ý

- Counter trên trang chủ: HTML tĩnh hiển thị "0 +" (JS mới chạy số). Giá trị thật lấy từ `data-to-value`: **5+ Năm kinh nghiệm, 200+ BĐS đã cho thuê, 20+ Các đối tác** (ghi trong home.json, kèm `rawHtmlText: "0 +"`).
- Số năm kinh nghiệm không thống nhất: trang chủ "hơn 5 năm"; Giới Thiệu "đã có 4 năm" (viết năm 2024); Dẫn Khách Xem Nhà "hơn 4 năm"; bài tháng 8/2025 "hơn 5 năm".
- Giới Thiệu: "kể từ ngày 23/02/2021 … đến ngày 23/08/2024 Tuyn đã có 4 năm 6 tháng" — khoảng thời gian thực tế là 3 năm 6 tháng.
- Bài 100 triệu: "111.000.000 VNĐ ( Một trăm mười một Việt Nam đồng )" — thiếu chữ "triệu". Tiêu đề nói 100 triệu, nội dung ghi 111 triệu.
- Lỗi chính tả giữ nguyên trong dữ liệu: "rủi do" (rủi ro, nhiều chỗ kể cả author bio), "môt tòa", "chung chư mini", "Poscast", "slaes" (heading bài hay-bat-dau…), "giao vặt" (rao vặt), "đọc giả", "tiếp xúc động", "sẵn lòng sẵn dẫn", "Bạn đừng lo?"; thẻ `thue-bat-ddoognj-san-ha-noi` và "thuê căn hô dịch vụ".
- Landing page Cường Phát Land còn heading mẫu chưa sửa: "Thêm tiêu đề của bạn ở đây".
- Title SEO trang chủ cũ: "- Tuyn Tận Tâm Tuyn Tận Tâm"; title trang chủ hiện tại: "Trang chủ 02 - Tuyn Tận Tâm" (lộ tên nội bộ).
- `og:locale` = `en_US` trên mọi trang dù nội dung tiếng Việt. `og:site_name` = "TuynTanTam.Com"; `twitter:creator` = "@AdamTran93" (tên X khác thương hiệu).
- Testimonial: cùng 3 người (Anh Thu, Anh Hải, Anh Công) nhưng chức danh khác nhau — trang chủ hiện tại "Khách thuê nhà", trang chủ cũ "Nhà đầu tư". Rating widget 5/5 không gắn với nguồn đánh giá nào.
- Bài `nghe-moi-gioi-cho-thue-bat-dong-san`: ngày đăng 2024-03-18T20:00 nhưng modified 2024-03-18T16:55 (modified sớm hơn ngày đăng — bài lên lịch).
- Bài `3-tieu-chi-thue-nha-tai-ha-noi`: đăng 2025-06-11, sửa 2026-05-09; nội dung soạn bằng Elementor (không phải Gutenberg).
- Bài `moi-gioi-cho-thue-bds-dat-100-trieu-thang`: toàn bộ thân bài dùng thẻ `<h5>` → đã chuyển thành `<p>`; ký tự U+2028 → `<br/>`.
- Các Google Form "Nguồn cần cho thuê!", "Nguồn cần gửi bán!" và banner trang chủ cũ dùng link `/edit` (link chỉnh sửa) thay vì `/viewform`.
- Banner trang chủ cũ tên file "Anh-bia-trang-Donate.png" nhưng nội dung ảnh là quảng cáo tuyển dụng "50 SALES BẤT ĐỘNG SẢN CHO THUÊ TẠI THỊ TRƯỜNG HÀ NỘI" của Cường Phát Land, link tới Google Form.
- Đối tác trên trang chủ cũ chỉ là logo (FAMOUS LAND, SEAHOUSE, Cường Phát Land); tên đọc từ chữ trên ảnh (`nameFromImage`).
- Email: top bar hiển thị `tuynland@gmail.com` (không có mailto), nút nổi dùng `contact@tuyntantam.com`. Nút "Nhắn tin cho tôi" là WhatsApp `wa.me/+84975373942`, không phải Zalo.
- Trang /donate công khai số tài khoản Vietcombank 0211000480166 – Trần Văn Tuyn, PayPal.me/tuyntantam/3usd, Buy Me a Coffee, QR Momo → lưu ở `site.donate`. Nên xác nhận với chủ site trước khi đưa lên site mới.
- Header logo là ảnh "Hinh-chu-nhat.jpg" gốc 5724×1145 (hiển thị 350×70) → đã resize còn 1920×384. Logo footer (WP site_logo) là bản chữ trắng `Tuyn-Tan-Tam-1-2.png` 350×70.
- Ảnh chân dung: `home-hero-portrait.png` (trang chủ, khoanh tay), `portrait-standing.png` (Giới Thiệu + Dẫn Khách Xem Nhà), `gioi-thieu-portrait-seated.png` — đều 400–500px, nền trong suốt; gravatar tác giả cùng người (300×300).
- Trang chủ hiện tại không có ảnh trong khối "Về tôi"; agent.avatar dùng ảnh hero trang chủ.

## 4. Quy ước chuyển đổi

- Link nội bộ chuyển thành đường dẫn tương đối: trang `/<slug>`; bài viết WP `/blog/<slug>/.html` hoặc `/moi-gioi/<slug>/.html` → `/<slug>` (theo yêu cầu). Chuyên mục giữ `/danh-muc/...`, thẻ `/the/...`, lưu trữ ngày `/YYYY/MM/DD`.
- Bảng ánh xạ URL bài viết cũ → mới (cần redirect 301 trên site mới):

  - `https://tuyntantam.com/moi-gioi/nghe-moi-gioi-cho-thue-bat-dong-san/.html` → `/nghe-moi-gioi-cho-thue-bat-dong-san`
  - `https://tuyntantam.com/blog/moi-gioi-cho-thue-bds-dat-100-trieu-thang/.html` → `/moi-gioi-cho-thue-bds-dat-100-trieu-thang`
  - `https://tuyntantam.com/blog/3-tieu-chi-thue-nha-tai-ha-noi/.html` → `/3-tieu-chi-thue-nha-tai-ha-noi`
  - `https://tuyntantam.com/blog/6-trang-bat-dong-san-uy-tin/.html` → `/6-trang-bat-dong-san-uy-tin`
  - `https://tuyntantam.com/blog/hay-bat-dau-nghe-moi-gioi-cho-thue-bang-viec-lam-ban-thoi-gian/.html` → `/hay-bat-dau-nghe-moi-gioi-cho-thue-bang-viec-lam-ban-thoi-gian`
  - `https://tuyntantam.com/moi-gioi/giai-quyet-su-tu-choi-trong-nghe-moi-gioi-bat-dong-san-cho-thue/.html` → `/giai-quyet-su-tu-choi-trong-nghe-moi-gioi-bat-dong-san-cho-thue`

- HTML đã làm sạch: bỏ wrapper/class/style/script của Elementor; giữ h2–h4, p, ul/ol/li, strong/em/b/i, a(href), blockquote, img(src, alt), figure/figcaption, table, br. Heading được dời cấp sao cho cấp cao nhất trong mỗi tài liệu là h2 (tối đa h4); h5/h6 → p.
- Widget Elementor được chuyển: counter → `<p><strong>5+</strong> nhãn</p>`, icon-box → h3 + p, divider có chữ → h2, button → `<p><a>`, testimonial → blockquote, social-icons/icon-list → ul.
- Form Elementor trong html được thay bằng marker `<p data-form="ID"></p>` (ID trong forms.json). Không có YouTube nên không có marker `data-youtube`.
- Ảnh: dùng bản gốc (bỏ hậu tố -WxH, elementor/thumbs → file gốc, -scaled → file gốc nếu tồn tại), resize > 1920px (JPEG quality 82). `src` = đường dẫn local, `originalSrc` = URL gốc.

## 5. Ảnh resize / ánh xạ đặc biệt

- `/images/site/logo-tuyn-tan-tam.jpg` ← https://tuyntantam.com/wp-content/uploads/2024/07/Hinh-chu-nhat.jpg (5724×1145 → 1920×384)
- `/images/pages/donate-momo-qr.jpg` ← https://tuyntantam.com/wp-content/uploads/2024/08/z5780311082723_67058a0c801f93d0328a629b5d0fe9d3.jpg (2404×2560 → 1920×2045)
- `/images/pages/donate-bank-qr.jpg` ← https://tuyntantam.com/wp-content/uploads/2024/08/z5780351945844_08fded6a05242f85b6891b28c3b494d3.jpg (2560×2515 → 1920×1886)
- `/images/posts/hay-bat-dau-nghe-moi-gioi-cho-thue-bang-viec-lam-ban-thoi-gian-2.jpg` ← https://tuyntantam.com/wp-content/uploads/2024/03/z4859235133528_3676c677d70665643bb6b2eb534e2ca1.jpg (2560×1920 → 1920×1440)
- `/images/pages/home-legacy-hero-photo.jpg` ← https://tuyntantam.com/wp-content/uploads/2024/07/AV_7794.jpg (6720×4480 → 1920×1280)
- thumb `Hinh-chu-nhat-scaled-r0f9goq6nxdzyd8z7046liutycjz66j7z10s19ygqk.jpg` → https://tuyntantam.com/wp-content/uploads/2024/07/Hinh-chu-nhat.jpg
- thumb `Thiet-ke-chua-co-ten-1-qtcmx3t0o6xfuqu0kofchrtss5w1g4bz5e815jpw3g.png` → https://tuyntantam.com/wp-content/uploads/2024/08/Thiet-ke-chua-co-ten-1.png
- thumb `z5780311082723_67058a0c801f93d0328a629b5d0fe9d3-qtby3r137q1cr31ca1213ltkwes6cob8lgjrrgkx4c.jpg` → https://tuyntantam.com/wp-content/uploads/2024/08/z5780311082723_67058a0c801f93d0328a629b5d0fe9d3.jpg
- thumb `z5780351945844_08fded6a05242f85b6891b28c3b494d3-qtbzywlzhlyjzutiz0q8z3u4kik4n8x9v3pp2nqv20.jpg` → https://tuyntantam.com/wp-content/uploads/2024/08/z5780351945844_08fded6a05242f85b6891b28c3b494d3.jpg
- thumb `Ban-sua-qsewphgk2km5qz9i7b93m57gflbauz86u2v7k4tew0.jpg` → https://tuyntantam.com/wp-content/uploads/2024/08/Ban-sua.jpg
- thumb `Chup-cung-Tung-qsewu6ni8r1rssfqrcdy2yifcy5dchvvhcalxxujs0.jpg` → https://tuyntantam.com/wp-content/uploads/2024/08/Chup-cung-Tung.jpg

## 6. Media có trong thư viện nhưng KHÔNG dùng trên trang/bài nào (không tải)

- https://tuyntantam.com/wp-content/uploads/2025/10/cong-dong-moi-gioi.jpg
- https://tuyntantam.com/wp-content/uploads/2025/10/Thiet-ke-chua-co-ten-3.jpg
- https://tuyntantam.com/wp-content/uploads/elementor/screenshots/Elementor-post-screenshot_1592_2025-10-14-13-21-56_388e1950.png
- https://tuyntantam.com/wp-content/uploads/elementor/screenshots/Elementor-post-screenshot_1466_2025-10-07-02-56-25_7e2b2088.png
- https://tuyntantam.com/wp-content/uploads/2025/06/image.jpg
- https://tuyntantam.com/wp-content/uploads/2025/01/LEGIT.png
- https://tuyntantam.com/wp-content/uploads/elementor/screenshots/Elementor-post-screenshot_347_2025-01-23-10-08-34_281c7899.png
- https://tuyntantam.com/wp-content/uploads/elementor/screenshots/Elementor-post-screenshot_1281_2025-01-23-10-05-02_168e5a36.png
- https://tuyntantam.com/wp-content/uploads/2025/01/Instagram.svg
- https://tuyntantam.com/wp-content/uploads/2025/01/Logo.png
- https://tuyntantam.com/wp-content/uploads/2024/07/Hinh-chu-nhat-scaled.jpg
- https://tuyntantam.com/wp-content/uploads/elementor/screenshots/Elementor-post-screenshot_1220_2025-01-22-15-40-58_2750be74.png
- https://tuyntantam.com/wp-content/uploads/2024/08/Dau-tu-bat-dong-san-dong-tien.-Co-hoi-tao-nguon-thu-nhap-thu-dong.jpg
- https://tuyntantam.com/wp-content/uploads/2024/08/Image-Contact.jpg
- https://tuyntantam.com/wp-content/uploads/2024/08/Image-Blockquote.jpg
- https://tuyntantam.com/wp-content/uploads/2024/08/Image_Placeholder_Hero-1.jpeg
- https://tuyntantam.com/wp-content/uploads/2024/08/Image-horizontal.jpg
- https://tuyntantam.com/wp-content/uploads/elementor/screenshots/Elementor-post-screenshot_1041_2024-08-29-15-59-05_c87634f.png
- https://tuyntantam.com/wp-content/uploads/2024/08/Cuong-Phat-Land-1.jpg
- https://tuyntantam.com/wp-content/uploads/2024/08/Dau-tu-bat-dong-san-dong-tien.-Co-hoi-tao-nguon-thu-nhap-thu-dong-2.jpg
- https://tuyntantam.com/wp-content/uploads/2024/08/XP1.png
- https://tuyntantam.com/wp-content/uploads/2024/08/Tuyn-Tan-Tam-1.png
- https://tuyntantam.com/wp-content/uploads/2024/07/AV_7733-1-scaled.jpg
- https://tuyntantam.com/wp-content/uploads/2024/07/AV_7794-scaled.jpg
- https://tuyntantam.com/wp-content/uploads/elementor/screenshots/Elementor-post-screenshot_470_2024-07-30-15-10-26_33c8ec83.png
- https://tuyntantam.com/wp-content/uploads/2024/07/AV_7700-scaled.jpg
- https://tuyntantam.com/wp-content/uploads/2024/07/AV_7733-scaled.jpg
- https://tuyntantam.com/wp-content/uploads/2024/07/z5610533849942_2c9b8c081d051bea8cf77dd841937a8e.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/a-thu-2.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/Thiet-ke-chua-co-ten-1.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/0316.mp4
- https://tuyntantam.com/wp-content/uploads/2024/03/mqh-giua-chu-va-khach.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/Voi-nghe-moi-gioi-bat-dong-san-cho-thue.-Tai-sao-khong-2.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/Dau-tu-bat-dong-san-dong-tien.-Co-hoi-tao-nguon-thu-nhap-thu-dong-1.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/banner.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/z4859150603302_33df5cc083251e0c3c2803e82c73c5c0.jpg
- https://tuyntantam.com/wp-content/uploads/2024/03/Tuyn-Tan-Tam-1-1.png
- https://tuyntantam.com/wp-content/uploads/2024/03/Tuyn-Tan-Tam-1.png
- https://tuyntantam.com/wp-content/uploads/2024/02/logo-web.png

## 7. Điểm chưa rõ

- Trang chủ cũ `/trang-chu` và landing page `/cuong-phat-land-tuyen-dung` vẫn công khai và nằm trong sitemap nhưng không có trong menu — cần chủ site quyết định giữ hay bỏ.
- Mục đích chính xác của Google Form gắn ở banner trang chủ cũ (`1zwv5-…`) không ghi bằng chữ.
- Các ảnh AV_7700, AV_7733, z5610533849942… (ảnh chụp chuyên nghiệp) có trong thư viện nhưng không dùng → chưa tải; có thể hữu ích cho site mới nếu chủ site đồng ý.
- 14 media bị ẩn khỏi API (X-WP-Total 102 so với 88 trả về) — không xác định được nội dung.
- Floating button có post `e-floating-buttons/nut-noi-01` công khai như một URL riêng; trên site mới chỉ cần dữ liệu trong `site.floatingButtons`.

## 8. File đầu ra

- `data/agent.json`
- `data/categories.json`
- `data/forms.json`
- `data/home.json`
- `data/media-manifest.json`
- `data/pages.json`
- `data/posts.json`
- `data/properties.json`
- `data/property-sources.json`
- `data/services.json`
- `data/site.json`
- `data/tags.json`
- `public/images/site/` (logo, logo footer, favicon, nút Buy Me a Coffee, gravatar)
- `public/images/pages/` (ảnh trang, testimonial, đối tác, QR donate)
- `public/images/posts/` (cover + ảnh nội dung 6 bài)
- `public/images/services/` (trống — không có ảnh riêng cho dịch vụ)
