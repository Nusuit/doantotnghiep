"use client";

import { useState } from "react";
import MapBox, {
  useMap,
  MapProvider,
  MapMarker,
  useGeolocation,
  useMapBounds,
} from "../../components/Map";

// Demo markers data
const demoMarkers: MapMarker[] = [
  {
    id: "1",
    longitude: 106.6297,
    latitude: 10.8231,
    title: "TP. Hồ Chí Minh",
    description: "Thành phố lớn nhất Việt Nam",
    color: "#ef4444",
  },
  {
    id: "2",
    longitude: 106.6529,
    latitude: 10.8142,
    title: "Quận 1",
    description: "Trung tâm thành phố",
    color: "#3b82f6",
  },
  {
    id: "3",
    longitude: 106.6025,
    latitude: 10.8498,
    title: "Quận Tân Bình",
    description: "Khu vực sân bay Tân Sơn Nhất",
    color: "#10b981",
  },
];

// Demo component with Map features
const MapDemo: React.FC = () => {
  const { addMarker, markers, flyTo } = useMap();
  const { getCurrentLocation } = useGeolocation();
  const { fitMarkersInView } = useMapBounds();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const handleAddRandomMarker = () => {
    const newMarker: MapMarker = {
      id: `marker-${Date.now()}`,
      longitude: 106.6297 + (Math.random() - 0.5) * 0.1,
      latitude: 10.8231 + (Math.random() - 0.5) * 0.1,
      title: `Marker ${markers.length + 1}`,
      description: `Được tạo lúc ${new Date().toLocaleTimeString()}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
    addMarker(newMarker);
  };

  const handleFitAllMarkers = () => {
    const allMarkers = [...demoMarkers, ...markers];
    fitMarkersInView(allMarkers);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          MapBox Controls
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleAddRandomMarker}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Thêm Marker
          </button>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
          >
            Vị trí của tôi
          </button>
          <button
            onClick={handleFitAllMarkers}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors"
          >
            Xem tất cả
          </button>
          <button
            onClick={() =>
              flyTo({ longitude: 106.6297, latitude: 10.8231, zoom: 12 })
            }
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
          >
            Về HCM
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Interactive MapBox Demo
        </h2>
        <MapBox
          height="500px"
          className="border border-gray-200 dark:border-gray-700"
          initialViewState={{
            longitude: 106.6297,
            latitude: 10.8231,
            zoom: 11,
          }}
        />
      </div>

      {/* Markers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Markers ({demoMarkers.length + markers.length})
        </h2>
        <div className="grid gap-3">
          {[...demoMarkers, ...markers].map((marker) => (
            <div
              key={marker.id}
              className={`p-3 rounded-md border cursor-pointer transition-colors ${
                selectedMarker?.id === marker.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => {
                setSelectedMarker(marker);
                flyTo({
                  longitude: marker.longitude,
                  latitude: marker.latitude,
                  zoom: 15,
                });
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: marker.color }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {marker.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {marker.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {marker.longitude.toFixed(4)}, {marker.latitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main demo page
const MapBoxDemoPage: React.FC = () => {
  // Pre-add demo markers
  const handleMapLoad = () => {
    // This will be handled by the context
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            MapBox Integration Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Showcase các tính năng của MapBox GL JS integration với NextJS. Bao
            gồm markers, popup, controls, geolocation, và responsive design.
          </p>
        </div>

        <MapProvider
          initialViewState={{
            longitude: 106.6297,
            latitude: 10.8231,
            zoom: 11,
          }}
        >
          <MapDemo />
        </MapProvider>
      </div>
    </div>
  );
};

export default MapBoxDemoPage;
