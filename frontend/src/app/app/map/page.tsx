"use client";

import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MapProvider, useMap } from "@/context/MapContext";
import { MapContainer } from "@/components/Map";
import MapSearch, {
    type SavedPlaceSection,
    type RecentHistoryEvent,
    type RecentHistoryItem,
} from "@/components/Map/MapSearch";
import { getPoiMeta } from "@/components/Map/MapContainer";
import { MapPin, Navigation2, X, Star, Bookmark, MessageSquare, Loader2, Flag, CheckCircle2, Heart, Ban, Check, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchSavedPlaces, savePlace, unsavePlace, type SavedPlace } from "@/services/savedPlacesService";
import { AddPlaceModal } from "@/components/Map/AddPlaceModal";

const MapSkeleton = () => (
    <div className="w-full h-full bg-gray-100 dark:bg-dark-surface animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading map...</span>
    </div>
);

type SelectedPoi = {
    name: string;
    lat: number;
    lng: number;
    category?: string;
    address?: string;
};

type SaveTag = "TO_VISIT" | "VISITED" | "FAVORITE" | "AVOID";

const SAVE_STATUS_STORAGE_KEY = "mapSavedPlaceTags";
const RECENT_HISTORY_STORAGE_KEY = "mapRecentHistory";
const MAX_RECENT_HISTORY_ITEMS = 35;
const SAVE_TAG_ORDER: SaveTag[] = ["TO_VISIT", "VISITED", "FAVORITE", "AVOID"];
const SAVE_TAGS: Record<
    SaveTag,
    {
        label: string;
        icon: LucideIcon;
        iconClassName: string;
        buttonClassName: string;
        countClassName: string;
        searchIcon: SavedPlaceSection["icon"];
    }
> = {
    TO_VISIT: {
        label: "To Visit",
        icon: Flag,
        iconClassName: "text-blue-600 dark:text-blue-400",
        buttonClassName: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-transparent",
        countClassName: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300",
        searchIcon: "flag",
    },
    VISITED: {
        label: "Visited",
        icon: CheckCircle2,
        iconClassName: "text-green-600 dark:text-green-400",
        buttonClassName: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-transparent",
        countClassName: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300",
        searchIcon: "visited",
    },
    FAVORITE: {
        label: "My Favorite",
        icon: Heart,
        iconClassName: "text-red-500",
        buttonClassName: "bg-red-50 dark:bg-red-900/20 text-red-500 border-transparent",
        countClassName: "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-300",
        searchIcon: "favorite",
    },
    AVOID: {
        label: "Avoid",
        icon: Ban,
        iconClassName: "text-gray-500 dark:text-gray-400",
        buttonClassName: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-transparent",
        countClassName: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
        searchIcon: "avoid",
    },
};

const getSelectedPoiKey = (poi: SelectedPoi) => `${poi.name}__${poi.lat.toFixed(5)}__${poi.lng.toFixed(5)}`;
const getSavedPlaceKey = (place: SavedPlace) => `${place.name}__${place.coordinates.lat.toFixed(5)}__${place.coordinates.lng.toFixed(5)}`;

const normalizeRegionText = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

