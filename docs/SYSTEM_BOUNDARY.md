# SYSTEM_BOUNDARY

What is handled where in the KnowledgeShare system.

---

## Three-zone model (Web2.5)

```
┌─────────────────────────────────────────┐
│  OFF-CHAIN (PostgreSQL + Redis)          │
│  Articles, KV, KS, KNOW-U, user data    │
│  → Fast, mutable, Web2 UX              │
└─────────────────┬───────────────────────┘
                  │ conversion (admin-controlled in MVP)
                  ▼
┌─────────────────────────────────────────┐
│  ON-CHAIN (Solana)                      │
│  KNOW-G token (SPL), wallet addresses  │
│  → Immutable ownership record          │
└─────────────────────────────────────────┘
```

**Principle:** Blockchain records ownership. The system determines value and power.

Content quality, reputation, and daily activity stay off-chain for UX performance. Long-term ownership and governance go on-chain.

---

## System actors

| Actor | Boundary | Auth method |
|---|---|---|
| Web browser (Next.js) | HTTP to backend API `:1002` | JWT cookie + CSRF |
| Mobile app (Flutter) | HTTP to backend API `:1002` | JWT Bearer header |
| Backend worker | Internal — reads DB, writes DB | No HTTP — direct Prisma |
| Solana network | On-chain SPL token (KNOW-G only) | Wallet signature (tweetnacl) |
| Google OAuth | External identity provider | OAuth2 code flow |
| Mapbox | External tile/map service | Public token |

---

## Off-chain boundary

Everything stored in PostgreSQL:
- User identity, profiles, credentials
- Articles, contexts, taxonomies
- KV scores, KS scores, KNOW-U balances
- Interactions, suggestions, comments
- Wallet transactions (KNOW-U ledger)

---

## On-chain boundary

Only KNOW-G token operations touch the blockchain:
- Wallet address stored in `users.wallet_address`
- KNOW-G balance mirrored in `users.know_g_balance` (off-chain cache)
- Solana wallet connection uses tweetnacl signature verification

---

## Intentionally not on-chain (MVP)

- KV scores
- KS scores
- Article content
- Reviews and suggestions
- KNOW-U transactions
- DAO voting (future)
