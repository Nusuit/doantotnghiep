"use client";

import React, { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      <p className="mt-4 text-gray-600">Đang tải...</p>
    </div>
  </div>
);

// Unauthorized access component
const UnauthorizedAccess: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Không có quyền truy cập
      </h1>
      <p className="text-gray-600 mb-6">
        Bạn không có quyền truy cập vào trang này.
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
      >
        Quay lại
      </button>
    </div>
  </div>
);

// Protected Route Types
interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ("admin" | "client")[];
  redirectTo?: string;
  fallback?: ReactNode;
}

// Main Protected Route Component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles = ["admin", "client"],
  redirectTo,
  fallback,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || "/auth");
      return;
    }

    // If user is authenticated but doesn't have required role
    if (
      requireAuth &&
      isAuthenticated &&
      user &&
      !allowedRoles.includes(user.role)
    ) {
      // Don't redirect, just show unauthorized component
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requireAuth,
    allowedRoles,
    router,
    redirectTo,
  ]);

  // Show loading while checking auth
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // If auth is required but user is not authenticated, show loading (will redirect)
  if (requireAuth && !isAuthenticated) {
    return fallback || <LoadingSpinner />;
  }

  // If user is authenticated but doesn't have required role
  if (
    requireAuth &&
    isAuthenticated &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    return <UnauthorizedAccess />;
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Convenience components for specific roles
export const AdminRoute: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <ProtectedRoute
    requireAuth={true}
    allowedRoles={["admin"]}
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
);

export const ClientRoute: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <ProtectedRoute
    requireAuth={true}
    allowedRoles={["client"]}
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
);

export const AuthenticatedRoute: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <ProtectedRoute
    requireAuth={true}
    allowedRoles={["admin", "client"]}
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
);

export const PublicRoute: React.FC<{
  children: ReactNode;
  redirectIfAuthenticated?: string;
}> = ({ children, redirectIfAuthenticated }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && redirectIfAuthenticated) {
      router.push(redirectIfAuthenticated);
      return;
    }

    // Auto-redirect authenticated users based on role
    if (isAuthenticated && user && !redirectIfAuthenticated) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/home");
      }
    }
  }, [isAuthenticated, isLoading, user, router, redirectIfAuthenticated]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && redirectIfAuthenticated) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

// Route Guard Hook - for programmatic route protection
export const useRouteGuard = (requiredRole?: "admin" | "client") => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const checkAccess = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return false;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push("/unauthorized");
      return false;
    }

    return true;
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    hasAccess:
      isAuthenticated && (!requiredRole || user?.role === requiredRole),
    checkAccess,
  };
};

export default ProtectedRoute;
