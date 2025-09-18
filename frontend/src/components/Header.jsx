import { useState } from "react";
import { useAuth } from "../hooks/useAuthNew.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAuthClick = (type) => {
    navigate("/auth", { state: { mode: type } });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const isAdminUser = (email) => {
    return email === "huykien283@gmail.com";
  };

  // Don't show header on auth page and profile setup
  if (location.pathname === "/auth" || location.pathname === "/profile-setup") {
    return null;
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="text-2xl font-bold text-orange-500 cursor-pointer"
              onClick={() => navigate("/")}
            >
              🍽️ FoodReview
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleAuthClick("login")}
                    className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => handleAuthClick("register")}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Đăng ký
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Navigation Links for authenticated users */}
                  <button
                    onClick={() => navigate("/home")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === "/home"
                        ? "text-orange-500 bg-orange-50"
                        : "text-gray-700 hover:text-orange-500"
                    }`}
                  >
                    Trang chủ
                  </button>

                  {/* Admin Link */}
                  {isAdminUser(user?.email) && (
                    <button
                      onClick={() => navigate("/admin")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname.startsWith("/admin")
                          ? "text-orange-500 bg-orange-50"
                          : "text-gray-700 hover:text-orange-500"
                      }`}
                    >
                      Quản trị
                    </button>
                  )}

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </div>
                      <span>{getUserDisplayName()}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isMenuOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setIsMenuOpen(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 w-full text-left"
                        >
                          Hồ sơ cá nhân
                        </button>
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setIsMenuOpen(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 w-full text-left"
                        >
                          Cài đặt
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-500 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      handleAuthClick("login");
                      setIsMenuOpen(false);
                    }}
                    className="block text-gray-700 hover:text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      handleAuthClick("register");
                      setIsMenuOpen(false);
                    }}
                    className="block bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Đăng ký
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <span>{getUserDisplayName()}</span>
                  </div>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      navigate("/home");
                      setIsMenuOpen(false);
                    }}
                    className="block text-gray-700 hover:text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Trang chủ
                  </button>
                  {isAdminUser(user?.email) && (
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setIsMenuOpen(false);
                      }}
                      className="block text-gray-700 hover:text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                    >
                      Quản trị
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsMenuOpen(false);
                    }}
                    className="block text-gray-700 hover:text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setIsMenuOpen(false);
                    }}
                    className="block text-gray-700 hover:text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Cài đặt
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
