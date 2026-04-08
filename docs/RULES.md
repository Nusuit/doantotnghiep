# Development Rules — KnowledgeShare

## 1. Token Efficiency & Source Access
- **No Automatic Source Scanning**: Never run `grep` or `list_dir` on the entire source tree to find logic. 
- **Docs-First Research**: Start by reading the `.md` files in the parent or sibling directory of the target area.
- **Context-Limited Scan**: Only scan files starting from the location provided by the user. Follow imports/dependencies one by one.
- **Consult the CEO**: If documentation is missing or ambiguous, **STOP** and ask the user for clarification. Do not guess.

## 2. Circular Development Flow (The "FE-BE-DB" Loop)
1. **Frontend Scan (Context)**: Determine where the feature lives and identify shared components (dependencies).
2. **Backend Audit (Integrity)**: Check for existing APIs and Database schemas using **Logical Groups**.
3. **Drafting (Contract)**: Define the API Contract (Zod Request/Response) and DB Schema changes.
4. **Execution (Bottom-Up)**: 
   - `Database` (Migrations/Schema)
   - `Backend` (Service/Route)
   - `Frontend` (Syncing with the new API)
5. **Validation (Full-Stack)**: Ensure the UI perfectly reflects the DB state and doesn't break dependent features.

## 3. Layered Architecture
- **Layer 0: Database**: PostgreSQL + Prisma (Source of Truth).
- **Layer 1: Backend**: Express + TypeScript + BullMQ.
- **Layer 2: Frontend**: Next.js 15 + React 19.
- **Layer 3: 3rd Party**: Mapbox (Global GIS), Solana (On-chain Governance/Tokens).
  - *Note: External services are treated as first-class layers, integrated directly into the circular flow.*

## 4. Self-Documenting Mandate
- After completing any feature or architectural change, the agent **MUST** update the relevant `.md` files in `frontend/docs/FEATURES/` or `backend/docs/FEATURES/`.
- Major changes must be reflected in `docs/FEATURE_MAP.md`.
