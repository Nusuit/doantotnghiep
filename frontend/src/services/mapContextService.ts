import { API_BASE_URL } from "@/lib/config";
import { parseApiResponse } from "@/lib/apiResponse";

export interface MapContextItem {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
}

export interface MapContextArticle {
  id: number;
  title: string;
}

export async function fetchMapContexts(params: {
  minLat?: number;
  minLng?: number;
  maxLat?: number;
  maxLng?: number;
  limit?: number;
}): Promise<MapContextItem[]> {
  const search = new URLSearchParams();
  if (params.minLat !== undefined) search.set("minLat", String(params.minLat));
  if (params.minLng !== undefined) search.set("minLng", String(params.minLng));
  if (params.maxLat !== undefined) search.set("maxLat", String(params.maxLat));
  if (params.maxLng !== undefined) search.set("maxLng", String(params.maxLng));
  if (params.limit !== undefined) search.set("limit", String(params.limit));

  const response = await fetch(`${API_BASE_URL}/api/map/contexts?${search.toString()}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load map contexts");

  const data = await parseApiResponse<{ contexts: MapContextItem[] }>(response);
  return data.contexts || [];
}

export async function fetchContextArticles(contextId: number): Promise<MapContextArticle[]> {
  const response = await fetch(`${API_BASE_URL}/api/map/contexts/${contextId}/articles`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to load context articles");

  const data = await parseApiResponse<{ articles: MapContextArticle[] }>(response);
  return data.articles || [];
}
