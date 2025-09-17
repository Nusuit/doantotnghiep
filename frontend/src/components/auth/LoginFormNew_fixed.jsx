// Login form với inline styles
import { useState } from "react";
import { useAuth } from "../../hooks/useAuthNew.jsx";
import GoogleOAuthButton from "../GoogleOAuthButton.jsx";

const LoginForm = ({ onForgotPassword, onNeedVerification }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email là bắt buộc";
    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setSuccessMessage("Đăng nhập thành công!");
    } else {
      if (result.needVerification) {
        onNeedVerification();
      } else {
        setErrors({ submit: result.error });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGoogleSuccess = (data) => {
    console.log("Google OAuth success:", data);
    setSuccessMessage("Đăng nhập với Google thành công!");
  };

  const handleGoogleError = (error) => {
    setErrors({ submit: error });
  };

  return (
    <div className="space-y-4">
      {/* Google OAuth Button */}
      <GoogleOAuthButton
        mode="login"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span
            className="px-2 text-gray-500"
            style={{ backgroundColor: "#E0E7FF" }}
          >
            Hoặc đăng nhập với email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        {successMessage && (
          <div
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              color: "#15803D",
              fontSize: "14px",
            }}
          >
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div
            className="p-3 rounded-lg text-sm font-medium border"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#EF4444",
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
          >
            {errors.submit}
          </div>
        )}

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#1F2937" }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-3 py-3 rounded-lg border transition-all duration-200 text-sm"
            style={{
              backgroundColor: errors.email
                ? "rgba(239, 68, 68, 0.05)"
                : "#E0E7FF",
              borderColor: errors.email ? "#EF4444" : "#D1D5DB",
              color: "#1F2937",
            }}
            onFocus={(e) => {
              if (!errors.email) {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.backgroundColor = "#FFFFFF";
                e.target.style.boxShadow = "0 0 0 2px rgba(255, 139, 32, 0.2)";
              }
            }}
            onBlur={(e) => {
              if (!errors.email) {
                e.target.style.borderColor = "#D1D5DB";
                e.target.style.backgroundColor = "#E0E7FF";
                e.target.style.boxShadow = "none";
              }
            }}
            placeholder="Nhập email..."
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "#1F2937" }}
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="off"
              className="w-full px-3 py-3 pr-10 rounded-lg border transition-all duration-200 text-sm"
              style={{
                backgroundColor: errors.password
                  ? "rgba(239, 68, 68, 0.05)"
                  : "#E0E7FF",
                borderColor: errors.password ? "#EF4444" : "#D1D5DB",
                color: "#1F2937",
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = "#FF8B20";
                  e.target.style.backgroundColor = "#FFFFFF";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(255, 139, 32, 0.2)";
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.backgroundColor = "#E0E7FF";
                  e.target.style.boxShadow = "none";
                }
              }}
              placeholder="Nhập mật khẩu..."
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
              style={{ color: "#6B7280" }}
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#FF8B20" }}
          onMouseEnter={(e) =>
            !isLoading && (e.target.style.backgroundColor = "#FBBF24")
          }
          onMouseLeave={(e) =>
            !isLoading && (e.target.style.backgroundColor = "#FF8B20")
          }
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm transition-opacity hover:opacity-80"
            style={{ color: "#FF8B20" }}
          >
            Quên mật khẩu?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
