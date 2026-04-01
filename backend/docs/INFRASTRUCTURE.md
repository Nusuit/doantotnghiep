# INFRASTRUCTURE

Docker Compose and runtime infrastructure for the KnowledgeShare backend.

---

## Docker Compose — 4 Services

| Service | Image | Port mapping | Role |
|---|---|---|---|
| `backend` | Dockerfile (Node 20 Alpine) | `1002:4000` | HTTP API (Express, port 4000 internal) |
| `worker` | Same Dockerfile | — | BullMQ background job worker |
| `db` | postgres:16-alpine | `5433:5432` | Primary PostgreSQL database |
| `redis` | redis:alpine | `6379:6379` | Queue + Cache |

**Volumes:** `postgres_data` (DB persistence), `redis_data` (Redis persistence)

**Run:**
```bash
cd backend
docker-compose up -d --build
```

**Note:** The `docker-compose.yml` currently overrides the backend and worker containers with `command: npm run dev` (tsx watch mode). This runs the TypeScript source directly without a production build. To switch to production mode, remove the `command` override and ensure `npm run build` succeeds first.

---

## Dockerfile Build

```
node:20-alpine
  → npm install
  → npx prisma generate
  → npm run build   (tsc → dist/)
  → CMD: npm run start  (node dist/index.js)
```

The production image runs `dist/index.js`. The worker container runs `npm run worker`.

---

## Service Dependencies

```
db (postgres) ──healthcheck──> backend
db (postgres) ──healthcheck──> worker
redis          ──started──────> worker
```

Both `backend` and `worker` wait for `db` to pass `pg_isready` before starting.

---

## Environment Variables (Docker Compose overrides)

```env
PORT=4000
DATABASE_URL=postgresql://postgres:123456@db:5432/knowledge_sharing?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
```

All other variables come from the `env_file: .env` in the backend folder.

---

## BullMQ Queue Architecture

```
HTTP Request (interaction / suggestion)
    │
    ▼
enqueueScoringJobs() ──→ Redis SETNX (debounce key, TTL 300s)
    │                         │
    │   Already debounced?     └── SKIP (within 5-min window)
    ▼
knowledge-queue (Redis / BullMQ)
    │
    ▼
Worker container (separate process)
    ├── recalc-article-scores
    ├── recalc-user-scores
    └── recalc-tier-pool
```

**Debounce keys:**
- `debounce:score:article:{articleId}` — TTL 300s
- `debounce:score:user:{userId}` — TTL 300s

Within a 5-minute window, the worker runs scoring exactly once per article/user regardless of how many interactions arrive.

**Job types:**

| Job | Trigger | Frequency | Updates |
|---|---|---|---|
| `recalc-article-scores` | Interaction/suggestion | On-demand + every 5 min | `articles.ranking_score`, `articles.tier` |
| `recalc-user-scores` | User interaction | On-demand + every 60 min | `users.ks_score`, `users.reputation_score` |
| `recalc-tier-pool` | Periodic | Every 10 min | Global tier rebalancing |

---

## Redis Use Cases

| Use Case | Key pattern | TTL |
|---|---|---|
| BullMQ queue storage | `bull:knowledge-queue:*` | Managed by BullMQ |
| Job debounce (article) | `debounce:score:article:{id}` | 300s |
| Job debounce (user) | `debounce:score:user:{id}` | 300s |
| User active status cache | `cache:user:status:{id}` | 300s |
| Auth /me response cache | `auth:me:{userId}` | 120s |

---

## Middleware Stack (request order)

```
requestContext()     → attach x-request-id (UUID)
express.json()       → parse body (1MB limit)
cors()               → origin whitelist from CORS_ORIGIN env
helmet()             → security headers
compression()        → gzip
cookieParser()       → parse cookies
apiRateLimiter       → 120 req/min/IP (all /api/*)
authRateLimiter      → 20 req/15min/IP (/api/auth/* only)
[Optional] authenticate()      → verify JWT (Bearer or cookie)
[Optional] requireActiveUser() → check accountStatus=ACTIVE (Redis-cached 5min)
[Optional] requireCsrf()       → CSRF token check (skipped for Bearer auth)
```

---

## Known Issues

| Issue | Status |
|---|---|
| `docker-compose.yml` uses `command: npm run dev` override — runs tsx watch instead of production build | Active, intentional for local dev |
| No health check on the `backend` service itself (only `db` has it) | Low priority |
