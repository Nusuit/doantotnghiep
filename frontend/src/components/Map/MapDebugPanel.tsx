"use client";

import React, { useState } from "react";
import { useMap } from "../../context/MapContext";

const MapDebugPanel: React.FC = () => {
  const { map, isMapLoaded } = useMap();
  const [showDebug, setShowDebug] = useState(false);
  const [layerInfo, setLayerInfo] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const listAllLayers = () => {
    if (!map || !isMapLoaded) {
      setLayerInfo("Map not available");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      try {
        // Get the underlying MapboxGL map instance
        const mapboxMap = map.getMap();
        const style = mapboxMap.getStyle();
        const layers = style.layers || [];

        console.log("🔍 All map layers:", layers);

        // Group layers by type and show relevant information
        const layerGroups: { [key: string]: any[] } = {};

        layers.forEach((layer: any) => {
          const type = layer.type || "unknown";
          if (!layerGroups[type]) layerGroups[type] = [];
          layerGroups[type].push(layer);
        });

        let info = `Found ${layers.length} layers:\n\n`;

        Object.keys(layerGroups).forEach((type) => {
          info += `${type.toUpperCase()} (${
            layerGroups[type].length
          }):\n${layerGroups[type]
            .map(
              (layer: any) =>
                `  - ${layer.id}${
                  layer.layout?.visibility === "none" ? " [HIDDEN]" : ""
                }`
            )
            .join("\n")}\n\n`;
        });

        // Specifically look for POI-related layers
        const poiLayers = layers.filter(
          (layer: any) =>
            layer.id.toLowerCase().includes("poi") ||
            layer.id.toLowerCase().includes("place") ||
            layer.id.toLowerCase().includes("label") ||
            layer.id.toLowerCase().includes("symbol") ||
            layer.source === "mapbox-streets" ||
            (layer["source-layer"] &&
              (layer["source-layer"].includes("poi") ||
                layer["source-layer"].includes("place")))
        );

        info += `\n🏪 Potential POI Layers (${poiLayers.length}):\n${poiLayers
          .map(
            (layer: any) =>
              `  - ${layer.id} (${layer.type})${
                layer.layout?.visibility === "none" ? " [HIDDEN]" : ""
              }${
                layer["source-layer"]
                  ? ` [source-layer: ${layer["source-layer"]}]`
                  : ""
              }`
          )
          .join("\n")}\n`;

        setLayerInfo(info);
      } catch (error) {
        console.error("Error getting layer info:", error);
        setLayerInfo(`Error: ${error}`);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const hideAllPOIs = () => {
    if (!map || !isMapLoaded) return;

    setIsProcessing(true);
    console.log("🚫 Hiding all POI layers...");

    setTimeout(() => {
      try {
        const mapboxMap = map.getMap();
        const style = mapboxMap.getStyle();
        const layers = style.layers || [];
        let hiddenCount = 0;

        layers.forEach((layer: any) => {
          // More comprehensive POI detection
          const isPOI =
            layer.id.toLowerCase().includes("poi") ||
            layer.id.toLowerCase().includes("place") ||
            layer.id.toLowerCase().includes("landmark") ||
            layer.id.toLowerCase().includes("transit") ||
            layer.id.toLowerCase().includes("airport") ||
            layer.id.toLowerCase().includes("school") ||
            layer.id.toLowerCase().includes("hospital") ||
            layer.id.toLowerCase().includes("hotel") ||
            layer.id.toLowerCase().includes("restaurant") ||
            layer.id.toLowerCase().includes("shop") ||
            layer.id.toLowerCase().includes("store") ||
            (layer["source-layer"] &&
              (layer["source-layer"].includes("poi") ||
                layer["source-layer"].includes("place_label"))) ||
            (layer.type === "symbol" && layer.source === "mapbox-streets");

          if (isPOI) {
            try {
              mapboxMap.setLayoutProperty(layer.id, "visibility", "none");
              hiddenCount++;
              console.log(`Hidden POI layer: ${layer.id}`);
            } catch (error) {
              console.warn(`Could not hide layer ${layer.id}:`, error);
            }
          }
        });

        console.log(`✅ Hidden ${hiddenCount} POI layers`);
        setLayerInfo(
          `Hidden ${hiddenCount} POI layers - check console for details`
        );
      } catch (error) {
        console.error("Error hiding POIs:", error);
        setLayerInfo(`Error hiding POIs: ${error}`);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const showAllPOIs = () => {
    if (!map || !isMapLoaded) return;

    setIsProcessing(true);
    console.log("👁️ Showing all POI layers...");

    setTimeout(() => {
      try {
        const mapboxMap = map.getMap();
        const style = mapboxMap.getStyle();
        const layers = style.layers || [];
        let shownCount = 0;

        layers.forEach((layer: any) => {
          const isPOI =
            layer.id.toLowerCase().includes("poi") ||
            layer.id.toLowerCase().includes("place") ||
            layer.id.toLowerCase().includes("landmark") ||
            layer.id.toLowerCase().includes("transit") ||
            layer.id.toLowerCase().includes("airport") ||
            layer.id.toLowerCase().includes("school") ||
            layer.id.toLowerCase().includes("hospital") ||
            layer.id.toLowerCase().includes("hotel") ||
            layer.id.toLowerCase().includes("restaurant") ||
            layer.id.toLowerCase().includes("shop") ||
            layer.id.toLowerCase().includes("store") ||
            (layer["source-layer"] &&
              (layer["source-layer"].includes("poi") ||
                layer["source-layer"].includes("place_label"))) ||
            (layer.type === "symbol" && layer.source === "mapbox-streets");

          if (isPOI) {
            try {
              mapboxMap.setLayoutProperty(layer.id, "visibility", "visible");
              shownCount++;
              console.log(`Shown POI layer: ${layer.id}`);
            } catch (error) {
              console.warn(`Could not show layer ${layer.id}:`, error);
            }
          }
        });

        console.log(`✅ Shown ${shownCount} POI layers`);
        setLayerInfo(
          `Shown ${shownCount} POI layers - check console for details`
        );
      } catch (error) {
        console.error("Error showing POIs:", error);
        setLayerInfo(`Error showing POIs: ${error}`);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const testFilterSpecific = () => {
    if (!map || !isMapLoaded) return;

    setIsProcessing(true);
    console.log("🧪 Testing restaurant-only filtering...");

    setTimeout(() => {
      try {
        const mapboxMap = map.getMap();
        const style = mapboxMap.getStyle();
        const layers = style.layers || [];
        let processedCount = 0;

        layers.forEach((layer: any) => {
          // Hide non-restaurant POIs
          const isNonRestaurantPOI =
            (layer.id.toLowerCase().includes("poi") ||
              layer.id.toLowerCase().includes("place")) &&
            !layer.id.toLowerCase().includes("restaurant") &&
            !layer.id.toLowerCase().includes("food") &&
            !layer.id.toLowerCase().includes("cafe") &&
            !layer.id.toLowerCase().includes("bar");

          if (isNonRestaurantPOI) {
            try {
              mapboxMap.setLayoutProperty(layer.id, "visibility", "none");
              processedCount++;
              console.log(`Hidden non-restaurant POI: ${layer.id}`);
            } catch (error) {
              console.warn(`Could not hide layer ${layer.id}:`, error);
            }
          }
        });

        console.log(`✅ Processed ${processedCount} non-restaurant POI layers`);
        setLayerInfo(
          `Processed ${processedCount} non-restaurant POI layers for restaurant-only mode`
        );
      } catch (error) {
        console.error("Error in restaurant filtering:", error);
        setLayerInfo(`Error in restaurant filtering: ${error}`);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  if (!map) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
      >
        🔍 Debug Layers
      </button>

      {showDebug && (
        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-auto z-50">
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={listAllLayers}
              disabled={isProcessing}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
            >
              {isProcessing ? "Processing..." : "List All Layers"}
            </button>
            <button
              onClick={hideAllPOIs}
              disabled={isProcessing}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
            >
              {isProcessing ? "Processing..." : "Hide All POIs"}
            </button>
            <button
              onClick={showAllPOIs}
              disabled={isProcessing}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
            >
              {isProcessing ? "Processing..." : "Show All POIs"}
            </button>
            <button
              onClick={testFilterSpecific}
              disabled={isProcessing}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
            >
              {isProcessing ? "Processing..." : "Test Restaurant Filter"}
            </button>
          </div>

          {layerInfo && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">Layer Information:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48 whitespace-pre-wrap">
                {layerInfo}
              </pre>
            </div>
          )}

          <button
            onClick={() => setShowDebug(false)}
            className="mt-4 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default MapDebugPanel;
