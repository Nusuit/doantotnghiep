import { PrismaClient, TaxonomyType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(params: {
  email: string;
  passwordHash: string;
  role?: "ADMIN" | "USER" | "MODERATOR";
  displayName: string;
  avatarUrl?: string;
  reputationScore?: number;
  knowUBalance?: number;
  knowGBalance?: number;
  isEmailVerified?: boolean;
  accountStatus?: "ACTIVE" | "PENDING_VERIFY" | "SUSPENDED" | "BANNED";
}) {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
    select: { id: true },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        role: params.role ?? "USER",
        reputationScore: params.reputationScore ?? 0,
        knowUBalance: params.knowUBalance ?? 0,
        knowGBalance: params.knowGBalance ?? 0,
        accountStatus: params.accountStatus ?? "ACTIVE",
        security: {
          upsert: {
            create: {
              passwordHash: params.passwordHash,
              isEmailVerified: params.isEmailVerified ?? true,
            },
            update: {
              passwordHash: params.passwordHash,
              isEmailVerified: params.isEmailVerified ?? true,
            },
          },
        },
        profile: {
          upsert: {
            create: {
              displayName: params.displayName,
              avatarUrl: params.avatarUrl ?? null,
            },
            update: {
              displayName: params.displayName,
              avatarUrl: params.avatarUrl ?? null,
            },
          },
        },
      },
      select: { id: true, email: true },
    });
  }

  return prisma.user.create({
    data: {
      email: params.email,
      role: params.role ?? "USER",
      accountStatus: params.accountStatus ?? "ACTIVE",
      reputationScore: params.reputationScore ?? 0,
      knowUBalance: params.knowUBalance ?? 0,
      knowGBalance: params.knowGBalance ?? 0,
      security: {
        create: {
          passwordHash: params.passwordHash,
          isEmailVerified: params.isEmailVerified ?? true,
        },
      },
      profile: {
        create: {
          displayName: params.displayName,
          avatarUrl: params.avatarUrl ?? null,
        },
      },
    },
    select: { id: true, email: true },
  });
}

// ── HCM Food Spots Data ───────────────────────────────────────────────────────

const hcmFoodPlaces = [
  { name: "Phở Hòa Pasteur", address: "260C Pasteur, Quận 3, TP.HCM", lat: 10.7769, lng: 106.6917, category: "pho", sourceRef: "seed:pho-hoa-pasteur" },
  { name: "Bánh Mì Huỳnh Hoa", address: "26 Lê Thị Riêng, Quận 1, TP.HCM", lat: 10.7701, lng: 106.6894, category: "banh-mi", sourceRef: "seed:banh-mi-huynh-hoa" },
  { name: "Cơm Tấm Sườn Nướng Bụi", address: "84 Đặng Văn Ngữ, Quận Phú Nhuận, TP.HCM", lat: 10.7824, lng: 106.6841, category: "com-tam", sourceRef: "seed:com-tam-bui" },
  { name: "Bún Bò Huế Ông Già", address: "1A Kỳ Đồng, Quận 3, TP.HCM", lat: 10.7801, lng: 106.6882, category: "bun-bo", sourceRef: "seed:bun-bo-ong-gia" },
  { name: "Hủ Tiếu Nam Vang Thanh Xuân", address: "62 Nguyễn Trãi, Quận 5, TP.HCM", lat: 10.7558, lng: 106.6640, category: "hu-tieu", sourceRef: "seed:hu-tieu-thanh-xuan" },
  { name: "Lẩu Mắm Út Dzách", address: "Thoại Ngọc Hầu, Quận Tân Phú, TP.HCM", lat: 10.7879, lng: 106.6356, category: "lau", sourceRef: "seed:lau-mam-ut-dzach" },
  { name: "Bún Thịt Nướng Cô Ba Vũng Tàu", address: "105 Đinh Tiên Hoàng, Quận Bình Thạnh, TP.HCM", lat: 10.7998, lng: 106.7149, category: "bun", sourceRef: "seed:bun-thit-nuong-co-ba" },
  { name: "Cháo Lòng Ngã Tư Bảy Hiền", address: "Nguyễn Hồng Đào, Quận Tân Bình, TP.HCM", lat: 10.7921, lng: 106.6581, category: "chao", sourceRef: "seed:chao-long-bay-hien" },
  { name: "Gỏi Cuốn Cô Hiền", address: "34 Phan Bội Châu, Quận Bình Thạnh, TP.HCM", lat: 10.8031, lng: 106.7071, category: "goi-cuon", sourceRef: "seed:goi-cuon-co-hien" },
  { name: "Ốc Đào Tân Định", address: "41 Phạm Viết Chánh, Quận 1, TP.HCM", lat: 10.7884, lng: 106.6920, category: "oc", sourceRef: "seed:oc-dao-tan-dinh" },
  { name: "Cà Phê Trứng Long Hải", address: "10 Võ Văn Tần, Quận 3, TP.HCM", lat: 10.7761, lng: 106.6865, category: "cafe", sourceRef: "seed:ca-phe-trung-long-hai" },
  { name: "Bánh Xèo 46A Đinh Công Tráng", address: "46A Đinh Công Tráng, Quận 1, TP.HCM", lat: 10.7816, lng: 106.6988, category: "banh-xeo", sourceRef: "seed:banh-xeo-46a" },
  { name: "Chè Hiển Khánh", address: "26 Lê Thánh Tôn, Quận 1, TP.HCM", lat: 10.7748, lng: 106.7007, category: "che", sourceRef: "seed:che-hien-khanh" },
  { name: "Bánh Canh Cua Quận 10", address: "420 Sư Vạn Hạnh, Quận 10, TP.HCM", lat: 10.7729, lng: 106.6697, category: "banh-canh", sourceRef: "seed:banh-canh-cua-q10" },
  { name: "Mì Vịt Tiềm Tân Phú", address: "160 Lũy Bán Bích, Quận Tân Phú, TP.HCM", lat: 10.7841, lng: 106.6322, category: "mi", sourceRef: "seed:mi-vit-tiem-tan-phu" },
  { name: "Sủi Cảo Vĩnh Khánh", address: "Vĩnh Khánh, Quận 4, TP.HCM", lat: 10.7628, lng: 106.6978, category: "sui-cao", sourceRef: "seed:sui-cao-vinh-khanh" },
  { name: "Bánh Tráng Trộn Trường Chinh", address: "Trường Chinh, Quận Tân Bình, TP.HCM", lat: 10.7951, lng: 106.6502, category: "banh-trang", sourceRef: "seed:banh-trang-tron-truong-chinh" },
  { name: "Nem Cuốn Bà Đắc Chợ Bến Thành", address: "Chợ Bến Thành, Quận 1, TP.HCM", lat: 10.7720, lng: 106.6980, category: "nem-cuon", sourceRef: "seed:nem-cuon-ba-dac" },
  { name: "Cơm Niêu Sài Gòn", address: "2A Đinh Tiên Hoàng, Quận 1, TP.HCM", lat: 10.7784, lng: 106.7002, category: "com-nieu", sourceRef: "seed:com-nieu-sai-gon" },
  { name: "Xôi Lá Cẩm Phú Nhuận", address: "Huỳnh Văn Bánh, Quận Phú Nhuận, TP.HCM", lat: 10.7967, lng: 106.6814, category: "xoi", sourceRef: "seed:xoi-la-cam-phu-nhuan" },
];

