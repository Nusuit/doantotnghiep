"use client";

import React from "react";

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  text?: string;
  className?: string;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width = 500,
  height = 300,
  text = "Image Placeholder",
  className = "",
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
      style={{ width: "100%", height: `${height}px`, minHeight: `${height}px` }}
    >
      <div className="text-center">
        <svg
          className="mx-auto mb-2 text-gray-400"
          width="48"
          height="48"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
        </svg>
        <p className="text-gray-500 text-sm font-medium">{text}</p>
        <p className="text-gray-400 text-xs mt-1">
          {width} x {height}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderImage;
