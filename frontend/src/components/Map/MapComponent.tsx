"use client";

import { useEffect, useRef, useState } from "react";

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
    category?: string;
  }>;
  onLocationSelect?: (location: any) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = [106.6297, 10.8231], // Ho Chi Minh City coordinates [lng, lat]
  zoom = 10,
  height = "400px",
  markers = [],
  onLocationSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load MapBox GL JS dynamically
    const loadMapBox = async () => {
      if (map.current) return; // Initialize map only once

      try {
        // Dynamically import MapBox GL
        const mapboxgl = await import("mapbox-gl");

        // Set access token (should be in environment variables)
        mapboxgl.default.accessToken =
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

        if (!mapboxgl.default.accessToken) {
          console.error("MapBox access token not found");
          setIsLoading(false);
          return;
        }

        // Initialize map
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: center,
          zoom: zoom,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.default.NavigationControl());

        map.current.on("load", () => {
          setIsLoading(false);
        });

        // Handle map clicks
        map.current.on("click", (e: any) => {
          if (onLocationSelect) {
            onLocationSelect({
              coordinates: [e.lngLat.lng, e.lngLat.lat],
              address: `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(6)}`,
            });
          }
        });
      } catch (error) {
        console.error("Error loading MapBox:", error);
        setIsLoading(false);
      }
    };

    loadMapBox();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add markers when they change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Add new markers
    markers.forEach((marker) => {
      const loadMapBox = async () => {
        const mapboxgl = await import("mapbox-gl");

        // Create marker element
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundColor = getMarkerColor(marker.category);
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        // Create popup
        const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(
          `<h3>${marker.name}</h3><p>${marker.category || "Location"}</p>`
        );

        // Add marker to map
        new mapboxgl.default.Marker(el)
          .setLngLat(marker.coordinates)
          .setPopup(popup)
          .addTo(map.current);
      };

      loadMapBox();
    });
  }, [markers]);

  const getMarkerColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      restaurant: "#ef4444",
      cafe: "#f59e0b",
      hotel: "#3b82f6",
      attraction: "#10b981",
      shopping: "#8b5cf6",
      default: "#6b7280",
    };
    return colors[category || "default"];
  };

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 dark:bg-[#161920]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải bản đồ...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapComponent;
