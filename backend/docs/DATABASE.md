# DATABASE

> Source of truth: `backend/prisma/schema.prisma`
>
> ERD diagrams: [erd_overview.png](erd_overview.png) | [erd_detailed.png](erd_detailed.png)
>
> SQL supplements (triggers, extra indexes not in Prisma): `backend/prisma/sql_groups/01..04`

---

## Architecture overview

**Domain groups:**
- **Auth & Identity:** `users`, `user_security`, `user_profiles`, `refresh_tokens`
- **Content:** `articles`, `contexts`, `taxonomies`, `article_taxonomies`, `article_versions`
- **Social & Contribution:** `suggestions`, `comments`, `interactions`, `follows`, `notifications`
- **Personalization:** `collections`, `collection_items`
- **Economy:** `wallet_transactions`, `badges`, `user_badges`

**Core relationships:**
- `users` 1–1 `user_security` (cascade)
- `users` 1–1 `user_profiles` (cascade)
- `articles` n–1 `contexts` via `context_id` FK (RESTRICT) ← **one-to-one at the data level (each article has exactly one context)**
- `articles` n–n `taxonomies` via `article_taxonomies`
- `comments` self-reference via `parent_id` (1-level reply only, SQL trigger enforced)
- `users` n–n `users` via `follows`

> **Implementation note:** `Article.context_id` is a direct FK (strict one-to-one per article). An earlier design spec described a many-to-many Article↔Context junction table — that design was not implemented.

---

## Enums

| Enum | Values |
|---|---|
| `AccountStatus` | `ACTIVE`, `PENDING_VERIFY`, `SUSPENDED`, `BANNED` |
| `UserRole` | `USER`, `MODERATOR`, `ADMIN` |
| `ArticleType` | `POST`, `REVIEW` |
| `ArticleStatus` | `DRAFT`, `PUBLISHED`, `FLAGGED`, `HIDDEN` |
| `ArticleTier` | `TIER_0`, `TIER_1`, `TIER_2`, `TIER_3` |
| `KVScore` | `LOW`, `MEDIUM`, `HIGH` |
| `ContextType` | `PLACE`, `ENTITY`, `TOPIC` |
| `TaxonomyType` | `CATEGORY`, `TAG` |
| `InteractionType` | `VIEW`, `SHARE`, `SAVE`, `UPVOTE`, `DOWNVOTE`, `REPORT` |
| `SuggestionStatus` | `PENDING`, `ACCEPTED`, `REJECTED` |
| `WalletTransactionType` | `EARN`, `SPEND`, `DEPOSIT`, `WITHDRAW` |
| `Currency` | `POINTS`, `KNOW_U`, `KNOW_G` |

---

## Table reference

### Auth & Identity

**`users`** — Primary identity + aggregate scores
- PK: `id` (serial)
- Unique nullable: `email`, `phone_number`, `wallet_address`
- Scores/balances: `ks_score`, `reputation_score`, `know_u_balance`, `know_g_balance`
- Control: `account_status`, `role`
- SQL constraint (not in Prisma): at least one of email/phone/wallet must be non-null

**`user_security`** — Auth credentials, OTP state, lockout
- 1–1 FK to `users` (CASCADE)
- Fields: `password_hash`, `is_email_verified`, `is_phone_verified`, `login_attempts`, `locked_until`
- OTP fields: `email_otp`, `email_otp_attempts`, `email_otp_last_sent_at`, `email_otp_locked_until`
- Token fields: `email_verification_token`, `password_reset_token` (all stored as SHA-256 hashes)

**`user_profiles`** — Display info and preferences
- 1–1 FK to `users` (CASCADE)
- Fields: `display_name`, `avatar_url`, `bio`, `language`, `timezone`, notification flags

**`refresh_tokens`** — Session management
- FK to `users` (CASCADE)
- Fields: `token_hash` (unique), `revoked`, `expires_at`, `user_agent`, `ip_address`, `replaced_by`, `last_used_at`
- Key indexes: `revoked`, `expires_at`, `user_id`

---

### Content

**`contexts`** — Discovery anchors (PLACE / ENTITY / TOPIC)
- Fields: `type`, `name`, `latitude`, `longitude`, `category`, `address`, `description`
- Denormalized review stats: `avg_rating`, `is_reviewed`, `review_count`
- External import: `source`, `source_ref`
- SQL constraint: `PLACE` type requires lat/lng; non-PLACE requires null lat/lng
- Unique: `(latitude, longitude)`, `(source, source_ref)`

