"use client";

import { useState, useEffect } from "react";
import MapBox, {
  useMap,
  MapProvider,
  MapMarker,
  useGeolocation,
  useMapBounds,
} from "../../components/Map";
import MapLayerControl, {
  LayerMode,
} from "../../components/Map/MapLayerControl";
import MapSearch from "../../components/Map/MapSearch";
import MapDebugPanel from "../../components/Map/MapDebugPanel";
import AddRestaurantForm from "../../components/Map/AddRestaurantForm";
import { restaurantService } from "../../services/restaurantService";

// Simple client check
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
};

// Demo food places data
const demoMarkers: MapMarker[] = [
  {
    id: "1",
    longitude: 106.6297,
    latitude: 10.8231,
    title: "Phở Hòa Pasteur",
    description: "Phở truyền thống ngon nhất Sài Gòn",
    color: "#22c55e", // Green color
  },
  {
    id: "2",
    longitude: 106.6529,
    latitude: 10.8142,
    title: "Bánh mì Huỳnh Hoa",
    description: "Bánh mì thập cẩm nổi tiếng",
    color: "#22c55e", // Green color
  },
  {
    id: "3",
    longitude: 106.6025,
    latitude: 10.8498,
    title: "Cơm tấm Sườn Nướng",
    description: "Cơm tấm sườn nướng truyền thống",
    color: "#22c55e", // Green color
  },
];

