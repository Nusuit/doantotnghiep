# Feature — Map (PLACE Data)

## Backend & GIS Integration
- **Endpoint**: `POST /api/map/places`
- **Logic**: 
  - Validates Lat/Lng with Zod.
  - Reverse geocoding (Mapbox API).
  - Point-in-Polygon check (GeoJSON).
- **Service**: `mapContextService.ts`

---

# Feature — Blockchain (SOL Service)

## Backend Implementation [PLANNED]
- **Endpoint**: `POST /api/wallet/convert`
- **Logic**: Burn KNOW-U ➡️ Solana RPC call ➡️ Mint KNOW-G.
- **Worker**: Async on-chain verification.

---

# Feature — Search (Logic)

## Backend & DB Query
- **Endpoint**: `GET /api/search/suggest`
- **Logic**: 
  - Query Normalization.
  - Trigram recall (Postgres index).
  - Context-aware filtering.
- **Service**: `search.service.ts`, `location-keywords.ts`.

---

# Feature — Feed & Scoring

## Ranking Logic
- **Endpoint**: `GET /api/feed`
- **Logic**: 
  - Ranking articles by KV (Quality) & KS (Reputation).
  - Soft/Hard caps based on KV level (LOW, MEDIUM, HIGH).
- **Worker**: `src/worker.ts`, `scoringEngine.ts`.

---

# Feature — Bookmark

## DB Relations
- **Endpoint**: `POST /api/articles/:id/bookmark`
- **Logic**: Creates article interaction with type `BOOKMARK`.
- **Service**: `interaction.service.ts`.