// ── Article content — 20 posts >200 words each (Food/Restaurant field) ────────

const articleData = [
  {
    title: "Phở Hòa Pasteur – Bát Phở Chuẩn Vị Sài Gòn Hơn 60 Năm",
    content: `Nếu bạn hỏi người Sài Gòn về một quán phở đã trở thành huyền thoại của thành phố, cái tên Phở Hòa Pasteur sẽ luôn được nhắc đến đầu tiên. Tọa lạc tại số 260C Pasteur, Quận 3, quán phở này đã hoạt động hơn 60 năm và vẫn giữ nguyên hương vị truyền thống đặc trưng mà không có bất kỳ nơi nào ở Sài Gòn có thể thay thế được.

Điều làm nên sự khác biệt của Phở Hòa Pasteur chính là nước dùng. Nước dùng được hầm từ xương bò trong nhiều giờ đồng hồ, kết hợp với các loại gia vị truyền thống như hoa hồi, quế, gừng nướng và thảo quả. Kết quả là một bát nước dùng trong vắt, thơm nức mũi và đậm đà đến mức bạn sẽ muốn húp đến giọt cuối cùng.

Bánh phở ở đây được làm tươi mỗi ngày, mềm mại và không bị nhão. Thịt bò được thái mỏng, tái hoặc chín tùy theo yêu cầu, có thể thêm gân, sách hoặc bò viên. Giá thành từ 60.000 đến 90.000 đồng một bát, không hề rẻ so với phở vỉa hè nhưng hoàn toàn xứng đáng với chất lượng nhận được.

Quán mở cửa từ 6 giờ sáng đến 12 giờ trưa và từ 5 giờ chiều đến 12 giờ đêm. Buổi sáng sớm là thời điểm đông khách nhất, hàng người thường xếp dài ra ngoài cửa nhưng phục vụ rất nhanh. Không gian quán khá chật nhưng sạch sẽ và thoáng mát. Đây là địa chỉ không thể bỏ qua khi ghé Sài Gòn.`,
    upvotes: 9, saves: 4,
  },
  {
    title: "Bánh Mì Huỳnh Hoa – Ổ Bánh Mì Nổi Tiếng Nhất Sài Gòn",
    content: `Bánh Mì Huỳnh Hoa tại 26 Lê Thị Riêng, Quận 1 không chỉ là một tiệm bánh mì bình thường – đây là một biểu tượng ẩm thực của TP.HCM đã thu hút hàng nghìn khách mỗi ngày suốt nhiều thập kỷ qua. Nhiều du khách quốc tế khi đến Sài Gòn đều coi việc ăn bánh mì Huỳnh Hoa là một trải nghiệm không thể thiếu trong hành trình khám phá ẩm thực thành phố.

Điểm làm nên sự nổi tiếng của bánh mì Huỳnh Hoa chính là nhân bánh cực kỳ đầy đặn và phong phú. Mỗi ổ bánh được nhồi chặt với chả lụa, pa tê gan, thịt xíu, dăm bông, trứng ốp la và rau cải. Tất cả được kết hợp hoàn hảo với bơ Normandy và tương ớt đặc biệt của quán. Bánh mì ở đây giòn tan bên ngoài nhưng vẫn mềm bên trong – đây là điểm rất khó đạt được mà Huỳnh Hoa làm được hoàn hảo.

Giá một ổ bánh mì dao động từ 45.000 đến 65.000 đồng tùy loại nhân, cao hơn so với bánh mì vỉa hè thông thường nhưng phần ăn rất xứng đáng. Quán mở cửa từ 14h30 đến khi hết bánh (thường là khoảng 20h), vì vậy bạn nên đến sớm để tránh hết hàng.

Hàng xếp hàng tại Huỳnh Hoa thường dài và mất 15-30 phút chờ đợi, nhưng đây chính là minh chứng cho chất lượng không thể chối cãi của tiệm. Nếu bạn muốn trải nghiệm một trong những ổ bánh mì ngon nhất Việt Nam, đây là địa chỉ phải đến.`,
    upvotes: 11, saves: 6,
  },
  {
    title: "Cơm Tấm Sườn Nướng Bụi – Linh Hồn Ẩm Thực Sài Gòn",
    content: `Cơm tấm là một trong những món ăn đại diện nhất cho ẩm thực Sài Gòn, và Cơm Tấm Sườn Nướng Bụi tại Đặng Văn Ngữ, Phú Nhuận là địa chỉ được người dân thành phố tin tưởng và yêu thích qua nhiều thế hệ. Không gian quán nhỏ gọn, bài trí đơn giản theo phong cách bình dân, nhưng hương vị thì không thể tìm thấy ở bất kỳ nơi nào khác.

Phần cơm tấm ở đây được nấu từ gạo tấm chất lượng cao, hạt gạo nhỏ mịn và thơm đặc trưng. Sườn nướng là điểm nhấn quan trọng nhất – được ướp với sả, tỏi, mật ong và các gia vị bí truyền rồi nướng trên than hoa đến khi vàng đều, thơm phức. Khi ăn cùng bì heo, chả trứng và nước mắm đặc trưng của quán thì đây thực sự là một tổng thể hương vị hoàn hảo.

Nước chấm ở đây là điểm riêng biệt không nơi nào giống – pha theo tỷ lệ đặc biệt với đường, chanh và tỏi ớt, vừa ngọt vừa chua vừa cay, kích thích vị giác hoàn toàn. Giá một dĩa cơm đầy đủ khoảng 50.000 – 70.000 đồng rất phải chăng so với chất lượng.

Quán đông khách vào buổi sáng và trưa, có thể phải chờ 10-15 phút. Nhưng khi nhận được dĩa cơm nóng hổi thơm lừng, mọi sự chờ đợi đều xứng đáng. Đây là một địa chỉ lý tưởng cho bữa sáng hoặc bữa trưa vội vàng mà vẫn ngon miệng.`,
    upvotes: 7, saves: 3,
  },
  {
    title: "Bún Bò Huế Ông Già – Hương Vị Cố Đô Giữa Lòng Sài Gòn",
    content: `Bún bò Huế Ông Già tại Kỳ Đồng, Quận 3 là một trong số ít địa chỉ tại TP.HCM giữ được hương vị bún bò Huế chính thống nhất mà không bị biến tấu hay pha loãng để phù hợp khẩu vị người Nam. Đây là lựa chọn lý tưởng cho những ai muốn thưởng thức một tô bún bò đậm đà, cay nồng và thơm đặc trưng của ẩm thực xứ Huế.

Nước dùng của bún bò Huế Ông Già được hầm từ xương bò và chân giò, thêm mắm ruốc Huế – loại gia vị không thể thiếu tạo nên mùi thơm rất đặc trưng. Màu đỏ của nước dùng đến từ sả ớt phi thơm, không phải phẩm màu nhân tạo. Vị cay nồng vừa phải, đủ để làm ấm lòng nhưng không quá nồng khiến người không ăn được cay phải bỏ cuộc.

Phần topping phong phú với bắp bò, chân giò, chả Huế và huyết heo. Bún sợi to vừa, không bị nhão dù để lâu trong nước dùng. Rau ăn kèm có giá đỗ, bắp chuối bào, rau thơm và hoa chuối – đầy đủ theo đúng chuẩn Huế.

Giá tô từ 55.000 đến 80.000 đồng tùy size và topping. Quán mở từ sáng sớm đến hết buổi trưa, thường hết hàng trước 12h. Không gian không quá rộng nhưng thoáng đãng, nhân viên phục vụ thân thiện. Đây là địa chỉ bắt buộc cho người yêu ẩm thực Huế.`,
    upvotes: 6, saves: 2,
  },
  {
    title: "Hủ Tiếu Nam Vang Thanh Xuân – Sự Hoàn Hảo Của Ẩm Thực Hoa-Việt",
    content: `Hủ tiếu Nam Vang là một trong những món ăn thể hiện rõ nhất sự giao thoa văn hóa ẩm thực giữa người Hoa và người Việt tại Sài Gòn. Và Thanh Xuân tại Nguyễn Trãi, Quận 5 được xem là một trong những nơi nấu hủ tiếu Nam Vang ngon nhất khu vực Chợ Lớn – trái tim của cộng đồng người Hoa tại TP.HCM.

Nước dùng hủ tiếu Thanh Xuân trong vắt, ngọt tự nhiên từ xương heo hầm lâu với tôm khô và mực khô. Không sử dụng bột ngọt nhiều, vị ngọt đến từ nguyên liệu tự nhiên, thanh mát và không bị nặng vị. Đây là điều khác biệt quan trọng so với nhiều quán khác trên cùng con phố.

Phần hủ tiếu có thể chọn khô hoặc nước. Phần khô rất được ưa chuộng – hủ tiếu trộn với mỡ hành, tương đen và các loại topping, ăn cùng tô nước dùng riêng. Topping bao gồm thịt nạc bằm, tôm tươi, gan heo, xá xíu và trứng cút. Rau ăn kèm có giá đỗ trụng, hẹ và cải xanh.

Giá từ 50.000 đến 75.000 đồng. Quán hoạt động từ sáng sớm đến chiều. Đây là một trong những địa chỉ tốt nhất để trải nghiệm ẩm thực khu Chợ Lớn – nơi còn gìn giữ nhiều hương vị truyền thống nhất tại TP.HCM.`,
    upvotes: 5, saves: 3,
  },
  {
    title: "Lẩu Mắm Út Dzách – Món Lẩu Đồng Quê Đậm Chất Miền Tây",
    content: `Lẩu mắm là tinh hoa ẩm thực sông nước miền Tây được mang lên Sài Gòn và được người thành thị đón nhận nồng nhiệt. Lẩu Mắm Út Dzách tại Tân Phú là một trong những địa chỉ nổi tiếng nhất TP.HCM về món đặc sản miền sông nước này, nơi mà mỗi nồi lẩu đều mang theo cả tinh thần phóng khoáng của người miền Tây Nam Bộ.

Nước lẩu mắm được nấu từ mắm cá linh hoặc mắm cá sặc – hai loại mắm đặc trưng nhất của vùng An Giang và Đồng Tháp. Mắm được lọc kỹ để lấy nước ngọt, sau đó nấu cùng sả, ớt, me chua và nước dừa để tạo ra một nồi nước dùng vừa thơm nồng vừa chua ngọt rất cân bằng. Màu nước lẩu vàng óng thu hút ngay từ cái nhìn đầu tiên.

Thực đơn ăn kèm phong phú: tôm, cá lóc, mực, bạch tuộc, thịt heo và các loại rau đồng như bông súng, cù nèo, rau muống và bắp chuối. Điều tuyệt vời nhất là nhúng cá lóc còn tươi vào nồi lẩu đang sôi, ăn kèm với bún tươi và rau sống.

Giá mỗi phần cho 2 người khoảng 180.000 – 250.000 đồng tùy chọn hải sản hay không. Quán rộng rãi, phù hợp cho nhóm bạn hoặc gia đình. Đây là trải nghiệm ẩm thực không thể bỏ qua khi tìm hiểu văn hóa ẩm thực Nam Bộ tại TP.HCM.`,
    upvotes: 8, saves: 5,
  },
  {
    title: "Bún Thịt Nướng Cô Ba Vũng Tàu – Hương Vị Biển Cả Giữa Thành Thị",
    content: `Bún thịt nướng là món ăn quen thuộc của người Nam Bộ, nhưng không phải đâu cũng nấu được hương vị đặc sắc như Cô Ba Vũng Tàu tại Đinh Tiên Hoàng, Bình Thạnh. Quán được đặt tên theo người chủ gốc Vũng Tàu mang theo bí quyết nấu ăn gia truyền lên Sài Gòn từ hơn hai mươi năm trước.

Thịt nướng ở đây là linh hồn của món ăn – được ướp từ tối hôm trước với sả, tỏi, mật ong, dầu hào và đường thốt nốt, sau đó nướng trên than hoa đến khi vàng cháy cạnh. Mùi thơm tỏa ra từ vỉ than có thể cảm nhận được từ xa. Thịt bên trong mềm mại, bên ngoài có lớp caramel thơm ngậy đặc trưng.

Tô bún gồm bún tươi sợi nhỏ, thịt nướng, chả giò chiên giòn, rau sống các loại như giá đỗ, bắp chuối, dưa leo và rau thơm. Nước chấm là nước mắm pha theo công thức đặc biệt, thêm cà rốt và đu đủ ngâm chua ngọt tạo vị giòn và màu sắc hấp dẫn.

Giá tô từ 45.000 – 70.000 đồng rất hợp lý. Quán mở cả ngày từ sáng đến tối. Đây là một lựa chọn tuyệt vời cho bữa ăn nhanh ngon miệng và đầy đủ dinh dưỡng giữa một ngày bận rộn tại Sài Gòn.`,
    upvotes: 4, saves: 2,
  },
  {
    title: "Cháo Lòng Ngã Tư Bảy Hiền – Bữa Sáng Bình Dân Người Sài Gòn",
    content: `Cháo lòng là món ăn sáng bình dân nhưng không kém phần ngon lành và đặc sắc trong ẩm thực Sài Gòn. Khu vực Ngã Tư Bảy Hiền tại Tân Bình là một trong những địa điểm nổi tiếng nhất thành phố về món này, nơi mà các xe cháo lòng đã hoạt động qua nhiều thế hệ và trở thành một phần ký ức của không ít người dân Sài Gòn.

Nồi cháo được nấu từ gạo tẻ và xương heo hầm nhừ, kết hợp với gừng và hành để tạo ra một nồi cháo thơm ngát, đặc sánh và không bị nhão. Lòng heo gồm cật, tim, gan, lòng non và phổi được luộc chín vừa tới – không quá cứng, không quá mềm – rồi thái mỏng trước khi cho vào tô.

Huyết heo luộc cũng là một phần không thể thiếu, mềm mại và thơm. Ăn kèm với quẩy giòn, hành phi và tiêu xay tươi để tô cháo thêm phần hoàn hảo. Nước mắm chanh ớt để chấm lòng thêm đậm đà.

Giá tô cháo đầy đủ chỉ từ 35.000 – 55.000 đồng, rất phải chăng cho một bữa sáng no căng và ngon miệng. Đây là loại ẩm thực bình dân đích thực của Sài Gòn – không cầu kỳ nhưng đầy bản sắc và ký ức văn hóa của thành phố.`,
    upvotes: 5, saves: 1,
  },
  {
    title: "Gỏi Cuốn Cô Hiền – Tinh Tế Và Thanh Mát Giữa Trưa Hè",
    content: `Gỏi cuốn là một trong những món ăn thanh mát và lành mạnh nhất của ẩm thực miền Nam, và Cô Hiền tại Bình Thạnh đã làm cho món ăn này trở thành một nghệ thuật. Đây không chỉ là một địa điểm ăn uống thông thường – đây là nơi để thưởng thức sự tinh tế trong từng cuốn chả giò mỏng manh được cuốn khéo léo bởi đôi tay cô Hiền trên 40 năm kinh nghiệm.

Bánh tráng dùng để cuốn được nhúng nước vừa đủ, mềm nhưng không bị nát. Nhân cuốn bao gồm tôm tươi hấp chín, thịt heo ba chỉ luộc thái mỏng, bún tươi sợi nhỏ và các loại rau thơm như rau diếp cá, húng quế, tía tô và giá đỗ. Tất cả được cuốn chặt tay và đều nhau – mỗi cuốn là một tác phẩm thủ công hoàn hảo.

Nước chấm đặc biệt được pha từ tương hoisin, bơ đậu phộng, đường và ớt tươi – béo ngậy và thơm lừng, hoàn toàn khác biệt so với nước mắm pha thông thường. Thêm một ít đậu phộng rang nghiền lên trên để tăng độ giòn và hương vị.

Giá 10 cuốn khoảng 60.000 – 80.000 đồng. Quán nhỏ nhắn và luôn đông khách vào giờ trưa. Gỏi cuốn Cô Hiền là lựa chọn hoàn hảo cho bữa ăn nhẹ và thanh mát vào những ngày nóng bức của Sài Gòn.`,
    upvotes: 6, saves: 4,
  },
  {
    title: "Ốc Đào Tân Định – Thiên Đường Ốc Của Người Sài Gòn",
    content: `Ốc Đào tại Phạm Viết Chánh, Quận 1 là địa chỉ ốc nổi tiếng bậc nhất khu vực Tân Định – một góc ẩm thực bình dân nhưng đầy sức sống của Sài Gòn. Quán đã hoạt động hơn hai mươi năm và trở thành điểm hẹn quen thuộc của giới trẻ thành phố vào những buổi chiều tối.

Thực đơn ốc Đào vô cùng phong phú với hơn 30 loại ốc và hải sản khác nhau. Ốc hương rang muối, ốc len xào dừa, nghêu hấp sả, sò điệp nướng mỡ hành, chem chép hấp bia và còn nhiều hơn nữa. Mỗi món đều được chế biến theo công thức riêng, đảm bảo hương vị đặc trưng và không lẫn lộn.

Ốc len xào dừa là món nổi bật nhất – ốc len được xào cùng nước cốt dừa béo ngậy, thêm sả, ớt và lá chuối, kết hợp tạo ra hương thơm quyến rũ khó cưỡng. Nghêu hấp sả với nước dùng trong vắt, thêm chút hành lá và ớt tươi là món đơn giản nhưng rất đưa cơm.

Giá trung bình từ 60.000 – 150.000 đồng tùy loại. Phần ăn cho 2-4 người dao động từ 200.000 – 400.000 đồng. Quán mở từ chiều đến tối khuya, không khí vui vẻ và ồn ào theo đúng phong cách ăn ốc lề đường của Sài Gòn. Đây là trải nghiệm không thể bỏ qua.`,
    upvotes: 10, saves: 7,
  },
  {
    title: "Cà Phê Trứng Long Hải – Hà Nội Phong Vị Giữa Sài Thành",
    content: `Cà phê trứng là đặc sản nổi tiếng của Hà Nội nhưng khi vào Sài Gòn, nó đã được người thành phố đón nhận và yêu thích không kém. Long Hải tại Võ Văn Tần, Quận 3 là một trong số ít địa chỉ tại TP.HCM pha cà phê trứng theo đúng phong cách Hà Nội gốc – không bị biến tấu hay đơn giản hóa cho phù hợp với khẩu vị phương Nam.

Cà phê trứng được làm từ lòng đỏ trứng gà đánh bông cùng sữa đặc và đường theo tỷ lệ nghệ nhân, tạo ra một lớp kem mịn màng và béo ngậy phủ trên nền cà phê đen đậm đà. Sự kết hợp giữa vị đắng của cà phê và vị ngọt béo của kem trứng tạo ra một tổng thể hương vị rất độc đáo và khó quên.

Ăn nóng thì lớp kem trứng hòa tan vào cà phê, tạo ra vị béo nhẹ. Ăn lạnh thì lớp kem đóng lại mềm mịn hơn, ngậy hơn và có thể thưởng thức từng thìa một. Ngoài cà phê trứng, quán còn có cà phê dừa, cà phê matcha trứng và các loại cà phê đặc biệt khác.

Không gian quán nhỏ xinh, trang trí theo phong cách vintage Hà Nội với đèn vàng ấm áp và bàn ghế gỗ cổ điển. Giá một ly cà phê trứng từ 45.000 – 65.000 đồng. Đây là địa chỉ lý tưởng cho buổi sáng thư thái hoặc buổi chiều làm việc một mình.`,
    upvotes: 7, saves: 5,
  },
  {
    title: "Bánh Xèo 46A Đinh Công Tráng – Tiếng Xèo Vang Danh Sài Gòn",
    content: `Bánh xèo là một trong những món ăn đại diện nhất cho ẩm thực miền Nam Việt Nam, và 46A Đinh Công Tráng tại Quận 1 là địa chỉ bánh xèo nổi tiếng bậc nhất Sài Gòn đã hoạt động từ năm 1979. Cái tên 46A đã trở thành một thương hiệu ẩm thực đích thực của thành phố, được không ít tạp chí và chương trình truyền hình ẩm thực quốc tế giới thiệu.

Bánh xèo ở đây được đổ ngay trước mặt thực khách trên những chiếc chảo gang lớn được ủ nóng đều. Bột bánh được pha từ bột gạo, nước cốt dừa và nghệ tươi, tạo ra màu vàng đẹp và mùi thơm đặc trưng. Nhân bánh đa dạng: tôm, thịt bò, mực, hải sản hoặc chỉ giá đỗ cho người ăn chay.

Cách ăn bánh xèo mới là nghệ thuật thực sự. Bạn cuốn từng miếng bánh xèo giòn tan vào lá cải xanh hoặc bánh tráng, thêm rau thơm các loại như húng quế, rau diếp, bạc hà và chấm với nước mắm đặc biệt pha chua ngọt thêm đậu phộng nghiền. Mỗi cuốn mang đến một bùng nổ hương vị trong miệng.

Giá một đĩa bánh xèo (2-3 chiếc) từ 80.000 – 120.000 đồng. Quán rộng, phục vụ nhanh và luôn đông khách. Đây là một trải nghiệm ẩm thực phải có trong danh sách của bất kỳ ai ghé thăm Sài Gòn.`,
    upvotes: 8, saves: 6,
  },
  {
    title: "Chè Hiển Khánh – Ngọt Ngào Kỷ Niệm Giữa Sài Gòn Náo Nhiệt",
    content: `Giữa sự náo nhiệt và hiện đại của trung tâm Quận 1, Chè Hiển Khánh tại Lê Thánh Tôn là một góc yên bình nơi thực khách có thể thưởng thức những bát chè truyền thống ngọt ngào và mát lành. Quán đã hoạt động từ thập niên 1970 và trở thành một phần ký ức ngọt ngào của nhiều thế hệ người Sài Gòn.

Chè ở đây không phải chè pha sẵn hàng loạt – mỗi loại chè được nấu tươi mỗi ngày với nguyên liệu chọn lọc. Từ chè đậu xanh đánh mịn, chè đậu đỏ nước cốt dừa, chè chuối nước cốt dừa đến chè bưởi, chè trôi nước và chè thập cẩm – tất cả đều được nấu theo phương thức truyền thống, không dùng hương liệu nhân tạo.

Chè hạt sen long nhãn là món được yêu thích nhất tại Hiển Khánh. Hạt sen được hầm mềm ngọt tự nhiên, kết hợp với long nhãn khô thơm lừng và nước đường cát vừa ngọt vừa trong, ăn nóng vào mùa mưa hay ăn lạnh vào mùa nắng đều ngon tuyệt.

Giá từ 25.000 – 55.000 đồng một bát tùy loại, rất thân thiện với túi tiền. Không gian thoáng mát, nhân viên thân thiện. Đây là địa chỉ hoàn hảo cho buổi chiều thư giãn hay sau bữa ăn muốn kết thúc bằng một điều gì đó ngọt ngào và nhẹ nhàng.`,
    upvotes: 4, saves: 2,
  },
  {
    title: "Bánh Canh Cua Quận 10 – Sợi Bánh Đậm Vị Biển",
    content: `Bánh canh cua là một trong những món súp đặc trưng nhất của ẩm thực miền Nam, và khu vực Quận 10 với con phố Sư Vạn Hạnh nổi tiếng là một trong những nơi có bánh canh cua ngon nhất Sài Gòn. Những quán bánh canh lâu năm ở đây đã tạo dựng tên tuổi chắc chắn trong lòng người sành ăn thành phố.

Nước dùng bánh canh cua được ninh từ xương heo kết hợp với đầu tôm và vỏ cua, tạo ra một nồi nước dùng đậm đà, ngọt tự nhiên và thơm mùi hải sản đặc trưng. Thêm vào đó là chả cá hommade từ cá thác lác giã thủ công, không bột kết dính, nên miếng chả vừa dai vừa thơm.

Sợi bánh canh được làm từ bột gạo tươi, sợi to tròn và mềm mại hơn nhiều so với bánh canh bột lọc. Topping gồm thịt cua tươi được gỡ kỹ, trứng cua vàng óng béo ngậy, tôm tươi và chả cá. Thêm hành phi giòn và tiêu xay trên mặt tô là hoàn chỉnh.

Nước béo cua hòa quyện với nước dùng ngọt thơm tạo ra một tô bánh canh mà hương vị đọng lại rất lâu sau khi ăn. Giá từ 55.000 – 80.000 đồng. Quán mở từ sáng đến chiều tối. Đây là món ăn tiêu biểu cho sự phong phú và sáng tạo của ẩm thực Nam Bộ.`,
    upvotes: 6, saves: 3,
  },
  {
    title: "Mì Vịt Tiềm Tân Phú – Sự Kết Hợp Hoàn Hảo Của Đông-Tây Y",
    content: `Mì vịt tiềm là món ăn đặc trưng của cộng đồng người Hoa tại Sài Gòn, kết hợp giữa nghệ thuật ẩm thực và triết lý y học cổ truyền phương Đông. Khu vực Tân Phú, đặc biệt là đường Lũy Bán Bích, có nhiều quán mì vịt tiềm nổi tiếng đã phục vụ người dân Sài Gòn qua nhiều thế hệ.

Nước dùng mì vịt tiềm là điểm quan trọng nhất và cũng là bí quyết của mỗi quán. Vịt được hầm cùng hàng chục loại thảo dược và gia vị như táo tàu, kỷ tử, đương quy, hoàng kỳ, hồi hương và quế chi. Sau nhiều giờ hầm, nước dùng có màu nâu sậm, mùi thơm y học đặc trưng và vị ngọt thanh rất riêng biệt.

Thịt vịt sau khi hầm mềm đến mức có thể tách khỏi xương một cách dễ dàng nhưng vẫn giữ được độ đàn hồi và hương vị đặc trưng. Mì được dùng là mì trứng sợi mỏng, dai và thơm trứng, phù hợp để ngấm nước dùng thảo dược.

Theo y học cổ truyền, mì vịt tiềm có tác dụng bổ thận, tăng cường sinh lực và ổn định huyết áp. Vì vậy, nhiều người Việt gốc Hoa coi đây là món ăn bổ dưỡng định kỳ chứ không chỉ để thỏa mãn cơn thèm ăn. Giá từ 65.000 – 100.000 đồng. Đây là địa chỉ dành cho người muốn khám phá ẩm thực văn hóa Hoa-Việt độc đáo.`,
    upvotes: 5, saves: 3,
  },
  {
    title: "Sủi Cảo Vĩnh Khánh – Quận 4 Đặc Sản Vỉa Hè Đêm Khuya",
    content: `Khi màn đêm buông xuống và Sài Gòn bắt đầu nhộn nhịp với cuộc sống về đêm, khu vực Vĩnh Khánh ở Quận 4 lại trở thành một thiên đường ẩm thực đêm khuya sầm uất. Những hàng sủi cảo vỉa hè, mì vằn thắn và hải sản tươi sống trải dài trên con phố nhỏ tạo nên một không khí ẩm thực rất đặc trưng của Sài Gòn.

Sủi cảo Vĩnh Khánh là loại bánh bao nhỏ nhân thịt heo và tôm tươi, được đặt trong nước dùng xương heo trong vắt và thơm ngát. Vỏ bánh mỏng mịn, trong suốt khi hấp chín, nhìn thấy được phần nhân bên trong đầy đặn. Đây là sủi cảo theo phong cách Triều Châu – một trong những phong cách ẩm thực người Hoa phổ biến nhất tại TP.HCM.

Ngoài sủi cảo nước, bạn có thể order sủi cảo chiên giòn – vỏ bánh giòn tan và vàng đều, nhân thịt vẫn mềm và thơm. Ăn kèm với tương ớt chua ngọt hoặc xì dầu gừng đều tuyệt vời.

Mì vằn thắn cũng là món không thể bỏ qua tại Vĩnh Khánh – mì trứng sợi nhỏ ăn kèm hoành thánh và char siu. Giá từ 40.000 – 70.000 đồng. Hầu hết các quán mở từ chiều tối đến 2-3 giờ sáng, phục vụ hoàn hảo cho những ai thích khám phá ẩm thực đêm khuya Sài Gòn.`,
    upvotes: 7, saves: 4,
  },
  {
    title: "Bánh Tráng Trộn Trường Chinh – Snack Đường Phố Sài Gòn",
    content: `Bánh tráng trộn là một trong những món ăn vặt đường phố đặc trưng nhất của Sài Gòn – đơn giản, rẻ tiền nhưng vô cùng hấp dẫn và gây nghiện. Khu vực Trường Chinh tại Tân Bình là một trong những địa điểm bán bánh tráng trộn sầm uất nhất thành phố, thu hút học sinh, sinh viên và cả người đi làm vào mỗi buổi chiều.

Nguyên liệu cơ bản của bánh tráng trộn gồm bánh tráng me cắt nhỏ, xoài xanh bào sợi, khô bò dai, tôm khô, trứng cút luộc, rau răm và đậu phộng rang. Tất cả được trộn đều với tương ớt chua ngọt, muối tôm và nước me chua – tạo ra một tổ hợp hương vị chua cay ngọt mặn đầy kích thích.

Người bán bánh tráng trộn thường thao tác rất nhanh tay – chỉ vài phút là có ngay một phần bánh tráng trộn đầy đặn và đẹp mắt. Khách thường mua về ăn ngay tại chỗ hoặc mang đi. Đây là loại ăn vặt phù hợp cho tất cả mọi người, đặc biệt là học sinh và người trẻ.

Giá từ 25.000 – 45.000 đồng tùy size và topping. Vừa ngon vừa rẻ và mang đậm dấu ấn văn hóa đường phố Sài Gòn. Đây là trải nghiệm ẩm thực không thể thiếu khi muốn hiểu văn hóa ẩm thực bình dân của thành phố.`,
    upvotes: 9, saves: 6,
  },
  {
    title: "Nem Cuốn Bà Đắc Chợ Bến Thành – Di Sản Ẩm Thực Trung Tâm",
    content: `Chợ Bến Thành không chỉ là biểu tượng kiến trúc của TP.HCM mà còn là nơi hội tụ ẩm thực phong phú bậc nhất thành phố. Trong đó, nem cuốn Bà Đắc – một trong những gian hàng lâu đời và nổi tiếng nhất bên trong khu chợ – đã phục vụ thực khách từ trước năm 1975 và tiếp tục giữ vững hương vị qua nhiều thế hệ.

Nem cuốn Bà Đắc không dùng bánh tráng mà dùng lá chuối tươi để cuốn – đây là điểm khác biệt độc đáo nhất tạo nên phong vị riêng. Nhân cuốn gồm thịt heo luộc thái mỏng, tôm tươi hấp, bún tươi, rau thơm và đặc biệt là bì heo trộn thính gạo rang – loại nguyên liệu tạo nên mùi thơm đặc trưng khó quên.

Nước chấm là yếu tố then chốt làm nên danh tiếng của Bà Đắc – được pha từ tương hoisin, đậu phộng nghiền mịn, nước mắm ngon và đường cát trắng theo tỷ lệ bí truyền, vừa ngọt vừa thơm và đậm vị đậu phộng. Không thể tìm được vị nước chấm tương tự ở bất kỳ đâu khác.

Giá 1 phần (5 cuốn) khoảng 50.000 – 70.000 đồng. Quán chỉ mở trong giờ chợ. Không gian tấp nập và ồn ào như đặc trưng chợ Bến Thành, nhưng chính sự náo nhiệt đó là một phần trải nghiệm không thể thiếu khi thưởng thức nem cuốn Bà Đắc.`,
    upvotes: 6, saves: 3,
  },
  {
    title: "Cơm Niêu Sài Gòn – Nét Duyên Dáng Của Ẩm Thực Truyền Thống",
    content: `Cơm niêu là phương thức nấu cơm truyền thống của người Việt từ xa xưa – cơm được nấu trong những chiếc niêu đất nhỏ trên lửa củi, tạo ra những hạt cơm thơm dẻo với lớp cơm cháy vàng giòn ở đáy niêu vô cùng hấp dẫn. Cơm Niêu Sài Gòn tại Đinh Tiên Hoàng, Quận 1 là một trong những địa chỉ nổi tiếng nhất thành phố về món ăn mang đậm dấu ấn văn hóa này.

Mỗi phần cơm được nấu riêng lẻ trong niêu đất cá nhân – đây là điểm khác biệt so với nhiều nơi phục vụ cơm theo kiểu nồi lớn. Nhờ vậy, mỗi vị khách nhận được phần cơm nóng hổi vừa ra lửa, thơm mùi đất nung và có lớp cơm cháy giòn ở dưới đáy.

Thực đơn ăn kèm phong phú: cá kho tộ đậm đà, thịt kho tiêu xứ Huế, canh chua cá lóc, rau muống xào tỏi và các món dân dã khác. Tất cả đều được chế biến tươi hàng ngày từ nguyên liệu địa phương. Cơm cháy giòn có thể ăn riêng với muối vừng hoặc chấm với canh chua – ngon theo cách rất riêng biệt.

Giá một phần cơm niêu khoảng 80.000 – 150.000 đồng tùy chọn món ăn kèm. Không gian nhà hàng trang nhã và ấm cúng theo phong cách truyền thống. Đây là nơi lý tưởng cho bữa ăn gia đình hoặc tiếp đãi khách từ xa muốn thưởng thức ẩm thực truyền thống Việt Nam.`,
    upvotes: 5, saves: 2,
  },
  {
    title: "Xôi Lá Cẩm Phú Nhuận – Sắc Tím Quyến Rũ Của Sáng Sài Gòn",
    content: `Xôi lá cẩm là một trong những món ăn sáng độc đáo và đẹp mắt nhất trong ẩm thực Sài Gòn. Màu tím ngọc đặc trưng của xôi đến từ lá cẩm – một loại lá rừng được người Việt dùng như chất tạo màu tự nhiên từ rất lâu đời. Tại Phú Nhuận, có nhiều gánh xôi lá cẩm nổi tiếng đã phục vụ người dân từ thập niên 1980.

Quy trình làm xôi lá cẩm khá công phu: gạo nếp ngâm qua đêm cùng nước ép lá cẩm để lên màu tím đều và đẹp, sau đó hấp chín với lửa vừa đến khi hạt xôi căng tròn, dẻo thơm và bóng láng. Màu tím của xôi không bị phai hay chuyển màu sau khi hấp – đây là dấu hiệu của gạo nếp tốt và lá cẩm tươi.

Xôi lá cẩm thường được ăn kèm với nhân đậu xanh nghiền mịn, dừa nạo sợi và mè rang – tạo thành bộ ba hương vị hoàn hảo. Bạn có thể chọn thêm lạp xưởng chiên giòn hay trứng vịt muối cho phần xôi mặn, hoặc giữ nguyên vị ngọt dừa cho phần xôi ngọt truyền thống.

Giá từ 25.000 – 45.000 đồng tùy nhân và size. Xôi lá cẩm không chỉ là một món ăn sáng ngon lành mà còn là một trải nghiệm thẩm mỹ khi nhìn vào màu sắc tím quyến rũ. Đây là nét ẩm thực rất Sài Gòn cần được khám phá và gìn giữ.`,
    upvotes: 4, saves: 2,
  },
];