const canonicalRegionName = (token: string) => {
    const normalized = normalizeRegionText(token);

    if (normalized.includes("ho chi minh") || normalized.includes("sai gon") || normalized === "hcmc") {
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

const buildRecentHistoryId = (event: RecentHistoryEvent) => {
    if (event.type === "place" && typeof event.latitude === "number" && typeof event.longitude === "number") {
        return `place:${event.latitude.toFixed(5)}:${event.longitude.toFixed(5)}`;
    }

    return `${event.type}:${event.title.trim().toLowerCase()}`;
};

const getRecentHistoryRegion = (event: RecentHistoryEvent) => {
    if (event.type === "search") return "Searches";

    const address = event.address?.trim();
    if (!address) return "Unknown area";

    const rawParts = address
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    const parts = rawParts.filter((part) => {
        const normalized = normalizeRegionText(part);
        if (!normalized) return false;
        if (["vietnam", "viet nam", "việt nam", "vn"].includes(normalized)) return false;
        if (/^\d{4,6}$/.test(normalized)) return false;
        return true;
    });

    if (parts.length === 0) return "Unknown area";

    for (const part of parts) {
        const canonical = canonicalRegionName(part);
        if (canonical) return canonical;
    }

    const cityLevelPart = parts.find((part) => /(thanh pho|tp\.?|city|tinh|province)/i.test(part));
    if (cityLevelPart) {
        const stripped = removeAdministrativePrefix(cityLevelPart);
        const canonical = canonicalRegionName(stripped);
        return canonical || stripped || cityLevelPart;
    }

    const nonDistrictPart = [...parts].reverse().find(
        (part) => !/(quan\s*\d+|q\.?\s*\d+|huyen|xa|phuong|ward|district|commune)/i.test(part)
    );
    if (nonDistrictPart) {
        const canonical = canonicalRegionName(nonDistrictPart);
        return canonical || nonDistrictPart;
    }

    return parts[parts.length - 1];
};

const MapSavedMarkersSync: React.FC<{
    savedPlaces: SavedPlace[];
    savedTagsByKey: Record<string, SaveTag>;
}> = ({ savedPlaces, savedTagsByKey }) => {
    const { markers, addMarker, removeMarker } = useMap();

    useEffect(() => {
        const desiredMarkers = new Map<string, {
            id: string;
            longitude: number;
            latitude: number;
            title: string;
            description: string;
            type: string;
            savedStatus: SaveTag;
            color: string;
        }>();

        for (const place of savedPlaces) {
            const saveTag = savedTagsByKey[getSavedPlaceKey(place)] ?? "TO_VISIT";
            desiredMarkers.set(`saved-${place.id}`, {
                id: `saved-${place.id}`,
                longitude: place.coordinates.lng,
                latitude: place.coordinates.lat,
                title: place.name,
                description: place.address || "Saved place",
                type: "saved-place",
                savedStatus: saveTag,
                color: "#2563eb",
            });
        }

        const existingSavedMarkers = markers.filter((marker) => marker.type === "saved-place");

        for (const marker of existingSavedMarkers) {
            if (!desiredMarkers.has(marker.id)) {
                removeMarker(marker.id);
            }
        }

        for (const [markerId, marker] of desiredMarkers.entries()) {
            const existing = existingSavedMarkers.find((item) => item.id === markerId);

            const needsUpdate =
                !existing ||
                existing.savedStatus !== marker.savedStatus ||
                existing.longitude !== marker.longitude ||
                existing.latitude !== marker.latitude ||
                existing.title !== marker.title ||
                existing.description !== marker.description;

            if (needsUpdate) {
                addMarker(marker);
            }
        }
    }, [savedPlaces, savedTagsByKey, markers, addMarker, removeMarker]);

    return null;
};

// ── MapDeepLinkHandler: flies to ?lat=&lng= query params on mount ─────────────
const MapDeepLinkHandler: React.FC<{
    onSelect: (poi: { name: string; lat: number; lng: number }) => void;
}> = ({ onSelect }) => {
    const { flyTo, isMapLoaded, addMarker } = useMap();
    const searchParams = useSearchParams();
    const handled = useRef(false);

    useEffect(() => {
        if (!isMapLoaded || handled.current) return;
        const lat = parseFloat(searchParams.get("lat") ?? "");
        const lng = parseFloat(searchParams.get("lng") ?? "");
        if (isNaN(lat) || isNaN(lng)) return;

        handled.current = true;
        const name = searchParams.get("name") ?? "Location";

        // Fly to the location at a close zoom so the label is readable
        flyTo({ longitude: lng, latitude: lat, zoom: 18 });

        // Drop a prominent red pin so the user can see exactly where it is
        addMarker({
            id: "search-pin",
            longitude: lng,
            latitude: lat,
            title: name,
            type: "search-pin",
            color: "#EA4335",
        });

        onSelect({ name, lat, lng });
    }, [isMapLoaded, searchParams, flyTo, addMarker, onSelect]);

    return null;
};
// ─────────────────────────────────────────────────────────────────────────────

// ── MapAddPinSync: syncs pending (green) and confirmed (red) pins ─────────────
const MapAddPinSync: React.FC<{
    pendingPin: { lat: number; lng: number } | null;
    confirmedPin: { lat: number; lng: number; name: string } | null;
}> = ({ pendingPin, confirmedPin }) => {
    const { addMarker, removeMarker } = useMap();

    useEffect(() => {
        if (pendingPin) {
            addMarker({
                id: "pending-add",
                longitude: pendingPin.lng,
                latitude: pendingPin.lat,
                type: "search-pin",
                color: "#22c55e",
                title: "New place",
            });
        } else {
            removeMarker("pending-add");
        }
    }, [pendingPin, addMarker, removeMarker]);

    useEffect(() => {
        if (confirmedPin) {
            addMarker({
                id: "confirmed-place",
                longitude: confirmedPin.lng,
                latitude: confirmedPin.lat,
                type: "search-pin",
                color: "#EA4335",
                title: confirmedPin.name,
            });
        } else {
            removeMarker("confirmed-place");
        }
    }, [confirmedPin, addMarker, removeMarker]);

    return null;
};
// ─────────────────────────────────────────────────────────────────────────────

// ── MapFlyToSync: flies the map to target coords when they change ─────────────
const MapFlyToSync: React.FC<{
    target: { lat: number; lng: number; zoom?: number } | null;
}> = ({ target }) => {
    const { flyTo } = useMap();
    const prevTarget = useRef<typeof target>(null);

    useEffect(() => {
        if (!target) return;
        if (
            prevTarget.current?.lat === target.lat &&
            prevTarget.current?.lng === target.lng
        ) return;
        prevTarget.current = target;
        flyTo({ longitude: target.lng, latitude: target.lat, zoom: target.zoom ?? 16 });
    }, [target, flyTo]);

    return null;
};
// ─────────────────────────────────────────────────────────────────────────────

export default function MapPage() {
    const [selectedPoi, setSelectedPoi] = useState<SelectedPoi | null>(null);
    // --- Saved places state ---
    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
    const [savedTagsByKey, setSavedTagsByKey] = useState<Record<string, SaveTag>>({});
    const [recentHistoryItems, setRecentHistoryItems] = useState<RecentHistoryItem[]>([]);
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const saveMenuRef = useRef<HTMLDivElement>(null);

    // --- Add Place state ---
    const [isAddingPlace, setIsAddingPlace] = useState(false);
    const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
    const [confirmedPlacePin, setConfirmedPlacePin] = useState<{ lat: number; lng: number; name: string } | null>(null);
    const [addPlaceModalOpen, setAddPlaceModalOpen] = useState(false);
    const addPinDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);

    // Detect deep-link coordinates: if ?lat=&lng= are present, skip auto-geolocate
    const hasDeepLink =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).has("lat") &&
        new URLSearchParams(window.location.search).has("lng");


    // Load saved places once on mount
    useEffect(() => {
        fetchSavedPlaces()
            .then(setSavedPlaces)
            .catch(() => { });
    }, []);

    useEffect(() => {
        const storedStatuses = localStorage.getItem(SAVE_STATUS_STORAGE_KEY);
        if (!storedStatuses) return;

        try {
            setSavedTagsByKey(JSON.parse(storedStatuses) as Record<string, SaveTag>);
        } catch {
            // Ignore malformed storage and start fresh.
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(SAVE_STATUS_STORAGE_KEY, JSON.stringify(savedTagsByKey));
    }, [savedTagsByKey]);

    useEffect(() => {
        const storedHistory = localStorage.getItem(RECENT_HISTORY_STORAGE_KEY);
        if (!storedHistory) {
            const legacySearchHistory = localStorage.getItem("mapSearchHistory");
            if (!legacySearchHistory) return;

            try {
                const parsedLegacy = JSON.parse(legacySearchHistory) as string[];
                if (!Array.isArray(parsedLegacy)) return;

                const now = Date.now();
                const migrated = parsedLegacy
                    .filter((term) => typeof term === "string" && term.trim().length > 0)
                    .slice(0, MAX_RECENT_HISTORY_ITEMS)
                    .map((term, index) => {
                        const title = term.trim();
                        return {
                            id: `search:${title.toLowerCase()}`,
                            type: "search" as const,
                            title,
                            region: "Searches",
                            timestamp: now - index,
                            count: 1,
                        };
                    });

                setRecentHistoryItems(migrated);
            } catch {
                // Ignore malformed legacy storage.
            }

            return;
        }

        try {
            const parsed = JSON.parse(storedHistory) as RecentHistoryItem[];
            if (!Array.isArray(parsed)) return;

            const normalized = parsed
                .filter((item) => item && typeof item.id === "string" && typeof item.title === "string")
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, MAX_RECENT_HISTORY_ITEMS);

            setRecentHistoryItems(normalized);
        } catch {
            // Ignore malformed storage and keep an empty list.
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(RECENT_HISTORY_STORAGE_KEY, JSON.stringify(recentHistoryItems));
    }, [recentHistoryItems]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (saveMenuRef.current && !saveMenuRef.current.contains(event.target as Node)) {
                setShowSaveMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check if current POI is already saved
    const currentSaved = useCallback(
        () =>
            selectedPoi
                ? savedPlaces.find(
                    (p) =>
                        p.name === selectedPoi.name &&
                        Math.abs(p.coordinates.lat - selectedPoi.lat) < 0.0001 &&
                        Math.abs(p.coordinates.lng - selectedPoi.lng) < 0.0001
                ) ?? null
                : null,
        [selectedPoi, savedPlaces]
    );

    const activeSavedPlace = currentSaved();
    const activeSaveTag = selectedPoi && activeSavedPlace ? savedTagsByKey[getSelectedPoiKey(selectedPoi)] ?? "TO_VISIT" : null;
    const ActiveSaveIcon = activeSaveTag ? SAVE_TAGS[activeSaveTag].icon : Bookmark;
    const activeSaveIconClassName = activeSaveTag ? SAVE_TAGS[activeSaveTag].iconClassName : "";

    const savedPlaceSections = useMemo<SavedPlaceSection[]>(
        () =>
            SAVE_TAG_ORDER.map((tag) => ({
                key: tag,
                label: SAVE_TAGS[tag].label,
                icon: SAVE_TAGS[tag].searchIcon,
                iconClassName: SAVE_TAGS[tag].iconClassName,
                countClassName: SAVE_TAGS[tag].countClassName,
                places: savedPlaces.filter((place) => (savedTagsByKey[getSavedPlaceKey(place)] ?? "TO_VISIT") === tag),
            })),
        [savedPlaces, savedTagsByKey]
    );

    const handleSaveAction = useCallback(async (tag: SaveTag) => {
        if (!selectedPoi) return;
        const existing = currentSaved();
        const placeKey = getSelectedPoiKey(selectedPoi);
        setIsSaving(true);
        try {
            if (existing) {
                const existingTag = savedTagsByKey[placeKey] ?? "TO_VISIT";

                if (existingTag === tag) {
                    await unsavePlace(existing.id);
                    setSavedPlaces((prev) => prev.filter((p) => p.id !== existing.id));
                    setSavedTagsByKey((prev) => {
                        const next = { ...prev };
                        delete next[placeKey];
                        return next;
                    });
                    toast.success("Removed from favorites");
                } else {
                    setSavedTagsByKey((prev) => ({
                        ...prev,
                        [placeKey]: tag,
                    }));
                    toast.success(`Moved to ${SAVE_TAGS[tag].label}`);
                }
            } else {
                const saved = await savePlace({
                    name: selectedPoi.name,
                    address: selectedPoi.address,
                    lat: selectedPoi.lat,
                    lng: selectedPoi.lng,
                    category: selectedPoi.category,
                });
                setSavedPlaces((prev) => [saved, ...prev]);
                setSavedTagsByKey((prev) => ({
                    ...prev,
                    [getSavedPlaceKey(saved)]: tag,
                }));
                toast.success(`Saved to ${SAVE_TAGS[tag].label}`);
            }
        } catch (err) {
            console.error("[handleSaveAction]", err);
            toast.error(err instanceof Error ? err.message : "Could not update saved place");
        } finally {
            setIsSaving(false);
            setShowSaveMenu(false);
        }
    }, [selectedPoi, currentSaved, savedTagsByKey]);

    const handleDeleteSaved = useCallback(async (id: string) => {
        const removedPlace = savedPlaces.find((place) => place.id === id);
        setDeletingId(id);
        try {
            await unsavePlace(id);
            setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
            if (removedPlace) {
                const placeKey = getSavedPlaceKey(removedPlace);
                setSavedTagsByKey((prev) => {
                    const next = { ...prev };
                    delete next[placeKey];
                    return next;
                });
            }
            toast.success("Removed from favorites");
        } catch (err) {
            console.error("[handleDeleteSaved]", err);
            toast.error("Could not remove saved place");
        } finally {
            setDeletingId(null);
        }
    }, [savedPlaces]);

    const handleRecentHistoryEvent = useCallback((event: RecentHistoryEvent) => {
        const title = event.title.trim();
        if (!title) return;

        const now = Date.now();
        const itemId = buildRecentHistoryId({ ...event, title });

        setRecentHistoryItems((prev) => {
            const existing = prev.find((item) => item.id === itemId);

            const nextItem: RecentHistoryItem = {
                id: itemId,
                type: event.type,
                title,
                address: event.address ?? existing?.address,
                region: event.address ? getRecentHistoryRegion(event) : existing?.region ?? getRecentHistoryRegion(event),
                latitude: typeof event.latitude === "number" ? event.latitude : existing?.latitude,
                longitude: typeof event.longitude === "number" ? event.longitude : existing?.longitude,
                timestamp: now,
                count: (existing?.count ?? 0) + 1,
            };

            const updated = [nextItem, ...prev.filter((item) => item.id !== itemId)];
            return updated.slice(0, MAX_RECENT_HISTORY_ITEMS);
        });
    }, []);

    const handleRecentHistoryDelete = useCallback((itemId: string) => {
        setRecentHistoryItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    const handleRecentHistoryClear = useCallback(() => {
        setRecentHistoryItems([]);
    }, []);

    const handleRecentSearchesClear = useCallback(() => {
        setRecentHistoryItems((prev) => prev.filter((item) => item.type !== "search"));
    }, []);

    const handleRecentPlaceSelect = useCallback((place: {
        name: string;
        lat: number;
        lng: number;
        address?: string;
    }) => {
        setSelectedPoi({
            name: place.name,
            lat: place.lat,
            lng: place.lng,
            address: place.address,
        });
        setShowSaveMenu(false);
    }, []);

    const handleMapClickForAdd = useCallback((e: any) => {
        if (!isAddingPlace) return;
        if (addPinDebounceRef.current) clearTimeout(addPinDebounceRef.current);
        addPinDebounceRef.current = setTimeout(() => {
            const { lat, lng } = e.lngLat;
            setPendingPin({ lat, lng });
        }, 200);
    }, [isAddingPlace]);

    const cancelAddPlace = useCallback(() => {
        if (addPinDebounceRef.current) clearTimeout(addPinDebounceRef.current);
        setIsAddingPlace(false);
        setPendingPin(null);
        setAddPlaceModalOpen(false);
        setConfirmedPlacePin(null);
    }, []);

    const poiMeta = selectedPoi ? getPoiMeta(selectedPoi.category || "") : null;

    return (
        <div className="w-full h-[calc(100vh-8rem)] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl relative bg-gray-50 dark:bg-[#0B0E14] flex">
            <Suspense fallback={<MapSkeleton />}>
                <MapProvider>
                    <MapSavedMarkersSync savedPlaces={savedPlaces} savedTagsByKey={savedTagsByKey} />
                    <MapAddPinSync pendingPin={pendingPin} confirmedPin={confirmedPlacePin} />
                    <MapFlyToSync target={flyToTarget} />
                    <MapDeepLinkHandler onSelect={(poi) => { setSelectedPoi(poi); setShowSaveMenu(false); }} />

                    {/* 1. MAP AREA */}
                    <div className="flex-1 relative z-0">
                        <MapContainer
                            className="w-full h-full absolute inset-0"
                            interactivePinMode={isAddingPlace}
                            autoGeolocate={!hasDeepLink}
                            onClick={handleMapClickForAdd}
                            onPoiClick={isAddingPlace ? undefined : (poi) => {
                                setSelectedPoi(poi);
                                setShowSaveMenu(false);
                            }}
                        />

                        {/* Top-left floating elements, optional search etc. */}
                        <div className="absolute top-4 left-4 z-10 flex items-start gap-4 pointer-events-none">
                            <div className="w-80 pointer-events-auto">
                                <MapSearch
                                    onResultSelect={(result) => {
                                        // Make sure we select it so the panel opens and maps focus
                                        setSelectedPoi({
                                            name: result.name,
                                            lat: result.coordinates[1],
                                            lng: result.coordinates[0],
                                            category: result.category,
                                            address: result.address
                                        });
                                        setShowSaveMenu(false);
                                    }}
                                    onSavedPlaceDelete={handleDeleteSaved}
                                    onSavedPlaceSelect={(place) => {
                                        setSelectedPoi({
                                            name: place.name,
                                            lat: place.coordinates.lat,
                                            lng: place.coordinates.lng,
                                            category: place.category,
                                            address: place.address,
                                        });
                                        setShowSaveMenu(false);
                                    }}
                                    onRecentPlaceSelect={handleRecentPlaceSelect}
                                    onRecentHistoryEvent={handleRecentHistoryEvent}
                                    onRecentHistoryDelete={handleRecentHistoryDelete}
                                    onRecentHistoryClear={handleRecentHistoryClear}
                                    onRecentSearchesClear={handleRecentSearchesClear}
                                    deletingSavedId={deletingId}
                                    savedPlaceSections={savedPlaceSections}
                                    recentHistoryItems={recentHistoryItems}
                                />
                            </div>

                            {/* Add Place FAB */}
                            <div className="flex flex-col items-start gap-2 pointer-events-auto">
                                {!isAddingPlace ? (
                                    <button
                                        onClick={() => setIsAddingPlace(true)}
                                        className="flex items-center gap-2 px-5 h-[54px] bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-sm font-medium transition-all"
                                    >
                                        <MapPin className="w-4 h-4" /> Add Place
                                    </button>
                                ) : (
                                    <>
                                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-5 h-[54px] flex items-center text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-left-4">
                                            {pendingPin ? "📍 Location set — confirm or tap to move" : "Tap the map to drop a pin"}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={cancelAddPlace}
                                                title="Cancel"
                                                className="w-[34px] h-[34px] flex items-center justify-center bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-lg transition-all shadow-sm"
                                            >
                                                <X className="w-4 h-4 text-white" strokeWidth={2.5} />
                                            </button>
                                            {pendingPin && (
                                                <button
                                                    onClick={() => setAddPlaceModalOpen(true)}
                                                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-lg shadow-md text-sm font-bold transition-all"
                                                >
                                                    Confirm Location →
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Map controls removed */}

                    </div>{/* end map area */}

                    {/* 2. SIDE PANEL (Slide Out Right) */}
                    <div
                        className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white/95 dark:bg-[#0F1116]/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 z-20 flex flex-col ${selectedPoi ? "translate-x-0" : "translate-x-full"
                            }`}
                    >
                        {selectedPoi && poiMeta && (
                            <div className="flex flex-col h-full">
                                {/* A. HEADER */}
                                <div className="p-6 pb-5 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#0F1116]/50 relative shrink-0">
                                    <button
                                        onClick={() => {
                                            setSelectedPoi(null);
                                            setShowSaveMenu(false);
                                            setConfirmedPlacePin(null);
                                        }}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <X size={20} />
                                    </button>

                                    {/* Category Badge & Stars */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span
                                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border"
                                            style={{
                                                backgroundColor: poiMeta.color + "15",
                                                color: poiMeta.color,
                                                borderColor: poiMeta.color + "30",
                                            }}
                                        >
                                            {poiMeta.label}
                                        </span>

                                        {/* Mock stars (placeholder) */}
                                        <div className="flex text-blue-500 dark:text-blue-400 gap-0.5">
                                            {[...Array(4)].map((_, i) => (
                                                <Star key={i} size={14} className="fill-current" />
                                            ))}
                                            <Star size={14} className="text-gray-200 dark:text-gray-700" />
                                        </div>
                                    </div>

                                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2 pr-6 line-clamp-2">
                                        {selectedPoi.name}
                                    </h2>

                                    {selectedPoi.address && (
                                        <div className="flex items-start gap-1.5 text-gray-500 mb-5">
                                            <MapPin size={14} className="mt-0.5 shrink-0" />
                                            <span className="text-sm leading-snug">
                                                {selectedPoi.address}
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons — Favorite only */}
                                    <div className="flex gap-3">

                                        <div className="relative flex-1" ref={saveMenuRef}>
                                            <button
                                                onClick={() => setShowSaveMenu((prev) => !prev)}
                                                disabled={isSaving}
                                                className={`w-full py-2.5 border rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${activeSaveTag
                                                    ? SAVE_TAGS[activeSaveTag].buttonClassName
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-[#1A1D24] text-gray-700 dark:text-gray-200"
                                                    }`}
                                            >
                                                {isSaving ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ActiveSaveIcon size={18} className={`${activeSaveIconClassName} ${activeSaveTag === "FAVORITE" ? "fill-current" : ""}`} />
                                                )}
                                                {activeSaveTag ? SAVE_TAGS[activeSaveTag].label : "Favorite"}
                                            </button>

                                            {showSaveMenu && (
                                                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in-up origin-top-right">
                                                    <div className="p-1 space-y-1">
                                                        {SAVE_TAG_ORDER.map((tag) => {
                                                            const TagIcon = SAVE_TAGS[tag].icon;
                                                            const isActive = activeSaveTag === tag;

                                                            return (
                                                                <button
                                                                    key={tag}
                                                                    onClick={() => void handleSaveAction(tag)}
                                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                                                        ? "bg-gray-100 dark:bg-white/10 font-bold"
                                                                        : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300"
                                                                        }`}
                                                                >
                                                                    <TagIcon
                                                                        size={18}
                                                                        className={`${SAVE_TAGS[tag].iconClassName} ${tag === "FAVORITE" ? "fill-current" : ""}`}
                                                                    />
                                                                    <span className={isActive ? "text-gray-900 dark:text-white" : ""}>
                                                                        {SAVE_TAGS[tag].label}
                                                                    </span>
                                                                    {isActive && <Check size={16} className="ml-auto text-blue-500" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* B. SCROLLABLE CONTENT */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50 dark:bg-[#0B0E14]/30">
                                    {/* Overview Card */}
                                    <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm mb-6">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                            About {selectedPoi.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans mb-4">
                                            This is the location you selected on the map. Currently, there is no detailed description from the system.
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 w-fit px-2 py-1 rounded-md">
                                            <Navigation2 size={12} />
                                            {selectedPoi.lat.toFixed(5)}, {selectedPoi.lng.toFixed(5)}
                                        </div>
                                    </div>

                                    {/* Featured Comments / Reviews */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <MessageSquare size={14} />
                                            Community Reviews
                                        </h4>

                                        {/* Empty State */}
                                        <div className="text-center py-8 px-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                <MessageSquare size={20} />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                No reviews yet. Bookmark or review this place.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* C. FOOTER */}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1116] shrink-0">
                                    <button className="w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center shadow-lg">
                                        Add your review
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Add Place Modal */}
                    {pendingPin && (
                        <AddPlaceModal
                            open={addPlaceModalOpen}
                            onOpenChange={(open) => {
                                setAddPlaceModalOpen(open);
                                if (!open) cancelAddPlace();
                            }}
                            lat={pendingPin.lat}
                            lng={pendingPin.lng}
                            onSuccess={(place) => {
                                cancelAddPlace();
                                if (place.latitude && place.longitude) {
                                    setConfirmedPlacePin({ lat: place.latitude, lng: place.longitude, name: place.name });
                                    setFlyToTarget({ lat: place.latitude, lng: place.longitude, zoom: 17 });
                                    setSelectedPoi({
                                        name: place.name,
                                        lat: place.latitude,
                                        lng: place.longitude,
                                        category: place.category ?? undefined,
                                        address: place.address ?? undefined,
                                    });
                                }
                            }}
                            onViewExisting={(place) => {
                                cancelAddPlace();
                                if (place.latitude && place.longitude) {
                                    setFlyToTarget({ lat: place.latitude, lng: place.longitude, zoom: 17 });
                                    setSelectedPoi({
                                        name: place.name,
                                        lat: place.latitude,
                                        lng: place.longitude,
                                        category: place.category ?? undefined,
                                        address: place.address ?? undefined,
                                    });
                                }
                            }}
                        />
                    )}
                </MapProvider>
            </Suspense>
        </div>
    );
}
