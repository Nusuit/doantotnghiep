# TECH_STACK

Current technology stack (as implemented).

> **Correction:** An earlier version of this doc specified NestJS as the backend framework. The actual implementation uses plain **Express.js**.

---

## Summary

| Layer | Technology |
|---|---|
| Backend | Node.js 18+ + **Express.js** + TypeScript 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis + BullMQ |
| Frontend | Next.js 15 + React 19 + Tailwind CSS v4 |
| Mobile | Flutter 3.10+ (Dart) |
| Blockchain | Solana SPL token (KNOW-G, on-chain governance) |
| KNOW-U | Off-chain credit (stored in PostgreSQL) |
| Monorepo | npm workspaces + Turbo |

---

## Backend

- **Runtime:** Node.js >= 18
- **Framework:** Express.js 4 (not NestJS)
- **Language:** TypeScript 5, compiled to `dist/` via `tsc`
- **ORM:** Prisma 6 with PostgreSQL
- **Auth:** JWT (jose/jsonwebtoken), Google OAuth, bcrypt
- **Queue:** BullMQ backed by Redis
- **Validation:** Zod
- **Security:** Helmet, express-rate-limit, CSRF token, bcrypt

## Frontend

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, Radix UI primitives (shadcn pattern)
- **Styling:** Tailwind CSS v4, SASS, CSS Modules
- **Maps:** Mapbox GL 3, react-map-gl, Leaflet
- **3D:** Three.js + @react-three/fiber
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts, Chart.js

## Mobile

- **Framework:** Flutter 3 (Dart SDK ^3.10.4)
- **State:** Riverpod 3
- **HTTP:** Dio 5
- **Maps:** mapbox_maps_flutter
- **Auth storage:** flutter_secure_storage

## Infrastructure

- Docker Compose: 4 services (API, worker, postgres, redis)
- API exposed on host port `1002` (internal `4000`)
- PostgreSQL on host port `5433` (internal `5432`)
