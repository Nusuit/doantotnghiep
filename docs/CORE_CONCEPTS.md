<a name="_ir9iblyggxl2"></a>Actors
## <a name="_hcthoestejz0"></a>**1. Actor là gì trong hệ thống?**
Trong phạm vi thiết kế hệ thống này, **Actor** được định nghĩa là:

**Bất kỳ thực thể nào có thể tạo ra, tác động, đánh giá hoặc vận hành tri thức trong hệ thống.**

Actor **không nhất thiết phải là con người**, và **không đồng nghĩa với tài khoản người dùng**.

-----
## <a name="_rodzwfkarwck"></a>**2. Human Actors (Con người)**
### <a name="_3dcclj1u566x"></a>**2.1. Guest**
**Guest** là:

- Bất kỳ người đọc nào **chưa đăng ký tài khoản**.
- Có thể:
  - Xem nội dung công khai.
  - Lướt feed tri thức.
  - Khám phá hệ thống ở mức cơ bản.

Guest:

- Không có Knowledge Score (KS).
- Không tham gia tạo hoặc chỉnh sửa tri thức.
- Không được ghi nhận giá trị hay nhận thưởng.

Lưu ý thiết kế:

- Việc phân biệt Guest và User **có thể linh hoạt theo từng giai đoạn hệ thống**.
- Ở giai đoạn MVP, Guest có thể bị giới hạn hoặc được đơn giản hoá.
-----
### <a name="_uegalj3a2wk8"></a>**2.2. User**
**User** là:

- Người đã đăng ký tài khoản trong hệ thống.
- Có thể:
  - Tạo, chỉnh sửa và kết nối tri thức.
  - Bình luận, đánh giá có kiểm soát.
  - Tích lũy Knowledge Score (KS).
  - Nhận ghi nhận và phần thưởng từ hệ thống.

User **là actor trung tâm** của hệ thống, vì:

- Tri thức được tạo ra bởi User.
- Giá trị tri thức được phân bổ cho User.
- Uy tín và quyền lực trong hệ thống xuất phát từ User.
-----
### <a name="_4axy8o4eny7v"></a>**2.3. User Levels (Cấp bậc người dùng)**
Hệ thống không phân chia User thành các loại cứng nhắc, mà sử dụng **cơ chế cấp bậc (level / tier)** dựa trên uy tín và đóng góp.

Ví dụ (minh hoạ):

- Tân thủ
- Kỳ cựu
- Học giả
- Chuyên gia

Hoặc:

- Sắt
- Bạc
- Vàng
- Kim cương

Nguyên tắc:

- Cấp bậc **không phải là role kỹ thuật**, mà là **trạng thái uy tín**.
- Level ảnh hưởng đến:
  - Quyền hạn mềm (giới hạn hành động, mức ảnh hưởng).
  - Mức độ tin cậy khi đánh giá tri thức.
  - Khả năng tham gia sâu hơn vào hệ thống.
-----
### <a name="_43oe8kq98v2c"></a>**2.4. Admin**
**Admin** là:

- Người dùng có quyền kiểm duyệt ở **mức trung bình**.
- Thường xử lý:
  - Các nội dung cần xem xét.
  - Tranh chấp đơn giản.
  - Các bài viết hoặc hành vi bị gắn cờ.

Admin:

- Không nhất thiết là người có cấp bậc tri thức cao nhất.
- Được trao quyền thông qua **quyền quản trị**, không phải qua Knowledge Score.
-----
### <a name="_qkf4efpd5my6"></a>**2.5. Moderator**
**Moderator** là:

- Nhóm người có quyền quản trị cao nhất trong hệ thống.
- Thường đại diện cho:
  - Ban vận hành cốt lõi.
  - Đội ngũ kỹ thuật (CTO, CEO, core team).

Moderator:

- Có quyền:
  - Can thiệp sâu vào các quyết định hệ thống.
  - Điều chỉnh quy tắc vận hành trong trường hợp đặc biệt.
- Không tham gia ghi nhận giá trị tri thức như User thông thường khi thực hiện vai trò quản trị.
-----
## <a name="_dw1yu817hjq"></a>**3. System Actor (Hệ thống như một chủ thể)**
### <a name="_aphn6rcykxr"></a>**3.1. System / Algorithm**
Hệ thống được coi là **một Actor đặc biệt**, đại diện cho:

- Các thuật toán đề xuất.
- Cơ chế phân phối giá trị.
- Các quy tắc tự động.

System Actor:

- Không sở hữu tri thức.
- Không tích lũy KS.
- Nhưng có quyền:
  - Tác động đến việc tri thức được khám phá.
  - Phân phối ghi nhận và phần thưởng theo quy tắc đã định.
-----
### <a name="_agd5odfp714f"></a>**3.2. AI Actor (Future-facing)**
Trong tương lai, khi hệ thống mở rộng:

- AI có thể đảm nhận vai trò:
  - Hỗ trợ đánh giá nội dung.
  - Phát hiện spam, hành vi bất thường.
  - Gợi ý chỉnh sửa hoặc kết nối tri thức.

AI:

- Được xem là một **Actor vận hành**, không phải Actor giá trị.
- Không được ghi nhận KV hay KS.
- Hoạt động dưới sự giám sát của quy tắc hệ thống và con người.
-----
## <a name="_exs0it7o7o9d"></a>**4. Nguyên tắc phân biệt Actor và Role**
- **Actor**: là chủ thể tồn tại trong mô hình khái niệm.
- **Role / Permission**: là cách hệ thống cho phép Actor hành động trong từng ngữ cảnh.

Một User:

- Có thể vừa là người đóng góp tri thức.
- Vừa là người đánh giá.
- Vừa (trong một số trường hợp) là Admin.
-----
## <a name="_rilkslbf13pe"></a>**5. Vai trò của mục Actors trong thiết kế hệ thống**
Mục Actors:

- Là nền tảng để:
  - Thiết kế quyền hạn.
  - Xây dựng cơ chế uy tín.
  - Phân biệt giữa đóng góp và quản trị.
- Giúp tránh nhầm lẫn giữa:
  - Giá trị tri thức.
  - Quyền vận hành hệ thống.

<a name="_9min3sgqjsgw"></a>Knowledge Objects
## **Knowledge Objects**
##
## **1. Knowledge Object là gì?**
##
## Trong hệ thống Chia sẻ Tri Thức, **Knowledge Object** được định nghĩa là:
##
## **Bất kỳ đối tượng nội dung nào đại diện cho một tri thức cụ thể, có thể được khám phá, đánh giá và gắn với ngữ cảnh thực tế.**
##
## Không phải mọi nội dung text đều là Knowledge Object.
## Chỉ những nội dung:
- Có **chủ đề rõ ràng**
- Có **Context (Ngữ cảnh)**
- Có thể **được người khác sử dụng hoặc tham chiếu**

