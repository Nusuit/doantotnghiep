"use client";

import React, { useState } from "react";
import MapBox, { MapProvider, useMap, MapMarker } from "../../components/Map";

// Simple Map Test Component
const MapTestContent: React.FC = () => {
  const { addMarker, clearMarkers, markers } = useMap();
  const [clickedLocation, setClickedLocation] = useState<string>("");

  // Sample restaurants in Ho Chi Minh City
  const sampleRestaurants: MapMarker[] = [
    {
      id: "restaurant-1",
      longitude: 106.6297,
      latitude: 10.8231,
      title: "🍜 Phở Hòa Pasteur",
      description: "Phở bò truyền thống nổi tiếng",
      color: "#ef4444",
    },
    {
      id: "restaurant-2",
      longitude: 106.6529,
      latitude: 10.8142,
      title: "🍛 Cơm Tấm Sài Gòn",
      description: "Cơm tấm sườn nướng đặc sản",
      color: "#3b82f6",
    },
    {
      id: "restaurant-3",
      longitude: 106.6025,
      latitude: 10.8498,
      title: "🍲 Bún Bò Huế Đông Ba",
      description: "Bún bò Huế chính gốc",
      color: "#10b981",
    },
    {
      id: "restaurant-4",
      longitude: 106.685,
      latitude: 10.7769,
      title: "🥖 Bánh Mì Hòa Mã",
      description: "Bánh mì thịt nướng crispy",
      color: "#f59e0b",
    },
  ];

  const handleAddSampleRestaurants = () => {
    sampleRestaurants.forEach((restaurant) => addMarker(restaurant));
  };

  const handleMapClick = (event: any) => {
    if (event?.lngLat) {
      const { lng, lat } = event.lngLat;
      setClickedLocation(`Clicked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

      // Add marker at clicked location
      const newMarker: MapMarker = {
        id: `clicked-${Date.now()}`,
        longitude: lng,
        latitude: lat,
        title: "📍 Vị trí được chọn",
        description: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        color: "#8b5cf6",
      };
      addMarker(newMarker);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🗺️ MapBox Integration Test
          </h1>
          <p className="text-gray-600 mb-4">
            Test các chức năng cơ bản của MapBox trong ứng dụng
          </p>

          {/* Control Panel */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleAddSampleRestaurants}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              📍 Thêm Nhà Hàng Mẫu
            </button>
            <button
              onClick={clearMarkers}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              🗑️ Xóa Tất Cả
            </button>
          </div>

          {/* Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-gray-700 mb-1">📊 Thống kê</h3>
              <p className="text-sm text-gray-600">
                Số markers hiện tại:{" "}
                <span className="font-bold text-blue-600">
                  {markers.length}
                </span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-gray-700 mb-1">🎯 Tương tác</h3>
              <p className="text-sm text-gray-600">
                {clickedLocation || "Click vào map để thêm marker"}
              </p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              🗺️ Interactive Map
            </h2>
            <p className="text-sm text-gray-600">
              • Click vào map để thêm marker tại vị trí đó • Sử dụng controls
              bên phải để zoom/pan • Click vào markers để xem thông tin
            </p>
          </div>

          <MapBox
            height="600px"
            className="rounded-lg border border-gray-200"
            initialViewState={{
              longitude: 106.6297, // Ho Chi Minh City center
              latitude: 10.8231,
              zoom: 12,
            }}
            onClick={handleMapClick}
            showControls={true}
            showMapControls={true}
          />
        </div>

        {/* Markers List */}
        {markers.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📍 Danh sách Markers ({markers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-3 h-3 rounded-full mt-1"
                      style={{ backgroundColor: marker.color || "#3b82f6" }}
                    ></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {marker.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {marker.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {marker.latitude.toFixed(4)},{" "}
                        {marker.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MapTestPage: React.FC = () => {
  return (
    <MapProvider
      initialViewState={{
        longitude: 106.6297,
        latitude: 10.8231,
        zoom: 12,
      }}
    >
      <MapTestContent />
    </MapProvider>
  );
};

export default MapTestPage;
