"use client";

import React from "react";
import { MapProvider } from "../../context/MapContext";
import MapContainer from "./MapContainer";

interface GoogleMapsStyleMapProps {
  className?: string;
  style?: React.CSSProperties;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onClick?: (event: any) => void;
  children?: React.ReactNode;
  height?: string | number;
  width?: string | number;
}

const GoogleMapsStyleMap: React.FC<GoogleMapsStyleMapProps> = ({
  className = "",
  style,
  initialViewState,
  onClick,
  children,
  height = "100vh",
  width = "100%",
}) => {
  const defaultStyle = {
    height,
    width,
    ...style,
  };

  return (
    <MapProvider
      initialViewState={initialViewState}
      initialMapStyle="mapbox://styles/mapbox/streets-v12" // Google-like style
    >
      <div className={`relative ${className}`} style={defaultStyle}>
        <MapContainer
          className="w-full h-full"
          showControls={false} // Hide default controls for Google Maps style
          onClick={onClick}
        >
          {children}
        </MapContainer>

        {/* Custom Google Maps style controls */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-300">
            {/* Zoom Controls */}
            <div className="flex flex-col">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-b border-gray-200 rounded-t-lg transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-b-lg transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 12H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Control */}
        <div className="absolute top-4 right-4 z-10">
          <button className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-300 hover:shadow-xl transition-shadow flex items-center justify-center text-gray-600 hover:text-gray-800">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>

        {/* Street View Control */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-2">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition-colors">
              <svg
                className="w-6 h-6 text-yellow-800"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H13V9C15.8 9 18.2 11.1 18.7 14H18.8C19.4 14 19.9 14.4 19.9 15V16C19.9 16.6 19.5 17 18.9 17H18.7C18.2 19.9 15.8 22 13 22H11C8.2 22 5.8 19.9 5.3 17H5.1C4.5 17 4.1 16.6 4.1 16V15C4.1 14.4 4.5 14 5.1 14H5.3C5.8 11.1 8.2 9 11 9H13Z" />
              </svg>
            </div>
            <div className="text-xs text-center mt-1 text-gray-600 font-medium">
              Pegman
            </div>
          </div>
        </div>

        {/* Scale Control */}
        <div className="absolute bottom-4 left-20 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600 font-mono border border-gray-300">
            1 km
          </div>
        </div>

        {/* Terms and Privacy (like Google Maps) */}
        <div className="absolute bottom-0 right-0 z-10 bg-white/80 backdrop-blur-sm px-2 py-1 text-xs text-gray-500">
          <span>©2025 MapBox</span>
        </div>
      </div>
    </MapProvider>
  );
};

// CSS for Google Maps styling
const GoogleMapsStyles = `
  .google-maps-container {
    font-family: 'Roboto', sans-serif;
  }
  
  .google-maps-container .mapboxgl-ctrl-group {
    display: none !important; /* Hide default MapBox controls */
  }
  
  .google-maps-container .mapboxgl-popup-content {
    padding: 0 !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
    border: 1px solid #e5e7eb !important;
  }
  
  .google-maps-container .mapboxgl-popup-tip {
    border-top-color: #ffffff !important;
  }
  
  .google-maps-container .mapboxgl-popup-close-button {
    display: none !important; /* We'll use custom close button */
  }
`;

// Inject Google Maps styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = GoogleMapsStyles;
  document.head.appendChild(styleElement);
}

export default GoogleMapsStyleMap;
