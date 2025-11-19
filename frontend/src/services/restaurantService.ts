const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface Restaurant {
  id: number;
  userId: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  imageUrl?: string;
  category?: string;
  priceLevel?: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    profile?: {
      displayName: string;
      avatarUrl?: string;
    };
  };
}

export interface CreateRestaurantData {
  name: string;
  description: string;
  address: string;
  userId: number;
  category?: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  priceLevel?: number;
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
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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
    } = {}
  ): Promise<RestaurantResponse> {
    const searchParams = new URLSearchParams();

    if (params.userId) searchParams.append("userId", params.userId.toString());
    if (params.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());

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
      longitude: restaurant.longitude,
      latitude: restaurant.latitude,
      title: restaurant.name,
      description: `${restaurant.description} • ${restaurant.address}`,
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
