
import React, { useEffect, useRef, useState, useMemo, useContext } from 'react';
import { Location, LocationType } from '../types';
import { ThemeContext } from '../App';

// Declare L for Leaflet as it's loaded via CDN
declare const L: any;

export type MapTypeMode = 'standard' | 'satellite' | 'terrain';
export type MapThemeMode = 'system' | 'light' | 'dark';

// Duplicate basic types for prop usage to avoid circular dependency issues in this setup
type SaveTag = 'TO_VISIT' | 'VISITED' | 'FAVORITE' | 'AVOID';
interface SavedLocationItem {
    location: Location;
    status: SaveTag;
}

interface KnowledgeMapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (location: Location) => void;
  destination?: Location | null; 
  onMenuClick?: () => void;
  // Settings
  mapType?: MapTypeMode;
  themeMode?: MapThemeMode; // Independent Theme Control
  showTraffic?: boolean; 
  show3D?: boolean;
  savedLocations?: SavedLocationItem[]; // NEW PROP
}

// --- CONFIGURATION ---

const TYPE_CONFIG: Record<LocationType, { color: string; icon: string; label: string }> = {
  store: { color: '#10B981', icon: 'store', label: 'Store' },
  bookstore: { color: '#8B5CF6', icon: 'menu_book', label: 'Bookstore' },
  coworking: { color: '#F59E0B', icon: 'hub', label: 'Coworking' },
  university: { color: '#EF4444', icon: 'school', label: 'University' },
  cafe: { color: '#3B82F6', icon: 'local_cafe', label: 'Cafe' },
  library: { color: '#EC4899', icon: 'local_library', label: 'Library' }
};

// Visual config for saved badges on map
const SAVE_BADGES: Record<SaveTag, { icon: string; color: string; bg: string; borderColor: string }> = {
    'FAVORITE': { icon: 'favorite', color: '#ffffff', bg: '#ef4444', borderColor: '#ffffff' }, // Red bg, White icon
    'TO_VISIT': { icon: 'flag', color: '#ffffff', bg: '#3b82f6', borderColor: '#ffffff' }, // Blue bg
    'VISITED': { icon: 'check', color: '#ffffff', bg: '#10b981', borderColor: '#ffffff' }, // Green bg
    'AVOID': { icon: 'do_not_disturb_on', color: '#ffffff', bg: '#6b7280', borderColor: '#ffffff' } // Gray bg
};

// Priority for clustering (Higher number = shows on top of cluster)
const STATUS_PRIORITY: Record<SaveTag, number> = {
    'FAVORITE': 4,
    'TO_VISIT': 3,
    'VISITED': 2,
    'AVOID': 1
};

// Map Layers
const LAYERS = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
};

