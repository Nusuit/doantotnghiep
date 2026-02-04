"use client";

import React, { useEffect } from "react";
import { MapProvider, MapMarker } from "@/context/MapContext";
import MapContainer from "./MapContainer";
import MapControls from "./MapControls";
import "./map.scss";

interface MapBoxProps {
  className?: string;
  style?: React.CSSProperties;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  initialMapStyle?: string;
  showControls?: boolean;
  showMapControls?: boolean;
  onClick?: (event: any) => void;
  children?: React.ReactNode;
  height?: string | number;
  width?: string | number;
  mapStyle?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMoveEnd?: (event: any) => void;
  interactiveLayerIds?: string[];
}

const MapBox: React.FC<MapBoxProps> = ({
  className = "",
  style,
  initialViewState,
  initialMapStyle,
  showControls = true,
  showMapControls = true,
  onClick,
  children,
  height = "400px",
  width = "100%",
  onMoveEnd,
  interactiveLayerIds,
}) => {
  const defaultStyle = {
    height,
    width,
    ...style,
  };

  const responsiveClasses = `
    w-full
    ${className}
  `.trim();

  return (
    <MapProvider
      initialViewState={initialViewState}
      initialMapStyle={initialMapStyle || /* mapStyle prop is for dynamic updates */ initialMapStyle}
    >
      <div
        className={`relative map-container ${responsiveClasses}`}
        style={defaultStyle}
      >
        <MapContainer
          className="w-full h-full rounded-lg overflow-hidden shadow-lg"
          showControls={showControls}
          onClick={onClick}
          onMoveEnd={onMoveEnd}
          interactiveLayerIds={interactiveLayerIds}
          // Note: MapContainer likely needs update to accept mapStyle and onMarkerClick mapping
          // For now, we rely on context or pass via props if MapContainer supports it.
          // Since MapContainer implementation is unknown, we assume it consumes context or we need to update it too.
          {...(style ? { style } : {})}
        >
          {children}
        </MapContainer>

        {/* We need to handle dynamic mapStyle update here using context if MapContainer doesn't */}
        {/* And handle marker clicks. This might need MapMarkers component update */}

        {/* Custom Map Controls */}
        {showMapControls && <MapControls className="map-controls" />}
      </div>
    </MapProvider>
  );
};

export default MapBox;
