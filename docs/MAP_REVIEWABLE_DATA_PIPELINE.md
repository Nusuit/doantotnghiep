# Map Reviewable Data Pipeline

## 1) Apply database changes

Run migration:

```bash
cd backend
npx prisma migrate deploy
```

New schema parts:
- `contexts.source`, `contexts.source_ref` for external dataset identity
- `contexts.is_reviewed`, `contexts.review_count`, `contexts.avg_rating` for fast map rendering
- `context_reviews` table for user ratings/comments

## 2) Extract reviewable places from Vietnam OSM file

Input example:
- `docs/vietnam-260213.osm.pbf`

Run:

```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/extract-reviewable-osm.ps1 `
  -InputPbf docs/vietnam-260213.osm.pbf `
  -OutputDir backend/data/osm
```

Output:
- `backend/data/osm/vn-reviewable.geojson`

## 3) Dry-run import first

```bash
node backend/scripts/import-reviewable-geojson.mjs --file backend/data/osm/vn-reviewable.geojson --dry-run
```

## 4) Import into `contexts`

```bash
node backend/scripts/import-reviewable-geojson.mjs --file backend/data/osm/vn-reviewable.geojson
```

Optional test limit:

```bash
node backend/scripts/import-reviewable-geojson.mjs --file backend/data/osm/vn-reviewable.geojson --limit 1000
```

## 5) API usage

### List map contexts with filters

`GET /api/map/contexts`

Supported query params:
- `minLat`, `minLng`, `maxLat`, `maxLng`
- `category` or `categories` (comma-separated)
- `reviewStatus`: `all` | `reviewed` | `unreviewed`
- `minStars`
- `limit`

### Write/update review for one context

`POST /api/map/contexts/:id/reviews`

Body:

```json
{
  "stars": 4,
  "comment": "Đồ ăn ổn, giá hợp lý."
}
```

### List reviews for one context

`GET /api/map/contexts/:id/reviews?page=1&limit=20&sort=newest`
