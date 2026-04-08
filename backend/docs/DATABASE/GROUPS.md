# Database Architecture — Logical Groups

## Core Schema Breakdown
To maintain token efficiency, the project's schema is logically divided into 4 main groups. Deduce which group a feature belongs to before querying the Prisma schema.

### 1. Identity & Reputation (Auth/Profile)
- **Source**: `01_auth_users.sql`, `02_profile.sql`.
- **Tables**: `users`, `profiles`, `refresh_tokens`.
- **Logic**: Authentication, Tiering, KS (Knowledge Score) storage.

### 2. Social & Knowledge (Content/Interactions)
- **Source**: `03_content.sql`, `04_interactions.sql`.
- **Tables**: `articles`, `contexts`, `interactions`, `suggestions`.
- **Logic**: Content creation, KV (Knowledge Value) scoring, engagement signals.

### 3. Geospatial & Presence (Places/Map)
- **Source**: `05_places.sql`, `07_search_map_mobile_supabase.sql`.
- **Tables**: `places_context`, `spatial_index`, `geo_markers`.
- **Logic**: Lat/Lng coordinates, reverse geocoding, boundary data (GeoJSON).

### 4. System & Economy (Chat/Incentives)
- **Source**: `06_chatbot.sql`, `08_hcm_food_mock_seed.sql`.
- **Logic**: KNOW-U credits, KNOW-G governance, BullMQ scoring jobs.
