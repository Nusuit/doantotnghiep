'use client';

import React from 'react';
import { useMap, MAP_STYLES } from '../../context/MapContext';
import { useGeolocation, useMapTheme } from '../../hooks/useMapHooks';

interface MapControlsProps {
  className?: string;
  showStyleSelector?: boolean;
  showLocationButton?: boolean;
  showThemeToggle?: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  className = '',
  showStyleSelector = true,
  showLocationButton = true,
  showThemeToggle = true
}) => {
  const { mapStyle, setMapStyle, clearMarkers } = useMap();
  const { getCurrentLocation, isLoading: locationLoading } = useGeolocation();
  const { theme, toggleTheme } = useMapTheme();

  return (
    <div className={`absolute top-4 left-4 z-10 flex flex-col gap-2 ${className}`}>
      {/* Style Selector */}
      {showStyleSelector && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={MAP_STYLES.STREETS}>Streets</option>
            <option value={MAP_STYLES.LIGHT}>Light</option>
            <option value={MAP_STYLES.DARK}>Dark</option>
            <option value={MAP_STYLES.SATELLITE}>Satellite</option>
            <option value={MAP_STYLES.OUTDOORS}>Outdoors</option>
          </select>
        </div>
      )}

      {/* Control Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-2">
        {/* Location Button */}
        {showLocationButton && (
          <button
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors flex items-center gap-2"
          >
            {locationLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
                </svg>
                Đang tìm...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Vị trí của tôi
              </>
            )}
          </button>
        )}

        {/* Theme Toggle */}
        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            className="px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-2"
          >
            {theme === 'light' ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                Dark Mode
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Light Mode
              </>
            )}
          </button>
        )}

        {/* Clear Markers */}
        <button
          onClick={clearMarkers}
          className="px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Xóa markers
        </button>
      </div>
    </div>
  );
};

export default MapControls;