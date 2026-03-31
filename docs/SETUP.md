# SETUP

---

## Requirements

- Docker + Docker Compose
- Flutter >= 3.10.4 (mobile only)

---

## Backend + Frontend

```bash
# First time — copy env template
cp backend/.env.example backend/.env
# Fill in backend/.env: JWT_SECRET, GOOGLE_CLIENT_ID/SECRET, EMAIL_*, MAPBOX_ACCESS_TOKEN

# Start everything (backend, worker, postgres, redis)
cd backend
docker-compose up -d

# If you changed the Dockerfile or dependencies
docker-compose up -d --build
```

Frontend dev server:

```bash
cd frontend
npm run dev     # http://localhost:2803
```

---

## Useful Docker commands

```bash
docker-compose up -d              # start all services in background
docker-compose up -d --build      # rebuild images then start
docker-compose down               # stop all services
docker-compose logs -f backend    # tail backend logs
docker-compose restart backend    # restart API after config change
```

---

## Mobile (Flutter)

```bash
cd mobile-app
flutter pub get
flutter run                   # default device
flutter run -d chrome         # web (requires Mapbox GL JS in web/index.html)
```

See [mobile-app/docs/MOBILE_SETUP.md](../mobile-app/docs/MOBILE_SETUP.md) for Mapbox token and OAuth deep-link setup.

---

## Environment variables

| File | Used by |
|---|---|
| `backend/.env` | Docker Compose + all backend services |
| `backend/.env.example` | Template |
| `frontend/.env.local` | Next.js (create manually if needed) |