async function upsertOrCreateContext(place: typeof hcmFoodPlaces[0]) {
  const existing = await prisma.context.findFirst({
    where: { latitude: place.lat, longitude: place.lng },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.context.create({
    data: {
      type: "PLACE",
      name: place.name,
      address: place.address,
      latitude: place.lat,
      longitude: place.lng,
      category: place.category,
      source: "seed",
      sourceRef: place.sourceRef,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  await upsertUser({
    email: "admin@example.com",
    passwordHash,
    role: "ADMIN",
    displayName: "Admin",
    isEmailVerified: true,
    accountStatus: "ACTIVE",
  });

  const cloneUsers = [
    { name: "Ngan Ngu Ngo", email: "ngan.ngungo@example.com", avatar: "https://i.pravatar.cc/150?u=1", score: 15000, knowU: 500, knowG: 120.5 },
    { name: "Huyen Nguyen", email: "huyen.nguyen@example.com", avatar: "https://i.pravatar.cc/150?u=2", score: 12400, knowU: 450, knowG: 80.0 },
    { name: "Han Phan", email: "han.phan@example.com", avatar: "https://i.pravatar.cc/150?u=3", score: 11200, knowU: 300, knowG: 65.5 },
    { name: "Luis Mel", email: "luis.mel@example.com", avatar: "https://i.pravatar.cc/150?u=4", score: 9800, knowU: 250, knowG: 45.0 },
    { name: "YasuA", email: "yasua@example.com", avatar: "https://i.pravatar.cc/150?u=5", score: 8500, knowU: 200, knowG: 30.0 },
    { name: "Be Bua", email: "be.bua@example.com", avatar: "https://i.pravatar.cc/150?u=6", score: 7200, knowU: 180, knowG: 25.5 },
    { name: "Anh Thu", email: "anh.thu@example.com", avatar: "https://i.pravatar.cc/150?u=7", score: 6500, knowU: 150, knowG: 20.0 },
    { name: "Thu Pham", email: "thu.pham@example.com", avatar: "https://i.pravatar.cc/150?u=8", score: 5400, knowU: 100, knowG: 15.0 },
    { name: "Hoang Giap", email: "hoang.giap@example.com", avatar: "https://i.pravatar.cc/150?u=9", score: 4300, knowU: 80, knowG: 10.0 },
    { name: "Hoi Nguyen", email: "hoi.nguyen@example.com", avatar: "https://i.pravatar.cc/150?u=10", score: 3200, knowU: 50, knowG: 5.0 },
    { name: "Tam Phan", email: "tam.phan@example.com", avatar: "https://i.pravatar.cc/150?u=11", score: 2100, knowU: 30, knowG: 2.0 },
  ];

  const seedUsers: Array<{ id: number; email: string }> = [];
  for (const u of cloneUsers) {
    const result = await upsertUser({
      email: u.email,
      passwordHash,
      role: "USER",
      displayName: u.name,
      avatarUrl: u.avatar,
      reputationScore: u.score,
      knowUBalance: u.knowU,
      knowGBalance: u.knowG,
      isEmailVerified: true,
      accountStatus: "ACTIVE",
    });
    seedUsers.push({ id: result.id, email: result.email ?? "" });
  }

  // ── Taxonomy ───────────────────────────────────────────────────────────────
  const categories = [
    { slug: "PLACE_BASED_KNOWLEDGE", name: "Place-based Knowledge" },
    { slug: "CULTURE_HISTORY", name: "Culture & History" },
    { slug: "BOOK_FILM", name: "Book & Film" },
    { slug: "SCIENCE_KNOWLEDGE", name: "Science Knowledge" },
    { slug: "PRACTICAL_GUIDE", name: "Practical Guide" },
    { slug: "ABSTRACT_TOPIC", name: "Abstract Topic" },
  ];

  let placeBasedCategoryId: number | null = null;
  for (const category of categories) {
    const tax = await prisma.taxonomy.upsert({
      where: { slug: category.slug },
      update: { name: category.name, type: TaxonomyType.CATEGORY },
      create: { slug: category.slug, name: category.name, type: TaxonomyType.CATEGORY },
    });
    if (category.slug === "PLACE_BASED_KNOWLEDGE") placeBasedCategoryId = tax.id;
  }

  if (!placeBasedCategoryId) throw new Error("PLACE_BASED_KNOWLEDGE taxonomy not created");

  // Also ensure a Food tag exists
  const foodTag = await prisma.taxonomy.upsert({
    where: { slug: "food-restaurant" },
    update: { name: "Food & Restaurant", type: TaxonomyType.TAG },
    create: { slug: "food-restaurant", name: "Food & Restaurant", type: TaxonomyType.TAG },
  });

  // ── Contexts (20 HCM food spots) ───────────────────────────────────────────
  const contexts: Array<{ id: number }> = [];
  for (const place of hcmFoodPlaces) {
    const ctx = await upsertOrCreateContext(place);
    contexts.push(ctx);
  }

  // ── Articles (20 posts >200 words, Food/Restaurant field) ──────────────────
  const articles: Array<{ id: number }> = [];
  const authorIds = seedUsers.map((u) => u.id);

  for (let i = 0; i < articleData.length; i++) {
    const data = articleData[i];
    const context = contexts[i];
    const authorId = authorIds[i % authorIds.length];

    const slugBase = data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const existingArticle = await prisma.article.findFirst({
      where: { contextId: context.id, authorId },
      select: { id: true },
    });

    if (existingArticle) {
      articles.push(existingArticle);
      continue;
    }

    const article = await prisma.article.create({
      data: {
        slug: `${slugBase}-${Date.now()}-${i}`,
        title: data.title,
        content: data.content,
        type: "POST",
        status: "PUBLISHED",
        visibility: "PUBLIC",
        authorId,
        contextId: context.id,
        rankingScore: data.upvotes * 10 + data.saves * 5,
        upvoteCount: data.upvotes,
        saveCount: data.saves,
        taxonomies: {
          create: [
            { taxonomyId: placeBasedCategoryId },
            { taxonomyId: foodTag.id },
          ],
        },
        updatedAt: new Date(),
      },
      select: { id: true },
    });
    articles.push(article);
  }

  // ── Interactions (upvotes, saves, views from seed users) ──────────────────
  // Distribute upvotes and saves among seed users for each article
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const data = articleData[i];

    // Upvotes — assign to first N seed users (different user per article)
    const upvoterCount = Math.min(data.upvotes, seedUsers.length);
    for (let j = 0; j < upvoterCount; j++) {
      const voter = seedUsers[(i + j + 1) % seedUsers.length];
      const existingUpvote = await prisma.interaction.findFirst({
        where: { userId: voter.id, articleId: article.id, type: "UPVOTE" },
        select: { id: true },
      });
      if (!existingUpvote) {
        await prisma.interaction.create({ data: { userId: voter.id, articleId: article.id, type: "UPVOTE" } });
      }
    }

    // Downvotes — 1 per article from a different user
    const downvoter = seedUsers[(i + 3) % seedUsers.length];
    const existingDownvote = await prisma.interaction.findFirst({
      where: { userId: downvoter.id, articleId: article.id, type: "DOWNVOTE" },
      select: { id: true },
    });
    if (!existingDownvote) {
      await prisma.interaction.create({ data: { userId: downvoter.id, articleId: article.id, type: "DOWNVOTE" } });
    }

    // Saves — assign to first N save users
    const saverCount = Math.min(data.saves, seedUsers.length);
    for (let j = 0; j < saverCount; j++) {
      const saver = seedUsers[(i + j + 2) % seedUsers.length];
      const existingSave = await prisma.interaction.findFirst({
        where: { userId: saver.id, articleId: article.id, type: "SAVE" },
        select: { id: true },
      });
      if (!existingSave) {
        await prisma.interaction.create({ data: { userId: saver.id, articleId: article.id, type: "SAVE" } });
      }
    }

    // Views — 3 views per article from different users
    for (let j = 0; j < 3; j++) {
      const viewer = seedUsers[(i + j + 5) % seedUsers.length];
      // VIEW allows duplicates per user — use findFirst + create
      const existingView = await prisma.interaction.findFirst({
        where: { userId: viewer.id, articleId: article.id, type: "VIEW" },
        select: { id: true },
      });
      if (!existingView) {
        await prisma.interaction.create({
          data: { userId: viewer.id, articleId: article.id, type: "VIEW", timeSpentMs: 45000 + j * 10000 },
        });
      }
    }
  }

  // ── Favorite Locations (seed users save some places) ──────────────────────
  const favoritesToSeed = [
    { userIdx: 0, placeIdx: 0 },  // Ngan saves Phở Hòa Pasteur
    { userIdx: 0, placeIdx: 1 },  // Ngan saves Bánh Mì Huỳnh Hoa
    { userIdx: 1, placeIdx: 2 },  // Huyen saves Cơm Tấm
    { userIdx: 1, placeIdx: 9 },  // Huyen saves Ốc Đào
    { userIdx: 2, placeIdx: 5 },  // Han saves Lẩu Mắm
    { userIdx: 3, placeIdx: 11 }, // Luis saves Bánh Xèo
    { userIdx: 4, placeIdx: 16 }, // YasuA saves Bánh Tráng Trộn
  ];

  for (const fav of favoritesToSeed) {
    const user = seedUsers[fav.userIdx];
    const place = hcmFoodPlaces[fav.placeIdx];
    const existingFav = await prisma.favoriteLocation.findFirst({
      where: { userId: user.id, lat: place.lat, lng: place.lng },
      select: { id: true },
    });
    if (!existingFav) {
      await prisma.favoriteLocation.create({
        data: {
          userId: user.id,
          name: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          category: place.category,
        },
      });
    }
  }

  console.log("✅ Seed complete:", {
    users: seedUsers.length + 1,
    contexts: contexts.length,
    articles: articles.length,
    categories: categories.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
