"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onSubmit?: (formData: { username: string; password: string }) => void;
  onSuccess?: () => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSuccess,
  isLoading,
}) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Try auth context login first
      const result = await login(formData);

      if (result.success) {
        // Call success callback if provided
        onSuccess?.();
        // Call legacy onSubmit if provided
        onSubmit?.(formData);
      } else {
        setError(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email hoặc tên người dùng
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={isSubmitting || isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-gray-800 disabled:opacity-50"
          placeholder="Nhập email hoặc username..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isSubmitting || isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-gray-800 disabled:opacity-50"
          placeholder="Nhập mật khẩu..."
        />
      </div>

      <button
        type="submit"
        disabled={
          isSubmitting ||
          isLoading ||
          !formData.username.trim() ||
          !formData.password.trim()
        }
        className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed"
      >
        {isSubmitting || isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Đang đăng nhập...
          </span>
        ) : (
          "Đăng nhập"
        )}
      </button>
    </form>
  );
};

export default LoginForm;
