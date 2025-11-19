const { PrismaClient } = require("@prisma/client");

class MapService {
  constructor() {
    this.prisma = new PrismaClient();
    this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    this.mapboxBaseUrl = "https://api.mapbox.com";
  }

  // Search for locations using MapBox Geocoding API
  async searchLocation(query, limit = 5) {
    try {
      if (!this.mapboxToken) {
        throw new Error("MapBox access token not configured");
      }

      const url = `${
        this.mapboxBaseUrl
      }/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
      const params = new URLSearchParams({
        access_token: this.mapboxToken,
        limit: limit.toString(),
        language: "vi", // Vietnamese language
        country: "VN", // Restrict to Vietnam
      });

      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        throw new Error(`MapBox API error: ${response.status}`);
      }

      const data = await response.json();

      return data.features.map((feature) => ({
        id: feature.id,
        name: feature.place_name,
        address: feature.properties.address || feature.place_name,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
        category: this.getPlaceCategory(feature.properties.category),
        bbox: feature.bbox,
      }));
    } catch (error) {
      console.error("searchLocation error:", error);
      throw error;
    }
  }

  // Get directions between two points
  async getDirections(start, end, profile = "driving") {
    try {
      if (!this.mapboxToken) {
        throw new Error("MapBox access token not configured");
      }

      const url = `${this.mapboxBaseUrl}/directions/v5/mapbox/${profile}/${start};${end}`;
      const params = new URLSearchParams({
        access_token: this.mapboxToken,
        geometries: "geojson",
        language: "vi",
        overview: "full",
        steps: "true",
      });

      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        throw new Error(`MapBox Directions API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      const route = data.routes[0];

      return {
        distance: route.distance, // meters
        duration: route.duration, // seconds
        geometry: route.geometry,
        steps: route.legs[0].steps.map((step) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          geometry: step.geometry,
        })),
      };
    } catch (error) {
      console.error("getDirections error:", error);
      throw error;
    }
  }

  // Get nearby places (placeholder - integrate with external APIs or your database)
  async getNearbyPlaces(lat, lng, category, radius) {
    try {
      // This could integrate with:
      // - Google Places API
      // - Foursquare API
      // - Your own places database
      // - MapBox POI data

      // For now, return sample data from your database if available
      const places = await this.prisma.place.findMany({
        where: {
          AND: [
            { category: category },
            // Add spatial query here if your DB supports it
            // For now, we'll use a simple bounding box
          ],
        },
        take: 20,
      });

      // Calculate distance and filter (simple implementation)
      const nearbyPlaces = places
        .map((place) => {
          const distance = this.calculateDistance(
            lat,
            lng,
            place.lat,
            place.lng
          );
          return { ...place, distance };
        })
        .filter((place) => place.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return nearbyPlaces.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        coordinates: {
          lat: place.lat,
          lng: place.lng,
        },
        category: place.category,
        distance: place.distance,
        rating: place.rating,
        priceLevel: place.priceLevel,
      }));
    } catch (error) {
      console.error("getNearbyPlaces error:", error);
      throw error;
    }
  }

  // Add favorite location for user
  async addFavoriteLocation(userId, locationData) {
    try {
      const favorite = await this.prisma.favoriteLocation.create({
        data: {
          userId,
          name: locationData.name,
          address: locationData.address,
          lat: locationData.lat,
          lng: locationData.lng,
          category: locationData.category || "general",
        },
      });

      return {
        id: favorite.id,
        name: favorite.name,
        address: favorite.address,
        coordinates: {
          lat: favorite.lat,
          lng: favorite.lng,
        },
        category: favorite.category,
        createdAt: favorite.createdAt,
      };
    } catch (error) {
      console.error("addFavoriteLocation error:", error);
      throw error;
    }
  }

  // Get user's favorite locations
  async getFavoriteLocations(userId) {
    try {
      const favorites = await this.prisma.favoriteLocation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return favorites.map((fav) => ({
        id: fav.id,
        name: fav.name,
        address: fav.address,
        coordinates: {
          lat: fav.lat,
          lng: fav.lng,
        },
        category: fav.category,
        createdAt: fav.createdAt,
      }));
    } catch (error) {
      console.error("getFavoriteLocations error:", error);
      throw error;
    }
  }

  // Delete favorite location
  async deleteFavoriteLocation(userId, favoriteId) {
    try {
      const favorite = await this.prisma.favoriteLocation.findFirst({
        where: {
          id: favoriteId,
          userId,
        },
      });

      if (!favorite) {
        throw new Error("Favorite location not found");
      }

      await this.prisma.favoriteLocation.delete({
        where: { id: favoriteId },
      });
    } catch (error) {
      console.error("deleteFavoriteLocation error:", error);
      throw error;
    }
  }

  // Helper functions
  getPlaceCategory(categories) {
    if (!categories || !Array.isArray(categories)) return "general";

    const categoryMap = {
      restaurant: "restaurant",
      food: "restaurant",
      cafe: "cafe",
      hotel: "hotel",
      tourism: "attraction",
      shopping: "shopping",
      hospital: "hospital",
      school: "education",
    };

    for (const category of categories) {
      if (categoryMap[category]) {
        return categoryMap[category];
      }
    }

    return "general";
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

module.exports = new MapService();
