"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { MapRef } from "react-map-gl/mapbox";

// Types
export interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface MapPopup {
  longitude: number;
  latitude: number;
  content: ReactNode;
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

interface MapContextType {
  // Map instance
  mapRef: React.RefObject<MapRef | null>;
  map: MapRef | null;
  isMapLoaded: boolean;
  setIsMapLoaded: (loaded: boolean) => void;

  // View state
  viewState: MapViewState;
  setViewState: (viewState: MapViewState) => void;

  // Markers
  markers: MapMarker[];
  addMarker: (marker: MapMarker) => void;
  removeMarker: (markerId: string) => void;
  clearMarkers: () => void;

  // Popup
  popup: MapPopup | null;
  showPopup: (popup: MapPopup) => void;
  hidePopup: () => void;

  // Map style
  mapStyle: string;
  setMapStyle: (style: string) => void;

  // Utility functions
  flyTo: (options: {
    longitude: number;
    latitude: number;
    zoom?: number;
  }) => void;
  getBounds: () => any;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

// Hook to use map context
export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};

// Map styles presets
export const MAP_STYLES = {
  STANDARD: "mapbox://styles/mapbox/standard",
  STREETS: "mapbox://styles/mapbox/streets-v12",
  LIGHT: "mapbox://styles/mapbox/light-v11",
  DARK: "mapbox://styles/mapbox/dark-v11",
  SATELLITE: "mapbox://styles/mapbox/satellite-v9",
  OUTDOORS: "mapbox://styles/mapbox/outdoors-v12",
};

interface MapProviderProps {
  children: ReactNode;
  initialViewState?: MapViewState;
  initialMapStyle?: string;
}

export const MapProvider: React.FC<MapProviderProps> = ({
  children,
  initialViewState = {
    longitude: 106.6297, // Ho Chi Minh City
    latitude: 10.8231,
    zoom: 11,
  },
  initialMapStyle = MAP_STYLES.STREETS,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [viewState, setViewState] = useState<MapViewState>(initialViewState);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [popup, setPopup] = useState<MapPopup | null>(null);
  const [mapStyle, setMapStyle] = useState(initialMapStyle);

  // Marker management
  const addMarker = useCallback((marker: MapMarker) => {
    setMarkers((prev) => [...prev.filter((m) => m.id !== marker.id), marker]);
  }, []);

  const removeMarker = useCallback((markerId: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== markerId));
  }, []);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  // Popup management
  const showPopup = useCallback((popupData: MapPopup) => {
    setPopup(popupData);
  }, []);

  const hidePopup = useCallback(() => {
    setPopup(null);
  }, []);

  // Map utilities
  const flyTo = useCallback(
    (options: { longitude: number; latitude: number; zoom?: number }) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [options.longitude, options.latitude],
          zoom: options.zoom || viewState.zoom,
          duration: 1000,
        });
      }
    },
    [viewState.zoom]
  );

  const getBounds = useCallback(() => {
    if (mapRef.current) {
      return mapRef.current.getBounds();
    }
    return null;
  }, []);

  const contextValue: MapContextType = {
    mapRef,
    map: mapRef.current,
    isMapLoaded,
    setIsMapLoaded,
    viewState,
    setViewState,
    markers,
    addMarker,
    removeMarker,
    clearMarkers,
    popup,
    showPopup,
    hidePopup,
    mapStyle,
    setMapStyle,
    flyTo,
    getBounds,
  };

  return (
    <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>
  );
};
