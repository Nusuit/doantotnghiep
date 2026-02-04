<a name="_w9joyq1jcxis"></a>Summary

|**Layer**|**Tech**|
| :-: | :-: |
|BE|NestJS + Prisma + PostgreSQL|
|FE|Next.js + Tailwind + shadcn|
|Worker|Node.js + BullMQ|
|Cache|Redis|
|Token|Solana SPL (KNOW-G)|
|Utility|KNOW-U off-chain|
|Repo|Monorepo + pnpm|

<a name="_zfel7r5xj98k"></a>Backend
# <a name="_9jg1gj9enys5"></a>**🟦 A. BACKEND (CORE SYSTEM)**
## <a name="_mo6j3jyzu2s2"></a>**1️⃣ Runtime & Framework**
### <a name="_z6d6i1qeyj3l"></a>**✅ Node.js + TypeScript**
- Dễ tích hợp worker, blockchain
- Ecosystem mạnh
### <a name="_c1dxsf6nfgtq"></a>**✅ Framework: NestJS**
**Vì sao chọn NestJS:**

- Structure rõ (Controller / Service / Module)
- Phù hợp hệ thống nhiều domain (Article, KV, Token)
- Dễ scale từ MVP → production

❌ Không dùng Express thuần → dễ loạn khi phình

-----
## <a name="_bktgcz3nadtk"></a>**2️⃣ Database**
### <a name="_1bfvt7y346es"></a>**✅ PostgreSQL**
- Quan hệ rõ (Article – Suggestion – KV – KS)
- Transaction tốt (rất quan trọng cho KV/KS)
### <a name="_ut996icvdr0t"></a>**✅ ORM: Prisma**
- Type-safe
- Migration rõ ràng
- Rất hợp với NestJS
-----
## <a name="_gnbqck84m9hw"></a>**3️⃣ Cache & Queue**
### <a name="_tix6alh8kxz5"></a>**✅ Redis**
- Cache feed
- Cache KV / KS tạm
- Rate limit
### <a name="_fyr3v8b6q6vq"></a>**✅ BullMQ**
- Xử lý:
  - Suggestion accept
  - KV update
  - KS recalculation
- Tránh block request
-----
## <a name="_5tviv5bgnhcp"></a>**4️⃣ Auth & Security**
### <a name="_e1lvo6hq9bz2"></a>**✅ JWT (Access + Refresh)**
- MVP đủ dùng
- Sau này nâng cấp OAuth
### <a name="_dsgzae5peawa"></a>**✅ RBAC đơn giản**
- User
- Admin
-----
## <a name="_z05302siylj0"></a>**5️⃣ API Design**
### <a name="_m6ptt13wkqu1"></a>**✅ REST API (MVP)**
- Dễ debug
- Dễ test
- FE dễ dùng

❌ GraphQL để V2 (overkill cho MVP)

-----
## <a name="_6juxdsb0j3gt"></a>**6️⃣ Observability (MVP level)**
- Winston / Pino (log)
- Basic error handling
- No tracing phức tạp

<a name="_sv3oxljaupiv"></a>Frontend
# <a name="_bkz3nmypfyyz"></a>**🟩 B. FRONTEND (USER EXPERIENCE)**
## <a name="_1u1elrz0y0q6"></a>**1️⃣ Framework**
### <a name="_3v0mshmag5sy"></a>**✅ Next.js (App Router) + TypeScript**
- SEO tốt (Article)
- SSR cho feed
- Routing rõ
-----
## <a name="_6kvrw3rjvq4j"></a>**2️⃣ UI / Styling**
### <a name="_of4mvmrf6o4b"></a>**✅ TailwindCSS**
- Nhanh
- Không bị khóa design system
### <a name="_vvpkrc3vky2"></a>**✅ shadcn/ui**
- Component đẹp, chuẩn
- Không phụ thuộc vendor
-----
## <a name="_czfb4ebmzpxu"></a>**3️⃣ State & Data Fetching**
### <a name="_r0rtc73wsjac"></a>**✅ TanStack Query (React Query)**
- Cache API
- Sync state tốt
- Xử lý loading / error sạch
### <a name="_2lqny58a2vdk"></a>**✅ Zustand (nhẹ)**
- Auth state
- Wallet state
-----
## <a name="_ihlx3zkbq4q1"></a>**4️⃣ Form & Editor**
### <a name="_at7jddvayuc5"></a>**✅ React Hook Form**
- Form Article
- Suggestion form
### <a name="_vtrzi7otw17"></a>**✅ Editor (MVP)**
- TipTap hoặc simple Markdown editor

