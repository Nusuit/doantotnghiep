# Feature — Map (PLACE Context)

## UI & Mapbox Integration
- **Anchor**: `src/app/map/page.tsx`
- **Main Components**: `src/components/Map/MapContainer.tsx`, `src/components/Map/MapControls.tsx`.
- **Logic**: Mapbox GL JS with dynamic loading (`ssr: false`). 
- **PLACE Layer**: Fetches all active places via `mapContextService.getMarkers()`.
- **Interaction**: Click marker ➡️ open `PlaceDetailModal`.

---

# Feature — Blockchain (KNOW-G & Solana)

## Platform Integration (Coming Soon)
- **Anchor**: `src/app/wallet/page.tsx`
- **Logic**: Solana Wallet connection (Phantom/Solflare).
- **Core Unit**: KNOW-G (On-chain Governance Token).
- **Flow**: Burn KNOW-U (Off-chain) ➡️ Mint/Convert to KNOW-G (On-chain) [TBD].

---

# Feature — Search (Discovery)

## UI & Interaction
- **Anchor**: `src/components/Header/SearchSuggest.tsx`
- **Logic**: 
  - Suggestion Bar (Real-time).
  - Full-text Result Page (`/app/search?q=...`).
- **Dependencies**: Uses `searchService.suggest()` for autocomplete.

---

# Feature — Feed & Content

## UI & Feed Logic
- **Anchor**: `src/app/app/feed/page.tsx`
- **Components**: `PostCard`, `ArticleList`, `InfiniteScroll`.
- **Logic**: Fetches community news and top-voted articles based on KV score.

---

# Feature — Bookmark & Collections

## UI & Storage
- **Anchor**: `src/app/app/bookmarks/page.tsx`
- **Logic**: Local state + Backend storage for favorite Articles and Contexts.
