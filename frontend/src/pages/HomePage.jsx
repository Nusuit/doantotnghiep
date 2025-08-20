import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
    const { isAuthenticated } = useContext(AuthContext);

    const features = [
        {
            icon: '🎯',
            title: 'Một Địa Điểm - Một Review',
            description: 'Mỗi nhà hàng chỉ có duy nhất một bài review chính thức, được cộng đồng xây dựng và cập nhật liên tục.',
            highlight: 'Độc nhất'
        },
        {
            icon: '👥',
            title: 'Cộng Đồng Tham Gia',
            description: 'Bạn có thể đóng góp ý kiến, đề xuất chỉnh sửa và cùng nhau tạo nên những review chất lượng cao.',
            highlight: 'Tập thể'
        },
        {
            icon: '💰',
            title: 'Hệ Thống Coin Thưởng',
            description: 'Nhận coin khi viết review, đóng góp nội dung. Sử dụng coin để tip tác giả hoặc mở khóa nội dung premium.',
            highlight: 'Có Thưởng'
        },
        {
            icon: '🤖',
            title: 'AI Hỗ Trợ Thông Minh',
            description: 'Trợ lý AI giúp bạn tìm kiếm địa điểm phù hợp, lọc thông tin và đưa ra gợi ý cá nhân hóa.',
            highlight: 'Thông minh'
        },
        {
            icon: '⏰',
            title: 'Đặt Cọc Giữ Chỗ',
            description: 'Đặt cọc 50 coin để giữ quyền viết review cho địa điểm trong 72 giờ. Hoàn tiền khi hoàn thành.',
            highlight: 'Độc quyền'
        },
        {
            icon: '🏆',
            title: 'Hệ Thống Uy Tín',
            description: 'Xây dựng uy tín qua chất lượng đóng góp. Từ Contributor đến Polymath với nhiều đặc quyền.',
            highlight: 'Phát triển'
        }
    ];

    const stats = [
        { number: '1K+', label: 'Địa điểm được khám phá', icon: '📍' },
        { number: '500+', label: 'Thành viên tích cực', icon: '👥' },
        { number: '100K+', label: 'Coin được thưởng', icon: '💰' }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-16 lg:py-24 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-amber-50/30 to-yellow-100/20"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-block mb-6">
                            <div className="text-6xl lg:text-8xl mb-4 animate-bounce">🍴</div>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                                Tri Thức Vị Giác
                            </span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                            Nền tảng kiến thức ẩm thực độc nhất - mỗi địa điểm chỉ có một bài review chính thức duy nhất,
                            được xây dựng và cập nhật bởi toàn bộ cộng đồng.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link
                                to="/reviews"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <span className="text-xl mr-2">🔍</span>
                                Khám phá ngay
                            </Link>
                            {!isAuthenticated && (
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-orange-300 hover:bg-orange-50 shadow-lg transition-all duration-200"
                                >
                                    <span className="text-xl mr-2">🌟</span>
                                    Tham gia cộng đồng
                                </Link>
                            )}
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                Miễn phí tham gia
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-blue-500">🛡️</span>
                                An toàn & bảo mật
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-purple-500">🚀</span>
                                Cộng đồng năng động
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Tại Sao Chọn Tri Thức Vị Giác?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Khác biệt hoàn toàn với các nền tảng review truyền thống,
                        chúng tôi mang đến trải nghiệm hoàn toàn mới.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center">
                            <div className="text-4xl mb-4 group-hover:scale-110 transform transition-all duration-300">
                                {feature.icon}
                            </div>
                            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full mb-4">
                                {feature.highlight}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center group hover:bg-orange-50 transition-all duration-200">
                            <div className="text-4xl mb-2 group-hover:scale-110 transform transition-transform">
                                {stat.icon}
                            </div>
                            <div className="text-3xl font-bold text-orange-600 mb-2">{stat.number}</div>
                            <div className="text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* How It Works */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Cách Hoạt Động
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Đặt cọc giữ chỗ',
                                description: 'Chi 50 coin để giữ quyền viết review cho địa điểm trong 72 giờ',
                                icon: '🔒'
                            },
                            {
                                step: '02',
                                title: 'Viết review chất lượng',
                                description: 'Tạo bài review chi tiết, được hoàn 50 coin + thưởng 50 coin',
                                icon: '✍️'
                            },
                            {
                                step: '03',
                                title: 'Cộng đồng cập nhật',
                                description: 'Mọi người đóng góp ý kiến, đề xuất để review luôn mới và chính xác',
                                icon: '🤝'
                            }
                        ].map((step, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold group-hover:scale-110 transform transition-all duration-300">
                                        {step.step}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-3xl group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                {!isAuthenticated && (
                    <div className="text-center bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-12">
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                            Sẵn sàng khám phá ẩm thực?
                        </h3>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Tham gia cộng đồng để chia sẻ và khám phá những trải nghiệm ẩm thực tuyệt vời.
                            Nhận ngay 200 coin khi đăng ký!
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <span className="text-xl mr-2">🎉</span>
                                Đăng ký miễn phí
                            </Link>
                            <Link
                                to="/reviews"
                                className="inline-flex items-center px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-orange-300 shadow-lg transition-all duration-200"
                            >
                                <span className="text-xl mr-2">👀</span>
                                Xem demo
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage; 