// AuthPage component chính - trang đăng nhập/đăng ký theo design specs
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (formData) => {
    setIsLoading(true);
    try {
      // TODO: Gọi API đăng nhập
      console.log("Login data:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Đăng nhập thành công!");
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setIsLoading(true);
    try {
      // TODO: Gọi API đăng ký
      console.log("Register data:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Đăng ký thành công!");
    } catch (error) {
      console.error("Register error:", error);
      alert("Đăng ký thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-500 mb-2">
              SocialNet
            </h1>
            <p className="text-gray-600">
              Kết nối với bạn bè và thế giới xung quanh
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("login")}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                  activeTab === "login"
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                  activeTab === "register"
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                Đăng ký
              </button>
            </div>
          </div>

          {/* Forms */}
          {activeTab === "login" ? (
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          ) : (
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
