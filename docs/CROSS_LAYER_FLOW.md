# Cross-Layer Flow Diagram

> Covers all major use cases: Auth, Feed, Map, Search, Background Jobs

---

## 1. Auth Flows

### 1a. Email Register + OTP Verify

```mermaid
sequenceDiagram
    actor U as User
    participant C as Client (Web/Mobile)
    participant API as Express API
    participant DB as PostgreSQL
    participant Email as Email Service

    U->>C: Fill register form
    C->>API: POST /api/auth/register<br/>{email, password, name}
    API->>DB: users.create (status: PENDING_VERIFY)
    API->>DB: user_security.update (emailOtp = OTP hash, expiresAt)
    API->>Email: Send OTP email
    API-->>C: {requireVerification: true, email}

    U->>C: Enter OTP code
    C->>API: POST /api/auth/verify-email-otp {email, otpCode}
    API->>DB: user_security.findUnique(userId)
    Note over API: Check attempts, expiry, hash match
    API->>DB: users.update (status: ACTIVE)<br/>user_security.update (clear OTP fields)
    API->>DB: refresh_tokens.create
    API-->>C: Set cookies (access_token, refresh_token, csrf_token)<br/>+ {token, user}
```

---

### 1b. Login (Email/Password)

```mermaid
sequenceDiagram
    actor U as User
    participant C as Client
    participant API as Express API
    participant DB as PostgreSQL

    U->>C: Enter email + password
    C->>API: POST /api/auth/login {email, password}
    API->>DB: users.findUnique(email)
    Note over API: Check: locked? PENDING_VERIFY? BANNED?<br/>bcrypt.compare(password, hash)
    API->>DB: user_security.update (lastLoginAt, loginAttempts=0)
    API->>DB: refresh_tokens.create
    API-->>C: [Web] Set HttpOnly cookies<br/>[Mobile] {token, refreshToken, user} in body
```

---

### 1c. Google OAuth — Web Flow

```mermaid
sequenceDiagram
    actor U as User
    participant W as Web Browser (Next.js)
    participant API as Express API
    participant Google as Google OAuth
    participant DB as PostgreSQL

    U->>W: Click "Login with Google"
    W->>API: GET /api/auth/google
    API-->>W: {authUrl}
    W->>Google: Redirect to Google consent page
    U->>Google: Approve
    Google->>API: GET /api/auth/google/callback?code=...
    API->>Google: POST /token — exchange code → id_token, access_token
    API->>Google: GET /userinfo — fetch email, name, picture
    API->>DB: users.findUnique(email) or create<br/>(auto-verified, accountStatus=ACTIVE)
    API->>DB: refresh_tokens.create
    API-->>W: Set cookies → Redirect<br/>new user: /app/onboarding?welcome=google<br/>existing: /app/feed?welcome=back
```

---

### 1d. Google OAuth — Mobile Exchange Flow ⚠️ NOT IMPLEMENTED

> The `/api/auth/mobile/exchange` endpoint does not exist yet.
> The flow below is the planned design. Currently, mobile OAuth relies on the same web callback.

```mermaid
sequenceDiagram
    actor U as User
    participant M as Flutter App
    participant Browser as System Browser
    participant API as Express API
    participant Redis as Redis
    participant Google as Google OAuth
    participant DB as PostgreSQL

    U->>M: Tap "Login with Google"
    M->>API: GET /api/auth/google?mobile_redirect_uri=knowledgeshare://auth/callback
    API-->>M: {authUrl}
    M->>Browser: FlutterWebAuth2.authenticate(authUrl)
    Browser->>Google: OAuth consent
    U->>Google: Approve
    Google->>API: GET /api/auth/google/callback
    API->>DB: Find or create user
    API->>Redis: SET mobile:oauth:exchange:{code} payload EX 180
    API-->>Browser: Redirect → knowledgeshare://auth/callback?code=...
    Browser-->>M: Callback with code
    M->>API: POST /api/auth/mobile/exchange {code} ← NOT YET IMPLEMENTED
    API->>Redis: GET + DEL mobile:oauth:exchange:{code}
    API-->>M: {token, refreshToken, user}
    M->>M: SecureStorage.save(token, user)
```

---

### 1e. Forgot Password

