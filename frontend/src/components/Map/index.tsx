"use client";

import dynamic from "next/dynamic";

// Dynamic imports để tránh SSR issues với MapBox
const MapBox = dynamic(() => import("./MapBox"), {
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
  ssr: false,
});

const MapContainer = dynamic(() => import("./MapContainer"), {
  loading: () => <div>Loading Map Container...</div>,
  ssr: false,
});

const MapControls = dynamic(() => import("./MapControls"), {
  loading: () => <div>Loading Controls...</div>,
  ssr: false,
});

const MapMarkers = dynamic(() => import("./MapMarkers"), {
  loading: () => <div>Loading Markers...</div>,
  ssr: false,
});

const MapPopup = dynamic(() => import("./MapPopup"), {
  loading: () => <div>Loading Popup...</div>,
  ssr: false,
});

// Re-export context and hooks
export { MapProvider, useMap, MAP_STYLES } from "../../context/MapContext";
export type {
  MapMarker,
  MapPopup as MapPopupType,
  MapViewState,
} from "../../context/MapContext";

export {
  useMarkerClustering,
  useGeolocation,
  useMapBounds,
  useMapTheme,
} from "../../hooks/useMapHooks";

// Export components
export { default } from "./MapBox";
export { MapBox, MapContainer, MapControls, MapMarkers, MapPopup };
