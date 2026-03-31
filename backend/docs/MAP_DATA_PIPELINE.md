# MAP_DATA_PIPELINE

How to import Vietnam OSM data into the `contexts` table for use by map features.

> **Schema note:** The `context_reviews` table mentioned in earlier docs was removed. Reviews are now stored as `Article(type=REVIEW)` rows. The `stars` field was also removed; `avg_rating` on `contexts` is currently always `0.0` and `review_count` is the primary signal.

---

## 1. Apply database migrations

```bash
cd backend
npx prisma migrate deploy
```

Relevant schema fields on `contexts`:
- `source`, `source_ref` — external dataset identity (for dedup)
- `is_reviewed`, `review_count`, `avg_rating` — denormalized for fast map rendering

---

## 2. Extract reviewable places from Vietnam OSM file

Input file: `docs/vietnam-260213.osm.pbf` (305MB, not in git)

```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/extract-reviewable-osm.ps1 `
  -InputPbf docs/vietnam-260213.osm.pbf `
  -OutputDir backend/data/osm
```

Output: `backend/data/osm/vn-reviewable.geojson`

---

## 3. Dry-run import

```bash
node backend/scripts/import-reviewable-geojson.mjs \
  --file backend/data/osm/vn-reviewable.geojson \
  --dry-run
```

---

## 4. Import into `contexts`

```bash
node backend/scripts/import-reviewable-geojson.mjs \
  --file backend/data/osm/vn-reviewable.geojson
```

Optional limit for testing:
```bash
node backend/scripts/import-reviewable-geojson.mjs \
  --file backend/data/osm/vn-reviewable.geojson \
  --limit 1000
```

---

## 5. API usage after import

**List PLACE contexts with bbox filter:**
```
GET /api/map/contexts
Query: minLat, minLng, maxLat, maxLng, category, categories, reviewStatus (all|reviewed|unreviewed), minStars, limit
```

**Create a place (mobile/map flow):**
```
POST /api/map/places
Auth: JWT + Active + CSRF
Body: { name, latitude, longitude, description?, category?, address? }
```

**Publish a review article for a place:**
```
POST /api/map/places/:id/reviews/publish
Auth: JWT + Active + CSRF
Body: { stars (field ignored), content (min 100 words for public), visibility, depositAmount? }
```

**Get reviews for a place:**
```
GET /api/map/contexts/:id/reviews?page=1&limit=20&sort=newest
```

**Get articles linked to a place:**
```
GET /api/map/contexts/:id/articles
```
