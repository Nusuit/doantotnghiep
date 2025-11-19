"use client";

import React, { useState } from "react";
import {
  Plus,
  MapPin,
  FileText,
  User,
  Phone,
  Globe,
  DollarSign,
  Tag,
  X,
  Check,
  Loader2,
} from "lucide-react";
import {
  restaurantService,
  CreateRestaurantData,
} from "@/services/restaurantService";

interface AddRestaurantFormProps {
  onClose: () => void;
  onSuccess: (restaurantId: number) => void;
}

const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    category: "",
    phone: "",
    website: "",
    imageUrl: "",
    priceLevel: 1,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priceLevel" ? parseInt(value) || 1 : value,
    }));

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.address.trim()
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createData: CreateRestaurantData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        userId: 1, // Mock user ID - trong thực tế sẽ lấy từ authentication
        category: formData.category.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        priceLevel: formData.priceLevel,
      };

      const response = await restaurantService.createRestaurant(createData);

      if (response.success && response.data?.restaurant) {
        console.log(
          "Restaurant created successfully:",
          response.data.restaurant
        );
        onSuccess(response.data.restaurant.id);
      } else {
        setError(response.error || "Có lỗi xảy ra khi tạo quán ăn");
      }
    } catch (err) {
      console.error("Error creating restaurant:", err);
      setError("Có lỗi xảy ra khi tạo quán ăn");
    } finally {
      setLoading(false);
    }
  };

  const getPriceLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Bình dân (< 100k)";
      case 2:
        return "Trung bình (100k - 300k)";
      case 3:
        return "Cao cấp (> 300k)";
      default:
        return "Bình dân";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Thêm quán ăn mới
              </h2>
              <p className="text-sm text-gray-600">
                Chia sẻ địa điểm yêu thích của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Restaurant Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Tên quán ăn *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ví dụ: Phở Hùng, Bánh mì Huỳnh Hoa..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Mô tả *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả về quán ăn: món đặc sản, không gian, phục vụ..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200 resize-none"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Ví dụ: 123 Nguyễn Văn Linh, Quận 7, TP.HCM"
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200"
              required
            />
            <p className="text-xs text-gray-500">
              💡 Địa chỉ sẽ được tự động định vị trên bản đồ
            </p>
          </div>

          {/* Category & Price Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Loại hình
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200"
              >
                <option value="">Chọn loại</option>
                <option value="Việt Nam">Việt Nam</option>
                <option value="Cà phê">Cà phê</option>
                <option value="Ăn vặt">Ăn vặt</option>
                <option value="Tráng miệng">Tráng miệng</option>
                <option value="Đồ uống">Đồ uống</option>
                <option value="Lẩu nướng">Lẩu nướng</option>
                <option value="Hải sản">Hải sản</option>
                <option value="Quốc tế">Quốc tế</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Mức giá
              </label>
              <select
                name="priceLevel"
                value={formData.priceLevel}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200"
              >
                <option value={1}>💰 Bình dân</option>
                <option value={2}>💵 Trung bình</option>
                <option value={3}>💎 Cao cấp</option>
              </select>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Thông tin thêm (tùy chọn)
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0123 456 789"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Tạo quán ăn
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurantForm;
