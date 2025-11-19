#!/usr/bin/env node

const axios = require("axios");

const API_BASE_URL = "http://localhost:4000/api";

const mockRestaurants = [
  {
    name: "Bánh Mì Huỳnh Hoa",
    description:
      "Bánh mì đặc biệt ngon nhất Sài Gòn với nhân đầy đủ, thịt tươi và bánh giòn.",
    address: "26 Lê Thị Riêng, Bến Nghé, Quận 1, Hồ Chí Minh",
    userId: 1,
    category: "Bánh Mì",
    phone: "+84 28 3829 7943",
    priceLevel: 1,
  },
  {
    name: "Phở Bò Lê",
    description:
      "Phở bò truyền thống với nước dùng trong vắt và thịt bò mềm ngọt.",
    address: "413 Nguyễn Trãi, Phường 7, Quận 5, Hồ Chí Minh",
    userId: 1,
    category: "Phở",
    phone: "+84 28 3855 4321",
    priceLevel: 1,
  },
  {
    name: "Cơm Tấm Sài Gòn",
    description:
      "Cơm tấm sườn nướng thơm phức với chả trứng và bì truyền thống.",
    address: "32 Hồ Hảo Hớn, Cô Giang, Quận 1, Hồ Chí Minh",
    userId: 1,
    category: "Cơm Tấm",
    phone: "+84 28 3925 6789",
    priceLevel: 2,
  },
  {
    name: "Bún Bò Huế Chị Ba",
    description:
      "Bún bò Huế chuẩn vị miền Trung với nước dùng đỏ đặc trưng và thịt bò tươi.",
    address: "45 Điện Biên Phủ, Đa Kao, Quận 1, Hồ Chí Minh",
    userId: 1,
    category: "Bún Bò Huế",
    phone: "+84 28 3822 1234",
    priceLevel: 2,
  },
  {
    name: "Bánh Xèo Miền Tây",
    description:
      "Bánh xèo giòn rụm với nhân tôm thịt đầy đặn, ăn kèm rau sống tươi ngon.",
    address: "88 Đinh Công Tráng, Tân Định, Quận 1, Hồ Chí Minh",
    userId: 1,
    category: "Bánh Xèo",
    phone: "+84 28 3829 5678",
    priceLevel: 2,
  },
  {
    name: "Gỏi Cuốn Sài Gòn",
    description:
      "Gỏi cuốn tươi ngon với tôm to, thịt luộc và rau thơm, chấm nước mắm me.",
    address: "67 Pasteur, Bến Nghé, Quận 1, Hồ Chí Minh",
    userId: 1,
    category: "Gỏi Cuốn",
    phone: "+84 28 3824 9876",
    priceLevel: 1,
  },
  {
    name: "Chè Ba Màu Tuyết",
    description:
      "Chè ba màu ngon lành với đậu xanh, đậu đỏ mềm vừa và nước cốt dừa thơm béo.",
    address: "123 Nguyễn Thiện Thuật, Phường 3, Quận 3, Hồ Chí Minh",
    userId: 1,
    category: "Chè",
    phone: "+84 28 3932 1111",
    priceLevel: 1,
  },
  {
    name: "Hủ Tiếu Mỹ Tho",
    description:
      "Hủ tiếu Mỹ Tho đúng điệu với nước dùng trong vắt, ngọt từ xương heo.",
    address: "156 Lý Thái Tổ, Phường 9, Quận 10, Hồ Chí Minh",
    userId: 1,
    category: "Hủ Tiếu",
    phone: "+84 28 3865 4321",
    priceLevel: 1,
  },
];

async function createRestaurantViaAPI(restaurantData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/restaurants`,
      restaurantData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to create ${restaurantData.name}:`,
      error.response?.data || error.message
    );
    return null;
  }
}

async function seedRestaurantsViaAPI() {
  console.log("🍜 Creating restaurants via API...");
  console.log("=" * 50);

  let successCount = 0;
  let failCount = 0;

  for (const restaurant of mockRestaurants) {
    console.log(`\n🔄 Creating: ${restaurant.name}`);

    const result = await createRestaurantViaAPI(restaurant);

    if (result && result.success) {
      console.log(
        `✅ Success: ${restaurant.name} created with ID ${result.data?.restaurant?.id}`
      );
      successCount++;
    } else {
      console.log(`❌ Failed: ${restaurant.name}`);
      failCount++;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n" + "=" * 50);
  console.log("📊 SEEDING RESULTS:");
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${successCount + failCount}`);

  if (successCount > 0) {
    console.log("\n🎉 Restaurants successfully added to database!");
    console.log(
      "🗺️  You can now see them on the map at http://localhost:3000/map"
    );
  }
}

// Check if API is running first
async function checkAPIHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/restaurants`);
    console.log("✅ API is running and accessible");
    return true;
  } catch (error) {
    console.error(
      "❌ API is not accessible. Make sure backend is running on port 4000"
    );
    return false;
  }
}

async function main() {
  console.log("🚀 Restaurant Seeding via API");

  // Check API health first
  const apiHealthy = await checkAPIHealth();
  if (!apiHealthy) {
    console.log("💡 Please run: cd backend && npm start");
    process.exit(1);
  }

  // Proceed with seeding
  await seedRestaurantsViaAPI();
}

main().catch((error) => {
  console.error("💥 Seeding failed:", error);
  process.exit(1);
});
