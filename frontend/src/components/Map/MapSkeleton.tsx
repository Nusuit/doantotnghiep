import React from 'react';

const MapSkeleton: React.FC = () => {
    return (
        <div className="relative h-screen w-full bg-gray-900 overflow-hidden animate-pulse">
            {/* Top Left Filters Skeleton */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-gray-800 p-1 rounded-xl flex flex-col gap-1 w-24">
                    <div className="h-8 bg-gray-700 rounded-lg"></div>
                    <div className="h-8 bg-gray-700 rounded-lg"></div>
                    <div className="h-8 bg-gray-700 rounded-lg"></div>
                </div>
            </div>

            {/* Top Right Controls Skeleton */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
                <div className="bg-gray-800 rounded-xl p-1 flex flex-col gap-1 w-12">
                    <div className="h-10 bg-gray-700 rounded-lg"></div>
                    <div className="h-10 bg-gray-700 rounded-lg"></div>
                    <div className="h-10 bg-gray-700 rounded-lg"></div>
                </div>
                <div className="bg-gray-800 rounded-xl p-1 flex flex-col gap-1 w-12">
                    <div className="h-10 bg-gray-700 rounded-lg"></div>
                    <div className="h-10 bg-gray-700 rounded-lg"></div>
                </div>
            </div>

            {/* Center Search Skeleton */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-md">
                <div className="h-12 bg-gray-800 rounded-xl w-full"></div>
            </div>

            {/* Bottom Card Skeleton */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm">
                <div className="h-48 bg-gray-800 rounded-2xl w-full"></div>
            </div>
        </div>
    );
};

export default MapSkeleton;