mới được coi là Knowledge Object.
##
## **2. Article — Knowledge Object trung tâm**
##
## **2.1. Định nghĩa**
##
## **Article** là **Knowledge Object cốt lõi** của hệ thống.
##
## Article **không phải là một bài viết thuần text**, mà là:
##
## Một thực thể tri thức có cấu trúc, **luôn gắn với một chủ đề/thực thể ngoài đời và một Category bắt buộc**, được mô tả bằng nội dung văn bản.
##
## **2.2. Cấu trúc khái niệm của Article**
##
## Một Article bao gồm:
- **Title** → Tên tri thức (ví dụ: tên sách, phim, địa điểm, chủ đề)
- **Description / Content** → Nội dung mô tả, chia sẻ tri thức
- **Context Note** → Ngữ cảnh của tri thức, trả lời các câu hỏi:
  - Tri thức này thuộc về **ai**? (tác giả, đạo diễn, nhà xuất bản…)
  - Liên quan đến **cái gì**? (sách, phim, ý tưởng…)
  - Gắn với **Context** nào? (ngữ cảnh thực thể, nguồn gốc, không gian)

Mục tiêu của phần “Context” **không chỉ là địa lý thuần túy**, mà là:
##
## Giúp người dùng hiểu tri thức này “đứng ở đâu trong thế giới thực”.
##
## **2.3. Article và việc khám phá tri thức**
##
## Article được thiết kế để:
- Có thể xuất hiện trong **feed lướt**.
- Có thể được **tìm kiếm theo Context (ngữ cảnh)**, chủ đề, hoặc **Category**.
- Tránh tình trạng tri thức bị “trôi” hoặc “lạc” như text thuần.

Do đó:

- Article **luôn gắn với ít nhất một chủ đề hoặc thực thể ngoài đời**.
- Ngay cả các nội dung trừu tượng (ví dụ: tâm linh) cũng:
  - Được gắn **Category rõ ràng (Bắt buộc và nội tại)**.
  - Có Context để người dùng dễ khám phá.

**3. Comment — Đối tượng tri thức phụ trợ**
##
## **3.1. Vai trò của Comment**
##
## **Comment không phải là Knowledge Object độc lập**, nhưng là:
##
## **Đối tượng phụ trợ quan trọng giúp đánh giá, mở rộng và làm rõ tri thức.**
##
## Comment:
- Không mang KV độc lập.
- Không đứng ngang hàng với Article.

**3.2. Comment chất lượng cao**
##
## Một Comment có thể được coi là **có giá trị cao** khi:
- Mang tính phân tích, góp ý, phản biện.
- Chỉ ra vấn đề chung hoặc điểm cần cải thiện.
- Được nhiều người cùng phản ánh theo một hướng.

Trong các trường hợp này:

- Comment trở thành **tín hiệu** cho việc:
  - Điều chỉnh Article.
  - Sinh ra Contribution (chỉnh sửa, bổ sung).

Giá trị của Comment:

- Được ghi nhận **gián tiếp** thông qua hệ thống Attribution.
- Không trực tiếp sinh KV như Article.

**4. Knowledge Unit (KU) — Giải thích đơn giản, không ép dùng**
##
## **4.1. Knowledge Unit là gì? (nói dễ hiểu)**
##
## **Knowledge Unit (KU)** là:
##
## *Một khái niệm thiết kế*, không phải một đối tượng bắt buộc.
##
## Nó trả lời câu hỏi:
##
## “Đơn vị NHỎ NHẤT nào trong hệ thống được coi là mang giá trị tri thức?”
##
## **4.2. Trạng thái hiện tại của hệ thống**
##
## Ở **giai đoạn hiện tại**, hệ thống chọn cách:
##
## **Article = Knowledge Unit**
##
## Tức là:
- KV sinh ra từ Article.
- Contribution xoay quanh Article.
- Không cần tách KU riêng.

👉 Điều này **hoàn toàn ổn cho MVP**, và đúng với cách bạn đang hình dung.
##
## **4.3. Vì sao vẫn nhắc đến KU?**
##
## KU chỉ được giữ lại như:
- Một **khái niệm mở** cho tương lai.
- Phòng trường hợp sau này:
  - Tách version
  - Tách chỉnh sửa lớn
  - Tách tri thức con trong 1 Article

👉 Hiện tại: **bạn không cần quan tâm sâu đến KU**.
##
## **5. Gắn tri thức với Context (Ngữ cảnh thực thể)**
##
## Nguyên tắc thiết kế:
##
## **Mọi Knowledge Object phải gắn với ít nhất một thực thể hoặc chủ đề rõ ràng trong thế giới thực, thông qua Context và Category.**
##
## Thực thể này có thể là:
- Địa điểm (quán ăn, không gian)
- Sách, phim, tác phẩm
- Con người, tổ chức
- Chủ đề trừu tượng (ví dụ: tâm linh), nhưng có Category rõ ràng

Mục tiêu:

- Tránh tri thức bị lan man.
- Giúp người dùng **lướt đúng thứ họ quan tâm**.
- Tăng khả năng khám phá và gợi ý.

**6. Ranh giới của Knowledge Objects**
##
## **KHÔNG phải Knowledge Object**:
- Tương tác xã hội thuần túy.
- Upvote.
- Comment ngắn mang tính cảm xúc.

**LÀ Knowledge Object**:

- Article có nội dung, Context, và Category rõ ràng.

**7. Vai trò của Knowledge Objects trong toàn hệ thống**
##
## Knowledge Objects:
- Là nơi **giá trị tri thức được sinh ra**.
- Là trung tâm của:
  - Contribution
  - KV
  - Discovery / Feed
- Là nền móng cho:
  - Attribution & Incentive

-----**Contribution Objects**
##
## **1. Contribution Object là gì?**
##
## Trong hệ thống Chia sẻ Tri Thức, **Contribution Object** được định nghĩa là:
##
## **Một hành động của User chỉ được coi là đóng góp khi nó được cộng đồng chấp nhận và có khả năng làm gia tăng Knowledge Value (KV) của tri thức.**
##
## Nguyên tắc cốt lõi:
- **Không phải mọi chỉnh sửa đều là đóng góp.**
- **Không phải mọi tương tác đều tạo giá trị.**
- Chỉ những hành động **được xác nhận bởi cộng đồng** mới trở thành Contribution hợp lệ.

**2. Các loại Contribution Objects chính**
##
## Hệ thống xác định **ba nhóm Contribution Objects**, phản ánh các cách khác nhau mà người dùng có thể làm tăng giá trị tri thức.
##
## **2.1. Content Contribution (Đóng góp nội dung)**
##
## **a) Edit (Chỉnh sửa nội dung)**
- Edit **không tự động** được coi là Contribution.
- Một chỉnh sửa chỉ trở thành Contribution khi:
  - Được cộng đồng chấp nhận.
  - Hoặc được đánh giá tích cực thông qua các tín hiệu xã hội.

Nguyên tắc:
##
## **Cộng đồng là trọng tài cuối cùng**, không phải tác giả gốc hay hệ thống tự động.
##
## Điều này nhằm:
- Tránh thiên vị cá nhân.
- Giảm rủi ro đánh giá chủ quan từ tác giả ban đầu.
- Đảm bảo tính công bằng trong ghi nhận đóng góp.

**b) Suggestion (Đề xuất chỉnh sửa)**
##
## Hệ thống sử dụng **lớp Suggestion** để:
- Tách biệt giữa đề xuất và nội dung chính thức.
- Tránh tình trạng chỉnh sửa tuỳ tiện gây loạn tri thức.

Suggestion:

- Là yêu cầu chỉnh sửa do User chủ động tạo.
- Chỉ khi Suggestion được chấp nhận, nó mới:
  - Tác động lên Article.
  - Trở thành Contribution hợp lệ.

