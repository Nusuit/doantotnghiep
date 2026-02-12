
import React, { useMemo, useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Location } from '../../types';
import { INITIAL_POSTS, EXTRA_LOCATIONS, MOCK_COMMENTS, Comment } from '../../data/mockData';
import { KnowledgeMap, MapTypeMode, MapThemeMode } from '../../components/KnowledgeMap';
import { ThemeContext } from '../../App';

// --- SAVE TAG CONFIGURATION ---
type SaveTag = 'TO_VISIT' | 'VISITED' | 'FAVORITE' | 'AVOID';

interface SavedLocationItem {
    location: Location;
    status: SaveTag;
    savedAt: number;
}

const SAVE_OPTIONS: Record<SaveTag, { label: string; icon: string; color: string; bgColor: string }> = {
    'TO_VISIT': { label: 'To Visit', icon: 'flag', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    'VISITED': { label: 'Visited', icon: 'check_circle', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    'FAVORITE': { label: 'My Favorite', icon: 'favorite', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    'AVOID': { label: 'Avoid', icon: 'do_not_disturb_on', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' }
};

export const MapView = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { isDark } = useContext(ThemeContext);
  
  const state = locationState.state as { center?: [number, number]; targetLocation?: Location } | null;
  const initialCenter = state?.center || [10.870219615905674, 106.80366563953667];

  // State for Side Panel
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // State for Navigation Route
  const [navigatingTo, setNavigatingTo] = useState<Location | null>(null);

  // --- DRAWER & LIST STATES ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'main' | 'saved' | 'recents' | 'settings'>('main');
  
  // UPDATED: Saved Locations State
  const [savedLocations, setSavedLocations] = useState<SavedLocationItem[]>([]);
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);

  // --- MAP SETTINGS STATES ---
  const [mapType, setMapType] = useState<MapTypeMode>('standard');
  const [mapThemeMode, setMapThemeMode] = useState<MapThemeMode>('system'); 
  const [mapDetails, setMapDetails] = useState({
      traffic: false,
      transit: false,
      cycling: false,
      buildings3d: false
  });

  // UI State for Save Dropdown
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  // Close save menu when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node)) {
              setShowSaveMenu(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-populate recents for demo
  useEffect(() => {
      setRecentLocations([EXTRA_LOCATIONS[0], EXTRA_LOCATIONS[2]]);
  }, []);

  // Extract locations from mock posts and merge with extra locations
  const locations: Location[] = useMemo(() => {
    const postLocs = INITIAL_POSTS.filter(p => p.location).map(p => p.location as Location);
    return [...postLocs, ...EXTRA_LOCATIONS];
  }, []);

  // Helper for initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Logic to handle location selection
  const handleLocationSelect = (loc: Location) => {
      setSelectedLocation(loc);
      setNavigatingTo(null);
      setIsDrawerOpen(false); 
      setShowSaveMenu(false);
      
      // Add to Recents (Deduplicate)
      setRecentLocations(prev => {
          const filtered = prev.filter(l => l.id !== loc.id);
          return [loc, ...filtered].slice(0, 10); 
      });
  };

  // Check if currently selected location is saved and get its status
  const currentSavedStatus = useMemo(() => {
      if (!selectedLocation) return null;
      const savedItem = savedLocations.find(item => item.location.id === selectedLocation.id);
      return savedItem ? savedItem.status : null;
  }, [selectedLocation, savedLocations]);

  // Handle Save Action
  const handleSaveAction = (status: SaveTag) => {
      if (!selectedLocation) return;
      
      // Check if already saved with this status -> Remove it (Toggle off)
      if (currentSavedStatus === status) {
          setSavedLocations(prev => prev.filter(item => item.location.id !== selectedLocation.id));
      } else {
          // Add or Update
          setSavedLocations(prev => {
              const others = prev.filter(item => item.location.id !== selectedLocation.id);
              return [{ location: selectedLocation, status, savedAt: Date.now() }, ...others];
          });
      }
      setShowSaveMenu(false);
  };

  useEffect(() => {
      if (state?.targetLocation) {
          const found = locations.find(l => l.id === state.targetLocation?.id) || state.targetLocation;
          handleLocationSelect(found);
      }
  }, [state, locations]);

  const handleDirections = () => {
      setNavigatingTo(selectedLocation);
  };

  const relatedPost = useMemo(() => {
      if (!selectedLocation) return null;
      return INITIAL_POSTS.find(p => p.location?.id === selectedLocation.id);
  }, [selectedLocation]);

  const displayComments: any[] = useMemo(() => {
      if (!selectedLocation) return [];
      if (relatedPost) {
          return MOCK_COMMENTS[relatedPost.id] || [];
      }
      return (selectedLocation.reviews || []).map(r => ({
          id: r.id,
          author: r.author,
          authorLevel: Math.floor(Math.random() * 50) + 10,
          text: r.text,
          likes: Math.floor(Math.random() * 20),
          timestamp: r.date
      }));
  }, [selectedLocation, relatedPost]);

  const mapCenter: [number, number] = state?.targetLocation 
      ? [state.targetLocation.lat, state.targetLocation.lng] 
      : (state?.center || [10.870219615905674, 106.80366563953667]);

  // --- DRAWER CONTENT RENDERER ---
  const renderDrawerContent = () => {
      if (activeDrawerTab === 'main') {
          return (
              <div className="p-4 space-y-2">
                  <button 
                    onClick={() => setActiveDrawerTab('saved')}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                      <span className="material-symbols-outlined text-blue-500">bookmark</span>
                      <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">Saved Places</div>
                          <div className="text-xs text-gray-500">{savedLocations.length} locations</div>
                      </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveDrawerTab('recents')}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                      <span className="material-symbols-outlined text-gray-500">history</span>
                      <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">Recent History</div>
                          <div className="text-xs text-gray-500">{recentLocations.length} viewed</div>
                      </div>
                  </button>

                  <button className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left">
                      <span className="material-symbols-outlined text-gray-500">rate_review</span>
                      <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">Your Contributions</div>
                          <div className="text-xs text-gray-500">Manage reviews & edits</div>
                      </div>
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <button 
                    onClick={() => setActiveDrawerTab('settings')}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                  >
                      <span className="material-symbols-outlined text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">layers</span>
                      <div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Map Settings</div>
                          <div className="text-xs text-gray-500">Type, Layers, 3D</div>
                      </div>
                  </button>
              </div>
          );
      }

      // SETTINGS PANEL
      if (activeDrawerTab === 'settings') {
          return (
              <div className="flex flex-col h-full bg-white dark:bg-[#0F1116]">
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
                      <button onClick={() => setActiveDrawerTab('main')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                          <span className="material-symbols-outlined">arrow_back</span>
                      </button>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Map details</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                      {/* ... existing settings content ... */}
                      
                      {/* 1. Map Type Grid */}
                      <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Map Type</h4>
                          <div className="grid grid-cols-3 gap-3">
                              {/* Standard */}
                              <button 
                                onClick={() => setMapType('standard')}
                                className={`flex flex-col items-center gap-2 group ${mapType === 'standard' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                              >
                                  <div className={`w-full aspect-square rounded-xl border-2 overflow-hidden relative shadow-sm ${mapType === 'standard' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                      <img src="https://a.basemaps.cartocdn.com/rastertiles/voyager/10/520/350.png" alt="Standard" className="w-full h-full object-cover" />
                                  </div>
                                  <span className={`text-xs font-medium ${mapType === 'standard' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>Default</span>
                              </button>

                              {/* Satellite */}
                              <button 
                                onClick={() => setMapType('satellite')}
                                className={`flex flex-col items-center gap-2 group ${mapType === 'satellite' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                              >
                                  <div className={`w-full aspect-square rounded-xl border-2 overflow-hidden relative shadow-sm ${mapType === 'satellite' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                      <img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/350/520" alt="Satellite" className="w-full h-full object-cover" />
                                  </div>
                                  <span className={`text-xs font-medium ${mapType === 'satellite' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>Satellite</span>
                              </button>

                              {/* Terrain */}
                              <button 
                                onClick={() => setMapType('terrain')}
                                className={`flex flex-col items-center gap-2 group ${mapType === 'terrain' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                              >
                                  <div className={`w-full aspect-square rounded-xl border-2 overflow-hidden relative shadow-sm ${mapType === 'terrain' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                      <img src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/10/350/520" alt="Terrain" className="w-full h-full object-cover" />
                                  </div>
                                  <span className={`text-xs font-medium ${mapType === 'terrain' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>Terrain</span>
                              </button>
                          </div>
                      </div>

                      <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

                      {/* 2. Map Details List */}
                      <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Map details</h4>
                          <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                      <span className="material-symbols-outlined text-gray-400">traffic</span>
                                      <span className="text-sm font-medium">Traffic</span>
                                  </div>
                                  <button 
                                    onClick={() => setMapDetails(prev => ({ ...prev, traffic: !prev.traffic }))}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${mapDetails.traffic ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${mapDetails.traffic ? 'left-6' : 'left-1'}`}></div>
                                  </button>
                              </div>

                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                      <span className="material-symbols-outlined text-gray-400">directions_bus</span>
                                      <span className="text-sm font-medium">Public Transport</span>
                                  </div>
                                  <button 
                                    onClick={() => setMapDetails(prev => ({ ...prev, transit: !prev.transit }))}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${mapDetails.transit ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${mapDetails.transit ? 'left-6' : 'left-1'}`}></div>
                                  </button>
                              </div>

                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                      <span className="material-symbols-outlined text-gray-400">pedal_bike</span>
                                      <span className="text-sm font-medium">Bicycling</span>
                                  </div>
                                  <button 
                                    onClick={() => setMapDetails(prev => ({ ...prev, cycling: !prev.cycling }))}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${mapDetails.cycling ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${mapDetails.cycling ? 'left-6' : 'left-1'}`}></div>
                                  </button>
                              </div>

                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                                      <span className="material-symbols-outlined text-gray-400">view_in_ar</span>
                                      <span className="text-sm font-medium">3D Buildings</span>
                                  </div>
                                  <button 
                                    onClick={() => setMapDetails(prev => ({ ...prev, buildings3d: !prev.buildings3d }))}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${mapDetails.buildings3d ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${mapDetails.buildings3d ? 'left-6' : 'left-1'}`}></div>
                                  </button>
                              </div>
                          </div>
                      </div>

                      <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

                      {/* 3. Theme Toggle (Local Map Theme) */}
                      <div>
                          <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Map Theme</h4>
                              <span className="text-[10px] text-gray-400">Independent</span>
                          </div>
                          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                              {(['system', 'light', 'dark'] as const).map((mode) => (
                                  <button
                                      key={mode}
                                      onClick={() => setMapThemeMode(mode)}
                                      className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                                          mapThemeMode === mode 
                                          ? 'bg-white dark:bg-gray-600 text-black dark:text-white shadow-sm' 
                                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                      }`}
                                  >
                                      {mode}
                                  </button>
                              ))}
                          </div>
                      </div>

                  </div>
              </div>
          );
      }

      // SUB-LIST VIEW (Saved or Recents)
      const listTitle = activeDrawerTab === 'saved' ? 'Saved Places' : 'Recent History';
      const emptyMsg = activeDrawerTab === 'saved' ? 'No saved places yet.' : 'No recent history.';

      return (
          <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
                  <button onClick={() => setActiveDrawerTab('main')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-gray-500">arrow_back</span>
                  </button>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{listTitle}</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {/* RENDER SAVED LIST WITH TAGS (GROUPED) */}
                  {activeDrawerTab === 'saved' ? (
                      savedLocations.length > 0 ? (
                          <div className="space-y-6 pt-2">
                              {Object.keys(SAVE_OPTIONS).map((tagKey) => {
                                  const tag = tagKey as SaveTag;
                                  const items = savedLocations.filter(item => item.status === tag);
                                  const tagConfig = SAVE_OPTIONS[tag];
                                  
                                  if (items.length === 0) return null;

                                  return (
                                      <div key={tag} className="animate-fade-in">
                                          {/* Section Header */}
                                          <div className="flex items-center gap-2 px-4 mb-3">
                                              <span className={`material-symbols-outlined text-sm ${tagConfig.color}`}>{tagConfig.icon}</span>
                                              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{tagConfig.label}</h4>
                                              <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{items.length}</span>
                                          </div>
                                          
                                          {/* Items Grid */}
                                          <div className="space-y-1">
                                              {items.map(item => (
                                                  <button 
                                                    key={item.location.id}
                                                    onClick={() => handleLocationSelect(item.location)}
                                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group mx-1"
                                                  >
                                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 border border-gray-200 dark:border-gray-700`}>
                                                          <span className="material-symbols-outlined text-gray-500 text-sm">
                                                              {item.location.type === 'cafe' ? 'local_cafe' : item.location.type === 'library' ? 'local_library' : 'place'}
                                                          </span>
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">{item.location.name}</div>
                                                          <div className="text-[10px] text-gray-500">{item.location.type} • {item.location.reviewsCount} KV</div>
                                                      </div>
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      ) : (
                          <div className="text-center py-10 text-gray-400 text-sm">{emptyMsg}</div>
                      )
                  ) : (
                      /* RENDER RECENTS (Unchanged Logic) */
                      recentLocations.length > 0 ? (
                          recentLocations.map(loc => (
                              <button 
                                key={loc.id}
                                onClick={() => handleLocationSelect(loc)}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                              >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 border border-gray-200 dark:border-gray-700`}>
                                      <span className="material-symbols-outlined text-gray-500 text-lg">schedule</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{loc.name}</div>
                                      <div className="text-xs text-gray-500">{loc.type} • {loc.reviewsCount} KV</div>
                                  </div>
                              </button>
                          ))
                      ) : (
                          <div className="text-center py-10 text-gray-400 text-sm">{emptyMsg}</div>
                      )
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0B0E14] flex">
      
      {/* 1. MAP AREA */}
      <div className="flex-1 relative z-0">
        <KnowledgeMap 
            locations={locations} 
            center={mapCenter} 
            zoom={state?.targetLocation ? 16 : 13} 
            onLocationSelect={handleLocationSelect}
            destination={navigatingTo}
            onMenuClick={() => setIsDrawerOpen(true)}
            // Pass Settings Props
            mapType={mapType}
            themeMode={mapThemeMode} // Pass theme setting
            showTraffic={mapDetails.traffic}
            show3D={mapDetails.buildings3d}
            savedLocations={savedLocations} // NEW: Pass Saved Locations for visual markers
        />
      </div>

      {/* 2. LEFT DRAWER (Google Maps Style Menu) */}
      <div 
        className={`absolute top-0 left-0 h-full w-80 bg-white dark:bg-[#0F1116] z-20 shadow-2xl transform transition-transform duration-300 ease-out border-r border-gray-200 dark:border-gray-800 flex flex-col ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
          {/* Drawer Header */}
          <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">KS</div>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Knowledge Map</span>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
              </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderDrawerContent()}
          </div>

          <div className="p-4 text-center text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-800">
              KnowledgeShare Protocol v3.2
          </div>
      </div>

      {/* 2. SIDE PANEL (Slide Out) - REDESIGNED */}
      <div 
        className={`absolute top-0 right-0 h-full w-full sm:w-[450px] bg-white/95 dark:bg-[#0F1116]/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 z-10 flex flex-col ${
            selectedLocation ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedLocation ? (
            <div className="flex flex-col h-full">
                
                {/* A. HEADER (Clean, No Image) */}
                <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#0F1116]/50 backdrop-blur-sm relative">
                    <button 
                        onClick={() => setSelectedLocation(null)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-200 dark:border-blue-500/30">
                            {selectedLocation.type}
                        </span>
                        <div className="flex text-yellow-400 text-sm">
                             {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[14px]">
                                    {i < (selectedLocation.rating || 0) ? 'star' : 'star_border'}
                                </span>
                             ))}
                        </div>
                    </div>

                    <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white leading-tight mb-4 pr-8">
                        {selectedLocation.name}
                    </h2>

                    {/* ACTION BUTTONS (UPDATED SAVE BUTTON) */}
                    <div className="flex gap-3">
                        <button 
                            onClick={handleDirections}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">directions</span> Directions
                        </button>
                        
                        <div className="relative flex-1" ref={saveMenuRef}>
                            <button 
                                onClick={() => setShowSaveMenu(!showSaveMenu)}
                                className={`w-full h-full py-2.5 border rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group ${
                                    currentSavedStatus 
                                    ? `${SAVE_OPTIONS[currentSavedStatus].bgColor} ${SAVE_OPTIONS[currentSavedStatus].color} border-transparent`
                                    : 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-200'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${currentSavedStatus ? 'fill-current' : ''}`}>
                                    {currentSavedStatus ? SAVE_OPTIONS[currentSavedStatus].icon : 'bookmark_border'}
                                </span> 
                                {currentSavedStatus ? SAVE_OPTIONS[currentSavedStatus].label : 'Save'}
                            </button>

                            {/* Dropdown Menu */}
                            {showSaveMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in-up origin-top-right">
                                    <div className="p-1 space-y-1">
                                        {(Object.keys(SAVE_OPTIONS) as SaveTag[]).map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => handleSaveAction(tag)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                                    currentSavedStatus === tag 
                                                    ? 'bg-gray-100 dark:bg-white/10 font-bold' 
                                                    : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined text-lg ${SAVE_OPTIONS[tag].color}`}>
                                                    {SAVE_OPTIONS[tag].icon}
                                                </span>
                                                <span className={currentSavedStatus === tag ? 'text-gray-900 dark:text-white' : ''}>
                                                    {SAVE_OPTIONS[tag].label}
                                                </span>
                                                {currentSavedStatus === tag && (
                                                    <span className="material-symbols-outlined text-sm ml-auto text-blue-500">check</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* B. SCROLLABLE CONTENT (Feed Style) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50 dark:bg-[#0B0E14]/30">
                    
                    {/* 1. Main Post / Description Card */}
                    <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm mb-6">
                        
                        {/* Author Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold font-mono tracking-wider overflow-hidden">
                                {relatedPost ? (
                                    <img src={relatedPost.author.avatar || `https://i.pravatar.cc/150?u=${relatedPost.author.name}`} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="bg-gradient-to-br from-gray-700 to-black w-full h-full flex items-center justify-center text-white">KP</div>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                    {relatedPost ? relatedPost.author.name : "Knowledge Protocol"}
                                    {relatedPost?.author.isGold && <span className="material-symbols-outlined text-yellow-500 text-[14px]">verified</span>}
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono">
                                    {relatedPost ? relatedPost.timestamp : "Official Record"} • Verified Location
                                </div>
                            </div>
                        </div>

                        {/* Title & Content */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                            {relatedPost ? relatedPost.title : `About ${selectedLocation.name}`}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-sans mb-4 whitespace-pre-wrap">
                            {relatedPost ? relatedPost.content : (selectedLocation.description || "A verified knowledge hub on the Permaweb. Contributing to this location earns geospatial rewards.")}
                        </p>

                        {/* Metadata Tags */}
                        <div className="flex flex-wrap gap-2">
                            {(relatedPost?.tags || [selectedLocation.type, 'HCMC']).map(tag => (
                                <span key={tag} className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* 2. Featured Comments Section */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
                            <span className="material-symbols-outlined text-sm">forum</span>
                            Featured Comments
                        </h4>
                        
                        <div className="space-y-3">
                            {displayComments.slice(0, 2).map((comment: any) => (
                                <div key={comment.id} className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                            {getInitials(comment.author)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.author}</span>
                                                <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {comment.text}
                                            </p>
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-bold group cursor-pointer hover:text-blue-500 transition-colors">
                                                <span className="material-symbols-outlined text-[12px]">thumb_up</span>
                                                {comment.likes}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {displayComments.length === 0 && (
                                <div className="text-center py-6 text-gray-400 text-xs italic">
                                    No discussions yet. Be the first to verify.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* C. FOOTER (Navigation Action) */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1116] z-10">
                    <button 
                        onClick={() => navigate('/app/feed')}
                        className="w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                    >
                        View Full Discussion <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </div>

            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-white/50 dark:bg-[#0B0E14]/50 backdrop-blur-sm h-full border-l border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#161920] rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <span className="material-symbols-outlined text-3xl opacity-50">pin_drop</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select a Location</h3>
                <p className="text-sm max-w-xs leading-relaxed">Click on any pin on the map to view verified knowledge, reviews, and directions.</p>
            </div>
        )}
      </div>

    </div>
  );
};
