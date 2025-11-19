"use client";

import React, { useState, useEffect } from "react";
import { Marker } from "react-map-gl/mapbox";
import { useMap, MapMarker } from "../../context/MapContext";

interface MapMarkersProps {
  markers?: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  renderCustomMarker?: (marker: MapMarker) => React.ReactNode;
}

const DefaultMarkerIcon: React.FC<{
  color?: string;
  size?: number;
  zoom?: number;
  isHighlighted?: boolean;
  isRestaurant?: boolean;
  category?: string;
}> = ({
  color = "#ef4444",
  size = 24,
  zoom = 10,
  isHighlighted = false,
  isRestaurant = false,
  category,
}) => {
  // Responsive size based on zoom level
  const getResponsiveSize = () => {
    if (zoom < 8) return Math.max(size * 0.6, 16); // Min 16px when zoomed out
    if (zoom < 10) return Math.max(size * 0.8, 20);
    if (zoom > 15) return Math.min(size * 1.3, 40); // Max 40px when zoomed in
    return size;
  };

  const actualSize = getResponsiveSize();
  const pulseClass = isHighlighted ? "animate-pulse" : "";

  // Restaurant markers use circle style with restaurant icon
  if (isRestaurant) {
    return (
      <div
        className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125 ${pulseClass}`}
        style={{
          width: actualSize,
          height: actualSize,
          filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.3))`,
        }}
      >
        {/* Circle marker background */}
        <div
          className="rounded-full border-3 border-white transition-all duration-300 hover:shadow-lg"
          style={{
            width: actualSize,
            height: actualSize,
            backgroundColor: color,
            borderWidth: "3px",
          }}
        />
        {/* Restaurant icon inside circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width={actualSize * 0.5}
            height={actualSize * 0.5}
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41-6.88-6.88 1.27-1.27z" />
          </svg>
        </div>
        {/* Category label on hover */}
        {zoom >= 12 && category && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {category}
          </div>
        )}
      </div>
    );
  }

  // Pin marker for other types (user markers, etc.)
  return (
    <div
      className={`relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125 ${pulseClass}`}
      style={{
        width: actualSize,
        height: actualSize,
        filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.3))`,
      }}
    >
      <svg
        width={actualSize}
        height={actualSize}
        viewBox="0 0 24 24"
        fill={color}
        className="transition-all duration-300"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
      <div
        className="absolute bg-white rounded-full transition-all duration-300"
        style={{
          width: actualSize * 0.25,
          height: actualSize * 0.25,
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
};

const MapMarkers: React.FC<MapMarkersProps> = ({
  markers,
  onMarkerClick,
  renderCustomMarker,
}) => {
  const { markers: contextMarkers, showPopup, viewState } = useMap();
  const [highlightedMarker, setHighlightedMarker] = useState<string | null>(
    null
  );
  const markersToRender = markers || contextMarkers;

  // Clustering function
  const clusterMarkers = (markers: MapMarker[], zoom: number) => {
    const CLUSTER_THRESHOLD = zoom < 12 ? 0.01 : zoom < 14 ? 0.005 : 0.001; // Distance threshold based on zoom
    const clusters: {
      markers: MapMarker[];
      center: { lat: number; lng: number };
    }[] = [];
    const processed: Set<string> = new Set();

    markers.forEach((marker) => {
      if (processed.has(marker.id)) return;

      const cluster = {
        markers: [marker],
        center: { lat: marker.latitude, lng: marker.longitude },
      };
      processed.add(marker.id);

      // Find nearby markers to cluster
      markers.forEach((otherMarker) => {
        if (processed.has(otherMarker.id)) return;

        const distance = Math.sqrt(
          Math.pow(marker.latitude - otherMarker.latitude, 2) +
            Math.pow(marker.longitude - otherMarker.longitude, 2)
        );

        if (distance < CLUSTER_THRESHOLD) {
          cluster.markers.push(otherMarker);
          processed.add(otherMarker.id);

          // Update cluster center (average position)
          const totalLat = cluster.markers.reduce(
            (sum, m) => sum + m.latitude,
            0
          );
          const totalLng = cluster.markers.reduce(
            (sum, m) => sum + m.longitude,
            0
          );
          cluster.center.lat = totalLat / cluster.markers.length;
          cluster.center.lng = totalLng / cluster.markers.length;
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  };

  // Cluster marker component
  const ClusterMarker = ({
    count,
    restaurants,
    zoom,
    onClick,
  }: {
    count: number;
    restaurants: MapMarker[];
    zoom: number;
    onClick: () => void;
  }) => {
    const size = Math.max(32, Math.min(50, 20 + count * 3));
    const restaurantCount = restaurants.filter((r) => isRestaurant(r)).length;

    return (
      <div
        className="relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110"
        style={{
          width: size,
          height: size,
        }}
        onClick={onClick}
      >
        {/* Background circle */}
        <div
          className="rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold"
          style={{
            width: size,
            height: size,
            backgroundColor: restaurantCount > 0 ? "#DC2626" : "#3B82F6",
            borderWidth: "3px",
          }}
        >
          +{count}
        </div>

        {/* Restaurant icon overlay */}
        {restaurantCount > 0 && (
          <div className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1 border-2 border-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41-6.88-6.88 1.27-1.27z" />
            </svg>
          </div>
        )}

        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {restaurantCount > 0
            ? `${restaurantCount} quán ăn`
            : `${count} địa điểm`}
          {count > restaurantCount &&
            restaurantCount > 0 &&
            `, +${count - restaurantCount} khác`}
        </div>
      </div>
    );
  };

  // Get current zoom level
  const currentZoom = viewState.zoom;

  // Get marker color based on type/category
  const getMarkerColor = (marker: MapMarker) => {
    // Restaurant markers get different colors based on category
    if (isRestaurant(marker)) {
      // Special colors for different Vietnamese dishes
      const title = marker.title?.toLowerCase() || "";
      const description = marker.description?.toLowerCase() || "";

      if (title.includes("phở") || description.includes("phở"))
        return "#DC2626"; // Red for Phở
      if (title.includes("bánh mì") || description.includes("bánh mì"))
        return "#EA580C"; // Orange for Bánh Mì
      if (title.includes("bánh xèo") || description.includes("bánh xèo"))
        return "#D97706"; // Amber for Bánh Xèo
      if (title.includes("bún bò") || description.includes("bún bò"))
        return "#7C2D12"; // Brown for Bún Bò
      if (title.includes("cơm tấm") || description.includes("cơm tấm"))
        return "#059669"; // Green for Cơm Tấm
      if (title.includes("hủ tiếu") || description.includes("hủ tiếu"))
        return "#0D9488"; // Teal for Hủ Tiếu
      if (title.includes("chè") || description.includes("chè"))
        return "#7C3AED"; // Purple for Chè
      if (title.includes("gỏi cuốn") || description.includes("gỏi cuốn"))
        return "#BE185D"; // Pink for Gỏi Cuốn

      // Default restaurant color
      return "#F59E0B"; // Yellow for other restaurants
    }

    // Demo markers
    if (marker.id.startsWith("demo-")) {
      return "#10b981"; // Green for demo markers
    }

    // User added markers
    return "#3B82F6"; // Blue for user markers
  };

  // Check if marker is a restaurant
  const isRestaurant = (marker: MapMarker) => {
    // Check if it's from the restaurant API (has restaurant- prefix)
    if (marker.id.startsWith("restaurant-")) {
      return true;
    }

    // Check Vietnamese food keywords in description or title
    const text = `${marker.title || ""} ${
      marker.description || ""
    }`.toLowerCase();
    const vietnameseFoodKeywords = [
      "phở",
      "bánh mì",
      "bánh xèo",
      "bún bò",
      "cơm tấm",
      "hủ tiếu",
      "chè",
      "gỏi cuốn",
      "quán",
      "nhà hàng",
      "restaurant",
      "food",
      "ăn",
      "món",
      "rice",
      "noodle",
    ];

    return vietnameseFoodKeywords.some((keyword) => text.includes(keyword));
  };

  const handleMarkerClick = (marker: MapMarker) => {
    // Highlight the clicked marker temporarily
    setHighlightedMarker(marker.id);
    setTimeout(() => setHighlightedMarker(null), 2000);

    if (onMarkerClick) {
      onMarkerClick(marker);
    } else {
      // Default behavior - show popup
      showPopup({
        longitude: marker.longitude,
        latitude: marker.latitude,
        content: (
          <div className="p-3 max-w-xs">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {marker.title || "Marker"}
            </h3>
            {marker.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {marker.description}
              </p>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <div>Lng: {marker.longitude.toFixed(6)}</div>
              <div>Lat: {marker.latitude.toFixed(6)}</div>
            </div>
          </div>
        ),
      });
    }
  };

  // Cluster or individual markers based on zoom level
  const clusters =
    currentZoom < 13 ? clusterMarkers(markersToRender, currentZoom) : null;
  const shouldCluster = clusters && currentZoom < 13;

  const handleClusterClick = (clusterMarkers: MapMarker[]) => {
    // Find the bounds of the cluster
    const lats = clusterMarkers.map((m) => m.latitude);
    const lngs = clusterMarkers.map((m) => m.longitude);
    const bounds = [
      [Math.min(...lngs), Math.min(...lats)], // southwest
      [Math.max(...lngs), Math.max(...lats)], // northeast
    ];

    // Zoom to fit the cluster
    const map = document.querySelector(".mapboxgl-map");
    if (map && (map as any).getMap) {
      (map as any).getMap().fitBounds(bounds, { padding: 50 });
    }
  };

  return (
    <>
      {shouldCluster
        ? // Render clusters
          clusters.map((cluster, index) =>
            cluster.markers.length === 1 ? (
              // Single marker - render normally
              <Marker
                key={cluster.markers[0].id}
                longitude={cluster.markers[0].longitude}
                latitude={cluster.markers[0].latitude}
                anchor={isRestaurant(cluster.markers[0]) ? "center" : "bottom"}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(cluster.markers[0]);
                }}
              >
                {renderCustomMarker ? (
                  renderCustomMarker(cluster.markers[0])
                ) : (
                  <DefaultMarkerIcon
                    color={getMarkerColor(cluster.markers[0])}
                    size={isRestaurant(cluster.markers[0]) ? 28 : 24}
                    zoom={currentZoom}
                    isHighlighted={highlightedMarker === cluster.markers[0].id}
                    isRestaurant={isRestaurant(cluster.markers[0])}
                    category={cluster.markers[0].description?.split(".")[0]}
                  />
                )}
              </Marker>
            ) : (
              // Multiple markers - render cluster
              <Marker
                key={`cluster-${index}`}
                longitude={cluster.center.lng}
                latitude={cluster.center.lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleClusterClick(cluster.markers);
                }}
              >
                <ClusterMarker
                  count={cluster.markers.length}
                  restaurants={cluster.markers}
                  zoom={currentZoom}
                  onClick={() => handleClusterClick(cluster.markers)}
                />
              </Marker>
            )
          )
        : // Render individual markers when zoomed in
          markersToRender.map((marker) => (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor={isRestaurant(marker) ? "center" : "bottom"}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(marker);
              }}
            >
              {renderCustomMarker ? (
                renderCustomMarker(marker)
              ) : (
                <DefaultMarkerIcon
                  color={getMarkerColor(marker)}
                  size={isRestaurant(marker) ? 28 : 24}
                  zoom={currentZoom}
                  isHighlighted={highlightedMarker === marker.id}
                  isRestaurant={isRestaurant(marker)}
                  category={marker.description?.split(".")[0]}
                />
              )}
            </Marker>
          ))}
    </>
  );
};

export default MapMarkers;