Nguyên tắc:
##
## **Không có Suggestion được duyệt → không có Contribution.**
##
## **3. Structural Contribution (Đóng góp cấu trúc & kết nối)**
##
## **3.1. Connection (Kết nối tri thức)**
##
## Hệ thống coi **kết nối tri thức** là một dạng đóng góp quan trọng, vì nó trực tiếp ảnh hưởng đến khả năng khám phá tri thức.
##
## Connection bao gồm:
- Liên kết Article với các Article khác có liên quan.
- Gắn Article vào đúng **Context**.
- Phân loại tri thức vào đúng Category hoặc chủ đề.

**3.2. Định nghĩa “Context” trong hệ thống**
##
## **Context không chỉ là vị trí địa lý.**
##
## Context được hiểu là:
##
## **Ngữ cảnh thực thể của tri thức**, trả lời câu hỏi:
## *Tri thức này thuộc về cái gì, của ai, và trong bối cảnh nào?*
##
## Ví dụ:
- Sách → nhà xuất bản, tác giả.
- Phim → đạo diễn, hãng phim.
- Quán ăn → địa điểm, khu vực.
- Chủ đề trừu tượng → Category hoặc hệ quy chiếu rõ ràng.

Việc gắn đúng Context giúp:

- Tri thức không bị lạc.
- Feed và discovery hoạt động hiệu quả.
- Người dùng dễ lướt đúng mối quan tâm.

**3.3. Điều kiện ghi nhận Connection**
##
## Không phải mọi kết nối đều là Contribution.
##
## Một Connection chỉ được ghi nhận khi:
- Có ý nghĩa ngữ cảnh.
- Được cộng đồng chấp nhận hoặc không bị phản đối tiêu cực.
- Thực sự giúp tri thức được khám phá tốt hơn.

**4. Signal Contribution (Đóng góp tín hiệu)**
##
## **4.1. Comment**
##
## Comment **không tự động là Contribution**.
##
## Nguyên tắc:
- Comment đơn lẻ không được coi là đóng góp tri thức.
- Comment **không trực tiếp sinh KV**.

Tuy nhiên, Comment có thể trở thành **Signal Contribution** trong các trường hợp:

- Một Comment được nhiều người upvote, thể hiện sự đồng thuận.
- Nhiều Comment khác nhau cùng phản ánh một vấn đề hoặc góc nhìn chung.

Trong các trường hợp này:

- Comment trở thành **tín hiệu tập thể**.
- Được hệ thống sử dụng để:
  - Gợi ý chỉnh sửa.
  - Đánh giá lại Article.
  - Kích hoạt Suggestion.

Lưu ý:

- Comment **không cần** được dùng làm cơ sở cho Edit hoặc Suggestion để được ghi nhận là tín hiệu.
- Việc tạo Suggestion là hành động **chủ động riêng**, không tự động sinh ra từ Comment.

**5. Những hành động KHÔNG phải Contribution**
##
## Hệ thống xác định rõ các hành động sau **không được coi là Contribution**:
- Edit chưa được chấp nhận.
- Suggestion bị từ chối.
- Comment cảm xúc ngắn (ví dụ: “Hay!”, “Ok”).
- Upvote (được xem là quà cho người đóng góp, không phải đóng góp).
- Tương tác xã hội thuần tuý không mang giá trị tri thức.

Các hành động này:

- Không bị cấm.
- Nhưng **không được ghi nhận giá trị**.

**6. Vai trò của Contribution Objects trong toàn hệ thống**
##
## Contribution Objects:
- Là cầu nối giữa **Actors** và **Knowledge Objects**.
- Là cơ sở để:
  - Phân bổ Knowledge Value (KV).
  - Tính Knowledge Score (KS).
  - Thiết kế cơ chế khuyến khích công bằng.

Không có Contribution:

- Không có Attribution.
- Không có KS thực chất.
- Không có Incentives bền vững.

-----Final response to user: Dưới đây là nội dung đã được cập nhật cho hai mục **Knowledge Objects** và **Contribution Objects**, tuân thủ yêu cầu thay thế thuật ngữ "Location" bằng "Context" một cách nhất quán, đồng thời làm rõ vai trò trung tâm của **Article** và tính bắt buộc của **Category** trong cấu trúc tri thức. Các mục khác (**Actors, Value & Reputation, Incentive Objects**) được giữ nguyên.
##
## **Knowledge Objects**
##
## **1. Knowledge Object là gì?**
##
## Trong hệ thống Chia sẻ Tri Thức, **Knowledge Object** được định nghĩa là:
##
## **Bất kỳ đối tượng nội dung nào đại diện cho một tri thức cụ thể, có thể được khám phá, đánh giá và gắn với ngữ cảnh thực tế.**
##
## Không phải mọi nội dung text đều là Knowledge Object.
## Chỉ những nội dung:
- Có **chủ đề rõ ràng**
- Có **Context (Ngữ cảnh)**
- Có thể **được người khác sử dụng hoặc tham chiếu**

mới được coi là Knowledge Object.
##
## **2. Article — Knowledge Object trung tâm**
##
## **2.1. Định nghĩa**
##
## **Article** là **Knowledge Object cốt lõi** của hệ thống.
##
## Article **không phải là một bài viết thuần text**, mà là:
##
## Một thực thể tri thức có cấu trúc, **luôn gắn với một chủ đề/thực thể ngoài đời và một Category bắt buộc**, được mô tả bằng nội dung văn bản.
##
## **2.2. Cấu trúc khái niệm của Article**
##
## Một Article bao gồm:
- **Title** → Tên tri thức (ví dụ: tên sách, phim, địa điểm, chủ đề)
- **Description / Content** → Nội dung mô tả, chia sẻ tri thức
- **Context Note** → Ngữ cảnh của tri thức, trả lời các câu hỏi:
  - Tri thức này thuộc về **ai**? (tác giả, đạo diễn, nhà xuất bản…)
  - Liên quan đến **cái gì**? (sách, phim, ý tưởng…)
  - Gắn với **Context** nào? (ngữ cảnh thực thể, nguồn gốc, không gian)

Mục tiêu của phần “Context” **không chỉ là địa lý thuần túy**, mà là:
##
## Giúp người dùng hiểu tri thức này “đứng ở đâu trong thế giới thực”.
##
## **2.3. Article và việc khám phá tri thức**
##
## Article được thiết kế để:
- Có thể xuất hiện trong **feed lướt**.
- Có thể được **tìm kiếm theo Context (ngữ cảnh)**, chủ đề, hoặc **Category**.
- Tránh tình trạng tri thức bị “trôi” hoặc “lạc” như text thuần.

Do đó:

- Article **luôn gắn với ít nhất một chủ đề hoặc thực thể ngoài đời**.
- Ngay cả các nội dung trừu tượng (ví dụ: tâm linh) cũng:
  - Được gắn **Category rõ ràng (Bắt buộc và nội tại)**.
  - Có Context để người dùng dễ khám phá.

**3. Comment — Đối tượng tri thức phụ trợ**
##
## **3.1. Vai trò của Comment**
##
## **Comment không phải là Knowledge Object độc lập**, nhưng là:
##
## **Đối tượng phụ trợ quan trọng giúp đánh giá, mở rộng và làm rõ tri thức.**
##
## Comment:
- Không mang KV độc lập.
- Không đứng ngang hàng với Article.

