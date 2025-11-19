"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "client";
  isEmailVerified: boolean;
  accountStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
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
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear corrupted data
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
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
        body: JSON.stringify({
          email: credentials.username, // Backend expects email field
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: data.message || "Đăng nhập thất bại",
        };
      }

      // Extract user and token from response
      const { user, token } = data;

      // Store in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));

      // Update state
      setAuthState({
        user,
        token,
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
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          error: data.message || "Đăng ký thất bại",
        };
      }

      // Auto-login after successful registration
      if (data.user && data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("authUser", JSON.stringify(data.user));

        setAuthState({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }

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
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    // Reset state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Refresh auth state (validate token)
  const refreshAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        logout();
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        logout();
        return;
      }

      const user = await response.json();
      localStorage.setItem("authUser", JSON.stringify(user));

      setAuthState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error("Auth refresh error:", error);
      logout();
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
