import React from 'react';
import { Map as MapIcon, Satellite, Moon, Plus, Minus, Sparkles } from 'lucide-react';

export type MapStyle = 'custom' | 'streets' | 'satellite' | 'dark';

interface MapStyleControlProps {
    activeStyle: MapStyle;
    setActiveStyle: (style: MapStyle) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

const MapStyleControl: React.FC<MapStyleControlProps> = ({
    activeStyle,
    setActiveStyle,
    onZoomIn,
    onZoomOut
}) => {
    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
            {/* Style Switcher */}
            <div className="glass-dark rounded-xl overflow-hidden p-1.5 flex flex-col gap-1.5">
                <button
                    onClick={() => setActiveStyle('custom')}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors ${
                        activeStyle === 'custom'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'text-gray-200 hover:bg-white/20 hover:text-white'
                    }`}
                    title="Custom Style"
                >
                    <Sparkles className="w-7 h-7" />
                </button>
                <button
                    onClick={() => setActiveStyle('streets')}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors ${
                        activeStyle === 'streets'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'text-gray-200 hover:bg-white/20 hover:text-white'
                    }`}
                    title="Streets"
                >
                    <MapIcon className="w-7 h-7" />
                </button>
                <button
                    onClick={() => setActiveStyle('satellite')}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors ${activeStyle === 'satellite'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'text-gray-200 hover:bg-white/20 hover:text-white'
                        }`}
                    title="Satellite"
                >
                    <Satellite className="w-7 h-7" />
                </button>
                <button
                    onClick={() => setActiveStyle('dark')}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors ${activeStyle === 'dark'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'text-gray-200 hover:bg-white/20 hover:text-white'
                        }`}
                    title="Dark Mode"
                >
                    <Moon className="w-7 h-7" />
                </button>
            </div>

            {/* Zoom Controls */}
            <div className="glass-dark rounded-xl overflow-hidden flex flex-col">
                <button
                    onClick={onZoomIn}
                    className="w-14 h-14 flex items-center justify-center text-gray-100 hover:bg-white/20 hover:text-white transition-colors border-b border-gray-600/60"
                >
                    <Plus className="w-7 h-7" />
                </button>
                <button
                    onClick={onZoomOut}
                    className="w-14 h-14 flex items-center justify-center text-gray-100 hover:bg-white/20 hover:text-white transition-colors"
                >
                    <Minus className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
};

export default MapStyleControl;
