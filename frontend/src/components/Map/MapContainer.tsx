"use client";

import { useCallback, useEffect } from "react";
import { MapPin, Navigation2 } from "lucide-react";
import Map, {
  NavigationControl,
  GeolocateControl,
  ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMap } from "../../context/MapContext";
import MapMarkers from "./MapMarkers";
import MapPopup from "./MapPopup";

interface MapContainerProps {
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: () => void;
  onClick?: (event: any) => void;
  children?: React.ReactNode;
  showControls?: boolean;
  onMoveEnd?: (event: any) => void;
  interactiveLayerIds?: string[];
  /** Callback khi user click vào 1 POI trên map (tên, toạ độ, loại địa điểm) */
  onPoiClick?: (poi: { name: string; lat: number; lng: number; category?: string; address?: string }) => void;
}

// ── Helper: map Mapbox category → icon + màu + nhãn tiếng Việt ──────────────
export function getPoiMeta(category: string) {
  const c = (category || "").toLowerCase();

  const check = (...kws: string[]) => kws.some((k) => c.includes(k));

  if (check("food", "restaurant", "eat", "dining", "fast_food", "bar", "pub", "quán", "nhà hàng", "ăn"))
    return { label: "Restaurant", color: "#f97316", strip: "bg-gradient-to-r from-orange-400 to-orange-500" };
  if (check("cafe", "coffee", "cà phê", "bakery"))
    return { label: "Cafe", color: "#92400e", strip: "bg-gradient-to-r from-amber-600 to-amber-700" };
  if (check("hotel", "motel", "lodg", "accomm", "hostel", "khách sạn"))
    return { label: "Accommodation", color: "#2563eb", strip: "bg-gradient-to-r from-blue-500 to-blue-600" };
  if (check("hospital", "clinic", "health", "pharmacy", "medical", "bệnh viện", "y tế"))
    return { label: "Medical", color: "#dc2626", strip: "bg-gradient-to-r from-red-400 to-red-500" };
  if (check("school", "university", "college", "education", "library", "trường", "học"))
    return { label: "Education", color: "#7c3aed", strip: "bg-gradient-to-r from-violet-500 to-violet-600" };
  if (check("park", "garden", "nature", "forest", "công viên", "cây"))
    return { label: "Park", color: "#059669", strip: "bg-gradient-to-r from-emerald-400 to-emerald-500" };
  if (check("shop", "store", "mall", "market", "shopping", "chợ", "siêu thị"))
    return { label: "Shopping", color: "#db2777", strip: "bg-gradient-to-r from-pink-400 to-pink-500" };
  if (check("bank", "atm", "finance", "ngân hàng"))
    return { label: "Finance", color: "#4f46e5", strip: "bg-gradient-to-r from-indigo-500 to-indigo-600" };
  if (check("worship", "church", "temple", "mosque", "pagoda", "chùa", "nhà thờ"))
    return { label: "Worship", color: "#b45309", strip: "bg-gradient-to-r from-amber-500 to-amber-600" };
  if (check("gas", "fuel", "petrol", "xăng"))
    return { label: "Gas Station", color: "#64748b", strip: "bg-gradient-to-r from-slate-400 to-slate-500" };
  if (check("transit", "bus", "train", "metro", "subway", "station", "bến xe", "ga"))
    return { label: "Transit", color: "#0891b2", strip: "bg-gradient-to-r from-cyan-500 to-cyan-600" };
  if (check("sport", "gym", "fitness", "stadium", "thể thao"))
    return { label: "Sports", color: "#16a34a", strip: "bg-gradient-to-r from-green-500 to-green-600" };
  if (check("entertainment", "cinema", "theater", "museum", "giải trí", "rạp"))
    return { label: "Entertainment", color: "#9333ea", strip: "bg-gradient-to-r from-purple-500 to-purple-600" };

  return { label: "Place", color: "#6b7280", strip: "bg-gradient-to-r from-gray-400 to-gray-500" };
}
// ─────────────────────────────────────────────────────────────────────────────

