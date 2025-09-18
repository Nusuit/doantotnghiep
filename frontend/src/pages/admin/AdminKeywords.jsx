import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";

function AdminKeywords() {
  const [topKeywords] = useState([
    { keyword: "giá cả", count: 45, trend: "up" },
    { keyword: "hỗ trợ", count: 38, trend: "up" },
    { keyword: "sản phẩm", count: 32, trend: "down" },
    { keyword: "đơn hàng", count: 28, trend: "up" },
    { keyword: "thanh toán", count: 25, trend: "stable" },
    { keyword: "giao hàng", count: 22, trend: "up" },
    { keyword: "khuyến mãi", count: 18, trend: "down" },
    { keyword: "tài khoản", count: 15, trend: "stable" },
    { keyword: "đăng ký", count: 12, trend: "up" },
    { keyword: "liên hệ", count: 10, trend: "stable" },
  ]);

  const keywordBarData = {
    labels: topKeywords.map((k) => k.keyword),
    datasets: [
      {
        label: "Tần suất",
        data: topKeywords.map((k) => k.count),
        backgroundColor: [
          "#EF4444",
          "#F97316",
          "#EAB308",
          "#22C55E",
          "#06B6D4",
          "#3B82F6",
          "#6366F1",
          "#8B5CF6",
          "#EC4899",
          "#F59E0B",
        ],
      },
    ],
  };

  const keywordTrendsData = {
    labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
    datasets: [
      {
        label: "giá cả",
        data: [30, 35, 42, 45],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
      {
        label: "hỗ trợ",
        data: [25, 30, 35, 38],
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: "sản phẩm",
        data: [40, 38, 35, 32],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <i className="fas fa-arrow-up text-green-500"></i>;
      case "down":
        return <i className="fas fa-arrow-down text-red-500"></i>;
      default:
        return <i className="fas fa-minus text-gray-500"></i>;
    }
  };

  const wordCloudWords = [
    { text: "giá cả", size: "2rem", color: "#3B82F6" },
    { text: "hỗ trợ", size: "1.5rem", color: "#22C55E" },
    { text: "sản phẩm", size: "1.8rem", color: "#F59E0B" },
    { text: "đơn hàng", size: "1.3rem", color: "#8B5CF6" },
    { text: "thanh toán", size: "1.6rem", color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-search text-yellow-600"></i>
          Phân tích từ khóa & Xu hướng
        </h2>
        <p className="text-gray-600 mt-1">
          Phân tích từ khóa tìm kiếm và xu hướng quan tâm của người dùng
        </p>
      </div>

      {/* Top Keywords and Word Cloud */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm h-96">
            <div className="flex items-center gap-2 mb-6">
              <i className="fas fa-chart-bar text-yellow-600"></i>
              <h3 className="text-lg font-semibold">Top 10 từ khóa phổ biến</h3>
            </div>
            <div className="h-72">
              <Bar data={keywordBarData} options={barOptions} />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm h-96 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <i className="fas fa-cloud text-blue-600"></i>
              <h3 className="text-lg font-semibold">Word Cloud</h3>
            </div>
            <div className="text-center space-y-4">
              {wordCloudWords.map((word, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: word.size,
                    color: word.color,
                    fontWeight: "bold",
                    margin: "8px",
                  }}
                >
                  {word.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Trends */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6">
          <i className="fas fa-chart-line text-blue-600"></i>
          <h3 className="text-lg font-semibold">
            Xu hướng từ khóa theo thời gian
          </h3>
        </div>
        <div className="h-80">
          <Line data={keywordTrendsData} options={chartOptions} />
        </div>
      </div>

      {/* Keyword Analysis Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-table text-gray-600"></i>
            Chi tiết từ khóa
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Từ khóa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tần suất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xu hướng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỉ lệ thành công
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topKeywords.slice(0, 8).map((keyword, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {keyword.keyword}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {keyword.count} lần
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTrendIcon(keyword.trend)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-600 font-medium">
                      {Math.floor(Math.random() * 20) + 75}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      <i className="fas fa-eye mr-1"></i>
                      Xem chi tiết
                    </button>
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

export default AdminKeywords;
