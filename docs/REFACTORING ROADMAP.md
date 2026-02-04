# <a name="_lvo1rtod651o"></a>**REFACTORING ROADMAP**
## <a name="_z02jpe19tbet"></a>**1. Purpose**
This document defines a safe and controlled roadmap to refactor the system from a **Location-based model** to a **Context-based model**, without breaking existing philosophy, Value Model, or token logic.

This roadmap is intended for:

- Human developers
- AI coding agents
-----
## <a name="_hqh5ss281rjl"></a>**2. What Must NOT Change**
The following elements are design-locked and must remain untouched:

- Knowledge Value (KV) logic
- Knowledge Score (KS) logic
- Attribution & Incentive principles
- Token system (KNOW-U / KNOW-G)
- Off-chain / On-chain system boundary

This refactor is **structural and semantic only**.

-----
## <a name="_ssleola1918h"></a>**3. Conceptual Shift**
### <a name="_4upqg9xov2sw"></a>**Before**
- Location was treated as a special-case attribute
- Map was implicitly assumed as a primary discovery mechanism
### <a name="_ogge2wetj8sc"></a>**After**
- Context becomes the unified abstraction
- Location is redefined as PLACE Context
- Map becomes a discovery lens over PLACE Contexts
-----
## <a name="_i6nphcb753r"></a>**4. Data Model Refactor (Conceptual)**
### <a name="_4strslg6c31j"></a>**Step 1: Introduce Context**
- Create a unified Context concept
- Context types:
  - PLACE
  - ENTITY
  - TOPIC
### <a name="_dl05yukwd5t8"></a>**Step 2: Update Article Model**
- Enforce mandatory Category
- Enforce at least one Context link
- Allow multiple Contexts per Article
### <a name="_gy6m44fmguzs"></a>**Step 3: Deprecate Location Assumptions**
- Remove any logic assuming:
  - 1 Location = 1 Article
  - Article must be spatial
-----
## <a name="_887cr7sfd804"></a>**5. Backend Refactor**
### <a name="_80m6o2uxj3gn"></a>**Controllers**
- Introduce ContextController
- Update ArticleController to:
  - Require Category
  - Require Context IDs
### <a name="_hw90mldxtr2s"></a>**Services**
- ContextService:
  - Context creation (implicit via Article in MVP)
  - Context retrieval
### <a name="_eh04f75ycazl"></a>**Business Rules**
- Category defines valid Context types
- Map APIs operate only on PLACE Contexts
-----
## <a name="_pecnfa3lovpu"></a>**6. Frontend Refactor**
### <a name="_7ippuc5j47s6"></a>**Article Creation Flow**
- User selects Category
- System requests required Context type
- Context is selected or implicitly created
### <a name="_q5k0t1z3wlmr"></a>**Map**
- Fetch PLACE Contexts only
- Display markers based on Context
- Load Articles linked to Context
### <a name="_n58nw49r03q4"></a>**Feed**
- Remains Article-centric
- Independent from Map
-----
## <a name="_qf5izfad5gzt"></a>**7. Migration Strategy**
- Existing Location data → PLACE Context
- Backfill Context links for existing Articles
- Do NOT migrate KV / KS data
-----
## <a name="_usbk9s2mfdgg"></a>**8. Safeguards**
- No automatic Category reassignment
- No KV recalculation during refactor
- Feature flags recommended for rollout
-----
## <a name="_h8canjm7a21"></a>**9. Design Closure**
This roadmap ensures:

- Zero philosophy drift
- Minimal regression risk
- Future-proof discovery expansion

