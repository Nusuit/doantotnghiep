import { API_BASE_URL } from "@/lib/config";

const API_BASE = `${API_BASE_URL}/api/auth`;

export const AuthService = {
    forgotPassword: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        try {
            const response = await fetch(`${API_BASE}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error?.message || "Failed to send reset email" };
            }

            return { success: true, message: data.data?.message };
        } catch (error) {
            console.error("AuthService.forgotPassword error:", error);
            return { success: false, error: "Network error" };
        }
    },

    resetPassword: async (email: string, otpCode: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
        try {
            const response = await fetch(`${API_BASE}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otpCode, newPassword }),
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error?.message || "Failed to reset password" };
            }

            return { success: true, message: data.data?.message };
        } catch (error) {
            console.error("AuthService.resetPassword error:", error);
            return { success: false, error: "Network error" };
        }
    }
};
