import { API_BASE_API_URL } from "@/lib/config";

const API_BASE_URL = API_BASE_API_URL;

export interface Restaurant {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantData {
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: string;
}

export interface RestaurantResponse {
  success: boolean;
  message?: string;
  data?: {
    restaurant?: Restaurant;
    restaurants?: Restaurant[];
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

class RestaurantService {
  private async fetchAPI(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<RestaurantResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include",
        ...options,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error?.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("API call failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // GET /api/restaurants - Lấy danh sách restaurants
  async getRestaurants(
    params: {
      userId?: number;
      isActive?: boolean;
      limit?: number;
      offset?: number;
      bbox?: string; // minLng,minLat,maxLng,maxLat
    } = {}
  ): Promise<RestaurantResponse> {
    const searchParams = new URLSearchParams();

    if (params.userId) searchParams.append("userId", params.userId.toString());
    if (params.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    if (params.bbox) searchParams.append("bbox", params.bbox);

    const query = searchParams.toString();
    const endpoint = `/restaurants${query ? `?${query}` : ""}`;

    return this.fetchAPI(endpoint);
  }

  // GET /api/restaurants/:id - Lấy thông tin một restaurant
  async getRestaurant(id: number): Promise<RestaurantResponse> {
    return this.fetchAPI(`/restaurants/${id}`);
  }

  // POST /api/restaurants - Tạo restaurant mới
  async createRestaurant(
    data: CreateRestaurantData
  ): Promise<RestaurantResponse> {
    return this.fetchAPI("/restaurants", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT /api/restaurants/:id - Cập nhật restaurant
  async updateRestaurant(
    id: number,
    data: Partial<CreateRestaurantData>
  ): Promise<RestaurantResponse> {
    return this.fetchAPI(`/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE /api/restaurants/:id - Xóa restaurant
  async deleteRestaurant(id: number): Promise<RestaurantResponse> {
    return this.fetchAPI(`/restaurants/${id}`, {
      method: "DELETE",
    });
  }

  // Convert Restaurant to MapMarker format for map display
  restaurantToMapMarker(restaurant: Restaurant) {
    return {
      id: `restaurant-${restaurant.id}`,
      longitude: restaurant.longitude || 0,
      latitude: restaurant.latitude || 0,
      title: restaurant.name,
      description: `${restaurant.description || ""}${restaurant.address ? ` • ${restaurant.address}` : ""}`,
      color: "#22c55e", // Consistent green color for all restaurants
      type: "restaurant" as const,
      data: restaurant,
    };
  }

  // Convert array of restaurants to map markers
  restaurantsToMapMarkers(restaurants: Restaurant[]) {
    return restaurants.map((restaurant) =>
      this.restaurantToMapMarker(restaurant)
    );
  }
}

// Export singleton instance
export const restaurantService = new RestaurantService();

// Export default
export default restaurantService;
