// MapBox Usage Examples
// Các patterns và use cases phổ biến

import React, { useEffect, useState } from "react";
import MapBox, {
  MapProvider,
  useMap,
  MapMarker,
  useGeolocation,
  useMapBounds,
  MAP_STYLES,
} from "@/components/Map";

// ===== EXAMPLE 1: Basic Map =====
export const BasicMapExample = () => {
  return (
    <MapBox
      height="400px"
      className="rounded-lg shadow-lg"
      initialViewState={{
        longitude: 106.6297,
        latitude: 10.8231,
        zoom: 11,
      }}
    />
  );
};

// ===== EXAMPLE 2: Map với Custom Markers =====
export const MarkersExample = () => {
  const restaurants: MapMarker[] = [
    {
      id: "restaurant-1",
      longitude: 106.6297,
      latitude: 10.8231,
      title: "Nhà hàng ABC",
      description: "Món Việt truyền thống",
      color: "#ef4444",
    },
    {
      id: "restaurant-2",
      longitude: 106.6529,
      latitude: 10.8142,
      title: "Quán cơm XYZ",
      description: "Cơm văn phòng ngon rẻ",
      color: "#3b82f6",
    },
  ];

  const RestaurantMap = () => {
    const { addMarker } = useMap();

    useEffect(() => {
      restaurants.forEach((restaurant) => addMarker(restaurant));
    }, [addMarker]);

    return <MapBox height="500px" />;
  };

  return (
    <MapProvider>
      <RestaurantMap />
    </MapProvider>
  );
};

// ===== EXAMPLE 3: Interactive Controls =====
export const InteractiveMapExample = () => {
  const MapWithControls = () => {
    const { addMarker, clearMarkers, flyTo } = useMap();
    const { getCurrentLocation } = useGeolocation();
    const { fitMarkersInView } = useMapBounds();

    const handleAddRandomMarker = () => {
      const marker: MapMarker = {
        id: `marker-${Date.now()}`,
        longitude: 106.6297 + (Math.random() - 0.5) * 0.1,
        latitude: 10.8231 + (Math.random() - 0.5) * 0.1,
        title: `Điểm ${Date.now()}`,
        description: "Marker được tạo ngẫu nhiên",
      };
      addMarker(marker);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={handleAddRandomMarker}>Thêm Marker</button>
          <button onClick={getCurrentLocation}>Vị trí của tôi</button>
          <button onClick={clearMarkers}>Xóa tất cả</button>
          <button onClick={() => fitMarkersInView([])}>Fit view</button>
        </div>
        <MapBox height="500px" />
      </div>
    );
  };

  return (
    <MapProvider>
      <MapWithControls />
    </MapProvider>
  );
};

// ===== EXAMPLE 4: Real-time Data =====
export const RealTimeMapExample = () => {
  const [vehicles, setVehicles] = useState<MapMarker[]>([]);

  const VehicleTracker = () => {
    const { addMarker, removeMarker } = useMap();

    useEffect(() => {
      // Simulate real-time vehicle updates
      const interval = setInterval(() => {
        const vehicleId = "vehicle-1";
        const newPosition: MapMarker = {
          id: vehicleId,
          longitude: 106.6297 + Math.sin(Date.now() / 10000) * 0.01,
          latitude: 10.8231 + Math.cos(Date.now() / 10000) * 0.01,
          title: "Xe buýt 01",
          description: `Cập nhật lúc ${new Date().toLocaleTimeString()}`,
          color: "#10b981",
        };

        removeMarker(vehicleId);
        addMarker(newPosition);
      }, 2000);

      return () => clearInterval(interval);
    }, [addMarker, removeMarker]);

    return <MapBox height="500px" />;
  };

  return (
    <MapProvider>
      <VehicleTracker />
    </MapProvider>
  );
};

// ===== EXAMPLE 5: Custom Popup Content =====
export const CustomPopupExample = () => {
  const CustomPopupMap = () => {
    const { showPopup, addMarker } = useMap();

    const handleMapClick = (event: any) => {
      const { lng, lat } = event.lngLat;

      showPopup({
        longitude: lng,
        latitude: lat,
        content: (
          <div className="p-4 max-w-sm">
            <h3 className="font-bold text-lg">Thông tin địa điểm</h3>
            <p className="text-gray-600 mt-2">
              Tọa độ: {lng.toFixed(4)}, {lat.toFixed(4)}
            </p>
            <div className="mt-3 space-y-2">
              <button
                onClick={() =>
                  addMarker({
                    id: `marker-${Date.now()}`,
                    longitude: lng,
                    latitude: lat,
                    title: "Marker mới",
                    description: "Được tạo từ popup",
                  })
                }
                className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Thêm Marker
              </button>
            </div>
          </div>
        ),
      });
    };

    return <MapBox height="500px" onClick={handleMapClick} />;
  };

  return (
    <MapProvider>
      <CustomPopupMap />
    </MapProvider>
  );
};

// ===== EXAMPLE 6: Multiple Map Styles =====
export const StyleSwitcherExample = () => {
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES.STREETS);

  const StyleSwitcher = () => {
    const { setMapStyle } = useMap();

    const styles = [
      { name: "Streets", value: MAP_STYLES.STREETS },
      { name: "Light", value: MAP_STYLES.LIGHT },
      { name: "Dark", value: MAP_STYLES.DARK },
      { name: "Satellite", value: MAP_STYLES.SATELLITE },
      { name: "Outdoors", value: MAP_STYLES.OUTDOORS },
    ];

    const handleStyleChange = (style: string) => {
      setCurrentStyle(style);
      setMapStyle(style);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {styles.map((style) => (
            <button
              key={style.value}
              onClick={() => handleStyleChange(style.value)}
              className={`px-3 py-1 rounded text-sm ${
                currentStyle === style.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {style.name}
            </button>
          ))}
        </div>
        <MapBox height="500px" />
      </div>
    );
  };

  return (
    <MapProvider initialMapStyle={currentStyle}>
      <StyleSwitcher />
    </MapProvider>
  );
};

// ===== EXAMPLE 7: Responsive Map =====
export const ResponsiveMapExample = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Map thông tin</h2>
        <div className="h-64 lg:h-96">
          <MapBox height="100%" className="rounded-lg border" />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Danh sách địa điểm</h2>
        <div className="space-y-2 h-64 lg:h-96 overflow-y-auto">
          {/* Location list items */}
        </div>
      </div>
    </div>
  );
};

// ===== EXAMPLE 8: Map với Search Integration =====
export const SearchMapExample = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapMarker[]>([]);

  const SearchableMap = () => {
    const { addMarker, clearMarkers, flyTo } = useMap();

    const handleSearch = async (query: string) => {
      // Simulate geocoding API call
      try {
        // Replace with actual MapBox Geocoding API
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${
            process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          }&limit=5`
        );
        const data = await response.json();

        const results: MapMarker[] = data.features.map(
          (feature: any, index: number) => ({
            id: `search-${index}`,
            longitude: feature.center[0],
            latitude: feature.center[1],
            title: feature.place_name,
            description: feature.properties?.address || "Search result",
          })
        );

        setSearchResults(results);
        clearMarkers();
        results.forEach((result) => addMarker(result));

        if (results.length > 0) {
          flyTo({
            longitude: results[0].longitude,
            latitude: results[0].latitude,
            zoom: 14,
          });
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            placeholder="Tìm kiếm địa điểm..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Tìm
          </button>
        </div>
        <MapBox height="500px" />
      </div>
    );
  };

  return (
    <MapProvider>
      <SearchableMap />
    </MapProvider>
  );
};
