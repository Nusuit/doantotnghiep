// Map utilities and helpers
// Common utilities for map operations

export const mapUtils = {
  // Default view state for Ho Chi Minh City
  getDefaultViewState: () => ({
    longitude: 106.6297,
    latitude: 10.8231,
    zoom: 11,
  }),

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Format coordinates for display
  formatCoordinates: (lat: number, lng: number): string => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  },

  // Check if coordinates are within Vietnam bounds (approximate)
  isWithinVietnam: (lat: number, lng: number): boolean => {
    return lat >= 8.5 && lat <= 23.4 && lng >= 102.15 && lng <= 109.5;
  },

  // Generate a unique marker ID
  generateMarkerId: (): string => {
    return `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};
