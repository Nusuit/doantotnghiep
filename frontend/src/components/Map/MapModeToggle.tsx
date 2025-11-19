"use client";

import React, { useState } from "react";
import { MapPin, Users, Zap, Plus } from "lucide-react";

export type MapMode = "all" | "restaurants";

interface MapModeToggleProps {
  currentMode: MapMode;
  onModeChange: (mode: MapMode) => void;
  onAddRestaurant?: () => void;
  restaurantCount?: number;
}

const MapModeToggle: React.FC<MapModeToggleProps> = ({
  currentMode,
  onModeChange,
  onAddRestaurant,
  restaurantCount = 0,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Chế độ bản đồ
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Zap className="w-3 h-3" />
          <span>{restaurantCount} quán</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/50 rounded-xl">
        {/* All Places Mode */}
        <button
          onClick={() => onModeChange("all")}
          className={`
            flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              currentMode === "all"
                ? "bg-white shadow-md text-blue-600 border border-blue-100"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center justify-center w-5 h-5">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <span>Tất cả</span>
        </button>

        {/* Restaurant Only Mode */}
        <button
          onClick={() => onModeChange("restaurants")}
          className={`
            flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              currentMode === "restaurants"
                ? "bg-white shadow-md text-orange-600 border border-orange-100"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center justify-center w-5 h-5">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          </div>
          <span>Quán ăn</span>
        </button>
      </div>

      {/* Mode Description */}
      <div className="mt-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
        {currentMode === "all" ? (
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                Hiển thị tất cả địa điểm
              </p>
              <p className="text-xs text-gray-500">
                Bao gồm quán ăn mẫu và địa điểm do người dùng thêm
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                Chỉ quán ăn người dùng
              </p>
              <p className="text-xs text-gray-500">
                Chỉ hiển thị các quán ăn được thêm bởi cộng đồng
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {currentMode === "restaurants" && restaurantCount > 0 && (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">Gần đây nhất</span>
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Đang cập nhật</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapModeToggle;
