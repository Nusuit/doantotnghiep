## <a name="_3q1l1smjw4cm"></a>**1. Tổng quan thiết kế**
Hệ thống sử dụng **mô hình token kép (dual-token)**, với mục tiêu:

- Khuyến khích đóng góp tri thức chất lượng
- Ghi nhận cống hiến dài hạn
- Tránh lạm phát
- Tránh farm token
- Không cho tiền thao túng tri thức

Hai token **không ngang hàng**, không cùng bản chất.

-----
## <a name="_8x7rr6birocd"></a>**2. KNOW-U — Utility Credit (OFF-CHAIN)**
### <a name="_ln15ojiwqbrd"></a>**2.1. Bản chất**
**KNOW-U** là:

- Điểm tiện ích nội bộ (off-chain)
- Không phải crypto
- Không giao dịch tự do
- Không list sàn

KNOW-U đại diện cho:

**Mức độ tham gia và đóng góp đang diễn ra trong hệ thống**

-----
### <a name="_98u5s1uxnzkj"></a>**2.2. Cách sinh KNOW-U**
KNOW-U **không sinh từ hành động**, mà sinh **gián tiếp từ giá trị đã được xác nhận**.

Nguồn sinh:

- Knowledge Value (KV) được phân bổ hợp lệ
- Knowledge Score (KS) tăng trưởng
- Đóng góp được cộng đồng chấp nhận
- Tham gia event / hoạt động tri thức

Nguyên tắc:

**Không reward spam, không reward upvote, không reward tương tác rỗng**

-----
### <a name="_ujb82vfkji4m"></a>**2.3. Mục đích của KNOW-U**
KNOW-U dùng để:

- Tạo **Suggestion / Request Edit** (đặt cọc)
- Mở khoá tính năng nâng cao
- Tăng giới hạn hành động (rate-limit)
- Tham gia các event tri thức
- Nhận phần thưởng xã hội

KNOW-U = *“nhiên liệu vận hành hệ thống”*

-----
## <a name="_7ls347dbg8ja"></a>**3. Cơ chế TIÊU THỤ KNOW-U (Anti-inflation – rất quan trọng)**
Hệ thống **bắt buộc phải có sink cho KNOW-U**, nếu không sẽ lạm phát.
### <a name="_auymkqup9a58"></a>**3.1. Consumption-based Sink (tiêu thụ khi sử dụng)**
KNOW-U bị **tiêu hao (burn / lock)** khi:

- Tạo Suggestion
- Đặt đề xuất chỉnh sửa lớn
- Tạo Connection nâng cao
- Tham gia event có giới hạn

→ Nếu Suggestion bị từ chối:

- KNOW-U có thể mất một phần
- Hoặc hoàn lại một phần (tuỳ chính sách)
-----
### <a name="_89jhivqdwnf3"></a>**3.2. Threshold-based Sink (tiêu thụ theo ngưỡng sở hữu)**
Khi User **nắm giữ KNOW-U vượt một ngưỡng nhất định**, hệ thống kích hoạt **cơ chế tiêu thụ cao cấp**.

Ví dụ:

- Đổi KNOW-U lấy:
  - Voucher free meal
  - Voucher giảm giá
  - Quà tặng từ đối tác
  - Vé tham gia sự kiện offline

Đặc điểm:

- KNOW-U **bị đốt vĩnh viễn**
- Voucher **không thể bán lại**
- Có hạn mức theo thời gian

👉 Mục tiêu:

**Chuyển “điểm số” thành giá trị thực, nhưng không biến thành tiền mặt trực tiếp**

-----
### <a name="_8s59tfzhvghe"></a>**3.3. Event & Partner Sink**
KNOW-U có thể dùng để:

- Đăng ký event cộng đồng
- Nhận quà từ đối tác (quán ăn, nhà sách, rạp phim)

Quy trình:

- Off-chain: hệ thống xác nhận điều kiện
- KNOW-U bị burn
- User nhận voucher / quyền lợi

👉 Đây là **sink rất mạnh**, vì:

- Không tạo áp lực bán
- Không ảnh hưởng governance
- Tăng giá trị ecosystem
-----
## <a name="_l79ajguo7fyw"></a>**4. KNOW-G — Governance Token (ON-CHAIN – SOLANA)**
### <a name="_w2lhyhmlb3r5"></a>**4.1. Bản chất**
**KNOW-G** là:

- SPL Token trên Solana
- Có thể:
  - Hold
  - Transfer
  - Trade
  - List sàn

KNOW-G đại diện cho:

**Cam kết dài hạn & quyền sở hữu tinh thần đối với hệ thống**

-----
### <a name="_s383x8nn0yrl"></a>**4.2. KNOW-G KHÔNG đại diện cho điều gì?**
- Không đại diện cho giá trị tri thức
- Không tự động tạo uy tín
- Không cho quyền quản trị nếu không đủ điều kiện

Nguyên tắc:

**Ownership on-chain ≠ Governance power in-system**

-----
## <a name="_t1yd96b0g0i6"></a>**5. Chuyển đổi KNOW-U ↔ KNOW-G (Employee Stock Logic)**
### <a name="_5dwyeri4gq0m"></a>**5.1. KNOW-U ➜ KNOW-G (Con đường “cổ phần cho người cống hiến”)**
Ý nghĩa:

**Đổi cống hiến dài hạn lấy quyền sở hữu**

Điều kiện bắt buộc:

- KS ≥ ngưỡng
- Lịch sử đóng góp ổn định
- KNOW-U đủ (bị burn / lock)
- Giới hạn theo epoch
- Có thể cần DAO / system approval

Đặc điểm:

- Không tức thời
- Không mass-convert
- Không thể farm

👉 Giống cơ chế **vesting cổ phần cho employee**

-----
### <a name="_tseoih4l7wlf"></a>**5.2. KNOW-G ➜ KNOW-U (Liquidity Path)**
Ý nghĩa:

**Chuyển quyền sở hữu thành khả năng sử dụng hệ thống**

Cách làm:

- KNOW-G bị burn hoặc lock
- User nhận KNOW-U tương ứng

Dùng khi:

- User muốn dùng feature
- Tham gia event
- Không cần governance

👉 Đây là **van thanh khoản**, không phải công cụ kiếm lời

-----
## <a name="_m4bn58a34an6"></a>**6. Mối quan hệ tổng thể (logic cuối cùng)**
Tri thức → KV → KS

`                  `↓

`            `KNOW-U (off-chain)

`              `↓        ↓

`     `Voucher / Event   KNOW-G (on-chain)

❌ KHÔNG tồn tại:

Tiền → KNOW-G → KS

-----
## <a name="_hpcw83w676b9"></a>**7. Vì sao thiết kế này KHÔNG lạm phát?**
- KNOW-U:
  - Có sink liên tục
  - Có burn theo ngưỡng
  - Có sink ngoài hệ thống (voucher)
- KNOW-G:
  - Không sinh từ tiền
  - Sinh từ cống hiến
  - Có burn / lock khi đổi

👉 Token **luôn quay về phục vụ tri thức**, không tự sinh giá trị ảo.

-----
## <a name="_7vx07cn39dj"></a>**8. Câu chốt rất mạnh cho proposal / thesis**
Hệ thống sử dụng KNOW-U như một công cụ điều tiết hành vi và trải nghiệm,\
` `KNOW-G như biểu tượng của cam kết dài hạn và quyền sở hữu.\
` `Cơ chế chuyển đổi và tiêu thụ token được thiết kế để ngăn lạm phát, tránh thao túng và bảo vệ giá trị tri thức làm trung tâm.

