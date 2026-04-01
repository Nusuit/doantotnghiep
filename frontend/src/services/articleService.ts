import { API_BASE_URL } from "@/lib/config";
import { parseApiResponse } from "@/lib/apiResponse";

export interface CreateArticleData {
    title: string;
    content: string;
    categoryId?: number;
    locationContext?: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    url?: string;
}

export const createArticle = async (data: CreateArticleData) => {
    const response = await fetch(`${API_BASE_URL}/api/feed/create`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Failed to create article");
    }

    return parseApiResponse(response);
};
