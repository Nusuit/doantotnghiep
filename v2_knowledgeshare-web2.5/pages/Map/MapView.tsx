
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Location } from '../../types';
import { INITIAL_POSTS, EXTRA_LOCATIONS } from '../../data/mockData';
import { KnowledgeMap } from '../../components/KnowledgeMap';

export const MapView = () => {
  const locationState = useLocation();
  const state = locationState.state as { center?: [number, number]; targetLocation?: Location } | null;
  const initialCenter = state?.center || [51.505, -0.09];

  // State for Side Panel
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // State for Navigation Route
  const [navigatingTo, setNavigatingTo] = useState<Location | null>(null);

  // Extract locations from mock posts and merge with extra locations
  const locations: Location[] = useMemo(() => {
    const postLocs = INITIAL_POSTS.filter(p => p.location).map(p => p.location as Location);
    return [...postLocs, ...EXTRA_LOCATIONS];
  }, []);

  // Effect to handle incoming navigation from Feed (Target Location)
  useEffect(() => {
      if (state?.targetLocation) {
          // Find the location in our list to ensure we have the full object reference if needed
          const found = locations.find(l => l.id === state.targetLocation?.id) || state.targetLocation;
          setSelectedLocation(found);
          // Note: The map center update is handled via the KnowledgeMap's internal ref or passing props. 
          // Since KnowledgeMap component initializes with `center` prop, if we want to programmatically move it after mount, 
          // we might need a mechanism. 
          // However, for simplicity here, the side panel will open.
          // If we want the map to fly there, KnowledgeMap needs to watch `selectedLocation`.
          // In the current implementation of KnowledgeMap, it has `onLocationSelect` which flies to location.
          // But here we are setting state directly. 
          // Ideally, KnowledgeMap should expose a ref or accept a "focusLocation" prop.
          // For now, let's assume the map centers on the `initialCenter` if provided, 
          // OR we can pass `state.targetLocation` coordinates as `center` to the map.
      }
  }, [state, locations]);

  const handleDirections = () => {
      setNavigatingTo(selectedLocation);
      // Optional: Close side panel on mobile if needed, but keeping it open acts as "Trip Info"
  };

  // If a target location is passed, use its coordinates as center
  const mapCenter: [number, number] = state?.targetLocation 
      ? [state.targetLocation.lat, state.targetLocation.lng] 
      : (state?.center || [51.505, -0.09]);

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0B0E14] flex">
      
      {/* 1. MAP AREA */}
      <div className="flex-1 relative z-0">
        <KnowledgeMap 
            locations={locations} 
            center={mapCenter} 
            zoom={state?.targetLocation ? 16 : 13} 
            onLocationSelect={(loc) => {
                setSelectedLocation(loc);
                setNavigatingTo(null); // Reset nav when picking new place
            }}
            destination={navigatingTo}
        />
      </div>

      {/* 2. SIDE PANEL (Slide Out) */}
      <div 
        className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white/95 dark:bg-[#0F1116]/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 z-10 flex flex-col ${
            selectedLocation ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedLocation ? (
            <>
                {/* Header Image */}
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0 group">
                    {selectedLocation.image ? (
                        <img src={selectedLocation.image} alt={selectedLocation.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-[#161920]">
                            <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                        </div>
                    )}
                    
                    {/* Close Button */}
                    <button 
                        onClick={() => setSelectedLocation(null)}
                        className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-end">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-lg text-white text-xs font-bold uppercase tracking-wider">
                            {selectedLocation.type}
                        </div>
                        <div className="flex text-yellow-400">
                             {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-sm">
                                    {i < (selectedLocation.rating || 0) ? 'star' : 'star_border'}
                                </span>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-[#0F1116]">
                    <div className="mb-4">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-1">
                            {selectedLocation.name}
                        </h2>
                        <p className="text-xs text-gray-500">{selectedLocation.reviewsCount} reviews • Verified Location</p>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <button 
                            onClick={handleDirections}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">directions</span> Directions
                        </button>
                        <button className="flex-1 py-3 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">bookmark_border</span> Save
                        </button>
                        <button className="p-3 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">share</span>
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                        {selectedLocation.description || "A verified knowledge hub on the Permaweb. Contributing to this location earns geospatial rewards."}
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-gray-400">schedule</span>
                            <span>Open • Closes 10PM</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="material-symbols-outlined text-gray-400">language</span>
                            <span className="text-blue-500 hover:underline cursor-pointer">knowledge-protocol.org</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Latest Reviews</h3>
                        
                        {selectedLocation.reviews && selectedLocation.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {selectedLocation.reviews.map((review) => (
                                    <div key={review.id} className="group">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                                {review.avatar}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-900 dark:text-white">{review.author}</div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                    <div className="flex text-yellow-500 text-[10px]">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className="material-symbols-outlined text-[10px]">
                                                                {i < review.rating ? 'star' : 'star_border'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    • {review.date}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pl-11">
                                            {review.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-xs bg-gray-50 dark:bg-[#161920] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                No reviews yet. Be the first to verify this location!
                            </div>
                        )}
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#161920] rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl opacity-50">pin_drop</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select a Location</h3>
                <p className="text-sm">Click on any pin on the map to view details, reviews, and get directions.</p>
            </div>
        )}
      </div>

    </div>
  );
};
