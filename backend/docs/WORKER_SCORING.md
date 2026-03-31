# WORKER_SCORING

Background job processing and scoring/ranking logic for the KnowledgeShare backend.

---

## Worker Process

The worker runs as a **separate process** — it never shares the same Node.js process as the API server.

```bash
npm run worker          # tsx watch src/worker.ts
```

In Docker Compose, it is the `worker` service in `docker-compose.yml`. Both the API (`backend` service) and `worker` service share the same Docker image but run different commands.

**Key files:**
- `src/worker.ts` — worker entry point
- `src/modules/queue.ts` — BullMQ queue and job definitions
- `src/worker/` — individual job handler modules

---

## BullMQ Queue

The queue connects to the same Redis instance as the API server.

**Redis connection:** Uses `REDIS_HOST` + `REDIS_PORT` env vars (or `REDIS_URL`).

**Enqueue jobs from the API:**
```ts
import { enqueueScoringJobs } from "./modules/queue";

// Called after interactions or suggestions are recorded
await enqueueScoringJobs({ articleId, userId });
```

Job types defined in `src/modules/queue.ts`:
- Article scoring (recalculate `rankingScore` for an article)
- User KS score update (recalculate `ksScore` for a user)

---

## Scoring Engine — `src/domain/scoring.engine.ts`

Pure TypeScript class, no I/O. Used by the worker and can be unit-tested directly.

### Feed Score — `ScoringEngine.calculateFeedScore(article, userContext)`

Calculates the `rankingScore` stored on each `Article`.

**Formula:**
```
feedScore = (gatedScore × boost) / (ageHours + 2)^gravity
```

**Components:**
| Component | Detail |
|---|---|
| Discovery Score | `tierBase + log10(1 + rawSignal) × 20` where `rawSignal = upvotes×1 + saves×2 + suggestions×5` |
| Tier base | TIER_0=10, TIER_1=20, TIER_2=40, TIER_3=80 |
| KV Gate | LOW → hard cap at 60, MEDIUM → soft cap at 120, HIGH → uncapped |
| Boost | Follower: ×1.2, Context match: ×1.3 |
| Gravity | Default 1.8; evergreen HIGH-KV articles get 0.5 (age-resistant) |

**Design principles:**
- Logarithmic signal prevents "rich get richer" virality domination
- KV acts as a quality gate, not a booster
- Freshness decays via gravity denominator

---

### Knowledge Score — `ScoringEngine.calculateKnowledgeScore(currentKS, newContributionPoints, decayFactor?)`

Recalculates a user's `ksScore` (Knowledge Score / reputation).

**Formula:**
```
newKS = (currentKS × decayFactor) + log10(1 + newContributionPoints)
```

| Parameter | Default | Effect |
|---|---|---|
| `decayFactor` | 0.995 | Gradual decay if inactive — prevents old users from dominating forever |
| Growth | logarithmic | Diminishing returns on new contributions |

---

## Scoring Service — `src/services/scoring.service.ts`

Orchestrates DB reads, calls `ScoringEngine`, and writes results back to Prisma. Called by job handlers in `src/worker/`.

---

## Leaderboard Service — `src/services/leaderboard.service.ts`

Queries users ordered by `ksScore DESC`. Used by `GET /api/users/leaderboard`.

Leaderboard data may be cached in Redis (check service implementation for TTL details).

---

## KNOW-U Scoring (Wallet)

KNOW-U balance changes happen directly in the API routes (not via the worker):
- `POST /api/map/places/:id/reviews/publish` — SPEND on deposit
- `POST /api/map/places/:id/deposits` — SPEND on place deposit

All balance changes are recorded as `WalletTransaction` rows with a `reasonCode`.

Worker is responsible for **EARN** transactions when contributions are accepted (suggestions, accepted reviews, etc.) — see `src/worker/` job handlers.
