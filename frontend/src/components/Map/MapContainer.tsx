"use client";

import { useCallback, useEffect } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMap } from "../../context/MapContext";
import MapMarkers from "./MapMarkers";
import MapPopup from "./MapPopup";

interface MapContainerProps {
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: () => void;
  onClick?: (event: any) => void;
  children?: React.ReactNode;
  showControls?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({
  className = "",
  style,
  onMapLoad,
  onClick,
  children,
  showControls = true,
}) => {
  const {
    mapRef,
    isMapLoaded,
    setIsMapLoaded,
    viewState,
    setViewState,
    mapStyle,
  } = useMap();

  const onMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);
    },
    [setViewState]
  );

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    if (onMapLoad) {
      onMapLoad();
    }
  }, [onMapLoad, setIsMapLoaded]);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxAccessToken) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={style}
      >
        <div className="text-center p-4">
          <h3 className="text-lg font-semibold text-gray-700">
            MapBox Token Required
          </h3>
          <p className="text-gray-500">
            Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onLoad={handleMapLoad}
        onClick={onClick}
        mapboxAccessToken={mapboxAccessToken}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        reuseMaps
        attributionControl={false}
      >
        {/* Navigation Controls */}
        {showControls && (
          <>
            <NavigationControl position="top-right" />

            {/* Geolocation Control */}
            <GeolocateControl
              position="top-right"
              trackUserLocation={true}
              showAccuracyCircle={true}
            />
          </>
        )}

        {/* Markers */}
        <MapMarkers />

        {/* Popup */}
        <MapPopup />

        {/* Additional children components */}
        {children}
      </Map>

      {/* Loading indicator */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Đang tải bản đồ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
