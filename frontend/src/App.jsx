import { useState } from "react";
import AuthPageNew from "./components/AuthPageNew";
import ProfileSetupForm from "./components/ProfileSetupForm";
import { AuthProvider, useAuth } from "./hooks/useAuthNew.jsx";
import "./global.css";

// Main App component sau khi đăng nhập
function MainApp() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#E0E7FF" }}>
      <nav
        className="bg-white shadow-sm"
        style={{ borderBottom: "1px solid #D1D5DB" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold" style={{ color: "#FF8B20" }}>
              SocialNet
            </h1>
            <div className="flex items-center space-x-4">
              <span style={{ color: "#1F2937" }}>
                Xin chào, {user?.fullname || user?.username || user?.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium transition-colors border rounded-lg"
                style={{
                  color: "#1F2937",
                  borderColor: "#D1D5DB",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#E0E7FF";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#1F2937" }}>
            Chào mừng đến với SocialNet!
          </h2>
          <p style={{ color: "#6B7280" }}>
            Tính năng chính sẽ được phát triển ở đây...
          </p>
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ color: "#1F2937", marginBottom: "12px" }}>
              Thông tin cá nhân:
            </h3>
            <pre
              style={{ textAlign: "left", fontSize: "14px", color: "#6B7280" }}
            >
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  // Kiểm tra xem user cần setup profile không
  // Giả sử user cần setup nếu chưa có fullName
  const userNeedsProfileSetup =
    isAuthenticated && user && !user.fullName && !user.profileComplete;

  const handleProfileSetupComplete = (profileData) => {
    console.log("Profile setup completed:", profileData);
    // TODO: Save profile data to backend
    // For now, just mark as complete
    setNeedsProfileSetup(false);
  };

  if (!isAuthenticated) {
    return <AuthPageNew />;
  }

  if (userNeedsProfileSetup || needsProfileSetup) {
    return <ProfileSetupForm onComplete={handleProfileSetupComplete} />;
  }

  return <MainApp />;
}

export default App;
