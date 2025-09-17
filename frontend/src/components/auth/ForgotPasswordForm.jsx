// Forgot Password form với inline styles
import { useState } from "react";
import { useAuth } from "../../hooks/useAuthNew.jsx";

const ForgotPasswordForm = ({ onBack, onSent }) => {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: "Email là bắt buộc" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Email không hợp lệ" });
      return;
    }

    const result = await forgotPassword({ email });

    if (result.success) {
      setSent(true);
      setTimeout(() => {
        onSent();
      }, 2000);
    } else {
      setErrors({ submit: result.error || "Có lỗi xảy ra" });
    }
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "24px",
            color: "#15803D",
            fontSize: "14px",
          }}
        >
          📧 Email khôi phục đã được gửi!
        </div>
        <p
          style={{
            color: "#6B7280",
            marginBottom: "24px",
            fontSize: "14px",
          }}
        >
          Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email{" "}
          <strong style={{ color: "#1F2937" }}>{email}</strong>
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#6B7280",
            marginBottom: "16px",
          }}
        >
          Kiểm tra cả thư mục spam nếu không thấy email
        </p>
        <button
          type="button"
          onClick={onBack}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#F3F4F6";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#FFFFFF";
          }}
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            color: "#1F2937",
            fontWeight: "600",
            fontSize: "16px",
            padding: "12px 24px",
            border: "2px solid #D1D5DB",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
        >
          Quay lại đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h3
          style={{
            color: "#1F2937",
            marginBottom: "8px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Quên mật khẩu?
        </h3>
        <p
          style={{
            color: "#6B7280",
            fontSize: "14px",
          }}
        >
          Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu
        </p>
      </div>

      <form onSubmit={handleSubmit}>
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
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
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
          {isLoading ? "Đang gửi..." : "Gửi email khôi phục"}
        </button>

        <button
          type="button"
          onClick={onBack}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#F3F4F6";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#FFFFFF";
          }}
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            color: "#1F2937",
            fontWeight: "600",
            fontSize: "16px",
            padding: "12px 24px",
            border: "2px solid #D1D5DB",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
        >
          Quay lại đăng nhập
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
