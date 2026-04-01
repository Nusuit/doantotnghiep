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
  source?: string | null;
  sourceRef?: string | null;
  isReviewed?: boolean;
  reviewCount?: number;
  avgRating?: number;
}

export interface MapContextArticle {
  id: number;
  title: string;
}

export interface ContextReviewItem {
  id: number;
  stars: number;
  comment?: string | null;
  createdAt: string;
  user: {
    id: number;
    email?: string | null;
    profile?: {
      displayName?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
}

export interface ContextReviewListResponse {
  context: {
    id: number;
    name: string;
    isReviewed: boolean;
    reviewCount: number;
    avgRating: number;
  };
  reviews: ContextReviewItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export async function fetchMapContexts(params: {
  minLat?: number;
  minLng?: number;
  maxLat?: number;
  maxLng?: number;
  category?: string;
  categories?: string[];
  reviewStatus?: "all" | "reviewed" | "unreviewed";
  minStars?: number;
  limit?: number;
}): Promise<MapContextItem[]> {
  const search = new URLSearchParams();
  if (params.minLat !== undefined) search.set("minLat", String(params.minLat));
  if (params.minLng !== undefined) search.set("minLng", String(params.minLng));
  if (params.maxLat !== undefined) search.set("maxLat", String(params.maxLat));
  if (params.maxLng !== undefined) search.set("maxLng", String(params.maxLng));
  if (params.category) search.set("category", params.category);
  if (params.categories?.length) search.set("categories", params.categories.join(","));
  if (params.reviewStatus) search.set("reviewStatus", params.reviewStatus);
  if (params.minStars !== undefined) search.set("minStars", String(params.minStars));
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

export async function fetchContextReviews(
  contextId: number,
  params: {
    page?: number;
    limit?: number;
    sort?: "newest" | "highest" | "lowest";
  } = {}
): Promise<ContextReviewListResponse> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.sort) search.set("sort", params.sort);

  const response = await fetch(
    `${API_BASE_URL}/api/map/contexts/${contextId}/reviews?${search.toString()}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) throw new Error("Failed to load context reviews");

  return parseApiResponse<ContextReviewListResponse>(response);
}

export async function upsertContextReview(
  contextId: number,
  payload: {
    stars: number;
    comment?: string;
  }
) {
  const response = await fetch(`${API_BASE_URL}/api/map/contexts/${contextId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to submit review");

  return parseApiResponse<{ review: ContextReviewItem }>(response);
}
