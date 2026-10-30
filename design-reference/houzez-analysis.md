# Phân tích Houzez demo25 — Kiểm kê tính năng & đối chiếu với Stitch

> Nguồn khảo sát: https://demo25.houzez.co/ (khoảng 40 trang đã tải bằng `curl` và đọc HTML thô) và https://houzez.co/real-estate-website-templates/.
> Ngày khảo sát: 22/10/2026. Bảng chỉ ghi những gì **đã xác nhận trong HTML**. Khi chưa thấy, bảng ghi "Không thấy" kèm lý do.
> Ghi chú quan trọng: demo25 là template **"Single Agent"** (môi giới cá nhân Belén Mendoza, South Florida). Mô hình này rất gần với site môi giới cá nhân của bạn.
> Ảnh Stitch đã đối chiếu: `stitch/home.png`, `stitch/properties.png`, `stitch/about.png`, `stitch/blog.png`.

---

## A) Sơ đồ site demo25

### Menu chính (header desktop, `header-v4`)
| Mục menu | URL | Ghi chú |
|---|---|---|
| Home → Homepage 1 / 2 / 3 | `/`, `/homepage-2/`, `/homepage-3/` | 3 biến thể hero |
| Search | `/property-search/` | Trang kết quả dạng **half-map** (bản đồ trái, danh sách phải) |
| Listings (dropdown lớn) | `/listing-v1/` … `/listing-v6/`, `/listing-vN-full-width/`, `/listing-vN-full-width-2-cols/`, `/listing-vN-full-width-4-cols/`, `/listing-vN-list-view/`, `/with-content-top/`, `/with-content-bottom/`, `/with-featured-on-top/`, `/with-tabs/`, `/with-parallax/` | khoảng 30 biến thể trang danh sách |
| Property → v1…v7 | `/property/luxury-family-home-2/` (v1), `/property/comfortable-family-home/` (v2), `/property/gorgeous-studio-bay-front/` (v3), `/property/luxury-family-home-4/` (v4), `/property/modern-apartment-2/` (v5), `/property/relaxing-studio-ocean-view/` (v6), `…/?s_top=v7` (v7) | 7 kiểu đầu trang chi tiết |
| About me | `/about-me/` | |
| Blog | `/blog/` (phân trang `/blog/page/2/`) | |
| Contact | `/contact/` | |
| SĐT bên phải header | `tel:(800) 987 6543` | |

### Các mẫu URL (taxonomy / CPT)
| Loại | Mẫu URL | Ví dụ đã mở |
|---|---|---|
| Chi tiết BĐS | `/property/{slug}/` | 7 trang ở trên, cùng `gorgeous-villa` |
| Trạng thái | `/status/{for-sale\|for-rent}/` | `/status/for-sale/` (23 BĐS) |
| Loại BĐS | `/property-type/{slug}/` | `/property-type/villa/` (7) |
| Thành phố | `/city/{slug}/` | `/city/miami/` (15) |
| Nhãn | `/label/{open-house\|hot-offer}/` | `/label/open-house/` |
| Tiện ích | `/feature/{slug}/` (wifi, gym, swimming-pool…) | (có link trong trang chi tiết) |
| Agent | `/agent/` (archive), `/agent/{slug}/` | `/agent/`, `/agent/samuel-palmer/` |
| Agency | `/agency/` | Có trang nhưng trả "No records found", không có link trong menu |
| Blog | `/{post-slug}/`, `/category/{slug}/`, `/tag/{slug}/`, `/author/{slug}/` | `/skills-that-you-can-learn-in-the-real-estate-market/`, `/category/real-estate/` |
| Định giá nhà | `/how-much-is-my-home-worth/` | Link từ nút hero của Homepage 2 |
| So sánh | `/compare/?ids=a,b,c` | `/compare/?ids=379,376,115` hiển thị bảng so sánh |
| Yêu thích | `/favorite-properties/` | Trang dashboard "Favorites" (không link trong menu) |
| Đăng tin | `/create-listing/` | "Login Required: Please login to submit property!" |
| Trang khác | `/about-this-demo/`, Terms, Privacy (footer) | |
| 404 | `/mls-search/`, `/dashboard/`, `/saved-searches/`, `/agents/`, `/agencies/`, `/my-properties/` | Không tồn tại trên demo25 |

---

## B) Cấu trúc từng trang (từ trên xuống)

### B1. Trang chủ — `/` (Homepage 1)
1. **Header trong suốt** (`header-transparent-wrap`) đè lên hero. Header gồm logo, menu ngang có dropdown hover và SĐT. Desktop có sticky (`data-sticky="1"`), mobile thì không (`data-sticky="0"`).
2. **Hero** 2 cột:
   - Cột trái: H1 tên agent, tagline "Real Estate Agent in South Florida" và **form search builder** (Cities, Property Type, Property Status, Bedrooms, nút Search). Dưới form là địa chỉ, SĐT và icon mạng xã hội (Instagram, Facebook, Twitter, YouTube, LinkedIn).
   - Cột phải: ảnh agent.
