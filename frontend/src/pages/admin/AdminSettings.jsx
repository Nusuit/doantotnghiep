import { useState } from "react";

function AdminSettings() {
  const [botSettings, setBotSettings] = useState({
    name: "ChatBot Assistant",
    language: "vi",
    maxResponseTime: 5,
    autoLearn: true,
    confidenceThreshold: 0.8,
  });

  const [users] = useState([
    {
      id: 1,
      email: "admin@example.com",
      role: "admin",
      status: "active",
      lastLogin: "16/09 14:30",
    },
    {
      id: 2,
      email: "user@example.com",
      role: "user",
      status: "active",
      lastLogin: "16/09 12:15",
    },
    {
      id: 3,
      email: "manager@example.com",
      role: "manager",
      status: "inactive",
      lastLogin: "15/09 18:22",
    },
  ]);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowConfidenceWarning: true,
    dailyReports: false,
    systemMaintenance: true,
  });

  const handleBotSettingChange = (key, value) => {
    setBotSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = () => {
    alert("Cài đặt đã được lưu (Demo)");
  };

  const handleAddUser = () => {
    alert("Thêm người dùng mới (Demo)");
  };

  const handleEditUser = (userId) => {
    alert(`Chỉnh sửa user ID: ${userId} (Demo)`);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { class: "bg-red-100 text-red-800", text: "Admin" },
      manager: { class: "bg-purple-100 text-purple-800", text: "Manager" },
      user: { class: "bg-blue-100 text-blue-800", text: "User" },
    };
    const config = roleConfig[role] || roleConfig.user;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {status === "active" ? "Hoạt động" : "Không hoạt động"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-cog text-gray-600"></i>
          Cài đặt Hệ thống
        </h2>
        <p className="text-gray-600 mt-1">
          Cấu hình chatbot và quản lý quyền truy cập
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Configuration */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i className="fas fa-robot text-blue-600"></i>
              Cấu hình Bot
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Bot
              </label>
              <input
                type="text"
                value={botSettings.name}
                onChange={(e) => handleBotSettingChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ mặc định
              </label>
              <select
                value={botSettings.language}
                onChange={(e) =>
                  handleBotSettingChange("language", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian phản hồi tối đa (giây)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={botSettings.maxResponseTime}
                onChange={(e) =>
                  handleBotSettingChange(
                    "maxResponseTime",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngưỡng tin cậy tối thiểu
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={botSettings.confidenceThreshold}
                onChange={(e) =>
                  handleBotSettingChange(
                    "confidenceThreshold",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1</span>
                <span className="font-medium">
                  {botSettings.confidenceThreshold}
                </span>
                <span>1.0</span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoLearn"
                checked={botSettings.autoLearn}
                onChange={(e) =>
                  handleBotSettingChange("autoLearn", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoLearn" className="ml-2 text-sm text-gray-700">
                Tự động học từ phản hồi người dùng
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-save mr-2"></i>
              Lưu cài đặt
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <i className="fas fa-bell text-yellow-600"></i>
              Cài đặt Thông báo
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Email cảnh báo</div>
                <div className="text-sm text-gray-500">
                  Nhận thông báo khi có vấn đề
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={() => handleNotificationChange("emailAlerts")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Cảnh báo độ tin cậy thấp
                </div>
                <div className="text-sm text-gray-500">
                  Khi bot không chắc chắn về câu trả lời
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.lowConfidenceWarning}
                onChange={() =>
                  handleNotificationChange("lowConfidenceWarning")
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Báo cáo hàng ngày
                </div>
                <div className="text-sm text-gray-500">
                  Gửi tóm tắt hoạt động mỗi ngày
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailyReports}
                onChange={() => handleNotificationChange("dailyReports")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Bảo trì hệ thống
                </div>
                <div className="text-sm text-gray-500">
                  Thông báo về việc bảo trì và cập nhật
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.systemMaintenance}
                onChange={() => handleNotificationChange("systemMaintenance")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <i className="fas fa-envelope mr-2"></i>
                Gửi email test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-users-cog text-purple-600"></i>
            Quản lý quyền truy cập
          </h3>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-plus mr-1"></i>
            Thêm người dùng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đăng nhập cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-server text-green-600"></i>
            Trạng thái Hệ thống
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <i className="fas fa-check-circle text-3xl text-green-600 mb-2"></i>
              <div className="font-medium text-gray-900">Database</div>
              <div className="text-sm text-green-600">
                Hoạt động bình thường
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <i className="fas fa-check-circle text-3xl text-green-600 mb-2"></i>
              <div className="font-medium text-gray-900">API Server</div>
              <div className="text-sm text-green-600">
                Hoạt động bình thường
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <i className="fas fa-exclamation-triangle text-3xl text-yellow-600 mb-2"></i>
              <div className="font-medium text-gray-900">Email Service</div>
              <div className="text-sm text-yellow-600">Đang bảo trì</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uptime</span>
              <span className="text-sm text-gray-900">99.9%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: "99.9%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
