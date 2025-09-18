// ProfileSetupForm - Form nhập thông tin cá nhân sau khi login
import { useState, useEffect } from "react";

const ProfileSetupForm = ({ onComplete }) => {
  // Lấy thông tin user hiện tại từ localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    // OAuth display name for reference (kept as display preference)
    fullName: currentUser.full_name || currentUser.fullName || "",
    // Separate real name fields that users must provide
    firstName: currentUser.firstName || "",
    lastName: currentUser.lastName || "",
    dateOfBirth: currentUser.dateOfBirth || "",
    gender: currentUser.gender || "",
    phoneNumber: currentUser.phoneNumber || "",
    country: currentUser.country || "",
    address: currentUser.address || "",
    foodPreferences: {
      breakfast: false,
      lunch: false,
      dinner: false,
      snack: false,
    },
    priceRange: currentUser.priceRange || "",
    preferredLocation: currentUser.preferredLocation || "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hasOAuthData, setHasOAuthData] = useState(false);

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();

    // Kiểm tra xem user có data từ OAuth không
    if (
      currentUser.full_name ||
      currentUser.given_name ||
      currentUser.family_name
    ) {
      setHasOAuthData(true);
    }
  }, []);

  const detectLocation = async () => {
    try {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported by this browser");
        return;
      }

      // Create a promise with timeout for geolocation
      const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Geolocation timeout"));
          }, 10000); // 10 second timeout

          navigator.geolocation.getCurrentPosition(
            (position) => {
              clearTimeout(timeoutId);
              resolve(position);
            },
            (error) => {
              clearTimeout(timeoutId);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 300000, // 5 minutes
            }
          );
        });
      };

      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Try reverse geocoding with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();

          if (data.countryName && (data.city || data.locality)) {
            const locationParts = [
              data.city || data.locality,
              data.principalSubdivision,
              data.countryName,
            ].filter(Boolean);

            const detectedLocation = locationParts.join(", ");

            setFormData((prev) => ({
              ...prev,
              country: data.countryName || "",
              address: detectedLocation,
              preferredLocation: data.city || data.locality || "",
            }));

            setLocationDetected(true);
            console.log("✅ Location detected:", detectedLocation);
          }
        }
      } catch (fetchError) {
        console.log("Reverse geocoding failed:", fetchError.message);
      }
    } catch (error) {
      console.log("Geolocation detection failed:", error.message);
      // Fallback: set Vietnam as default if location detection fails
      if (error.code === 1) {
        // Permission denied
        console.log("Location permission denied by user");
      } else if (error.code === 2) {
        // Position unavailable
        console.log("Location information unavailable");
      } else if (error.code === 3) {
        // Timeout
        console.log("Location request timed out");
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate firstName and lastName - always required for real identity
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Tên là bắt buộc";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Họ là bắt buộc";
    }

    // fullName validation (for display purpose)
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Tên hiển thị là bắt buộc";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    // Improved phone validation for Vietnamese numbers
    if (formData.phoneNumber.trim()) {
      const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/[\s-()]/g, ""))) {
        newErrors.phoneNumber = "Số điện thoại không đúng định dạng Việt Nam";
      }
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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const profileData = {
        ...formData,
        // Keep both individual names and combined display name
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: formData.fullName, // Display name (could be OAuth name or user preference)
        displayName: formData.fullName, // Backup field for compatibility
        isProfileSetup: true,
        profileComplete: true,
      };

      // Try API first
      const response = await fetch("http://localhost:4000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // API success - update localStorage and complete
          await updateUserData(profileData);
          console.log("✅ Profile saved successfully via API");
          setSubmitSuccess(true);
          setTimeout(() => onComplete(profileData), 1000);
          return;
        }
      }

      // API failed - fallback to localStorage
      throw new Error("API request failed");
    } catch (error) {
      console.warn(
        "API unavailable, using localStorage fallback:",
        error.message
      );

      // Fallback: save to localStorage
      try {
        await updateUserData({
          ...formData,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isProfileSetup: true,
          profileComplete: true,
        });

        console.log("✅ Profile saved to localStorage");
        setSubmitSuccess(true);
        setTimeout(
          () =>
            onComplete({
              ...formData,
              isProfileSetup: true,
              profileComplete: true,
            }),
          1000
        );
      } catch (fallbackError) {
        console.error("❌ Failed to save profile:", fallbackError);
        setErrors({
          submit: "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update user data consistently
  const updateUserData = async (profileData) => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = {
      ...userData,
      ...profileData,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation - clear errors as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Real-time validation for specific fields
    if (name === "firstName" && value.trim().length >= 1) {
      setErrors((prev) => ({ ...prev, firstName: "" }));
    }

    if (name === "lastName" && value.trim().length >= 1) {
      setErrors((prev) => ({ ...prev, lastName: "" }));
    }

    if (name === "fullName" && value.trim().length >= 2) {
      setErrors((prev) => ({ ...prev, fullName: "" }));
    }

    if (name === "phoneNumber" && value.trim()) {
      const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;
      if (phoneRegex.test(value.replace(/[\s-()]/g, ""))) {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
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

    // Clear food preferences error when user selects any preference
    const hasAnyPreference = Object.values({
      ...formData.foodPreferences,
      [preference]: !formData.foodPreferences[preference],
    }).some(Boolean);
    if (hasAnyPreference && errors.foodPreferences) {
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
          {currentUser.profile_picture && (
            <div style={{ marginBottom: "16px" }}>
              <img
                src={currentUser.profile_picture}
                alt="Profile"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "3px solid #FF8B20",
                  marginBottom: "8px",
                }}
              />
              <p style={{ color: "#6B7280", fontSize: "12px" }}>
                Xin chào, {currentUser.given_name || "User"}! 👋
              </p>
            </div>
          )}
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
            {hasOAuthData
              ? "Chúng tôi đã lấy một số thông tin từ Google. Vui lòng bổ sung thêm để có trải nghiệm tốt hơn"
              : "Hãy cho chúng tôi biết thêm về bạn để có trải nghiệm tốt hơn"}
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

          {submitSuccess && (
            <div
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
                color: "#15803D",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              ✅ Thông tin đã được lưu thành công!
            </div>
          )}

          {/* Tên hiển thị (Display Name) */}
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
              Tên hiển thị{" "}
              {hasOAuthData && (
                <span style={{ color: "#059669", fontSize: "12px" }}>
                  ✓ Từ Google
                </span>
              )}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={hasOAuthData}
              onFocus={(e) => {
                if (!hasOAuthData) {
                  e.target.style.borderColor = "#FF8B20";
                  e.target.style.outline = "none";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(255, 139, 32, 0.1)";
                }
              }}
              onBlur={(e) => {
                if (!hasOAuthData) {
                  e.target.style.borderColor = errors.fullName
                    ? "#DC2626"
                    : "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `2px solid ${
                  errors.fullName
                    ? "#DC2626"
                    : hasOAuthData
                    ? "#10B981"
                    : "#D1D5DB"
                }`,
                borderRadius: "8px",
                fontSize: "16px",
                transition: "all 0.2s ease-in-out",
                backgroundColor: hasOAuthData ? "#F0FDF4" : "#FFFFFF",
                color: hasOAuthData ? "#059669" : "#1F2937",
                cursor: hasOAuthData ? "not-allowed" : "text",
              }}
              placeholder={
                hasOAuthData
                  ? "Tên từ Google account"
                  : "VD: Sawari Yuki hoặc nickname..."
              }
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
            {hasOAuthData && (
              <span
                style={{
                  display: "block",
                  color: "#059669",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                ℹ️ Tên này được lấy từ Google account của bạn và không thể thay
                đổi
              </span>
            )}
          </div>

          {/* Họ tên thật (First Name + Last Name) */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {/* Họ (Last Name) */}
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
                Họ <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF8B20";
                  e.target.style.outline = "none";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(255, 139, 32, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.lastName
                    ? "#DC2626"
                    : "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${
                    errors.lastName ? "#DC2626" : "#D1D5DB"
                  }`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "all 0.2s ease-in-out",
                }}
                placeholder="VD: Phạm, Nguyễn..."
                required
              />
              {errors.lastName && (
                <span
                  style={{
                    display: "block",
                    color: "#DC2626",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {errors.lastName}
                </span>
              )}
            </div>

            {/* Tên (First Name) */}
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
                Tên <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF8B20";
                  e.target.style.outline = "none";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(255, 139, 32, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.firstName
                    ? "#DC2626"
                    : "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `2px solid ${
                    errors.firstName ? "#DC2626" : "#D1D5DB"
                  }`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "all 0.2s ease-in-out",
                }}
                placeholder="VD: Huy Kiên..."
                required
              />
              {errors.firstName && (
                <span
                  style={{
                    display: "block",
                    color: "#DC2626",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {errors.firstName}
                </span>
              )}
            </div>
          </div>

          {/* Helper text cho họ tên thật */}
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              backgroundColor: "#FEF3C7",
              borderRadius: "8px",
              border: "1px solid #F59E0B",
            }}
          >
            <p style={{ margin: 0, fontSize: "13px", color: "#92400E" }}>
              💡 <strong>Lưu ý:</strong> Vui lòng nhập họ tên thật của bạn (như
              trong CMND/CCCD) để chúng tôi có thể xác nhận danh tính khi cần
              thiết. Tên hiển thị ở trên có thể là nickname hoặc tên bạn muốn
              hiển thị công khai.
            </p>
          </div>

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
