"use client";

"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import { MapProvider } from "@/context/MapContext";
import { MapControls, MapContainer } from "@/components/Map";
import MapSearch from "@/components/Map/MapSearch";
import { getPoiMeta } from "@/components/Map/MapContainer";
import { MapPin, Navigation2, X, Star, Route, Bookmark, MessageSquare } from "lucide-react";

const MapSkeleton = () => (
    <div className="w-full h-full bg-gray-100 dark:bg-dark-surface animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading map...</span>
    </div>
);

type SelectedPoi = {
    name: string;
    lat: number;
    lng: number;
    category?: string;
    address?: string;
};

export default function MapPage() {
    const [selectedPoi, setSelectedPoi] = useState<SelectedPoi | null>(null);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const saveMenuRef = useRef<HTMLDivElement>(null);

    // Close save menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node)) {
                setShowSaveMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const poiMeta = selectedPoi ? getPoiMeta(selectedPoi.category || "") : null;

    return (
        <div className="w-full h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl relative bg-gray-50 dark:bg-[#0B0E14] flex">
            <Suspense fallback={<MapSkeleton />}>
                <MapProvider>
                    {/* 1. MAP AREA */}
                    <div className="flex-1 relative z-0">
                        <MapContainer
                            className="w-full h-full absolute inset-0"
                            onPoiClick={(poi) => {
                                setSelectedPoi(poi);
                                setShowSaveMenu(false);
                            }}
                        />

                        {/* Top-left floating elements, optional search etc. */}
                        <div className="absolute top-4 left-4 z-10 w-80">
                            <MapSearch
                                onResultSelect={(result) => {
                                    // Make sure we select it so the panel opens and maps focus
                                    setSelectedPoi({
                                        name: result.name,
                                        lat: result.coordinates[1],
                                        lng: result.coordinates[0],
                                        category: result.category,
                                        address: result.address
                                    });
                                }}
                            />
                        </div>

                        {/* Map controls bottom-right (moved left if panel open maybe? Or leave as is) */}
                        <div className={`absolute bottom-8 transition-all duration-300 z-10 ${selectedPoi ? 'right-[420px]' : 'right-4'}`}>
                            <MapControls />
                        </div>
                    </div>

                    {/* 2. SIDE PANEL (Slide Out Right) */}
                    <div
                        className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white/95 dark:bg-[#0F1116]/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 z-20 flex flex-col ${selectedPoi ? "translate-x-0" : "translate-x-full"
                            }`}
                    >
                        {selectedPoi && poiMeta && (
                            <div className="flex flex-col h-full">
                                {/* A. HEADER */}
                                <div className="p-6 pb-5 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#0F1116]/50 relative shrink-0">
                                    <button
                                        onClick={() => setSelectedPoi(null)}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <X size={20} />
                                    </button>

                                    {/* Category Badge & Stars */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span
                                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border"
                                            style={{
                                                backgroundColor: poiMeta.color + "15",
                                                color: poiMeta.color,
                                                borderColor: poiMeta.color + "30",
                                            }}
                                        >
                                            {poiMeta.label}
                                        </span>

                                        {/* Mock stars (placeholder) */}
                                        <div className="flex text-yellow-500 gap-0.5">
                                            {[...Array(4)].map((_, i) => (
                                                <Star key={i} size={14} className="fill-current" />
                                            ))}
                                            <Star size={14} className="text-gray-300 dark:text-gray-600" />
                                        </div>
                                    </div>

                                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2 pr-6 line-clamp-2">
                                        {selectedPoi.name}
                                    </h2>

                                    {selectedPoi.address && (
                                        <div className="flex items-start gap-1.5 text-gray-500 mb-5">
                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                            <span className="text-sm leading-snug">
                                                {selectedPoi.address}
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                                            <Route size={18} /> Directions
                                        </button>

                                        <div className="relative flex-1" ref={saveMenuRef}>
                                            <button
                                                onClick={() => setShowSaveMenu(!showSaveMenu)}
                                                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#1A1D24] text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <Bookmark size={18} /> Save
                                            </button>

                                            {showSaveMenu && (
                                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in-up">
                                                    <div className="p-1 space-y-1">
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 rounded-md transition-colors">
                                                            <span>❤️</span> Favorite
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 rounded-md transition-colors">
                                                            <span>🚩</span> To Visit
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 rounded-md transition-colors">
                                                            <span>✅</span> Visited
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* B. SCROLLABLE CONTENT */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50 dark:bg-[#0B0E14]/30">
                                    {/* Overview Card */}
                                    <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm mb-6">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                            About {selectedPoi.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans mb-4">
                                            This is the location you selected on the map. Currently, there is no detailed description from the system.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 w-fit px-2 py-1 rounded-md">
                                            <Navigation2 size={12} />
                                            {selectedPoi.lat.toFixed(5)}, {selectedPoi.lng.toFixed(5)}
                                        </div>
                                    </div>

                                    {/* Featured Comments / Reviews */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <MessageSquare size={14} />
                                            Community Reviews
                                        </h4>

                                        {/* Empty State */}
                                        <div className="text-center py-8 px-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                <MessageSquare size={20} />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                No reviews yet. Bookmark or review this place.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* C. FOOTER */}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1116] shrink-0">
                                    <button className="w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg">
                                        Add your review
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </MapProvider>
            </Suspense>
        </div>
    );
}
