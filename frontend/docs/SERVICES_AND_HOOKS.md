# SERVICES AND HOOKS

Service-to-endpoint mapping and hook reference for the frontend.

All services live in `src/services/`. All hooks live in `src/hooks/`. Context providers live in `src/context/`.

Base URL is read from `src/lib/config.ts` via `NEXT_PUBLIC_API_URL`.

---

## Services

### `authService.ts`

| Method | Endpoint | Description |
|---|---|---|
| `forgotPassword(email)` | `POST /api/auth/forgot-password` | Send email OTP for password reset |
| `resetPassword(email, otpCode, newPassword)` | `POST /api/auth/reset-password` | Reset password using OTP code |

Login, register, logout, and session refresh are handled directly inside `AuthContext` (not in this service file).

---

### `restaurantService.ts` (singleton: `restaurantService`)

Queries PLACE Contexts via the `/api/restaurants` compatibility alias.

| Method | Endpoint | Description |
|---|---|---|
| `getRestaurants(params)` | `GET /api/restaurants` | List PLACE contexts with optional `userId`, `isActive`, `limit`, `offset`, `bbox` filters |
| `getRestaurant(id)` | `GET /api/restaurants/:id` | Single PLACE context |
| `createRestaurant(data)` | `POST /api/restaurants` | Create a new PLACE context |
| `updateRestaurant(id, data)` | `PUT /api/restaurants/:id` | Update a PLACE context |
| `deleteRestaurant(id)` | `DELETE /api/restaurants/:id` | Delete a PLACE context |

Also provides `restaurantToMapMarker()` and `restaurantsToMapMarkers()` helpers to convert results for Mapbox display.

---

### `mapContextService.ts`

Used by the map view to load PLACE contexts and their reviews.

| Function | Endpoint | Description |
|---|---|---|
| `fetchMapContexts(params)` | `GET /api/map/contexts` | List contexts within a bounding box; supports `minLat/maxLat/minLng/maxLng`, `category`, `reviewStatus`, `minStars`, `limit` |
| `fetchContextArticles(contextId)` | `GET /api/map/contexts/:id/articles` | List articles linked to a context |
| `fetchContextReviews(contextId, params)` | `GET /api/map/contexts/:id/reviews` | Paginated reviews for a context; supports `page`, `limit`, `sort` |
| `upsertContextReview(contextId, payload)` | `POST /api/map/contexts/:id/reviews` | Create or update a review (stars + optional comment) |

---

### `feedService.ts`

| Function | Endpoint | Description |
|---|---|---|
| `fetchFeed(limit, cursor)` | `GET /api/feed` | Cursor-paginated article feed; returns `items[]` + optional `nextCursor` |

---

### `articleService.ts`

See file for exact methods. Calls article-related endpoints under `/api/articles`.

---

### `userService.ts` (class: `UserService`)

| Method | Endpoint | Description |
|---|---|---|
| `getMe()` | `GET /api/users/me` | Fetch current user's full profile (`UserData`) |

Used by `useCurrentUser` hook.

---

## Hooks

### `useCurrentUser()`

Wraps `UserService.getMe()` with auth awareness. Re-fetches when auth state changes.

```ts
const { user, session, isLoading, error, refetch } = useCurrentUser();
```

- `user` — full `UserData` from `/api/users/me`
- `session` — raw `SessionUser` from `AuthContext` (lightweight, JWT-derived)
- `refetch()` — manually re-fetch

---

### `useProfile()`

Fetches a user's public profile by ID or slug. See `src/hooks/useProfile.ts`.

---

### `useWallet()`

Handles Phantom wallet connect/disconnect and linking to the user account.

```ts
const { walletAddress, isLinked, isInstalled, isConnecting, lastError, handleConnect } = useWallet();
```

Flow:
1. `handleConnect()` calls Phantom's `connect()` to get public key
2. Requests a challenge nonce from `POST /api/auth/wallet/challenge`
3. Signs the message with Phantom's `signMessage()`
4. Submits to `POST /api/auth/wallet/link` (or `/unlink`) with nonce + signature
5. Calls `refreshAuth()` to update session

---

### `useMapHooks()`

Map-specific utilities and event handlers. See `src/hooks/useMapHooks.ts`.

---

### `useChat()`

Chat session management. See `src/hooks/useChat.ts`.

---

## Context Providers

### `AuthContext` (`src/context/AuthContext.tsx`)

Provides auth state and session to the entire app. Must wrap the root layout.

```ts
const { user, isAuthenticated, isLoading, login, register, logout, refreshAuth } = useAuth();
```

- `user` — `SessionUser | null` (id, email, role, isEmailVerified, walletAddress)
- `login(credentials)` — calls `POST /api/auth/login`
- `register(credentials)` — calls `POST /api/auth/register`
- `logout()` — calls `POST /api/auth/logout`
- `refreshAuth()` — calls `GET /api/auth/me` to rehydrate session

CSRF token is read from the `csrf_token` cookie and sent as `x-csrf-token` header on mutating requests.

---

### `MapContext` (`src/context/MapContext.tsx`)

Provides map viewport state, selected marker, and filter state across map components.
