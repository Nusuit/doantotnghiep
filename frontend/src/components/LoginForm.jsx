// Login form component với TailwindCSS theo design specs
import { useState } from "react";

const LoginForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-gray-800"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors text-gray-800"
          placeholder="Nhập mật khẩu..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-orange-500 hover:bg-yellow-400 hover:text-gray-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
};

export default LoginForm;
