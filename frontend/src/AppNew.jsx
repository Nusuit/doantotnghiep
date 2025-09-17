// App.jsx - Main application với authentication flow hoàn chỉnh
import { AuthProvider, useAuth } from "./hooks/useAuthNew.jsx";
import AuthPageNew from "./components/AuthPageNew.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./App.css";

// Loading component
const LoadingScreen = () => (
  <div className="auth-container">
    <div className="auth-card" style={{ textAlign: "center" }}>
      <div style={{ padding: "var(--space-32)" }}>
        <div
          style={{
            marginBottom: "var(--space-16)",
            fontSize: "var(--font-size-2xl)",
          }}
        >
          🔄
        </div>
        <h3
          style={{
            color: "var(--color-text)",
            marginBottom: "var(--space-8)",
          }}
        >
          SocialNet
        </h3>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Đang khởi động...
        </p>
      </div>
    </div>
  </div>
);

// Main App component sau khi đăng nhập
const MainApp = () => {
  const { user, logout } = useAuth();

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--color-background)" }}
    >
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-logo">SocialNet</h1>
          </div>

          <div className="header-center">
            <div className="search-box">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="form-control"
                style={{ borderRadius: "var(--radius-full)" }}
              />
              <button className="search-btn">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="header-right">
            <button className="header-btn">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-12)",
              }}
            >
              <span style={{ color: "var(--color-text)" }}>
                Xin chào, {user?.fullname || user?.username}
              </span>
              <button onClick={logout} className="btn btn--secondary btn--sm">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ paddingTop: "var(--space-32)" }}>
        <div className="card">
          <div className="card__body" style={{ textAlign: "center" }}>
            <h2
              style={{
                color: "var(--color-text)",
                marginBottom: "var(--space-16)",
              }}
            >
              🎉 Chào mừng đến với SocialNet!
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-24)",
              }}
            >
              Hệ thống authentication đã hoạt động thành công. Các tính năng
              chính sẽ được phát triển tiếp theo.
            </p>

            {/* User Info Card */}
            <div
              className="card"
              style={{ maxWidth: "400px", margin: "0 auto" }}
            >
              <div className="card__body">
                <h4 style={{ marginBottom: "var(--space-16)" }}>
                  Thông tin tài khoản
                </h4>
                <div style={{ textAlign: "left" }}>
                  <p>
                    <strong>Họ tên:</strong> {user?.fullname}
                  </p>
                  <p>
                    <strong>Username:</strong> {user?.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>
                    <span
                      className="status status--success"
                      style={{ marginLeft: "var(--space-8)" }}
                    >
                      Đã xác thực
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// App Content component với routing logic
const AppContent = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute requireAuth={false}>
      {isAuthenticated ? <MainApp /> : <AuthPageNew />}
    </ProtectedRoute>
  );
};

// Main App component with Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
