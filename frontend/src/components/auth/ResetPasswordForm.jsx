// Reset Password form
import { useState } from "react";
import { useAuth } from "../../hooks/useAuthNew.jsx";

const ResetPasswordForm = ({ onBack, onSuccess }) => {
  const { resetPassword, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.token) newErrors.token = "Mã xác thực là bắt buộc";
    if (!formData.password) {
      newErrors.password = "Mật khẩu mới là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await resetPassword(formData);

    if (result.success) {
      onSuccess();
    } else {
      setErrors({ submit: result.error || "Có lỗi xảy ra" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-24)", textAlign: "center" }}>
        <h3
          style={{ color: "var(--color-text)", marginBottom: "var(--space-8)" }}
        >
          Đặt lại mật khẩu
        </h3>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Nhập mã xác thực từ email và mật khẩu mới
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {errors.submit && (
          <div
            className="status status--error"
            style={{ marginBottom: "var(--space-16)" }}
          >
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Mã xác thực</label>
          <input
            type="text"
            name="token"
            value={formData.token}
            onChange={handleChange}
            className={`form-control ${errors.token ? "error" : ""}`}
            placeholder="Nhập mã 6 chữ số từ email..."
            maxLength="6"
            required
          />
          {errors.token && (
            <span
              className="error-message"
              style={{
                color: "var(--color-error)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {errors.token}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu mới</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? "error" : ""}`}
              placeholder="Tạo mật khẩu mới..."
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "var(--space-12)",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <span
              className="error-message"
              style={{
                color: "var(--color-error)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {errors.password}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control ${
                errors.confirmPassword ? "error" : ""
              }`}
              placeholder="Nhập lại mật khẩu mới..."
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "var(--space-12)",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.confirmPassword && (
            <span
              className="error-message"
              style={{
                color: "var(--color-error)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn--primary btn--full-width"
          style={{ marginBottom: "var(--space-16)" }}
        >
          {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="btn btn--secondary btn--full-width"
        >
          Quay lại
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
