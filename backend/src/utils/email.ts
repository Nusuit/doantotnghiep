import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực tài khoản</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff;">
                <h1 style="color: #007bff; margin: 0;">Xác thực tài khoản</h1>
            </div>
            
            <div style="padding: 30px 20px;">
                <p style="font-size: 16px; line-height: 1.6; color: #333;">Chào bạn,</p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Cảm ơn bạn đã đăng ký tài khoản! Để hoàn tất quá trình đăng ký, vui lòng click vào nút bên dưới để xác thực email của bạn:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" 
                       style="background-color: #007bff; 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              font-size: 16px; 
                              font-weight: bold; 
                              display: inline-block;">
                        ✅ Xác thực Email
                    </a>
                </div>
                
                <p style="font-size: 14px; line-height: 1.6; color: #666;">
                    Hoặc copy và paste link sau vào trình duyệt:<br>
                    <a href="${verifyUrl}" style="color: #007bff; word-break: break-all;">${verifyUrl}</a>
                </p>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #856404;">
                        ⏰ <strong>Lưu ý:</strong> Link xác thực sẽ hết hạn sau <strong>24 giờ</strong>.
                    </p>
                </div>
                
                <p style="font-size: 14px; line-height: 1.6; color: #666;">
                    Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
                </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding: 20px; text-align: center; color: #999; font-size: 12px;">
                <p style="margin: 0;">© 2025 Your App Name. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  await sendMail(email, "🔐 Xác thực tài khoản của bạn", html);
}
