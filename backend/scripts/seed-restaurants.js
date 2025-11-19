const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const mockRestaurants = [
  {
    userId: 1, // Assuming there's a user with ID 1
    name: "Bánh Mì Huỳnh Hoa",
    description:
      "Bánh mì đặc biệt ngon nhất Sài Gòn với nhân đầy đủ, thịt tươi và bánh giòn.",
    address: "26 Lê Thị Riêng, Bến Nghé, Quận 1, Hồ Chí Minh",
    latitude: 10.7769,
    longitude: 106.7009,
    phone: "+84 28 3829 7943",
    category: "Bánh Mì",
    priceLevel: 1,
    isActive: true,
    isVerified: true,
  },
  {
    userId: 1,
    name: "Phở Bò Lê",
    description:
      "Phở bò truyền thống với nước dùng trong vắt và thịt bò mềm ngọt.",
    address: "413 Nguyễn Trãi, Phường 7, Quận 5, Hồ Chí Minh",
    latitude: 10.7546,
    longitude: 106.6677,
    phone: "+84 28 3855 4321",
    category: "Phở",
    priceLevel: 1,
    isActive: true,
    isVerified: true,
  },
  {
    userId: 1,
    name: "Cơm Tấm Sài Gòn",
    description:
      "Cơm tấm sườn nướng thơm phức với chả trứng và bì truyền thống.",
    address: "32 Hồ Hảo Hớn, Cô Giang, Quận 1, Hồ Chí Minh",
    latitude: 10.7617,
    longitude: 106.6955,
    phone: "+84 28 3925 6789",
    category: "Cơm Tấm",
    priceLevel: 2,
    isActive: true,
    isVerified: true,
  },
  {
    userId: 1,
    name: "Bún Bò Huế Chị Ba",
    description:
      "Bún bò Huế chuẩn vị miền Trung với nước dùng đỏ đặc trưng và thịt bò tươi.",
    address: "45 Điện Biên Phủ, Đa Kao, Quận 1, Hồ Chí Minh",
    latitude: 10.7875,
    longitude: 106.7019,
    phone: "+84 28 3822 1234",
    category: "Bún Bò Huế",
    priceLevel: 2,
    isActive: true,
    isVerified: true,
  },
  {
    userId: 1,
    name: "Bánh Xèo Miền Tây",
    description:
      "Bánh xèo giòn rụm với nhân tôm thịt đầy đặn, ăn kèm rau sống tươi ngon.",
    address: "88 Đinh Công Tráng, Tân Định, Quận 1, Hồ Chí Minh",
    latitude: 10.7823,
    longitude: 106.6934,
    phone: "+84 28 3829 5678",
    category: "Bánh Xèo",
    priceLevel: 2,
    isActive: true,
    isVerified: true,
  },
  {
    userId: 1,
    name: "Gỏi Cuốn Sài Gòn",
    description:
      "Gỏi cuốn tươi ngon với tôm to, thịt luộc và rau thơm, chấm nước mắm me.",
    address: "67 Pasteur, Bến Nghé, Quận 1, Hồ Chí Minh",
    latitude: 10.7796,
    longitude: 106.6986,
    phone: "+84 28 3824 9876",
    category: "Gỏi Cuốn",
    priceLevel: 1,
    isActive: true,
    isVerified: true,
  },
  {
    userId: 1,
    name: "Chè Ba Màu Tuyết",
    description:
      "Chè ba màu ngon lành với đậu xanh, đậu đỏ mềm vừa và nước cốt dừa thơm béo.",
    address: "123 Nguyễn Thiện Thuật, Phường 3, Quận 3, Hồ Chí Minh",
    latitude: 10.7756,
    longitude: 106.689,
    phone: "+84 28 3932 1111",
    category: "Chè",
    priceLevel: 1,
    isActive: true,
    isVerified: true,
  },
  {
    userId: 1,
    name: "Hủ Tiếu Mỹ Tho",
    description:
      "Hủ tiếu Mỹ Tho đúng điệu với nước dùng trong vắt, ngọt từ xương heo.",
    address: "156 Lý Thái Tổ, Phường 9, Quận 10, Hồ Chí Minh",
    latitude: 10.7693,
    longitude: 106.6664,
    phone: "+84 28 3865 4321",
    category: "Hủ Tiếu",
    priceLevel: 1,
    isActive: true,
    isVerified: true,
  },
];

async function seedRestaurants() {
  console.log("🌱 Seeding restaurants...");

  try {
    // First, let's check if we have any users
    const userCount = await prisma.user.count();
    console.log(`👥 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log("🔧 Creating a test user first...");
      const testUser = await prisma.user.create({
        data: {
          email: "test@example.com",
          passwordHash: "$2b$10$test.hash.for.seeding.purposes",
          isEmailVerified: true,
          role: "USER",
          accountStatus: "ACTIVE",
        },
      });
      console.log(`✅ Created test user with ID: ${testUser.id}`);
    }

    // Get the first user ID
    const firstUser = await prisma.user.findFirst();
    const userId = firstUser.id;

    console.log(`👤 Using user ID: ${userId} for restaurants`);

    // Update all mock restaurants to use the correct user ID
    const restaurantsWithUserId = mockRestaurants.map((restaurant) => ({
      ...restaurant,
      userId: userId,
    }));

    // Clear existing restaurants
    await prisma.restaurant.deleteMany({});
    console.log("🗑️  Cleared existing restaurants");

    // Create new restaurants
    for (const restaurant of restaurantsWithUserId) {
      const created = await prisma.restaurant.create({
        data: restaurant,
      });
      console.log(`✅ Created: ${created.name}`);
    }

    console.log("🎉 Successfully seeded restaurants!");

    // Show final count
    const finalCount = await prisma.restaurant.count();
    console.log(`📊 Total restaurants in database: ${finalCount}`);
  } catch (error) {
    console.error("❌ Error seeding restaurants:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedRestaurants().catch((error) => {
  console.error("💥 Seeding failed:", error);
  process.exit(1);
});
