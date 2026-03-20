"use client";

import React from "react";
import Link from "next/link";

interface BookmarkCardProps {
    id: string;
    title: string;
    excerpt: string;
    author: {
        name: string;
        avatar?: string;
    };
    category: "article" | "place" | "video";
    rating?: number;
    folder?: string;
    date: string;
    onMapClick?: () => void;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    showMapPreview?: boolean;
    location?: { lat: number; lng: number; address: string };
    onRate?: (rating: number) => void;
}

export const BookmarkCard = ({
    id,
    title,
    excerpt,
    author,
    category,
    rating,
    folder,
    date,
    onMapClick,
    draggable,
    onDragStart,
    showMapPreview,
    location,
    onRate
}: BookmarkCardProps) => {
    const [hoverRating, setHoverRating] = React.useState<number>(0);

    return (
        <div className="flex gap-4 items-start group">
            {/* Selection Circle */}
            <div className="pt-8">
                <div className="w-5 h-5 rounded-full border-2 border-gray-600 group-hover:border-primary transition-colors cursor-pointer"></div>
            </div>

            {/* Main Card */}
            <div
                draggable={draggable}
                onDragStart={onDragStart}
                onClick={onMapClick}
                className={`flex-1 flex bg-[#0E1217] border border-white/5 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 cursor-pointer ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl text-white leading-tight group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        {folder && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/5">
                                {folder}
                            </span>
                        )}
                    </div>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
                        {excerpt}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto flex items-center gap-4 text-xs font-medium text-gray-500">
                        <span>{date}</span>
                        <div className="flex items-center gap-0.5 text-amber-500" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRate?.(star);
                                    }}
                                    onMouseEnter={() => setHoverRating(star)}
                                    className={`material-symbols-outlined text-[14px] transition-transform hover:scale-110 ${(hoverRating ? star <= hoverRating : star <= (rating || 0))
                                            ? 'filled'
                                            : 'text-gray-600 hover:text-amber-500' // Better empty state
                                        }`}
                                >
                                    {(hoverRating ? star <= hoverRating : star <= (rating || 0)) ? 'star' : 'star_border'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Preview Section (Only for Places/Review Source) */}
                {showMapPreview && (
                    <div className="w-48 relative bg-gray-800 hidden sm:block">
                        {/* Static Map Placeholder - In real app, use a static map image API */}
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/135.7681,35.0116,13,0/300x200@2x?access_token=Pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGlxeXJ6cG8wMnJqM2VweG1neTdodGZ4In0.example')] bg-cover bg-center grayscale opacity-60 mix-blend-luminosity"></div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0E1217]"></div>

                        {/* Location Pin */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50">
                                    <span className="material-symbols-outlined text-white text-[16px]">location_on</span>
                                </div>
                            </div>
                        </div>

                        {/* Rating Badge on Map */}
                        {rating && (
                            <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur text-black text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px] filled">star</span>
                                {rating.toFixed(1)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
