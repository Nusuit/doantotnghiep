"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Clock,
  X,
  Menu,
  Loader2,
  Flag,
  CheckCircle2,
  Heart,
  Ban,
  ArrowLeft,
  ArrowRight,
  Check,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { type SavedPlace } from "@/services/savedPlacesService";
import { useMap } from "../Map";

export type SavedPlaceSectionIcon = "flag" | "visited" | "favorite" | "avoid";

export interface SavedPlaceSection {
  key: string;
  label: string;
  icon: SavedPlaceSectionIcon;
  iconClassName: string;
  countClassName: string;
  places: SavedPlace[];
}

export type RecentHistoryType = "place" | "search";

export interface RecentHistoryItem {
  id: string;
  type: RecentHistoryType;
  title: string;
  address?: string;
  region: string;
  latitude?: number;
  longitude?: number;
  timestamp: number;
  count: number;
}

export interface RecentHistoryEvent {
  type: RecentHistoryType;
  title: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

type DrawerTab = "main" | "saved" | "recents" | "contributions";

const RECENT_PREVIEW_MARKER_PREFIX = "recent-history-preview-";
const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

const normalizeRegionText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const isPostalCodeToken = (token: string) => /^\d{4,6}$/.test(token);

const canonicalRegionName = (token: string) => {
  const normalized = normalizeRegionText(token);

  if (
    normalized.includes("ho chi minh") ||
    normalized.includes("sai gon") ||
    normalized === "hcmc"
  ) {
    return "Ho Chi Minh City";
  }

  if (normalized.includes("ha noi")) return "Hanoi";
  if (normalized.includes("da nang")) return "Da Nang";
  if (normalized.includes("can tho")) return "Can Tho";
  if (normalized.includes("hai phong")) return "Hai Phong";

  return "";
};

const removeAdministrativePrefix = (token: string) =>
  token
    .replace(/^(thanh pho|tp\.?|city of|city|tinh|province of|province)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeRegion = (region?: string, address?: string) => {
  const rawTokens = [
    ...(address ? address.split(",") : []),
    ...(region ? [region] : []),
  ]
    .map((token) => token.trim())
    .filter(Boolean);

  if (rawTokens.length === 0) return "Unknown area";

  const validTokens = rawTokens.filter((token) => {
    const normalized = normalizeRegionText(token);
    if (!normalized) return false;
    if (["vietnam", "viet nam", "việt nam", "vn"].includes(normalized)) return false;
    if (isPostalCodeToken(normalized)) return false;
    return true;
  });

  if (validTokens.length === 0) return "Unknown area";

  for (const token of validTokens) {
    const canonical = canonicalRegionName(token);
    if (canonical) return canonical;
  }

  const cityLevelToken = validTokens.find((token) =>
    /(thanh pho|tp\.?|city|tinh|province)/i.test(token)
  );
  if (cityLevelToken) {
    const stripped = removeAdministrativePrefix(cityLevelToken);
    const canonical = canonicalRegionName(stripped);
    return canonical || stripped || cityLevelToken;
  }

  const nonDistrictToken = [...validTokens].reverse().find(
    (token) => !/(quan\s*\d+|q\.?\s*\d+|huyen|xa|phuong|ward|district|commune)/i.test(token)
  );
  if (nonDistrictToken) {
    const canonical = canonicalRegionName(nonDistrictToken);
    return canonical || nonDistrictToken;
  }

  return validTokens[validTokens.length - 1];
};

const SAVED_SECTION_ICONS = {
  flag: Flag,
  visited: CheckCircle2,
  favorite: Heart,
  avoid: Ban,
} as const;

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates?: [number, number]; // Optional initially for v1
  category?: string;
  place_type?: string[];
  bbox?: [number, number, number, number];
  mapbox_id?: string; // Needed for step 2 (retrieve)
}

interface MapSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  onSavedPlaceSelect?: (place: SavedPlace) => void;
  onSavedPlaceDelete?: (favoriteId: string) => void | Promise<void>;
  onRecentPlaceSelect?: (place: {
    name: string;
    lat: number;
    lng: number;
    address?: string;
  }) => void;
  onRecentHistoryEvent?: (event: RecentHistoryEvent) => void;
  onRecentHistoryDelete?: (itemId: string) => void;
  onRecentHistoryClear?: () => void;
  onRecentSearchesClear?: () => void;
  deletingSavedId?: string | null;
  placeholder?: string;
  savedPlaceSections?: SavedPlaceSection[];
  recentHistoryItems?: RecentHistoryItem[];
}

