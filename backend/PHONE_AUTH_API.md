# Phone OTP Authentication API Documentation

## 🎯 Overview

Phone-based authentication system using OTP (One-Time Password) via SMS. Supports both new user registration and existing user login with a single flow.

---

## 📱 API Endpoints

### 1. Send OTP

**Endpoint:** `POST /api/auth/send-otp`

**Description:** Send 6-digit OTP code to phone number via SMS

**Request Body:**

```json
{
  "phoneNumber": "+84987654321"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "OTP đã được gửi đến số điện thoại của bạn",
  "phoneNumber": "+84987654321",
  "expiresIn": 300,
  "otpSentAt": "2025-11-15T10:30:00.000Z"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid phone format

```json
{
  "code": "INVALID_PHONE",
  "message": "Số điện thoại không hợp lệ. Định dạng: +84xxxxxxxxx"
}
```

- **429 Too Many Requests** - Rate limit exceeded

```json
{
  "code": "TOO_MANY_REQUESTS",
  "message": "Bạn đã vượt quá giới hạn 3 OTP/giờ. Vui lòng thử lại sau.",
  "retryAfter": 3600
}
```

- **500 Internal Error** - SMS send failed

```json
{
  "code": "SMS_SEND_FAILED",
  "message": "Không thể gửi OTP. Vui lòng thử lại sau."
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verify OTP code and login/register user

**Request Body:**

```json
{
  "phoneNumber": "+84987654321",
  "otpCode": "123456"
}
```

**Success Response - New User (200):**

```json
{
  "success": true,
  "message": "Đăng ký thành công!",
  "user": {
    "id": 123,
    "phoneNumber": "+84987654321",
    "email": null,
    "accountStatus": "active"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6..."
  },
  "isNewUser": true
}
```

**Success Response - Existing User (200):**

```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "user": {
    "id": 456,
    "phoneNumber": "+84987654321",
    "email": "user@example.com",
    "accountStatus": "active"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6..."
  },
  "isNewUser": false
}
```

**Error Responses:**

- **400 Bad Request** - Missing fields

```json
{
  "code": "BAD_REQUEST",
  "message": "Số điện thoại và mã OTP là bắt buộc"
}
```

- **401 Unauthorized** - Invalid OTP

```json
{
  "code": "INVALID_OTP_CODE",
  "message": "Mã OTP không đúng. Vui lòng thử lại."
}
```

- **401 Unauthorized** - OTP expired

```json
{
  "code": "OTP_EXPIRED",
  "message": "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại."
}
```

- **401 Unauthorized** - Max attempts exceeded

```json
{
  "code": "MAX_ATTEMPTS_EXCEEDED",
  "message": "Bạn đã nhập sai quá 3 lần. Vui lòng yêu cầu gửi OTP mới."
}
```

- **403 Forbidden** - Account disabled

```json
{
  "code": "ACCOUNT_DISABLED",
  "message": "Tài khoản đã bị khóa"
}
```

---

### 3. Resend OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Request a new OTP code

**Request Body:**

```json
{
  "phoneNumber": "+84987654321"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "OTP mới đã được gửi",
  "expiresIn": 300
}
```

**Error Responses:** Same as Send OTP endpoint

---

## 🔒 Security Features

### Rate Limiting

- **3 OTP requests per hour** per phone number
- Prevents spam and abuse
- Configurable via `OTP_RATE_LIMIT_PER_HOUR` environment variable

### OTP Validation

- **5 minutes expiry time** (configurable via `OTP_EXPIRY_MINUTES`)
- **3 maximum attempts** per OTP code (configurable via `OTP_MAX_ATTEMPTS`)
- OTP marked as used after successful verification
- Old OTPs automatically cleaned up

### Phone Number Format

- Must match pattern: `+84xxxxxxxxx` (Vietnam)
- 9-10 digits after country code
- Validated on server side

---

## 🔑 JWT Token Structure

```json
{
  "id": 123,
  "phoneNumber": "+84987654321",
  "email": null,
  "iat": 1700000000,
  "exp": 1700000900
}
```

**Token Expiry:**

- Access Token: 15 minutes
- Refresh Token: 30 days

---

## 🛠️ Environment Variables

Required configuration in `.env` file:

```env
# SMS/OTP Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_RATE_LIMIT_PER_HOUR=3

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Database
DATABASE_URL="mysql://user:password@localhost:3306/knowledge"
```

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  last_login_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone_number (phone_number)
);
```

### OTP Verifications Table

```sql
CREATE TABLE otp_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone_otp (phone_number, otp_code),
  INDEX idx_expires (expires_at)
);
```

---

## 🧪 Development Mode

In development (`NODE_ENV=development`), SMS messages are **logged to console** instead of being sent:

```
📱 ========== SMS DEBUG ==========
📞 To: +84987654321
🔢 OTP: 123456
📝 Message: Your verification code is: 123456. Valid for 5 minutes.
=================================
```

This allows testing without Twilio credentials and avoiding SMS charges.

---

## 🚀 Usage Flow

### Frontend Integration Example

```typescript
// Step 1: Send OTP
const sendOtp = async (phoneNumber: string) => {
  const response = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  return response.json();
};

// Step 2: Verify OTP
const verifyOtp = async (phoneNumber: string, otpCode: string) => {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, otpCode }),
  });
  const data = await response.json();

  if (data.success) {
    // Store tokens
    localStorage.setItem("accessToken", data.tokens.accessToken);
    localStorage.setItem("refreshToken", data.tokens.refreshToken);

    // Redirect based on user type
    if (data.isNewUser) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/dashboard";
    }
  }
};
```

---

## ⚠️ Important Notes

1. **Twilio Account Required**: For production, create account at https://www.twilio.com/
2. **SMS Costs**: ~$0.0075 per SMS for Vietnam
3. **Phone Format**: Currently supports Vietnam (+84) only. Extend regex for international support.
4. **Backward Compatibility**: Email/password authentication still works alongside phone OTP
5. **OTP Cleanup**: Consider running cron job to clean expired OTPs

---

## 🐛 Troubleshooting

### SMS not sending in production

1. Check Twilio credentials in `.env`
2. Verify phone number format
3. Check Twilio account balance
4. Review Twilio logs at https://console.twilio.com/

### OTP always invalid

1. Check server time synchronization
2. Verify database timezone settings
3. Ensure OTP hasn't expired (5 min default)
4. Check attempts counter (max 3)

### Rate limit issues

1. Increase `OTP_RATE_LIMIT_PER_HOUR` in `.env`
2. Clear old OTP records from database
3. Check for duplicate requests in logs

---

## 📝 Changelog

- **v1.0.0** (2025-11-15): Initial phone OTP authentication implementation
  - Send OTP endpoint
  - Verify OTP endpoint
  - Resend OTP endpoint
  - Rate limiting
  - Development mode support
