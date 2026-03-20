# Phân Tích Tổng Quan Hệ Thống: Web & Mobile Khác Biệt Và Tính Năng

Đây là báo cáo phân tích toàn diện chi tiết cấu hình và tính năng của 2 nền tảng **Web Frontend** (Next.js) và **Mobile App** (Flutter) dựa trên source code hiện tại.

---

## 1. Cấu hình & Tech Stack

### Web App (Thư mục `/frontend`)
Bản Web là một ứng dụng vô cùng đồ sộ với độ phức tạp cao, tích hợp hàng loạt công nghệ hiện đại tính tới hết năm 2024.

*   **Core Framework**: Next.js 15.5.3 (Sử dụng App Router) kết hợp React 19.1.0.
*   **Ngôn ngữ**: TypeScript
*   **UI & Styling**:
    *   TailwindCSS v4 cho styling.
    *   Khung Radix UI (`@radix-ui/react-*`): Sử dụng toàn bộ bộ component Radix UI làm nền tảng xây dựng UI (Accordion, Dialog, Tabs, Select...).
    *   Lucide React: Hiển thị icon.
    *   Framer Motion / Tailwind Animate: Sử dụng cho hiệu ứng hoạt ảnh mượt mà.
*   **Bản Đồ (Trọng tâm lớn)**:
    *   Tích hợp đa năng cả hệ sinh thái **Mapbox** (`mapbox-gl`, `react-map-gl`) và **Leaflet** (`leaflet`, `react-leaflet`).
*   **3D Elements**: Có sử dụng Three.js (`three`, `@react-three/fiber`, `@react-three/drei`) để render vật thể 3D trực tiếp trên web.
*   **Trình soạn thảo / Editor**: Sử dụng `Tiptap` (`@tiptap/react`, `@tiptap/starter-kit`) cho phần nhập nội dung.
*   **Xác thực / Bảo mật**:
    *   `jose` (Xử lý JWT Token ở middleware/edge).
    *   `input-otp` (Dành cho việc user nhập mã OTP dễ dàng).
*   **State & Data Fetching**: `react-hook-form` + `zod` để validate form.
*   **Biểu đồ**: Hỗ trợ 2 thư viện là `chart.js` (`react-chartjs-2`) và `recharts` để vẽ Dashboard/Analytics.

### Mobile App (Thư mục `/mobile-app`)
Bản Mobile là một ứng dụng gọn nhẹ hơn nhiều, tập trung vào trải nghiệm cốt lõi của user di động.

*   **Core Framework**: Flutter (Dart >= 3.10.4)
*   **Routing & UI**: Material Design 3 mặc định + Hệ thống Theme/Tokens tuỳ chỉnh tự code. (Không sử dụng state management cồng kềnh như Riverpod hay Bloc, chủ yếu dựa vào StatefulWidget truyền thống + `AnimatedBuilder`).
*   **Bản Đồ**: Sử dụng plugin `mapbox_maps_flutter` thuần tuý và mạnh mẽ chạy bằng engine native.
*   **Networking & API**: 
    *   `dio`: Thư viện call API chuẩn mực, xử lý interceptor/timeout (hiện đang cấu hình cố định 12s timeout).
*   **Local Storage & Auth**:
    *   `flutter_secure_storage`: Lưu access token an toàn.
    *   `shared_preferences`: Lưu các tuỳ chọn lặt vặt.
    *   `flutter_web_auth_2`: (Để xử lý luồng đăng nhập Google OAuth trên di động).
*   **Loacation Services**: `geolocator` phục vụ lấy tọa độ định vị GPS của thiết bị.

---

## 2. Danh Sách Tính Năng Hiện Có (Features & Routing)

### Tính năng trên Web Frontend
Do có tuổi đời hoặc được phát triển đẩy mạnh từ trước, bản Web đang ôm đồm vai trò của cả mạng xã hội, bản đồ, cho đến Admin Dashboard. (Dựa theo directory `src/app`).

