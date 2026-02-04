# <a name="_76y0lbibj685"></a>**API CHECKLIST – CONTEXT-BASED DESIGN**
## <a name="_7yrsw2uw10bc"></a>**0. Design Preface (MANDATORY)**
All API rules and invariants in this document **must comply with**:

- Core Concepts
- UNIFIED\_SCHEMA\_SPEC
- Value Model
- Attribution & Incentives
- System Boundary

APIs must not encode assumptions that contradict the Context-based discovery model.

-----
## <a name="_998sh4nq9oep"></a>**1. Global Invariants**
- Article is the central object of all content APIs.
- Every Article MUST:
  - Have exactly one Category
  - Be linked to at least one Context
- Context is the discovery anchor, not the value owner.
- Knowledge Value (KV) is never modified directly by API calls.
-----
## <a name="_wc0bfwazoiaq"></a>**2. Context Rules**
### <a name="_jgflpi42kpow"></a>**Context Types**
- PLACE: spatial, has lat/lng, appears on Map
- ENTITY: non-spatial real-world entity
- TOPIC: abstract or conceptual anchor

Rules:

- Only PLACE Contexts are exposed to Map APIs.
- ENTITY and TOPIC Contexts are discoverable via Feed and Context pages.

Context creation (MVP):

- Contexts are created implicitly when Articles are created.
- No standalone Context creation API in MVP.
-----
## <a name="_khwih5ia5wtn"></a>**3. Article APIs**
### <a name="_9yojiz3ax5oj"></a>**POST /api/articles**
Requirements:

- Category is required
- At least one Context payload is required
- Context payload must match Category constraints

Forbidden assumptions:

- Article must be spatial
- Article equals Place
-----
### <a name="_d7gokxjvktmg"></a>**GET /api/articles/:id**
Returns:

- Article content
- Category
- Linked Contexts
-----
## <a name="_2tci7b6768ef"></a>**4. Context APIs**
### <a name="_diw82d4vznwc"></a>**GET /api/contexts/:id**
Returns:

- Context metadata
- Linked Articles
-----
## <a name="_hjkx28lzlomw"></a>**5. Map APIs**
### <a name="_5a698qxp3zbs"></a>**GET /api/map/contexts**
- Returns PLACE Contexts only
- Supports bounding box filters
### <a name="_k5755ufkerdw"></a>**GET /api/map/contexts/:id/articles**
- Returns Articles linked to a PLACE Context

Map APIs:

- Do not expose KV / KS
- Do not imply value ranking
-----
## <a name="_d9yx36kjwyai"></a>**6. Suggestion & Contribution APIs**
- Suggestions are requests, not value updates.
- Accepting a Suggestion may:
  - Update Article content
  - Add or modify Context links

KV / KS updates:

- Processed asynchronously by Worker
- Never executed inline in API request
-----
## <a name="_ay0cvo7n70m4"></a>**7. Forbidden API Patterns**
- No API may directly modify KV or KS
- No API may assume 1 Context = 1 Article
- No API may treat Map visibility as value signal
-----
## <a name="_39dijtam9otc"></a>**8. Design Closure**
This checklist ensures API design remains aligned with Context-based discovery and Value-first principles.

