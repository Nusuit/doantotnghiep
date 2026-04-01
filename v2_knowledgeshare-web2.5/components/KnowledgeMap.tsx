
import React, { useEffect, useRef, useState, useMemo, useContext } from 'react';
import { Location, LocationType } from '../types';
import { ThemeContext } from '../App';

// Declare L for Leaflet as it's loaded via CDN
declare const L: any;

interface KnowledgeMapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (location: Location) => void;
  destination?: Location | null; // New prop for routing
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

// Map Layers
const LAYERS = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
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

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ locations, center = [51.505, -0.09], zoom = 13, onLocationSelect, destination }) => {
  const { isDark } = useContext(ThemeContext);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null); // For the route line

  // UI States
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('standard');
  const [filterMode, setFilterMode] = useState<'all' | 'places' | 'entities' | 'leisure'>('all');
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Route Info State
  const [routeInfo, setRouteInfo] = useState<{dist: string, time: string} | null>(null);

  // Mock User Location (Central London)
  const userLocation: [number, number] = [51.505, -0.09];

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
    }
  }, []);

  // --- TILE LAYER UPDATE (Standard vs Satellite) ---
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer._url) mapInstanceRef.current.removeLayer(layer);
    });

    // Force Light Map (Voyager) for standard view even in Dark Mode for better visibility
    let url = LAYERS.light;
    if (mapMode === 'satellite') url = LAYERS.satellite;

    L.tileLayer(url, { maxZoom: 20 }).addTo(mapInstanceRef.current);
  }, [isDark, mapMode]);

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
        // CLUSTER
        const centerLat = item.reduce((acc, curr) => acc + curr.lat, 0) / item.length;
        const centerLng = item.reduce((acc, curr) => acc + curr.lng, 0) / item.length;
        const count = item.length;
        
        // Always use dark/high-contrast style for clusters since map is light
        const clusterHtml = `
          <div class="relative group flex items-center justify-center">
            <div class="flex items-center justify-center w-10 h-10 rounded-full text-white font-mono font-bold text-sm shadow-xl border border-white/20 backdrop-blur-md transform transition-transform hover:scale-110 cursor-pointer bg-black/80 z-10">
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
        
        // Smart Pin Design
        const pinHtml = `
          <div class="relative group">
             ${loc.hasNewActivity ? `<div class="absolute -inset-3 rounded-full bg-${isDark ? 'purple-500' : 'blue-500'} opacity-30 animate-ping"></div>` : ''}
             <div class="relative flex items-center justify-center w-9 h-9 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700">
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
  }, [clusters, currentZoom, isDark, mapMode]);

  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-[#0B0E14] overflow-hidden rounded-3xl">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* --- GOOGLE MAPS STYLE UI --- */}
      
      {/* 1. TOP LEFT: SEARCH CARD */}
      <div className="absolute top-4 left-4 z-[400] w-full max-w-sm flex flex-col gap-3">
          <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex items-center p-2 gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <span className="material-symbols-outlined">menu</span>
              </button>
              <input 
                  type="text" 
                  placeholder="Search knowledge hubs..." 
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 font-sans h-full"
              />
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
              <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                  <span className="material-symbols-outlined">search</span>
              </button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Places', 'Entities', 'Leisure'].map((filter) => (
                  <button
                      key={filter}
                      onClick={() => setFilterMode(filter.toLowerCase() as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all whitespace-nowrap ${
                          filterMode === filter.toLowerCase() 
                          ? 'bg-black dark:bg-white text-white dark:text-black border-transparent' 
                          : 'bg-white dark:bg-[#1A1D24] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                      {filter}
                  </button>
              ))}
          </div>

          {/* ROUTE INFO CARD (Visible when routing) */}
          {routeInfo && (
              <div className="bg-blue-600 text-white rounded-xl shadow-xl p-4 flex items-center justify-between animate-fade-in-up">
                  <div>
                      <div className="text-2xl font-bold">{routeInfo.time}</div>
                      <div className="text-xs opacity-90 font-medium">({routeInfo.dist}) • Best route</div>
                  </div>
                  <button 
                    onClick={() => {
                        // Clear route logic would involve parent, but visual clear here
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

      {/* 2. BOTTOM LEFT: LAYER TOGGLE (SATELLITE) */}
      <div className="absolute bottom-6 left-6 z-[400]">
          <button 
            onClick={() => setMapMode(prev => prev === 'standard' ? 'satellite' : 'standard')}
            className="group relative w-16 h-16 rounded-xl border-2 border-white dark:border-gray-600 shadow-[0_4px_10px_rgba(0,0,0,0.3)] overflow-hidden transition-transform hover:scale-105"
          >
              {/* Image representing the MODE WE SWITCH TO */}
              <img 
                src={mapMode === 'standard' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/4/5/8' : 'https://a.basemaps.cartocdn.com/light_all/4/8/5.png'} 
                className="w-full h-full object-cover"
                alt="Layer Toggle"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-[9px] text-white font-bold text-center py-0.5">
                  {mapMode === 'standard' ? 'Satellite' : 'Map'}
              </div>
          </button>
      </div>

      {/* 3. BOTTOM RIGHT: CONTROLS */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3">
          <button 
            onClick={() => {
                if (mapInstanceRef.current) mapInstanceRef.current.flyTo(userLocation, 15);
            }}
            className="w-10 h-10 bg-white dark:bg-[#1A1D24] rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="My Location"
          >
              <span className="material-symbols-outlined text-xl">my_location</span>
          </button>

          <div className="bg-white dark:bg-[#1A1D24] rounded-lg shadow-lg flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
              <button 
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                  <span className="material-symbols-outlined text-xl">add</span>
              </button>
              <button 
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
              <div className="bg-white dark:bg-[#1A1D24] text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded shadow-xl border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  {hoveredLocation.name}
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#1A1D24] border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45 mb-2.5"></div>
          </div>
      )}

    </div>
  );
};
