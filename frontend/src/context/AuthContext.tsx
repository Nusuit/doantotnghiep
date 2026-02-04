"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_BASE_URL } from "@/lib/config";

// Types - Session User Only
export interface SessionUser {
  id: number;
  email: string;
  role: "admin" | "client";
  isEmailVerified: boolean;
  accountStatus: string;
  status?: 'authenticated' | 'partial';
  name?: string;
  avatar?: string;
}

export interface AuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthContextType extends AuthState {
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    credentials: RegisterCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // API Base URL
  const API_BASE = API_BASE_URL;

  const getCsrfToken = () =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      await refreshAuth();
    };
    initAuth();
  }, []);

  // Login function
  const login = async (
    credentials: LoginCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: credentials.username, // Backend expects email field
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));

        // Handle Unverified Account
        if (data?.error?.details?.requireVerification) {
          return {
            success: false,
            error: "ERR_VERIFY_REQUIRED", // Special code for UI to handle
          };
        }

        return {
          success: false,
          error: data?.error?.message || "Đăng nhập thất bại",
        };
      }

      // Extract session user (minimal data)
      const { user } = data.data;

      // Update state
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: "Lỗi kết nối. Vui lòng thử lại.",
      };
    }
  };

  // Register function
  const register = async (
    credentials: RegisterCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: data?.error?.message || "Đăng ký thất bại",
        };
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }));

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: "Lỗi kết nối. Vui lòng thử lại.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const csrf = getCsrfToken();
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        credentials: "include",
      });
    } catch (error) {
      // ignore logout failures
    }

    // Reset state
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Refresh auth state (validate token)
  const refreshAuth = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        logout();
        return;
      }

      const payload = await response.json();
      if (!payload.success) {
        logout();
        return;
      }

      const user = payload.data;

      // Handle Partial Auth 
      if (user.status === 'partial') {
        console.warn("User authenticated in partial mode -> Redirecting to Onboarding");
        if (window.location.pathname !== '/app/onboarding') {
          window.location.href = '/app/onboarding';
          return;
        }
      }
      else if (user.isEmailVerified === false) {
        const email = user.email;
        logout();
        if (email) {
          window.location.href = `/auth/verify-otp?email=${encodeURIComponent(email)}`;
        } else {
          window.location.href = '/auth';
        }
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false, // Ensure loading is false
      }));
    } catch (error) {
      console.error("Auth refresh error:", error);
      // Do NOT call logout() here blindly, just set loading false
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null }));
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
