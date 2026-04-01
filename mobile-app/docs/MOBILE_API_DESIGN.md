# Knowledge Share Mobile API Design (Supabase/Backend Friendly)

## 1. Envelope Standard

Success:

```json
{
  "success": true,
  "data": {},
  "requestId": "req_123"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERR_VALIDATION",
    "message": "Invalid body",
    "details": []
  },
  "requestId": "req_123"
}
```

## 2. Auth API (Mobile)

## 2.1 Existing endpoints reused

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-email-otp`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## 2.2 OAuth endpoints (mobile flow)

- `GET /api/auth/google?mobile_redirect_uri=<custom_scheme_uri>`
- `POST /api/auth/mobile/exchange`

`/mobile/exchange` request:

```json
{
  "code": "one_time_exchange_code"
}
```

`/mobile/exchange` response:

```json
{
  "success": true,
  "data": {
    "token": "access_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": 1,
      "email": "user@mail.com",
      "name": "Kien",
      "role": "USER",
      "accountStatus": "ACTIVE",
      "isEmailVerified": true
    }
  }
}
```

## 3. Search API (Recommended)

Hiện app đã có ranking local fallback, nhưng để đạt “search chuẩn” cần endpoint dedicated.

### 3.1 Suggest

`GET /api/search/suggest?q=<prefix>&world=open|private&limit=10`

### 3.2 Full Search

`GET /api/search?q=<query>&world=open|private&types=place,article,user&page=1&limit=20&minRating=4&nearby=1&lat=...&lng=...`

Response item chuẩn hóa:

```json
{
  "type": "place",
  "id": "place_123",
  "title": "Union English",
  "subtitle": "Language center • 4.7★",
  "score": 0.91,
  "location": { "lat": 10.87, "lng": 106.80 },
  "meta": {
    "reviewCount": 123,
    "isPremium": false,
    "visibility": "PUBLIC"
  }
}
```

### 3.3 Search telemetry (optional but recommended)

- `POST /api/search/events`

Event types:

- `search_submit`
- `search_result_click`
- `search_filter_apply`

## 4. Map API (Current + Needed)

### 4.1 Existing usable

- `GET /api/map/contexts`
- `GET /api/map/contexts/:id/articles`
- `GET /api/map/contexts/:id/reviews`
- `POST /api/map/contexts/:id/reviews`

### 4.2 Needed for business rules

1. Add place when missing:
- `POST /api/map/places`

2. Public/private review publish:
- `POST /api/map/places/:id/reviews/publish`

3. Deposit workflow:
- `POST /api/map/places/:id/deposits`

4. Premium review eligibility check:
- `GET /api/reputation/me/eligibility/premium-review`

5. World import/export:
- `POST /api/world/import`
- `POST /api/world/export`

6. Stay event ingestion (for prompt intelligence):
- `POST /api/map/visit-events`

## 5. Review Publish Rule Contract

`POST /api/map/places/:id/reviews/publish`

Request:

```json
{
  "content": "...",
  "visibility": "PUBLIC",
  "isPremium": false,
  "depositAmount": 0
}
```

Server validation:

- Nếu `visibility=PUBLIC` và `wordCount < 100`:
  - `depositAmount > 0` là bắt buộc, hoặc reject và suggest private mode.
- Nếu `isPremium=true`:
  - check `upvote_count >= 1000`
  - check `(downvote_count / upvote_count) <= 0.05`

## 6. Token Economy API (Mobile scope)

- Mobile chỉ **view** KNOW-G.
- KNOW-U dùng cho utility action (deposit, reward, check-in).

Suggested endpoints:

- `GET /api/wallet/me`
- `GET /api/wallet/transactions?cursor=...`
- `POST /api/wallet/deposit-intent` (for review deposit)

## 7. Headers and Client Metadata

- `Authorization: Bearer <access_token>`
- `X-Client-Platform: android|ios`
- `X-Client-Version: 1.0.0`
- `X-Request-Id: uuid`

## 8. Performance Rules

- Suggest API timeout: 2s.
- Search/Map API timeout: 5s.
- Retry only on network timeout (max 1 retry).
- Cursor pagination for feed + large map review list.

## 9. Security + Abuse Prevention

- Mutation endpoints bắt buộc Bearer auth.
- Rate-limit theo user + IP cho review/deposit/create place.
- Idempotency key cho deposit/create-review tránh double submit.
- `requestId` luôn trả về để trace.

## 10. Backward Compatibility Plan

Đề xuất tạo namespace:

- `/api/mobile/v1/*`

Lý do:

- không khóa backend web hiện tại,
- cho phép tune response shape cho mobile performance,
- dễ A/B ranking/search schema.