❌ Không WYSIWYG phức tạp

-----
## <a name="_dg554lhlcz10"></a>**5️⃣ Wallet Integration**
### <a name="_kbubk786g5bv"></a>**✅ Solana Wallet Adapter**
- Phantom
- Backpack

MVP:

- connect
- show balance KNOW-G
-----
## <a name="_1g5o309g6e2r"></a>**6️⃣ Auth FE**
- JWT via httpOnly cookie
- Protected routes

<a name="_w4y24cmrb0lt"></a>Worker
# <a name="_fibpd6a9b8qb"></a>**🟨 C. WORKER / BACKGROUND / BLOCKCHAIN**
## <a name="_esnykn6tef46"></a>**1️⃣ Worker Runtime**
### <a name="_ia6btfx4bdc8"></a>**✅ Node.js (shared TS code)**
- Dùng chung logic với BE
- Không duplicate business rule
-----
## <a name="_r4u1wabe5t47"></a>**2️⃣ Job System**
### <a name="_czxu13bo92rn"></a>**✅ BullMQ Worker**
Xử lý:

- KV recalculation
- KS decay
- KNOW-U mint/burn
- Event reward
-----
## <a name="_k27scxjppa43"></a>**3️⃣ Blockchain (Solana)**
### <a name="_wz04fssoyv3"></a>**✅ Solana SPL Token**
- KNOW-G là SPL token
### <a name="_kr1hipfzhh5x"></a>**✅ Web3.js / @solana/web3.js**
- Mint
- Burn
- Transfer
- Balance check

❌ Anchor để V2\
` `(MVP chưa cần program phức tạp)

-----
## <a name="_wnw0bvfa1o7m"></a>**4️⃣ KNOW-U System (Off-chain)**
- PostgreSQL ledger table
- Transaction-based (earn / burn)
- Worker đảm nhiệm logic
-----
## <a name="_wkxwesvutorw"></a>**5️⃣ Conversion KNOW-U ↔ KNOW-G**
- Worker validate:
  - KS threshold
  - epoch limit
- Trigger:
  - mint KNOW-G
  - burn KNOW-U
- Ghi log đầy đủ
-----
# <a name="_wlq86656afk"></a>**🧰 D. DEVOPS & TOOLING (MVP)**
## <a name="_yeuhjt9stjm4"></a>**1️⃣ Repo & Workflow**
- Monorepo
  - apps/backend
  - apps/frontend
  - apps/worker
- pnpm workspace
-----
## <a name="_tceujzd2yyr5"></a>**2️⃣ Env & Config**
- dotenv
- Zod validate env
-----
## <a name="_jz409ledyfso"></a>**3️⃣ Local Dev**
- Docker Compose
  - Postgres
  - Redis
- Solana devnet
-----
## <a name="_a6r2ufwzrq3z"></a>**4️⃣ CI/CD (đơn giản)**
- GitHub Actions
  - lint
  - test
  - build
-----
# <a name="_xz0j2fm7sxol"></a>**🚫 CỐ TÌNH KHÔNG DÙNG Ở MVP**
- GraphQL
- Microservices
- Kubernetes
- Full DAO
- AI moderation
- Realtime socket phức tạp

👉 **Không dùng ≠ không biết**, mà là **đúng thời điểm**

