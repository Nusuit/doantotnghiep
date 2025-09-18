import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthNew";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentModule, setCurrentModule] = useState("dashboard");
  const [sidebarMobile, setSidebarMobile] = useState(false);

  // Update current module based on URL
  useEffect(() => {
    const path = location.pathname.split("/admin/")[1] || "dashboard";
    setCurrentModule(path);
  }, [location.pathname]);

  const navigationItems = [
    {
      id: "dashboard",
      path: "/admin",
      label: "Dashboard",
      icon: "fas fa-tachometer-alt",
    },
    {
      id: "keywords",
      path: "/admin/keywords",
      label: "Phân tích từ khóa",
      icon: "fas fa-search",
    },
    {
      id: "conversations",
      path: "/admin/conversations",
      label: "Quản lý hội thoại",
      icon: "fas fa-comments",
    },
    {
      id: "knowledge",
      path: "/admin/knowledge",
      label: "Tri thức Bot",
      icon: "fas fa-brain",
    },
    {
      id: "reports",
      path: "/admin/reports",
      label: "Báo cáo",
      icon: "fas fa-chart-bar",
    },
    {
      id: "settings",
      path: "/admin/settings",
      label: "Cài đặt",
      icon: "fas fa-cog",
    },
  ];

  const getPageTitle = () => {
    const item = navigationItems.find((item) => item.id === currentModule);
    return item ? item.label : "Dashboard";
  };

  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("vi-VN", options);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarMobile(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Font Awesome CDN */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white z-50 transition-transform duration-300 overflow-y-auto ${
          sidebarMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Brand */}
        <div className="p-5 border-b border-white/10 text-center">
          <i className="fas fa-robot text-4xl mb-3 text-indigo-400"></i>
          <h4 className="text-xl font-semibold mb-1">Chatbot Admin</h4>
          <small className="text-gray-400">Quản lý & Phân tích</small>
        </div>

        {/* Navigation */}
        <nav className="py-5">
          {navigationItems.map((item) => (
            <div key={item.id} className="mx-0 my-1">
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-5 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 border-l-4 ${
                  currentModule === item.id
                    ? "border-indigo-500 bg-white/10 text-white"
                    : "border-transparent"
                }`}
              >
                <i className={`${item.icon} w-5 mr-3`}></i>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-0 md:ml-64 min-h-screen transition-all duration-300">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarMobile(!sidebarMobile)}
              className="btn btn-link d-md-none md:hidden"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            <h5 className="text-lg font-medium ml-2 mb-0">{getPageTitle()}</h5>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 hidden sm:block">
              <i className="fas fa-calendar mr-2"></i>
              {getCurrentDate()}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 hidden sm:block">
                {user?.fullname || user?.username || user?.email}
              </span>
              <button
                onClick={() => navigate("/")}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <i className="fas fa-home mr-1"></i>
                Trang chính
              </button>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-1"></i>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarMobile(false)}
        ></div>
      )}
    </div>
  );
}

export default AdminLayout;
