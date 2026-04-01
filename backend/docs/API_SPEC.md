# API_SPEC — Context-Based Design

> **Note:** This document reflects the intended design. For the complete list of actually implemented endpoints, see [API_REFERENCE.md](API_REFERENCE.md).
>
> **Key discrepancy:** This doc specifies `GET /api/map/contexts` for listing map contexts. That route exists in `contextApi.ts` and is correct. However, place creation uses `POST /api/map/places` (mobileRouter), not `POST /api/map/contexts`. Both coexist and serve different use cases (see API_REFERENCE for details).

---

## 0. Design Preface

All API rules and invariants in this document must comply with:
- Core Concepts
- Value Model
- System Boundary

APIs must not encode assumptions that contradict the Context-based discovery model.

---

## 1. Global Invariants

- Article is the central object of all content APIs.
- Every Article MUST:
  - Have exactly one Category
  - Be linked to at least one Context
- Context is the discovery anchor, not the value owner.
- Knowledge Value (KV) is never modified directly by API calls.

---

## 2. Context Rules

**Context types:**
- `PLACE` — spatial, has lat/lng, appears on Map
- `ENTITY` — non-spatial real-world entity
- `TOPIC` — abstract or conceptual anchor

Rules:
- Only PLACE Contexts are exposed to Map APIs.
- ENTITY and TOPIC Contexts are discoverable via Feed and Context pages.

**Context creation (MVP):**
- Contexts are created implicitly when Articles are created via `POST /api/articles`.
- No standalone Context creation API in MVP for the article flow.
- `POST /api/map/places` creates PLACE contexts directly (mobile/map use case).

---

## 3. Article APIs

### POST /api/articles
- Category is required
- At least one Context payload is required (`contexts` array, max 1 in MVP)
- Context payload must match Category constraints (e.g. PLACE_BASED_KNOWLEDGE requires PLACE context)

Forbidden assumptions:
- Article must be spatial
- Article equals Place

### GET /api/articles/:id
Returns article content, category (via taxonomies), linked context.

---

## 4. Context APIs

### GET /api/contexts/:id
Returns context metadata + linked articles.

---

## 5. Map APIs

### GET /api/map/contexts
- Returns PLACE Contexts only
- Supports bounding box filters: `minLat`, `minLng`, `maxLat`, `maxLng`
- Additional filters: `category`, `categories`, `reviewStatus`, `minStars`, `limit`

### GET /api/map/contexts/:id/articles
Returns articles linked to a PLACE Context.

### GET /api/map/contexts/:id/reviews
Returns review articles for a PLACE Context (paginated).

Map APIs:
- Do not expose KV / KS values
- Do not imply value ranking

---

## 6. Suggestion & Contribution APIs

- Suggestions are requests, not value updates.
- Accepting a suggestion may update article content.
- KV / KS updates are processed **asynchronously by the worker** — never inline in API requests.

---

## 7. Forbidden API Patterns

- No API may directly modify KV or KS
- No API may assume 1 Context = 1 Article
- No API may treat Map visibility as value signal