3. **About me / Meet Belén**: đoạn giới thiệu, 3 **counter** chạy số (Years of experience, Properties sold, Affiliate partners) và **form "Contact me"** bên phải (Type: buy/sell, Name, Phone, Email, Message).
4. **Recently Added in South Florida**: tiêu đề cùng nút "View all listings" và **carousel BĐS** có nút Prev/Next. Card gồm nhãn trạng thái, nhãn (Open House), giá, giá phụ ($/mo hoặc $/sq ft), beds, baths, diện tích, loại.
5. **Newsletter Sign up** (Name, Email, Submit).
6. **Explore Communities in South Florida**: lưới 10 ô thành phố (Miami, Kendal, Ocala, West Palm Beach, Coral Gables, Fort Lauderdale, Orlando, Saint Petersburg, Sarasota, Key Biscayne), mỗi ô có nút "Explore".
7. **My Services** ("What I do"): 6 icon-box (Advisory, Leasing, Investments, Property Management, Appraisals, Customer Care), chia lưới 3×2.
8. **Testimonials**: 5 sao "Rated 5 out of 5" và 3 thẻ trích dẫn (tên, vai trò).
9. **My Blog**: 4 bài (ngày, chuyên mục, tiêu đề, trích đoạn, "Continue reading") cùng nút "Read my blog".
10. **Footer** (xem C).
- Homepage 2 khác ở hero: tên, tagline, đoạn mô tả và nút **"Get your home estimation"** dẫn tới trang định giá.
- Homepage 3 khác ở hero: form liên hệ ngắn (Type, Name, Email, nút "Contact me").

### B2. Kết quả tìm kiếm / danh sách
**`/property-search/` (Half map)**
- Header thường, bên dưới là **dải search ngang** (`desktop-header-search`) gồm: Keyword, Cities, Status, nút **Advanced** (icon), Clear, Search.
- Panel Advanced mở ra: Type, Bedrooms, Bathrooms, Min/Max Area, Min/Max Price (2 bộ giá riêng cho bán và thuê), Property ID, MLS#, **thanh trượt Price Range** và **checkbox Other Features** (15 tiện ích).
- Phần thân `half-map-wrap` chia đôi:
  - **Bản đồ Google bên trái** (`half-map-left-wrap`) có các nút Roadmap/Satellite/Hybrid/Terrain, zoom, Prev/Next marker, Fullscreen và marker clusterer.
  - **Danh sách bên phải**: "38 Results Found", **Sort by**, lưới 2 cột, **phân trang AJAX** (`houzez_ajax_pagination`).
- Mobile có nút chuyển map/list (`mobile-map-switch`) và search mở dạng overlay toàn màn hình, trong đó có nút **Save Search**.

**`/listing-v1/` (With Sidebar)**
- Breadcrumb, H1, "38 Properties", Sort by và **công tắc Grid/List** (`switch-btn btn-grid / btn-list`).
- Cột nội dung `col-lg-8` chứa lưới 2 cột. Phân trang dạng số 1·2·3.
- **Sidebar phải `col-lg-4`, sticky** (`houzez_sticky`) có 3 widget: Featured Listings, Property Type, Cities.
- Các biến thể đã kiểm tra:
  - Full width 4 cột: không sidebar, 4/3/2 cột tuỳ breakpoint.
  - List view: card ngang.
  - v4: card có thêm trích đoạn mô tả.
  - With Tabs: tab All / For Sale / For Rent.
  - With Featured on Top: BĐS "Featured" lên đầu.
  - With Parallax: mỗi BĐS là một dải ảnh parallax full-width.
  - With Content Top/Bottom: khối nội dung tự do đặt trên hoặc dưới danh sách.
- Các trang taxonomy (`/status/`, `/city/`, `/property-type/`, `/label/`) dùng chung layout v1, có sidebar và đếm số kết quả.
- **Card BĐS (v1)**:
  - Ảnh có gallery lướt (`hz-item-gallery-js`) và 3 nhãn: Featured, trạng thái, nhãn tuỳ chọn (Open House, Hot Offer).
  - Giá cùng giá phụ, tiêu đề, địa chỉ, Beds/Baths/Sq Ft, loại, nút "Details", tên agent và "11 years ago".
  - Công cụ hover: **Preview** (lightbox), **Favourite**, **Add to Compare**.

