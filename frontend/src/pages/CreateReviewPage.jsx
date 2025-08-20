import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createReview, checkLocationAvailability } from '../services/reviewService';
import { AuthContext } from '../context/AuthContext';

const CreateReviewPage = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        location_name: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [checkingLocation, setCheckingLocation] = useState(false);
    const [locationStatus, setLocationStatus] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Reset location status khi user thay đổi location/address
        if (e.target.name === 'location_name' || e.target.name === 'address') {
            setLocationStatus(null);
        }
    };

    const handleLocationCheck = async () => {
        if (!formData.location_name.trim() || !formData.address.trim()) {
            setError('Vui lòng nhập đầy đủ tên địa điểm và địa chỉ để kiểm tra.');
            return;
        }

        setCheckingLocation(true);
        setError('');

        try {
            const response = await checkLocationAvailability(formData.location_name, formData.address);
            setLocationStatus(response.data);
        } catch (err) {
            setError('Không thể kiểm tra địa điểm. Vui lòng thử lại.');
            console.error('Error checking location:', err);
        } finally {
            setCheckingLocation(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (formData.content.length < 50) {
            setError('Nội dung review phải có ít nhất 50 ký tự để đảm bảo chất lượng.');
            setLoading(false);
            return;
        }

        if (formData.title.length < 10) {
            setError('Tiêu đề phải có ít nhất 10 ký tự.');
            setLoading(false);
            return;
        }

        try {
            const response = await createReview(formData, token);
            // Redirect to the created review
            navigate(`/reviews/${response.data.id}`);
        } catch (err) {
            if (err.response?.status === 400) {
                const detail = err.response.data.detail;
                if (detail.existing_review || detail.similar_review) {
                    const conflictReview = detail.existing_review || detail.similar_review;
                    setError(
                        <div>
                            <p className="mb-md">{detail.message}</p>
                            <div className="card" style={{ background: 'var(--bg-secondary)', marginTop: 'var(--space-md)' }}>
                                <h4 className="mb-sm">📍 {conflictReview.location_name}</h4>
                                <p className="mb-sm">📝 {conflictReview.title}</p>
                                <p className="mb-sm">👤 Tác giả: {conflictReview.owner}</p>
                                <Link
                                    to={`/reviews/${conflictReview.id}`}
                                    className="btn btn-accent btn-sm"
                                >
                                    Xem review này
                                </Link>
                            </div>
                            {detail.suggestion && <p className="mt-md text-secondary">{detail.suggestion}</p>}
                        </div>
                    );
                } else {
                    setError(detail.message || 'Có thể địa điểm này đã có review. Vui lòng kiểm tra lại.');
                }
            } else if (err.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else if (err.response?.status === 422) {
                const errors = err.response.data.detail;
                if (Array.isArray(errors)) {
                    setError(errors.map(e => e.msg).join(', '));
                } else {
                    setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
                }
            } else {
                setError('Tạo review thất bại. Vui lòng thử lại sau.');
            }
            console.error('Error creating review:', err);
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = formData.content.length >= 50 &&
        formData.title.length >= 10 &&
        formData.location_name.trim() &&
        formData.address.trim();

    return (
        <div className="page-container-sm">
            {/* Header */}
            <div className="mb-xl">
                <div className="d-flex align-center justify-between mb-lg">
                    <Link to="/reviews" className="btn btn-secondary btn-sm">
                        ← Quay lại
                    </Link>
                </div>

                <h1 className="text-center mb-md">✍️ Viết Review Mới</h1>
                <p className="text-center text-secondary">
                    Chia sẻ trải nghiệm ẩm thực của bạn với cộng đồng
                </p>
            </div>

            {/* Important Info Card */}
            <div className="card mb-lg" style={{ background: 'var(--bg-secondary)' }}>
                <h4 className="mb-md">⚠️ Lưu ý quan trọng</h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem' }}>
                    <li>Mỗi địa điểm chỉ có <strong>một review chính thức duy nhất</strong></li>
                    <li>Bạn sẽ trở thành <strong>"Tác giả Chính"</strong> và quản lý review này</li>
                    <li>Cộng đồng có thể đề xuất chỉnh sửa mà bạn sẽ xét duyệt</li>
                    <li>Review chất lượng cao có thể được nâng cấp thành <strong>Premium</strong></li>
                    <li>Thưởng: <strong>50 Coin</strong> khi review được duyệt</li>
                </ul>
            </div>

            {error && (
                <div className="card mb-lg" style={{
                    background: 'var(--error)',
                    color: 'white'
                }}>
                    {typeof error === 'string' ? <p className="mb-0">{error}</p> : error}
                </div>
            )}

            {/* Location Status */}
            {locationStatus && (
                <div className="card mb-lg" style={{
                    background: locationStatus.available ? 'var(--success)' : 'var(--warning)',
                    color: 'white'
                }}>
                    <div className="d-flex align-center gap-md">
                        <div style={{ fontSize: '2rem' }}>
                            {locationStatus.available ? '✅' : '⚠️'}
                        </div>
                        <div>
                            <h4 className="mb-sm" style={{ color: 'white' }}>
                                {locationStatus.available ? 'Địa điểm khả dụng!' : 'Có vấn đề với địa điểm'}
                            </h4>
                            <p className="mb-0" style={{ color: 'white' }}>
                                {locationStatus.message}
                            </p>
                            {!locationStatus.available && locationStatus.existing_review && (
                                <div className="mt-md">
                                    <Link
                                        to={`/reviews/${locationStatus.existing_review.id}`}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Xem review hiện có
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="card">
                <div className="form-group">
                    <label htmlFor="location_name" className="form-label">
                        Tên địa điểm *
                    </label>
                    <input
                        type="text"
                        id="location_name"
                        name="location_name"
                        value={formData.location_name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="VD: Quán Bún Bò Huế Cô Ba"
                        required
                        disabled={loading}
                    />
                    <small className="form-help text-muted">
                        Tên chính thức của quán/địa điểm
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="address" className="form-label">
                        Địa chỉ *
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="VD: 123 Nguyễn Văn Linh, P.An Khánh, Q.Ninh Kiều, TP.Cần Thơ"
                        required
                        disabled={loading}
                    />
                    <small className="form-help text-muted">
                        Địa chỉ chi tiết để mọi người dễ tìm
                    </small>
                </div>

                {/* Location Check Button */}
                <div className="form-group">
                    <button
                        type="button"
                        onClick={handleLocationCheck}
                        className="btn btn-accent"
                        disabled={checkingLocation || !formData.location_name.trim() || !formData.address.trim()}
                    >
                        {checkingLocation ? (
                            <>
                                <span className="loading"></span>
                                Đang kiểm tra...
                            </>
                        ) : (
                            '🔍 Kiểm tra địa điểm'
                        )}
                    </button>
                    <small className="form-help text-muted d-block mt-xs">
                        Khuyến khích kiểm tra trước khi viết để tránh trùng lặp
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="title" className="form-label">
                        Tiêu đề review *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="VD: Bún bò Huế đậm đà, giá cả hợp lý"
                        required
                        disabled={loading}
                    />
                    <small className="form-help text-muted">
                        Tóm tắt ngắn gọn về trải nghiệm (tối thiểu 10 ký tự)
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="content" className="form-label">
                        Nội dung review *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="form-input form-textarea"
                        style={{ minHeight: '200px' }}
                        placeholder="Chia sẻ chi tiết về:
• Chất lượng món ăn (vị, độ tươi ngon...)
• Không gian quán (rộng rãi, thoáng mát...)  
• Dịch vụ (thái độ phục vụ, tốc độ...)
• Giá cả (có hợp lý không...)
• Điều đặc biệt (món signature, story...)
• Lời khuyên (nên gọi món gì, thời gian nào đến...)"
                        required
                        disabled={loading}
                    />
                    <div className="d-flex justify-between align-center">
                        <small className="form-help text-muted">
                            Viết chi tiết, chân thật để giúp cộng đồng (tối thiểu 50 ký tự)
                        </small>
                        <small className={`form-help ${formData.content.length >= 50 ? 'text-success' : 'text-muted'}`}>
                            {formData.content.length}/50+
                        </small>
                    </div>
                </div>

                <div className="d-flex justify-between gap-md">
                    <Link to="/reviews" className="btn btn-secondary">
                        Hủy
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading || !canSubmit}
                    >
                        {loading ? (
                            <>
                                <span className="loading"></span>
                                Đang tạo review...
                            </>
                        ) : (
                            '🚀 Xuất bản review'
                        )}
                    </button>
                </div>
            </form>

            {/* Tips Card */}
            <div className="card mt-lg" style={{ background: 'var(--bg-secondary)' }}>
                <h4 className="mb-md">💡 Mẹo viết review hay</h4>
                <div style={{ fontSize: '0.875rem' }}>
                    <p className="mb-sm"><strong>🎯 Khách quan & Cân bằng:</strong> Chia sẻ cả ưu và nhược điểm</p>
                    <p className="mb-sm"><strong>📝 Chi tiết & Cụ thể:</strong> Mô tả rõ ràng về món ăn, giá cả, dịch vụ</p>
                    <p className="mb-sm"><strong>📸 Hình ảnh:</strong> Tính năng upload ảnh sắp ra mắt</p>
                    <p className="mb-0"><strong>🤝 Tôn trọng:</strong> Dùng ngôn từ lịch sự, tránh chê bai cá nhân</p>
                </div>
            </div>
        </div>
    );
};

export default CreateReviewPage; 