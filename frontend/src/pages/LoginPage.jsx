import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.username, formData.password);
            navigate('/reviews');
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 401) {
                setError('Tên đăng nhập hoặc mật khẩu không đúng');
            } else {
                setError('Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Main Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-4">🍴</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Chào mừng trở lại!
                        </h1>
                        <p className="text-gray-600">
                            Đăng nhập để tiếp tục khám phá ẩm thực
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center">
                                <div className="text-red-500 mr-2">❌</div>
                                <div className="text-red-800 text-sm font-medium">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                placeholder="Nhập tên đăng nhập"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                placeholder="Nhập mật khẩu"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Đang đăng nhập...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span className="mr-2">🚀</span>
                                    Đăng nhập
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Chưa có tài khoản?{' '}
                            <Link
                                to="/register"
                                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                            >
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Welcome Bonus Info */}
                <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
                    <div className="text-center">
                        <div className="text-2xl mb-2">🎁</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Tham gia cộng đồng
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Khám phá ẩm thực cùng hàng nghìn thành viên khác
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