### B3. Chi tiết BĐS — `/property/{slug}/`
Thứ tự section, xác nhận trên v1/v4/v5/v6 (v2 và v3 cùng nội dung, khác kiểu banner):
1. **Thanh điều hướng section dính** (`property-navigation-wrap`, hiện khi cuộn): Description · Address · Details · Features · Schedule a Tour · Mortgage Calculator · Floor Plans · Video · 360° Virtual Tour · Walkscore · Contact · Reviews · Similar Listings, kèm nút lên đầu trang.
2. **Breadcrumb** (Home › Loại › Tên) và nhóm nút: **Favourite**, **Share** (dropdown WhatsApp, Pinterest, Facebook, X, LinkedIn, Email), **Print** (ẩn trên mobile).
3. **Tiêu đề + địa chỉ + nhãn trạng thái + giá + giá phụ**.
4. **Banner media**, khác nhau theo phiên bản:
   - v1: tab pill **Gallery / Map / Video / Street View**, đếm số ảnh, form liên hệ agent nổi trên banner.
   - v2: `property-banner-v2`.
   - v3, v4: gallery thumbnails `top-gallery-section`.
   - v5: gallery ảnh rộng không đều `top-gallery-variable-width-section`.
   - v6: lưới ảnh có nút "9 More".
   - v7: `property-banner-grid-wrap`.
   - Mọi bản đều mở **lightbox** riêng (`#property-lightbox`) có thanh công cụ.
5. **Overview**: dải thông số gồm Property ID, Type, Bedrooms, Bathrooms, Garage, Area Size, Year Built (có icon).
6. **Description**.
7. **Address**: link "Open on Google Maps", rồi Address, City, State, Zip, Area, Country.
8. **Details**: ghi "Updated on …". Bảng gồm ID, Price, Size, Beds, Baths, Garage, Garage Size, Year, Type, Status và mục **Additional details** (trường tuỳ biến như Deposit, Pool Size…).
9. **Features**: danh sách tiện ích có icon check, mỗi tiện ích link tới `/feature/{slug}/`.
10. **Schedule a Tour**: slider chọn ngày (15 ngày tới), Tour Type (In Person / Video Chat), giờ, Name, Phone, Email, Message và nút "Submit a Tour Request".
11. **Mortgage Calculator** (chi tiết ở C).
12. **Floor Plans**: First/Second Floor gồm Size, phòng, tắm, Price, Description.
13. **Video**: iframe YouTube.
14. **360° Virtual Tour**: iframe Matterport.
15. **Walkscore**: chỉ có tiêu đề section.
16. **Contact Information**: agent (tên, 2 SĐT, nút WhatsApp, "View Listings") và form **Enquire About This Property** (Name, Phone, Email, "I'm a" buyer/tenant/agent/other, Message điền sẵn "Hello, I am interested in [tên BĐS]").
17. **Reviews**: sort (mặc định, ngày, rating) và form "Leave a Review" (email, title, 1–5 sao, nội dung).
18. **Similar Listings**: 3 card.
- **Layout**: `col-lg-8` nội dung + **sidebar phải `col-lg-4` sticky**. Sidebar có tab **"Schedule a tour" / "Request Info"**, form gồm nút Send Message, **Call** và **WhatsApp**.
- **Mobile**: thanh liên hệ dính đáy (`mobile-property-contact`, chỉ hiện dưới lg) mở modal "Contact me".

### B4. Agent
**Agent đơn — `/agent/samuel-palmer/`**
- Phần đầu:
  - Tên, link "See all reviews", chức danh tại công ty.
  - Thông tin hành nghề: License, Tax Number, Service Areas, Specialties.
  - Nút **Send Email** và **Call**.
- Ba khối thống kê dạng % (biểu đồ):
  - Property Types (60% Apartment…)
  - Property Status
  - Property Cities
- Phần "About {agent}".
- Hai tab **Listings (5) / Reviews (0)**. Tab Listings có Sort và card BĐS. Tab Reviews có form đánh giá.
- **Sidebar**:
  - Contact: Office, Mobile, Fax, Email, Website, mạng xã hội.
  - Widget **Find Agent** (tên, category, city).
  - Widget **Recent Viewed**: các BĐS vừa xem.

**Danh sách agent — `/agent/`**: card gồm tên, chức danh @ công ty, Office/Mobile/Fax/Email, mạng xã hội, "View Listings". Sidebar có Find Agent và Recent Viewed.

### B5. Agency — `/agency/`
- Trang lưu trữ có tồn tại nhưng trả "No records found."
- Sidebar có **Find Agency** (ô tên) và Featured listings.
- Không thấy trang agency chi tiết nào. Agent có ghi tên công ty ("Modern House Real Estate") nhưng không link tới đâu.

### B6. Blog
**Danh sách — `/blog/`**
- Nội dung `col-lg-8`: mỗi bài có tiêu đề, trích đoạn, "by {author}", thời gian tương đối, chuyên mục, số bình luận, "Read More".
- Phân trang dạng số.
- **Sidebar phải sticky**: Categories, Latest Posts.

**Bài viết — `/skills-that-you-can-learn-in-the-real-estate-market/`**
- Breadcrumb, H1, meta (tác giả, thời gian, chuyên mục, bình luận).
- Nội dung có H2/H3 và danh sách.
- **Tags**, rồi **Prev/Next post**.
- **Author box**: tên và mạng xã hội.
- **Related posts**: 3 bài.
- Bình luận "Join The Discussion".
- Sidebar giống trang danh sách.

