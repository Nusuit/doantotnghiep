# API_REFERENCE

Complete endpoint inventory for the KnowledgeShare backend API.

Base URL (local dev): `http://localhost:4000/api`

Auth column: `—` = public, `JWT` = requires `authenticate` middleware (Bearer or cookie), `JWT+Active` = also requires `requireActiveUser`, `JWT+Active+CSRF` = also requires `requireCsrf`.

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register with email + password. Sends email OTP, returns `requireVerification: true`. |
| POST | `/auth/verify-email-otp` | — | Verify 6-digit email OTP. Activates account and sets auth cookies. |
| POST | `/auth/resend-email-otp` | — | Resend email OTP (90s cooldown). |
| POST | `/auth/login` | — | Login with email + password. Sets auth cookies. |
| POST | `/auth/refresh` | — (CSRF required) | Rotate refresh token, issue new access token. |
| POST | `/auth/logout` | — | Revoke refresh token, clear cookies. |
| POST | `/auth/logout-all` | JWT + CSRF | Revoke all refresh tokens for current user. |
| GET | `/auth/me` | JWT | Get current user profile (Redis-cached 2min). |
| GET | `/auth/google` | — | Get Google OAuth authorization URL. |
| GET | `/auth/google/callback` | — | Google OAuth callback. Sets cookies and redirects to frontend. |
| POST | `/auth/send-verification-email` | JWT | Send email verification link (for non-OTP flow). |
| POST | `/auth/verify-email` | — | Verify email via link token. |
| POST | `/auth/send-otp` | — | **410 GONE** — Phone OTP disabled. |
| POST | `/auth/verify-otp` | — | **410 GONE** — Phone OTP disabled. |
| POST | `/auth/resend-otp` | — | **410 GONE** — Phone OTP disabled. |

---

## Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/leaderboard` | Optional JWT | Top users by KS score. |
| GET | `/users/me` | JWT | Current user's full profile. |
| PUT | `/users/me/profile` | JWT | Update display name, bio, avatar URL. |
| GET | `/users/:id` | — | Public profile of any user. |

---

## Feed — `/api/feed`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/feed` | JWT | Personalized feed with cursor pagination. |
| POST | `/feed/create` | JWT | Create a post/article (simple feed flow). |

---

## Restaurants / Places (compatibility alias) — `/api/restaurants`

These routes proxy the `Context` model with `type = PLACE`. The `restaurants` table no longer exists in the DB.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/restaurants` | — | List PLACE contexts. |
| GET | `/restaurants/:id` | — | Get single PLACE context. |
| POST | `/restaurants` | — | Create a PLACE context. |
| PUT | `/restaurants/:id` | — | **403 DISABLED** in MVP. |
| DELETE | `/restaurants/:id` | — | **403 DISABLED** in MVP. |

---

## Articles & Contexts — `/api` (contextApi)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/articles` | JWT+Active+CSRF | Create an article. Requires `category` + `contexts` (1 context). Implicitly creates Context if new. |
| GET | `/articles/:id` | — | Get article with context and taxonomies. |
| POST | `/articles/:id/interactions` | JWT+Active+CSRF | Record an interaction (VIEW/SAVE/UPVOTE/DOWNVOTE/SHARE/REPORT). Deduplication enforced. Enqueues scoring job. |
| POST | `/interactions/batch` | JWT+Active+CSRF | Batch record interactions (max 50). |
| POST | `/articles/:id/suggestions` | JWT+Active+CSRF | Submit an edit suggestion. Rate limited: 1 per article per 24h. Enqueues scoring job. |
| GET | `/contexts/:id` | — | Get a context with linked articles. |
| GET | `/map/contexts` | — | List PLACE contexts with optional bbox filter (`minLat`, `minLng`, `maxLat`, `maxLng`, `category`, `reviewStatus`, `limit`). |
| POST | `/map/contexts/:id/reviews` | JWT+Active+CSRF | Create/update review article for a PLACE context. Stars field removed — stores text content only. |
| GET | `/map/contexts/:id/reviews` | — | List review articles for a PLACE context (paginated). |
| GET | `/map/contexts/:id/articles` | — | List all articles linked to a PLACE context. |

---

## Mobile / Map — `/api` (mobileRouter)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/search/suggest` | Optional JWT | Autocomplete suggestions (places + articles). Query: `q`, `world` (open/private), `limit`, `lat`, `lng`, `nearby`. |
| GET | `/search` | Optional JWT | Full search with pagination. Query: `q`, `types` (place,article), `page`, `limit`, `lat`, `lng`, `nearby`, `recentDays`. |
| GET | `/reputation/me/eligibility/premium-review` | JWT | Check if current user is eligible for premium review (200+ upvotes, <10% downvote ratio, 5+ reviews). |
| POST | `/map/places` | JWT+Active+CSRF | Create a PLACE context (mobile-oriented). Returns existing if duplicate coords. |
| POST | `/map/places/:id/reviews/publish` | JWT+Active+CSRF | Publish a review (Article type=REVIEW). Enforces 100-word minimum for public. Handles KNOW-U deposit. |
| POST | `/map/places/:id/deposits` | JWT+Active+CSRF | Deposit KNOW-U tokens on a place. Deducts from `knowUBalance`, creates `WalletTransaction`. |
| POST | `/world/import` | JWT+Active+CSRF | Import PLACE contexts into user's "Favorite Locations" collection. Mode: `full` (max 1500) or `region` (max 400 within bbox). |

> Note: `/map/places` (mobileRouter) and `/map/contexts` (contextApi) are different endpoints. Both create/query PLACE-type Context rows.

---

## Health — `/api`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Always returns 200 OK. |
| GET | `/ready` | — | Readiness check — tests DB connection. |

---

## Global Rate Limits

| Scope | Limit |
|---|---|
| All `/api/*` routes | 120 requests / 60 seconds |
| `/api/auth/*` routes | 20 requests / 15 minutes |

---

## Request / Response Envelope

All responses use the `sendSuccess` / `sendError` helpers:

```json
// Success
{ "success": true, "data": { ... }, "requestId": "uuid" }

// Error
{ "success": false, "error": { "code": "ERR_CODE", "message": "..." }, "requestId": "uuid" }
```
