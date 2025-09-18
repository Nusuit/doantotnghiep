import { useState } from "react";

function AdminKnowledge() {
  const [unansweredQuestions] = useState([
    { question: "Làm sao để thay đổi mật khẩu?", frequency: 15 },
    { question: "Tôi quên email đăng ký", frequency: 8 },
    { question: "Cách xóa tài khoản?", frequency: 6 },
    { question: "Tôi không nhận được email xác nhận", frequency: 12 },
    { question: "Làm sao để nâng cấp gói premium?", frequency: 9 },
  ]);

  const [improvements] = useState([
    {
      type: "suggestion",
      message: "Thêm FAQ về đổi mật khẩu",
      priority: "high",
    },
    {
      type: "warning",
      message: "Nhiều user hỏi về email recovery",
      priority: "medium",
    },
    {
      type: "info",
      message: "Cân nhắc thêm chatbot cho support cơ bản",
      priority: "low",
    },
  ]);

  const getFrequencyBadge = (frequency) => {
    if (frequency >= 10) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          {frequency} lần
        </span>
      );
    } else if (frequency >= 5) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          {frequency} lần
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {frequency} lần
        </span>
      );
    }
  };

  const getImprovementIcon = (type) => {
    const icons = {
      suggestion: { icon: "fas fa-lightbulb", color: "text-blue-500" },
      warning: {
        icon: "fas fa-exclamation-triangle",
        color: "text-yellow-500",
      },
      info: { icon: "fas fa-info-circle", color: "text-green-500" },
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-brain text-green-600"></i>
          Tri thức Bot
        </h2>
        <p className="text-gray-600 mt-1">
          Quản lý kiến thức và cải thiện khả năng của chatbot
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 text-center">
          <i className="fas fa-question-circle text-4xl text-blue-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">245</div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            FAQ entries
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 text-center">
          <i className="fas fa-bullseye text-4xl text-green-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">89</div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Intents
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 text-center">
          <i className="fas fa-graduation-cap text-4xl text-purple-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">94.2%</div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Độ chính xác
          </div>
        </div>
      </div>

      {/* Knowledge Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Unanswered Questions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Câu hỏi chưa trả lời được
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {unansweredQuestions.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.question}</p>
                  </div>
                  <div className="ml-4">
                    {getFrequencyBadge(item.frequency)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <i className="fas fa-plus mr-2"></i>
                Thêm FAQ mới
              </button>
            </div>
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Gợi ý cải thiện
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {improvements.map((item, index) => {
                const iconConfig = getImprovementIcon(item.type);
                return (
                  <div
                    key={index}
                    className={`p-4 border-l-4 rounded-r-lg ${
                      item.type === "suggestion"
                        ? "border-blue-500 bg-blue-50"
                        : item.type === "warning"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-green-500 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <i
                        className={`${iconConfig.icon} ${iconConfig.color} mt-1`}
                      ></i>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{item.message}</p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                            item.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : item.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.priority === "high"
                            ? "Cao"
                            : item.priority === "medium"
                            ? "Trung bình"
                            : "Thấp"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <button className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                <i className="fas fa-sync-alt mr-2"></i>
                Cập nhật tri thức
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Management */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-database text-gray-600"></i>
            Quản lý cơ sở tri thức
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <i className="fas fa-upload text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm text-gray-600">Upload tài liệu</div>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <i className="fas fa-robot text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm text-gray-600">Huấn luyện Bot</div>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <i className="fas fa-chart-line text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm text-gray-600">Phân tích hiệu suất</div>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <i className="fas fa-cogs text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm text-gray-600">Cài đặt nâng cao</div>
            </button>
          </div>

          {/* Recent Updates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Cập nhật gần đây
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <i className="fas fa-plus-circle text-green-500"></i>
                <span className="text-gray-600">
                  Thêm 5 FAQ mới về thanh toán
                </span>
                <span className="text-gray-400 text-xs">2 giờ trước</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <i className="fas fa-edit text-blue-500"></i>
                <span className="text-gray-600">
                  Cập nhật intent "hỗ trợ kỹ thuật"
                </span>
                <span className="text-gray-400 text-xs">5 giờ trước</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <i className="fas fa-trash text-red-500"></i>
                <span className="text-gray-600">
                  Xóa 2 response không phù hợp
                </span>
                <span className="text-gray-400 text-xs">1 ngày trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminKnowledge;