const MapSearch: React.FC<MapSearchProps> = ({
  onResultSelect,
  onSavedPlaceSelect,
  onSavedPlaceDelete,
  onRecentPlaceSelect,
  onRecentHistoryEvent,
  onRecentHistoryDelete,
  onRecentHistoryClear,
  onRecentSearchesClear,
  deletingSavedId = null,
  placeholder = "Search places, addresses...",
  savedPlaceSections = [],
  recentHistoryItems = [],
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>("main");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [selectedRegionFilters, setSelectedRegionFilters] = useState<string[]>([]);
  const [isOlderCollapsed, setIsOlderCollapsed] = useState(true);
  // V1 requires session tokens to bundle typing steps
  const [sessionToken, setSessionToken] = useState(generateUUID());

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { flyTo, addMarker, removeMarker, mapRef, markers } = useMap();
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
  const totalSavedPlaces = savedPlaceSections.reduce((total, section) => total + section.places.length, 0);

  const placeHistoryItems = useMemo(
    () =>
      recentHistoryItems
        .filter(
          (item) =>
            item.type === "place" &&
            typeof item.latitude === "number" &&
            typeof item.longitude === "number"
        )
        .sort((a, b) => b.timestamp - a.timestamp),
    [recentHistoryItems]
  );

  const totalRecentHistory = placeHistoryItems.length;

  const recentSearchItems = useMemo(() => {
    const seen = new Set<string>();

    return recentHistoryItems
      .filter((item) => item.type === "search")
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter((item) => {
        const key = item.title.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);
  }, [recentHistoryItems]);

  const recentSearches = useMemo(
    () => recentSearchItems.map((item) => item.title),
    [recentSearchItems]
  );

  const availableRegions = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of placeHistoryItems) {
      const region = normalizeRegion(item.region, item.address);
      counts.set(region, (counts.get(region) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [placeHistoryItems]);

  const selectedRegionSet = useMemo(
    () => new Set(selectedRegionFilters),
    [selectedRegionFilters]
  );

  const filteredPlaceHistory = useMemo(() => {
    if (selectedRegionFilters.length === 0) return placeHistoryItems;

    return placeHistoryItems.filter((item) =>
      selectedRegionSet.has(normalizeRegion(item.region, item.address))
    );
  }, [placeHistoryItems, selectedRegionFilters, selectedRegionSet]);

  const recentThreeDaysItems = useMemo(() => {
    const threshold = Date.now() - THREE_DAYS_IN_MS;
    return filteredPlaceHistory.filter((item) => item.timestamp >= threshold);
  }, [filteredPlaceHistory]);

  const olderPlaceItems = useMemo(() => {
    const threshold = Date.now() - THREE_DAYS_IN_MS;
    return filteredPlaceHistory.filter((item) => item.timestamp < threshold);
  }, [filteredPlaceHistory]);

  useEffect(() => {
    setSelectedRegionFilters((prev) =>
      prev.filter((region) => availableRegions.some((item) => item.name === region))
    );
  }, [availableRegions]);

  useEffect(() => {
    const previewMarkers = markers.filter((marker) =>
      marker.id.startsWith(RECENT_PREVIEW_MARKER_PREFIX)
    );

    if (!(isDrawerOpen && activeDrawerTab === "recents")) {
      for (const marker of previewMarkers) {
        removeMarker(marker.id);
      }
      return;
    }

    const desiredMarkers = filteredPlaceHistory.map((item) => ({
      id: `${RECENT_PREVIEW_MARKER_PREFIX}${item.id}`,
      longitude: item.longitude!,
      latitude: item.latitude!,
      title: item.title,
      description: item.address,
      type: "recent-history-pin",
      color: "#dc2626",
    }));

    const desiredById = new Map(desiredMarkers.map((marker) => [marker.id, marker]));

    for (const marker of previewMarkers) {
      if (!desiredById.has(marker.id)) {
        removeMarker(marker.id);
      }
    }

    for (const marker of desiredMarkers) {
      const existing = previewMarkers.find((item) => item.id === marker.id);
      const needsUpdate =
        !existing ||
        existing.longitude !== marker.longitude ||
        existing.latitude !== marker.latitude ||
        existing.title !== marker.title ||
        existing.description !== marker.description;

      if (needsUpdate) {
        addMarker(marker);
      }
    }
  }, [
    isDrawerOpen,
    activeDrawerTab,
    filteredPlaceHistory,
    markers,
    addMarker,
    removeMarker,
  ]);

  useEffect(() => {
    if (!(isDrawerOpen && activeDrawerTab === "recents")) return;
    if (filteredPlaceHistory.length === 0) return;

    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;

    if (filteredPlaceHistory.length === 1) {
      const item = filteredPlaceHistory[0];
      mapInstance.flyTo({
        center: [item.longitude!, item.latitude!],
        zoom: 12,
        duration: 700,
      });
      return;
    }

    const lngs = filteredPlaceHistory.map((item) => item.longitude!);
    const lats = filteredPlaceHistory.map((item) => item.latitude!);

    mapInstance.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: 90,
        duration: 700,
        maxZoom: 11,
      }
    );
  }, [isDrawerOpen, activeDrawerTab, filteredPlaceHistory, mapRef]);

  useEffect(() => {
    setCollapsedSections((prev) => {
      const next = { ...prev };
      for (const section of savedPlaceSections) {
        if (next[section.key] === undefined) {
          next[section.key] = true;
        }
      }
      return next;
    });
  }, [savedPlaceSections]);

  // Fetch real data from Mapbox Geocoding API v5
  // Dynamically reads map center + bounds so results prioritize what's on screen
  const performSearch = async (
    searchQuery: string
  ): Promise<SearchResult[]> => {
    if (!mapboxAccessToken) return [];

    // -- Dynamic context from current map view --
    const mapInstance = mapRef.current?.getMap();

    // --- Mapbox Search Box API v1: DUAL-FETCH STRATEGY ---
    // 1. GLOBAL: Finds major cities, provinces (No Proximity) -> Limit 2
    const paramsGlobal = new URLSearchParams({
      access_token: mapboxAccessToken,
      session_token: sessionToken,
      language: "vi",
      limit: "2",
      types: "country,region,district,place", // Administrative areas only
    });
    const endpointGlobal = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(searchQuery)}&${paramsGlobal.toString()}`;

    // 2. LOCAL: Finds anything (Categories, POIs, Addresses) with Proximity -> Limit 4
    const paramsLocal = new URLSearchParams({
      access_token: mapboxAccessToken,
      session_token: sessionToken,
      language: "vi",
      limit: "4",
    });

    if (mapInstance) {
      const center = mapInstance.getCenter();
      paramsLocal.set("proximity", `${center.lng},${center.lat}`);
    }
    const endpointLocal = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(searchQuery)}&${paramsLocal.toString()}`;

    const fetchGlobal = fetch(endpointGlobal)
      .then((res) => (res.ok ? res.json() : { suggestions: [] }))
      .catch((e) => ({ suggestions: [] }));
      
    const fetchLocal = fetch(endpointLocal)
      .then((res) => (res.ok ? res.json() : { suggestions: [] }))
      .catch((e) => {
        console.error("Mapbox v1 Local Suggest Error:", e);
        return { suggestions: [] };
      });

    // 1. Scan Local Features
    const localResults: SearchResult[] = [];
    if (mapInstance) {
      const searchTerm = searchQuery.toLowerCase();
      const addedNames = new Set<string>();
      try {
        const rendered = mapInstance.queryRenderedFeatures();
        for (const feature of rendered) {
          const name =
            feature.properties?.["name:vi"] ||
            feature.properties?.name ||
            feature.properties?.Name ||
            feature.properties?.["name:en"];

          if (name && name.toLowerCase().includes(searchTerm) && !addedNames.has(name)) {
            if (feature.geometry?.type === "Point") {
              const coords = feature.geometry.coordinates as [number, number];
              if (coords.length >= 2) {
                addedNames.add(name);
                localResults.push({
                  id: `local-${feature.id || Math.random().toString()}`,
                  name: name,
                  address: feature.properties?.address || feature.properties?.["addr:street"] || "On map",
                  coordinates: coords,
                  category: feature.properties?.type || feature.properties?.class || "POI",
                  place_type: ["poi"],
                });

                if (localResults.length >= 3) break;
              }
            }
          }
        }
      } catch (e) {
        console.warn("Local map scan error:", e);
      }
    }

    // 2. Await Remote Features (v1 Global & Local)
    const [dataGlobal, dataLocal] = await Promise.all([fetchGlobal, fetchLocal]);

    const parseSuggestV1 = (suggestions: any[]) => {
      return suggestions.map((s: any) => ({
        id: s.mapbox_id || Math.random().toString(),
        mapbox_id: s.mapbox_id,
        name: s.name,
        address: s.place_formatted || s.full_address || "",
        category: s.maki || s.feature_type || "",
        place_type: [s.feature_type].filter(Boolean) as string[],
        // NO COORDINATES YET, MUST FETCH ON CLICK
      }));
    };

    const parsedGlobal = parseSuggestV1(dataGlobal.suggestions || []);
    const parsedLocal = parseSuggestV1(dataLocal.suggestions || []);

    // 3. Combine & Filter Duplicates (Local Scanned > Global Admin > Local API)
    const combined = [...localResults];
    const localNames = new Set(localResults.map((r) => r.name.toLowerCase()));

    for (const r of parsedGlobal) {
      if (!localNames.has(r.name.toLowerCase())) {
        combined.push(r);
        localNames.add(r.name.toLowerCase());
      }
    }

    for (const r of parsedLocal) {
      if (!localNames.has(r.name.toLowerCase())) {
        combined.push(r);
        localNames.add(r.name.toLowerCase());
      }
    }

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
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const recordRecentHistory = (event: RecentHistoryEvent) => {
    onRecentHistoryEvent?.(event);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    const normalized = searchTerm.trim();
    if (!normalized) return;

    setQuery(normalized);
    setShowResults(true);
    searchInputRef.current?.focus();
    void handleSearch(normalized);
    recordRecentHistory({ type: "search", title: normalized });
  };

  // Handle result selection
  const handleResultClick = async (baseResult: SearchResult) => {
    const activeQuery = query.trim();

    // 1. Determine Coordinates First (if missing due to V1 API)
    let finalResult = { ...baseResult };
    
    if (!finalResult.coordinates && finalResult.mapbox_id && mapboxAccessToken) {
      setIsLoading(true);
      try {
        const retrieveUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${finalResult.mapbox_id}?access_token=${mapboxAccessToken}&session_token=${sessionToken}`;
        const res = await fetch(retrieveUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            finalResult.coordinates = feature.geometry.coordinates as [number, number];
            finalResult.bbox = feature.properties?.bbox || undefined;
            finalResult.place_type = finalResult.place_type || [feature.properties?.feature_type];
          }
        }
      } catch (e) {
        console.error("Retrieve coordinates failed:", e);
      }
      setIsLoading(false);

      // Successfully processed a search session, regenerate token
      setSessionToken(generateUUID());
    }

    // Cannot fly if absolutely no coordinates are found
    if (!finalResult.coordinates) {
      setShowResults(false);
      return; 
    }

    // 2. Save history
    if (activeQuery) {
      recordRecentHistory({ type: "search", title: activeQuery });
    }

    recordRecentHistory({
      type: "place",
      title: finalResult.name,
      address: finalResult.address,
      latitude: finalResult.coordinates[1],
      longitude: finalResult.coordinates[0],
    });

    // 3. Pin logic
    const isPoint =
      !finalResult.place_type ||
      finalResult.place_type.some((t) => ["poi", "address", "postcode"].includes(t));

    removeMarker("search-pin");
    if (isPoint) {
      addMarker({
        id: "search-pin",
        longitude: finalResult.coordinates[0],
        latitude: finalResult.coordinates[1],
        title: finalResult.name,
        description: finalResult.address,
        type: "search-pin",
        color: "#EA4335", // Google Maps red
      });

      flyTo({
        longitude: finalResult.coordinates[0],
        latitude: finalResult.coordinates[1],
        zoom: 16,
      });
    } else {
      const mapInstance = mapRef.current?.getMap();
      if (mapInstance && finalResult.bbox) {
        mapInstance.fitBounds(
          [
            [finalResult.bbox[0], finalResult.bbox[1]],
            [finalResult.bbox[2], finalResult.bbox[3]],
          ],
          { padding: 60, duration: 1400, maxZoom: 14 }
        );
      } else {
        flyTo({
          longitude: finalResult.coordinates[0],
          latitude: finalResult.coordinates[1],
          zoom: 12,
        });
      }
    }

    setShowResults(false);
    setQuery(finalResult.name);

    if (onResultSelect) {
      onResultSelect(finalResult);
    }
  };

  const handleSavedPlaceClick = (place: SavedPlace) => {
    recordRecentHistory({
      type: "place",
      title: place.name,
      address: place.address,
      latitude: place.coordinates.lat,
      longitude: place.coordinates.lng,
    });

    removeMarker("search-pin");
    addMarker({
      id: "search-pin",
      longitude: place.coordinates.lng,
      latitude: place.coordinates.lat,
      title: place.name,
      description: place.address,
      type: "search-pin",
      color: "#EA4335",
    });

    flyTo({
      longitude: place.coordinates.lng,
      latitude: place.coordinates.lat,
      zoom: 16,
    });

    setQuery(place.name);
    setShowResults(false);
    setIsDrawerOpen(false);
    setActiveDrawerTab("main");
    onSavedPlaceSelect?.(place);
  };

  const handleRecentHistoryClick = (item: RecentHistoryItem) => {
    if (item.type === "search") {
      setQuery(item.title);
      setIsDrawerOpen(false);
      setActiveDrawerTab("main");
      setShowResults(true);
      searchInputRef.current?.focus();
      void handleSearch(item.title);
      recordRecentHistory({ type: "search", title: item.title });
      return;
    }

    if (item.latitude == null || item.longitude == null) return;

    removeMarker("search-pin");
    addMarker({
      id: "search-pin",
      longitude: item.longitude,
      latitude: item.latitude,
      title: item.title,
      description: item.address,
      type: "search-pin",
      color: "#EA4335",
    });

    flyTo({
      longitude: item.longitude,
      latitude: item.latitude,
      zoom: 16,
    });

    setQuery(item.title);
    setIsDrawerOpen(false);
    setActiveDrawerTab("main");
    setShowResults(false);

    onRecentPlaceSelect?.({
      name: item.title,
      lat: item.latitude,
      lng: item.longitude,
      address: item.address,
    });

    recordRecentHistory({
      type: "place",
      title: item.title,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
    });
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setActiveDrawerTab("main");
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setActiveDrawerTab("main");
    setShowResults(false);
  };

  const openRecentHistoryDrawer = () => {
    setIsDrawerOpen(true);
    setActiveDrawerTab("recents");
    setShowResults(false);
  };

  const isAllRegionsSelected = selectedRegionFilters.length === 0;

  const handleSelectAllRegions = () => {
    setSelectedRegionFilters([]);
  };

  const handleToggleRegionFilter = (regionName: string) => {
    setSelectedRegionFilters((prev) => {
      if (prev.includes(regionName)) {
        return prev.filter((item) => item !== regionName);
      }
      return [...prev, regionName];
    });
  };

  const formatRecentHistoryDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderRecentHistoryRow = (item: RecentHistoryItem) => (
    <div
      key={item.id}
      className="grid grid-cols-[1fr_auto] items-center gap-2 px-2 py-1"
    >
      <button
        onClick={() => handleRecentHistoryClick(item)}
        className="min-w-0 flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#1A2030] border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
          <MapPin size={14} className="text-red-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {item.title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {item.address || "Place"}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {formatRecentHistoryDate(item.timestamp)}
          </div>
        </div>
      </button>

      {onRecentHistoryDelete && (
        <button
          onClick={() => onRecentHistoryDelete(item.id)}
          className="justify-self-end p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title="Delete history item"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );

  const handleMenuClick = () => {
    if (isDrawerOpen) {
      closeDrawer();
      return;
    }

    openDrawer();
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const renderDrawerBody = () => {
    if (activeDrawerTab === "main") {
      return (
        <div className="p-4 space-y-2">
          <button
            onClick={() => setActiveDrawerTab("saved")}
            className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
          >
            <Heart size={24} className="text-red-500 fill-current" />
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Favorite</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{totalSavedPlaces} locations</div>
            </div>
          </button>

          <button
            onClick={() => setActiveDrawerTab("recents")}
            className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
          >
            <Clock size={24} className="text-gray-400" />
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Recent History</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{totalRecentHistory} items</div>
            </div>
          </button>

          <button
            onClick={() => setActiveDrawerTab("contributions")}
            className="w-full flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
          >
            <MessageSquare size={24} className="text-gray-400" />
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Your Contributions</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Manage reviews & edits</div>
            </div>
          </button>
        </div>
      );
    }

    if (activeDrawerTab === "saved") {
      return (
        <div className="h-full flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <button
              onClick={() => setActiveDrawerTab("main")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Favorite</h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {totalSavedPlaces === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No saved places yet.</div>
            )}

            {savedPlaceSections.map((section) => {
              const SectionIcon = SAVED_SECTION_ICONS[section.icon];
              const isCollapsed = collapsedSections[section.key] ?? false;

              return (
                <div key={section.key} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111521]">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon
                        className={`h-4 w-4 ${section.iconClassName} ${section.icon === "favorite" ? "fill-current" : ""}`}
                      />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        {section.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${section.countClassName}`}>
                        {section.places.length}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronUp size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed && (
                    section.places.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-500">No places in this category.</div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {section.places.map((place) => (
                          <div key={place.id} className="group grid grid-cols-[1fr_auto] items-center gap-2 px-2 py-1">
                            <button
                              onClick={() => handleSavedPlaceClick(place)}
                              className="min-w-0 flex items-center gap-3 px-2 py-2 text-left hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#1A2030] border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                                <SectionIcon
                                  className={`h-3.5 w-3.5 ${section.iconClassName} ${section.icon === "favorite" ? "fill-current" : ""}`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{place.name}</div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{place.address || "Saved place"}</div>
                              </div>
                            </button>

                            {onSavedPlaceDelete && (
                              <button
                                onClick={() => {
                                  void onSavedPlaceDelete(place.id);
                                }}
                                disabled={deletingSavedId === place.id}
                                className="justify-self-end p-2 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
                                title="Remove saved place"
                              >
                                {deletingSavedId === place.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <X size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeDrawerTab === "recents") {
      return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0B1220]">
          <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveDrawerTab("main")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent History</h3>
            </div>

            {totalRecentHistory > 0 && onRecentHistoryClear && (
              <button
                onClick={onRecentHistoryClear}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Clear all history"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F172A]">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                Areas
              </div>

              {availableRegions.length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">No regions available yet.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSelectAllRegions}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-colors ${
                      isAllRegionsSelected
                        ? "bg-gray-200 dark:bg-white/10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        : "bg-gray-100 dark:bg-[#111827] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                    }`}
                  >
                    {isAllRegionsSelected && <Check size={14} />}
                    <span>All</span>
                    <span className="text-gray-500 dark:text-gray-400">{placeHistoryItems.length}</span>
                  </button>

                  {availableRegions.map((region) => {
                    const isSelected = selectedRegionSet.has(region.name);
                    return (
                      <button
                        key={region.name}
                        onClick={() => handleToggleRegionFilter(region.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-colors max-w-full ${
                          isSelected
                            ? "bg-gray-200 dark:bg-white/10 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                            : "bg-gray-100 dark:bg-[#111827] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                        }`}
                      >
                        {isSelected ? (
                          <Check size={14} className="shrink-0" />
                        ) : (
                          <MapPin size={14} className="text-gray-500 dark:text-gray-400 shrink-0" />
                        )}
                        <span className="truncate">{region.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">{region.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 space-y-3">
              {totalRecentHistory === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No history yet.</div>
              ) : (
                <>
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Last 3 days</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({recentThreeDaysItems.length})</span>
                    </div>

                    {recentThreeDaysItems.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-gray-500 dark:text-gray-400">
                        No visits in the last 3 days.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {recentThreeDaysItems.map((item) => renderRecentHistoryRow(item))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
                    <button
                      onClick={() => setIsOlderCollapsed((prev) => !prev)}
                      className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Older than 3 days ({olderPlaceItems.length})
                      </span>
                      {isOlderCollapsed ? (
                        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronUp size={16} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>

                    {!isOlderCollapsed && (
                      olderPlaceItems.length === 0 ? (
                        <div className="px-3 py-4 text-xs text-gray-500 dark:text-gray-400">
                          No older history.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                          {olderPlaceItems.map((item) => renderRecentHistoryRow(item))}
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <button
            onClick={() => setActiveDrawerTab("main")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your Contributions</h3>
        </div>

        <div className="flex-1 p-4 text-sm text-gray-600 dark:text-gray-300 space-y-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111521] p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Reviews</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your place reviews and feedback history.</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111521] p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">Edits</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track suggested edits and moderation status.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-sm">
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 pointer-events-none" />

          <div className="absolute left-0 top-0 z-60 w-[360px] h-[calc(100vh-9.5rem)] rounded-3xl overflow-hidden border border-gray-200 dark:border-[#243252] bg-white/95 dark:bg-[#060A16]/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.65)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-[#243252]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">KS</div>
                <span className="text-3 font-bold text-gray-900 dark:text-white">Knowledge Map</span>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">{renderDrawerBody()}</div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-[#243252] text-center text-sm text-gray-500 dark:text-gray-500">
              KnowledgeShare Protocol v3.2
            </div>
          </div>
        </>
      )}

      {/* Search Input Box */}
      <div className="bg-white dark:bg-[#1A1D24] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-800 flex items-center p-1.5 gap-2 transition-colors relative z-50">
        <button
          onClick={handleMenuClick}
          className={`p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 ${
            isDrawerOpen
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          title="Open saved places and history"
        >
          <Menu size={18} />
        </button>

        <div className="flex-1 flex items-center h-10 w-full relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                const normalized = query.trim();
                recordRecentHistory({ type: "search", title: normalized });
                void handleSearch(normalized);
              }
            }}
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

        <button
          onClick={() => {
            setShowResults(true);
            searchInputRef.current?.focus();
            if (query.trim()) {
              recordRecentHistory({ type: "search", title: query.trim() });
              void handleSearch(query);
            }
          }}
          className="p-2.5 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center shrink-0"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && !isDrawerOpen && (
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
              <div className="px-4 py-2 mt-1 flex items-center justify-between gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <span>Recent Searches</span>
                {onRecentSearchesClear && (
                  <button
                    onClick={onRecentSearchesClear}
                    className="text-[10px] normal-case tracking-normal text-gray-500 hover:text-red-500 transition-colors"
                    title="Clear all recent searches"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {recentSearchItems.map((item) => (
                <div
                  key={item.id}
                  className="group grid grid-cols-[1fr_auto] items-center border-b border-gray-100 dark:border-gray-800/60 last:border-b-0"
                >
                  <button
                    onClick={() => handleRecentSearchClick(item.title)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors min-w-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 truncate">{item.title}</span>
                  </button>

                  {onRecentHistoryDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecentHistoryDelete(item.id);
                      }}
                      className="mr-2 p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              <div className="px-2 pt-2">
                <button
                  onClick={openRecentHistoryDrawer}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  title="View all recent history"
                >
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">View all</span>
                  <ArrowRight size={14} className="text-gray-400" />
                </button>
              </div>
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
      {showResults && !isDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default MapSearch;
