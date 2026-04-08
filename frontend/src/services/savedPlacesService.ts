import { API_BASE_URL } from "@/lib/config";
import { parseApiResponse } from "@/lib/apiResponse";

export interface SavedPlace {
  id: string;
  name: string;
  address?: string;
  coordinates: { lat: number; lng: number };
  category?: string;
  createdAt: string;
}

export async function fetchSavedPlaces(): Promise<SavedPlace[]> {
  const res = await fetch(`${API_BASE_URL}/api/map/favorites`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not load saved places");
  return parseApiResponse<SavedPlace[]>(res);
}

export async function savePlace(place: {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  category?: string;
}): Promise<SavedPlace> {
  const res = await fetch(`${API_BASE_URL}/api/map/favorites`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(place),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Could not save place");
  }
  return parseApiResponse<SavedPlace>(res);
}

export async function unsavePlace(favoriteId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/map/favorites/${favoriteId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Could not remove saved place");
  }
}
