import React from 'react';
import { X, Navigation, Info, CheckCircle } from 'lucide-react';

interface Location {
    id: string;
    name: string;
    description?: string;
    address?: string;
    type?: string;
    image?: string;
    coordinates: [number, number];
}

interface LocationCardProps {
    location: Location | null;
    onClose: () => void;
    onDirections?: () => void;
    articles?: { id: number; title: string }[];
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onClose, onDirections, articles = [] }) => {
    if (!location) return null;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                {/* Image Header */}
                <div className="relative h-32 w-full bg-gray-800">
                    {location.image ? (
                        <img
                            src={location.image}
                            alt={location.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900">
                            <span className="text-4xl">📍</span>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {location.type && (
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                            {location.type}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white leading-tight">
                            {location.name}
                        </h3>
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                        {location.description || location.address || "Địa điểm thú vị để khám phá."}
                    </p>

                    {articles.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Bài viết liên quan</p>
                            <ul className="space-y-1">
                                {articles.slice(0, 3).map((article) => (
                                    <li key={article.id} className="text-sm text-gray-300">
                                        • {article.title}
                                    </li>
                                ))}
                                {articles.length > 3 && (
                                    <li className="text-xs text-gray-500">+{articles.length - 3} bài viết khác</li>
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={onDirections}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                        >
                            <Navigation className="w-4 h-4" />
                            Chỉ đường
                        </button>
                        <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-700">
                            <Info className="w-4 h-4" />
                            {articles.length > 0 ? "Xem bài viết" : "Chi tiết"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationCard;
