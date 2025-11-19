"use client";

import React, { useState } from "react";
import {
  Search,
  Target,
  Filter,
  Coins,
  TrendingUp,
  MapPin,
  Award,
  Zap,
  Star,
  Clock,
  DollarSign,
} from "lucide-react";
import { useIsClient } from "@/hooks/useSSR";

interface EnhancedSearchPanelProps {
  onSearch: (query: string) => void;
  onLocationClick: () => void;
  onFilterChange: (filters: SearchFilters) => void;
}

interface SearchFilters {
  category: string;
  priceRange: string;
  rating: number;
  distance: number;
  rewardZone: string;
  openNow: boolean;
}

const EnhancedSearchPanel: React.FC<EnhancedSearchPanelProps> = ({
  onSearch,
  onLocationClick,
  onFilterChange,
}) => {
  const isClient = useIsClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    priceRange: "all",
    rating: 0,
    distance: 5000,
    rewardZone: "all",
    openNow: false,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const rewardZoneColors = {
    high: "bg-gradient-to-r from-red-500 to-pink-500",
    medium: "bg-gradient-to-r from-orange-400 to-yellow-500",
    normal: "bg-gradient-to-r from-blue-400 to-indigo-500",
    all: "bg-gradient-to-r from-gray-400 to-gray-600",
  };

  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-xl mb-3"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm quán ăn, địa điểm..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* GPS Button */}
          <button
            onClick={onLocationClick}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl shadow-lg text-white transition-all duration-200 transform hover:scale-105"
          >
            <Target className="w-5 h-5" />
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center w-12 h-12 bg-white hover:bg-gray-50 rounded-2xl shadow-lg text-gray-600 border border-gray-200 transition-all duration-200 transform hover:scale-105"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <Coins className="w-4 h-4" />
            High Reward Zones
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-medium whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <TrendingUp className="w-4 h-4" />
            Trending Now
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-sm font-medium whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            <Award className="w-4 h-4" />
            Top Rated
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Bộ lọc nâng cao
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              AI-Powered Filters
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Loại hình
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              >
                <option value="all">Tất cả</option>
                <option value="restaurant">Nhà hàng</option>
                <option value="cafe">Quán cà phê</option>
                <option value="street-food">Ăn vặt</option>
                <option value="dessert">Tráng miệng</option>
              </select>
            </div>

            {/* Reward Zone Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Khu vực thưởng
              </label>
              <select
                value={filters.rewardZone}
                onChange={(e) =>
                  handleFilterChange("rewardZone", e.target.value)
                }
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              >
                <option value="all">Tất cả khu vực</option>
                <option value="high">🔥 High Reward (2x Coin)</option>
                <option value="medium">⚡ Medium Reward (1.5x)</option>
                <option value="normal">✨ Standard Zone</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Khoảng giá
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) =>
                  handleFilterChange("priceRange", e.target.value)
                }
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              >
                <option value="all">Tất cả mức giá</option>
                <option value="budget">💰 Bình dân (&lt; 100k)</option>
                <option value="mid">💵 Trung bình (100k - 300k)</option>
                <option value="high">💎 Cao cấp (&gt; 300k)</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Đánh giá tối thiểu
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange("rating", rating)}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      filters.rating >= rating
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Khoảng cách ({filters.distance}m)
              </label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={filters.distance}
                onChange={(e) =>
                  handleFilterChange("distance", parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>500m</span>
                <span>10km</span>
              </div>
            </div>

            {/* Open Now Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Trạng thái
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.openNow}
                  onChange={(e) =>
                    handleFilterChange("openNow", e.target.checked)
                  }
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">
                  Chỉ hiện đang mở cửa
                </span>
              </label>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                const resetFilters: SearchFilters = {
                  category: "all",
                  priceRange: "all",
                  rating: 0,
                  distance: 5000,
                  rewardZone: "all",
                  openNow: false,
                };
                setFilters(resetFilters);
                onFilterChange(resetFilters);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchPanel;
