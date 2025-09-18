// AuthPage component chính - hệ thống authentication hoàn chỉnh với design system
import { useState } from "react";
import LoginForm from "./auth/LoginFormNew";
import RegisterForm from "./auth/RegisterFormNew";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import ResetPasswordForm from "./auth/ResetPasswordForm";
import VerifyAccountForm from "./auth/VerifyAccountForm";
import OAuthCallbackHandler from "./OAuthCallbackHandler";
import { useAuth } from "../hooks/useAuthNew.jsx";
import { useLocation } from "react-router-dom";

const AuthPage = () => {
  const location = useLocation();
  const initialMode = location.state?.mode || "login";

  const [activeTab, setActiveTab] = useState(initialMode);
  const [currentStep, setCurrentStep] = useState("auth"); // auth, forgot, reset, verify
  const { checkAuth } = useAuth();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setCurrentStep("auth");
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const handleOAuthSuccess = async (userData) => {
    console.log("OAuth Success:", userData);

    // Real OAuth with JWT token - trigger auth check
    if (userData.token) {
      console.log("✅ OAuth success processed, triggering auth check");
      // Manually trigger auth check to update isAuthenticated
      await checkAuth();
    } else {
      // Mock OAuth - show alert for testing
      alert(`Đăng nhập thành công với ${userData.email}!`);
    }
  };

  const handleOAuthError = (error) => {
    console.error("OAuth Error:", error);
    alert(`Lỗi OAuth: ${error}`);
  };

  const renderContent = () => {
    console.log("Current step:", currentStep, "Active tab:", activeTab);

    try {
      if (currentStep === "forgot") {
        return (
          <ForgotPasswordForm
            onBack={() => setCurrentStep("auth")}
            onSent={() => setCurrentStep("reset")}
          />
        );
      }

      if (currentStep === "reset") {
        return (
          <ResetPasswordForm
            onBack={() => setCurrentStep("forgot")}
            onSuccess={() => setCurrentStep("auth")}
          />
        );
      }

      if (currentStep === "verify") {
        return (
          <VerifyAccountForm
            onBack={() => setCurrentStep("auth")}
            onVerified={() => setCurrentStep("auth")}
          />
        );
      }

      // Default auth forms
      return (
        <>
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => handleTabSwitch("login")}
              className={`px-6 py-2 font-semibold rounded-t-lg cursor-pointer transition-all duration-200 ${
                activeTab === "login"
                  ? "text-orange-500 bg-orange-100"
                  : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => handleTabSwitch("register")}
              className={`px-6 py-2 font-semibold rounded-t-lg cursor-pointer transition-all duration-200 ${
                activeTab === "register"
                  ? "text-orange-500 bg-orange-100"
                  : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              Đăng ký
            </button>
          </div>
          {/* Forms */}
          {activeTab === "login" ? (
            <LoginForm
              onForgotPassword={() => handleStepChange("forgot")}
              onNeedVerification={() => handleStepChange("verify")}
            />
          ) : (
            <RegisterForm onSuccess={() => handleStepChange("verify")} />
          )}
        </>
      );
    } catch (error) {
      console.error("Error rendering content:", error);
      return <div>Error loading form</div>;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "#E0E7FF",
        margin: 0,
        padding: 0,
        width: "100%",
        minHeight: "100vh",
      }}
    >
      {/* OAuth Callback Handler - processes OAuth returns */}
      <OAuthCallbackHandler
        onSuccess={handleOAuthSuccess}
        onError={handleOAuthError}
      />

      <div
        className="w-full max-w-md"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="bg-white rounded-2xl shadow-xl border p-8"
          style={{
            borderColor: "#D1D5DB",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "#FF8B20" }}
            >
              SocialNet
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Kết nối với bạn bè và thế giới xung quanh
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
