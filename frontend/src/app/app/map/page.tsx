"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MapProvider } from '@/context/MapContext';
import { MapControls } from '@/components/Map';
import { MapContainer } from '@/components/Map';

const MapSkeleton = () => (
    <div className="w-full h-full bg-gray-100 dark:bg-dark-surface animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading Map...</span>
    </div>
);

export default function MapPage() {
    return (
        <div className="w-full h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative">
            <Suspense fallback={<MapSkeleton />}>
                <MapProvider>
                    <div className="absolute inset-0 z-0">
                        <MapContainer className="w-full h-full" />
                    </div>

                    {/* Overlay Controls */}
                    <div className="absolute top-4 left-4 z-10 w-80">
                        {/* We can place the search bar or filters here */}
                    </div>

                    <div className="absolute bottom-8 right-4 z-10">
                        <MapControls />
                    </div>
                </MapProvider>
            </Suspense>
        </div>
    );
}