1.  **Landing Page (`/landing`) & Home (`/home`)**: 
    *   Trang chủ giới thiệu và News Feed mạng xã hội.
    *   Sử dụng UI phức tạp (Cyberpunk style / Glassmorphism tuỳ theme).
2.  **Xác thực nâng cao (`/auth`, `/verify-email`)**:
    *   Đăng ký / Đăng nhập (Email, Google).
    *   Xác thực OTP bằng email.
3.  **Hệ thống Bản đồ phức tạp (`/map`, `/mapbox-demo`, `/google-maps`...)**:
    *   Web có rất nhiều mode bản đồ thử nghiệm. 
    *   Bao gồm việc render Mapbox, tính năng Filter địa điểm, click xem Review trực tiếp trên bản đồ.
4.  **Mạng xã hội & Chat (`/social`, `/chat`)**:
    *   Chức năng đăng bài (`CreatePost`), kèm nhúng hình ảnh, Rich Text Editor, Check-in địa điểm.
    *   Khung chat thời gian thực.
5.  **Cài đặt & Hồ sơ (`/app/settings`, Hồ sơ cá nhân)**:
    *   Sửa thông tin cá nhân.
    *   **Dashboard / Phân tích**: Tích hợp các biểu đồ `Ví / Wallet Analytics` và báo cáo.
6.  **Quản trị viên (`/admin`)**:
    *   Trang dashboard riêng rẽ để quản lý user, bài viết, dữ liệu tổng quan.

### Tính năng trên Mobile App
Định hướng của Mobile App là trở thành "Cổng kết nối di động" tinh gọn, làm vệ tinh xung quanh những tính năng thiết yếu ngoài đời thực như check-in, xem bài post, đi đường.

1.  **Xác Thực (Auth Feature)**:
    *   Gồm 1 màn hình duy nhất xử lý gọn gàng: Đăng nhập / Đăng ký / Xác thực OTP / Google Login.
    *   *Note*: Chưa có luồng Quên mật khẩu.
2.  **Home / Bảng tin (Home Feature)**:
    *   Nhận và hiển thị Feed bài viết từ Backend.
3.  **Khám Phá (Explore Feature)**:
    *   Tab dành riêng để xem các bài đăng Public, content thú vị hoặc gợi ý từ hệ thống.
4.  **Bản Đồ (Map Feature)**:
    *   Render Mapbox native. Sẽ có tác dụng hiển thị các "Knowledge Point" đã được review ở quanh vị trí hiện tại của user.
5.  **Tìm Kiếm (Search Feature)**:
    *   Module tìm kiếm nhanh, giúp user search bài báo, người dùng, tài liệu.
6.  **Hồ Sơ (Profile Feature)**:
    *   Xem thông tin cá nhân (hiện tại tính năng này còn khá cơ bản so với Web có Analytics Graph).

---

## 3. Tổng Kết Sự Khác Biệt & Phân Tích Kiến Trúc

- **Độ phủ công năng**: Web là "siêu ứng dụng" bao gồm cả việc quản trị hệ thống, xử lý đồ hoạ 3D và viết lách rich-text. Mobile tập trung thuần túy vào tiêu thụ nội dung (consume content), tìm kiếm địa điểm trên bản đồ và đăng bài nhanh.
- **Tính thống nhất UI**: Web dùng `Radix UI + Tailwind` (phong cách rất mở, cho phép tùy biến Glassmorphism, Cyberpunk cực mạnh). Mobile đang tự xây cất Core Theme với Material Design base, cũng hướng tới phong cách Glass nhưng bộ component chưa đa dạng bằng Web.
- **Trạng thái phát triển (Maturity)**: 
    - Web đã phát triển rất nhiều route thử nghiệm (VD: google-maps, map-test).
    - Mobile mới chỉ thành hình các foundation chính của ứng dụng và đang trong quá trình lắp ghép API. (Ví dụ API timeout chưa được tinh chỉnh tốt môi trường LAN).
