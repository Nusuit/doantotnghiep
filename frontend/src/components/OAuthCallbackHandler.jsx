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

        // Store token in localStorage (same key as regular login)
        localStorage.setItem("token", token);

        // Clean up URL immediately to prevent loop
        window.history.replaceState({}, document.title, "/");

        // Simulate user data (in real app, decode JWT or fetch user info)
        const userData = {
          token: token,
          isNewUser: newUser === "true",
          loginMethod: "google",
        };

        if (onSuccess) {
          onSuccess(userData);
        }

        return;
      }

      // Handle OAuth error
      if (error) {
        console.error("❌ OAuth error:", error);
        if (onError) {
          onError(error);
        }
        // Clean up URL
        window.history.replaceState({}, document.title, "/");
        return;
      }

      // Handle mock OAuth (keep for testing)
      if (mockOAuth && code) {
        // This is a mock OAuth callback
        console.log("🔍 Processing mock OAuth callback");

        // Simulate successful OAuth
        const mockUserData = {
          email: "test@gmail.com",
          name: "Test User",
          given_name: "Test",
          family_name: "User",
          picture: "https://via.placeholder.com/150",
          locale: "en",
        };

        // Simulate delay like real OAuth
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(mockUserData);
          }

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }, 1000);
      }
    };

    handleOAuthCallback();
  }, [onSuccess, onError]);

  return null;
};

export default OAuthCallbackHandler;