**3.2. Comment chất lượng cao**
##
## Một Comment có thể được coi là **có giá trị cao** khi:
- Mang tính phân tích, góp ý, phản biện.
- Chỉ ra vấn đề chung hoặc điểm cần cải thiện.
- Được nhiều người cùng phản ánh theo một hướng.

Trong các trường hợp này:

- Comment trở thành **tín hiệu** cho việc:
  - Điều chỉnh Article.
  - Sinh ra Contribution (chỉnh sửa, bổ sung).

Giá trị của Comment:

- Được ghi nhận **gián tiếp** thông qua hệ thống Attribution.
- Không trực tiếp sinh KV như Article.

**4. Knowledge Unit (KU) — Giải thích đơn giản, không ép dùng**
##
## **4.1. Knowledge Unit là gì? (nói dễ hiểu)**
##
## **Knowledge Unit (KU)** là:
##
## *Một khái niệm thiết kế*, không phải một đối tượng bắt buộc.
##
## Nó trả lời câu hỏi:
##
## “Đơn vị NHỎ NHẤT nào trong hệ thống được coi là mang giá trị tri thức?”
##
## **4.2. Trạng thái hiện tại của hệ thống**
##
## Ở **giai đoạn hiện tại**, hệ thống chọn cách:
##
## **Article = Knowledge Unit**
##
## Tức là:
- KV sinh ra từ Article.
- Contribution xoay quanh Article.
- Không cần tách KU riêng.

👉 Điều này **hoàn toàn ổn cho MVP**, và đúng với cách bạn đang hình dung.
##
## **4.3. Vì sao vẫn nhắc đến KU?**
##
## KU chỉ được giữ lại như:
- Một **khái niệm mở** cho tương lai.
- Phòng trường hợp sau này:
  - Tách version
  - Tách chỉnh sửa lớn
  - Tách tri thức con trong 1 Article

👉 Hiện tại: **bạn không cần quan tâm sâu đến KU**.
##
## **5. Gắn tri thức với Context (Ngữ cảnh thực thể)**
##
## Nguyên tắc thiết kế:
##
## **Mọi Knowledge Object phải gắn với ít nhất một thực thể hoặc chủ đề rõ ràng trong thế giới thực, thông qua Context và Category.**
##
## Thực thể này có thể là:
- Địa điểm (quán ăn, không gian)
- Sách, phim, tác phẩm
- Con người, tổ chức
- Chủ đề trừu tượng (ví dụ: tâm linh), nhưng có Category rõ ràng

Mục tiêu:

- Tránh tri thức bị lan man.
- Giúp người dùng **lướt đúng thứ họ quan tâm**.
- Tăng khả năng khám phá và gợi ý.

**6. Ranh giới của Knowledge Objects**
##
## **KHÔNG phải Knowledge Object**:
- Tương tác xã hội thuần túy.
- Upvote.
- Comment ngắn mang tính cảm xúc.

**LÀ Knowledge Object**:

- Article có nội dung, Context, và Category rõ ràng.

**7. Vai trò của Knowledge Objects trong toàn hệ thống**
##
## Knowledge Objects:
- Là nơi **giá trị tri thức được sinh ra**.
- Là trung tâm của:
  - Contribution
  - KV
  - Discovery / Feed
- Là nền móng cho:
  - Attribution & Incentive

-----**Contribution Objects**
##
## **1. Contribution Object là gì?**
##
## Trong hệ thống Chia sẻ Tri Thức, **Contribution Object** được định nghĩa là:
##
## **Một hành động của User chỉ được coi là đóng góp khi nó được cộng đồng chấp nhận và có khả năng làm gia tăng Knowledge Value (KV) của tri thức.**
##
## Nguyên tắc cốt lõi:
- **Không phải mọi chỉnh sửa đều là đóng góp.**
- **Không phải mọi tương tác đều tạo giá trị.**
- Chỉ những hành động **được xác nhận bởi cộng đồng** mới trở thành Contribution hợp lệ.

**2. Các loại Contribution Objects chính**
##
## Hệ thống xác định **ba nhóm Contribution Objects**, phản ánh các cách khác nhau mà người dùng có thể làm tăng giá trị tri thức.
##
## **2.1. Content Contribution (Đóng góp nội dung)**
##
## **a) Edit (Chỉnh sửa nội dung)**
- Edit **không tự động** được coi là Contribution.
- Một chỉnh sửa chỉ trở thành Contribution khi:
  - Được cộng đồng chấp nhận.
  - Hoặc được đánh giá tích cực thông qua các tín hiệu xã hội.

Nguyên tắc:
##
## **Cộng đồng là trọng tài cuối cùng**, không phải tác giả gốc hay hệ thống tự động.
##
## Điều này nhằm:
- Tránh thiên vị cá nhân.
- Giảm rủi ro đánh giá chủ quan từ tác giả ban đầu.
- Đảm bảo tính công bằng trong ghi nhận đóng góp.

**b) Suggestion (Đề xuất chỉnh sửa)**
##
## Hệ thống sử dụng **lớp Suggestion** để:
- Tách biệt giữa đề xuất và nội dung chính thức.
- Tránh tình trạng chỉnh sửa tuỳ tiện gây loạn tri thức.

Suggestion:

- Là yêu cầu chỉnh sửa do User chủ động tạo.
- Chỉ khi Suggestion được chấp nhận, nó mới:
  - Tác động lên Article.
  - Trở thành Contribution hợp lệ.

Nguyên tắc:
##
## **Không có Suggestion được duyệt → không có Contribution.**
##
## **3. Structural Contribution (Đóng góp cấu trúc & kết nối)**
##
## **3.1. Connection (Kết nối tri thức)**
##
## Hệ thống coi **kết nối tri thức** là một dạng đóng góp quan trọng, vì nó trực tiếp ảnh hưởng đến khả năng khám phá tri thức.
##
## Connection bao gồm:
- Liên kết Article với các Article khác có liên quan.
- Gắn Article vào đúng **Context**.
- Phân loại tri thức vào đúng Category hoặc chủ đề.

**3.2. Định nghĩa “Context” trong hệ thống**
##
## **Context không chỉ là vị trí địa lý.**
##
## Context được hiểu là:
##
## **Ngữ cảnh thực thể của tri thức**, trả lời câu hỏi:
## *Tri thức này thuộc về cái gì, của ai, và trong bối cảnh nào?*
##
## Ví dụ:
- Sách → nhà xuất bản, tác giả.
- Phim → đạo diễn, hãng phim.
- Quán ăn → địa điểm, khu vực.
- Chủ đề trừu tượng → Category hoặc hệ quy chiếu rõ ràng.

Việc gắn đúng Context giúp:

- Tri thức không bị lạc.
- Feed và discovery hoạt động hiệu quả.
- Người dùng dễ lướt đúng mối quan tâm.

**3.3. Điều kiện ghi nhận Connection**
##
## Không phải mọi kết nối đều là Contribution.
##
## Một Connection chỉ được ghi nhận khi:
- Có ý nghĩa ngữ cảnh.
- Được cộng đồng chấp nhận hoặc không bị phản đối tiêu cực.
- Thực sự giúp tri thức được khám phá tốt hơn.

**4. Signal Contribution (Đóng góp tín hiệu)**
##
## **4.1. Comment**
##
## Comment **không tự động là Contribution**.
##
## Nguyên tắc:
- Comment đơn lẻ không được coi là đóng góp tri thức.
- Comment **không trực tiếp sinh KV**.

