# CORE_CONCEPTS

Key concepts and terminology for KnowledgeShare.

---

## Article

The central object. An Article is a piece of knowledge created by a User, linked to exactly one **Context** and one **Category**.

Types: `POST` (general knowledge), `REVIEW` (place review — must link to a PLACE context).

---

## Context

The discovery anchor for an Article. Three types:

| Type | Description | On Map? |
|---|---|---|
| `PLACE` | Physical location (lat/lng required) | Yes |
| `ENTITY` | Non-spatial real-world entity (book, film, org) | No |
| `TOPIC` | Abstract concept | No |

Contexts are created implicitly when Articles are created. No standalone context creation in MVP.

---

## KV — Knowledge Value

A quality signal attached to each Article. Set by the scoring worker based on community signals.

| Level | Meaning |
|---|---|
| `LOW` | Unverified or low-engagement content. Hard cap on feed visibility. |
| `MEDIUM` | Community-accepted content. Soft cap. |
| `HIGH` | High-quality, high-engagement content. Uncapped. |

KV is **never modified directly by API calls** — always updated async by the worker.

---

## KS — Knowledge Score

Per-user reputation. Sum of KV attributed to the user's contributions, with time decay.

Formula: `newKS = (currentKS × 0.995) + log10(1 + newContributionPoints)`

- Decay prevents old users from dominating permanently
- Logarithmic growth prevents inflation from spam
- KS determines user level/tier

---

## KNOW-U — Utility Credit (Off-chain)

Internal off-chain credit representing ongoing participation. Not a crypto token, not tradeable.

**Earned when:** KV increases, suggestion accepted, event participation.

**Spent (burned) when:** creating a suggestion, depositing on a place review, accessing premium features.

**Rule:** Must always have a sink. No free KNOW-U.

---

## KNOW-G — Governance Token (On-chain)

Solana SPL token representing long-term ownership and governance rights.

**Minted to:** top contributors manually (MVP: admin-controlled).

**Not yet implemented:** DAO voting, swap, public mint.

---

## Actors

| Actor | Can do |
|---|---|
| Guest | Read public feed, browse map |
| User | Create articles, suggest edits, earn KV/KS/KNOW-U |
| Admin | Moderate, mint KNOW-G, manage events |

---

## Contribution Flow (MVP end-to-end)

```
User writes Article
  → Other user submits Suggestion (stakes KNOW-U)
    → Author accepts
      → Article KV ↑
        → Author KS ↑
          → KNOW-U minted to suggester
```