### B7. Contact — `/contact/`
- Khối 2 cột:
  - Trái: **Google Maps widget**, địa chỉ, SĐT, "Find me on" (mạng xã hội).
  - Phải: "Get in touch", đoạn mô tả và form gồm Type (buy/sell), Name, Email, Phone, Message, **checkbox đồng ý GDPR**, Submit.

### B8. About me — `/about-me/`
1. Ảnh và rating 5 sao kèm **carousel testimonial**.
2. Phần "About me": tiểu sử.
3. **Agent Information**: License, Service Areas, Specialties.
4. **Education**.
5. **My Team**: 5 thành viên, mỗi người có ảnh và chức danh.
6. Newsletter.
7. My Blog.

### B9. Định giá nhà — `/how-much-is-my-home-worth/`
- Trái: **Inquiry form** gồm:
  - Inquiry Type: Purchase, Rent, Sell, Miss, Evaluation, Mortgage
  - Information: agent / owner
  - First name, Last name, Email, Zip, checkbox GDPR
- Kèm địa chỉ và SĐT.
- Phải: tiêu đề, mô tả và **FAQ dạng toggle/accordion**.

---

## C) Bảng kiểm kê tính năng

Ký hiệu cột Stitch: **Có**, **Một phần**, **Chưa**. Màn hình ghi kèm: [Home], [Properties], [About], [Blog].

### C1. Tìm kiếm nâng cao
| Tính năng | Houzez demo25 | Bằng chứng (URL) | Hoạt động thế nào | Stitch đã có chưa |
|---|---|---|---|---|
| Loại BĐS | Có | `/`, `/property-search/` | Select `type[]`: Apartment, Office, Shop, Single Family Home, Studio, Villa | Có: [Home] "Property Type", [Properties] "Asset Class" |
| Trạng thái (bán/thuê) | Có | `/`, `/property-search/` | Select `status[]`: For Rent / For Sale. Danh sách giá Min/Max đổi theo trạng thái | Có: [Home] "Status", [Properties] chip All/Sale/Rent |
| Vị trí / thành phố | Có | `/`, `/property-search/` | Select `location[]` (All Cities…), chọn được nhiều | Có: [Home] "Location", [Properties] Location (text) + City Area |
| Khoảng giá | Có | `/property-search/` | Select Min/Max Price, cùng **thanh trượt Price Range** trong panel Advanced | Chưa (chỉ có slider giá trong Mortgage Estimator) |
| Khoảng diện tích | Có | `/property-search/` | Ô Min Area / Max Area | Chưa |
| Phòng ngủ | Có | `/`, `/property-search/` | Select 1–10 / Any | Có: [Home], [Properties] |
| Phòng tắm | Có | `/property-search/` | Select 1–10 / Any | Chưa |
| Checkbox tiện ích | Có | `/property-search/` | 15 checkbox `feature[]` (Air Conditioning, Gym, Pool, WiFi…) | Chưa |
| Keyword | Có | `/property-search/`, `/listing-v1/` | Ô "Enter Keyword..." | Một phần: [Properties] ô Location có icon tìm |
| Property ID / MLS# | Có | `/property-search/` | Ô text trong Advanced | Chưa |
| Nút "Advanced" | Có | `/listing-v1/` | Nút icon `advanced-search-btn` mở panel trường phụ. Có nút Clear | Một phần: [Properties] nút "Filter" và nút reset |
| Search trên mobile | Có | `/property-search/` | Ô "Search" mở overlay full-screen chứa toàn bộ trường | Chưa (chỉ có thiết kế desktop) |
| Dải search cố định dưới header (trang trong) | Có | `/listing-v1/` | `desktop-header-search` lặp lại trên mọi trang trong | Một phần: [Properties] có thanh filter riêng |

### C2. Chế độ xem kết quả
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Grid | Có | `/listing-v1/`, `/listing-v2-full-width-4-cols/` | 2/3/4 cột tuỳ biến thể | Có: [Properties] lưới 2 cột |
| List | Có | `/listing-v1-list-view/` + công tắc ở `/listing-v1/` | Nút `btn-grid` / `btn-list` | Một phần: [Properties] có icon grid/list, chưa có màn list |
| Map / Half map | Có | `/property-search/` | Google Map trái và list phải, marker cluster, map type, fullscreen, prev/next | Chưa |
| Sắp xếp | Có | mọi trang list | Default Order; Price Low→High; Price High→Low; Featured Listings First; Date Old→New; Date New→Old; Title ASC; Title DESC | Một phần: [Properties] "Sort by: Curated & Featured" (chưa định nghĩa danh sách) |
| Phân trang | Có | `/listing-v1/` (số 1-2-3), `/property-search/` (AJAX) | Số trang, có AJAX ở half-map | Có: [Properties] 1,2,3…12 + Next page |
| Đếm kết quả | Có | "38 Properties", "38 Results Found" | Text phía trên lưới | Có: [Properties] "6 Properties Shown", hero "148 Verified Listings" |
| Tabs trạng thái | Có | `/with-tabs/` | All / For Sale / For Rent | Một phần: chip All/Sale/Rent trong filter [Properties] |
| Featured lên đầu / nhãn Featured | Có | `/with-featured-on-top/` | Nhãn "Featured" và ưu tiên sắp xếp | Một phần: nhãn Exclusive/Turnkey… [Properties] |
| Card: hover gallery, Preview, Favourite, Compare | Có | `/listing-v1/` | 3 nút công cụ trên ảnh; Preview mở lightbox | Một phần: chỉ có tim Favourite [Properties] |
| Card: giá phụ ($/sq ft, $/mo) | Có | `/` | Hiển thị dưới giá chính | Có: [Home], [Properties] |

