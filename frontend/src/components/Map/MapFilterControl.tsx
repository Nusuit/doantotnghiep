import React from 'react';
import { Layers, School, Coffee } from 'lucide-react';

export type FilterMode = 'all' | 'knowledge' | 'leisure';

interface MapFilterControlProps {
    filterMode: FilterMode;
    setFilterMode: (mode: FilterMode) => void;
}

const MapFilterControl: React.FC<MapFilterControlProps> = ({ filterMode, setFilterMode }) => {
    return (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="glass-dark p-1 rounded-xl flex flex-col gap-1">
                <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${filterMode === 'all'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    All Places
                </button>
                <button
                    onClick={() => setFilterMode('knowledge')}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${filterMode === 'knowledge'
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <School className="w-4 h-4" />
                    Knowledge
                </button>
                <button
                    onClick={() => setFilterMode('leisure')}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${filterMode === 'leisure'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Coffee className="w-4 h-4" />
                    Leisure
                </button>
            </div>
        </div>
    );
};

export default MapFilterControl;
