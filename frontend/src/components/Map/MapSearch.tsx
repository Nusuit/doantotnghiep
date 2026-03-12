"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Clock, Star, X } from "lucide-react";
import { useMap } from "../Map";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
  category?: string;
  /** Mapbox place type: 'poi', 'address', 'neighborhood', 'place', 'region', 'country', etc. */
  place_type?: string[];
  /** Bounding box [west, south, east, north] – present for areas/regions */
  bbox?: [number, number, number, number];
}

interface MapSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

const MapSearch: React.FC<MapSearchProps> = ({
  onResultSelect,
  placeholder = "Search places, addresses...",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { flyTo, addMarker, removeMarker, mapRef } = useMap();
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mapSearchHistory");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load search history:", e);
      }
    }
  }, []);

  // Fetch real data from Mapbox Geocoding API v5
  // Dynamically reads map center + bounds so results prioritize what's on screen
  const performSearch = async (
    searchQuery: string
  ): Promise<SearchResult[]> => {
    if (!mapboxAccessToken) return [];

    // -- Dynamic context from current map view --
    const mapInstance = mapRef.current?.getMap();

    // --- 1. REMOTE: Global Administrative Search (No Proximity) ---
    // Finds major cities, provinces, countries globally (resolves "Hà Nội" issue)
    const paramsGlobal = new URLSearchParams({
      access_token: mapboxAccessToken,
      autocomplete: "true",
      limit: "3", // Top 3 major places
      language: "vi",
      types: "country,region,district,place", // Only big administrative areas
    });
    const endpointGlobal = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${paramsGlobal.toString()}`;

    // --- 2. REMOTE: Local POI Search (With Proximity) ---
    // Finds cafes, airports, distinct addresses near user
    const paramsLocal = new URLSearchParams({
      access_token: mapboxAccessToken,
      autocomplete: "true",
      limit: "5", // Top 5 local POIs
      language: "vi",
      types: "locality,neighborhood,address,poi", // Small scaled places
    });

    if (mapInstance) {
      const center = mapInstance.getCenter();
      paramsLocal.set("proximity", `${center.lng},${center.lat}`);
    }
    const endpointLocal = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?${paramsLocal.toString()}`;

    // Parallel fetch: Global API, Local API, & Local Rendered Map Scan
    const fetchGlobal = fetch(endpointGlobal).then((res) => (res.ok ? res.json() : { features: [] })).catch(() => ({ features: [] }));
    const fetchLocal = fetch(endpointLocal).then((res) => (res.ok ? res.json() : { features: [] })).catch(() => ({ features: [] }));


    // 1. Scan Local Features
    const localResults: SearchResult[] = [];
    if (mapInstance) {
      const searchTerm = searchQuery.toLowerCase();
      const addedNames = new Set<string>();
      try {
        // Query everything rendered
        const rendered = mapInstance.queryRenderedFeatures();
        for (const feature of rendered) {
          const name =
            feature.properties?.["name:vi"] ||
            feature.properties?.name ||
            feature.properties?.Name ||
            feature.properties?.["name:en"];

          if (name && name.toLowerCase().includes(searchTerm) && !addedNames.has(name)) {
            // We only want Point features with valid coordinates
            if (feature.geometry?.type === "Point") {
              const coords = feature.geometry.coordinates as [number, number];
              if (coords.length >= 2) {
                addedNames.add(name);
                localResults.push({
                  id: `local-${feature.id || Math.random().toString()}`,
                  name: name,
                  address: feature.properties?.address || feature.properties?.["addr:street"] || "Trên bản đồ",
                  coordinates: coords,
                  category: feature.properties?.type || feature.properties?.class || "POI",
                  place_type: ["poi"] // Treat as point
                });

                // Keep max 3 local results
                if (localResults.length >= 3) break;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Local map scan error:", e);
      }
    }

    // 2. Await Both Remote Features
    const [dataGlobal, dataLocal] = await Promise.all([fetchGlobal, fetchLocal]);

    const parseMapboxFeatures = (features: any[]) => {
      if (!features) return [];
      return features.map((feature: any) => {
        let name = feature.text || "Unknown";
        let addressParts = [];
        let category = "";

        if (feature.properties?.category) {
          category = feature.properties.category.split(",")[0];
        }

        if (feature.context) {
          // Extract specific admin levels for cleaner address display
          addressParts = feature.context
            .filter((c: any) => c.id.startsWith("place") || c.id.startsWith("region") || c.id.startsWith("country"))
            .map((c: any) => c.text);
        } else if (feature.place_name) {
          addressParts = [feature.place_name.replace(`${feature.text}, `, "")];
        }

        // Mapbox usually returns context from small to large (district -> city -> country).
        const addressStr = addressParts.filter(Boolean).join(", ") || feature.place_name || "";

        return {
          id: feature.id || Math.random().toString(),
          name: name,
          address: addressStr.trim() === "" ? (feature.place_name || "Vị trí không xác định") : addressStr,
          coordinates: feature.geometry.coordinates as [number, number],
          category: category || feature.properties?.type || feature.place_type?.[0] || "",
          place_type: feature.place_type as string[],
          bbox: feature.bbox as [number, number, number, number] | undefined,
        };
      });
    };

    const parsedGlobal = parseMapboxFeatures(dataGlobal.features || []);
    const parsedLocal = parseMapboxFeatures(dataLocal.features || []);

    // 3. Combine & Filter Duplicates (prioritizing scanned local > global admin > local POIs)
    const combined = [...localResults];
    const localNames = new Set(localResults.map((r) => r.name.toLowerCase()));

    // Add Global (Cities/Countries)
    for (const r of parsedGlobal) {
      if (!localNames.has(r.name.toLowerCase())) {
        combined.push(r);
        localNames.add(r.name.toLowerCase());
      }
    }

    // Add Local POIs (Cafes, addresses)
    for (const r of parsedLocal) {
      if (!localNames.has(r.name.toLowerCase())) {
        combined.push(r);
        localNames.add(r.name.toLowerCase());
      }
    }

    // Return max 6 combined
    return combined.slice(0, 6);
  };

  // Handle search input
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      const searchResults = await performSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecentSearches = [
      result.name,
      ...recentSearches.filter((s) => s !== result.name),
    ].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem("mapSearchHistory", JSON.stringify(newRecentSearches));

    // -- Determine if this is a POINT or an AREA --
    const isPoint =
      !result.place_type ||
      result.place_type.some((t) => ["poi", "address"].includes(t));

    // Remove any previous search pin
    removeMarker("search-pin");

    if (isPoint) {
      // Add a red search pin marker at the exact location
      addMarker({
        id: "search-pin",
        longitude: result.coordinates[0],
        latitude: result.coordinates[1],
        title: result.name,
        description: result.address,
        type: "search-pin",
        color: "#EA4335", // Google Maps red
      });

      // Fly to the point
      flyTo({
        longitude: result.coordinates[0],
        latitude: result.coordinates[1],
        zoom: 16,
      });
    } else {
      // Area: fitBounds using bbox from API, or fallback to flyTo center zoomed out
      const mapInstance = mapRef.current?.getMap();
      if (mapInstance && result.bbox) {
        mapInstance.fitBounds(
          [
            [result.bbox[0], result.bbox[1]], // [west, south]
            [result.bbox[2], result.bbox[3]], // [east, north]
          ],
          { padding: 60, duration: 1400, maxZoom: 14 }
        );
      } else {
        // No bbox: just fly to center at a wider zoom
        flyTo({
          longitude: result.coordinates[0],
          latitude: result.coordinates[1],
          zoom: 12,
        });
      }
    }

    // Close search
    setShowResults(false);
    setQuery(result.name);

    // Callback
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    searchInputRef.current?.focus();
    setShowResults(false); // Can open after search triggers
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Search Input Box */}
      <div className="bg-white dark:bg-[#1A1D24] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-800 flex items-center p-1.5 gap-2 transition-colors relative z-50">
        <div className="flex-1 flex items-center h-10 w-full relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="w-full h-full bg-transparent pl-4 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-500 font-sans text-sm focus:outline-none"
            placeholder={placeholder}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <button className="p-2.5 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center shrink-0">
          <Search size={18} />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-40 top-full left-0 w-full mt-2 bg-white dark:bg-[#1A1D24] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[60vh] overflow-y-auto custom-scrollbar animate-fade-in-up">
          {/* Loading State */}
          {isLoading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">Searching...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 mt-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Search Results
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800/60 last:border-b-0 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-[13px] font-bold text-gray-900 dark:text-gray-100 truncate w-full">
                      {result.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 w-full">
                      {result.address}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <MapPin className="h-8 w-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No locations found for <span className="font-semibold text-gray-700 dark:text-gray-200">"{query}"</span>
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 mt-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800/60 last:border-b-0 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Search locations, landmarks, cafes...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close results */}
      {showResults && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default MapSearch;
