// useAuth hook - quản lý authentication state hoàn chỉnh
import { useState, useContext, createContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, []);
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      // Kiểm tra content type trước khi parse JSON
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Nếu không phải JSON, có thể là HTML error page
        const text = await response.text();
        console.error("Non-JSON response:", text);
        return { success: false, error: "Lỗi server: API không khả dụng" };
      }

      // Check response status instead of data.success since TypeScript backend doesn't return success field
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        // Lưu token vào localStorage
        localStorage.setItem("token", data.tokens?.accessToken || data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || data.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Lỗi kết nối" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // Check response status instead of data.success since TypeScript backend doesn't return success field
      if (response.ok) {
        return {
          success: true,
          message:
            data.message ||
            "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
        };
      } else {
        return { success: false, error: data.message || data.error };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Lỗi kết nối" };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async ({ email }) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message || "Email khôi phục đã được gửi",
        };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, error: "Lỗi kết nối" };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async ({ token, password }) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message || "Mật khẩu đã được đặt lại thành công",
        };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "Lỗi kết nối" };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAccount = async ({ code }) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: code }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update user verification status
        if (user) {
          const updatedUser = { ...user, is_email_verified: true };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        return {
          success: true,
          message: data.message || "Tài khoản đã được xác thực thành công",
        };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Verify account error:", error);
      return { success: false, error: "Lỗi kết nối" };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    setIsLoading(true);
    try {
      // TODO: Gọi API resend verification
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: "Mã xác thực đã được gửi lại" };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      return { success: false, error: "Lỗi kết nối" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch("http://localhost:4000/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    }

    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const checkAuth = async () => {
    setIsInitializing(true);
    const token = localStorage.getItem("token");

    if (token) {
      try {
        console.log("🔍 Starting auth check with full profile data fetch...");

        const response = await fetch("http://localhost:4000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log("🔍 Full profile data received:", data);

            if (data.success && data.user) {
              // Set user with COMPLETE profile data from database
              console.log(
                "✅ Setting authenticated user with full profile data"
              );
              setUser(data.user);
              setIsAuthenticated(true);
              localStorage.setItem("user", JSON.stringify(data.user));

              console.log("✅ Auth check completed with user:", {
                email: data.user.email,
                profileComplete: data.user.profileComplete,
                isProfileSetup: data.user.isProfileSetup,
                hasBasicData: {
                  dateOfBirth: !!data.user.dateOfBirth,
                  gender: !!data.user.gender,
                  priceRange: !!data.user.priceRange,
                },
              });
            } else {
              console.warn("❌ API response invalid:", data);
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            console.warn("❌ Non-JSON response");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.warn("❌ API response not OK:", response.status);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsInitializing(false);
  };

  const setAdminRole = () => {
    if (user) {
      setUser({ ...user, role: "admin" });
      localStorage.setItem("user", JSON.stringify({ ...user, role: "admin" }));
    }
  };

  const refreshUserData = async () => {
    console.log("🔄 Refreshing user data from API...");

    // Try to fetch fresh data from API first
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch("http://localhost:4000/api/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const freshUser = data.user || data;
          console.log("✅ User data refreshed from API:", {
            email: freshUser.email,
            profileComplete: freshUser.profileComplete,
            isProfileSetup: freshUser.isProfileSetup,
          });

          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
          return freshUser;
        } else {
          console.warn("API response not OK:", response.status);
        }
      }
    } catch (error) {
      console.warn("Failed to fetch fresh user data from API:", error.message);
    }

    // Fallback: refresh from localStorage
    console.log("📦 Falling back to localStorage");
    return new Promise((resolve) => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Use setTimeout to ensure state update is complete
        setTimeout(() => resolve(parsedUser), 0);
      } else {
        resolve(null);
      }
    });
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isInitializing,
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyAccount,
    resendVerification,
    logout,
    checkAuth,
    setAdminRole, // For testing
    refreshUserData, // Refresh user data
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default useAuth;
