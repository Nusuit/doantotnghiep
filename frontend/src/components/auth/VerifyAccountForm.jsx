// Verify Account form
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthNew.jsx";

const VerifyAccountForm = ({ onBack, onVerified }) => {
  const { verifyAccount, resendVerification, isLoading } = useAuth();
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!code) {
      setErrors({ code: "Mã xác thực là bắt buộc" });
      return;
    }

    if (code.length !== 6) {
      setErrors({ code: "Mã xác thực phải có 6 chữ số" });
      return;
    }

    const result = await verifyAccount({ code });

    if (result.success) {
      onVerified();
    } else {
      setErrors({ submit: result.error || "Mã xác thực không hợp lệ" });
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setErrors({});

    const result = await resendVerification();

    if (result.success) {
      setResendTimer(60); // 60 seconds cooldown
    } else {
      setErrors({ submit: result.error || "Không thể gửi lại mã" });
    }

    setResendLoading(false);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    if (errors.code) setErrors({});
  };

  return (
    <div>
      <div style={{ marginBottom: "var(--space-24)", textAlign: "center" }}>
        <h3
          style={{ color: "var(--color-text)", marginBottom: "var(--space-8)" }}
        >
          Xác thực tài khoản
        </h3>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Chúng tôi đã gửi mã xác thực 6 chữ số đến email của bạn
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
            value={code}
            onChange={handleCodeChange}
            className={`form-control ${errors.code ? "error" : ""}`}
            placeholder="Nhập mã 6 chữ số..."
            style={{
              textAlign: "center",
              fontSize: "var(--font-size-lg)",
              letterSpacing: "4px",
              fontWeight: "var(--font-weight-bold)",
            }}
            maxLength="6"
            required
          />
          {errors.code && (
            <span
              className="error-message"
              style={{
                color: "var(--color-error)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {errors.code}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn--primary btn--full-width"
          style={{ marginBottom: "var(--space-16)" }}
        >
          {isLoading ? "Đang xác thực..." : "Xác thực tài khoản"}
        </button>

        <div style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-sm)",
              marginBottom: "var(--space-8)",
            }}
          >
            Không nhận được mã?
          </p>
          {resendTimer > 0 ? (
            <span
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Gửi lại sau {resendTimer}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-primary)",
                cursor: "pointer",
                fontSize: "var(--font-size-sm)",
                textDecoration: "underline",
              }}
            >
              {resendLoading ? "Đang gửi..." : "Gửi lại mã"}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn btn--secondary btn--full-width"
        >
          Quay lại
        </button>
      </form>

      <div
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-secondary)",
          textAlign: "center",
          marginTop: "var(--space-16)",
        }}
      >
        💡 Kiểm tra cả thư mục spam nếu không thấy email
      </div>
    </div>
  );
};

export default VerifyAccountForm;
