// Register form với inline styles - đơn giản chỉ có email và password
import { useState } from "react";
import { useAuth } from "../../hooks/useAuthNew.jsx";
import GoogleOAuthButton from "../GoogleOAuthButton.jsx";

const RegisterForm = ({ onSuccess }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setSuccessMessage(result.message || "Đăng ký thành công!");
      // Delay before calling onSuccess to show success message
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else {
      setErrors({ submit: result.error || "Đăng ký thất bại" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleGoogleSuccess = (data) => {
    console.log("Google OAuth success:", data);
    setSuccessMessage("Đăng ký với Google thành công!");
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1500);
  };

  const handleGoogleError = (error) => {
    console.error("Google OAuth error:", error);
    setErrors({ submit: error || "Đăng ký với Google thất bại" });
  };

  return (
    <div>
      {/* Google OAuth Button */}
      <GoogleOAuthButton
        mode="register"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "20px 0",
          fontSize: "14px",
          color: "#6B7280",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "1px",
            backgroundColor: "#E5E7EB",
          }}
        ></div>
        <span
          style={{
            padding: "0 16px",
            backgroundColor: "#FFFFFF",
          }}
        >
          Hoặc đăng ký với email
        </span>
        <div
          style={{
            flex: 1,
            height: "1px",
            backgroundColor: "#E5E7EB",
          }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
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
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              color: "#DC2626",
              fontSize: "14px",
            }}
          >
            {errors.submit}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "6px",
              color: "#1F2937",
            }}
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            onFocus={(e) => {
              e.target.style.borderColor = "#FF8B20";
              e.target.style.outline = "none";
              e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.email ? "#DC2626" : "#D1D5DB";
              e.target.style.boxShadow = "none";
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: `2px solid ${errors.email ? "#DC2626" : "#D1D5DB"}`,
              borderRadius: "8px",
              fontSize: "16px",
              transition: "all 0.2s ease-in-out",
              backgroundColor: "#FFFFFF",
            }}
            placeholder="Nhập địa chỉ email..."
            required
          />
          {errors.email && (
            <span
              style={{
                display: "block",
                color: "#DC2626",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {errors.email}
            </span>
          )}
        </div>

        {/* Mật khẩu */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "6px",
              color: "#1F2937",
            }}
          >
            Mật khẩu
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="off"
              onFocus={(e) => {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.outline = "none";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.password
                  ? "#DC2626"
                  : "#D1D5DB";
                e.target.style.boxShadow = "none";
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                paddingRight: "50px",
                border: `2px solid ${errors.password ? "#DC2626" : "#D1D5DB"}`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
              }}
              placeholder="Tạo mật khẩu..."
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <span
              style={{
                display: "block",
                color: "#DC2626",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {errors.password}
            </span>
          )}
        </div>

        {/* Xác nhận mật khẩu */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "6px",
              color: "#1F2937",
            }}
          >
            Xác nhận mật khẩu
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="off"
              onFocus={(e) => {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.outline = "none";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.confirmPassword
                  ? "#DC2626"
                  : "#D1D5DB";
                e.target.style.boxShadow = "none";
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                paddingRight: "50px",
                border: `2px solid ${
                  errors.confirmPassword ? "#DC2626" : "#D1D5DB"
                }`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
              }}
              placeholder="Nhập lại mật khẩu..."
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.confirmPassword && (
            <span
              style={{
                display: "block",
                color: "#DC2626",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = "#EA580C";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = "#FF8B20";
            }
          }}
          style={{
            width: "100%",
            backgroundColor: isLoading ? "#D1D5DB" : "#FF8B20",
            color: "#FFFFFF",
            fontWeight: "600",
            fontSize: "16px",
            padding: "12px 24px",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-in-out",
            marginBottom: "16px",
          }}
        >
          {isLoading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        {/* Terms and Privacy */}
        <div
          style={{ textAlign: "center", fontSize: "12px", color: "#6B7280" }}
        >
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <span style={{ color: "#FF8B20", cursor: "pointer" }}>
            Điều khoản dịch vụ
          </span>{" "}
          và{" "}
          <span style={{ color: "#FF8B20", cursor: "pointer" }}>
            Chính sách bảo mật
          </span>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
