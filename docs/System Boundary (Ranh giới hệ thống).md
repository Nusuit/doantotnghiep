## <a name="_ok6byvfhduet"></a>**1. Mục tiêu của System Boundary**
System Boundary xác định rõ:

**Cái gì được xử lý ở đâu, vì sao phải xử lý ở đó,\
` `và cái gì CỐ TÌNH không đưa lên blockchain.**

Thiết kế này hướng tới:**1. Mục tiêu của System Boundary**

System Boundary xác định rõ:

**Cái gì được xử lý ở đâu, vì sao phải xử lý ở đó,** \*\*

\*\* **và cái gì CỐ TÌNH không đưa lên blockchain.**

Thiết kế này hướng tới:

- Trải nghiệm mượt (Web2 UX)
- Giá trị minh bạch (Web3 ownership)
- Bảo vệ tri thức khỏi thao túng bằng tiền

**2. Nguyên tắc nền tảng**

Hệ thống tuân theo mô hình **Web2.5 có kiểm soát**:

**Tri thức, đánh giá và uy tín → Off-chain** \*\*

\*\* **Sở hữu dài hạn và governance → On-chain**

Nguyên tắc chốt:

**Blockchain ghi nhận sở hữu.** \*\*

\*\* **Hệ thống quyết định quyền lực và giá trị.**

**3. Phân chia hệ thống thành 3 vùng**

┌──────────────────┐

│    OFF-CHAIN     │ ← Core Knowledge System

└──────────────────┘

`     `│

`      `│ (sync / conversion)

`      `▼

┌──────────────────┐

│      HYBRID      │ ← Bridge & Control Layer

└──────────────────┘

`     `│

`      `▼

┌──────────────────┐

│    ON-CHAIN      │ ← Ownership & Governance

└──────────────────┘

**4. OFF-CHAIN ZONE** **(Knowledge & Reputation Core)**

👉 **ĐÂY LÀ TRÁI TIM CỦA HỆ THỐNG**

**4.1. Những gì nằm OFF-CHAIN** **🔹 Knowledge Layer**

- Article
- Comment
- Context
- Category / Topic

**(Định nghĩa về Context - Thay thế cho Location)**

- **Context** là đối tượng tri thức, nằm OFF-CHAIN.
- **Context DẠNG PLACE**: Có thuộc tính không gian, được hiển thị trên Bản đồ (Map) như một giao diện khám phá.
- **Context DẠNG NON-PLACE**: Không hiển thị trên Bản đồ, nhưng vẫn duy trì khả năng khám phá.
- **Ranh giới quan trọng**: Bản đồ (Map) là **GIAO DIỆN KHÁM PHÁ (Discovery Interface)**, KHÔNG PHẢI **QUYỀN LỰC QUYẾT ĐỊNH GIÁ TRỊ (Value Authority)**.

**🔹 Contribution Layer**

- Edit
- Suggestion
- Connection
- Signal (comment quality, consensus)

**🔹 Value & Reputation**

- Knowledge Value (KV)
- Knowledge Score (KS)
- Level / Rank
- Trust signals

**🔹 Social & Community**

- Feed
- Recommendation
- Discovery
- Event invitation
- Community participation

**🔹 Utility Credit**

- **KNOW-U (off-chain)**
  - sinh từ KS
  - tiêu thụ khi dùng hệ thống
  - đổi voucher / event

**4.2. Vì sao những thứ này OFF-CHAIN?**

- Tri thức cần:
  - chỉnh sửa
  - cập nhật
  - moderation
- KV / KS:
  - biến động liên tục
  - cần thuật toán linh hoạt
- Event / voucher:
  - phụ thuộc đối tác
  - cần kiểm soát gian lận

👉 Blockchain **không phù hợp** cho các logic này.

**5. ON-CHAIN ZONE** **(Solana – Ownership & Governance)**

👉 **CHỈ CHỨA NHỮNG THỨ CẦN MINH BẠCH & BẤT BIẾN**

**5.1. Những gì nằm ON-CHAIN** **🔹 Governance Token**