// --- HELPER FUNCTIONS ---
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper to generate the large badge HTML
const getBadgeHtml = (status: SaveTag) => {
    const config = SAVE_BADGES[status];
    return `
        <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-30" 
             style="background-color: ${config.bg}; border: 2px solid ${config.borderColor}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
            <span class="material-symbols-outlined text-[14px]" 
                  style="color: ${config.color}; font-weight: 800; font-size: 14px;">
                ${config.icon}
            </span>
        </div>
    `;
};

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ 
    locations, 
    center = [10.870219615905674, 106.80366563953667], 
    zoom = 15, 
    onLocationSelect, 
    destination, 
    onMenuClick,
    mapType = 'standard',
    themeMode = 'system',
    showTraffic = false,
    show3D = false,
    savedLocations = []
}) => {
  const { isDark: globalIsDark } = useContext(ThemeContext);
  
  // Determine effective map theme (Independent of App Theme if set)
  const isMapDark = themeMode === 'system' ? globalIsDark : themeMode === 'dark';

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null); 
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // UI States
  const [filterMode, setFilterMode] = useState<'all' | 'places' | 'entities' | 'leisure'>('all');
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Route Info State
  const [routeInfo, setRouteInfo] = useState<{dist: string, time: string} | null>(null);

  // Mock User Location (HCMC - VNU Area)
  const userLocation: [number, number] = [10.870219615905674, 106.80366563953667];

  // Lookup map for fast saved status checking
  const savedStatusMap = useMemo(() => {
      const map = new Map<string, SaveTag>();
      savedLocations.forEach(item => map.set(item.location.id, item.status));
      return map;
  }, [savedLocations]);

  // --- SEARCH LOGIC ---
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lower = searchQuery.toLowerCase();
    // Filter logic: Match name or type, prioritise name startsWith
    return locations.filter(l => 
      l.name.toLowerCase().includes(lower) || 
      l.type.toLowerCase().includes(lower)
    ).sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(lower);
        const bStarts = b.name.toLowerCase().startsWith(lower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
    }).slice(0, 5);
  }, [searchQuery, locations]);

  const handleSearchSelect = (loc: Location) => {
      setSearchQuery(loc.name);
      setShowSuggestions(false);
      
      // Select location logic
      if (onLocationSelect) onLocationSelect(loc);
      
      // Fly to location
      if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { 
              duration: 1.5,
              easeLinearity: 0.25
          });
      }
  };

  const handleClearSearch = () => {
      setSearchQuery('');
      setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
              setShowSuggestions(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- CLUSTERING LOGIC ---
  const clusterLocations = (locs: Location[], distanceKm: number) => {
    const clusters: (Location | Location[])[] = [];
    const visited = new Set<string>();
    locs.forEach((loc) => {
      if (visited.has(loc.id)) return;
      const cluster = [loc];
      visited.add(loc.id);
      locs.forEach((neighbor) => {
        if (loc.id !== neighbor.id && !visited.has(neighbor.id)) {
          const dist = getDistanceFromLatLonInKm(loc.lat, loc.lng, neighbor.lat, neighbor.lng);
          if (dist < distanceKm) {
            cluster.push(neighbor);
            visited.add(neighbor.id);
          }
        }
      });
      if (cluster.length > 1) clusters.push(cluster);
      else clusters.push(loc);
    });
    return clusters;
  };

  const filteredLocations = useMemo(() => {
    if (filterMode === 'all') return locations;
    if (filterMode === 'places') return locations.filter(l => ['bookstore', 'university', 'library'].includes(l.type));
    if (filterMode === 'leisure') return locations.filter(l => ['cafe', 'store', 'coworking'].includes(l.type));
    return locations;
  }, [locations, filterMode]);

  const clusterDistance = useMemo(() => {
    if (currentZoom >= 16) return 0.05;
    if (currentZoom >= 15) return 0.2;
    if (currentZoom >= 14) return 0.8;
    return 3.0;
  }, [currentZoom]);

  const clusters = useMemo(() => {
    return clusterLocations(filteredLocations, clusterDistance);
  }, [filteredLocations, clusterDistance]);

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(center, zoom);

      mapInstanceRef.current.on('zoomend', () => setCurrentZoom(mapInstanceRef.current.getZoom()));
      mapInstanceRef.current.on('move', () => setHoveredLocation(null));
      mapInstanceRef.current.on('click', () => setHoveredLocation(null));

      // --- ADD USER LOCATION MARKER ---
      const userIconHtml = `
        <div class="relative flex items-center justify-center w-12 h-12">
          <!-- Pulsing Ring -->
          <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-30"></div>
          <!-- Outer Glow -->
          <div class="absolute w-6 h-6 bg-blue-500/40 rounded-full"></div>
          <!-- Inner Dot -->
          <div class="relative w-3.5 h-3.5 bg-[#2563eb] border-2 border-white rounded-full shadow-lg z-20"></div>
        </div>
      `;

      const userMarker = L.marker(userLocation, {
          icon: L.divIcon({ 
              className: 'user-marker', 
              html: userIconHtml, 
              iconSize: [48, 48], 
              iconAnchor: [24, 24] 
          }),
          zIndexOffset: 1000, // On top of everything
          interactive: true
      }).addTo(mapInstanceRef.current);

      userMarker.bindTooltip("You are here", {
          direction: 'top',
          offset: [0, -12],
          permanent: false,
          className: '!bg-black/90 !text-white !border-none !rounded-lg !px-2 !py-1 !text-[10px] !font-bold !shadow-xl'
      });
    }
  }, []);

  // --- TILE LAYER UPDATE (Standard vs Satellite vs Terrain) ---
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Clear existing tile layers
    mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer._url) mapInstanceRef.current.removeLayer(layer);
    });

    let url = LAYERS.light;
    
    if (mapType === 'satellite') url = LAYERS.satellite;
    else if (mapType === 'terrain') url = LAYERS.terrain;
    else if (isMapDark) url = LAYERS.dark; // Use Computed Map Theme

    L.tileLayer(url, { maxZoom: 20 }).addTo(mapInstanceRef.current);
  }, [isMapDark, mapType]);

  // --- DRAW ROUTE (Navigation Simulation) ---
  useEffect(() => {
      if (!mapInstanceRef.current) return;

      // Clear existing route
      if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
          setRouteInfo(null);
      }

      if (destination) {
          // Draw Line
          const latlngs = [userLocation, [destination.lat, destination.lng]];
          
          // Create dashed line for walking path
          const polyline = L.polyline(latlngs, {
              color: '#3B82F6', // Blue-500
              weight: 6,
              opacity: 0.8,
              dashArray: '10, 10', 
              lineCap: 'round'
          }).addTo(mapInstanceRef.current);
          
          routeLayerRef.current = polyline;

          // Fit bounds to show route
          mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });

          // Calculate Mock Distance
          const dist = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], destination.lat, destination.lng);
          const time = Math.round(dist * 12); // Assume 12 min per km walking
          setRouteInfo({ dist: `${dist.toFixed(1)} km`, time: `${time} min` });
      }
  }, [destination]);

  // --- RENDER MARKERS ---
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
    markersRef.current = [];

    clusters.forEach((item) => {
      let marker;
      
      if (Array.isArray(item)) {
        // CLUSTER LOGIC
        const centerLat = item.reduce((acc, curr) => acc + curr.lat, 0) / item.length;
        const centerLng = item.reduce((acc, curr) => acc + curr.lng, 0) / item.length;
        const count = item.length;
        
        // ** CLUSTER PRIORITY CHECK **
        // Check if any item in the cluster is saved, and find the highest priority one.
        let topStatus: SaveTag | null = null;
        let topPriority = 0;

        item.forEach(loc => {
            const status = savedStatusMap.get(loc.id);
            if (status) {
                const priority = STATUS_PRIORITY[status];
                if (priority > topPriority) {
                    topPriority = priority;
                    topStatus = status;
                }
            }
        });

        const clusterBadgeHtml = topStatus ? getBadgeHtml(topStatus) : '';

        // Cluster style changes based on map theme for contrast
        const clusterHtml = `
          <div class="relative group flex items-center justify-center">
            ${clusterBadgeHtml}
            <div class="flex items-center justify-center w-10 h-10 rounded-full font-mono font-bold text-sm shadow-xl border border-white/20 backdrop-blur-md transform transition-transform hover:scale-110 cursor-pointer ${isMapDark ? 'bg-white text-black' : 'bg-black/80 text-white'} z-10">
              ${count}
            </div>
            <!-- Tooltip -->
            <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none">
                <div class="bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap border border-white/10">
                    ${count} Locations
                </div>
                <!-- Arrow -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-black/90"></div>
            </div>
          </div>
        `;

        marker = L.marker([centerLat, centerLng], {
          icon: L.divIcon({ className: 'custom-cluster-icon', html: clusterHtml, iconSize: [40, 40], iconAnchor: [20, 20] })
        });
        marker.on('click', () => mapInstanceRef.current.flyTo([centerLat, centerLng], currentZoom + 2));

      } else {
        // SINGLE PIN
        const loc = item as Location;
        const config = TYPE_CONFIG[loc.type];
        
        // Check if saved
        const savedStatus = savedStatusMap.get(loc.id);
        const badgeHtml = savedStatus ? getBadgeHtml(savedStatus) : '';

        // Smart Pin Design - Adaptive Colors based on isMapDark
        const pinHtml = `
          <div class="relative group">
             ${badgeHtml}
             ${loc.hasNewActivity ? `<div class="absolute -inset-3 rounded-full ${isMapDark ? 'bg-purple-500' : 'bg-blue-500'} opacity-30 animate-ping"></div>` : ''}
             <div class="relative flex items-center justify-center w-9 h-9 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer ${isMapDark ? 'bg-[#1E1E1E] border-gray-700' : 'bg-white border-gray-200'} border">
                <span class="material-symbols-outlined text-lg" style="color: ${config.color}">${config.icon}</span>
             </div>
             <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black/50 rounded-full blur-[1px]"></div>
          </div>
        `;

        marker = L.marker([loc.lat, loc.lng], {
          icon: L.divIcon({ className: 'smart-pin-icon', html: pinHtml, iconSize: [36, 36], iconAnchor: [18, 36] })
        });

        marker.on('click', () => {
            if (onLocationSelect) onLocationSelect(loc);
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 });
        });

        marker.on('mouseover', (e: any) => {
            const point = mapInstanceRef.current.latLngToContainerPoint(e.latlng);
            setHoverPosition({ x: point.x, y: point.y });
            setHoveredLocation(loc);
        });
      }

      if (marker) {
        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      }
    });
  }, [clusters, currentZoom, isMapDark, mapType, savedStatusMap]); // Dependency on savedStatusMap ensures re-render on save change

  // --- DYNAMIC UI CLASSES (INDEPENDENT OF GLOBAL THEME) ---
  const uiCardClass = isMapDark ? 'bg-[#1A1D24] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800';
  const uiInputClass = isMapDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-500';
  const uiButtonHover = isMapDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const uiDividerClass = isMapDark ? 'bg-gray-700' : 'bg-gray-300';
  const uiTooltipClass = isMapDark ? 'bg-[#1A1D24] text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200';

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-3xl ${isMapDark ? 'bg-[#0B0E14]' : 'bg-gray-100'}`}>
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* --- UI ELEMENTS (Styled explicitly) --- */}
      
      {/* 1. TOP LEFT: SEARCH CARD WITH SUGGESTIONS */}
      <div className="absolute top-4 left-4 z-[400] w-full max-w-sm flex flex-col gap-3" ref={searchContainerRef}>
          <div className={`${uiCardClass} rounded-lg shadow-xl border flex items-center p-2 gap-2 transition-colors relative z-[401]`}>
              <button 
                onClick={onMenuClick}
                className={`p-2 text-gray-500 ${uiButtonHover} rounded-full transition-colors relative`}
                title="Menu"
              >
                  <span className="material-symbols-outlined">menu</span>
              </button>
              
              <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search knowledge hubs..." 
                  className={`flex-1 bg-transparent outline-none text-sm font-sans h-full ${uiInputClass}`}
              />

              {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className={`p-1 rounded-full ${isMapDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                  >
                      <span className="material-symbols-outlined text-sm">close</span>
                  </button>
              )}

              <div className={`w-px h-6 mx-1 ${uiDividerClass}`}></div>
              <button className={`p-2 text-blue-500 ${isMapDark ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'} rounded-full transition-colors`}>
                  <span className="material-symbols-outlined">search</span>
              </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && searchQuery && (
              <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl overflow-hidden border transition-all animate-fade-in z-[400] ${isMapDark ? 'bg-[#1A1D24] border-gray-700' : 'bg-white border-gray-200'}`}>
                  {searchResults.length > 0 ? (
                      <div className="py-1">
                          {searchResults.map((loc) => {
                              const config = TYPE_CONFIG[loc.type];
                              return (
                                  <button
                                      key={loc.id}
                                      onClick={() => handleSearchSelect(loc)}
                                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isMapDark ? 'hover:bg-white/5 border-b border-gray-700 last:border-0' : 'hover:bg-gray-50 border-b border-gray-100 last:border-0'}`}
                                  >
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMapDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                          <span className="material-symbols-outlined text-sm" style={{ color: config.color }}>{config.icon}</span>
                                      </div>
                                      <div>
                                          <div className={`text-sm font-bold ${isMapDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                              {/* Simple Highlight Logic can be added here if needed */}
                                              {loc.name}
                                          </div>
                                          <div className={`text-xs ${isMapDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                              {loc.type} • {loc.reviewsCount || 0} KV
                                          </div>
                                      </div>
                                  </button>
                              );
                          })}
                      </div>
                  ) : (
                      <div className={`p-4 text-center text-xs ${isMapDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          No locations found.
                      </div>
                  )}
              </div>
          )}

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar relative z-[399]">
              {['All', 'Places', 'Entities', 'Leisure'].map((filter) => (
                  <button
                      key={filter}
                      onClick={() => setFilterMode(filter.toLowerCase() as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all whitespace-nowrap ${
                          filterMode === filter.toLowerCase() 
                          ? (isMapDark ? 'bg-white text-black border-transparent' : 'bg-black text-white border-transparent')
                          : (isMapDark ? 'bg-[#1A1D24] text-gray-300 border-gray-700 hover:bg-gray-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')
                      }`}
                  >
                      {filter}
                  </button>
              ))}
          </div>

          {/* ROUTE INFO CARD */}
          {routeInfo && (
              <div className="bg-blue-600 text-white rounded-xl shadow-xl p-4 flex items-center justify-between animate-fade-in-up">
                  <div>
                      <div className="text-2xl font-bold">{routeInfo.time}</div>
                      <div className="text-xs opacity-90 font-medium">({routeInfo.dist}) • Best route</div>
                  </div>
                  <button 
                    onClick={() => {
                        if (routeLayerRef.current && mapInstanceRef.current) {
                            mapInstanceRef.current.removeLayer(routeLayerRef.current);
                            routeLayerRef.current = null;
                            setRouteInfo(null);
                        }
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  >
                      <span className="material-symbols-outlined text-sm">close</span>
                  </button>
              </div>
          )}
      </div>

      {/* 2. BOTTOM RIGHT: CONTROLS */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
          <button 
            onClick={() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize(); 
                    mapInstanceRef.current.setView(userLocation, 16, { animate: true, duration: 1.5 });
                }
            }}
            className={`w-10 h-10 ${uiCardClass} rounded-full shadow-lg flex items-center justify-center text-blue-600 ${uiButtonHover} transition-colors group`}
            title="My Location"
          >
              <span className="material-symbols-outlined text-xl group-active:scale-90 transition-transform">my_location</span>
          </button>

          <div className={`${uiCardClass} rounded-lg shadow-lg flex flex-col divide-y ${isMapDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <button 
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className={`w-10 h-10 flex items-center justify-center ${isMapDark ? 'text-gray-300' : 'text-gray-600'} ${uiButtonHover} transition-colors`}
              >
                  <span className="material-symbols-outlined text-xl">add</span>
              </button>
              <button 
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className={`w-10 h-10 flex items-center justify-center ${isMapDark ? 'text-gray-300' : 'text-gray-600'} ${uiButtonHover} transition-colors`}
              >
                  <span className="material-symbols-outlined text-xl">remove</span>
              </button>
          </div>
      </div>

      {/* HOVER TOOLTIP */}
      {hoveredLocation && hoverPosition && (
          <div 
            className="absolute z-[1000] w-auto pointer-events-none transform -translate-x-1/2 -translate-y-full pb-4 transition-opacity duration-200"
            style={{ left: hoverPosition.x, top: hoverPosition.y - 10 }}
          >
              <div className={`${uiTooltipClass} text-xs font-bold px-3 py-1.5 rounded shadow-xl border whitespace-nowrap`}>
                  {hoveredLocation.name}
              </div>
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 ${uiTooltipClass} border-r border-b transform rotate-45 mb-2.5`}></div>
          </div>
      )}

    </div>
  );
};