### C3. Chi tiết BĐS
Stitch **chưa có màn chi tiết BĐS** nên phần lớn cột này là "Chưa".
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Gallery / slider / lightbox | Có | v1…v7 | 7 kiểu banner (tab pill, thumbnails, variable width, grid "+9 More"); modal lightbox | Chưa |
| Video | Có | `/property/relaxing-studio-ocean-view/` | iframe YouTube; tab Video trên banner v1 | Chưa |
| Virtual tour 360 | Có | như trên | iframe Matterport | Chưa |
| Street View | Có | `/property/luxury-family-home-2/` | Tab "Street View" trên banner | Chưa |
| Floor plans | Có | như trên | Mỗi tầng: diện tích, phòng, tắm, giá, mô tả | Chưa |
| Dải thông số Overview | Có | v1, v4, v5 | ID, Type, Beds, Baths, Garage, Area, Year (icon) | Chưa (card có beds/baths/sqft) |
| Description | Có | mọi bản | Văn bản | Chưa |
| Địa chỉ + bản đồ | Có | mọi bản | Bảng địa chỉ, link "Open on Google Maps", tab Map ở banner | Chưa |
| Bảng Details + Additional details | Có | mọi bản | Có ghi "Updated on…", thêm trường tuỳ biến | Chưa |
| Features / amenities | Có | mọi bản | Danh sách check, link tới `/feature/…` | Chưa |
| Energy class | **Không thấy** | chỉ có CSS `.class-energy-indicator`, không có nội dung | — | Chưa |
| Mortgage calculator | Có | v1, v4, v5, v6 | Xem C6 | Một phần: [Properties] sidebar "Mortgage Estimator" |
| Form Schedule a tour | Có | mọi bản (thân trang + tab sidebar) | Chọn ngày (15 ngày), In Person / Video Chat, giờ, thông tin liên hệ | Một phần: [Properties] nút "Schedule tour" trên card, chưa có form |
| Form liên hệ agent / sidebar | Có | mọi bản | Tab Request Info, tin nhắn điền sẵn tên BĐS, nút Call và WhatsApp | Một phần: [Properties] sidebar "Request Property Docket" và agent card |
| Similar listings | Có | mọi bản | 3 card | Chưa |
| Reviews | Có | mọi bản | Sort, form rating 1–5 sao | Chưa |
| Print | Có | header chi tiết | Nút in (ẩn mobile) | Chưa |
| Share | Có | header chi tiết | Dropdown: WhatsApp, Pinterest, Facebook, X, LinkedIn, Email | Chưa |
| Favourite | Có | header chi tiết và card | Nút tim | Một phần: tim trên card [Properties] |
| Breadcrumbs | Có | mọi trang trong | Home › Type › Title | Chưa |
| Sticky sidebar | Có | `col-lg-4 … houzez_sticky` | Sidebar dính khi cuộn | Chưa (không thể hiện trên ảnh tĩnh) |
| Nav section dính | Có | `property-navigation-wrap` | Anchor tới các section | Chưa |
| Thanh liên hệ dính đáy (mobile) | Có | `mobile-property-contact` | Nút mở modal liên hệ | Chưa |
| Walkscore | Một phần | tiêu đề "Walkscore" | Không thấy nội dung điểm | Chưa |

### C4. Agent / Agency
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Trang agent đơn | Có | `/agent/samuel-palmer/` | Hồ sơ, license, khu vực, chuyên môn, thống kê %, tab Listings/Reviews, sidebar Contact, Find Agent, Recent Viewed | Một phần: [About] hồ sơ, stats, dịch vụ; [Properties] agent card có rating 5.0 (84 reviews) |
| Danh sách agent | Có | `/agent/` | Card liên hệ và "View Listings" | Chưa (không cần với site một người) |
| Trang agency / company | Một phần | `/agency/` | Archive rỗng + "Find Agency"; không có trang chi tiết | Chưa |
| Team | Có | `/about-me/` | "My Team" 5 người | Chưa |
| Thông tin hành nghề (license, service areas, specialties, education) | Có | `/about-me/`, `/agent/…` | Icon-list | Một phần: [About] chip "Top 0.5% producer", không có license |

