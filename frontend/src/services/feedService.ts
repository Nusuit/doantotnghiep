import { API_BASE_URL } from "@/lib/config";
import { parseApiResponse } from "@/lib/apiResponse";

export interface FeedItem {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  category?: {
    name: string;
    slug: string;
  } | null;
  location?: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  field: string;
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor?: string;
}

export async function fetchFeed(limit = 20, cursor?: string): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(`${API_BASE_URL}/api/feed?${params.toString()}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load feed");
  }

  return parseApiResponse<FeedResponse>(response);
}
