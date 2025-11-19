"use client";

import React, { useEffect } from "react";
import { useMap } from "../../context/MapContext";
import { MapPin, Building2, Coffee, ShoppingBag, Utensils } from "lucide-react";
import type { Map as MapboxMap } from "mapbox-gl";

export type LayerMode = "all" | "restaurants-only" | "clean";

interface MapLayerControlProps {
  currentMode: LayerMode;
  onModeChange: (mode: LayerMode) => void;
  restaurantCount?: number;
}

const MapLayerControl: React.FC<MapLayerControlProps> = ({
  currentMode,
  onModeChange,
  restaurantCount = 0,
}) => {
  const { map, isMapLoaded } = useMap();

  // Apply layer changes when mode changes or map loads
  useEffect(() => {
    if (!map || !isMapLoaded) {
      console.log("Map not ready yet for layer control");
      return;
    }

    // Get the underlying MapboxGL map instance
    const mapboxMap = map.getMap();
    if (!mapboxMap.isStyleLoaded()) {
      console.log("Map style not loaded yet");
      return;
    }

    console.log("Applying layer mode:", currentMode);
    applyLayerMode(mapboxMap, currentMode);
  }, [currentMode, map, isMapLoaded]);

  // Apply the layer mode to the map
  const applyLayerMode = (map: MapboxMap, mode: LayerMode) => {
    try {
      // Wait a bit for map to be fully ready
      setTimeout(() => {
        console.log("🎯 Applying layer mode:", mode);

        // Get all POI-related layers
        const allLayers = map.getStyle().layers;
        const poiLayers =
          allLayers?.filter(
            (layer) =>
              layer.id.includes("poi") ||
              layer.id.includes("place") ||
              layer.id.includes("transit") ||
              layer.id.includes("airport") ||
              layer.id.includes("school") ||
              layer.id.includes("hospital") ||
              layer.id.includes("hotel")
          ) || [];

        console.log(
          "Found POI layers:",
          poiLayers.map((l) => l.id)
        );

        switch (mode) {
          case "all":
            // Show all POI layers
            poiLayers.forEach((layer) => {
              try {
                map.setLayoutProperty(layer.id, "visibility", "visible");
                if (map.getFilter(layer.id)) {
                  map.setFilter(layer.id, null);
                }
              } catch (e) {
                // Ignore layers that don't support these properties
              }
            });
            console.log("✅ Applied: Showing all POIs");
            break;

          case "restaurants-only":
            // Hide most POI layers, show only food-related ones
            poiLayers.forEach((layer) => {
              try {
                if (
                  layer.id.includes("poi") &&
                  (layer.id.includes("food") ||
                    layer.id.includes("restaurant") ||
                    layer.id.includes("cafe") ||
                    layer.id.includes("bar"))
                ) {
                  map.setLayoutProperty(layer.id, "visibility", "visible");
                } else {
                  map.setLayoutProperty(layer.id, "visibility", "none");
                }
              } catch (e) {
                // Ignore layers that don't support visibility
              }
            });

            // Also filter poi-label specifically for food establishments
            if (map.getLayer("poi-label")) {
              const restaurantFilter = [
                "any",
                ["==", ["get", "class"], "food_and_drink"],
                ["==", ["get", "subclass"], "restaurant"],
                ["==", ["get", "subclass"], "fast_food"],
                ["==", ["get", "subclass"], "cafe"],
                ["==", ["get", "subclass"], "bar"],
                ["==", ["get", "subclass"], "pub"],
              ];
              map.setFilter("poi-label", restaurantFilter);
              map.setLayoutProperty("poi-label", "visibility", "visible");
            }
            console.log("✅ Applied: Filtering to food & drink POIs only");
            break;

          case "clean":
            // Hide ALL POI labels for minimal view
            poiLayers.forEach((layer) => {
              try {
                map.setLayoutProperty(layer.id, "visibility", "none");
              } catch (e) {
                // Ignore layers that don't support visibility
              }
            });
            console.log("✅ Applied: Hiding all POIs for clean view");
            break;
        }
      }, 200);
    } catch (error) {
      console.warn("❌ Failed to apply layer mode:", error);
    }
  };

  // Helper to set layer visibility safely
  const setLayerVisibility = (
    map: MapboxMap,
    layerId: string,
    visibility: "visible" | "none"
  ) => {
    try {
      // Try common POI layer names
      const layerNames = ["poi-label", "poi", "place-label", "place"];
      let applied = false;

      for (const name of layerNames) {
        if (map.getLayer(name)) {
          map.setLayoutProperty(name, "visibility", visibility);
          console.log(`✅ Set ${name} visibility to ${visibility}`);
          applied = true;
        }
      }

      if (!applied) {
        console.log(
          "⚠️ No POI layers found. Available layers:",
          map
            .getStyle()
            .layers?.map((l) => l.id)
            .filter(
              (id) =>
                id.includes("poi") ||
                id.includes("place") ||
                id.includes("label")
            )
        );
      }
    } catch (error) {
      console.warn(`❌ Failed to set visibility for layer ${layerId}:`, error);
    }
  };

  // Handle mode change
  const handleModeChange = (mode: LayerMode) => {
    console.log("🎯 [MapLayerControl] User clicked mode:", mode);
    console.log("🎯 [MapLayerControl] Previous mode:", currentMode);
    onModeChange(mode);
    console.log("🎯 [MapLayerControl] onModeChange called successfully");
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Hiển thị bản đồ
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Utensils className="w-3 h-3" />
          <span className="transition-all duration-300">
            {restaurantCount} quán
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {/* All POIs Mode */}
        <button
          onClick={() => handleModeChange("all")}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              currentMode === "all"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 border border-transparent"
            }
          `}
        >
          <Building2 className="w-4 h-4" />
          <div className="flex-1 text-left">
            <div className="font-medium">Tất cả địa điểm</div>
            <div className="text-xs opacity-70">
              Hiện tất cả POI trên bản đồ
            </div>
          </div>
        </button>

        {/* Restaurants Only Mode */}
        <button
          onClick={() => handleModeChange("restaurants-only")}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              currentMode === "restaurants-only"
                ? "bg-orange-50 text-orange-700 border border-orange-200"
                : "text-gray-600 hover:bg-gray-50 border border-transparent"
            }
          `}
        >
          <Utensils className="w-4 h-4" />
          <div className="flex-1 text-left">
            <div className="font-medium">🍴 Chỉ quán ăn</div>
            <div className="text-xs opacity-70">
              Chỉ hiện {restaurantCount} quán ăn + cafe
            </div>
          </div>
        </button>

        {/* Clean Mode */}
        <button
          onClick={() => handleModeChange("clean")}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              currentMode === "clean"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "text-gray-600 hover:bg-gray-50 border border-transparent"
            }
          `}
        >
          <ShoppingBag className="w-4 h-4" />
          <div className="flex-1 text-left">
            <div className="font-medium">🗺️ Bản đồ sạch</div>
            <div className="text-xs opacity-70">Chỉ markers tự thêm</div>
          </div>
        </button>
      </div>

      {/* Current Mode Info */}
      <div className="mt-3 p-3 bg-gray-50/80 rounded-lg border">
        <div className="text-xs text-gray-600">
          {currentMode === "all" &&
            `🌍 Hiển thị tất cả: ${restaurantCount} quán ăn + demo markers + POI`}
          {currentMode === "restaurants-only" &&
            `🍴 Chỉ quán ăn: ${restaurantCount} quán ăn Việt Nam được lọc`}
          {currentMode === "clean" &&
            "🗺️ Bản đồ sạch: Chỉ markers tự tạo, ẩn tất cả POI"}
        </div>
      </div>
    </div>
  );
};

export default MapLayerControl;
