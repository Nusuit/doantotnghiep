# AUTH_REFERENCE

Authentication system for the KnowledgeShare backend.

## Active Auth Flows

### 1. Email + Password

**Register**
```
POST /api/auth/register
Body: { email, password (min 8), displayName? }
```
- Creates user with `accountStatus: PENDING_VERIFY`
- Sends 6-digit OTP to email (expires 15 min)
- Returns `{ requireVerification: true, email }` — no token yet

**Verify email OTP**
```
POST /api/auth/verify-email-otp
Body: { email, otpCode }
```
- On success: activates account (`ACTIVE`), sets auth cookies, returns `{ token, user }`
- Max 5 attempts before 15-min lockout

**Resend email OTP**
```
POST /api/auth/resend-email-otp
Body: { email }
```
- 90-second cooldown between sends

**Login**
```
POST /api/auth/login
Body: { email, password }
```
- Requires `accountStatus: ACTIVE` and `isEmailVerified: true`
- Max 5 failed attempts → 15-min lockout
- Sets auth cookies on success, returns `{ token, user }`

---

### 2. Google OAuth

**Step 1 — Get authorization URL**
```
GET /api/auth/google
Response: { authUrl }  ← redirect user here
```

**Step 2 — OAuth callback (handled server-side)**
```
GET /api/auth/google/callback?code=...
```
- Exchanges code for Google tokens, fetches user info
- Finds or creates user (auto-verified, `accountStatus: ACTIVE`)
- Sets auth cookies
- Redirects to:
  - New user: `{FRONTEND_URL}/app/onboarding?welcome=google`
  - Existing user: `{FRONTEND_URL}/app/feed?welcome=back`

---

### 3. Email Verification Link (for already-registered users)

**Send verification link**
```
POST /api/auth/send-verification-email
Auth: required (Bearer/cookie)
```
- Sends email with a verification link token (valid 30 min)
- Rate-limited: 90-second cooldown

**Verify via link**
```
POST /api/auth/verify-email
Body: { email, token }
```
- Marks email as verified (does NOT set auth cookies)

---

## Token Structure

| Cookie | Value | TTL | Flags |
|---|---|---|---|
| `access_token` | JWT (id, email) | 15 min | httpOnly, sameSite=lax |
| `refresh_token` | random hex (32 bytes) | 30 days | httpOnly, sameSite=lax |
| `csrf_token` | random hex (16 bytes) | 30 days | **not** httpOnly, sameSite=strict |

JWT payload: `{ id: number, email: string, iat, exp }`

The `csrf_token` is readable by JS. On state-changing requests via cookie auth, clients must send `X-CSRF-Token: <value>` header.

Bearer token auth skips CSRF validation (used by mobile).

---

## Session Management

**Refresh access token**
```
POST /api/auth/refresh
```
- Reads `refresh_token` cookie + validates CSRF header
- Rotates refresh token (old token revoked, new one issued)
- Returns `{ token }` and sets new cookies

**Logout (current device)**
```
POST /api/auth/logout
```
- Revokes current refresh token
- Clears all auth cookies

**Logout (all devices)**
```
POST /api/auth/logout-all
Auth: required + CSRF header
```
- Revokes all refresh tokens for this user
- Clears Redis cache key `auth:me:{userId}`

**Get current user**
```
GET /api/auth/me
Auth: required
```
- Cached in Redis for 2 minutes (`auth:me:{userId}`)
- Returns `{ id, email, role, accountStatus, isEmailVerified, name, avatar }`

---

## Security Mechanisms

| Mechanism | Detail |
|---|---|
| Password hashing | bcrypt, cost 12 |
| Login lockout | 5 failures → 15-min lock (`lockedUntil` in `user_security`) |
| OTP lockout | 5 failures → 15-min lock |
| OTP cooldown | 90 seconds between sends |
| Rate limiting | 20 req/15min on all `/api/auth/*` routes |
| CSRF | Cookie-based flows require `X-CSRF-Token` header (Bearer exempt) |
| Redis cache | `auth:me:{userId}` TTL=2min; invalidated on `logout-all` |
| Account status check | `requireActiveUser` middleware checks Redis cache (TTL=5min) before hitting DB |

---

## Required Environment Variables

```env
JWT_SECRET=                     # Required — JWT signing secret
GOOGLE_CLIENT_ID=               # Required for Google OAuth
GOOGLE_CLIENT_SECRET=           # Required for Google OAuth
GOOGLE_REDIRECT_URI=            # Required for Google OAuth (e.g. http://localhost:4000/api/auth/google/callback)
GOOGLE_SCOPE=                   # Optional — defaults to "email profile openid"
FRONTEND_URL=                   # Required — for OAuth redirect and email links
EMAIL_VERIFICATION_EXPIRY_MINUTES=  # Optional — default 15
EMAIL_OTP_COOLDOWN_SECONDS=         # Optional — default 90
EMAIL_OTP_MAX_ATTEMPTS=             # Optional — default 5
EMAIL_OTP_LOCK_MINUTES=             # Optional — default 15
LOGIN_MAX_ATTEMPTS=                 # Optional — default 5
LOGIN_LOCK_MINUTES=                 # Optional — default 15
```

---

## Not Implemented

**Phone OTP** — All three phone OTP endpoints (`/send-otp`, `/verify-otp`, `/resend-otp`) return `410 Gone`.
The feature was scoped out before implementation due to Twilio SMS costs.
