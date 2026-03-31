# LEGACY_ROUTES

## Overview

The `backend/routes/` directory contains **22 legacy JavaScript route files** that are **NOT registered** in `backend/src/app.ts`.

These files are dead code left over from an earlier Express architecture (plain JS, before the TypeScript rewrite). They should not be referenced for implementation.

**Active routes are exclusively in `backend/src/routes/`.**

---

## Legacy files (do not use)

```
backend/routes/
  admin.js
  ai.js
  articles.js
  auth.js
  auth-new.js
  auth-old.js
  auth-prisma.js
  chatbot.js          ← explicitly returns 410 Gone (chat storage removed)
  comments.js
  discovery.js
  geo.js
  holds.js
  map.js
  notes.js
  notifications.js
  places.js
  quests.js
  restaurants.js      ← large file (12KB+), superseded by Context model
  search.js
  suggestions.js
  users.js
  wallet.js
```

---

## Why they still exist

- Historical reference — they document features that were planned or partially built
- Some contain schema assumptions that differ from the current Prisma schema
- Deletion is safe but has been deferred pending final cleanup sprint

These files will be removed in a future cleanup. Do not add new `.js` routes here.