> Note: The `restaurants` route (`GET/POST /api/restaurants`) is a compatibility alias that queries `Context(type=PLACE)`. The `restaurants` table was removed from the schema; the route layer exists for backward compatibility.

**`articles`** — Core content object
- FK: `context_id → contexts` (RESTRICT — context must exist)
- FK: `author_id → users` (CASCADE)
- Fields: `slug` (unique), `title`, `content`, `type`, `status`, `tier`, `ranking_score`, `kv_score`, `is_evergreen`
- Counters: `view_count`, `save_count`, `upvote_count`
- SQL trigger: `type=REVIEW` articles must link to a `PLACE` context. Only one REVIEW per PLACE (SQL-enforced).
- Composite feed index: `(status, tier, ranking_score DESC)`

**`taxonomies`** — Categories and tags (hierarchical)
- Self FK: `parent_id → taxonomies` (SET NULL)
- Fields: `type` (CATEGORY/TAG), `name`, `slug` (unique)

**`article_taxonomies`** — Join table (n-n articles ↔ taxonomies)
- Composite PK: `(article_id, taxonomy_id)`

**`article_versions`** — Audit trail of content edits
- FK: `article_id`, `editor_id`
- Unique: `(article_id, version_number)`

---

### Social & Contribution

**`suggestions`** — User-proposed article edits
- FK: `author_id`, `article_id` (CASCADE)
- Fields: `content`, `comment`, `status` (PENDING/ACCEPTED/REJECTED)
- API: 1 suggestion per user per article per 24 hours

**`comments`** — Article comments with 1-level threading
- FK: `user_id`, `article_id` (CASCADE); `parent_id` self-ref (SET NULL)
- Fields: `content`, `upvote_count`, `deleted_at`
- SQL trigger: max 1 level of reply depth

**`interactions`** — User engagement events
- FK: `user_id`, `article_id` (CASCADE)
- Fields: `type`, `time_spent_ms`, `scroll_depth_percent`, `location_lat`, `location_long`
- SQL partial unique index: one interaction per `(user_id, article_id, type)` for non-VIEW types
- VIEW events are rate-limited in code (1 per 30 min per user/article)

**`notifications`** — In-app notifications
- FK: `user_id` (CASCADE)
- Fields: `type`, `content`, `is_read`, `ref_id`

**`follows`** — User follow graph
- Composite PK: `(following_id, follower_id)`

---

### Personalization

**`collections`** — User-created bookmarks/series
- FK: `user_id` (CASCADE)
- Fields: `title`, `is_public`, `description`
- "Favorite Locations" collection is created implicitly by `POST /world/import`

**`collection_items`** — Items in a collection
- FK: `collection_id` (CASCADE), `article_id` (CASCADE), `context_id` nullable (SET NULL)
- Fields: `order`, `notes`, `added_at`

---

### Economy

**`wallet_transactions`** — Ledger of KNOW-U / KNOW-G / POINTS movements
- FK: `user_id` (CASCADE)
- Fields: `type` (EARN/SPEND/DEPOSIT/WITHDRAW), `currency`, `amount`, `reason_code`, `ref_id`

**`badges`** + **`user_badges`** — Achievement system
- `badges`: `name`, `description`, `icon_url`, `criteria`
- `user_badges`: composite PK `(badge_id, user_id)`, `awarded_at`

---

## Key design decisions

| Decision | Rationale |
|---|---|
| Context as discovery anchor | Replaces location-only model. PLACE/ENTITY/TOPIC allow non-spatial content |
| `context_id` direct FK on Article | Simplest implementation for MVP; many-to-many deferred |
| Reviews as Articles (type=REVIEW) | Avoids a separate `context_reviews` table; reviews gain all article features (versions, suggestions, interactions) |
| Stars field removed | Simplified for MVP; `avg_rating` on Context is now always 0.0 and `review_count` is the signal |
| Denormalized counters | `view_count`, `save_count`, `upvote_count` on Article are updated inline for fast reads; `ranking_score` is updated async by the worker |
| Worker async scoring | `ranking_score` and `ks_score` are never updated synchronously in API handlers |
