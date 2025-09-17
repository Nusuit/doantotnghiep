// Google OAuth Button Component
import { useState } from "react";

const GoogleOAuthButton = ({ mode = "login", onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);

      // Get Google OAuth URL from backend
      const response = await fetch("http://localhost:4000/api/auth/google", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối với Google OAuth");
      }

      const data = await response.json();

      if (!data.success || !data.authUrl) {
        throw new Error("Không thể tạo Google OAuth URL");
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Google OAuth Error:", error);
      setIsLoading(false);
      if (onError) {
        onError(error.message || "Đăng nhập Google thất bại");
      }
    }
  };

  const buttonText =
    mode === "login" ? "Đăng nhập với Google" : "Đăng ký với Google";

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      style={{
        width: "100%",
        padding: "12px",
        border: "2px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "#374151",
        fontSize: "16px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        cursor: isLoading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: isLoading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.target.style.backgroundColor = "#f9fafb";
          e.target.style.borderColor = "#d1d5db";
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.target.style.backgroundColor = "#ffffff";
          e.target.style.borderColor = "#e5e7eb";
        }
      }}
    >
      {isLoading ? (
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid #e5e7eb",
            borderTop: "2px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      ) : (
        <>
          {/* Google Icon SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
};

// Add CSS animation for spinner
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default GoogleOAuthButton;
