# Add Place Feature

Interactive map feature that lets users drop a pin, confirm the location, and publish a place + review in two steps.

---

## UX Flow

```
[Add Place FAB] → crosshair cursor
      ↓
  Tap map → green pin drops (200ms debounce)
      ↓
  "Confirm Location →" button appears
      ↓
  AddPlaceModal opens
  ├── MiniMapImage (static Mapbox snapshot)
  ├── Public / Private mode toggle (default: PRIVATE)
  ├── Nearby duplicate check runs in background
  ├── Reverse geocode fills address field
  └── User fills title, description, category, stars (PUBLIC only)
      ↓
  Submit → two-step API
  ├── POST /api/map/places   → create or reuse existing place
  └── POST /api/map/places/:id/reviews/publish
      ↓
  Modal closes → side panel opens for the new place
```

---

## Component Tree & Data Flow

```
MapPage
├── MapProvider
│   ├── MapSavedMarkersSync          ← syncs saved place markers
│   ├── MapAddPinSync                ← syncs the pending green pin
│   ├── MapContainer
│   │   ├── interactivePinMode       ← suppresses POI snapping
│   │   └── onClick → handleMapClickForAdd (200ms debounce)
│   └── AddPlaceModal
│       ├── MiniMapImageWithFallback  ← Mapbox Static Images API
│       ├── useReverseGeocode(lat, lng)
│       ├── Nearby duplicate check   ← GET /api/search/suggest
│       └── handleSubmit
│           ├── createPlace()        ← POST /api/map/places
│           └── publishPlaceReview() ← POST /api/map/places/:id/reviews/publish
```

---

## Backend API Schemas

### POST `/api/map/places`

**Request body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "category": "string (optional)",
  "address": "string (optional)",
  "latitude": 10.7769,
  "longitude": 106.7009
}
```

**Response `data`:**
```json
{
  "place": {
    "id": 42,
    "name": "...",
    "latitude": 10.7769,
    "longitude": 106.7009,
    "category": "...",
    "address": "...",
    "reviewCount": 0
  },
  "duplicate": false
}
```

`duplicate: true` means an existing place at the same exact coordinates was returned.

### POST `/api/map/places/:id/reviews/publish`

**Request body:**
```json
{
  "stars": 5,
  "content": "string",
  "visibility": "PUBLIC | PRIVATE | PREMIUM",
  "depositAmount": 0
}
```

---

## Duplicate Prevention Logic

The frontend checks for nearby duplicates using the search suggest endpoint:

```
GET /api/search/suggest?q={title}&lat={lat}&lng={lng}&nearby=true&limit=5
```

A candidate place is considered a duplicate if:
- `item.type === "place"`
- Haversine distance ≤ 50 metres from the dropped pin
- Name similarity is handled server-side by the search service (fuzzy matching)

**Outcomes (server-driven — no user choice):**

| Condition | Status | UX |
|---|---|---|
| Nearby place has reviews (`rating > 0`) | `blocked` | Red banner, submit disabled, "View existing place →" |
| Nearby place exists but no reviews | `auto-attach` | Blue info banner, uses existing place ID, skips `createPlace` |
| No nearby match | `clear` | Normal form, full create flow |

The backend also enforces a `@@unique([latitude, longitude])` constraint. If the exact coordinates already exist, `createPlace` returns `duplicate: true` and the returned `place.id` is used directly.

---

## Mode Logic

| Mode | Visibility | Review required | Stars shown | Deposit shown |
|---|---|---|---|---|
| PRIVATE (default) | Only author | No (auto-creates silent note) | No | No |
| PUBLIC | Everyone | ≥ 5 words recommended | Yes | Yes (if < 100 words) |

When PUBLIC and description < 5 words on submit, a no-review inline alert appears with two actions:
- **Switch to Private** — changes mode and proceeds
- **Add Review ↑** — focuses the description textarea

---

## Race Condition Safety

- **Nearby check**: each `open`/`title`/`lat`/`lng` change creates a new `AbortController`. The previous in-flight request is cancelled.
- **Submit**: a single `AbortController` is shared across both API calls. Closing the modal mid-submit aborts both calls and resets `isSubmitting`.
- **Reverse geocode**: uses `useReverseGeocode` hook which has its own `AbortController` per `lat`/`lng` change.
- **Map click debounce**: 200ms `setTimeout` — rapid taps produce only one pin drop.

---

## Scalability Hooks

Future fields can be added to `AddPlaceModal` and the `POST /api/map/places` body:

| Feature | Frontend | Backend |
|---|---|---|
| Photos | `<input type="file" multiple>` → upload to S3 | Add `photoUrls: string[]` to place schema |
| Opening hours | Time-range picker UI | `openingHours: Json` field in Prisma |
| Tags / taxonomy | Multi-select from `article_taxonomies` | M2M join table `place_taxonomies` |
| Ratings display | Show avg + count in side panel | Aggregate on `place_reviews` |
| Edit place | Same modal, prefill from existing place | `PATCH /api/map/places/:id` |

---

## Mobile Parity Gap

The Flutter app's `_openCreatePlaceDialog` (in `mobile-app/`) uses the device GPS to get coordinates. It does **not** support map-tap location picking.

**To reach parity with the web feature:**
1. Create a `MapTapLocationPickerScreen` in Flutter — a full-screen Google Maps / Mapbox view where the user taps to set a pin.
2. Call it from the FAB (equivalent of "Add Place") in the map screen.
3. Pass the resulting `LatLng` to the existing `_openCreatePlaceDialog`.

This is a self-contained feature — no backend changes needed.

---

## Mini Map: Static vs Interactive — Decision Guide

### Option A — Mapbox Static Images API `<img>` *(currently implemented)*

```
https://api.mapbox.com/styles/v1/{style}/static/
  pin-s-marker+00c45a({lng},{lat})/
  {lng},{lat},14/560x180@2x
  ?access_token={token}
```

**Pros:** Zero JS weight, no extra WebGL context, renders as a plain image.  
**Cons:** Custom private style may 403.

**Fallback chain (implemented):**
1. Custom style from `NEXT_PUBLIC_MAPBOX_STYLE_URL`
2. `mapbox/streets-v12` (via `onError`)
3. Coordinate text display (if no token or both images fail)

### Option B — Embedded `react-map-gl` `<Map>` (non-interactive)

**Pros:** Uses custom style, pixel-perfect match to main map.  
**Cons:** Second WebGL context (heavy on mobile), React subtree overhead.

### Option C — Embedded `<Map>` with draggable pin (fine-tuning)

**Pros:** User can drag the pin to adjust exact position inside the modal.  
**Cons:** Most complex; requires a separate `<MapProvider>` context to avoid shared state with the main map.

**Recommendation:**  
Use **Option A** (current). The user already confirmed the exact pin on the main map before opening the modal — the mini map is visual confirmation only.  
Upgrade to **Option C** only if "drag to fine-tune" is a stated requirement. At that point, wrap the embedded `<Map>` with a standalone `<MapProvider>` isolated from main map state.

---

## Known Constraints

- **`@@unique([latitude, longitude])`** in Prisma: two places cannot share the exact same float coordinates. The backend returns the existing place on exact collision.
- **Nearby search radius**: 50m is conservative. Consider making it configurable (e.g. 100m in dense urban areas) via a query param.
- **PREMIUM visibility**: the `PublishReviewInput` type supports it, but the AddPlaceModal UI only exposes PUBLIC/PRIVATE. Add a PREMIUM option when the deposit/paywall flow is ready.
