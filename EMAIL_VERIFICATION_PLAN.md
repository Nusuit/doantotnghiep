# ==================================

# GIẢI PHÁP EMAIL VERIFICATION

# ==================================

## 1. CÀI ĐẶT DEPENDENCIES

```bash
cd backend
npm install nodemailer @types/node
```

## 2. CẤU HÌNH .ENV (Thêm vào file backend/.env)

```env
# EMAIL CONFIGURATION
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
SMTP_FROM="Your App <your-email@gmail.com>"

# FRONTEND URL cho verification link
FRONTEND_URL=http://localhost:3000
```

## 3. SỬA FUNCTION SENDEMAIL

Thay thế function giả trong auth.ts bằng:

```typescript
import { sendMail } from "../utils/email";

const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Xác thực tài khoản</h2>
      <p>Chào bạn,</p>
      <p>Vui lòng click vào link bên dưới để xác thực email:</p>
      <a href="${verifyUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Xác thực Email
      </a>
      <p>Link sẽ hết hạn sau 24 giờ.</p>
      <p>Nếu không phải bạn đăng ký, vui lòng bỏ qua email này.</p>
    </div>
  `;

  await sendMail(email, "Xác thực tài khoản", html);
};
```

## 4. THÊM ENDPOINT VERIFY EMAIL

```typescript
router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Token xác thực không hợp lệ",
      });
    }

    // Tìm user với token
    const [users] = await pool.query(
      "SELECT id FROM users WHERE email_verification_token = ? AND is_email_verified = false",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        code: "INVALID_TOKEN",
        message: "Token không hợp lệ hoặc đã được sử dụng",
      });
    }

    // Cập nhật user đã verify
    await pool.execute(
      "UPDATE users SET is_email_verified = true, email_verification_token = NULL WHERE email_verification_token = ?",
      [token]
    );

    res.json({
      message: "Email đã được xác thực thành công!",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Lỗi xác thực email",
    });
  }
});
```

## 5. FRONTEND VERIFY PAGE

Tạo trang `/verify-email` trong frontend để xử lý khi user click link.

## 6. CÀI ĐẶT GMAIL APP PASSWORD

1. Bật 2-step verification
2. Tạo App Password trong Google Account
3. Sử dụng App Password thay vì password thường

==================================
BẠN MUỐN IMPLEMENT NGAY KHÔNG?
==================================