Tuy nhiên, Comment có thể trở thành **Signal Contribution** trong các trường hợp:

- Một Comment được nhiều người upvote, thể hiện sự đồng thuận.
- Nhiều Comment khác nhau cùng phản ánh một vấn đề hoặc góc nhìn chung.

Trong các trường hợp này:

- Comment trở thành **tín hiệu tập thể**.
- Được hệ thống sử dụng để:
  - Gợi ý chỉnh sửa.
  - Đánh giá lại Article.
  - Kích hoạt Suggestion.

Lưu ý:

- Comment **không cần** được dùng làm cơ sở cho Edit hoặc Suggestion để được ghi nhận là tín hiệu.
- Việc tạo Suggestion là hành động **chủ động riêng**, không tự động sinh ra từ Comment.

**5. Những hành động KHÔNG phải Contribution**
##
## Hệ thống xác định rõ các hành động sau **không được coi là Contribution**:
- Edit chưa được chấp nhận.
- Suggestion bị từ chối.
- Comment cảm xúc ngắn (ví dụ: “Hay!”, “Ok”).
- Upvote (được xem là quà cho người đóng góp, không phải đóng góp).
- Tương tác xã hội thuần tuý không mang giá trị tri thức.

Các hành động này:

- Không bị cấm.
- Nhưng **không được ghi nhận giá trị**.

**6. Vai trò của Contribution Objects trong toàn hệ thống**
##
## <a name="_8wxuhsd06p27"></a>Contribution Objects:
- Là cầu nối giữa **Actors** và **Knowledge Objects**.
- Là cơ sở để:
  - Phân bổ Knowledge Value (KV).
  - Tính Knowledge Score (KS).
  - Thiết kế cơ chế khuyến khích công bằng.

Không có Contribution:

- Không có Attribution.
- Không có KS thực chất.
- Không có Incentives bền vững.
## <a name="_175ll12xb6z1"></a>**1. Knowledge Object là gì?**
Trong hệ thống Chia sẻ Tri Thức, **Knowledge Object** được định nghĩa là:

**Một đối tượng nội dung đại diện cho một tri thức cụ thể, có thể được khám phá, đánh giá và gắn với ngữ cảnh thực tế.**

Không phải mọi nội dung text đều là Knowledge Object.\
` `Chỉ những nội dung:

- Có **chủ đề rõ ràng**
- Có **ngữ cảnh**
- Có thể **được người khác sử dụng hoặc tham chiếu**

mới được coi là Knowledge Object.

-----
## <a name="_amfydps82caz"></a>**2. Article — Knowledge Object trung tâm**
### <a name="_qypfprvag1x"></a>**2.1. Định nghĩa**
**Article** là **Knowledge Object cốt lõi** của hệ thống.

Article **không phải là một bài viết thuần text**, mà là:

Một thực thể tri thức có cấu trúc, gắn với **một chủ đề hoặc thực thể ngoài đời**, được mô tả bằng nội dung văn bản.

-----
### <a name="_djohm7qecsuq"></a>**2.2. Cấu trúc khái niệm của Article**
Một Article bao gồm:

- **Title**\
  ` `→ Tên tri thức (ví dụ: tên sách, phim, địa điểm, chủ đề)
- **Description / Content**\
  ` `→ Nội dung mô tả, chia sẻ tri thức
- **Context / Location Note**\
  ` `→ Ngữ cảnh của tri thức, trả lời các câu hỏi:
  - Tri thức này thuộc về **ai**? (tác giả, đạo diễn, nhà xuất bản…)
  - Liên quan đến **cái gì**? (sách, phim, địa điểm, ý tưởng…)
  - Gắn với **đâu**? (địa điểm, không gian, nguồn gốc)

Mục tiêu của phần “location / context” **không phải là địa lý thuần túy**, mà là:

Giúp người dùng hiểu tri thức này “đứng ở đâu trong thế giới thực”.

-----
### <a name="_k7hv27yoyyhm"></a>**2.3. Article và việc khám phá tri thức**
Article được thiết kế để:

- Có thể xuất hiện trong **feed lướt**.
- Có thể được **tìm kiếm theo ngữ cảnh** (địa điểm, chủ đề, category).
- Tránh tình trạng tri thức bị “trôi” hoặc “lạc” như text thuần.

Do đó:

- Article **luôn gắn với ít nhất một chủ đề hoặc thực thể ngoài đời**.
- Ngay cả các nội dung trừu tượng (ví dụ: tâm linh) cũng:
  - Được gắn category rõ ràng.
  - Có ngữ cảnh để người dùng dễ khám phá.
-----
## <a name="_nvx75b4eupri"></a>**3. Comment — Đối tượng tri thức phụ trợ**
### <a name="_535731ir7432"></a>**3.1. Vai trò của Comment**
**Comment không phải là Knowledge Object độc lập**, nhưng là:

**Đối tượng phụ trợ quan trọng giúp đánh giá, mở rộng và làm rõ tri thức.**

Comment:

- Không mang KV độc lập.
- Không đứng ngang hàng với Article.
-----
### <a name="_c1bxgdk2gzfc"></a>**3.2. Comment chất lượng cao**
Một Comment có thể được coi là **có giá trị cao** khi:

- Mang tính phân tích, góp ý, phản biện.
- Chỉ ra vấn đề chung hoặc điểm cần cải thiện.
- Được nhiều người cùng phản ánh theo một hướng.

Trong các trường hợp này:

- Comment trở thành **tín hiệu** cho việc:
  - Điều chỉnh Article.
  - Sinh ra Contribution (chỉnh sửa, bổ sung).

Giá trị của Comment:

- Được ghi nhận **gián tiếp** thông qua hệ thống Attribution.
- Không trực tiếp sinh KV như Article.
-----
## <a name="_jh3qknqxhwq7"></a>**4. Knowledge Unit (KU) — Giải thích đơn giản, không ép dùng**
### <a name="_ss6oj1qloaue"></a>**4.1. Knowledge Unit là gì? (nói dễ hiểu)**
**Knowledge Unit (KU)** là:

*Một khái niệm thiết kế*, không phải một đối tượng bắt buộc.

Nó trả lời câu hỏi:

“Đơn vị NHỎ NHẤT nào trong hệ thống được coi là mang giá trị tri thức?”

-----
### <a name="_iesqriiy390r"></a>**4.2. Trạng thái hiện tại của hệ thống**
Ở **giai đoạn hiện tại**, hệ thống chọn cách:

**Article = Knowledge Unit**

Tức là:

- KV sinh ra từ Article.
- Contribution xoay quanh Article.
- Không cần tách KU riêng.

👉 Điều này **hoàn toàn ổn cho MVP**, và đúng với cách bạn đang hình dung.

-----
### <a name="_o4ypfug0q9nr"></a>**4.3. Vì sao vẫn nhắc đến KU?**
KU chỉ được giữ lại như:

- Một **khái niệm mở** cho tương lai.
- Phòng trường hợp sau này:
  - Tách version
  - Tách chỉnh sửa lớn
  - Tách tri thức con trong 1 Article

👉 Hiện tại: **bạn không cần quan tâm sâu đến KU**.

-----
## <a name="_nel6z4sco1e5"></a>**5. Gắn tri thức với “thực thể ngoài đời”**
Nguyên tắc thiết kế:

