# MVP_SCOPE

What is and is not in the MVP.

---

## MVP goal (one sentence)

Validate that users will share quality knowledge, and that the community can fairly evaluate, recognize, and reward contributions.

## MVP principles

1. **Article is central** — all features orbit around articles
2. **KV & KS must work**, even if simplified
3. **KNOW-U must have both earn and burn** (no free credits)
4. **KNOW-G exists symbolically** (no full DAO yet)

---

## In scope

**Auth:** Email + password, email OTP verification, Google OAuth

**Articles:**
- Create, read, list (feed)
- type: POST or REVIEW
- Requires category + context

**Contexts:** PLACE / ENTITY / TOPIC (created implicitly via article creation)

**Feed:** Personalized feed with KV-gated ranking, cursor pagination

**Map:** PLACE contexts visible on map, bbox filter, create place, publish review

**Suggestions:** Submit edit suggestion (1/article/24h), stake KNOW-U

**Interactions:** View, save, upvote, downvote, report, share

**Comments:** Create, list, upvote (1-level threading)

**Leaderboard:** Top users by KS

**KNOW-U:** Earn from accepted contributions, burn on suggestions + deposits

**KNOW-G:** Solana wallet connect, balance display, admin manual mint (Devnet only)

**Search:** Full-text search (places + articles) with proximity ranking

---

## Out of scope (MVP)

- Phone/SMS auth (removed — too costly)
- DAO governance / voting
- KNOW-G/KNOW-U swap or DEX
- AI-powered features
- Admin dashboard (beyond basic role)
- Push notifications
- Public events / voucher system (backend stubs exist but no UI)
- Article versioning UI