- **KNOW-G (SPL Token – Solana)**
  - có thể trade
  - có thể hold
  - có thể list sàn

**🔹 Token Ownership**

- Ai sở hữu bao nhiêu KNOW-G

**🔹 Governance (Core)**

- Proposal
- Voting
- Result recording

**🔹 Treasury**

- Quỹ DAO
- Phân phối reward on-chain

**5.2. Những gì KHÔNG nằm on-chain (cố tình)**

- Article content
- Comment
- KV / KS
- Level
- Event logic
- Voucher logic

👉 Điều này giúp:

- tránh phí gas
- tránh spam
- tránh thao túng

**6. HYBRID ZONE** **(Bridge giữa Off-chain & On-chain)**

👉 **ĐÂY LÀ LỚP BẢO VỆ TRIẾT LÝ HỆ THỐNG**

Hybrid Zone đảm nhiệm:

**Off-chain đánh giá → On-chain xác nhận**

**6.1. KNOW-U ↔ KNOW-G Conversion** **🔁 KNOW-U ➜ KNOW-G**

*(Cơ chế “employee stock”)*

- Off-chain:
  - kiểm tra KS
  - lịch sử đóng góp
  - điều kiện epoch
- KNOW-U bị burn / lock
- On-chain:
  - mint KNOW-G có kiểm soát

👉 Không farm, không tức thời, không mua quyền lực.

**🔁 KNOW-G ➜ KNOW-U**

*(Liquidity / utility path)*

- On-chain:
  - lock hoặc burn KNOW-G
- Off-chain:
  - cấp KNOW-U tương ứng

👉 Chuyển ownership thành khả năng sử dụng.

**6.2. Reward & Event Distribution**

- Off-chain:
  - chọn user đủ điều kiện
  - xác nhận tham gia event
- Hybrid:
  - burn KNOW-U
- Off-chain / On-chain:
  - cấp voucher
  - airdrop có điều kiện
  - NFT event badge (tuỳ chọn)

**6.3. Snapshot & Proof (tuỳ chọn)**

- Định kỳ (epoch):
  - snapshot trạng thái KS
  - hash Article / Contribution state
- Ghi hash lên chain để:
  - tăng minh bạch
  - không lộ dữ liệu tri thức

**7. AI nằm ở đâu?**

- AI **OFF-CHAIN**
- Là **System Actor hỗ trợ**

Vai trò:

- gợi ý
- phát hiện spam
- hỗ trợ moderation
- hỗ trợ recommendation

❌ AI:

- không quyết định KV cuối cùng
- không cấp reward
- không có quyền governance

**8. Boundary “KHÔNG LÀM” (rất quan trọng)**

Hệ thống **CỐ TÌNH KHÔNG**:

- Đưa nội dung tri thức lên blockchain
- Cho token quyết định giá trị tri thức
- Cho phép mua KS bằng tiền
- Cho phép mua quyền quản trị thuần bằng KNOW-G
- Tự động hoá hoàn toàn moderation

👉 Đây là **ranh giới bảo vệ hệ thống khỏi bị phá**.

**9. Bảng tổng hợp cuối cùng**

|**Thành phần**|**Off-chain**|**Hybrid**|**On-chain**|
| :-: | :-: | :-: | :-: |
|Article / Comment|✅|❌|❌|
|Contribution|✅|❌|❌|
|KV / KS / Level|✅|❌|❌|
|KNOW-U|✅|✅ (burn/lock)|❌|
|KNOW-G|❌|✅ (convert)|✅|
|Voucher / Event|✅|✅|❌|
|Governance logic|❌|✅|✅|

**10. Câu chốt SYSTEM BOUNDARY**

Tri thức và uy tín được đánh giá off-chain để đảm bảo chất lượng và trải nghiệm.

Quyền sở hữu và cam kết dài hạn được ghi nhận on-chain để đảm bảo minh bạch.

Lớp hybrid được thiết kế để kết nối hai thế giới mà không cho phép tiền thao túng giá trị tri thức.

