import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuthNew.jsx";
import AuthPageNew from "./components/AuthPageNew";
import ProfileSetupForm from "./components/ProfileSetupForm";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminKeywords from "./pages/admin/AdminKeywords";
import AdminConversations from "./pages/admin/AdminConversations";
import AdminKnowledge from "./pages/admin/AdminKnowledge";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

import "./global.css";

// Kiểm tra xem user có phải lần đầu đăng nhập không
function isFirstTimeUser(user) {
  if (!user) return false;

  console.log("🔍 Checking isFirstTimeUser for:", {
    email: user.email,
    profileComplete: user.profileComplete,
    profileCompleteType: typeof user.profileComplete,
    isProfileSetup: user.isProfileSetup,
    isProfileSetupType: typeof user.isProfileSetup,
    hasBasicInfo: {
      dateOfBirth: !!user.dateOfBirth,
      gender: !!user.gender,
      priceRange: !!user.priceRange,
    },
  });

  // If profileComplete or isProfileSetup are undefined,
  // we should wait for complete profile data before making a decision
  if (user.profileComplete === undefined && user.isProfileSetup === undefined) {
    console.log(
      "⏳ Profile data not loaded yet, treating as non-first-time to prevent loops"
    );
    return false;
  }

  // Nếu user đã có profileComplete hoặc isProfileSetup = true, thì không phải first time
  // Handle both boolean and string values
  const isProfileCompleted =
    user.profileComplete === true ||
    user.profileComplete === "true" ||
    user.profileComplete === 1;
  const isSetupDone =
    user.isProfileSetup === true ||
    user.isProfileSetup === "true" ||
    user.isProfileSetup === 1;

  if (isProfileCompleted || isSetupDone) {
    console.log("✅ User already completed profile");
    return false;
  }

  // Kiểm tra user có đủ thông tin profile cơ bản không
  const hasBasicProfile = user.dateOfBirth && user.gender && user.priceRange;
  if (hasBasicProfile) {
    console.log(
      "🔧 User has basic profile but flags missing, considering as completed"
    );
    return false;
  }

  console.log("❌ User is first time");
  return true; // Nếu không có thông tin cơ bản thì là first time
}

// Kiểm tra admin email
function isAdminUser(email) {
  return email === "huykien283@gmail.com";
}

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check admin requirement first
  if (requireAdmin && !isAdminUser(user?.email)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated, user, refreshUserData, isInitializing } = useAuth();

  const handleProfileSetupComplete = async (profileData) => {
    console.log("Profile setup completed:", profileData);
    // Refresh user data để cập nhật state và chờ hoàn thành
    await refreshUserData();
    console.log("User data refreshed after profile setup");
  };

  // Show loading during initialization - wait for auth check to complete
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Kiểm tra nếu có OAuth callback token trong URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthToken =
    urlParams.get("token") || urlParams.get("code") || urlParams.get("error");

  // Xác định route đầu tiên sau khi đăng nhập
  const getHomeRoute = () => {
    if (!user) return "/auth";

    // Nếu là user lần đầu, chuyển đến profile setup
    if (isFirstTimeUser(user)) {
      return "/profile-setup";
    }

    // Nếu là admin, chuyển đến admin panel
    if (isAdminUser(user.email)) {
      return "/admin";
    }

    // User thông thường chuyển đến homepage
    return "/home";
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            {/* Authentication Route - ưu tiên xử lý OAuth callback */}
            <Route
              path="/auth"
              element={
                !isAuthenticated || hasOAuthToken ? (
                  <AuthPageNew />
                ) : (
                  <Navigate to={getHomeRoute()} replace />
                )
              }
            />

            {/* Profile Setup Route - chỉ cho user lần đầu */}
            <Route
              path="/profile-setup"
              element={
                isAuthenticated ? (
                  isFirstTimeUser(user) ? (
                    <ProfileSetupForm onComplete={handleProfileSetupComplete} />
                  ) : (
                    <Navigate to={getHomeRoute()} replace />
                  )
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            {/* Homepage cho user thường */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - chỉ cho admin email */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="keywords" element={<AdminKeywords />} />
              <Route path="conversations" element={<AdminConversations />} />
              <Route path="knowledge" element={<AdminKnowledge />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Root route - điều hướng thông minh, nhưng ưu tiên OAuth callback */}
            <Route
              path="/"
              element={
                hasOAuthToken ? (
                  <AuthPageNew />
                ) : isAuthenticated ? (
                  <Navigate to={getHomeRoute()} replace />
                ) : (
                  <LandingPage />
                )
              }
            />

            {/* Fallback cho các route không tồn tại - không can thiệp OAuth */}
            <Route
              path="*"
              element={
                hasOAuthToken ? (
                  <AuthPageNew />
                ) : isAuthenticated ? (
                  <Navigate to={getHomeRoute()} replace />
                ) : (
                  <LandingPage />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
