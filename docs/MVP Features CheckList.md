<a name="_p472zqpnl9ec"></a>MVP Features CheckList

Checklist này trả lời câu hỏi:\
` `**“MVP của hệ thống này CẦN CÓ NHỮNG GÌ để chạy được end-to-end?”**

-----
## <a name="_yzus9kqsagtf"></a>**1️⃣ User & Identity (MVP)**
- Guest xem được feed bài viết
- Đăng ký / đăng nhập User
- User profile cơ bản
  - Hiển thị KS
  - Hiển thị Level
  - Hiển thị lịch sử đóng góp
- (MVP) Chưa cần social graph / follow
-----
## <a name="_9fd0b0h2zo7x"></a>**2️⃣ Article (Knowledge Object – LÕI)**
- Tạo Article
  - Title
  - Content
  - Context / Location (ai – cái gì – ở đâu)
  - Category
- Xem Article
- List Article (feed đơn giản)
- Article versioning (tối thiểu)
- Flag / report Article (manual xử lý)

👉 **Nếu phần này chưa chạy → MVP coi như FAIL**

-----
## <a name="_8d7vik6ldjip"></a>**3️⃣ Comment (Signal – không sinh KV trực tiếp)**
- Comment vào Article
- Upvote Comment
- Đếm số comment trùng ý (signal)
- Hiển thị comment nổi bật

❌ Không cần sentiment AI\
` `❌ Không cần auto-summary

-----
## <a name="_p5d64dvuohdg"></a>**4️⃣ Suggestion & Edit (Contribution Core)**
- Tạo Suggestion (đặt cọc KNOW-U)
- Vote cho Suggestion
- Accept / Reject Suggestion
- Apply Suggestion → tạo version mới
- Rollback (manual – admin)

👉 Đây là **linh hồn “Wikipedia-style” của hệ thống**

-----
## <a name="_89tydimaq3qe"></a>**5️⃣ KV (Knowledge Value) — MVP Logic**
- KV gắn với Article
- KV có 3 mức (low / mid / high)
- KV tăng khi:
  - Suggestion được accept
  - Vote tích cực đủ ngưỡng
- KV giảm khi:
  - Bị reject nhiều
  - Bị flag
-----
## <a name="_42m9mzf1s5g2"></a>**6️⃣ KS (Knowledge Score)**
- KS gắn với User
- KS = tổng KV được attribution
- KS decay nhẹ theo thời gian (cron / worker)
- Level auto-update từ KS
-----
## <a name="_611jefswvu13"></a>**7️⃣ KNOW-U (OFF-CHAIN – BẮT BUỘC)**
### <a name="_9vztpz2mzg4f"></a>**Sinh KNOW-U**
- Khi KV tăng
- Khi đóng góp được accept
- Khi tham gia event
### <a name="_91pli1pwpxt5"></a>**Tiêu KNOW-U (sink)**
- Tạo Suggestion
- Tham gia event
- Đổi voucher (manual)

👉 **Nếu KNOW-U không có sink → MVP coi như SAI THIẾT KẾ**

-----
## <a name="_xh3h4420z57x"></a>**8️⃣ Event & Voucher (MVP đơn giản)**
- Admin tạo Event
- Invite user theo KS
- User dùng KNOW-U để tham gia
- Admin xác nhận tham gia
- Đổi KNOW-U → voucher (manual)

❌ Chưa cần partner API\
` `❌ Chưa cần marketplace

-----
## <a name="_6pfubcz6f3y0"></a>**9️⃣ KNOW-G (ON-CHAIN – MVP SYMBOLIC)**
- Deploy KNOW-G SPL token (Devnet)
- Mint KNOW-G cho top contributor (manual)
- User connect wallet
- Hiển thị KNOW-G balance

❌ Chưa DAO\
` `❌ Chưa swap\
` `❌ Chưa voting

-----
## <a name="_ihqd1l8wgvj8"></a>**10️⃣ MVP END-TO-END FLOW (CHECK)**
- User viết Article
- User khác tạo Suggestion
- Suggestion được accept
- KV tăng
- KS tăng
- KNOW-U sinh
- KNOW-U bị tiêu (Suggestion / Event)
- (Optional) User nhận KNOW-G

👉 **Chạy được flow này = MVP THÀNH CÔNG**


<a name="_bbl0g1w9xqa5"></a>Backend CheckList
## <a name="_odcjmgy9oz7g"></a>**BACKEND (CORE LOGIC & DATA)**
**BE là “bộ não” của hệ thống**\
` `Nếu BE sai → token, KV, KS đều sai

-----
### <a name="_n1suid126liq"></a>**1️⃣ Auth & User**
- User register / login
- Guest access (read-only)
- User profile
  - KS
  - Level
  - KNOW-U balance
- Basic role (User / Admin)
-----
### <a name="_1wopwoy9dl29"></a>**2️⃣ Knowledge Objects (Article)**
- Create Article
- Update Article (internal)
- Get Article detail
- List Article (feed – basic sort)
- Article versioning (simple)
- Flag / report Article
-----
### <a name="_xmfadu616x9r"></a>**3️⃣ Comment (Signal layer)**
- Create Comment
- List Comment theo Article
- Upvote Comment
- Count similar comments (simple heuristic)

❌ Không NLP\
` `❌ Không sentiment

