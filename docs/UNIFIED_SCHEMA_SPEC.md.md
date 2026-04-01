# <a name="_93ptc8uycnup"></a>**UNIFIED SCHEMA SPECIFICATION**
## <a name="_cxgd3jg9mcno"></a>**1. Design Philosophy**
This document defines the **single source of truth** for data concepts in the Knowledge Sharing Platform.

Core principles:

- **Article is the central Knowledge Object** where Knowledge Value (KV) is generated.
- **Category defines the nature of knowledge**, not UI presentation.
- **Context defines discovery**, not ownership or value.
- **Map is a discovery lens**, not a value authority.

This document must remain consistent with:

- Core Concepts
- Value Model
- Attribution & Incentives
- System Boundary
-----
## <a name="_v33euggy4rsz"></a>**2. Core Objects**
### <a name="_jaxo65o3q2mt"></a>**2.1 Article**
**Definition**:\
Article is the atomic Knowledge Object representing a unit of knowledge that can be discovered, evaluated, and improved over time.

**Rules**:

- Every Article **must have exactly one Category**.
- Every Article **must be linked to at least one Context**.
- Article may link to multiple Contexts.

**Responsibilities**:

- Carries Knowledge Value (KV).
- Participates in Versioning and Suggestion workflows.
- Acts as the base unit for Attribution and Incentives.
-----
### <a name="_nzqxbtc98dhc"></a>**2.2 Category**
**Definition**:\
Category defines the intrinsic nature of knowledge contained in an Article.

Category is:

- Mandatory
- Stable
- Ontological (not cosmetic)

**MVP Categories (example)**:

- PLACE\_BASED\_KNOWLEDGE
- CULTURE\_HISTORY
- BOOK\_FILM
- SCIENCE\_KNOWLEDGE
- PRACTICAL\_GUIDE
- ABSTRACT\_TOPIC

Category determines:

- Valid Context types
- Discovery behavior
- Contribution constraints
-----
### <a name="_gp9fpmkr5gg5"></a>**2.3 Context**
**Definition**:\
Context is a discovery anchor that connects knowledge to the real world or to a navigable conceptual space.

Context answers:

- Where does this knowledge belong?
- In what space can users discover it?

Context does **not**:

- Own Knowledge Value
- Determine incentives
-----
## <a name="_eeztcw79hugw"></a>**3. Context Types**
### <a name="_ken1akc7n23h"></a>**3.1 PLACE Context**
- Represents a physical location
- Has geographic coordinates (lat/lng)
- Appears on Map

Examples:

- Restaurant
- Historical site
- Cultural space
-----
### <a name="_y0oaly420ln1"></a>**3.2 ENTITY Context**
- Represents non-spatial real-world entities
- Does not appear on Map

Examples:

- Book
- Film
- Person
- Organization
-----
### <a name="_2w4atk8n9wki"></a>**3.3 TOPIC Context**
- Represents abstract or conceptual anchors
- Does not appear on Map

Examples:

- Philosophy school
- Spiritual concept
- Scientific field
-----
## <a name="_ymmss5hfp3ap"></a>**4. Article – Context Relationship**
- Article ↔ Context is **many-to-many**
- Article must link to **at least one Context**
- Context may link to multiple Articles

This design enables:

- Multi-dimensional discovery
- Contextual navigation
- Value creation via connection
-----
## <a name="_xgb8egex1pa6"></a>**5. Category Constraints**
Category defines which Context types are valid:

- PLACE\_BASED\_KNOWLEDGE → requires at least one PLACE Context
- BOOK\_FILM → requires ENTITY Context
- ABSTRACT\_TOPIC → requires TOPIC Context

Constraints are **design-level rules**, not strict database constraints in MVP.

-----
## <a name="_9o49hhigcfqs"></a>**6. Role of Map**
Map is a **discovery interface** over PLACE Contexts.

Map:

- Displays PLACE Contexts only
- Shows Articles linked to a PLACE
- Does not determine KV, KS, or incentives

Articles without PLACE Context:

- Do not appear on Map
- Remain fully functional in Feed and Context pages
-----
## <a name="_ycfv399qb4u2"></a>**7. Explicit Design Constraints**
- Knowledge Value is attached to Article, not Context.
- Context never generates KV directly.
- Category cannot be changed arbitrarily after publication.
- Map visibility does not imply higher value.
-----
## <a name="_ddxapt1mbffv"></a>**8. Design Closure**
This specification locks:

- Terminology
- Object relationships
- Discovery logic boundaries

Any future design must not contradict this document.

