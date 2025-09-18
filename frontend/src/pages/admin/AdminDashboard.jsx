import { useState, useEffect } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminDashboard() {
  const [kpiData, setKpiData] = useState({
    totalConversations: 1247,
    activeUsers: 156,
    responseRate: 94.5,
    avgResponseTime: 2.1,
  });

  const [recentConversations] = useState([
    {
      time: "10:30 AM",
      user: "john_doe",
      message: "Xin chào, tôi cần hỗ trợ về giá cả...",
      status: "active",
    },
    {
      time: "10:25 AM",
      user: "jane_smith",
      message: "Giá của gói premium là bao nhiều?",
      status: "completed",
    },
    {
      time: "10:20 AM",
      user: "bob_wilson",
      message: "Tôi muốn hủy đơn hàng",
      status: "completed",
    },
    {
      time: "10:15 AM",
      user: "alice_brown",
      message: "Làm sao để thay đổi thông tin tài khoản?",
      status: "pending",
    },
    {
      time: "10:10 AM",
      user: "charlie_davis",
      message: "Tôi quên mật khẩu",
      status: "completed",
    },
  ]);

  // Chart data
  const dailyConversationsData = {
    labels: ["11/09", "12/09", "13/09", "14/09", "15/09", "16/09", "17/09"],
    datasets: [
      {
        label: "Hội thoại",
        data: [45, 52, 48, 61, 55, 58, 62],
        borderColor: "rgb(79, 70, 229)",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const statusPieData = {
    labels: ["Hoàn thành", "Đang hoạt động", "Tạm dừng"],
    datasets: [
      {
        data: [75, 20, 5],
        backgroundColor: [
          "rgb(16, 185, 129)",
          "rgb(79, 70, 229)",
          "rgb(245, 158, 11)",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const refreshData = () => {
    // Simulate data refresh with random variations
    setKpiData((prev) => ({
      totalConversations:
        prev.totalConversations + Math.floor(Math.random() * 10) - 5,
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2,
      responseRate: Math.max(
        90,
        Math.min(99, prev.responseRate + (Math.random() - 0.5) * 2)
      ),
      avgResponseTime: Math.max(
        1.0,
        Math.min(5.0, prev.avgResponseTime + (Math.random() - 0.5) * 0.5)
      ),
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: "bg-green-100 text-green-800", text: "Đang hoạt động" },
      completed: { class: "bg-blue-100 text-blue-800", text: "Hoàn thành" },
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Chờ xử lý" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-tachometer-alt text-blue-600"></i>
          Dashboard Tổng quan
        </h2>
        <p className="text-gray-600 mt-1">
          Theo dõi hiệu suất chatbot và các chỉ số quan trọng
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-blue-500 text-center">
          <i className="fas fa-comments text-4xl text-blue-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {kpiData.totalConversations.toLocaleString()}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Tổng Hội thoại
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-green-500 text-center">
          <i className="fas fa-users text-4xl text-green-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {kpiData.activeUsers}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            User Hoạt động
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-yellow-500 text-center">
          <i className="fas fa-percentage text-4xl text-yellow-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {kpiData.responseRate.toFixed(1)}%
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Tỉ lệ phản hồi
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-purple-500 text-center">
          <i className="fas fa-clock text-4xl text-purple-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {kpiData.avgResponseTime.toFixed(1)}s
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Thời gian phản hồi
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm h-96">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-chart-line text-blue-600"></i>
              <h3 className="text-lg font-semibold">
                Hội thoại theo ngày (7 ngày gần nhất)
              </h3>
            </div>
            <div className="h-72">
              <Line data={dailyConversationsData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm h-96">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-chart-pie text-green-600"></i>
              <h3 className="text-lg font-semibold">Trạng thái hội thoại</h3>
            </div>
            <div className="h-72">
              <Doughnut data={statusPieData} options={pieChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-history text-blue-600"></i>
            Hoạt động gần đây
          </h3>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-sync-alt mr-1"></i>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tin nhắn đầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentConversations.map((conv, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {conv.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{conv.user}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {conv.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(conv.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
