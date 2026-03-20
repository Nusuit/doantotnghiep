# <a name="_th8k5zoirjdk"></a>**DATABASE DESIGN – CONTEXT-BASED REFACTOR (CONTENT DOMAIN ONLY)**
## <a name="_oghba0bp3gyf"></a>**1. Scope of This Refactor**
This document refactors the **Content & Collaboration domain** to align with the Context-based design defined in:

- UNIFIED\_SCHEMA\_SPEC
- REFACTORING\_ROADMAP

Out of scope:

- Ledger / Double-entry accounting
- KV / KS computation
- Token (KNOW-U / KNOW-G)
-----
## <a name="_hovy21z3h6rh"></a>**2. Conceptual Shift**
### <a name="_rmchxkfodxmv"></a>**Before**
- Location treated as implicit or hard-coded attribute
- Spatial assumptions baked into Article logic
### <a name="_4cvbnn7ssojs"></a>**After**
- Introduce Context as a unified abstraction
- Location becomes PLACE-type Context
- Articles are no longer assumed to be spatial
-----
## <a name="_qh4o4umjpnno"></a>**3. Core Tables (Conceptual)**
### <a name="_v5wyggpkftpx"></a>**3.1 contexts**
Represents discovery anchors.

Fields (conceptual):

- id
- type (PLACE | ENTITY | TOPIC)
- name
- description
- lat (nullable)
- lng (nullable)
- metadata (json)

Rules:

- lat/lng only allowed when type = PLACE
- Context does not carry KV or incentives
-----
### <a name="_deibitnq49ta"></a>**3.2 articles (updated)**
Add or enforce:

- category (ENUM, NOT NULL)
- status / visibility unchanged

Remove assumptions:

- Article does NOT require spatial fields
-----
### <a name="_jjz6m9i9n9wu"></a>**3.3 article\_contexts (junction)**
Many-to-many relationship between Articles and Contexts.

Fields:

- article\_id
- context\_id

Rules:

- Every Article must have ≥1 Context
- Context may link to multiple Articles
-----
## <a name="_m161yumh4lj2"></a>**4. Versioning & Suggestions (No Structural Change)**
- article\_versions unchanged
- suggestions unchanged

Note:\
Suggestion acceptance may create new Context links (Connection Contribution).

-----
## <a name="_xurpjdglgaeb"></a>**5. Migration Strategy**
1. Existing location data → create PLACE Contexts
1. Backfill article\_contexts
1. Preserve article IDs and KV/KS references
-----
## <a name="_8fo86fwtii55"></a>**6. Design Safeguards**
- No automatic category reassignment
- No KV recalculation during migration
- Context creation remains implicit via Article (MVP)
-----
## <a name="_vgj5a3bd0o7x"></a>**7. Design Closure**
This refactor aligns database design with Context-based discovery without impacting value logic.