const MapContainer: React.FC<MapContainerProps> = ({
  className = "",
  style,
  onMapLoad,
  onClick,
  children,
  showControls = true,
  onMoveEnd,
  interactiveLayerIds,
  onPoiClick,
}) => {
  const {
    mapRef,
    isMapLoaded,
    setIsMapLoaded,
    viewState,
    setViewState,
    mapStyle,
    showPopup,
    hidePopup,
    addMarker,
    removeMarker,
  } = useMap();

  const onMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);
    },
    [setViewState]
  );

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    if (onMapLoad) {
      onMapLoad();
    }

    // Override compass click: reset both bearing AND pitch to 0
    setTimeout(() => {
      const mapInstance = mapRef.current?.getMap();
      const container = mapInstance?.getContainer();
      const compassBtn = container?.querySelector(".mapboxgl-ctrl-compass");
      if (compassBtn) {
        compassBtn.addEventListener(
          "click",
          (e: Event) => {
            e.stopPropagation();
            mapInstance?.easeTo({ bearing: 0, pitch: 0, duration: 400 });
          },
          true // capture phase – fires before Mapbox's own resetNorth handler
        );
      }
    }, 300);
  }, [onMapLoad, setIsMapLoaded, mapRef]);

  // ── Handler: click lên bản đồ → query POI native từ Mapbox tiles ──────────
  const handleMapClick = useCallback(
    (e: any) => {
      // Gọi onClick từ bên ngoài nếu có
      if (onClick) onClick(e);

      const map = mapRef.current?.getMap();
      if (!map) return;

      // Query tất cả features được render tại điểm click
      const features = map.queryRenderedFeatures(e.point);

      // Tìm feature đầu tiên có tên (POI label)
      const poi = features.find(
        (f) =>
          f.properties?.name ||
          f.properties?.Name ||
          f.properties?.["name:vi"] ||
          f.properties?.["name:en"]
      );

      if (!poi) {
        // Click vào nền trống → đóng popup và xoá ghim tìm kiếm nếu có
        hidePopup();
        removeMarker("search-pin");
        return;
      }

      const name =
        poi.properties?.["name:vi"] ||
        poi.properties?.name ||
        poi.properties?.Name ||
        poi.properties?.["name:en"] ||
        "Place";

      const category =
        poi.properties?.type ||
        poi.properties?.category ||
        poi.properties?.class ||
        poi.layer?.["source-layer"] ||
        "";

      const address = poi.properties?.address || poi.properties?.["addr:full"] || "";

      // Lấy toạ độ từ feature nếu có, fallback về click point
      let lng = e.lngLat.lng;
      let lat = e.lngLat.lat;
      if (poi.geometry?.type === "Point") {
        const coords: number[] = (poi.geometry as GeoJSON.Point).coordinates as number[];
        if (coords.length >= 2) {
          lng = coords[0];
          lat = coords[1];
        }
      }

      const { label, color, strip } = getPoiMeta(category);

      // Trượt map mượt đến vị trí vừa click (Zoom lên khoảng 16 nếu đang xa)
      const currentZoom = map.getZoom();
      map.flyTo({
        center: [lng, lat],
        zoom: currentZoom < 15 ? 16 : currentZoom,
        duration: 1200
      });

      // Thêm Marker Ghim màu đỏ vào MapMarkers
      removeMarker("search-pin"); // xoá ghim cũ
      addMarker({
        id: "search-pin",
        longitude: lng,
        latitude: lat,
        title: name,
        description: address,
        type: "search-pin",
        color: "#EA4335", // Google Maps red
      });

      // Thông báo ra ngoài nếu cần dùng (vd: để mở panel)
      if (onPoiClick) {
        onPoiClick({ name, lat, lng, category, address });
      }
    },
    [onClick, onPoiClick, mapRef, showPopup, hidePopup, addMarker, removeMarker]
  );
  // ─────────────────────────────────────────────────────────────────────────

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxAccessToken) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={style}
      >
        <div className="text-center p-4">
          <h3 className="text-lg font-semibold text-gray-700">
            MapBox Token Required
          </h3>
          <p className="text-gray-500">
            Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        interactiveLayerIds={interactiveLayerIds}
        mapboxAccessToken={mapboxAccessToken}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        reuseMaps
        attributionControl={false}
      >
        {/* Navigation Controls */}
        {showControls && (
          <>
            <NavigationControl position="top-right" visualizePitch={true} />

            {/* Geolocation Control */}
            <GeolocateControl
              position="top-right"
              trackUserLocation={true}
              showAccuracyCircle={true}
            />
          </>
        )}

        {/* Markers */}
        <MapMarkers />

        {/* Popup – closeOnClick=false vì handleMapClick tự quản lý đóng/mở */}
        <MapPopup closeOnClick={false} />

        {/* Additional children components */}
        {children}
      </Map>

      {/* Loading indicator */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Đang tải bản đồ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
