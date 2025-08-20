import React, { useState, useEffect } from 'react';
import { getReviews } from '../services/reviewService';
import { Link } from 'react-router-dom';

const ReviewsListPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const reviewsData = await getReviews();
                setReviews(reviewsData);
            } catch (err) {
                setError('Không thể tải danh sách review. Vui lòng thử lại sau.');
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const getExcerpt = (content, length = 150) => {
        if (content.length <= length) return content;
        return content.substring(0, length) + '...';
    };

    const getAuthorInitials = (username) => {
        return username.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Khám Phá Ẩm Thực
                    </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Những trải nghiệm ẩm thực được cộng đồng xây dựng và cập nhật liên tục
                </p>
            </div>

            {/* Search & Filter Placeholder */}
            <div className="mb-12">
                <div className="max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm địa điểm, món ăn..."
                            className="w-full px-6 py-4 pl-12 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            🔍
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Grid */}
            {reviews.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Chưa có review nào</h3>
                    <p className="text-gray-600 mb-8">Hãy là người đầu tiên chia sẻ trải nghiệm ẩm thực!</p>
                    <Link
                        to="/reviews/create"
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <span className="mr-2">✍️</span>
                        Viết Review Đầu Tiên
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reviews.map((review, index) => (
                            <Link
                                key={review.id}
                                to={`/reviews/${review.id}`}
                                className="group"
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                            >
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in">
                                    <div className="p-6">
                                        {/* Location */}
                                        <div className="flex items-center text-orange-600 font-medium mb-3">
                                            <span className="mr-2">📍</span>
                                            <span className="text-sm">{review.location_name}</span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                            {review.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {getExcerpt(review.content)}
                                        </p>

                                        {/* Author & Date */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                    {review.owner?.username ? getAuthorInitials(review.owner.username) : 'AN'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {review.owner?.username || 'Anonymous'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(review.created_at)}
                                                    </div>
                                                </div>
                                            </div>

                                            {review.is_premium && (
                                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                    💎 Premium
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="text-center mt-12">
                        <button className="px-8 py-4 bg-white text-gray-600 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:text-orange-600 transition-all duration-200">
                            <span className="mr-2">📖</span>
                            Xem thêm reviews
                        </button>
                    </div>
                </>
            )}

            {/* Community Stats */}
            <div className="mt-20 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-12">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Cộng Đồng Tri Thức Vị Giác
                    </h3>
                    <p className="text-gray-600">
                        Cùng nhau xây dựng kho tri thức ẩm thực
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: '📍', number: reviews.length, label: 'Địa điểm được review' },
                        { icon: '👥', number: '500+', label: 'Thành viên tích cực' },
                        { icon: '💰', number: '100K+', label: 'Coin được thưởng' }
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl mb-2">{stat.icon}</div>
                            <div className="text-3xl font-bold text-orange-600 mb-2">{stat.number}</div>
                            <div className="text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewsListPage; 