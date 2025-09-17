// Component ProtectedRoute để bảo vệ các trang yêu cầu authentication
import { useAuth } from "../hooks/useAuthNew.jsx";

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  // Show loading while checking authentication
  if (isInitializing) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ padding: "var(--space-32)" }}>
            <div style={{ marginBottom: "var(--space-16)" }}>🔄</div>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Đang kiểm tra đăng nhập...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated, show login
  if (requireAuth && !isAuthenticated) {
    return children; // This should be AuthPage
  }

  // If route doesn't require auth but user is authenticated, redirect to main app
  if (!requireAuth && isAuthenticated) {
    return children; // This should be MainApp
  }

  return children;
};

export default ProtectedRoute;
