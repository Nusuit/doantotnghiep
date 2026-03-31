<!-- THIS FILE IS READ-ONLY FOR AI AGENTS. Only the developer edits this. -->

# PROBLEMS

Known issues, bugs, and limitations. Checked = resolved. Unchecked = open.

---

## Backend

- [ ] Backend — Auth — `backend/.env.example` still contains Twilio env vars (`TWILIO_*`) but phone/SMS OTP is not implemented (returns 410 Gone). Remove Twilio vars from env example to avoid confusion.
- [ ] Backend — Docker — `docker-compose.yml` uses `command: npm run dev` override on the backend service, which runs `tsx watch` (dev mode). Production deploy requires removing the `command` override to use the Dockerfile `CMD`.
- [ ] Backend — Worker — KS decay cron job is not wired into the worker process. The scoring engine has `calculateKnowledgeScore()` but no scheduled job calls it.
- [ ] Backend — Suggestions — Accept/reject flow with KNOW-U earn not fully implemented.
- [ ] Backend — Comments — Comment endpoints (create, list, upvote) not yet built.
- [ ] Backend — Legacy routes — 22 `.js` files in `backend/routes/` are dead code (not registered in `app.ts`). Safe to delete but not yet removed.
- [ ] Backend — CI/CD — No CI/CD pipeline. Manual deploy only.

---

## Frontend

- [ ] Frontend — Articles — Article creation UI (category picker + context picker) not built.
- [ ] Frontend — Suggestions — Suggestion modal (submit + track status) not built.
- [ ] Frontend — KNOW-U — KNOW-U dashboard not built.
- [ ] Frontend — Wallet — Wallet connect + KNOW-G balance display not built.

---

## Mobile

- [ ] Mobile — Map — Map review publish flow not complete.
- [ ] Mobile — Auth — OAuth deep-link callback not wired. Requires URL scheme in `Info.plist` (iOS) and intent filter in `AndroidManifest.xml` (Android).
- [ ] Mobile — Map — Mapbox on Flutter Web requires adding Mapbox GL JS script to `mobile-app/web/index.html`.

---

## Cross-cutting

- [ ] All — End-to-end flow (write article → suggestion → accept → KV/KS update) not tested end-to-end.
- [ ] All — No push notifications implemented (out of scope for MVP).
