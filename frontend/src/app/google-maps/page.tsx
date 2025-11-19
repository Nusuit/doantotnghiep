"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Menu,
  X,
  MapPin,
  Navigation,
  TrendingUp,
  Zap,
  Award,
  Target,
  Layers,
  Settings,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import { restaurantService, Restaurant } from "@/services/restaurantService";

// Dynamic imports to avoid SSR issues
const MapContainer = dynamic(() => import("@/components/Map/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

const MapProvider = dynamic(
  () =>
    import("@/context/MapContext").then((mod) => ({
      default: mod.MapProvider,
    })),
  {
    ssr: false,
  }
);

const EnhancedSearchPanel = dynamic(
  () => import("@/components/Map/EnhancedSearchPanel"),
  {
    ssr: false,
  }
);

const AIGapAnalysis = dynamic(() => import("@/components/Map/AIGapAnalysis"), {
  ssr: false,
});

const GamificationPanel = dynamic(
  () => import("@/components/Map/GamificationPanel"),
  {
    ssr: false,
  }
);

const MapModeToggle = dynamic(() => import("@/components/Map/MapModeToggle"), {
  ssr: false,
});

interface SearchFilters {
  category: string;
  priceRange: string;
  rating: number;
  distance: number;
  rewardZone: string;
  openNow: boolean;
}

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

const TriThucViGiacMap: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "search" | "analytics" | "gamification"
  >("search");
  const [userLocation, setUserLocation] = useState<
    [number, number] | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    priceRange: "all",
    rating: 0,
    distance: 5000,
    rewardZone: "all",
    openNow: false,
  });

  // Map mode and restaurant data
  const [mapMode, setMapMode] = useState<"all" | "restaurants">("all");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => {
          console.log("Location access denied:", error);
          // Default to Ho Chi Minh City center
          setUserLocation([106.6297, 10.8231]);
        }
      );
    } else {
      // Default location if geolocation is not supported
      setUserLocation([106.6297, 10.8231]);
    }
  }, []);

  // Load restaurants when component mounts or when map mode changes
  useEffect(() => {
    const loadRestaurants = async () => {
      if (mapMode === "restaurants") {
        setLoadingRestaurants(true);
        try {
          const response = await restaurantService.getRestaurants({
            isActive: true,
            limit: 100,
          });
          if (response.success && response.data?.restaurants) {
            setRestaurants(response.data.restaurants);
          } else {
            console.error("Failed to load restaurants:", response.error);
            setRestaurants([]);
          }
        } catch (error) {
          console.error("Error loading restaurants:", error);
          setRestaurants([]);
        } finally {
          setLoadingRestaurants(false);
        }
      }
    };

    loadRestaurants();
  }, [mapMode]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Searching for:", query);
    // Implement search logic here
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setUserLocation(newLocation);
          console.log("Location updated:", newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    console.log("Filters updated:", newFilters);
    // Implement filter logic here
  };

  const handleGapAreaClick = (area: GapArea) => {
    console.log("Gap area clicked:", area);
    // Navigate to gap area on map
  };

  const handleQuestAccept = (questId: string) => {
    console.log("Quest accepted:", questId);
    // Implement quest acceptance logic
  };

  const handleMapModeChange = (mode: "all" | "restaurants") => {
    setMapMode(mode);
    console.log("Map mode changed to:", mode);
  };

  const panelIcons = {
    search: <Target className="w-5 h-5" />,
    analytics: <TrendingUp className="w-5 h-5" />,
    gamification: <Award className="w-5 h-5" />,
  };

  const panelLabels = {
    search: "Tìm kiếm",
    analytics: "Phân tích AI",
    gamification: "Gamification",
  };

  return (
    <MapProvider
      initialViewState={{
        longitude: userLocation?.[0] || 106.6297,
        latitude: userLocation?.[1] || 10.8231,
        zoom: 13,
      }}
    >
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl shadow-lg border border-white/20 text-gray-700 transition-all duration-200 transform hover:scale-105"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex h-full">
          {/* Enhanced Sidebar */}
          <div
            className={`
          fixed lg:relative left-0 top-0 h-full w-96 bg-white/80 backdrop-blur-xl shadow-2xl z-50 
          transform transition-all duration-300 ease-out border-r border-white/20
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
          flex flex-col
        `}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Tri Thức Vị Giác
                  </h1>
                  <p className="text-sm text-gray-500">Khám phá & Chia sẻ</p>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-2xl transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Panel Navigation */}
            <div className="flex items-center gap-1 p-4 bg-gray-50/50">
              {(["search", "analytics", "gamification"] as const).map(
                (panel) => (
                  <button
                    key={panel}
                    onClick={() => setActivePanel(panel)}
                    className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    activePanel === panel
                      ? "bg-white shadow-md text-blue-600 border border-blue-100"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-800"
                  }
                `}
                  >
                    {panelIcons[panel]}
                    {panelLabels[panel]}
                  </button>
                )
              )}
            </div>

            {/* Panel Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Map Mode Toggle - Always visible */}
              <MapModeToggle
                currentMode={mapMode}
                onModeChange={handleMapModeChange}
                restaurantCount={restaurants.length}
              />

              {/* Loading indicator for restaurants */}
              {loadingRestaurants && mapMode === "restaurants" && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                    <span className="text-sm text-gray-600">
                      Đang tải quán ăn...
                    </span>
                  </div>
                </div>
              )}

              {activePanel === "search" && (
                <EnhancedSearchPanel
                  onSearch={handleSearch}
                  onLocationClick={handleLocationClick}
                  onFilterChange={handleFilterChange}
                />
              )}

              {activePanel === "analytics" && (
                <AIGapAnalysis
                  onAreaClick={handleGapAreaClick}
                  userLocation={userLocation}
                />
              )}

              {activePanel === "gamification" && (
                <GamificationPanel
                  userLocation={userLocation}
                  onQuestAccept={handleQuestAccept}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Đang kết nối</span>
                </div>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                  Cài đặt
                </button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative">
            {/* Map Controls */}
            <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
              <button className="flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl shadow-lg border border-white/20 text-gray-700 transition-all duration-200 transform hover:scale-105">
                <Navigation className="w-5 h-5" />
              </button>
              <button className="flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl shadow-lg border border-white/20 text-gray-700 transition-all duration-200 transform hover:scale-105">
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats - Floating */}
            <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">
                    +150 XP hôm nay
                  </span>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">
                    Streak: 7 ngày
                  </span>
                </div>
              </div>
            </div>

            {/* Map Component */}
            {userLocation && (
              <ClientOnly
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-700 font-medium">
                        Đang tải bản đồ...
                      </p>
                    </div>
                  </div>
                }
              >
                <MapContainer className="w-full h-full rounded-none" />
              </ClientOnly>
            )}
          </div>
        </div>
      </div>
    </MapProvider>
  );
};

export default TriThucViGiacMap;