```mermaid
sequenceDiagram
    actor U as User
    participant C as Client
    participant API as Express API
    participant DB as PostgreSQL
    participant Email as Email Service

    U->>C: Enter email
    C->>API: POST /api/auth/forgot-password {email}
    API->>DB: users.findUnique(email)
    API->>DB: user_security.update (passwordResetToken = OTP hash, expiresAt)
    API->>Email: Send reset OTP
    API-->>C: {message: "Reset code sent"}

    U->>C: Enter OTP + new password
    C->>API: POST /api/auth/reset-password {email, otpCode, newPassword}
    API->>DB: Verify OTP hash + expiry
    API->>DB: user_security.update (passwordHash = bcrypt(newPassword), clear reset fields)
    API-->>C: {message: "Password reset"}
```

---

### 1f. Token Refresh + Logout

```mermaid
sequenceDiagram
    participant C as Client (Web)
    participant API as Express API
    participant DB as PostgreSQL

    Note over C,API: Access token expires (15 min)
    C->>API: POST /api/auth/refresh (refresh_token cookie)
    API->>DB: refresh_tokens.findUnique(tokenHash)
    Note over API: Check: revoked? expired?
    API->>DB: refresh_tokens.update (revoked=true, replacedBy=newHash)
    API->>DB: refresh_tokens.create (new token, 30 days)
    API-->>C: Set new cookies (sliding window)

    Note over C,API: User logout
    C->>API: POST /api/auth/logout (x-csrf-token header)
    API->>DB: refresh_tokens.update (revoked=true)
    API-->>C: Clear cookies
```

---

## 2. Feed Flows

### 2a. Get Feed

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Express API
    participant FeedSvc as FeedAssemblerService
    participant DB as PostgreSQL

    C->>API: GET /api/feed?limit=20&cursor=...
    Note over API: authenticate() → req.user
    API->>FeedSvc: getFeedForUser(userId, limit, cursor)
    FeedSvc->>DB: articles.findMany (cursor-based, ranked by rankingScore)
    FeedSvc-->>API: {items, nextCursor}
    API-->>C: {data: {items, nextCursor}}
```

---

### 2b. Create Article

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Express API
    participant DB as PostgreSQL
    participant Redis as Redis
    participant Worker as BullMQ Worker

    C->>API: POST /api/articles<br/>{title, content, category, contexts[{type, name, lat?, lng?}]}
    Note over API: authenticate + requireActiveUser + requireCsrf
    API->>DB: taxonomies.findUnique(slug) or create (type=CATEGORY)
    Note over API: Validate category ↔ context type match<br/>(e.g. PLACE_BASED_KNOWLEDGE requires PLACE)
    loop For each context in body
        alt type = PLACE
            API->>DB: contexts.findFirst({type, latitude, longitude})
        else type = ENTITY / TOPIC
            API->>DB: contexts.findFirst({type, name})
        end
        API->>DB: contexts.create (if not exists)
    end
    Note over API: contextId = contexts[0].id (first context is the FK)
    API->>DB: articles.create<br/>{contextId, authorId, type=POST,<br/>taxonomies: [{taxonomyId: category.id}]}
    API->>Redis: SETNX debounce:score:article:{id} EX 300
    API->>Redis: Queue job "recalc-article-scores"
    Worker->>DB: Recalculate rankingScore, tier, kvScore (async)
    API-->>C: {data: article}
```

> **Note:** Article has a single `contextId` FK (one-to-one with Context). There is no many-to-many `article_contexts` join table. If multiple contexts are sent, only the first one is stored.

---

## 3. Map Flows

### 3a. Load Map Places (Bounding Box)

```mermaid
sequenceDiagram
    participant M as Mobile/Web Map
    participant API as Express API
    participant DB as PostgreSQL

    Note over M: User pans/zooms map
    M->>API: GET /api/map/contexts?minLat=&minLng=&maxLat=&maxLng=&limit=200
    API->>DB: contexts.findMany<br/>WHERE type=PLACE AND lat BETWEEN ... AND lng BETWEEN ...<br/>ORDER BY isReviewed DESC, avgRating DESC
    API-->>M: {contexts: [...]} (up to 200 pins)
    M->>M: Render pins on Mapbox map
```

---

### 3b. Search / Autocomplete

```mermaid
sequenceDiagram
    participant M as Mobile
    participant API as Express API
    participant DB as PostgreSQL

    M->>API: GET /api/search/suggest?q=cafe&world=open&lat=...&lng=...
    API->>DB: contexts.findMany (type=PLACE, search by name/address)
    API->>DB: articles.findMany (search by title)
    Note over API: Rank by lexical + quality + proximity score
    API-->>M: [{id, name, lat, lng, score}]

    Note over M: User clicks on a suggestion
    M->>M: SearchFlowCoordinator.openMap(result)
    M->>M: Switch to Map tab, flyTo(lat, lng)
```

---

### 3c. Save to Private World (Import)