### C5. Favorites / Compare / Saved search
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Favorites | Có | `add-favorite-js` trên card và chi tiết; `/favorite-properties/` | Nút tim; trang dashboard "Favorites" ("You don't have any property listed") | Một phần: tim trên card [Properties], chưa có trang danh sách |
| Compare | Có | `item-tool-compare` trên card; `/compare/?ids=…` | Panel trượt "Compare listings" (Compare/Close). Cấu hình JS: **"Maximum item compare are 4"** | Chưa |
| Các trường bảng compare | Có | `/compare/?ids=379,376,115` | Title, Price, Property Type, Address, City, State/county, Zip, Country, Property Size, Property ID, Bedrooms, Bathrooms, Garage và 15 dòng tiện ích (✓/–) | Chưa |
| Saved search | Một phần | nút **"Save Search"** (`save_search_form`) trên trang kết quả | Gửi `search_args` qua AJAX. Trang `/saved-searches/` trả 404 trên demo | Chưa |

### C6. Mortgage calculator
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Đầu vào | Có | `/property/luxury-family-home-2/` | Total Amount ($), Down Payment (%, mặc định 15), Interest Rate (%), Loan Terms (năm, mặc định 12), Property Tax (%), Home Insurance ($), Monthly HOA Fees ($), PMI (%) | Một phần: [Properties] chỉ có Listing Valuation và Down Payment (slider) |
| Đầu ra | Có | như trên | **Biểu đồ donut** (canvas) với số tiền mỗi tháng ở giữa, bảng Down Payment, Loan Amount, Monthly Mortgage Payment, Property Tax, Home Insurance, PMI, Monthly HOA Fees. Có chuỗi Weekly / Bi-Weekly | Một phần: [Properties] "Estimated Monthly $3,420/mo" và vòng donut |

### C7. Blog
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Layout danh sách | Có | `/blog/` | Danh sách 1 cột (8/12) và sidebar phải sticky; phân trang số | Có: [Blog] featured cover story, lưới 2 cột, sidebar, "Showing 1–6 of 24" và phân trang |
| Widget sidebar | Có | `/blog/` | Categories, Latest Posts | Một phần: [Blog] Newsletter, Featured property, biểu đồ giá/m², Trending tags, CTA gọi điện (không có Categories/Latest posts dạng list) |
| Chuyên mục / tag | Có | `/category/…`, `/tag/…` | Trang lưu trữ | Có: [Blog] chip lọc chuyên mục, tag cloud |
| Bài viết: meta, breadcrumb | Có | bài mẫu | Tác giả, thời gian, chuyên mục, số bình luận | Chưa (không có màn single post) |
| Author box | Có | bài mẫu | Tên và mạng xã hội | Một phần: avatar và tên tác giả trên card [Blog] |
| Related posts | Có | bài mẫu | 3 bài | Chưa |
| Share bài viết | **Không thấy** | mạng xã hội chỉ ở footer | — | Chưa |
| Prev/Next, Tags, bình luận | Có | bài mẫu | — | Chưa |
| Thời gian đọc | Không thấy | — | — | Có: [Blog], [About] "5 min read" |
| Blog ở trang chủ | Có | `/` | 4 card | Có: [Home], [About] |

### C8. Footer & nút nổi
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Cột footer | Có | mọi trang | 3 cột: **Contact me** (địa chỉ, SĐT, email) · **About** (About This Demo, Terms, Privacy) · **Help** (Search, Blog, Contact). Dải dưới: copyright, footer nav, mạng xã hội | Có: 4 cột (brand và liên hệ, Quick links, Market insights, Connect & Advisory) và dải dưới Privacy/Terms/Sitemap |
| Newsletter | Có | section ở `/`, `/about-me/` (không nằm trong footer) | Name và Email | Có: [Home] strip, footer, [About] banner, [Blog] sidebar |
| Mạng xã hội | Có | footer: Facebook, Twitter, Instagram, LinkedIn, Google Plus, YouTube; hero và contact: IG, FB, Twitter, YouTube, LinkedIn | Icon link | Có: [Home] hero "Find me on", footer |
| Nút nổi WhatsApp/Call | **Không thấy** nút nổi toàn site | WhatsApp và Call chỉ ở form agent và thanh mobile của trang chi tiết | — | Chưa (Stitch có nút nổi "BUY NOW / TEMPLATES" chép từ demo, **cần bỏ**) |
| Back-to-top | Có | `#scroll-top .btn-back-to-top` | Hiện khi cuộn | Chưa |

