import { useState } from "react";
import { Line, Bar } from "react-chartjs-2";

function AdminReports() {
  // User trend data (30 days)
  const userTrendData = {
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}/09`),
    datasets: [
      {
        label: "Người dùng mới",
        data: Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 50) + 10
        ),
        borderColor: "rgb(79, 70, 229)",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Hourly activity data
  const hourlyActivityData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Hoạt động",
        data: Array.from({ length: 24 }, (_, i) => {
          // Simulate realistic hourly patterns (lower at night, higher during day)
          if (i >= 0 && i <= 6) return Math.floor(Math.random() * 20) + 5; // Night
          if (i >= 7 && i <= 11) return Math.floor(Math.random() * 60) + 30; // Morning
          if (i >= 12 && i <= 18) return Math.floor(Math.random() * 80) + 40; // Afternoon
          return Math.floor(Math.random() * 40) + 20; // Evening
        }),
        backgroundColor: "rgb(245, 158, 11)",
        borderColor: "rgb(245, 158, 11)",
        borderWidth: 1,
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

  const [reportType, setReportType] = useState("summary");

  const handleExportPDF = () => {
    alert("Xuất báo cáo PDF (Tính năng demo)");
  };

  const handleExportExcel = () => {
    alert("Xuất báo cáo Excel (Tính năng demo)");
  };

  const handleSendEmail = () => {
    alert("Gửi báo cáo qua email (Tính năng demo)");
  };

  const getReportSummary = () => {
    const today = new Date();
    const thisMonth = today.getMonth() + 1;
    const thisYear = today.getFullYear();

    return {
      totalUsers: 1247,
      newUsersThisMonth: 156,
      conversationsThisMonth: 3420,
      avgSatisfactionScore: 4.2,
      responseRate: 94.5,
      avgResponseTime: "2.1s",
      topPerformingDay: "Thứ Ba",
      peakHour: "14:00-15:00",
    };
  };

  const summary = getReportSummary();

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-chart-bar text-red-600"></i>
          Báo cáo & Thống kê
        </h2>
        <p className="text-gray-600 mt-1">
          Báo cáo chi tiết về hiệu suất và xu hướng
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setReportType("summary")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === "summary"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-chart-pie mr-2"></i>
            Tóm tắt tổng quan
          </button>
          <button
            onClick={() => setReportType("detailed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === "detailed"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-list mr-2"></i>
            Báo cáo chi tiết
          </button>
          <button
            onClick={() => setReportType("custom")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === "custom"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i className="fas fa-cog mr-2"></i>
            Tùy chỉnh
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <i className="fas fa-chart-area text-blue-600"></i>
            <h3 className="text-lg font-semibold">
              Xu hướng người dùng (30 ngày)
            </h3>
          </div>
          <div className="h-64">
            <Line data={userTrendData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <i className="fas fa-clock text-yellow-600"></i>
            <h3 className="text-lg font-semibold">
              Thời gian hoạt động theo giờ
            </h3>
          </div>
          <div className="h-64">
            <Bar data={hourlyActivityData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Tóm tắt báo cáo tháng này
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {summary.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Tổng người dùng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {summary.newUsersThisMonth}
              </div>
              <div className="text-sm text-gray-600">
                Người dùng mới tháng này
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {summary.conversationsThisMonth.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Hội thoại tháng này</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {summary.avgSatisfactionScore}/5
              </div>
              <div className="text-sm text-gray-600">Điểm hài lòng TB</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Hiệu suất</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỉ lệ phản hồi:</span>
                  <span className="font-medium">{summary.responseRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian phản hồi TB:</span>
                  <span className="font-medium">{summary.avgResponseTime}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Xu hướng</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Ngày hoạt động cao nhất:
                  </span>
                  <span className="font-medium">
                    {summary.topPerformingDay}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giờ cao điểm:</span>
                  <span className="font-medium">{summary.peakHour}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Xuất báo cáo</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Xuất PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-file-excel mr-2"></i>
              Xuất Excel
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-envelope mr-2"></i>
              Gửi Email
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <i className="fas fa-info-circle text-blue-600 mt-1"></i>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Lưu ý</h4>
                <p className="text-sm text-blue-800">
                  Báo cáo sẽ được tạo dựa trên dữ liệu hiện tại và có thể mất
                  vài phút để hoàn thành. Báo cáo PDF sẽ bao gồm tất cả biểu đồ
                  và bảng thống kê chi tiết.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
