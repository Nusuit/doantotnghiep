// OAuth Callback Handler - processes OAuth return from Google
import { useEffect } from "react";

const OAuthCallbackHandler = ({ onSuccess, onError }) => {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const newUser = urlParams.get("new_user");
      const error = urlParams.get("error");
      const mockOAuth = urlParams.get("mock_oauth");
      const code = urlParams.get("code");

      // Handle JWT token from real OAuth callback
      if (token) {
        console.log("🔍 Processing real OAuth callback with token");

        // Store token in localStorage
        localStorage.setItem("authToken", token);

        // Show success message
        const userData = {
          token: token,
          isNewUser: newUser === "true",
          loginMethod: "google",
          message: `Đăng nhập Google thành công! ${
            newUser === "true" ? "(Tài khoản mới)" : ""
          }`,
        };

        if (onSuccess) {
          onSuccess(userData);
        }

        // Clean up URL and redirect to homepage
        window.history.replaceState({}, document.title, "/");
        return;
      }

      // Handle OAuth error
      if (error) {
        console.error("❌ OAuth error:", error);
        if (onError) {
          const errorMessage =
            error === "oauth_cancelled"
              ? "Bạn đã hủy đăng nhập Google"
              : error === "no_code"
              ? "Không nhận được mã xác thực từ Google"
              : "Đăng nhập Google thất bại";
          onError(errorMessage);
        }
        // Clean up URL
        window.history.replaceState({}, document.title, "/");
        return;
      }

      // Handle mock OAuth (for testing only)
      if (mockOAuth && code) {
        console.log("🔍 Processing mock OAuth callback");

        const mockUserData = {
          email: "test@gmail.com",
          name: "Test User",
          loginMethod: "google",
          message: "Mock OAuth đăng nhập thành công!",
        };

        // Simulate delay like real OAuth
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(mockUserData);
          }

          // Clean up URL
          window.history.replaceState({}, document.title, "/");
        }, 1000);
      }
    };

    handleOAuthCallback();
  }, [onSuccess, onError]);

  return null; // This component doesn't render anything
};

export default OAuthCallbackHandler;
