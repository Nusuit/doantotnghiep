"use client";

import React, { useEffect } from "react";
import { MapProvider } from "@/context/MapContext";
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
      initialMapStyle={initialMapStyle}
    >
      <div
        className={`relative map-container ${responsiveClasses}`}
        style={defaultStyle}
      >
        <MapContainer
          className="w-full h-full rounded-lg overflow-hidden shadow-lg"
          showControls={showControls}
          onClick={onClick}
        >
          {children}
        </MapContainer>

        {/* Custom Map Controls */}
        {showMapControls && <MapControls className="map-controls" />}
      </div>
    </MapProvider>
  );
};

export default MapBox;
