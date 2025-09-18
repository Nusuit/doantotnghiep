import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthNew.jsx";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/auth", { state: { mode: "register" } });
    }
  };

  const features = [
    {
      icon: "🍽️",
      title: "Khám phá ẩm thực",
      description:
        "Tìm kiếm những món ăn ngon từ khắp nơi với đánh giá chi tiết",
    },
    {
      icon: "⭐",
      title: "Đánh giá tin cậy",
      description: "Chia sẻ trải nghiệm và đọc review từ cộng đồng yêu ẩm thực",
    },
    {
      icon: "📍",
      title: "Tìm địa điểm",
      description: "Định vị quán ăn gần bạn với thông tin chi tiết và đường đi",
    },
    {
      icon: "🤖",
      title: "AI gợi ý",
      description: "Nhận gợi ý món ăn phù hợp với sở thích cá nhân từ AI",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Khám phá <span className="text-orange-500">ẩm thực</span>
              <br />
              cùng cộng đồng
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Tìm kiếm, đánh giá và chia sẻ những trải nghiệm ẩm thực tuyệt vời.
              Khám phá món ăn yêu thích với sự hỗ trợ của AI thông minh.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleGetStarted}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
              >
                {isAuthenticated ? "Vào ứng dụng" : "Bắt đầu ngay"}
              </button>
              <button
                onClick={() => navigate("/auth", { state: { mode: "login" } })}
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn FoodReview?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi mang đến trải nghiệm tìm kiếm và đánh giá ẩm thực tốt
              nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sẵn sàng khám phá?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Tham gia cộng đồng yêu ẩm thực và tìm kiếm những món ăn tuyệt vời
            ngay hôm nay
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-orange-500 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg text-lg transition-colors"
          >
            {isAuthenticated ? "Vào ứng dụng" : "Đăng ký miễn phí"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-orange-500 mb-4">
                🍽️ FoodReview
              </h3>
              <p className="text-gray-400 mb-4">
                Nền tảng đánh giá và khám phá ẩm thực hàng đầu Việt Nam. Kết nối
                những người yêu thích ẩm thực với nhau.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Tìm kiếm món ăn
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Đánh giá nhà hàng
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    AI gợi ý
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Liên hệ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Hướng dẫn
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Điều khoản
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FoodReview. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
