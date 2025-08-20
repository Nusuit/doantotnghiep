import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
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

        // Client-side validation
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Email không hợp lệ');
            setLoading(false);
            return;
        }

        try {
            await register(formData.username, formData.email, formData.password);
            navigate('/reviews');
        } catch (err) {
            if (err.response?.status === 400) {
                setError('Tên đăng nhập hoặc email đã được sử dụng');
            } else {
                setError('Đăng ký thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo & Welcome */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 float">🌟</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Tham gia cộng đồng!
                    </h2>
                    <p className="text-gray-600">
                        Tạo tài khoản để khám phá và chia sẻ trải nghiệm ẩm thực
                    </p>
                </div>

                {/* Welcome Bonus */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center text-center">
                        <div>
                            <div className="text-2xl mb-2">🎁</div>
                            <div className="text-sm font-semibold text-green-800">
                                Nhận ngay 200 Coin + 5 lượt AI miễn phí!
                            </div>
                        </div>
                    </div>
                </div>

                {/* Register Form */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-up">
                                <div className="flex items-center">
                                    <span className="text-lg mr-2">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                👤 Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Chọn tên đăng nhập độc đáo"
                                required
                                disabled={loading}
                                minLength={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Ít nhất 3 ký tự, không có khoảng trắng
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                📧 Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="your@email.com"
                                required
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Sẽ được sử dụng để khôi phục tài khoản
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                🔒 Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Tạo mật khẩu mạnh"
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Tối thiểu 6 ký tự, nên có chữ hoa, chữ thường, số
                            </p>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-start">
                                <span className="mr-2">📜</span>
                                <div>
                                    Bằng cách đăng ký, bạn đồng ý với
                                    <Link to="/terms" className="text-primary-600 hover:underline mx-1">
                                        Điều khoản sử dụng
                                    </Link>
                                    và
                                    <Link to="/privacy" className="text-primary-600 hover:underline mx-1">
                                        Chính sách bảo mật
                                    </Link>
                                    của chúng tôi.
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary btn-lg shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner mr-2"></div>
                                    Đang tạo tài khoản...
                                </>
                            ) : (
                                <>
                                    <span>🚀</span>
                                    Tạo tài khoản
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Đã có tài khoản?</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <Link
                            to="/login"
                            className="w-full btn btn-secondary btn-lg border-2 border-gray-200 hover:border-primary-200 hover:bg-primary-50"
                        >
                            <span>🚪</span>
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-8">
                    <h3 className="text-center text-gray-700 font-semibold mb-4">
                        🎯 Tại sao bạn sẽ yêu thích Tri Thức Vị Giác?
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-center">
                                <div className="text-2xl mb-2">💰</div>
                                <div className="font-medium text-gray-800">Kiếm Coin</div>
                                <div className="text-gray-600 text-xs">Viết review, nhận thưởng</div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🤖</div>
                                <div className="font-medium text-gray-800">AI Thông Minh</div>
                                <div className="text-gray-600 text-xs">Tư vấn địa điểm cá nhân</div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-center">
                                <div className="text-2xl mb-2">⏰</div>
                                <div className="font-medium text-gray-800">Đặt Cọc</div>
                                <div className="text-gray-600 text-xs">Giữ chỗ viết review 72h</div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🏆</div>
                                <div className="font-medium text-gray-800">Uy Tín</div>
                                <div className="text-gray-600 text-xs">Xây dựng danh tiếng</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center"
                    >
                        <span className="mr-1">←</span>
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
