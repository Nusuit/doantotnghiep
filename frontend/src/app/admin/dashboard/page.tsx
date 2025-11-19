"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import {
  Users,
  MapPin,
  MessageSquare,
  Settings,
  BarChart3,
  Database,
  LogOut,
  User,
  Bell,
  Search,
  TrendingUp,
  Activity,
  UserCheck,
  Shield,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Mock data for dashboard
  const stats = [
    {
      title: "Tổng người dùng",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "blue",
    },
    {
      title: "Nhà hàng",
      value: "1,234",
      change: "+5%",
      icon: MapPin,
      color: "green",
    },
    {
      title: "Tin nhắn AI",
      value: "15,623",
      change: "+23%",
      icon: MessageSquare,
      color: "purple",
    },
    {
      title: "Hoạt động",
      value: "89%",
      change: "+2%",
      icon: Activity,
      color: "orange",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      action: "Đăng ký tài khoản mới",
      time: "5 phút trước",
    },
    {
      id: 2,
      user: "Trần Thị B",
      action: "Thêm nhà hàng mới",
      time: "10 phút trước",
    },
    { id: 3, user: "Lê Văn C", action: "Chat với AI", time: "15 phút trước" },
    {
      id: 4,
      user: "Phạm Thị D",
      action: "Chia sẻ bài viết",
      time: "20 phút trước",
    },
  ];

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    5
                  </span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                          Admin
                        </span>
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

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r border-gray-200">
            <nav className="p-4 space-y-2">
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-indigo-600 bg-indigo-50 rounded-lg"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <Users className="w-5 h-5" />
                <span>Quản lý người dùng</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <MapPin className="w-5 h-5" />
                <span>Quản lý nhà hàng</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat & AI</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <Database className="w-5 h-5" />
                <span>Dữ liệu & Báo cáo</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <Settings className="w-5 h-5" />
                <span>Cài đặt hệ thống</span>
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {/* Welcome Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chào mừng, {user?.name}!
              </h2>
              <p className="text-gray-600">Quản lý hệ thống Tri Thức Vị Giác</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                const colorClasses = {
                  blue: "bg-blue-500 text-blue-600 bg-blue-50",
                  green: "bg-green-500 text-green-600 bg-green-50",
                  purple: "bg-purple-500 text-purple-600 bg-purple-50",
                  orange: "bg-orange-500 text-orange-600 bg-orange-50",
                };

                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 ${
                          colorClasses[
                            stat.color as keyof typeof colorClasses
                          ].split(" ")[2]
                        } rounded-lg flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`w-6 h-6 ${
                            colorClasses[
                              stat.color as keyof typeof colorClasses
                            ].split(" ")[1]
                          }`}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        so với tháng trước
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hoạt động gần đây
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.user}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tác vụ nhanh
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <Users className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-medium text-gray-900">
                        Thêm người dùng
                      </h4>
                      <p className="text-sm text-gray-500">Tạo tài khoản mới</p>
                    </button>

                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <MapPin className="w-8 h-8 text-green-600 mb-2" />
                      <h4 className="font-medium text-gray-900">
                        Thêm nhà hàng
                      </h4>
                      <p className="text-sm text-gray-500">
                        Đăng ký địa điểm mới
                      </p>
                    </button>

                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Xem báo cáo</h4>
                      <p className="text-sm text-gray-500">Thống kê chi tiết</p>
                    </button>

                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <Settings className="w-8 h-8 text-orange-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Cài đặt</h4>
                      <p className="text-sm text-gray-500">Cấu hình hệ thống</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminDashboard;
