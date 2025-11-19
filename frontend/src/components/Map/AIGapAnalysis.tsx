"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  MapPin,
  Target,
  Zap,
  Award,
  AlertTriangle,
  Users,
  Eye,
  Compass,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react";
import { useIsClient } from "@/hooks/useSSR";

interface GapArea {
  id: string;
  name: string;
  coordinates: [number, number];
  population: number;
  reviewDensity: number;
  potentialScore: number;
  nearbyPlaces: number;
  lastActivity: string;
  category: "high" | "medium" | "low";
  reasons: string[];
}

interface AIGapAnalysisProps {
  onAreaClick: (area: GapArea) => void;
  userLocation?: [number, number];
}

const AIGapAnalysis: React.FC<AIGapAnalysisProps> = ({
  onAreaClick,
  userLocation,
}) => {
  const isClient = useIsClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gapAreas, setGapAreas] = useState<GapArea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  // Mock data for demo - in production, this would come from AI analysis
  const mockGapAreas: GapArea[] = [
    {
      id: "1",
      name: "Khu vực Bình Thạnh - Vinhomes Grand Park",
      coordinates: [106.7634, 10.8411],
      population: 85000,
      reviewDensity: 2.3,
      potentialScore: 92,
      nearbyPlaces: 156,
      lastActivity: "3 ngày trước",
      category: "high",
      reasons: [
        "Dân số đông nhưng ít review",
        "Nhiều khu chung cư mới",
        "Gần trường đại học",
        "Thiếu thông tin ẩm thực",
      ],
    },
    {
      id: "2",
      name: "Khu Landmark 81 - Quận 1",
      coordinates: [106.7017, 10.7967],
      population: 45000,
      reviewDensity: 5.8,
      potentialScore: 78,
      nearbyPlaces: 234,
      lastActivity: "1 ngày trước",
      category: "medium",
      reasons: [
        "Khu vực du lịch cao cấp",
        "Review chủ yếu từ khách nước ngoài",
        "Thiếu đánh giá từ người địa phương",
        "Tiềm năng khám phá món mới",
      ],
    },
    {
      id: "3",
      name: "Khu Thủ Thiêm - Quận 2",
      coordinates: [106.7314, 10.7881],
      population: 62000,
      reviewDensity: 3.1,
      potentialScore: 85,
      nearbyPlaces: 189,
      lastActivity: "5 ngày trước",
      category: "high",
      reasons: [
        "Khu đô thị mới phát triển",
        "Nhiều dân văn phòng trẻ",
        "Thiếu mapping chi tiết",
        "Cơ hội khám phá món fusion",
      ],
    },
    {
      id: "4",
      name: "Khu Gò Vấp - Emart",
      coordinates: [106.6881, 10.8142],
      population: 38000,
      reviewDensity: 4.2,
      potentialScore: 65,
      nearbyPlaces: 98,
      lastActivity: "2 ngày trước",
      category: "low",
      reasons: [
        "Khu vực sinh viên",
        "Nhiều quán ăn vỉa hè",
        "Review thiếu hình ảnh",
        "Cần cập nhật giờ mở cửa",
      ],
    },
  ];

  useEffect(() => {
    setGapAreas(mockGapAreas);
  }, []);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGapAreas(mockGapAreas);
    setIsAnalyzing(false);
  };

  const filteredAreas =
    selectedCategory === "all"
      ? gapAreas
      : gapAreas.filter((area) => area.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "high":
        return "from-red-500 to-pink-500";
      case "medium":
        return "from-orange-400 to-yellow-500";
      case "low":
        return "from-blue-400 to-indigo-500";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <Target className="w-4 h-4" />;
      case "low":
        return <Eye className="w-4 h-4" />;
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "high":
        return "Ưu tiên cao";
      case "medium":
        return "Ưu tiên trung bình";
      case "low":
        return "Cần khảo sát";
      default:
        return "Tất cả";
    }
  };

  if (!isClient) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Gap Analysis</h2>
            <p className="text-sm text-gray-600">
              Phân tích khu vực thiếu thông tin
            </p>
          </div>
        </div>

        <button
          onClick={runAIAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isAnalyzing
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
          }`}
        >
          <Zap className="w-4 h-4" />
          {isAnalyzing ? "Đang phân tích..." : "Chạy phân tích"}
        </button>
      </div>

      {/* Analysis Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Ưu tiên cao</p>
              <p className="text-2xl font-bold">
                {gapAreas.filter((area) => area.category === "high").length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Trung bình</p>
              <p className="text-2xl font-bold">
                {gapAreas.filter((area) => area.category === "medium").length}
              </p>
            </div>
            <Target className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Khảo sát</p>
              <p className="text-2xl font-bold">
                {gapAreas.filter((area) => area.category === "low").length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tiềm năng</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  gapAreas.reduce((sum, area) => sum + area.potentialScore, 0) /
                    gapAreas.length
                )}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-200" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {["all", "high", "medium", "low"].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category
                ? `bg-gradient-to-r ${getCategoryColor(
                    category
                  )} text-white shadow-md`
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {getCategoryIcon(category)}
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Gap Areas List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAreas.map((area) => (
          <div
            key={area.id}
            onClick={() => onAreaClick(area)}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`flex items-center justify-center w-6 h-6 bg-gradient-to-r ${getCategoryColor(
                      area.category
                    )} rounded-lg`}
                  >
                    {getCategoryIcon(area.category)}
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                    {area.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {area.population.toLocaleString()} dân
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4" />
                    {area.reviewDensity} review/km²
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    {area.potentialScore}% tiềm năng
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {area.lastActivity}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {area.reasons.slice(0, 2).map((reason, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                    >
                      {reason}
                    </span>
                  ))}
                  {area.reasons.length > 2 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg">
                      +{area.reasons.length - 2} lý do khác
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {area.nearbyPlaces} địa điểm
                  </div>
                  <div className="text-xs text-gray-500">gần khu vực</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAreas.length === 0 && (
        <div className="text-center py-8">
          <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Không có khu vực nào trong danh mục này
          </p>
        </div>
      )}
    </div>
  );
};

export default AIGapAnalysis;
