# TOKEN_AND_INCENTIVE_DESIGN

Dual-token system: KNOW-U (off-chain utility) + KNOW-G (on-chain governance).

---

## KNOW-U — Utility Credit (Off-chain)

Stored in PostgreSQL (`users.know_u_balance`). Not crypto, not tradeable on markets.

**KNOW-U is earned when:**
- KV of your article increases (via accepted suggestions, quality signals)
- Your suggestion is accepted by an article author
- Participating in knowledge events

**KNOW-U is burned (spent) when:**
- Creating a suggestion on an article (stake)
- Depositing on a place review (`POST /api/map/places/:id/deposits`)
- Including a deposit when publishing a review (`depositAmount`)
- Unlocking premium features (future)

**Anti-inflation rules:**
- No direct KNOW-U for views, upvotes, or comments
- Every earn must have a corresponding sink somewhere in the system
- The system must always have more sinks than sources to prevent inflation

---

## KNOW-G — Governance Token (On-chain, Solana)

SPL token on Solana Devnet. Represents long-term ownership of the knowledge ecosystem.

**KNOW-G is minted when:**
- Admin manually mints to top contributors (MVP)
- Conversion from accumulated KNOW-U (future)

**MVP limitations:**
- No DAO voting implemented
- No public swap / DEX listing
- No auto-mint trigger
- Admin-controlled only

**Future intent:** KNOW-G holders vote on platform governance (content policies, reward rates, feature prioritization).

---

## Economy invariants

1. Blockchain records ownership — the system decides value and power
2. KNOW-U cannot be manipulated by buying/selling
3. KNOW-G does not grant direct content control
4. Value flows from knowledge quality, not from token holdings
