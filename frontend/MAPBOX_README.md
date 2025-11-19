# MapBox Integration với NextJS

Đây là một implementation hoàn chỉnh của MapBox GL JS với NextJS, được thiết kế theo các best practices và architecture patterns hiện đại.

## 📋 Tính năng chính

- ✅ **Server-Side Rendering Safe**: Dynamic import để tránh SSR issues
- ✅ **Context-based State Management**: Centralized state với React Context
- ✅ **Responsive Design**: Tương thích với mọi kích thước màn hình
- ✅ **Dark Mode Support**: Tự động detection và manual toggle
- ✅ **TypeScript Support**: Fully typed với TypeScript
- ✅ **Custom Hooks**: Reusable hooks cho geolocation, bounds, clustering
- ✅ **Modular Components**: Tách biệt concerns với các component riêng biệt
- ✅ **Performance Optimized**: Marker clustering, lazy loading, memoization
- ✅ **Accessibility**: ARIA labels và keyboard navigation support

## 🚀 Cài đặt

### 1. Dependencies

```bash
npm install react-map-gl mapbox-gl
npm install @types/mapbox-gl  # Nếu sử dụng TypeScript
```

### 2. Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**Lưu ý**: Token cần có prefix `NEXT_PUBLIC_` để accessible từ client-side.

## 📁 Cấu trúc Project

```
src/
├── components/
│   └── Map/
│       ├── index.tsx           # Main export file
│       ├── MapBox.tsx          # Enhanced wrapper component
│       ├── MapContainer.tsx    # Core map component
│       ├── MapControls.tsx     # UI controls
│       ├── MapMarkers.tsx      # Marker management
│       └── MapPopup.tsx        # Popup component
├── context/
│   └── MapContext.tsx          # Context và state management
├── hooks/
│   └── useMapHooks.ts          # Custom hooks
└── app/
    └── mapbox-demo/
        └── page.tsx            # Demo page
```

## 💻 Cách sử dụng

### Basic Usage

```tsx
import MapBox from "@/components/Map";

export default function MyPage() {
  return (
    <div className="w-full h-96">
      <MapBox
        initialViewState={{
          longitude: 106.6297,
          latitude: 10.8231,
          zoom: 11,
        }}
      />
    </div>
  );
}
```

### Advanced Usage với Context

```tsx
import MapBox, { MapProvider, useMap, MapMarker } from "@/components/Map";

const MapDemo = () => {
  const { addMarker, flyTo } = useMap();

  const handleAddMarker = () => {
    const marker: MapMarker = {
      id: "marker-1",
      longitude: 106.6297,
      latitude: 10.8231,
      title: "Hồ Chí Minh",
      description: "Thành phố lớn nhất Việt Nam",
    };
    addMarker(marker);
  };

  return (
    <div>
      <button onClick={handleAddMarker}>Add Marker</button>
      <MapBox height="500px" />
    </div>
  );
};

export default function Page() {
  return (
    <MapProvider>
      <MapDemo />
    </MapProvider>
  );
}
```

## 🎛️ API Reference

### MapBox Component Props

| Prop               | Type                  | Default         | Mô tả                    |
| ------------------ | --------------------- | --------------- | ------------------------ |
| `className`        | `string`              | `''`            | CSS classes              |
| `style`            | `React.CSSProperties` | `undefined`     | Inline styles            |
| `initialViewState` | `MapViewState`        | HCM coordinates | Initial map position     |
| `initialMapStyle`  | `string`              | `'streets-v12'` | MapBox style URL         |
| `showControls`     | `boolean`             | `true`          | Show navigation controls |
| `showMapControls`  | `boolean`             | `true`          | Show custom controls     |
| `height`           | `string \| number`    | `'400px'`       | Map height               |
| `width`            | `string \| number`    | `'100%'`        | Map width                |

### Context API

```tsx
const {
  // Map instance
  mapRef,
  isMapLoaded,

  // View state
  viewState,
  setViewState,

  // Markers
  markers,
  addMarker,
  removeMarker,
  clearMarkers,

  // Popup
  popup,
  showPopup,
  hidePopup,

  // Map style
  mapStyle,
  setMapStyle,

  // Utilities
  flyTo,
  getBounds,
} = useMap();
```

### Custom Hooks

#### useGeolocation

```tsx
const { getCurrentLocation, position, isLoading, error } = useGeolocation();
```

#### useMapBounds

```tsx
const { bounds, fitBounds, fitMarkersInView } = useMapBounds();
```

#### useMapTheme

```tsx
const { theme, toggleTheme, mapStyle } = useMapTheme();
```

#### useMarkerClustering

```tsx
const { clusteredMarkers } = useMarkerClustering(100);
```

## 🎨 Styling & Theming

### CSS Classes

Component sử dụng Tailwind CSS classes. Bạn có thể customize bằng cách:

```tsx
<MapBox
  className="border-2 border-blue-500 rounded-xl"
  // Custom styles sẽ được merge với default styles
/>
```

### Dark Mode

Dark mode được support tự động:

```tsx
// Manual toggle
const { theme, toggleTheme } = useMapTheme();

// Automatic detection từ system preference
// Component sẽ tự động switch style dựa trên theme
```

### Map Styles Presets

```tsx
import { MAP_STYLES } from "@/components/Map";

// Available presets:
MAP_STYLES.STREETS; // Default streets
MAP_STYLES.LIGHT; // Light theme
MAP_STYLES.DARK; // Dark theme
MAP_STYLES.SATELLITE; // Satellite view
MAP_STYLES.OUTDOORS; // Outdoor/hiking style
```

## 🔧 Performance Optimization

### Marker Clustering

```tsx
const { clusteredMarkers } = useMarkerClustering(100); // Cluster khi > 100 markers
```

### Lazy Loading

Components được dynamic import để tránh SSR issues và reduce bundle size.

### Memory Management

Map instance được cleanup tự động khi component unmount.

## 🚨 Troubleshooting

### Common Issues

1. **SSR Issues**: Components đã được wrap với dynamic import
2. **Token Issues**: Đảm bảo token có prefix `NEXT_PUBLIC_`
3. **TypeScript Errors**: Cài đặt `@types/mapbox-gl`

### Error Handling

```tsx
// Component có built-in error handling
<MapBox
  onError={(error) => {
    console.error("Map error:", error);
  }}
/>
```

## 🌟 Examples

Xem demo tại `/mapbox-demo` route để thấy tất cả features hoạt động.

## 📄 License

MIT License - feel free to use in your projects!

---

**Được tạo bởi GitHub Copilot** 🤖
