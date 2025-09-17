// Navbar component theo design specs với TailwindCSS
const Navbar = () => {
  return (
    <nav className="bg-white h-15 border-b border-gray-300 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-15">
          {/* Logo bên trái */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-orange-500">SocialNet</h1>
          </div>

          {/* Menu ở giữa */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-6">
              <a
                href="#"
                className="text-gray-800 hover:text-orange-500 font-semibold px-3 py-2 rounded-md text-sm transition-colors"
              >
                Trang chủ
              </a>
              <a
                href="#"
                className="text-gray-800 hover:text-orange-500 font-semibold px-3 py-2 rounded-md text-sm transition-colors"
              >
                Khám phá
              </a>
              <a
                href="#"
                className="text-gray-800 hover:text-orange-500 font-semibold px-3 py-2 rounded-md text-sm transition-colors"
              >
                Review
              </a>
              <a
                href="#"
                className="text-gray-800 hover:text-orange-500 font-semibold px-3 py-2 rounded-md text-sm transition-colors"
              >
                Cộng đồng
              </a>
            </div>
          </div>

          {/* Nút đăng nhập/viết review bên phải */}
          <div className="flex items-center space-x-4">
            <button className="bg-orange-500 hover:bg-yellow-400 hover:text-gray-800 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors">
              Viết Review
            </button>
            <button className="text-gray-800 hover:text-orange-500 font-semibold px-4 py-2 border border-gray-300 rounded-md text-sm transition-colors">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
