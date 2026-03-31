# IMPLEMENTATION_PLAN

## Current state (as of 2026-03-31)

The database refactor is complete. The current schema matches the design in `backend/docs/DATABASE.md`.

Completed work:
- Database schema refactored (removed restaurants, places, otp_verifications, context_reviews tables)
- Articles now use direct `context_id` FK (one-to-one with Context)
- Reviews are Articles with `type=REVIEW`
- KNOW-U wallet integrated (earn/spend flow)
- Auth: email+password, email OTP, Google OAuth
- Feed with KV-gated scoring
- Map with PLACE contexts
- Search with proximity ranking
- Mobile Flutter app scaffold (auth, map, explore, search, profile)
- Frontend Next.js app (landing, auth, feed, map, social, chat UI)

---

## Active work

- Prisma migration: `20260323110000_refactor_database_contract_v2` (in `backend/prisma/migrations/`)
- Branch: `refactor/infrastructure`

---

## Remaining for MVP launch

| Area | Task |
|---|---|
| Backend | Complete suggestion accept/reject flow with KNOW-U earn |
| Backend | Wire KS decay cron job in worker |
| Backend | Comments endpoints (create, list, upvote) |
| Frontend | Article creation UI (category + context picker) |
| Frontend | Suggestion modal (submit + track status) |
| Frontend | KNOW-U dashboard |
| Frontend | Wallet connect + KNOW-G balance display |
| Mobile | Complete map review publish flow |
| Mobile | Wire OAuth deep-link callback |
| Both | End-to-end test: write article → suggestion → accept → KV/KS update |

---

## Mobile-specific notes

- Mapbox on Flutter Web requires adding Mapbox GL JS script to `mobile-app/web/index.html`
- OAuth callback deep-link: iOS needs `Info.plist` URL scheme, Android needs intent filter in `AndroidManifest.xml`

---

## Infrastructure notes

- Docker Compose runs `npm run dev` (tsx watch) in containers — production mode requires removing the `command` override
- No CI/CD pipeline yet — manual deploy