```mermaid
sequenceDiagram
    participant M as Mobile
    participant API as Express API
    participant DB as PostgreSQL

    Note over M: User imports PLACE contexts to "Favorite Locations"
    M->>API: POST /api/world/import<br/>{mode: "full"|"region", region?: {minLat, maxLat, minLng, maxLng}}
    Note over API: authenticate + requireActiveUser + requireCsrf
    API->>DB: contexts.findMany (type=PLACE, filtered by region or all)<br/>limit: 400 (region) or 1500 (full)
    API->>DB: collections.findFirst({userId, title="Favorite Locations"}) or create
    API->>DB: collectionItems.findMany (dedup check by context lat/lng/name)
    loop For each new place context
        API->>DB: articles.findFirst({contextId, authorId}) or create<br/>{type=POST, title="Imported Location: ...", content=""}
        API->>DB: collectionItems.create {collectionId, articleId}
    end
    API-->>M: {imported: N}
```

---

### 3d. Write a Place Review

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Express API
    participant DB as PostgreSQL

    C->>API: POST /api/map/contexts/:id/reviews {comment?}
    Note over API: authenticate + requireActiveUser + requireCsrf
    Note over API: No "stars" field — removed from schema
    API->>DB: contexts.findUnique (verify type=PLACE)
    API->>DB: articles.findFirst({contextId, type=REVIEW})
    alt Review exists by different user
        API-->>C: 409 ERR_REVIEW_EXISTS
    else Review exists by same user
        API->>DB: articles.update {content, status=PUBLISHED}
    else No review yet
        API->>DB: articles.create<br/>{contextId, authorId, type=REVIEW,<br/>status=PUBLISHED, content, title}
    end
    Note over API: recalculateContextReviewStats()
    API->>DB: articles.aggregate(_count, WHERE contextId + type=REVIEW + PUBLISHED)
    API->>DB: contexts.update {reviewCount, avgRating=0, isReviewed=reviewCount>0}
    API-->>C: {review: article}
```

> **Note:** `stars` rating was removed from the schema. `avgRating` on Context is always `0.0` until a stars-equivalent signal is added. `isReviewed` is `true` as soon as one REVIEW article exists for the context.

---

## 4. Background Jobs Flow (BullMQ + Worker)

```mermaid
sequenceDiagram
    participant API as Express API
    participant Redis as Redis
    participant Worker as BullMQ Worker
    participant ScoringService as ScoringService
    participant DB as PostgreSQL

    Note over API: Any interaction/vote/suggestion triggers job
    API->>Redis: SETNX debounce:score:article:{id} EX 300
    Redis-->>API: "OK" (acquired) or nil (skip — already queued)
    API->>Redis: Queue.add("recalc-article-scores", {articleId})

    Note over Worker: Periodic schedule (every 5 min)
    Worker->>Redis: Pop job from knowledge-queue
    Worker->>ScoringService: recalcArticleScores(limit=200, articleId?)
    ScoringService->>DB: interactions.groupBy(articleId) → compute signals
    ScoringService->>DB: articles.updateMany (rankingScore, tier, kvScore)

    Note over Worker: Every 10 min
    Worker->>ScoringService: recalcTierPool()
    ScoringService->>DB: Rebalance tier distribution

    Note over Worker: Every 60 min
    Worker->>ScoringService: recalcUserScores()
    ScoringService->>DB: interactions.groupBy(userId) → compute ks_score
    ScoringService->>DB: users.updateMany (ksScore, reputationScore)
```

---

## 5. Full Request Middleware Chain

```mermaid
flowchart LR
    A[Client Request] --> B[requestContext\nx-request-id]
    B --> C[cors\nCORS_ORIGIN whitelist]
    C --> D[helmet + compression]
    D --> E[cookieParser]
    E --> F{Route prefix}
    F -->|/api/auth/*| G[authRateLimiter\n20/15min/IP]
    F -->|/api/*| H[apiRateLimiter\n120/min/IP]
    G --> I[Route Handler]
    H --> I
    I --> J{Auth required?}
    J -->|Yes| K[authenticate\nJWT verify]
    K --> L{Active required?}
    L -->|Yes| M[requireActiveUser\nRedis cache → DB check ACTIVE]
    M --> N{CSRF needed?}
    N -->|Cookie client| O[requireCsrf\ncheck x-csrf-token header]
    O --> P[Zod Validate]
    P --> Q[Business Logic]
    Q --> R[(PostgreSQL)]
    Q --> S[(Redis)]
    N -->|Bearer client| P
    J -->|No| P
```