-----
### <a name="_5k7i4i7iwaac"></a>**4️⃣ Contribution Objects**
#### <a name="_o6p1krr8a3qt"></a>**Suggestion**
- Create Suggestion (consume KNOW-U)
- Vote Suggestion
- Accept Suggestion
- Reject Suggestion
- Apply Suggestion → new Article version
#### <a name="_bku10i70r4v9"></a>**Connection**
- Assign Category
- Assign Context / Location
-----
### <a name="_b9ou6fj7pqak"></a>**5️⃣ Value Engine (KV / KS)**
#### <a name="_wq8kajlpkyqe"></a>**KV**
- KV state (low / mid / high)
- KV increase logic
- KV decrease logic
#### <a name="_pus8b5tilfy7"></a>**KS**
- Attribute KV → User
- KS update
- KS decay config (time-based)
-----
### <a name="_l14xmmcig5g5"></a>**6️⃣ KNOW-U (OFF-CHAIN CREDIT)**
- KNOW-U earn logic
- KNOW-U burn logic
- KNOW-U ledger (transaction history)
- Threshold check (voucher eligibility)
-----
### <a name="_rhet921gyz38"></a>**7️⃣ Event & Voucher (MVP)**
- Create Event (admin)
- Invite User theo KS
- Join Event (consume KNOW-U)
- Voucher redeem (manual approval)

<a name="_8t1dbbwc462t"></a>Frontend CheckList

<a name="_nta9o2zbk0gh"></a>**FRONTEND (USER EXPERIENCE)**

**FE là nơi user “cảm” được hệ thống có công bằng hay không**

-----
### <a name="_w47vqpya6c1o"></a>**1️⃣ Auth & Layout**
- Login / Register UI
- Guest view
- Main layout
- Navigation (Feed / Profile)
-----
### <a name="_siwsmbo4iust"></a>**2️⃣ Article UI**
- Create Article page
- Article editor
- Article detail page
- Article feed
- Category / Context display
-----
### <a name="_khmclvkltd8g"></a>**3️⃣ Comment UI**
- Comment list
- Add comment
- Upvote comment
- Highlight comment có signal
-----
### <a name="_6vq3d6zg2e3n"></a>**4️⃣ Suggestion UI (CỰC QUAN TRỌNG)**
- Create Suggestion modal
- Show KNOW-U cost
- Vote Suggestion
- Suggestion status (pending / accepted / rejected)
- Apply result preview
-----
### <a name="_ggxy1zusp8ns"></a>**5️⃣ User Profile & Reputation**
- Profile page
- KS display
- Level badge
- Contribution history
-----
### <a name="_ww7ursqebun2"></a>**6️⃣ KNOW-U Dashboard**
- KNOW-U balance
- Earn history
- Burn history
- Voucher eligibility indicator
-----
### <a name="_eb9pmg95fkj7"></a>**7️⃣ Event & Voucher UI**
- Event list
- Join event
- Voucher redeem screen
- Event badge display
-----
### <a name="_tdpftvdguehl"></a>**8️⃣ Wallet (MVP minimal)**
- Connect Solana wallet
- Show KNOW-G balance
- Simple on-chain status

❌ Không swap\
` `❌ Không DAO UI

<a name="_56u0kc104rs5"></a>Worker CheckList
## <a name="_mkct7ihpuozm"></a>**WORKER / BACKGROUND / BLOCKCHAIN**
**Worker là nơi mọi thứ “tự chạy” và không được sai**

-----
### <a name="_efhnpaeql8eu"></a>**1️⃣ Scheduler / Cron**
- KS decay job
- KV review job
- Event reminder job
-----
### <a name="_vzvxws2pbjv"></a>**2️⃣ KV / KS Engine**
- Process accepted Suggestion
- Update KV state
- Recalculate KS
- Trigger KNOW-U reward
-----
### <a name="_3athhahjojq5"></a>**3️⃣ KNOW-U System**
- Mint KNOW-U (off-chain)
- Burn KNOW-U
- Threshold trigger (voucher / convert)
-----
### <a name="_l0je6zwfr3p7"></a>**4️⃣ KNOW-G (Solana)**
- Deploy KNOW-G SPL token (devnet)
- Mint KNOW-G (controlled)
- Burn / lock KNOW-G
- Sync wallet balance → BE
-----
### <a name="_vak3r64olvve"></a>**5️⃣ KNOW-U ↔ KNOW-G Conversion**
- Validate KS threshold
- Lock / burn KNOW-U
- Mint KNOW-G
- Log conversion
-----
### <a name="_jyraure6bunb"></a>**6️⃣ Event Reward & Voucher**
- Verify event participation
- Burn KNOW-U
- Issue voucher / reward
- Log redemption
-----
## <a name="_46hjlqe0rp8n"></a>**✅ MVP END-TO-END CHECK (NHỚ DÁN TƯỜNG)**
- Article được tạo
- Suggestion được tạo (KNOW-U ↓)
- Suggestion được accept
- KV ↑
- KS ↑
- KNOW-U ↑
- KNOW-U ↓ (event / voucher)
- KNOW-G (optional)
-----
# <a name="_jkzesnq9v7o1"></a>**🎯 CÁCH DÙNG CHECKLIST NÀY HIỆU QUẢ**
Mình khuyên bạn:

1. **Copy nguyên checklist này sang Notion / Jira**\

1. Tạo 3 board:
   1. BE
   1. FE
   1. Worker
1. Mỗi ngày chỉ làm:
   1. 1–2 task BE
   1. hoặc 1 flow FE

👉 **Không làm song song mọi thứ**

