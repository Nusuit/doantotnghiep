"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthenticatedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  MessageSquare,
  Bell,
  User,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import {
  MapBox,
  useMap,
  MapProvider,
  MapMarker,
  useGeolocation,
  useMapBounds,
} from "@/components/Map";
import MapLayerControl, { LayerMode } from "@/components/Map/MapLayerControl";
import MapSearch from "@/components/Map/MapSearch";

// Demo restaurant markers
const demoMarkers: any[] = [
  {
    id: "1",
    longitude: 106.6297,
    latitude: 10.8231,
    title: "Phở Hòa Pasteur",
    description: "Phở bò ngon nổi tiếng Sài Gòn",
    category: "restaurant",
  },
  {
    id: "2",
    longitude: 106.7008,
    latitude: 10.7769,
    title: "Cơm Tấm Ba Ghiền",
    description: "Cơm tấm sườn bì chả trứng",
    category: "restaurant",
  },
  {
    id: "3",
    longitude: 106.6837,
    latitude: 10.7756,
    title: "Bánh Mì Huỳnh Hoa",
    description: "Bánh mì pate nổi tiếng",
    category: "restaurant",
  },
];

const ClientHomepage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/chat?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Tri Thức Vị Giác
                  </h1>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tìm kiếm nhà hàng, món ăn..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Navigation & User Menu */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleNavigation("/social")}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden sm:block">Social</span>
                </button>

                <button
                  onClick={() => handleNavigation("/chat")}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="hidden sm:block">Chat AI</span>
                </button>

                <button className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="hidden sm:block font-medium">
                      {user?.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Cài đặt</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chào mừng, {user?.name}!
              </h2>
              <p className="text-gray-600">
                Khám phá những nhà hàng tuyệt vời xung quanh bạn
              </p>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bản đồ nhà hàng
                  </h3>
                  <div className="flex items-center space-x-2">
                    <MapSearch />
                    <MapLayerControl
                      currentMode="all"
                      onModeChange={() => {}}
                    />
                  </div>
                </div>
              </div>

              <div className="h-[600px] relative">
                <MapBox
                  initialViewState={{
                    longitude: 106.6297,
                    latitude: 10.8231,
                    zoom: 13,
                  }}
                  showControls={true}
                  showMapControls={true}
                  height="100%"
                  width="100%"
                >
                  {demoMarkers.map((marker) => (
                    <div key={marker.id} className="marker-popup">
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {marker.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {marker.description}
                        </p>
                        <button className="text-xs bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-700">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </MapBox>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleNavigation("/social")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <Users className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">
                  Mạng xã hội ẩm thực
                </h3>
                <p className="text-blue-100">
                  Chia sẻ và khám phá trải nghiệm ẩm thực
                </p>
              </button>

              <button
                onClick={() => handleNavigation("/chat")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <MessageSquare className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Chat với AI</h3>
                <p className="text-emerald-100">Hỏi AI về món ăn và nhà hàng</p>
              </button>

              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <MapPin className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">
                  Khám phá địa điểm
                </h3>
                <p className="text-orange-100">
                  Tìm kiếm nhà hàng mới xung quanh
                </p>
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
};

export default ClientHomepage;