**Mọi Knowledge Object phải gắn với ít nhất một thực thể hoặc chủ đề rõ ràng trong thế giới thực.**

Thực thể này có thể là:

- Địa điểm (quán ăn, không gian)
- Sách, phim, tác phẩm
- Con người, tổ chức
- Chủ đề trừu tượng (ví dụ: tâm linh), nhưng có category rõ ràng

Mục tiêu:

- Tránh tri thức bị lan man.
- Giúp người dùng **lướt đúng thứ họ quan tâm**.
- Tăng khả năng khám phá và gợi ý.
-----
## <a name="_dzcbdnpi9nq2"></a>**6. Ranh giới của Knowledge Objects**
**KHÔNG phải Knowledge Object**:

- Tương tác xã hội thuần túy.
- Upvote.
- Comment ngắn mang tính cảm xúc.

**LÀ Knowledge Object**:

- Article có nội dung, ngữ cảnh, chủ đề rõ ràng.
-----
## <a name="_gwframbroz07"></a>**7. Vai trò của Knowledge Objects trong toàn hệ thống**
Knowledge Objects:

- Là nơi **giá trị tri thức được sinh ra**.
- Là trung tâm của:
  - Contribution
  - KV
  - Discovery / Feed
- Là nền móng cho:
  - Attribution & Incentive

<a name="_ts1ivrb1ik0v"></a>Value & Reputation
## <a name="_3pcms27igj1"></a>**1. Phân biệt hai khái niệm trung tâm**
Hệ thống sử dụng **hai chỉ số tách biệt nhưng liên kết chặt chẽ**:

- **Knowledge Value (KV)** → đo **giá trị của tri thức**
- **Knowledge Score (KS)** → đo **uy tín của người dùng**

Nguyên tắc cốt lõi:

**Tri thức có giá trị không đồng nghĩa người tạo ra nó luôn có uy tín cao.\
` `Uy tín cao không đồng nghĩa mọi tri thức người đó tạo ra đều có giá trị.**

Việc tách KV và KS giúp hệ thống:

- Tránh sùng bái cá nhân.
- Tránh “ăn ké” uy tín.
- Đánh giá tri thức và con người một cách độc lập.
-----
## <a name="_fak59teuxikl"></a>**2. Knowledge Value (KV)**
### <a name="_31sq6yyeqmbz"></a>**2.1. Định nghĩa**
**Knowledge Value (KV)** là:

**Chỉ số phản ánh mức độ hữu ích và mức độ được cộng đồng thừa nhận của một tri thức tại một thời điểm nhất định.**

KV:

- Gắn với **Knowledge Object** (hiện tại là Article).
- Không gắn trực tiếp với User.
- Là một chỉ số **động**, có thể thay đổi theo thời gian.
-----
### <a name="_ioihp2ro309o"></a>**2.2. Bản chất của KV**
KV phản ánh **đồng thời hai yếu tố**:

1. **Mức độ hữu ích thực tế**
   1. Tri thức có được sử dụng, tham khảo, áp dụng hay không.
1. **Mức độ đồng thuận cộng đồng**
   1. Tri thức có được đánh giá tích cực, bảo vệ, hay bị phản đối.

Do đó:

**KV không chỉ là “hay”, mà là “hay và được chấp nhận”.**

-----
### <a name="_lq9k6avldw4q"></a>**2.3. KV có thể tăng và giảm**
Knowledge Value:

- **Có thể tăng** khi:
  - Tri thức được cải thiện.
  - Được kết nối đúng ngữ cảnh.
  - Được cộng đồng đánh giá tích cực.
- **Có thể giảm** khi:
  - Nội dung lỗi thời.
  - Bị phản đối hoặc downvote hợp lệ.
  - Không còn phù hợp với ngữ cảnh hiện tại.

Nguyên tắc:

**Tri thức không được bảo toàn giá trị vĩnh viễn chỉ vì từng có giá trị trong quá khứ.**

-----
## <a name="_cifb96uut3jn"></a>**3. Knowledge Score (KS)**
### <a name="_wv0teqxdqx8x"></a>**3.1. Định nghĩa**
**Knowledge Score (KS)** là:

**Chỉ số phản ánh uy tín của một người dùng, dựa trên tổng giá trị tri thức mà họ đã đóng góp và được ghi nhận theo thời gian.**

KS:

- Gắn với **User**.
- Không đo mức độ hoạt động.
- Không đo số lượng hành động.
- Chỉ đo **giá trị tri thức đã được ghi nhận**.
-----
### <a name="_79nowue8kxmo"></a>**3.2. Quan hệ giữa KV và KS**
- KV sinh ra từ tri thức.
- KV được **phân bổ (attributed)** cho User thông qua các Contribution hợp lệ.
- KS là **tổng hợp các phần KV mà User được ghi nhận**.

Tóm lại:

Knowledge Objects → KV

KV → phân bổ qua Contribution

Contribution → KS (User)

-----
### <a name="_fblcfi525511"></a>**3.3. KS suy giảm theo thời gian**
KS **không phải là điểm vĩnh viễn**.

Hệ thống cho phép:

- KS **giảm nhẹ theo thời gian** nếu User:
  - Không còn đóng góp.
  - Không duy trì chất lượng tri thức.

Mục tiêu:

- Khuyến khích đóng góp bền vững.
- Tránh việc “ngủ trên chiến công cũ”.
- Giữ cho uy tín phản ánh **năng lực hiện tại**, không chỉ lịch sử.
-----
## <a name="_5xid4ri8jj0b"></a>**4. Level / Rank (Cấp bậc uy tín)**
### <a name="_9bpba8612d4g"></a>**4.1. Vai trò của Level**
**Level / Rank** là:

- Biểu hiện xã hội của KS.
- Một lớp trừu tượng trên KS để:
  - Hiển thị uy tín.
  - Phân tầng người dùng.

Level:

- Không phải là chỉ số độc lập.
- Không thay thế KS.
-----
### <a name="_dzzt4brenik4"></a>**4.2. Level và quyền hạn**
Level có thể ảnh hưởng đến:

- Mức độ tin cậy khi đánh giá tri thức.
- Khả năng được hệ thống đề xuất nội dung nhiều hơn.
- Một số **quyền hạn mềm** (soft permissions).

Tuy nhiên:

- Quyền hạn **phải được kiểm soát**.
- Level **không trao quyền tuyệt đối**.
- Không cho phép một cá nhân lấn át cộng đồng chỉ vì cấp bậc cao.

Nguyên tắc:

**Uy tín làm tăng tiếng nói, không tạo độc quyền.**

-----
## <a name="_rwugq2ow12nd"></a>**5. Ranh giới của Value & Reputation**
**KHÔNG thuộc phạm vi này**:

- Token.
- Phần thưởng kinh tế.
- Quy đổi tiền.

Value & Reputation:

- Chỉ định nghĩa **giá trị và uy tín**.
- Là nền tảng để Incentive Objects hoạt động phía sau.
-----
## <a name="_zh695pxd9m26"></a>**6. Vai trò của Value & Reputation trong toàn hệ thống**
Phần Value & Reputation:

- Là “bộ đo” của toàn hệ thống.
- Kết nối:
  - Knowledge Objects
  - Contribution Objects
  - Incentive Objects
