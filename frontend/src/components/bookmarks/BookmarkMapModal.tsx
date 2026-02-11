"use client";

import React from "react";
import { MapContainer } from "@/components/Map";
import { Marker } from "react-map-gl/mapbox";
import { MapProvider } from "@/context/MapContext";

interface BookmarkMapModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookmark: {
        id: string;
        title: string;
        excerpt: string;
        location?: {
            lat: number;
            lng: number;
            address?: string;
        };
        rating?: number;
    } | null;
}

export const BookmarkMapModal = ({ isOpen, onClose, bookmark }: BookmarkMapModalProps) => {
    if (!isOpen || !bookmark || !bookmark.location) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#161b22] w-full max-w-5xl h-[600px] rounded-3xl overflow-hidden shadow-2xl flex border border-gray-200 dark:border-gray-800 animate-scale-in">

                {/* Left Side: Content */}
                <div className="w-1/2 p-8 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14]">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                                REVIEW PLACE
                            </span>
                            {bookmark.rating && (
                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-md text-amber-500 text-xs font-bold border border-amber-100 dark:border-amber-900/30">
                                    <span className="material-symbols-outlined text-[14px] filled">star</span>
                                    {bookmark.rating}
                                </div>
                            )}
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                            {bookmark.title}
                        </h2>

                        {bookmark.location.address && (
                            <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-8">
                                <span className="material-symbols-outlined mt-0.5 text-primary">location_on</span>
                                <span className="font-medium">{bookmark.location.address}</span>
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                {bookmark.excerpt}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 mt-4 text-sm">
                                Added on {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors"
                        >
                            Close
                        </button>
                        <button
                            className="flex-1 py-3.5 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                        >
                            <span className="material-symbols-outlined text-[18px]">directions</span>
                            Get Directions
                        </button>
                    </div>
                </div>

                {/* Right Side: Map */}
                <div className="w-1/2 h-full relative bg-gray-100 dark:bg-[#0E1116] border-l border-gray-200 dark:border-gray-800">
                    <MapProvider>
                        <MapContainer
                            className="w-full h-full"
                            // Force re-render when location changes to recenter
                            key={`${bookmark.location.lat}-${bookmark.location.lng}`}
                        >
                            <Marker
                                latitude={bookmark.location.lat}
                                longitude={bookmark.location.lng}
                                color="#2970FF"
                            />
                        </MapContainer>
                    </MapProvider>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-[#161b22] rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white transition-colors z-10"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