- Trải nghiệm mượt (Web2 UX)
- Giá trị minh bạch (Web3 ownership)
- Bảo vệ tri thức khỏi thao túng bằng tiền
-----
## <a name="_fexfqmlg98pl"></a>**2. Nguyên tắc nền tảng**
Hệ thống tuân theo mô hình **Web2.5 có kiểm soát**:

**Tri thức, đánh giá và uy tín → Off-chain\
` `Sở hữu dài hạn và governance → On-chain**

Nguyên tắc chốt:

**Blockchain ghi nhận sở hữu.\
` `Hệ thống quyết định quyền lực và giá trị.**

-----
## <a name="_32sbc8tqg52u"></a>**3. Phân chia hệ thống thành 3 vùng**
┌──────────────────┐

│    OFF-CHAIN     │  ← Core Knowledge System

└──────────────────┘

`          `│

`          `│ (sync / conversion)

`          `▼

┌──────────────────┐

│      HYBRID      │  ← Bridge & Control Layer

└──────────────────┘

`          `│

`          `▼

┌──────────────────┐

│    ON-CHAIN      │  ← Ownership & Governance

└──────────────────┘

-----
## <a name="_7msrr02ncnj0"></a>**4. OFF-CHAIN ZONE**
### <a name="_npjdvpc9get"></a>**(Knowledge & Reputation Core)**
👉 **ĐÂY LÀ TRÁI TIM CỦA HỆ THỐNG**
### <a name="_qfwvaa0bpup"></a>**4.1. Những gì nằm OFF-CHAIN**
#### <a name="_69t88b7a8qm7"></a>**🔹 Knowledge Layer**
- Article
- Comment
- Context / Location
- Category / Topic
#### <a name="_f75v1fawb4b1"></a>**🔹 Contribution Layer**
- Edit
- Suggestion
- Connection
- Signal (comment quality, consensus)
#### <a name="_rrqclyywnufw"></a>**🔹 Value & Reputation**
- Knowledge Value (KV)
- Knowledge Score (KS)
- Level / Rank
- Trust signals
#### <a name="_eka6j23dvp3d"></a>**🔹 Social & Community**
- Feed
- Recommendation
- Discovery
- Event invitation
- Community participation
#### <a name="_ctb0x2i8eeb5"></a>**🔹 Utility Credit**
- **KNOW-U (off-chain)**
  - sinh từ KS
  - tiêu thụ khi dùng hệ thống
  - đổi voucher / event
-----
### <a name="_n4xdt6rs2fyj"></a>**4.2. Vì sao những thứ này OFF-CHAIN?**
- Tri thức cần:
  - chỉnh sửa
  - cập nhật
  - moderation
- KV / KS:
  - biến động liên tục
  - cần thuật toán linh hoạt
- Event / voucher:
  - phụ thuộc đối tác
  - cần kiểm soát gian lận

👉 Blockchain **không phù hợp** cho các logic này.

-----
## <a name="_bg96ov9dw5fv"></a>**5. ON-CHAIN ZONE**
### <a name="_jzrdhmz2qb4o"></a>**(Solana – Ownership & Governance)**
👉 **CHỈ CHỨA NHỮNG THỨ CẦN MINH BẠCH & BẤT BIẾN**
### <a name="_uyuhtgetwms"></a>**5.1. Những gì nằm ON-CHAIN**
#### <a name="_tsju3xi6y197"></a>**🔹 Governance Token**
- **KNOW-G (SPL Token – Solana)**
  - có thể trade
  - có thể hold
  - có thể list sàn
#### <a name="_514oa0gj4wnp"></a>**🔹 Token Ownership**
- Ai sở hữu bao nhiêu KNOW-G
#### <a name="_bhjk8pioyrfe"></a>**🔹 Governance (Core)**
- Proposal
- Voting
- Result recording
#### <a name="_devf5zod7k7m"></a>**🔹 Treasury**
- Quỹ DAO
- Phân phối reward on-chain
-----
### <a name="_fnl10hdq2g6"></a>**5.2. Những gì KHÔNG nằm on-chain (cố tình)**
- Article content
- Comment
- KV / KS
- Level
- Event logic
- Voucher logic

👉 Điều này giúp:

