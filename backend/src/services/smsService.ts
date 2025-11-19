/**
 * SMS Service - Twilio Integration
 * Supports both production (real SMS) and development (console log) modes
 */

interface SmsConfig {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
}

class SmsService {
  private client: any;
  private fromNumber: string;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "";

    // Only initialize Twilio in production
    if (!this.isDevelopment) {
      try {
        const twilio = require("twilio");
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log("✅ Twilio SMS Service initialized (Production mode)");
      } catch (error) {
        console.warn(
          "⚠️ Twilio not configured. Install with: npm install twilio"
        );
      }
    } else {
      console.log("📱 SMS Service in Development mode (console logging)");
    }
  }

  /**
   * Send OTP via SMS
   * In dev mode: Just log to console
   * In prod mode: Actually send SMS via Twilio
   */
  async sendOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
    const message = `Your verification code is: ${otpCode}. Valid for 5 minutes. Do not share this code with anyone.`;

    try {
      if (this.isDevelopment) {
        // Development mode: Log to console
        console.log("\n📱 ========== SMS DEBUG ==========");
        console.log(`📞 To: ${phoneNumber}`);
        console.log(`🔢 OTP: ${otpCode}`);
        console.log(`📝 Message: ${message}`);
        console.log("=================================\n");
        return true;
      } else {
        // Production mode: Send real SMS
        if (!this.client) {
          throw new Error("Twilio client not initialized");
        }

        const result = await this.client.messages.create({
          body: message,
          from: this.fromNumber,
          to: phoneNumber,
        });

        console.log(`✅ SMS sent to ${phoneNumber}, SID: ${result.sid}`);
        return true;
      }
    } catch (error: any) {
      console.error("❌ SMS send failed:", error.message);
      return false;
    }
  }

  /**
   * Send custom SMS message
   */
  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (this.isDevelopment) {
        console.log(`\n📱 SMS to ${phoneNumber}: ${message}\n`);
        return true;
      } else {
        if (!this.client) {
          throw new Error("Twilio client not initialized");
        }

        const result = await this.client.messages.create({
          body: message,
          from: this.fromNumber,
          to: phoneNumber,
        });

        console.log(`✅ SMS sent to ${phoneNumber}, SID: ${result.sid}`);
        return true;
      }
    } catch (error: any) {
      console.error("❌ SMS send failed:", error.message);
      return false;
    }
  }
}

export default new SmsService();
