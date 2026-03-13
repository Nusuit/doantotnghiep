"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  // MapBox, // Dynamic import
  useMap,
  MapProvider,
  MapMarkers,
  MAP_STYLES,
  type MapMarker,
  useGeolocation,
  useMapBounds,
} from "../../components/Map";
import MapLayerControl, {
  LayerMode,
} from "../../components/Map/MapLayerControl";
import MapSearch from "../../components/Map/MapSearch";
import MapDebugPanel from "../../components/Map/MapDebugPanel";
import AddRestaurantForm from "../../components/Map/AddRestaurantForm";
import { fetchContextArticles, fetchMapContexts } from "../../services/mapContextService";
// New Design Components
import MapFilterControl, { FilterMode } from "../../components/Map/MapFilterControl";
import MapStyleControl, { MapStyle } from "../../components/Map/MapStyleControl";
import LocationCard from "../../components/Map/LocationCard";
import MapSkeleton from "../../components/Map/MapSkeleton";
import RestaurantsLayer from "../../components/Map/RestaurantsLayer";

const MapBox = dynamic(
  () => import("../../components/Map").then((mod) => mod.MapBox),
  {
    loading: () => <MapSkeleton />,
    ssr: false,
  }
);

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
  const [selectedArticles, setSelectedArticles] = useState<{ id: number; title: string }[]>([]);
  const { flyTo, mapRef, viewState, setMapStyle } = useMap(); // Added viewState from context if available, or we track it via onMove (MapBox props)
  // Logic update: MapBox component in this project manages its own viewState via context?
  // Inspecting MapContainer showed it uses useMap(). So we can get viewState from useMap().

  const { getCurrentLocation } = useGeolocation();
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);

  // Design States
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [activeStyle, setActiveStyle] = useState<MapStyle>("custom");

  // Sync activeStyle with map context
  useEffect(() => {
    const styleMap: Record<MapStyle, string> = {
      custom: MAP_STYLES.CUSTOM,
      streets: MAP_STYLES.STREETS,
      satellite: MAP_STYLES.SATELLITE,
      dark: MAP_STYLES.DARK,
    };
    setMapStyle(styleMap[activeStyle]);
  }, [activeStyle]);

  // Data States
  // Replaced MapMarker[] with GeoJSON FeatureCollection
  const [mapFeatures, setMapFeatures] = useState<any>({
    type: "FeatureCollection",
    features: []
  });

  const [searchResultMarker, setSearchResultMarker] = useState<MapMarker | null>(null);

  const isClient = useIsClient();
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Viewport Data Fetching
  const fetchPlacesInView = useCallback(async () => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    try {
      const contexts = await fetchMapContexts({
        minLng: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLng: bounds.getEast(),
        maxLat: bounds.getNorth(),
        limit: 200,
      });

      const validContexts = contexts.filter(
        (ctx) => typeof ctx.latitude === "number" && typeof ctx.longitude === "number"
      );

      const features = validContexts.map((ctx) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [ctx.longitude, ctx.latitude] },
        properties: {
          id: ctx.id,
          title: ctx.name,
          description: ctx.description || ctx.address || "",
          type: ctx.category || "place",
        },
      }));

      setMapFeatures({ type: "FeatureCollection", features });
    } catch (error) {
      console.error("Failed to fetch map data", error);
    }
  }, [mapRef]);

  // Debounced version – only fires 400ms after the user stops moving the map
  const handleMoveEnd = useCallback(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(fetchPlacesInView, 400);
  }, [fetchPlacesInView]);

  // Initial fetch once map is ready
  useEffect(() => {
    if (isClient && mapRef.current) fetchPlacesInView();
  }, [isClient, mapRef.current]);

  // Handle Map Click (Layer Interaction)
  // We need to pass this handler to MapBox
  const handleMapClick = (event: any) => {
    const features = event.features;
    if (features && features.length > 0) {
      // Check if clicked the restaurants layer
      const clickedFeature = features[0];
      if (clickedFeature.layer.id === 'restaurants-point') {
        const props = clickedFeature.properties;

        setSelectedMarker({
          id: props.id,
          longitude: clickedFeature.geometry.coordinates[0],
          latitude: clickedFeature.geometry.coordinates[1],
          title: props.title,
          description: props.description,
          color: "#22c55e"
        });

        setSelectedArticles([]);
        fetchContextArticles(Number(props.id))
          .then((articles) => setSelectedArticles(articles))
          .catch((err) => console.error("Failed to load context articles", err));

        // Fly to it
        flyTo({
          longitude: clickedFeature.geometry.coordinates[0],
          latitude: clickedFeature.geometry.coordinates[1],
          zoom: 16
        });

        return; // Stop propagation
      }
    }

    // If clicked background, clear selection
    setSelectedMarker(null);
    setSelectedArticles([]);
  };

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="relative h-screen w-full bg-gray-900 overflow-hidden">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapBox
          height="100%"
          width="100%"
          initialViewState={{
            longitude: 106.6297,
            latitude: 10.8231,
            zoom: 12,
          }}
          onClick={handleMapClick}
          onMoveEnd={handleMoveEnd}
        >
          {/* Layers */}
          <RestaurantsLayer data={mapFeatures} />

          {/* Search result marker (single item – kept as React component intentionally) */}
          {searchResultMarker && (
            <MapMarkers markers={[searchResultMarker]} />
          )}
        </MapBox>
      </div>

      {/* OVERLAYS */}

      {/* 1. Filter Control (Top Left) */}
      <MapFilterControl
        filterMode={filterMode}
        setFilterMode={setFilterMode}
      />

      {/* 2. Style & Zoom Control (Top Right) */}
      <MapStyleControl
        activeStyle={activeStyle}
        setActiveStyle={setActiveStyle}
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
      />

      {/* 3. Search Bar (Top Center - Floating) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
        <div className="glass-dark rounded-xl shadow-lg border border-gray-700/50">
          <MapSearch
            onResultSelect={(result) => {
              const searchMarker: MapMarker = {
                id: `search-${result.id}`,
                longitude: result.coordinates[0],
                latitude: result.coordinates[1],
                title: `🎯 ${result.name}`,
                description: result.address,
                color: "#22c55e",
              };
              setSearchResultMarker(searchMarker);
              flyTo({
                longitude: result.coordinates[0],
                latitude: result.coordinates[1],
                zoom: 16,
              });
            }}
            placeholder="Tìm kiếm địa điểm..."
          />
        </div>
      </div>

      {/* 4. Location Details Card (Bottom) */}
      <LocationCard
        location={selectedMarker ? {
          id: selectedMarker.id,
          name: selectedMarker.title || "Unknown Location",
          description: selectedMarker.description,
          coordinates: [selectedMarker.longitude, selectedMarker.latitude],
        } : null}
        articles={selectedArticles}
        onClose={() => {
          setSelectedMarker(null);
          setSelectedArticles([]);
        }}
        onDirections={() => {
          alert("Tính năng chỉ đường đang phát triển!");
        }}
      />
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