- tránh phí gas
- tránh spam
- tránh thao túng
-----
## <a name="_7fqm7gos0yqx"></a>**6. HYBRID ZONE**
### <a name="_l8b8np29o27z"></a>**(Bridge giữa Off-chain & On-chain)**
👉 **ĐÂY LÀ LỚP BẢO VỆ TRIẾT LÝ HỆ THỐNG**

Hybrid Zone đảm nhiệm:

**Off-chain đánh giá → On-chain xác nhận**

-----
### <a name="_7y8k6zpsnr85"></a>**6.1. KNOW-U ↔ KNOW-G Conversion**
#### <a name="_18nxfnx0qc0p"></a>**🔁 KNOW-U ➜ KNOW-G**
*(Cơ chế “employee stock”)*

- Off-chain:
  - kiểm tra KS
  - lịch sử đóng góp
  - điều kiện epoch
- KNOW-U bị burn / lock
- On-chain:
  - mint KNOW-G có kiểm soát

👉 Không farm, không tức thời, không mua quyền lực.

-----
#### <a name="_nkzf2u3qxavj"></a>**🔁 KNOW-G ➜ KNOW-U**
*(Liquidity / utility path)*

- On-chain:
  - lock hoặc burn KNOW-G
- Off-chain:
  - cấp KNOW-U tương ứng

👉 Chuyển ownership thành khả năng sử dụng.

-----
### <a name="_sdxihfk29kmz"></a>**6.2. Reward & Event Distribution**
- Off-chain:
  - chọn user đủ điều kiện
  - xác nhận tham gia event
- Hybrid:
  - burn KNOW-U
- Off-chain / On-chain:
  - cấp voucher
  - airdrop có điều kiện
  - NFT event badge (tuỳ chọn)
-----
### <a name="_yl6mf7v8q3im"></a>**6.3. Snapshot & Proof (tuỳ chọn)**
- Định kỳ (epoch):
  - snapshot trạng thái KS
  - hash Article / Contribution state
- Ghi hash lên chain để:
  - tăng minh bạch
  - không lộ dữ liệu tri thức
-----
## <a name="_2h9orwpx0v3u"></a>**7. AI nằm ở đâu?**
- AI **OFF-CHAIN**
- Là **System Actor hỗ trợ**

Vai trò:

- gợi ý
- phát hiện spam
- hỗ trợ moderation
- hỗ trợ recommendation

❌ AI:

- không quyết định KV cuối cùng
- không cấp reward
- không có quyền governance
-----
## <a name="_58ngfckaaabw"></a>**8. Boundary “KHÔNG LÀM” (rất quan trọng)**
Hệ thống **CỐ TÌNH KHÔNG**:

- Đưa nội dung tri thức lên blockchain
- Cho token quyết định giá trị tri thức
- Cho phép mua KS bằng tiền
- Cho phép mua quyền quản trị thuần bằng KNOW-G
- Tự động hoá hoàn toàn moderation

👉 Đây là **ranh giới bảo vệ hệ thống khỏi bị phá**.

-----
## <a name="_nfxgtj1btgmq"></a>**9. Bảng tổng hợp cuối cùng**

|**Thành phần**|**Off-chain**|**Hybrid**|**On-chain**|
| :-: | :-: | :-: | :-: |
|Article / Comment|✅|❌|❌|
|Contribution|✅|❌|❌|
|KV / KS / Level|✅|❌|❌|
|KNOW-U|✅|✅ (burn/lock)|❌|
|KNOW-G|❌|✅ (convert)|✅|
|Voucher / Event|✅|✅|❌|
|Governance logic|❌|✅|✅|

-----
## <a name="_acowbi5eincs"></a>**10. Câu chốt SYSTEM BOUNDARY**
Tri thức và uy tín được đánh giá off-chain để đảm bảo chất lượng và trải nghiệm.\
` `Quyền sở hữu và cam kết dài hạn được ghi nhận on-chain để đảm bảo minh bạch.\
` `Lớp hybrid được thiết kế để kết nối hai thế giới mà không cho phép tiền thao túng giá trị tri thức.