### C9. Header
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Top bar | **Không thấy** | — | — | Chưa |
| Logo | Có | `logo-splash`, `logo-mobile` | Logo riêng cho mobile | Có: wordmark "Belén Mendoza / Luxury Estates" |
| Menu | Có | `main-nav … on-hover-menu` | Dropdown hover, mega list | Có: 5 mục phẳng |
| SĐT trên header | Có | `btn-phone-number` | `tel:` link | Có: "Direct hotline" |
| Login / Register | Một phần | modal `#login-register-form` có trong DOM; mobile có offcanvas "Account" | Login (user/email, password, remember, lost password); Register (username, email, **role**: Agent/Agency/Owner/Buyer/Seller, T&C); Forgot password. Header desktop không có nút hiển thị | Chưa (không cần) |
| Nút "Create listing" | **Không thấy** trên header; `/create-listing/` yêu cầu đăng nhập | — | — | Chưa. Stitch dùng CTA "Book consultation" thay vào, hợp lý hơn |
| Sticky | Có | `header-v4 data-sticky="1"` (desktop); mobile `data-sticky="0"` | Header dính khi cuộn | Chưa rõ (ảnh tĩnh) |
| Header trong suốt trên hero | Có | `/` (`header-transparent-wrap`) | Chỉ ở trang chủ | Chưa (Stitch dùng header nền trắng) |
| Menu mobile | Có | `#hz-offcanvas-mobile-menu` | Offcanvas từ trái | Chưa |

### C10. Khối marketing
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Testimonials | Có | `/` (3 thẻ), `/about-me/` (carousel) | Trích dẫn, tên, vai trò, 5 sao | Có: [Home], [About], [Blog] |
| Partners / logos | **Không thấy** | — | — | Chưa |
| Counter thống kê | Có | `/` | Counter chạy số (Elementor counter) | Có: [Home] 3 counter, [About] 4 thẻ stats, [Properties] agent card |
| CTA banner | Có | Homepage 2 "Get your home estimation" → trang định giá | Nút hero | Có: [Properties] "Direct concierge inquiry", [Blog] "Questions on a deal?", [About] CTA kép |
| Lưới "Explore cities/areas" | Có | `/` (10 ô) | Ảnh, tên và "Explore" → `/city/…` | Có: [Home] 6 ô, [About] 5 ô, [Properties] "Hot Enclaves" có đếm số listing |
| Thẻ loại BĐS | Một phần | widget "Property Type" ở sidebar list (danh sách link), không có thẻ ảnh | — | Chưa |
| Dịch vụ (icon-box) | Có | `/` 6 dịch vụ | Icon, tiêu đề, mô tả | Có: [Home] 6, [About] 6 thẻ có link |
| Form định giá / lead | Có | `/how-much-is-my-home-worth/` | Inquiry form và FAQ | Một phần: [About] "Schedule a Strategy Meeting" (intent, timeline, NDA) |
| FAQ accordion | Có | trang định giá | Toggle | Chưa |
| Carousel BĐS | Có | `/` | Prev/Next | Một phần: [Home] lưới 6 card tĩnh |

### C11. Khác
| Tính năng | Houzez | Bằng chứng | Hoạt động | Stitch |
|---|---|---|---|---|
| Đa tiền tệ | **Không thấy** trên demo25 (chỉ có cấu hình `currency_symbol: $`). Trang templates liệt kê "Multi-Currency Support" là tính năng của theme | houzez.co/real-estate-website-templates/ | — | Chưa |
| Đổi đơn vị diện tích | **Không thấy** | — | — | Chưa |
| Đa ngôn ngữ | **Không thấy** trên demo25. Theme có "Multi-Language Support" và demo RTL (demo30–34) | trang templates | — | Chưa |
| Dark / light | **Không thấy**. Có demo "Dark Style" (demo20) | trang templates | — | Chưa |
| Cookie notice | **Không thấy** | — | — | Chưa |
| Đồng ý GDPR trong form | Có | `/contact/`, trang định giá | Checkbox "I consent…" | Một phần: [About] checkbox NDA, [Blog] "Strict privacy observed" |
| Recently viewed | Có | sidebar `/agent/…` | Widget BĐS vừa xem | Chưa |
| Đăng tin từ frontend / dashboard | Có (yêu cầu login) | `/create-listing/`, `/favorite-properties/` | Dashboard người dùng | Chưa (không cần) |
| IDX/MLS | Có | `/about-this-demo/` (Realtyna) | Đồng bộ MLS | Không áp dụng |

### C12. Theme Houzez (trang Templates) — để tham khảo
- Có **49 demo** import một click (theo FAQ của trang), chia thành các nhóm:
  - **Marketplace**: main, default, demo01–04, 11, 17, 29, cùng Lands (27), IDX (23), Commercial (28), City (13), Lifestyle (36).
  - **Agency & Brokerage**: demo49, 48, 43, 39, 47, 41, 35, 45, 38, 40, 18 (developer), 42, 37, 21; nhóm Luxury: 09, 12, 05, 07 (có form định giá), 14, 15, 16 (IDX), 19, 20 (dark), 26.
  - **Agent & Realtor**: demo44, 06, **25**, 24.
  - **Single Property**: demo08, 22, 10.
  - **Đa ngôn ngữ / RTL**: 34 (ES), 33 (IT), 31 (HE), 32 (FA), 30 (AR).
