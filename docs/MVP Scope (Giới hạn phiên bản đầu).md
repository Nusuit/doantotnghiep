## <a name="_fq9x9bb6yjp8"></a>**1. Mục tiêu của MVP (chốt 1 câu)**
MVP nhằm kiểm chứng rằng:\
` `người dùng có sẵn sàng chia sẻ tri thức chất lượng,\
` `và cộng đồng có thể đánh giá – ghi nhận – khuyến khích tri thức đó một cách công bằng.

❌ MVP **không** nhằm:

- scale lớn
- kiếm tiền
- DAO hoàn chỉnh
- AI phức tạp
-----
## <a name="_kxdlx5asvotm"></a>**2. Nguyên tắc cắt MVP (rất quan trọng)**
MVP tuân theo 4 nguyên tắc:

1. **Article là trung tâm**
1. **KV & KS chạy được, dù đơn giản**
1. **KNOW-U phải có sinh & có tiêu**
1. **KNOW-G tồn tại nhưng chưa cần full governance**

👉 Cái gì không phục vụ 4 điểm này → **cắt**.

-----
## <a name="_xmfacywmu8cl"></a>**3. NHỮNG THỨ CÓ TRONG MVP (BUILD)**
### <a name="_80ti23emxhmm"></a>**3.1. Actors (giữ tối thiểu)**
✅ Guest

- xem bài
- lướt feed

✅ User (đăng ký)

- viết bài
- comment
- tạo suggestion

❌ Admin / Moderator nâng cao → **gộp 1 role Admin đơn giản**

-----
### <a name="_cs03o22oqhef"></a>**3.2. Knowledge Objects (giữ lõi)**
✅ Article

- title
- content
- context / location
- category

✅ Comment

- chỉ để phản hồi
- không sinh KV trực tiếp

❌ Knowledge Unit riêng → **chưa cần**

-----
### <a name="_xjg2hbgsmdcf"></a>**3.3. Contribution Objects (giữ 3 loại)**
✅ Suggestion

- đề xuất chỉnh sửa
- có đặt cọc KNOW-U

✅ Edit (sau khi suggestion được chấp nhận)

✅ Connection (phiên bản đơn giản)

- gắn article với category / location

❌ Connection phức tạp (graph, multi-hop) → **cắt**

-----
## <a name="_ckzm0dr5x5vr"></a>**4. VALUE & REPUTATION (phiên bản MVP)**
### <a name="_g7vcdig9kfew"></a>**4.1. Knowledge Value (KV) — đơn giản hoá**
Trong MVP:

- KV **chỉ có 3 trạng thái**:
  - thấp
  - trung bình
  - cao

KV tăng khi:

- suggestion được chấp nhận
- nhiều user đánh giá tích cực

KV giảm khi:

- bị phản đối
- bị flag

👉 **Không cần công thức phức tạp**

-----
### <a name="_v8gth5f3l01s"></a>**4.2. Knowledge Score (KS)**
- KS = tổng KV được ghi nhận
- Có decay nhẹ theo thời gian (ví dụ theo tháng)

❌ Không cần trust graph\
` `❌ Không cần AI chấm điểm

-----
### <a name="_qby3229jlrbt"></a>**4.3. Level / Rank**
- Chỉ để **hiển thị**
- Dùng cho:
  - đề xuất bài viết
  - mời tham gia event

❌ Không gắn quyền lực mạnh

-----
## <a name="_kucoa52rse6e"></a>**5. TOKEN LOGIC — MVP VERSION**
### <a name="_gi9l9atyd1q"></a>**5.1. KNOW-U (OFF-CHAIN) — BẮT BUỘC**
✅ Sinh KNOW-U khi:

- đóng góp được chấp nhận
- article có KV tăng

✅ Tiêu KNOW-U khi:

- tạo suggestion
- tham gia event
- đổi voucher đơn giản (manual)

👉 **Phải có sink**, dù thủ công.

-----
### <a name="_mfp6xgu40m0w"></a>**5.2. KNOW-G (ON-CHAIN) — GIỮ NHƯ BIỂU TƯỢNG**
MVP:

- KNOW-G **chỉ để mint & hold**
- **KHÔNG cần vote DAO**
- **KHÔNG cần trade public ngay**

Cấp KNOW-G:

- manual
- cho top contributors
- như “early employee stock”

👉 Governance để **V2**.

-----
## <a name="_oh8ncgzhecg1"></a>**6. EVENT & VOUCHER — MVP CÓ, NHƯNG ĐƠN GIẢN**
✅ Event:

- online
- invite bằng KS

✅ Voucher:

- đổi KNOW-U
- xử lý thủ công (admin confirm)

❌ Không cần partner API\
` `❌ Không cần marketplace

-----
## <a name="_7n7jidkx6x74"></a>**7. NHỮNG THỨ CỐ TÌNH KHÔNG BUILD Ở MVP**
❌ DAO voting\
` `❌ Token swap tự động\
` `❌ DEX integration\
` `❌ AI moderation\
` `❌ Graph tri thức phức tạp\
` `❌ Mobile app\
` `❌ Recommendation AI

👉 **Không build = quyết định đúng**, không phải thiếu sót.

-----
## <a name="_dq3xoo3c9yj5"></a>**8. MVP FLOW (rất quan trọng)**
User viết Article

`      `↓

User khác comment / tạo Suggestion

`      `↓

Suggestion được chấp nhận

`      `↓

KV tăng

`      `↓

KS tăng

`      `↓

KNOW-U sinh

`      `↓

KNOW-U tiêu (suggestion / event / voucher)

👉 **Nếu flow này chạy được → MVP THÀNH CÔNG**

-----
## <a name="_lako3oks7qvg"></a>**9. MVP SUCCESS METRICS (đo đúng)**
MVP không đo:\
` `❌ MAU\
` `❌ doanh thu\
` `❌ số token trade

MVP đo:\
` `✅ % article được chỉnh sửa\
` `✅ % suggestion được chấp nhận\
` `✅ số user dùng KNOW-U\
` `✅ số user quay lại đóng góp

-----
## <a name="_ge3w1dsaamep"></a>**10. Chốt MVP Scope (rất quan trọng)**
MVP của hệ thống này không nhằm chứng minh Web3,\
` `mà nhằm chứng minh rằng tri thức có thể được ghi nhận và khuyến khích một cách công bằng,\
` `trước khi token trở thành trung tâm.

