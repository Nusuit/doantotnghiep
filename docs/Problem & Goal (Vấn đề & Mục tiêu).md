## <a name="_h672tlmkhg34"></a>**1. Problem Statement (Vấn đề hiện tại)**
Trong các nền tảng trực tuyến hiện nay, việc **tiếp cận và chia sẻ tri thức** đang bị phân mảnh và thiếu một không gian tích hợp phù hợp cho hành vi “lướt để học”.

- Các nền tảng bản đồ như **Google Maps** rất mạnh về dữ liệu vị trí, nhưng **thiếu cơ chế hiển thị nội dung tri thức dạng feed**, khiến người dùng khó tiếp cận thông tin theo cách khám phá tự nhiên.
- Các nền tảng nội dung như **Foody** hay mạng xã hội lại thiên về hình ảnh, đánh giá ngắn và giải trí, dẫn đến:
  - Chi phí vận hành cao (image-heavy).
  - Nội dung nhanh, nông, ít giá trị tri thức dài hạn.
- Các nền tảng tri thức thuần túy như **Wikipedia** tuy đáng tin cậy nhưng:
  - Mang tính phi lợi nhuận.
  - Không tạo ra động lực kinh tế cho người đóng góp.
  - Thiếu cảm giác “sở hữu” và “tự hào cá nhân” đối với tri thức đã chia sẻ.

Hệ quả là:

- Người dùng có kiến thức **không có động lực chia sẻ sâu**.
- Người đọc **bị cuốn vào nội dung “vô tri”** thay vì tri thức có giá trị.
- Tri thức chất lượng bị chìm giữa các nền tảng giải trí.
-----
## <a name="_bi08j35f6xwa"></a>**2. Root Cause (Nguyên nhân gốc)**
Vấn đề không nằm ở người dùng, mà nằm ở **cách các hệ thống hiện tại được thiết kế**:

- Các nền tảng **chưa tích hợp được nhiều chiều của tri thức**:
  - Nội dung (text-based, dài hạn)
  - Ngữ cảnh (địa điểm, nơi bán, nơi liên quan)
  - Khả năng khám phá (feed, lướt, gợi ý)
- Các hệ thống hiện tại:
  - Hoặc mạnh về bản đồ nhưng yếu về nội dung tri thức.
  - Hoặc mạnh về nội dung nhưng thiếu cấu trúc và không gắn với thế giới thực.
- Mô hình phi lợi nhuận hoặc quảng cáo khiến **đóng góp tri thức không được ghi nhận bằng giá trị thực**.
-----
## <a name="_ar2fe74fo9x0"></a>**3. Opportunity (Cơ hội)**
Có một khoảng trống rõ ràng cho một nền tảng:

- Cho phép người dùng **lướt tri thức** giống như lướt feed, nhưng:
  - Là tri thức thực (sách, phim, địa điểm, kiến thức).
  - Có chiều sâu, có ngữ cảnh.
- Tích hợp:
  - Nội dung dạng văn bản (text-based, chi phí thấp, bền vững).
  - Dữ liệu vị trí (maps).
- Xây dựng một **“Wikipedia thế hệ mới”**, nhưng:
  - Có tính sở hữu cá nhân.
  - Có động lực kinh tế rõ ràng.
  - Có thể giao dịch giá trị đóng góp thông qua blockchain.
-----
## <a name="_bl8372b7ldv5"></a>**4. Goal of the System (Mục tiêu hệ thống)**
### <a name="_jye2h1ofs2ql"></a>**4.1. Mục tiêu tổng quát**
Hệ thống được xây dựng nhằm tạo ra một **môi trường chia sẻ tri thức nơi người dùng cảm thấy tự hào về đóng góp của mình**, được ghi nhận giá trị một cách minh bạch và có thể chuyển hóa thành lợi ích kinh tế thực thông qua blockchain.

-----
### <a name="_vfas0kphhwev"></a>**4.2. Mục tiêu cụ thể**
- Tạo một nền tảng cho phép người dùng:
  - Chia sẻ tri thức (sách, phim, địa điểm, kiến thức chuyên môn).
  - Khám phá tri thức thông qua hành vi lướt feed thay vì tìm kiếm thụ động.
- Gắn tri thức với:
  - Ngữ cảnh thực (địa điểm, nơi bán, nơi liên quan).
  - Cộng đồng người đóng góp.
- Ghi nhận và định lượng giá trị của tri thức:
  - Không chỉ bằng lượt xem hay lượt thích.
  - Mà bằng các chỉ số uy tín và đóng góp.
- Ứng dụng blockchain để:
  - Biến đóng góp tri thức thành tài sản có giá trị.
  - Trao token tiện ích và token quản trị cho người dùng.
  - Cho phép người dùng tham gia quản trị hoặc quy đổi giá trị sang tài sản thực.
-----
### <a name="_1b25g6fdk06r"></a>**4.3. Tuyên bố mục tiêu (1 câu)**
**Hệ thống này được xây dựng để tạo ra một không gian nơi tri thức được khám phá như một dòng chảy, được sở hữu bởi người đóng góp và được ghi nhận bằng giá trị thực thông qua công nghệ blockchain.**

-----
## <a name="_2gs8ov4nw356"></a>**5. Out of Scope (Chưa xét ở giai đoạn này)**
- Tối ưu AI nâng cao.
- Nội dung giải trí thuần túy.
- Mạng xã hội hình ảnh nặng.
- Các mô hình thương mại phức tạp ngoài phạm vi MVP.
-----
## <a name="_m0mkgkjopq8p"></a>**6. Vai trò của tài liệu này**
Tài liệu *Problem & Goal* đóng vai trò là:

- Kim chỉ nam cho mọi quyết định thiết kế tiếp theo.
- Cơ sở để xác định:
  - Value Model
  - Core Concepts
  - MVP Scope
- Tiêu chí để loại bỏ các ý tưởng không phục vụ mục tiêu cốt lõi.