- Công cụ của theme (theo menu Features): Houzez Studio, Theme Builder, **Header / Footer / Mega Menu / Search / Form / Grid Builder**, Property Detail Page builder, Agents & Agencies Profiles, **Half Map Page**, Listing Meta Composer, Listing Page Templates, Compare Properties, Front-end Dashboard, CRM, Lead Generation Forms, Membership & Payments, Flexible Map System, Advanced Search, Custom Fields Builder, Multi-Language, Multi-Currency, Social Login, GDPR, MLS IDX.
- Các biến thể đã thấy trực tiếp trên demo25:
  - Listing styles v1–v6, full-width 2/3/4 cột, list view, tabs, featured-on-top, parallax, content top/bottom.
  - Property detail v1–v7.
  - Header v4 (trong suốt hoặc thường).
  - Footer v1.

---

## D) 10 mẫu UX Houzez nên làm cho site môi giới cho thuê cá nhân ở Hà Nội

Bối cảnh: một môi giới, có blog và dịch vụ, **chưa có dữ liệu căn hộ**.

1. **Hero có ô tìm nhanh 4 trường kèm thông tin liên hệ ngay trong hero.** Dùng các trường Quận, Loại (studio / 1PN / 2PN / nhà nguyên căn), Ngân sách, Số phòng. Khi chưa có dữ liệu, nút "Tìm" có thể gửi yêu cầu tìm phòng (lead) thay vì truy vấn DB. Tham chiếu: `/`.
2. **Form liên hệ có trường "Bạn muốn…" (thuê / cho thuê / ký gửi)** đặt cạnh phần About ở trang chủ. Lead được phân loại ngay từ form. Tham chiếu: `/`, Homepage 3.
3. **Lưới "Khu vực" có ảnh** (Tây Hồ, Ba Đình, Cầu Giấy, Hoàn Kiếm…). Mỗi ô dẫn tới trang khu vực có bài blog và form. Đây là nội dung SEO tốt khi chưa có listing. Tham chiếu: `/city/miami/`.
4. **Counter và testimonials 5 sao**: số năm kinh nghiệm, số hợp đồng, số khách. Đây là bằng chứng uy tín rẻ nhất. Tham chiếu: `/`, `/about-me/`.
5. **Trang About có "Thông tin hành nghề"**: khu vực phục vụ, chuyên môn, ngôn ngữ (EN/VI cho khách expat), học vấn/chứng chỉ. Tham chiếu: `/about-me/`.
6. **Trang "Gửi yêu cầu / Định giá cho thuê" có FAQ accordion**, dành cho chủ nhà muốn ký gửi. Form gồm loại yêu cầu, thông tin, khu vực và checkbox đồng ý lưu dữ liệu (theo Nghị định 13). Tham chiếu: `/how-much-is-my-home-worth/`.
7. **Khi có listing: card chuẩn Houzez.** Gồm nhãn trạng thái/nhãn đặc biệt ("Mới", "Cho phép thú cưng"), giá kèm giá phụ ("triệu/tháng", "đã gồm phí dịch vụ"), số PN, WC, m², và nút tim yêu thích lưu bằng localStorage. Tham chiếu: `/listing-v1/`.
8. **Trang chi tiết căn hộ**:
   - Thanh điều hướng section dính, gallery có lightbox, dải thông số Overview, tiện ích dạng checklist, bản đồ.
   - **Form "Đặt lịch xem nhà"** có slider chọn ngày, kiểu xem "Trực tiếp / Video call", chọn giờ.
   - Tin nhắn điền sẵn "Tôi quan tâm [tên căn]".
   - Tham chiếu: `/property/…`.
9. **Liên hệ một chạm trên mobile**: thanh dính đáy trang chi tiết gồm Gọi, Zalo (thay WhatsApp) và Nhắn tin. Sidebar desktop sticky có tab "Đặt lịch xem / Hỏi thông tin". Tham chiếu: `mobile-property-contact`, sidebar `houzez_sticky`.
10. **Bộ khung trang danh sách**:
    - Đếm kết quả, Sort (giá tăng/giảm, mới nhất), công tắc Grid/List, phân trang số.
    - Sidebar sticky gồm "Căn nổi bật", "Khu vực", "Loại hình".
    - Có thể làm trước bằng dữ liệu blog/khu vực rồi bật listing sau. Bản đồ half-map để dành cho giai đoạn sau.
    - Tham chiếu: `/listing-v1/`, `/property-search/`.

Không nên copy: login/register theo role, compare 4 căn, saved search, agent/agency archive, MLS, multi-currency. Đây là các tính năng cho portal nhiều agent, không cần cho site một người.

### Khoảng trống chính của Stitch so với Houzez
- **Chưa có**: màn **chi tiết BĐS**, màn **bài viết blog**, trang **Contact** riêng (hiện gộp trong About), menu mobile, back-to-top, breadcrumbs, nút liên hệ nổi Zalo/Call.
- **Filter ở [Properties]** còn thiếu khoảng giá, diện tích, số WC và tiện ích.
- Nút nổi **"BUY NOW / TEMPLATES"** trên Stitch [Home] là phần chép từ demo, cần bỏ.
