
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { EXTRA_LOCATIONS, MOCK_LEADERBOARD, FIELDS, INITIAL_POSTS } from '../../data/mockData';
import { Location } from '../../types';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock Data for Initial State
const MOCK_RECENTS = ['Zero Knowledge', 'Solana Firedancer', 'Dr. Sarah Chen'];
const MOCK_TRENDING = [
    { label: 'DePIN Revolution', category: 'Technology' },
    { label: 'Arweave 2.6', category: 'Protocol' },
    { label: 'Restaking Wars', category: 'Finance' },
    { label: 'Quantum Biology', category: 'Science' }
];

// Helper to highlight matching text
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    if (!query) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="text-[#2970FF] font-bold decoration-blue-500/30 underline decoration-2 underline-offset-2">{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};

type FilterType = 'all' | 'scholars' | 'places' | 'hubs';

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [recentSearches, setRecentSearches] = useState<string[]>(MOCK_RECENTS);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveFilter('all');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // --- SEARCH LOGIC ---
    const results = useMemo(() => {
        if (!query.trim()) return { places: [], scholars: [], hubs: [] };
        
        const lowerQ = query.toLowerCase();

        // Raw filtering
        const allPlaces = EXTRA_LOCATIONS.filter(l => 
            l.name.toLowerCase().includes(lowerQ) || l.type.toLowerCase().includes(lowerQ)
        );

        const allScholars = MOCK_LEADERBOARD.filter(u => 
            u.user.name.toLowerCase().includes(lowerQ) || u.user.handle.toLowerCase().includes(lowerQ)
        );

        const allHubs = [
            ...FIELDS.filter(f => f.type.toLowerCase().includes(lowerQ)),
            ...INITIAL_POSTS.filter(p => p.title.toLowerCase().includes(lowerQ))
        ];

        // Apply View Filter limit
        const limit = activeFilter === 'all' ? 3 : 20;

        return {
            places: (activeFilter === 'all' || activeFilter === 'places') ? allPlaces.slice(0, limit) : [],
            scholars: (activeFilter === 'all' || activeFilter === 'scholars') ? allScholars.slice(0, limit) : [],
            hubs: (activeFilter === 'all' || activeFilter === 'hubs') ? allHubs.slice(0, limit) : [],
        };
    }, [query, activeFilter]);

    const hasResults = results.places.length > 0 || results.scholars.length > 0 || results.hubs.length > 0;

    // --- NAVIGATION HANDLERS ---
    const handleNavigate = (path: string, state?: any) => {
        navigate(path, { state });
        onClose();
    };

    const handleTermClick = (term: string) => {
        setQuery(term);
    };

    const removeRecent = (term: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRecentSearches(prev => prev.filter(t => t !== term));
    };

    const filters: { id: FilterType; label: string; icon: string }[] = [
        { id: 'all', label: 'All Results', icon: 'manage_search' },
        { id: 'scholars', label: 'Scholars', icon: 'school' },
        { id: 'places', label: 'Places', icon: 'location_on' },
        { id: 'hubs', label: 'Knowledge Hubs', icon: 'category' }
    ];

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center pt-[15vh] p-4 animate-fade-in">
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-white/60 dark:bg-[#050608]/80 backdrop-blur-xl transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Window */}
            <div className="relative w-full max-w-2xl bg-white/90 dark:bg-[#0B0E14]/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-scale-up ring-1 ring-black/5 dark:ring-white/10">
                
                {/* Search Header */}
                <div className="flex flex-col border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center p-4 pb-2 gap-4">
                        <span className="material-symbols-outlined text-2xl text-gray-400 ml-2">search</span>
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search places, scholars, or topics..." 
                            className="flex-1 bg-transparent text-xl font-serif text-gray-900 dark:text-white placeholder-gray-400 outline-none h-12"
                            autoFocus
                        />
                        <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-500">
                            ESC
                        </div>
                    </div>

                    {/* Filters Bar (Only show if typed or always? Let's show always for quick access) */}
                    <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                    activeFilter === filter.id
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[16px] ${
                                    activeFilter === filter.id ? '' : 'text-gray-400'
                                }`}>
                                    {filter.icon}
                                </span>
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    
                    {/* EMPTY STATE: RECENTS & TRENDING */}
                    {!query && (
                        <div className="p-2 space-y-6">
                            
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                                        <span>Recent Searches</span>
                                        <button 
                                            onClick={() => setRecentSearches([])}
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {recentSearches.map((term, i) => (
                                            <div 
                                                key={i}
                                                onClick={() => handleTermClick(term)}
                                                className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 group-hover:text-[#2970FF] transition-colors">
                                                    <span className="material-symbols-outlined text-lg text-gray-400 group-hover:text-[#2970FF]">history</span>
                                                    <span className="text-sm font-medium">{term}</span>
                                                </div>
                                                <button 
                                                    onClick={(e) => removeRecent(term, e)}
                                                    className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trending Topics */}
                            <div>
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-purple-500">trending_up</span>
                                    Trending Now
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                                    {MOCK_TRENDING.map((trend, i) => (
                                        <div 
                                            key={i}
                                            onClick={() => handleTermClick(trend.label)}
                                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-purple-500 group-hover:bg-purple-500/10 transition-colors">
                                                <span className="material-symbols-outlined text-lg">tag</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">{trend.label}</div>
                                                <div className="text-[10px] text-gray-500">{trend.category}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {query && !hasResults && (
                        <div className="py-12 text-center">
                            <p className="text-gray-900 dark:text-white font-serif text-lg mb-2">No knowledge found.</p>
                            <button 
                                onClick={() => handleNavigate('/app/create', { reservation: { entity: query } })}
                                className="text-[#2970FF] hover:underline font-mono text-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">edit_square</span>
                                Would you like to Create a Post about this?
                            </button>
                        </div>
                    )}

                    {/* 1. PLACES GROUP */}
                    {results.places.length > 0 && (
                        <div className="mb-4">
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                Places
                            </div>
                            {results.places.map((place) => (
                                <div 
                                    key={place.id}
                                    onClick={() => handleNavigate('/app/map', { targetLocation: place })}
                                    className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-red-500 text-lg fill-current">location_on</span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-serif text-gray-900 dark:text-white group-hover:text-[#2970FF] transition-colors">
                                                <HighlightMatch text={place.name} query={query} />
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                                <span>{place.type}</span>
                                                <span className="text-gray-300 dark:text-gray-700">•</span>
                                                <span>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-[#2970FF] -rotate-45 transition-all opacity-0 group-hover:opacity-100">arrow_forward</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 2. SCHOLARS GROUP */}
                    {results.scholars.length > 0 && (
                        <div className="mb-4">
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Scholars</div>
                            {results.scholars.map((entry) => (
                                <div 
                                    key={entry.rank}
                                    onClick={() => handleNavigate('/app/u/elena')} // Mock link
                                    className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold font-mono">
                                            {entry.user.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-serif text-gray-900 dark:text-white">
                                                <HighlightMatch text={entry.user.name} query={query} />
                                            </h4>
                                            <div className="text-xs font-mono text-gray-500">
                                                <HighlightMatch text={entry.user.handle} query={query} /> • {entry.points} KS
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 3. KNOWLEDGE HUBS */}
                    {results.hubs.length > 0 && (
                        <div className="mb-2">
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Knowledge Hubs</div>
                            {results.hubs.map((item: any, idx) => {
                                const title = item.title || item.type; // Handle Posts or Fields
                                const isField = !!item.type;
                                
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => isField ? handleNavigate(`/app/discover/${item.type}`) : handleNavigate('/app/feed')} // Mock logic
                                        className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-blue-500 text-lg">
                                                    {isField ? 'category' : 'article'}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-serif text-gray-900 dark:text-white">
                                                    <HighlightMatch text={title} query={query} />
                                                </h4>
                                                <div className="text-xs font-mono text-gray-500">
                                                    {isField ? 'Topic Domain' : 'Article'}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-[#2970FF] transition-all opacity-0 group-hover:opacity-100">open_in_new</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 dark:bg-black/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <div className="flex gap-4">
                        <span><strong className="text-gray-700 dark:text-gray-300">↑↓</strong> Navigate</span>
                        <span><strong className="text-gray-700 dark:text-gray-300">↵</strong> Select</span>
                    </div>
                    <div>KnowledgeShare Protocol v3.1</div>
                </div>
            </div>
        </div>,
        document.body
    );
};
