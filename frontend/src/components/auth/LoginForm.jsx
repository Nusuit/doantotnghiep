// Login form với design system và chức năng hoàn chỉnh
import { useState } from "react";
import { useAuth } from "../../hooks/useAuthNew.jsx";

const LoginForm = ({ onForgotPassword, onNeedVerification }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email là bắt buộc";
    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(formData);

    if (!result.success) {
      if (result.error === "EMAIL_NOT_VERIFIED") {
        onNeedVerification();
      } else {
        setErrors({ submit: result.error || "Đăng nhập thất bại" });
      }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-500 border border-red-200">
          {errors.submit}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-3 rounded-lg border transition-all duration-200 text-sm bg-bg-input ${
            errors.email
              ? "border-red-500 bg-red-50"
              : "border-border-primary focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          }`}
          placeholder="Nhập địa chỉ email..."
          required
        />
        {errors.email && (
          <span className="text-xs mt-1 block text-red-500">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-3 pr-10 rounded-lg border transition-all duration-200 text-sm bg-bg-input ${
              errors.password
                ? "border-red-500 bg-red-50"
                : "border-border-primary focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            }`}
            placeholder="Nhập mật khẩu..."
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs mt-1 block text-red-500">
            {errors.password}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary hover:opacity-80 transition-opacity"
        >
          Quên mật khẩu?
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
