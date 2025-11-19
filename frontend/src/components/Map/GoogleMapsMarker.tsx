"use client";

import React from "react";
import { Marker } from "react-map-gl/mapbox";
import { MapMarker } from "../../context/MapContext";

interface GoogleMapsMarkerProps {
  marker: MapMarker;
  onClick?: (marker: MapMarker) => void;
}

const GoogleMapsMarker: React.FC<GoogleMapsMarkerProps> = ({
  marker,
  onClick,
}) => {
  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(marker);
      }}
    >
      <div className="google-maps-marker cursor-pointer transform transition-transform hover:scale-110">
        {/* Main Pin */}
        <div
          className="relative"
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        >
          {/* Pin Shape */}
          <svg
            width="32"
            height="40"
            viewBox="0 0 32 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 0C7.16 0 0 7.16 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16 24.84 0 16 0Z"
              fill={marker.color || "#EA4335"}
            />
            <circle cx="16" cy="16" r="8" fill="white" />
            {/* Icon inside */}
            <circle cx="16" cy="16" r="4" fill={marker.color || "#EA4335"} />
          </svg>

          {/* Hover Label */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {marker.title}
            </div>
            <div className="w-2 h-2 bg-gray-800 transform rotate-45 mx-auto -mt-1"></div>
          </div>
        </div>
      </div>
    </Marker>
  );
};

// Different marker types for different places
export const RestaurantMarker: React.FC<GoogleMapsMarkerProps> = ({
  marker,
  onClick,
}) => {
  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(marker);
      }}
    >
      <div className="cursor-pointer transform transition-all hover:scale-110">
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
          <path
            d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.27 21.73 0 14 0Z"
            fill="#EA4335"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />
          <circle cx="14" cy="14" r="7" fill="white" />
          {/* Restaurant icon */}
          <path
            d="M11 8V12H13V8H15V12C15 12.55 15.45 13 16 13H17V20H15V22H13V20H11V13H12C12.55 13 13 12.55 13 12V8H11ZM9 8V13H10V15H8V8H9Z"
            fill="#EA4335"
          />
        </svg>
      </div>
    </Marker>
  );
};

export const LandmarkMarker: React.FC<GoogleMapsMarkerProps> = ({
  marker,
  onClick,
}) => {
  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(marker);
      }}
    >
      <div className="cursor-pointer transform transition-all hover:scale-110">
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
          <path
            d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.27 21.73 0 14 0Z"
            fill="#4285F4"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />
          <circle cx="14" cy="14" r="7" fill="white" />
          {/* Building icon */}
          <path
            d="M10 8H12V10H10V8ZM13 8H15V10H13V8ZM16 8H18V10H16V8ZM10 11H12V13H10V11ZM13 11H15V13H13V11ZM16 11H18V13H16V11ZM10 14H12V16H10V14ZM13 14H15V16H13V14ZM16 14H18V16H16V14ZM8 17H20V20H8V17Z"
            fill="#4285F4"
          />
        </svg>
      </div>
    </Marker>
  );
};

export const ShoppingMarker: React.FC<GoogleMapsMarkerProps> = ({
  marker,
  onClick,
}) => {
  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(marker);
      }}
    >
      <div className="cursor-pointer transform transition-all hover:scale-110">
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
          <path
            d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.27 21.73 0 14 0Z"
            fill="#34A853"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />
          <circle cx="14" cy="14" r="7" fill="white" />
          {/* Shopping bag icon */}
          <path
            d="M16 8V7C16 5.9 15.1 5 14 5S12 5.9 12 7V8H10C9.45 8 9 8.45 9 9V19C9 19.55 9.45 20 10 20H18C18.55 20 19 19.55 19 19V9C19 8.45 18.55 8 18 8H16ZM14 6C14.55 6 15 6.45 15 7V8H13V7C13 6.45 13.45 6 14 6ZM17 10V12H16V10H17ZM12 10V12H11V10H12Z"
            fill="#34A853"
          />
        </svg>
      </div>
    </Marker>
  );
};

export default GoogleMapsMarker;
