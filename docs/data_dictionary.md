# Data Dictionary — KnowU Platform

> **Version:** 1.0  
> **Date:** 2026-03-22  
> **Database:** PostgreSQL 16  
> **Source:** `backend/prisma/schema.prisma`  
> **Total Tables:** 19

---

## Mục lục

| # | Tên bảng | Nhóm | Mô tả ngắn |
|:--|:---------|:-----|:-----------|
| 1 | [users](#1-users) | Auth / User | Tài khoản người dùng |
| 2 | [user_security](#2-user_security) | Auth / User | Bảo mật & xác thực |
| 3 | [user_profiles](#3-user_profiles) | Auth / User | Thông tin hiển thị công khai |
| 4 | [refresh_tokens](#4-refresh_tokens) | Auth / User | JWT Refresh Token |
| 5 | [articles](#5-articles) | Content | Bài viết tri thức |
| 6 | [contexts](#6-contexts) | Content | Địa điểm / Thực thể / Chủ đề |
| 7 | [taxonomies](#7-taxonomies) | Content | Danh mục & thẻ tag |
| 8 | [article_taxonomies](#8-article_taxonomies) | Content | Gán tag cho bài viết |
| 9 | [suggestions](#9-suggestions) | Contribution | Đề xuất sửa bài viết |
| 10 | [comments](#10-comments) | Contribution | Bình luận bài viết |
| 11 | [article_versions](#11-article_versions) | Contribution | Lịch sử phiên bản bài viết |
| 12 | [interactions](#12-interactions) | Signals | Tương tác của người dùng |
| 13 | [collections](#13-collections) | Collections | Bộ sưu tập bài viết |
| 14 | [collection_items](#14-collection_items) | Collections | Mục trong bộ sưu tập |
| 15 | [wallet_transactions](#15-wallet_transactions) | Economy | Lịch sử giao dịch token |
| 16 | [follows](#16-follows) | Social | Quan hệ theo dõi |
| 17 | [badges](#17-badges) | Gamification | Huy hiệu thành tích |
| 18 | [user_badges](#18-user_badges) | Gamification | Huy hiệu đã nhận |
| 19 | [notifications](#19-notifications) | System | Thông báo hệ thống |

---

## Nhóm 1: Auth / User

### 1. `users`

**Mô tả:** Bảng trung tâm lưu thông tin tài khoản người dùng. Mỗi user có thể đăng nhập bằng email, số điện thoại hoặc ví Solana.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `email` | VARCHAR(255) | UNIQUE, NULLABLE | Địa chỉ email đăng nhập |
| `phone_number` | VARCHAR(20) | UNIQUE, NULLABLE | Số điện thoại đăng nhập |
| `wallet_address` | VARCHAR(44) | UNIQUE, NULLABLE | Địa chỉ ví Solana (Base58) |
| `ks_score` | FLOAT | NOT NULL, DEFAULT 0 | Knowledge Score — điểm danh tiếng tri thức tổng hợp |
| `reputation_score` | INT | NOT NULL, DEFAULT 0 | Điểm danh tiếng hiển thị (legacy display) |
| `know_u_balance` | INT | NOT NULL, DEFAULT 0 | Số dư token KNOW-U (off-chain points) |
| `know_g_balance` | FLOAT | NOT NULL, DEFAULT 0 | Số dư token KNOW-G (on-chain governance) |
| `account_status` | ENUM | NOT NULL, DEFAULT 'ACTIVE' | Trạng thái tài khoản: ACTIVE, PENDING_VERIFY, SUSPENDED, BANNED |
| `role` | ENUM | NOT NULL, DEFAULT 'USER' | Vai trò: USER, MODERATOR, ADMIN |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo tài khoản |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Thời điểm cập nhật gần nhất |

**Ghi chú:**
- Ít nhất một trong ba cột `email`, `phone_number`, `wallet_address` phải có giá trị
- `ks_score` được tính tự động qua worker job (KS decay cron)

---

### 2. `user_security`

**Mô tả:** Lưu thông tin bảo mật và xác thực của tài khoản. Quan hệ **1-1** với `users`.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | UNIQUE, FK → users.id | Tham chiếu tới user (1-1) |
| `password_hash` | VARCHAR | NULLABLE | Mật khẩu đã hash bằng Bcrypt |
| `is_email_verified` | BOOLEAN | NOT NULL, DEFAULT false | Trạng thái xác thực email |
| `is_phone_verified` | BOOLEAN | NOT NULL, DEFAULT false | Trạng thái xác thực số điện thoại |
| `last_login_at` | TIMESTAMP | NULLABLE | Thời điểm đăng nhập gần nhất |
| `login_attempts` | INT | NOT NULL, DEFAULT 0 | Số lần thử đăng nhập sai liên tiếp |
| `locked_until` | TIMESTAMP | NULLABLE | Tài khoản bị khóa đến thời điểm này |
| `email_otp` | VARCHAR | NULLABLE | Mã OTP qua email (đã hash) |

**Ghi chú:**
- `password_hash` là NULL khi user đăng ký bằng ví Solana (không cần password)
- `login_attempts` reset về 0 sau khi đăng nhập thành công
- `locked_until` được set khi `login_attempts` vượt ngưỡng (ví dụ: 5 lần)

---

### 3. `user_profiles`

**Mô tả:** Thông tin hồ sơ công khai của người dùng. Quan hệ **1-1** với `users`.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | UNIQUE, FK → users.id | Tham chiếu tới user (1-1) |
| `display_name` | VARCHAR(100) | NOT NULL | Tên hiển thị công khai |
| `avatar_url` | VARCHAR | NULLABLE | URL ảnh đại diện |
| `bio` | VARCHAR | NULLABLE | Giới thiệu bản thân |
| `is_profile_public` | BOOLEAN | NOT NULL, DEFAULT true | true = công khai; false = riêng tư |

---

### 4. `refresh_tokens`

**Mô tả:** Lưu JWT Refresh Token để duy trì phiên đăng nhập. Một user có thể có nhiều token (đa thiết bị).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | NOT NULL, FK → users.id | Tham chiếu tới user |
| `token_hash` | VARCHAR | NOT NULL, UNIQUE | Hash của refresh token |
| `revoked` | BOOLEAN | NOT NULL, DEFAULT false | true = token đã bị thu hồi |
| `expires_at` | TIMESTAMP | NOT NULL | Thời điểm token hết hạn |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo token |

---

## Nhóm 2: Content & Discovery

### 5. `articles`

**Mô tả:** Bảng cốt lõi lưu bài viết tri thức. Mỗi article là một **Knowledge Object** gắn với một Context cụ thể.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE | URL-friendly identifier |
| `title` | VARCHAR(500) | NOT NULL | Tiêu đề bài viết |
| `content` | TEXT | NOT NULL | Nội dung Markdown |
| `type` | ENUM | NOT NULL | POST (tri thức tổng quát) hoặc REVIEW (đánh giá địa điểm) |
| `status` | ENUM | NOT NULL, DEFAULT 'DRAFT' | DRAFT, PUBLISHED, FLAGGED, HIDDEN |
| `tier` | ENUM | NOT NULL, DEFAULT 'TIER_0' | TIER_0 (chờ duyệt) → TIER_1 → TIER_2 → TIER_3 (viral) |
| `ranking_score` | FLOAT | NOT NULL, DEFAULT 0 | Điểm xếp hạng dùng để sắp xếp Feed |
| `kv_score` | ENUM | NOT NULL, DEFAULT 'LOW' | Knowledge Value: LOW, MEDIUM, HIGH |
| `context_id` | INT | NOT NULL, FK → contexts.id | Context gắn với bài viết (1-1) |
| `author_id` | INT | NOT NULL, FK → users.id | Tác giả bài viết |
| `view_count` | INT | NOT NULL, DEFAULT 0 | Số lượt xem (denormalized) |
| `save_count` | INT | NOT NULL, DEFAULT 0 | Số lượt lưu (denormalized) |
| `upvote_count` | INT | NOT NULL, DEFAULT 0 | Số upvote (denormalized) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Thời điểm cập nhật |

**Ghi chú:**
- `view_count`, `save_count`, `upvote_count` là các trường denormalized để tăng tốc query Feed — được đồng bộ từ bảng `interactions`
- Nếu `type = REVIEW` và `context.type = PLACE`, chỉ có **1 Article duy nhất** cho mỗi địa điểm

---

### 6. `contexts`

**Mô tả:** Đại diện cho địa điểm, thực thể, hoặc chủ đề mà bài viết đề cập đến. Là "neo" của Knowledge Object.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `type` | ENUM | NOT NULL | PLACE (địa điểm), ENTITY (thực thể/người/tổ chức), TOPIC (chủ đề) |
| `name` | VARCHAR | NOT NULL | Tên địa điểm / thực thể / chủ đề |
| `latitude` | FLOAT | NULLABLE | Vĩ độ — chỉ dùng khi `type = PLACE` |
| `longitude` | FLOAT | NULLABLE | Kinh độ — chỉ dùng khi `type = PLACE` |
| `category` | VARCHAR | NULLABLE | Phân loại thô (từ Google Maps / OpenStreetMap) |
| `avg_rating` | FLOAT | NOT NULL, DEFAULT 0 | Điểm đánh giá trung bình |
| `source` | VARCHAR | NULLABLE | Nguồn dữ liệu (ví dụ: google_places, openstreetmap) |
| `source_ref` | VARCHAR | NULLABLE | ID tham chiếu tại nguồn (UNIQUE cùng với `source`) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo |

---

### 7. `taxonomies`

**Mô tả:** Hệ thống phân loại dạng cây (tree structure) gồm Category và Tag.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `type` | ENUM | NOT NULL | CATEGORY (danh mục cha) hoặc TAG (thẻ tag lá) |
| `name` | VARCHAR(100) | NOT NULL | Tên hiển thị |
| `slug` | VARCHAR | NOT NULL, UNIQUE | URL-friendly identifier |
| `parent_id` | INT | NULLABLE, FK → taxonomies.id | ID cha (cây phân cấp — self-reference) |

**Ghi chú:**
- `parent_id = NULL` nghĩa là là node gốc (top-level category)
- `type = CATEGORY` thường là node cha; `type = TAG` thường là lá

---

### 8. `article_taxonomies`

**Mô tả:** Bảng junction thể hiện quan hệ nhiều-nhiều giữa Article và Taxonomy.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `article_id` | INT | PRIMARY KEY (composite), FK → articles.id | Tham chiếu tới bài viết |
| `taxonomy_id` | INT | PRIMARY KEY (composite), FK → taxonomies.id | Tham chiếu tới taxonomy |

**Ghi chú:**
- Composite PK: `(article_id, taxonomy_id)` — mỗi cặp là duy nhất

---

## Nhóm 3: Contribution

### 9. `suggestions`

**Mô tả:** Đề xuất sửa đổi nội dung bài viết từ cộng đồng (Wikipedia-style). Người đề xuất phải stake KNOW-U.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `author_id` | INT | NOT NULL, FK → users.id | Người đề xuất |
| `article_id` | INT | NOT NULL, FK → articles.id | Bài viết được đề xuất sửa |
| `content` | TEXT | NOT NULL | Nội dung đề xuất (diff hoặc toàn bộ) |
| `status` | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, ACCEPTED, REJECTED |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo đề xuất |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO UPDATE | Thời điểm cập nhật |

**Ghi chú:**
- Khi tạo suggestion, hệ thống tự động burn KNOW-U từ `author_id`
- Khi `status → ACCEPTED`: KV của article tăng, KS của author tăng, KNOW-U được hoàn trả và thưởng thêm

---

### 10. `comments`

**Mô tả:** Bình luận trên bài viết, hỗ trợ cấu trúc nested (reply).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | NOT NULL, FK → users.id | Người bình luận |
| `article_id` | INT | NOT NULL, FK → articles.id | Bài viết được bình luận |
| `parent_id` | INT | NULLABLE, FK → comments.id | ID comment cha (NULL = comment gốc) |
| `content` | TEXT | NOT NULL | Nội dung bình luận |
| `upvote_count` | INT | NOT NULL, DEFAULT 0 | Số upvote bình luận |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo |

**Ghi chú:**
- `parent_id = NULL` → comment gốc; `parent_id = <id>` → reply của comment đó
- Chỉ hỗ trợ 1 cấp reply trong MVP

---

### 11. `article_versions`

**Mô tả:** Lưu lịch sử phiên bản của bài viết sau mỗi lần suggestion được chấp nhận.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `article_id` | INT | NOT NULL, FK → articles.id | Bài viết gốc |
| `editor_id` | INT | NOT NULL, FK → users.id | Người chỉnh sửa (author của suggestion được accept) |
| `version_number` | INT | NOT NULL | Số thứ tự phiên bản (tăng dần) |
| `content` | TEXT | NOT NULL | Snapshot nội dung tại thời điểm này |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo phiên bản |

---

## Nhóm 4: Signals & Economy

### 12. `interactions`

**Mô tả:** Ghi nhận mọi tương tác của user với bài viết. Là nguồn tín hiệu cho hệ thống ranking và KV.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | NOT NULL, FK → users.id | Người thực hiện tương tác |
| `article_id` | INT | NOT NULL, FK → articles.id | Bài viết được tương tác |
| `type` | ENUM | NOT NULL | VIEW, SAVE, UPVOTE, DOWNVOTE, REPORT |
| `time_spent_ms` | INT | NULLABLE | Thời gian đọc bài (milliseconds) — chỉ dùng với type=VIEW |
| `location_lat` | FLOAT | NULLABLE | Vĩ độ của user khi tương tác |
| `location_long` | FLOAT | NULLABLE | Kinh độ của user khi tương tác |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tương tác |

---

### 13. `collections`

**Mô tả:** Bộ sưu tập bài viết do user tạo. Có thể là bookmark riêng tư hoặc series công khai.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | NOT NULL, FK → users.id | Chủ sở hữu bộ sưu tập |
| `title` | VARCHAR | NOT NULL | Tên bộ sưu tập |
| `is_public` | BOOLEAN | NOT NULL, DEFAULT false | false = Bookmark riêng tư; true = Public Series |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo |

---

### 14. `collection_items`

**Mô tả:** Các mục bên trong một collection. Mỗi item trỏ đến một article và có thể kèm context cụ thể.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `collection_id` | INT | NOT NULL, FK → collections.id | Bộ sưu tập chứa item |
| `article_id` | INT | NOT NULL, FK → articles.id | Bài viết được thêm vào |
| `context_id` | INT | NULLABLE, FK → contexts.id | Context bổ sung (nếu có) |
| `added_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm thêm vào |

---

### 15. `wallet_transactions`

**Mô tả:** Sổ cái ghi nhận toàn bộ lịch sử giao dịch token (KNOW-U và KNOW-G) của mỗi user.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | NOT NULL, FK → users.id | Chủ tài khoản |
| `type` | ENUM | NOT NULL | EARN (nhận), SPEND (tiêu), DEPOSIT (nạp), WITHDRAW (rút) |
| `currency` | ENUM | NOT NULL | POINTS, KNOW_U, KNOW_G |
| `amount` | FLOAT | NOT NULL | Số lượng token trong giao dịch |
| `reason_code` | VARCHAR | NULLABLE | Lý do giao dịch: REVIEW_BONUS, SUGGESTION_STAKE, EVENT_JOIN, v.v. |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm giao dịch |

---

## Nhóm 5: Social

### 16. `follows`

**Mô tả:** Quan hệ theo dõi giữa các user (social graph).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `following_id` | INT | PRIMARY KEY (composite), FK → users.id | User được theo dõi |
| `follower_id` | INT | PRIMARY KEY (composite), FK → users.id | User đang theo dõi |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm bắt đầu theo dõi |

**Ghi chú:**
- Composite PK: `(following_id, follower_id)` — mỗi cặp là duy nhất
- Đọc: "follower_id **follows** following_id"

---

## Nhóm 6: Gamification

### 17. `badges`

**Mô tả:** Định nghĩa các loại huy hiệu thành tích trong hệ thống.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `name` | VARCHAR | NOT NULL, UNIQUE | Tên huy hiệu |
| `description` | VARCHAR | NULLABLE | Mô tả điều kiện nhận huy hiệu |
| `icon_url` | VARCHAR | NULLABLE | URL icon huy hiệu |

---

### 18. `user_badges`

**Mô tả:** Bảng junction lưu huy hiệu user đã nhận.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `badge_id` | INT | PRIMARY KEY (composite), FK → badges.id | Huy hiệu được trao |
| `user_id` | INT | PRIMARY KEY (composite), FK → users.id | User nhận huy hiệu |
| `awarded_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm nhận huy hiệu |

**Ghi chú:**
- Composite PK: `(badge_id, user_id)` — mỗi user chỉ nhận mỗi loại badge 1 lần

---

## Nhóm 7: System

### 19. `notifications`

**Mô tả:** Thông báo hệ thống gửi đến user (suggestion accepted, comment reply, v.v.).

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|:--------|:-------------|:----------|:------|
| `id` | INT | PRIMARY KEY, AUTO INCREMENT | Khóa chính tự tăng |
| `user_id` | INT | NOT NULL, FK → users.id | Người nhận thông báo |
| `type` | VARCHAR | NOT NULL | Loại thông báo: SUGGESTION_ACCEPTED, COMMENT_REPLY, BADGE_EARNED, v.v. |
| `content` | TEXT | NOT NULL | Nội dung thông báo |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT false | false = chưa đọc; true = đã đọc |
| `ref_id` | INT | NULLABLE | ID tham chiếu đến entity liên quan (article, comment, suggestion, ...) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Thời điểm tạo thông báo |

---

## Phụ lục: Enum Values

### AccountStatus
| Giá trị | Mô tả |
|:--------|:------|
| `ACTIVE` | Tài khoản hoạt động bình thường |
| `PENDING_VERIFY` | Chờ xác thực email/phone |
| `SUSPENDED` | Tạm đình chỉ (vi phạm nhẹ) |
| `BANNED` | Bị cấm vĩnh viễn |

### UserRole
| Giá trị | Mô tả |
|:--------|:------|
| `USER` | Người dùng thông thường |
| `MODERATOR` | Kiểm duyệt viên |
| `ADMIN` | Quản trị viên |

### ArticleType
| Giá trị | Mô tả |
|:--------|:------|
| `POST` | Bài viết tri thức tổng quát |
| `REVIEW` | Đánh giá địa điểm (gắn với Context PLACE) |

### ArticleStatus
| Giá trị | Mô tả |
|:--------|:------|
| `DRAFT` | Bản nháp chưa đăng |
| `PUBLISHED` | Đã đăng công khai |
| `FLAGGED` | Bị báo cáo, chờ xét duyệt |
| `HIDDEN` | Đã ẩn bởi moderator/admin |

### ArticleTier
| Giá trị | Điểm KV | Mô tả |
|:--------|:--------|:------|
| `TIER_0` | Chờ | Bài mới, chưa có tín hiệu |
| `TIER_1` | LOW–MEDIUM | Bài có tương tác ban đầu |
| `TIER_2` | MEDIUM–HIGH | Bài chất lượng cao, nhiều tương tác |
| `TIER_3` | HIGH | Bài viral, lan rộng |

### KVScore
| Giá trị | Mô tả |
|:--------|:------|
| `LOW` | Chất lượng tri thức thấp |
| `MEDIUM` | Chất lượng tri thức trung bình |
| `HIGH` | Chất lượng tri thức cao |

### ContextType
| Giá trị | Mô tả |
|:--------|:------|
| `PLACE` | Địa điểm vật lý (nhà hàng, địa danh, ...) |
| `ENTITY` | Thực thể (người, tổ chức, thương hiệu, ...) |
| `TOPIC` | Chủ đề trừu tượng (lập trình, du lịch, ...) |

### TaxonomyType
| Giá trị | Mô tả |
|:--------|:------|
| `CATEGORY` | Danh mục cha (node nội bộ trong cây) |
| `TAG` | Thẻ tag lá (node lá trong cây) |

### InteractionType
| Giá trị | Mô tả |
|:--------|:------|
| `VIEW` | Lượt xem bài viết |
| `SAVE` | Lưu vào collection |
| `UPVOTE` | Upvote bài viết |
| `DOWNVOTE` | Downvote bài viết |
| `REPORT` | Báo cáo vi phạm |

### SuggestionStatus
| Giá trị | Mô tả |
|:--------|:------|
| `PENDING` | Đang chờ xét duyệt |
| `ACCEPTED` | Được chấp nhận, áp dụng vào article |
| `REJECTED` | Bị từ chối |

### WalletTransactionType
| Giá trị | Mô tả |
|:--------|:------|
| `EARN` | Nhận token (phần thưởng đóng góp) |
| `SPEND` | Tiêu token (stake suggestion, tham gia event) |
| `DEPOSIT` | Nạp token từ nguồn bên ngoài |
| `WITHDRAW` | Rút token ra ngoài |

### Currency
| Giá trị | Loại | Mô tả |
|:--------|:-----|:------|
| `POINTS` | Off-chain | Điểm thưởng nội bộ (không quy đổi) |
| `KNOW_U` | Off-chain | Token tiện ích (có thể dùng để stake, đổi voucher) |
| `KNOW_G` | On-chain | Governance token Solana SPL |

---

*Data Dictionary này phản ánh schema MVP. Các bảng sẽ được mở rộng trong các sprint tiếp theo (events, vouchers, conversations).*
