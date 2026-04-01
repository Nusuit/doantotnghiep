# VALUE_MODEL

How value is created, measured, and attributed in KnowledgeShare.

---

## Value hierarchy

Value does not come from actions — it comes from helping others discover, access, and use knowledge better.

Priority order:
1. **Helping others discover knowledge** (connecting to the right context, right feed) ← highest
2. **Creating new knowledge** (new articles, reviews)
3. **Improving existing knowledge** (accepted suggestions)

---

## KV — Knowledge Value

Attached to each Article. Reflects quality and community acceptance.

- `LOW` — new/unverified, hard visibility cap
- `MEDIUM` — community-acknowledged, soft cap
- `HIGH` — high quality, uncapped visibility

KV increases when: suggestion accepted, positive interactions, community recognition.
KV decreases when: repeated rejections, flagging.

KV is **never set by direct API call** — always async via the worker.

---

## KS — Knowledge Score

Per-user reputation. Measures total attributed KV over time, with decay.

- KS determines user tier/level
- KS determines premium review eligibility (200+ net upvotes, <10% downvote ratio, 5+ reviews)
- Decays at 0.995× per cycle to prevent old users from dominating permanently

---

## Attribution

When an Article's KV increases, the contribution is attributed to:
- The **author** of the article
- **Suggesters** whose edits were accepted (proportional)

Attribution drives KS updates and KNOW-U earnings. It is processed by the worker, never inline.

---

## Anti-patterns (forbidden)

- Do not reward actions directly (views, upvotes, comments do not earn KNOW-U directly)
- Do not allow direct KV/KS modification via API
- Do not use map visibility as a value signal
- Do not reward spam or empty interactions
