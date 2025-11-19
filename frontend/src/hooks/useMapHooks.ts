"use client";

import { useCallback, useEffect, useState } from "react";
import { useMap, MapMarker } from "../context/MapContext";

// Hook for marker clustering
export const useMarkerClustering = (threshold: number = 100) => {
  const { markers, viewState } = useMap();
  const [clusteredMarkers, setClusteredMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    if (markers.length <= threshold) {
      setClusteredMarkers(markers);
      return;
    }

    // Simple clustering logic - group nearby markers
    const clusters: MapMarker[] = [];
    const processed = new Set<string>();

    markers.forEach((marker) => {
      if (processed.has(marker.id)) return;

      const nearby = markers.filter(
        (m) =>
          !processed.has(m.id) &&
          Math.abs(m.longitude - marker.longitude) < 0.01 &&
          Math.abs(m.latitude - marker.latitude) < 0.01
      );

      if (nearby.length > 1) {
        // Create cluster marker
        const avgLng =
          nearby.reduce((sum, m) => sum + m.longitude, 0) / nearby.length;
        const avgLat =
          nearby.reduce((sum, m) => sum + m.latitude, 0) / nearby.length;

        clusters.push({
          id: `cluster-${marker.id}`,
          longitude: avgLng,
          latitude: avgLat,
          title: `${nearby.length} locations`,
          description: `Cluster of ${nearby.length} markers`,
          color: "#3b82f6",
        });

        nearby.forEach((m) => processed.add(m.id));
      } else {
        clusters.push(marker);
        processed.add(marker.id);
      }
    });

    setClusteredMarkers(clusters);
  }, [markers, threshold]);

  return { clusteredMarkers };
};

// Hook for geolocation
export const useGeolocation = () => {
  const { flyTo } = useMap();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const newPosition = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setPosition(newPosition);
      flyTo({ ...newPosition, zoom: 15 });
    } catch (err) {
      setError("Unable to retrieve location");
    } finally {
      setIsLoading(false);
    }
  }, [flyTo]);

  return {
    getCurrentLocation,
    position,
    isLoading,
    error,
  };
};

// Hook for map bounds management
export const useMapBounds = () => {
  const { mapRef, viewState } = useMap();
  const [bounds, setBounds] = useState<any>(null);

  const updateBounds = useCallback(() => {
    if (mapRef.current) {
      const newBounds = mapRef.current.getBounds();
      setBounds(newBounds);
    }
  }, [mapRef]);

  const fitBounds = useCallback(
    (boundsArray: [[number, number], [number, number]], options = {}) => {
      if (mapRef.current) {
        mapRef.current.fitBounds(boundsArray, {
          padding: 50,
          duration: 1000,
          ...options,
        });
      }
    },
    [mapRef]
  );

  const fitMarkersInView = useCallback(
    (markers: MapMarker[]) => {
      if (markers.length === 0) return;

      if (markers.length === 1) {
        const marker = markers[0];
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [marker.longitude, marker.latitude],
            zoom: 15,
            duration: 1000,
          });
        }
        return;
      }

      const lngs = markers.map((m) => m.longitude);
      const lats = markers.map((m) => m.latitude);

      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];

      fitBounds(bounds);
    },
    [fitBounds, mapRef]
  );

  useEffect(() => {
    updateBounds();
  }, [viewState, updateBounds]);

  return {
    bounds,
    updateBounds,
    fitBounds,
    fitMarkersInView,
  };
};

// Hook for map style management with theme detection
export const useMapTheme = () => {
  const { mapStyle, setMapStyle } = useMap();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    const styleMap = {
      light: "mapbox://styles/mapbox/light-v11",
      dark: "mapbox://styles/mapbox/dark-v11",
    };

    setMapStyle(styleMap[newTheme]);
  }, [theme, setMapStyle]);

  return {
    theme,
    toggleTheme,
    mapStyle,
  };
};