- Đảm bảo rằng:
  - Hệ thống thưởng đúng người.
  - Uy tín phản ánh giá trị thật.
  - Tri thức không bị thao túng bởi hành vi xã hội.

<a name="_ednniq7fkvo"></a>Contribution Objects
## <a name="_ce2x1tvv2ia7"></a>**1. Contribution Object là gì?**
Trong hệ thống Chia sẻ Tri Thức, **Contribution Object** được định nghĩa là:

**Một hành động của User chỉ được coi là đóng góp khi nó được cộng đồng chấp nhận và có khả năng làm gia tăng Knowledge Value (KV) của tri thức.**

Nguyên tắc cốt lõi:

- **Không phải mọi chỉnh sửa đều là đóng góp.**
- **Không phải mọi tương tác đều tạo giá trị.**
- Chỉ những hành động **được xác nhận bởi cộng đồng** mới trở thành Contribution hợp lệ.
-----
## <a name="_o05pn66tjhfe"></a>**2. Các loại Contribution Objects chính**
Hệ thống xác định **ba nhóm Contribution Objects**, phản ánh các cách khác nhau mà người dùng có thể làm tăng giá trị tri thức.

-----
### <a name="_dko2uvv56pmd"></a>**2.1. Content Contribution (Đóng góp nội dung)**
#### <a name="_ni14te95f1qm"></a>**a) Edit (Chỉnh sửa nội dung)**
- Edit **không tự động** được coi là Contribution.
- Một chỉnh sửa chỉ trở thành Contribution khi:
  - Được cộng đồng chấp nhận.
  - Hoặc được đánh giá tích cực thông qua các tín hiệu xã hội.

Nguyên tắc:

**Cộng đồng là trọng tài cuối cùng**, không phải tác giả gốc hay hệ thống tự động.

Điều này nhằm:

- Tránh thiên vị cá nhân.
- Giảm rủi ro đánh giá chủ quan từ tác giả ban đầu.
- Đảm bảo tính công bằng trong ghi nhận đóng góp.
-----
#### <a name="_8tp0b8cyiw1i"></a>**b) Suggestion (Đề xuất chỉnh sửa)**
Hệ thống sử dụng **lớp Suggestion** để:

- Tách biệt giữa đề xuất và nội dung chính thức.
- Tránh tình trạng chỉnh sửa tuỳ tiện gây loạn tri thức.

Suggestion:

- Là yêu cầu chỉnh sửa do User chủ động tạo.
- Chỉ khi Suggestion được chấp nhận, nó mới:
  - Tác động lên Article.
  - Trở thành Contribution hợp lệ.

Nguyên tắc:

**Không có Suggestion được duyệt → không có Contribution.**

-----
## <a name="_b2rciq5mp6h4"></a>**3. Structural Contribution (Đóng góp cấu trúc & kết nối)**
### <a name="_qmcs42jewo0m"></a>**3.1. Connection (Kết nối tri thức)**
Hệ thống coi **kết nối tri thức** là một dạng đóng góp quan trọng, vì nó trực tiếp ảnh hưởng đến khả năng khám phá tri thức.

Connection bao gồm:

- Liên kết Article với các Article khác có liên quan.
- Gắn Article vào đúng **location / context**.
- Phân loại tri thức vào đúng category hoặc chủ đề.
-----
### <a name="_iai336ejxvdi"></a>**3.2. Định nghĩa “Location” trong hệ thống**
**Location không chỉ là vị trí địa lý.**

Location được hiểu là:

**Ngữ cảnh thực thể của tri thức**, trả lời câu hỏi:\
` `*Tri thức này thuộc về cái gì, của ai, và trong bối cảnh nào?*

Ví dụ:

- Sách → nhà xuất bản, tác giả.
- Phim → đạo diễn, hãng phim.
- Quán ăn → địa điểm, khu vực.
- Chủ đề trừu tượng → category hoặc hệ quy chiếu rõ ràng.

Việc gắn đúng location giúp:

- Tri thức không bị lạc.
- Feed và discovery hoạt động hiệu quả.
- Người dùng dễ lướt đúng mối quan tâm.
-----
### <a name="_vq2a9j1x6xmc"></a>**3.3. Điều kiện ghi nhận Connection**
Không phải mọi kết nối đều là Contribution.

Một Connection chỉ được ghi nhận khi:

- Có ý nghĩa ngữ cảnh.
- Được cộng đồng chấp nhận hoặc không bị phản đối tiêu cực.
- Thực sự giúp tri thức được khám phá tốt hơn.
-----
## <a name="_62ubkjv7l8de"></a>**4. Signal Contribution (Đóng góp tín hiệu)**
### <a name="_eaujomekccpt"></a>**4.1. Comment**
Comment **không tự động là Contribution**.

Nguyên tắc:

- Comment đơn lẻ không được coi là đóng góp tri thức.
- Comment **không trực tiếp sinh KV**.

Tuy nhiên, Comment có thể trở thành **Signal Contribution** trong các trường hợp:

- Một Comment được nhiều người upvote, thể hiện sự đồng thuận.
- Nhiều Comment khác nhau cùng phản ánh một vấn đề hoặc góc nhìn chung.

Trong các trường hợp này:

- Comment trở thành **tín hiệu tập thể**.
- Được hệ thống sử dụng để:
  - Gợi ý chỉnh sửa.
  - Đánh giá lại Article.
  - Kích hoạt Suggestion.

Lưu ý:

- Comment **không cần** được dùng làm cơ sở cho Edit hoặc Suggestion để được ghi nhận là tín hiệu.
- Việc tạo Suggestion là hành động **chủ động riêng**, không tự động sinh ra từ Comment.
-----
## <a name="_u0glrchrfx6r"></a>**5. Những hành động KHÔNG phải Contribution**
Hệ thống xác định rõ các hành động sau **không được coi là Contribution**:

- Edit chưa được chấp nhận.
- Suggestion bị từ chối.
- Comment cảm xúc ngắn (ví dụ: “Hay!”, “Ok”).
- Upvote (được xem là quà cho người đóng góp, không phải đóng góp).
- Tương tác xã hội thuần tuý không mang giá trị tri thức.

Các hành động này:

- Không bị cấm.
- Nhưng **không được ghi nhận giá trị**.
-----
## <a name="_slefqz1vhnkk"></a>**6. Vai trò của Contribution Objects trong toàn hệ thống**
Contribution Objects:

- Là cầu nối giữa **Actors** và **Knowledge Objects**.
- Là cơ sở để:
  - Phân bổ Knowledge Value (KV).
  - Tính Knowledge Score (KS).
  - Thiết kế cơ chế khuyến khích công bằng.

Không có Contribution:

- Không có Attribution.
- Không có KS thực chất.
- Không có Incentives bền vững.

<a name="_sv3n9ee1zpaq"></a>Incentive Objects
## <a name="_2wyv97q33uyy"></a>**1️⃣ Khung tư duy cốt lõi (rất quan trọng)**
Trong hệ thống của bạn, chuỗi logic luôn là:

Tri thức có giá trị

`      `↓

Knowledge Value (KV)

`      `↓

Knowledge Score (KS)

`      `↓

Incentives

❌ **Không bao giờ được đảo ngược**:

- Không phải vì có token → tri thức có giá trị
- Không phải vì có thưởng → đóng góp là tốt
-----
## <a name="_d2wed1loy9rn"></a>**2️⃣ Định nghĩa Incentive Object**
**Incentive Object** là:

**Một cơ chế hoặc tài sản mà hệ thống sử dụng để khuyến khích hành vi tạo giá trị, dựa trên uy tín và đóng góp đã được ghi nhận.**

Incentive:

- Luôn đứng **sau KS**
- Không can thiệp trực tiếp vào KV
- Không quyết định đúng/sai của tri thức
-----
## <a name="_hoheilyfxw2b"></a>**3️⃣ Các loại Incentive Objects trong hệ thống**
Hệ thống của bạn sử dụng **ba nhóm Incentive chính**, từ mềm → cứng:

-----
## <a name="_gmi97jav4wfw"></a>**3.1. Social Incentives (Động lực xã hội)**
**Social Incentives là các hình thức khuyến khích phi tài chính, nhằm tạo ra:**

- **Cảm giác được ghi nhận**
- **Sự gắn kết cộng đồng**
- **Động lực đóng góp dài hạn**

**Các Social Incentives không làm tăng Knowledge Value (KV) và không thay thế Knowledge Score (KS), mà được kích hoạt dựa trên KS.**

-----
### <a name="_aiz3ml55rjvg"></a>**a) Level / Rank hiển thị**
- **Level / Rank là biểu hiện xã hội của uy tín.**
- **Giúp người dùng:**
  - Nhận diện nhanh mức độ đóng góp của nhau
  - Tạo động lực phấn đấu tự nhiên

**Level:**

- Không phải quyền lực tuyệt đối
- Không đảm bảo phần thưởng kinh tế
- Chủ yếu phản ánh độ tin cậy và vị thế tri thức
-----
### <a name="_crvkih4g7sev"></a>**b) Danh hiệu (Badge / Title)**
Hệ thống có thể cấp:

- Danh hiệu theo chủ đề (Ví dụ: *Food Scholar*, *Book Curator*, *Film Analyst*)
- Danh hiệu theo giai đoạn hoặc thành tích

**Danh hiệu:**

- Mang tính biểu tượng
- Không thể mua
- Không chuyển nhượng
- Gắn với lịch sử đóng góp

**👉 Mục tiêu là tạo niềm tự hào cá nhân, không phải cạnh tranh tiền bạc.**

-----
### <a name="_9sh6mrd5pfjc"></a>**c) Mức độ được hệ thống đề xuất nội dung**
User có:

- KS cao
- Lịch sử đóng góp chất lượng

sẽ:

- Được ưu tiên hiển thị bài viết
- Được đề xuất nhiều hơn trong feed
- Có ảnh hưởng lớn hơn đến dòng tri thức

**Nguyên tắc:**

**Uy tín khuếch đại tiếng nói, không thay thế giá trị.**

-----
### <a name="_6hns4os4k4uz"></a>**d) Tham gia & nhận phần thưởng từ các sự kiện (Events)**
Ngoài các hình thức trên, hệ thống cung cấp Social Incentives nâng cao thông qua các sự kiện cộng đồng do nền tảng tổ chức.

**Bao gồm:**

- **Được mời tham gia các event online/offline**
  - Workshop
  - Talk chuyên đề
  - Community meetup
- **Được tham gia sớm (early access) các tính năng mới**
- **Được nhận phần thưởng đặc biệt:**
  - Badge giới hạn
  - KNOW-U bonus
  - KNOW-G airdrop có điều kiện
  - Quà tặng từ đối tác (nếu có)

**Điều kiện tham gia:**

- Không dựa trên tiền
- Dựa trên:
  - Knowledge Score
  - Chủ đề đóng góp
  - Lịch sử hoạt động tích cực

**Nguyên tắc:**

Sự công nhận từ cộng đồng và nền tảng là một phần thưởng giá trị ngang với token.

-----
### <a name="_brng3il4cqy5"></a>**3.2. Utility Incentives (Token tiện ích – KNOW-U)**
**KNOW-U** là:

- Token tiện ích nội bộ của hệ thống
- Đại diện cho **khả năng sử dụng dịch vụ**, không phải quyền lực

KNOW-U có thể dùng để:

- Mở khoá nội dung nâng cao
- Tạo Suggestion (đặt cọc / phí)
- Truy cập tính năng đặc biệt
- Giảm spam bằng chi phí hành động

KNOW-U:

- Không đại diện cho quyền sở hữu hệ thống
- Không phản ánh trực tiếp uy tín
- Không đảm bảo lợi nhuận

Nguyên tắc:

**KNOW-U là công cụ điều tiết hành vi, không phải phần thưởng danh dự.**

-----
### <a name="_mzrch29qpz8l"></a>**3.3. Governance Incentives (Token quản trị – KNOW-G)**
**KNOW-G** là:

- Token đại diện cho **quyền tham gia quản trị**
- **Có thể:**
  - **giao dịch tự do**
  - **tích hợp DEX/CEX**
- Gắn với những User có:
  - KS cao
  - đóng góp dài hạn

KNOW-G cho phép:

- Tham gia bỏ phiếu các quyết định hệ thống
- Định hướng chính sách
- Ảnh hưởng đến luật chơi tương lai

Tuy nhiên:

- **quyền quản trị trong hệ thống không phụ thuộc duy nhất vào số lượng token nắm giữ**\

- phải kết hợp với **Knowledge Score (KS)** và các điều kiện khác
- Nguyên tắc:
  - **Blockchain quyết định sở hữu.**
  - **Hệ thống quyết định quyền lực.**
-----
## <a name="_vhqjyl7mwwqv"></a>**4️⃣ Quan hệ giữa KS và Incentives**
- **KS là điều kiện cần** để tiếp cận Incentive.
- Incentive **không làm tăng KS trực tiếp**.
- Incentive chỉ mở ra:
  - quyền
  - khả năng
  - động lực

Ví dụ:

- KS cao → được nhận KNOW-G
- KS ổn định → được ưu tiên đề xuất nội dung
- KS thấp → vẫn dùng hệ thống, nhưng ít ảnh hưởng hơn
-----
## <a name="_7q2y689krvzu"></a>**5️⃣ Ranh giới rõ ràng (tránh biến hệ thống thành “farm token”)**
Hệ thống **cố tình không thưởng**:

- Upvote
- Comment cho vui
- Hoạt động xã hội không gắn tri thức

Hệ thống **chỉ thưởng gián tiếp** khi:

- Giá trị tri thức được xác nhận
- Uy tín được tích luỹ

Nguyên tắc:

**Không thưởng hành động, chỉ thưởng kết quả giá trị.**

-----
## <a name="_p5g7dckicl8p"></a>**6️⃣ Incentive Objects KHÔNG làm gì?**
Incentive Objects:

- Không đánh giá tri thức đúng/sai
- Không can thiệp vào Attribution
- Không thay thế Value & Reputation

Nếu Incentive:

- được dùng để thao túng tri thức
- trở thành mục tiêu chính

→ hệ thống sẽ **tự phá vỡ**.

-----
## <a name="_z7c3vbdjtxmg"></a>**7️⃣ Vai trò của Incentive Objects trong toàn hệ thống**
Incentive Objects:

- Là **động cơ vận hành**, không phải nền móng
- Tạo vòng lặp tích cực:
  - đóng góp → uy tín → động lực → đóng góp tốt hơn
- Giữ người dùng ở lại lâu dài mà không làm hỏng giá trị tri thức

