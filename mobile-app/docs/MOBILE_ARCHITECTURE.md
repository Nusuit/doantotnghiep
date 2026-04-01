# Knowledge Share Mobile Architecture (Auth + Search + Map)

## 1. Current Objective

App mobile cần chạy thật cho 3 trục:

1. Authenticate: manual signup/login + OAuth.
2. Search: đúng intent, nhanh, scale được lên semantic/NLP.
3. Map: mượt, có world mode, hỗ trợ contribution flow theo rule nghiệp vụ.

## 2. What Is Implemented Now

Code đã được nâng từ bản navigate-only sang runtime foundation:

- `Auth`:
  - Login bằng `POST /api/auth/login`.
  - Signup bằng `POST /api/auth/register`.
  - Verify OTP bằng `POST /api/auth/verify-email-otp`.
  - Session restore bằng `GET /api/auth/me`.
  - OAuth mobile flow mới: `GET /api/auth/google?mobile_redirect_uri=...` + `POST /api/auth/mobile/exchange`.
  - Token lưu bằng `flutter_secure_storage`.
- `Search`:
  - Home + Map dùng chung cùng search component.
  - Ranking v1 (hybrid local ranking): lexical + quality + proximity + freshness.
  - Hỗ trợ Open World / Private World.
- `Map`:
  - Theo dõi vị trí realtime khi app foreground (`geolocator` stream).
  - Mode switch Open/Private.
  - Filter rating/recent/nearby.
  - Stay detection rule 1 giờ (foreground) và gợi ý review.
  - Save place vào private world.
  - Điều hướng ra Google Maps.

## 3. Capability Matrix (Làm được/Chưa nên làm ngay)

### 3.1 Làm được ngay (với code hiện tại)

- Auth manual + OTP verify.
- OAuth login bằng browser callback vào deep-link app.
- Search suggestion và ranking cơ bản.
- Map tracking foreground + detect “đứng lâu 1 giờ” (trong lúc app mở).
- Save/Download public data sang private world local cache.

### 3.2 Làm được nhưng cần backend/API bổ sung

- Public review >=100 từ, nếu ngắn thì bắt buộc đặt cọc KNOW-U.
- Premium review gating theo reputation/upvote ratio.
- “Nếu quán chưa tồn tại thì thêm quán” cần endpoint create place + moderation pipeline.
- Download world theo vùng chọn polygon thực thụ (hiện tại đang sample theo danh sách loaded).
- Route-to-place với nhiều provider (Google/Apple/Mapbox Navigation SDK).

### 3.3 Không nên làm vội ở phase 1

- Background location “gần như mọi lúc” full-time (rất tốn pin, khó pass policy).
  - Nên làm phased:
    1. foreground stream (đã có),
    2. background geofence cho điểm đã follow,
    3. batching server-side.

## 4. Architecture Layout

```
lib/
  main.dart
  src/
    app/
      app_services.dart
      knowledge_share_app.dart
      app_shell.dart
    core/
      config/
      network/
      storage/
      theme/
    features/
      auth/
      explore/
      home/
      map/
      profile/
      search/
    shared/widgets/
```

Thiết kế này giữ được:

- feature isolation,
- data-layer tách UI,
- dễ migrate sang Riverpod/Bloc mà không phá màn hình.

## 5. Auth Flow Design

### 5.1 Manual

1. User signup.
2. API trả `requireVerification=true`.
3. User nhập OTP.
4. Verify OTP thành công -> login -> lưu access token.

### 5.2 OAuth Mobile (đã scaffold full flow)

1. App gọi `/api/auth/google?mobile_redirect_uri=knowledgeshare://auth/callback`.
2. User auth với Google trên browser.
3. Backend callback tạo `exchange code` ngắn hạn và redirect về app deep-link.
4. App gọi `/api/auth/mobile/exchange` để lấy app token.

Lợi ích:

- Không phụ thuộc cookie web.
- Không đẩy token thẳng trong URL callback.

## 6. Search Engine Strategy (khuyến nghị scale lớn)

### 6.1 V1 hiện tại (đã chạy)

- Lexical matching trên title/description/excerpt.
- Quality score (rating + review count hoặc engagement feed).
- Proximity score theo distance user-place.
- Freshness score theo ngày tạo.

### 6.2 V2 đề xuất (Postgres/Supabase)

- Hybrid retrieval:
  - Candidate generation: `Postgres FTS + trigram + geo bbox`.
  - Re-rank: weighted blend + personalization features.
- Gợi ý query:
  - prefix trie table + cache Redis.
- NLP phase:
  - Embedding index (`pgvector`) cho semantic recall.
  - Query intent classification (place vs topic vs author).

### 6.3 Ranking Formula khuyến nghị

`score = 0.45*lexical + 0.20*semantic + 0.15*geo + 0.12*quality + 0.08*freshness`

Tách rõ:

- Recall layer (rộng),
- Ranking layer (chính xác),
- UI blend layer (đa dạng hóa kết quả).

## 7. Map UX + Product Rules

## 7.1 Open World

- Đọc review public.
- Cho phép đóng góp.
- Nếu review public <100 từ -> yêu cầu deposit KNOW-U hoặc chuyển private.
- Premium review chỉ mở cho user đủ reputation threshold.

## 7.2 Private World

- User lưu/sync bản đồ cá nhân.
- Có thể import từ public world:
  - full world,
  - selected region.

## 7.3 Stay Detection

- Rule hiện tại: nếu app detect ở gần điểm <=120m trong >=1h (foreground), mở prompt:
  - “Bạn vừa đến đây phải không?”
  - Review now / Save heart.
- Nếu nearby place không tồn tại: mở luồng “add new place” (cần backend create place).

## 8. Performance Budgets

- Search suggest P95 < 180ms.
- Search full P95 < 450ms.
- Map interaction FPS > 50 trên device tầm trung.
- Map viewport fetch P95 < 350ms.
- App cold start < 2.5s (debug), <1.5s (release target).

## 9. Risk and Mitigation

- Background location policy risk:
  - giữ foreground trước, background bật dần theo consent rõ ràng.
- Spam/fake review:
  - reputation gate + deposit + moderation queue.
- Search drift khi scale:
  - giữ offline evaluation set + A/B ranking config.

## 10. Recommended Next Sprint

1. Chốt API search canonical (`/api/search/suggest`, `/api/search`).
2. Chốt schema DB cho place/review/reputation/deposit (file SQL đề xuất kèm theo).
3. Nối publish-review thật (hiện UI đã có validation rule).
4. Tối ưu map annotation theo viewport diff + clustering.
