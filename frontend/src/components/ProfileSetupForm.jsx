// ProfileSetupForm - Form nhập thông tin cá nhân sau khi login
import { useState, useEffect } from "react";

const ProfileSetupForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    country: "",
    address: "",
    foodPreferences: {
      breakfast: false,
      lunch: false,
      dinner: false,
      snack: false,
    },
    priceRange: "",
    preferredLocation: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      // Try to get location from browser geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Use reverse geocoding API to get location details
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();

              if (data.countryName && (data.city || data.locality)) {
                const fullAddress = [
                  data.city || data.locality,
                  data.principalSubdivision,
                  data.countryName,
                ]
                  .filter(Boolean)
                  .join(", ");

                setFormData((prev) => ({
                  ...prev,
                  country: data.countryName,
                  address: fullAddress,
                }));
                setLocationDetected(true);
                console.log(
                  "✅ Location detected:",
                  data.countryName,
                  fullAddress
                );
              }
            } catch (geoError) {
              console.log("Geocoding failed:", geoError);
            }
          },
          (error) => {
            console.log("Geolocation failed:", error);
          }
        );
      }
    } catch (error) {
      console.log("Location detection failed:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.fullName.trim() &&
      (!formData.firstName.trim() || !formData.lastName.trim())
    ) {
      newErrors.fullName = "Họ tên hoặc tên riêng là bắt buộc";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    // Phone validation (optional but if provided should be valid)
    if (
      formData.phoneNumber &&
      !/^\+?[\d\s-()]+$/.test(formData.phoneNumber.trim())
    ) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    const hasPreference = Object.values(formData.foodPreferences).some(Boolean);
    if (!hasPreference) {
      newErrors.foodPreferences = "Vui lòng chọn ít nhất một sở thích ăn uống";
    }

    if (!formData.priceRange) {
      newErrors.priceRange = "Vui lòng chọn tầm giá";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Call API to save profile data
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:4000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      if (data.success) {
        console.log("✅ Profile saved successfully");
        onComplete(formData);
      } else {
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("❌ Profile save error:", error);
      setErrors({ submit: error.message || "Có lỗi xảy ra khi lưu thông tin" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePreferenceChange = (preference) => {
    setFormData((prev) => ({
      ...prev,
      foodPreferences: {
        ...prev.foodPreferences,
        [preference]: !prev.foodPreferences[preference],
      },
    }));

    if (errors.foodPreferences) {
      setErrors((prev) => ({ ...prev, foodPreferences: "" }));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#E0E7FF",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            style={{
              color: "#FF8B20",
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Hoàn thiện thông tin
          </h2>
          <p style={{ color: "#6B7280", fontSize: "14px" }}>
            Hãy cho chúng tôi biết thêm về bạn để có trải nghiệm tốt hơn
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
                color: "#DC2626",
                fontSize: "14px",
              }}
            >
              {errors.submit}
            </div>
          )}

          {/* Họ và tên */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#1F2937",
              }}
            >
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.outline = "none";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.fullName
                  ? "#DC2626"
                  : "#D1D5DB";
                e.target.style.boxShadow = "none";
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${errors.fullName ? "#DC2626" : "#D1D5DB"}`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
              }}
              placeholder="Nhập họ tên đầy đủ..."
              required
            />
            {errors.fullName && (
              <span
                style={{
                  display: "block",
                  color: "#DC2626",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Tên riêng (Tách riêng nếu không có họ tên đầy đủ) */}
          {!formData.fullName && (
            <>
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "20px" }}
              >
                {/* Họ */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                      color: "#1F2937",
                    }}
                  >
                    Họ
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #D1D5DB",
                      borderRadius: "8px",
                      fontSize: "16px",
                      transition: "all 0.2s ease-in-out",
                    }}
                    placeholder="Họ..."
                  />
                </div>

                {/* Tên */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "6px",
                      color: "#1F2937",
                    }}
                  >
                    Tên
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #D1D5DB",
                      borderRadius: "8px",
                      fontSize: "16px",
                      transition: "all 0.2s ease-in-out",
                    }}
                    placeholder="Tên..."
                  />
                </div>
              </div>
            </>
          )}

          {/* Số điện thoại */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#1F2937",
              }}
            >
              Số điện thoại (tùy chọn)
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${
                  errors.phoneNumber ? "#DC2626" : "#D1D5DB"
                }`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
              }}
              placeholder="+84 123 456 789"
            />
            {errors.phoneNumber && (
              <span
                style={{
                  display: "block",
                  color: "#DC2626",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {errors.phoneNumber}
              </span>
            )}
          </div>

          {/* Vị trí địa lý */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {/* Quốc gia */}
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "#1F2937",
                }}
              >
                Quốc gia {locationDetected && "🌍"}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #D1D5DB",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "all 0.2s ease-in-out",
                  backgroundColor: locationDetected ? "#F0FDF4" : "#FFFFFF",
                }}
                placeholder="Việt Nam"
              />
            </div>

            {/* Địa chỉ */}
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "#1F2937",
                }}
              >
                Địa chỉ {locationDetected && "📍"}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #D1D5DB",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "all 0.2s ease-in-out",
                  backgroundColor: locationDetected ? "#F0FDF4" : "#FFFFFF",
                }}
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              />
            </div>
          </div>

          {locationDetected && (
            <div
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "20px",
                fontSize: "12px",
                color: "#059669",
              }}
            >
              ✅ Vị trí đã được tự động phát hiện từ trình duyệt
            </div>
          )}

          {/* Ngày sinh */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#1F2937",
              }}
            >
              Ngày sinh
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.outline = "none";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.dateOfBirth
                  ? "#DC2626"
                  : "#D1D5DB";
                e.target.style.boxShadow = "none";
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${
                  errors.dateOfBirth ? "#DC2626" : "#D1D5DB"
                }`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
              }}
              required
            />
            {errors.dateOfBirth && (
              <span
                style={{
                  display: "block",
                  color: "#DC2626",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {errors.dateOfBirth}
              </span>
            )}
          </div>

          {/* Giới tính */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#1F2937",
              }}
            >
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.outline = "none";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.gender
                  ? "#DC2626"
                  : "#D1D5DB";
                e.target.style.boxShadow = "none";
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${errors.gender ? "#DC2626" : "#D1D5DB"}`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
              }}
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            {errors.gender && (
              <span
                style={{
                  display: "block",
                  color: "#DC2626",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {errors.gender}
              </span>
            )}
          </div>

          {/* Sở thích ăn uống */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "12px",
                color: "#1F2937",
              }}
            >
              Sở thích ăn uống (có thể chọn nhiều)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {[
                { key: "breakfast", label: "Đồ ăn sáng" },
                { key: "lunch", label: "Đồ ăn trưa" },
                { key: "dinner", label: "Đồ ăn tối" },
                { key: "snack", label: "Đồ ăn vặt" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    border: `2px solid ${
                      formData.foodPreferences[key] ? "#FF8B20" : "#E5E7EB"
                    }`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    backgroundColor: formData.foodPreferences[key]
                      ? "#FFF7ED"
                      : "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    if (!formData.foodPreferences[key]) {
                      e.target.style.borderColor = "#D1D5DB";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.foodPreferences[key]) {
                      e.target.style.borderColor = "#E5E7EB";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.foodPreferences[key]}
                    onChange={() => handlePreferenceChange(key)}
                    style={{
                      marginRight: "8px",
                      width: "16px",
                      height: "16px",
                      accentColor: "#FF8B20",
                    }}
                  />
                  <span style={{ fontSize: "14px", color: "#1F2937" }}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {errors.foodPreferences && (
              <span
                style={{
                  display: "block",
                  color: "#DC2626",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {errors.foodPreferences}
              </span>
            )}
          </div>

          {/* Tầm giá */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#1F2937",
              }}
            >
              Tầm giá ưa thích
            </label>
            <select
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.outline = "none";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.priceRange
                  ? "#DC2626"
                  : "#D1D5DB";
                e.target.style.boxShadow = "none";
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${
                  errors.priceRange ? "#DC2626" : "#D1D5DB"
                }`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
              }}
              required
            >
              <option value="">Chọn tầm giá</option>
              <option value="under-50k">Dưới 50k</option>
              <option value="50k-100k">50k - 100k</option>
              <option value="100k-200k">100k - 200k</option>
              <option value="200k-500k">200k - 500k</option>
              <option value="above-500k">Trên 500k</option>
            </select>
            {errors.priceRange && (
              <span
                style={{
                  display: "block",
                  color: "#DC2626",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {errors.priceRange}
              </span>
            )}
          </div>

          {/* Vị trí tìm kiếm */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#1F2937",
              }}
            >
              Vị trí muốn tìm kiếm (tùy chọn)
            </label>
            <input
              type="text"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF8B20";
                e.target.style.outline = "none";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 139, 32, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#D1D5DB";
                e.target.style.boxShadow = "none";
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #D1D5DB",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: "#FFFFFF",
              }}
              placeholder="Ví dụ: Quận 1, Quận 3..."
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = "#EA580C";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = "#FF8B20";
              }
            }}
            style={{
              width: "100%",
              backgroundColor: isLoading ? "#D1D5DB" : "#FF8B20",
              color: "#FFFFFF",
              fontWeight: "600",
              fontSize: "16px",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
            }}
          >
            {isLoading ? "Đang lưu..." : "Hoàn thành"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupForm;
