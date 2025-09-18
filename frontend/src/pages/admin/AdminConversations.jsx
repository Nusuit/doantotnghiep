import { useState } from "react";

function AdminConversations() {
  const [conversations] = useState([
    {
      id: 1001,
      user: "john_doe",
      startTime: "16/09 10:30",
      duration: "15m 30s",
      messageCount: 8,
      rating: 5,
      status: "completed",
      lastMessage: "Cảm ơn bạn đã hỗ trợ!",
    },
    {
      id: 1002,
      user: "jane_smith",
      startTime: "16/09 10:25",
      duration: "8m 15s",
      messageCount: 5,
      rating: 4,
      status: "completed",
      lastMessage: "Tôi đã hiểu rồi, cảm ơn",
    },
    {
      id: 1003,
      user: "bob_wilson",
      startTime: "16/09 10:20",
      duration: "22m 10s",
      messageCount: 12,
      rating: 5,
      status: "completed",
      lastMessage: "Vấn đề đã được giải quyết",
    },
    {
      id: 1004,
      user: "alice_brown",
      startTime: "16/09 10:15",
      duration: "5m 45s",
      messageCount: 3,
      rating: 0,
      status: "active",
      lastMessage: "Tôi cần hỗ trợ thêm...",
    },
    {
      id: 1005,
      user: "charlie_davis",
      startTime: "16/09 10:10",
      duration: "12m 30s",
      messageCount: 7,
      rating: 3,
      status: "pending",
      lastMessage: "Hm, vẫn chưa rõ lắm",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        class: "bg-green-100 text-green-800",
        text: "Đang hoạt động",
        icon: "fas fa-circle",
      },
      completed: {
        class: "bg-blue-100 text-blue-800",
        text: "Hoàn thành",
        icon: "fas fa-check-circle",
      },
      pending: {
        class: "bg-yellow-100 text-yellow-800",
        text: "Cần xử lý",
        icon: "fas fa-clock",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.class}`}
      >
        <i className={`${config.icon} text-xs`}></i>
        {config.text}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    if (rating === 0)
      return <span className="text-gray-400">Chưa đánh giá</span>;

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star text-sm ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          ></i>
        ))}
      </div>
    );
  };

  const getKpiStats = () => {
    const today = conversations.length;
    const avgRating =
      conversations
        .filter((c) => c.rating > 0)
        .reduce((sum, c) => sum + c.rating, 0) /
      conversations.filter((c) => c.rating > 0).length;
    const needsAttention = conversations.filter(
      (c) => c.status === "pending" || c.status === "active"
    ).length;

    return { today, avgRating: avgRating || 0, needsAttention };
  };

  const stats = getKpiStats();

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-comments text-blue-600"></i>
          Quản lý Hội thoại
        </h2>
        <p className="text-gray-600 mt-1">
          Xem chi tiết và phân tích các cuộc hội thoại
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 text-center">
          <i className="fas fa-comment-dots text-4xl text-blue-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.today}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Hội thoại hôm nay
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 text-center">
          <i className="fas fa-smile text-4xl text-green-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.avgRating.toFixed(1)}/5
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Đánh giá trung bình
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4 opacity-80"></i>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.needsAttention}
          </div>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Cần xử lý
          </div>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách hội thoại
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="completed">Hoàn thành</option>
                <option value="pending">Cần xử lý</option>
              </select>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm hội thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bắt đầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tin nhắn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    #{conv.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{conv.user}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {conv.lastMessage}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conv.startTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conv.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {conv.messageCount} tin nhắn
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRatingStars(conv.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(conv.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="text-green-600 hover:text-green-900 px-2 py-1 rounded">
                        <i className="fas fa-download"></i>
                      </button>
                      {conv.status !== "completed" && (
                        <button className="text-orange-600 hover:text-orange-900 px-2 py-1 rounded">
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredConversations.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy hội thoại
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminConversations;
