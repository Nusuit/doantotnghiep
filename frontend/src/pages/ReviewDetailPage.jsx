import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReview } from '../services/reviewService';

const ReviewDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReview = async () => {
            try {
                setLoading(true);
                const reviewData = await getReview(id);
                setReview(reviewData);
            } catch (err) {
                setError('Không thể tải review. Vui lòng thử lại sau.');
                console.error('Error fetching review:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchReview();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải review...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy review</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <Link
                        to="/reviews"
                        className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <div className="text-6xl mb-4">❓</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Review không tồn tại</h2>
                    <p className="text-gray-600 mb-8">Review này có thể đã bị xóa hoặc không còn khả dụng.</p>
                    <Link
                        to="/reviews"
                        className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Breadcrumb */}
            <nav className="mb-8">
                <div className="flex items-center space-x-2 text-sm">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                        Trang chủ
                    </Link>
                    <span className="text-gray-300">›</span>
                    <Link to="/reviews" className="text-gray-500 hover:text-gray-700 transition-colors">
                        Reviews
                    </Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-900 font-medium">{review.location_name}</span>
                </div>
            </nav>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center text-orange-600 font-medium mb-4">
                    <span className="mr-2">📍</span>
                    <span>{review.location_name}</span>
                    {review.address && (
                        <>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-gray-600">{review.address}</span>
                        </>
                    )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                    {review.title}
                </h1>

                {/* Author & Meta */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.owner?.username ? review.owner.username.substring(0, 2).toUpperCase() : 'AN'}
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                {review.owner?.username || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                                Tác giả chính • {new Date(review.created_at).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {review.is_premium && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-semibold text-sm">
                                💎 Premium
                            </div>
                        )}
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-sm">
                            ✅ Chính thức
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                <div className="p-8">
                    <div className="prose prose-lg prose-orange max-w-none">
                        {review.content.split('\n').map((paragraph, index) => (
                            paragraph.trim() && (
                                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                                    {paragraph}
                                </p>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="mr-2">👍</span>
                        Hữu ích (0)
                    </button>
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="mr-2">💰</span>
                        Tip tác giả
                    </button>
                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="mr-2">📝</span>
                        Đề xuất chỉnh sửa
                    </button>
                </div>

                <Link
                    to="/reviews"
                    className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                    <span className="mr-2">←</span>
                    Quay lại danh sách
                </Link>
            </div>

            {/* Comments Section Placeholder */}
            <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Thảo luận (0)
                </h3>
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-lg">Hệ thống bình luận sẽ sớm được ra mắt</p>
                    <p className="text-sm">Bạn sẽ có thể thảo luận và đóng góp ý kiến về review này</p>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetailPage; 