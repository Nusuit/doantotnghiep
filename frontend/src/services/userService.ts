import { API_BASE_URL } from "@/lib/config";

const API_BASE = `${API_BASE_URL}/api/users`;

export interface UserProfile {
    id: number;
    displayName: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
}

export interface UserData {
    id: number;
    email: string;
    role: string;
    accountStatus: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    profile?: UserProfile;
}

export const UserService = {
    // Get Current User (Private)
    getMe: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
        try {
            // Typically the cookie is sent automatically with credentials: include
            const response = await fetch(`${API_BASE}/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                return { success: false, error: "Failed to fetch user profile" };
            }

            const data = await response.json();
            return { success: true, user: data.data.user };
        } catch (error) {
            console.error("UserService.getMe error:", error);
            return { success: false, error: "Network error" };
        }
    },

    // Update Profile
    updateProfile: async (data: { fullName: string; bio?: string; avatarUrl?: string }): Promise<{ success: boolean; profile?: UserProfile; error?: string }> => {
        try {
            const resp = await fetch(`${API_BASE}/me/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Important for Auth Cookie
                body: JSON.stringify(data),
            });

            const json = await resp.json();
            if (!resp.ok) {
                return { success: false, error: json.error?.message || "Update failed" };
            }

            return { success: true, profile: json.data.profile };
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    },

    // Get Public Profile
    getUserById: async (id: number): Promise<{ success: boolean; user?: Partial<UserData>; error?: string }> => {
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) return { success: false, error: "User not found" };
            const data = await response.json();
            return { success: true, user: data.data.user };
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    }
};
