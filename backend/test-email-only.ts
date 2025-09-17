import { sendVerificationEmail } from "./src/utils/email";
import "dotenv/config";

console.log("📧 Testing email service...");
console.log("SMTP Config:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  hasPass: !!process.env.SMTP_PASS,
  from: process.env.SMTP_FROM,
});

const testEmail = async () => {
  try {
    console.log("🚀 Sending test email...");
    await sendVerificationEmail("22520709@gm.uit.edu.com", "test-token-123");
    console.log("✅ Email sent successfully!");
  } catch (error: any) {
    console.error("❌ Email failed:", error.message);
    console.error("Full error:", error);
  }
};

testEmail();
