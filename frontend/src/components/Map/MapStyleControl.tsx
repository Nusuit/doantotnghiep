import React from 'react';
import { Map as MapIcon, Satellite, Moon, Plus, Minus } from 'lucide-react';

export type MapStyle = 'streets' | 'satellite' | 'dark';

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
            <div className="glass-dark rounded-xl overflow-hidden p-1 flex flex-col gap-1">
                <button
                    onClick={() => setActiveStyle('streets')}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${activeStyle === 'streets'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    title="Streets"
                >
                    <MapIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setActiveStyle('satellite')}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${activeStyle === 'satellite'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    title="Satellite"
                >
                    <Satellite className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setActiveStyle('dark')}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${activeStyle === 'dark'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    title="Dark Mode"
                >
                    <Moon className="w-5 h-5" />
                </button>
            </div>

            {/* Zoom Controls */}
            <div className="glass-dark rounded-xl overflow-hidden flex flex-col">
                <button
                    onClick={onZoomIn}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-gray-700/50"
                >
                    <Plus className="w-5 h-5" />
                </button>
                <button
                    onClick={onZoomOut}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <Minus className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default MapStyleControl;
