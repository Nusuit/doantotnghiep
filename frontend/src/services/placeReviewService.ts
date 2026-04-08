import { apiClient } from "@/lib/api"; // axios instance: baseURL=/api, withCredentials, auto-CSRF

export interface CreatePlaceInput {
  name: string;
  description?: string;
  category?: string;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface PlaceResult {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  address: string | null;
  reviewCount: number;
}

export interface PublishReviewInput {
  stars: number;
  content: string;
  visibility: "PUBLIC" | "PRIVATE" | "PREMIUM";
  depositAmount?: number;
}

export async function createPlace(
  data: CreatePlaceInput,
  signal?: AbortSignal
): Promise<{ place: PlaceResult; duplicate: boolean }> {
  const res = await apiClient.post("/map/places", data, { signal });
  return res.data.data;
}

export async function publishPlaceReview(
  placeId: number,
  data: PublishReviewInput,
  signal?: AbortSignal
) {
  const res = await apiClient.post(`/map/places/${placeId}/reviews/publish`, data, { signal });
  return res.data.data;
}