// Main map component with restaurant features
const RestaurantMapDemo: React.FC = () => {
  const { addMarker, markers, flyTo, clearMarkers } = useMap();
  const { getCurrentLocation } = useGeolocation();
  const { fitMarkersInView } = useMapBounds();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [layerMode, setLayerMode] = useState<LayerMode>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [userRestaurants, setUserRestaurants] = useState<MapMarker[]>([]);
  const [searchResultMarker, setSearchResultMarker] =
    useState<MapMarker | null>(null);
  const isClient = useIsClient();

  // Load user restaurants on component mount
  useEffect(() => {
    if (isClient) {
      loadUserRestaurants();
    }
  }, [isClient]);

  // Add markers to map context when they change or layer mode changes
  useEffect(() => {
    if (isClient) {
      console.log("🔄 [map/page] useEffect triggered");
      console.log("🔄 [map/page] Current layer mode:", layerMode);
      console.log("🔄 [map/page] Demo markers:", demoMarkers.length);
      console.log("🔄 [map/page] User restaurants:", userRestaurants.length);

      // Clear existing markers first
      clearMarkers();
      console.log("🔄 [map/page] Cleared existing markers");

      // Get filtered markers based on current mode
      const filteredMarkers = getFilteredMarkers();
      console.log(
        "🔄 [map/page] Filtered markers for mode",
        layerMode,
        ":",
        filteredMarkers.length
      );

      // Add filtered markers
      filteredMarkers.forEach((marker) => {
        console.log(
          "🔄 [map/page] Adding filtered marker:",
          marker.title,
          "id:",
          marker.id
        );
        addMarker(marker);
      });

      console.log(
        "🔄 [map/page] Total markers in context after filtering:",
        filteredMarkers.length
      );
    }
  }, [
    userRestaurants,
    isClient,
    layerMode,
    searchResultMarker,
    addMarker,
    clearMarkers,
  ]);

  // Load user restaurants
  const loadUserRestaurants = async () => {
    try {
      console.log("Loading user restaurants...");
      const response = await restaurantService.getRestaurants();
      if (response.success && response.data?.restaurants) {
        console.log("Loaded restaurants:", response.data.restaurants.length);
        const restaurantMarkers = restaurantService.restaurantsToMapMarkers(
          response.data.restaurants
        );
        console.log("Converted to markers:", restaurantMarkers.length);
        setUserRestaurants(restaurantMarkers);
      } else {
        console.log("No restaurants found or API error:", response);
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
    }
  };

  // Get filtered markers based on layer mode
  const getFilteredMarkers = (): MapMarker[] => {
    const allMarkers = [...demoMarkers, ...userRestaurants];
    let filteredMarkers: MapMarker[] = [];

    switch (layerMode) {
      case "restaurants-only":
        // Show all restaurant markers (demo + API restaurants)
        filteredMarkers = allMarkers.filter((marker) => {
          // Include all restaurant markers from API (id starts with restaurant-)
          if (marker.id.startsWith("restaurant-")) {
            return true;
          }

          // Include demo restaurant markers based on content
          const isRestaurant =
            marker.title?.toLowerCase().includes("phở") ||
            marker.title?.toLowerCase().includes("bánh") ||
            marker.title?.toLowerCase().includes("bún") ||
            marker.title?.toLowerCase().includes("cơm") ||
            marker.title?.toLowerCase().includes("hủ tiếu") ||
            marker.title?.toLowerCase().includes("chè") ||
            marker.title?.toLowerCase().includes("gỏi") ||
            marker.title?.toLowerCase().includes("quán") ||
            marker.description?.toLowerCase().includes("quán") ||
            marker.description?.toLowerCase().includes("phở") ||
            marker.description?.toLowerCase().includes("bánh") ||
            marker.description?.toLowerCase().includes("food");
          return isRestaurant;
        });
        break;

      case "clean":
        // Only show user-added custom markers (no restaurants, no demo markers)
        filteredMarkers = allMarkers.filter(
          (marker) =>
            !marker.id.startsWith("restaurant-") &&
            !marker.id.startsWith("demo-") &&
            marker.id.startsWith("marker-")
        );
        break;

      case "all":
      default:
        // Show all markers
        filteredMarkers = allMarkers;
        break;
    }

    // Always show search result marker regardless of layer mode
    if (searchResultMarker) {
      // Remove any existing search result marker from the list first to avoid duplicates
      filteredMarkers = filteredMarkers.filter(
        (m) => m.id !== searchResultMarker.id
      );
      filteredMarkers.push(searchResultMarker);
    }

    return filteredMarkers;
  };

  const handleAddRandomMarker = () => {
    const newMarker: MapMarker = {
      id: `marker-${Date.now()}`,
      longitude: 106.6297 + (Math.random() - 0.5) * 0.1,
      latitude: 10.8231 + (Math.random() - 0.5) * 0.1,
      title: `Quán ăn ${markers.length + 1}`,
      description: `Được tạo lúc ${new Date().toLocaleTimeString()}`,
      color: "#22c55e", // Green color for consistency
    };
    addMarker(newMarker);
  };

  const handleFitAllMarkers = () => {
    const allMarkers = getFilteredMarkers();
    fitMarkersInView(allMarkers);
  };

  const handleAddRestaurant = () => {
    setShowAddForm(true);
  };

  const handleRestaurantAdded = async () => {
    setShowAddForm(false);
    await loadUserRestaurants(); // Reload restaurants
    handleFitAllMarkers(); // Fit new view
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  const filteredMarkers = getFilteredMarkers();

  return (
    <div className="relative h-screen w-full">
      {/* Google Maps style layout */}

      {/* Top Search Bar */}
      <div className="absolute top-4 left-4 right-20 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <MapSearch
            onResultSelect={(result) => {
              console.log("Selected search result:", result);

              // Create a highlighted search result marker with green color
              const searchMarker: MapMarker = {
                id: `search-${result.id}`,
                longitude: result.coordinates[0],
                latitude: result.coordinates[1],
                title: `🎯 ${result.name}`,
                description: `📍 ${result.address} (Kết quả tìm kiếm)`,
                color: "#22c55e", // Green color for consistency
              };
              setSearchResultMarker(searchMarker);

              // Fly to the selected location
              flyTo({
                longitude: result.coordinates[0],
                latitude: result.coordinates[1],
                zoom: 16,
              });
              console.log(
                `✈️ Flying to: ${result.name} at [${result.coordinates[0]}, ${result.coordinates[1]}]`
              );
              console.log(
                "🎯 Added search result marker for visibility in all modes"
              );
            }}
            placeholder="Tìm kiếm nhà hàng, quán ăn..."
          />
        </div>

        {/* Search result status - compact */}
        {searchResultMarker && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-600">📍</span>
                <span className="text-green-800 font-medium text-sm">
                  {searchResultMarker.title?.replace("🎯 ", "") || ""}
                </span>
              </div>
              <button
                onClick={() => setSearchResultMarker(null)}
                className="text-green-600 hover:text-green-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Action Panel */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Main Action Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all group"
          title="Menu chức năng"
        >
          <svg
            className="w-6 h-6 text-gray-700 group-hover:text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        {/* Layer Control Button */}
        <button
          onClick={() => {
            const modes: LayerMode[] = ["all", "restaurants-only", "clean"];
            const currentIndex = modes.indexOf(layerMode);
            const nextIndex = (currentIndex + 1) % modes.length;
            setLayerMode(modes[nextIndex]);
          }}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all group"
          title={`Chế độ: ${
            layerMode === "all"
              ? "Tất cả"
              : layerMode === "restaurants-only"
              ? "Quán ăn"
              : "Sạch"
          }`}
        >
          <svg
            className="w-6 h-6 text-gray-700 group-hover:text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Location Button */}
        <button
          onClick={getCurrentLocation}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all group"
          title="Vị trí của tôi"
        >
          <svg
            className="w-6 h-6 text-gray-700 group-hover:text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Fit All Markers Button */}
        <button
          onClick={handleFitAllMarkers}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all group"
          title="Xem tất cả"
        >
          <svg
            className="w-6 h-6 text-gray-700 group-hover:text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>

      {/* Expandable Action Panel */}
      {showAddForm && (
        <div className="absolute top-20 right-4 z-10 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Chức năng</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                handleAddRestaurant();
                setShowAddForm(false);
              }}
              className="w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-left"
            >
              <div className="font-medium">Thêm Nhà Hàng</div>
              <div className="text-sm text-green-600">Đánh dấu quán ăn mới</div>
            </button>

            <button
              onClick={() => {
                handleAddRandomMarker();
                setShowAddForm(false);
              }}
              className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-left"
            >
              <div className="font-medium">Thêm Marker</div>
              <div className="text-sm text-blue-600">
                Đánh dấu vị trí ngẫu nhiên
              </div>
            </button>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600 mb-2">Chế độ hiển thị</div>
              <div className="space-y-2">
                {[
                  {
                    mode: "all" as LayerMode,
                    label: "Tất cả",
                    desc: "Hiển thị tất cả marker",
                  },
                  {
                    mode: "restaurants-only" as LayerMode,
                    label: "Quán ăn",
                    desc: "Chỉ hiển thị nhà hàng",
                  },
                  {
                    mode: "clean" as LayerMode,
                    label: "Sạch",
                    desc: "Chỉ marker tùy chỉnh",
                  },
                ].map(({ mode, label, desc }) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setLayerMode(mode);
                      setShowAddForm(false);
                    }}
                    className={`w-full p-2 rounded text-left text-sm transition-colors ${
                      layerMode === mode
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-xs opacity-75">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Map */}
      <div className="w-full h-full">
        <MapBox
          height="100vh"
          className="w-full h-full"
          initialViewState={{
            longitude: 106.6297,
            latitude: 10.8231,
            zoom: 11,
          }}
        />
      </div>

      {/* Add Restaurant Modal */}
      {showAddForm && (
        <AddRestaurantForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleRestaurantAdded}
        />
      )}
    </div>
  );
};

// Main map page
export default function MapPage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <MapProvider
        initialViewState={{
          longitude: 106.6297,
          latitude: 10.8231,
          zoom: 11,
        }}
      >
        <RestaurantMapDemo />
      </MapProvider>
    </div>
  );
}
