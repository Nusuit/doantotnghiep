"use client";

import React from "react";
import { Popup } from "react-map-gl/mapbox";
import { useMap } from "../../context/MapContext";

interface MapPopupProps {
  onClose?: () => void;
  closeButton?: boolean;
  closeOnClick?: boolean;
  className?: string;
}

const MapPopup: React.FC<MapPopupProps> = ({
  onClose,
  closeButton = true,
  closeOnClick = true,
  className = "",
}) => {
  const { popup, hidePopup } = useMap();

  if (!popup) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      hidePopup();
    }
  };

  return (
    <Popup
      longitude={popup.longitude}
      latitude={popup.latitude}
      onClose={closeButton ? handleClose : undefined}
      closeButton={closeButton}
      closeOnClick={closeOnClick}
      className={className}
      style={{
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        {popup.content}
      </div>
    </Popup>
  );
};

export default MapPopup;
