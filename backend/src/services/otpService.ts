/**
 * OTP Service - Generate and verify OTP codes
 * Handles OTP lifecycle: generate → store → verify → cleanup
 */

import mysql from "mysql2/promise";

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  port: Number(process.env.DB_PORT) || 3306,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
});

interface OtpData {
  id: number;
  phoneNumber: string;
  otpCode: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
}

class OtpService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES =
    Number(process.env.OTP_EXPIRY_MINUTES) || 5;
  private readonly MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 3;

  /**
   * Generate random 6-digit OTP code
   */
  generateOtp(): string {
    const min = Math.pow(10, this.OTP_LENGTH - 1);
    const max = Math.pow(10, this.OTP_LENGTH) - 1;
    const otp = Math.floor(min + Math.random() * (max - min + 1));
    return otp.toString();
  }

  /**
   * Store OTP in database with expiry time
   */
  async storeOtp(phoneNumber: string, otpCode: string): Promise<void> {
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
    );

    try {
      // Clean up old OTPs for this phone number
      await pool.execute(
        "DELETE FROM otp_verifications WHERE phone_number = ? AND (is_used = true OR expires_at < NOW())",
        [phoneNumber]
      );

      // Insert new OTP
      await pool.execute(
        `INSERT INTO otp_verifications (phone_number, otp_code, expires_at, attempts, is_used, created_at)
         VALUES (?, ?, ?, 0, false, NOW())`,
        [phoneNumber, otpCode, expiresAt]
      );

      console.log(
        `✅ OTP stored for ${phoneNumber}, expires at ${expiresAt.toISOString()}`
      );
    } catch (error: any) {
      console.error("❌ Failed to store OTP:", error.message);
      throw new Error("Failed to store OTP");
    }
  }

  /**
   * Verify OTP code
   * Returns true if valid, false otherwise
   */
  async verifyOtp(
    phoneNumber: string,
    otpCode: string
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Find OTP record
      const [rows] = (await pool.query(
        `SELECT id, otp_code, expires_at, attempts, is_used 
         FROM otp_verifications 
         WHERE phone_number = ? AND is_used = false
         ORDER BY created_at DESC 
         LIMIT 1`,
        [phoneNumber]
      )) as any;

      if (rows.length === 0) {
        return {
          valid: false,
          reason: "NO_OTP_FOUND",
        };
      }

      const otpData: OtpData = rows[0];

      // Check if OTP is already used
      if (otpData.isUsed) {
        return {
          valid: false,
          reason: "OTP_ALREADY_USED",
        };
      }

      // Check if OTP is expired
      if (new Date() > new Date(otpData.expiresAt)) {
        await pool.execute(
          "UPDATE otp_verifications SET is_used = true WHERE id = ?",
          [otpData.id]
        );
        return {
          valid: false,
          reason: "OTP_EXPIRED",
        };
      }

      // Check attempts limit
      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        await pool.execute(
          "UPDATE otp_verifications SET is_used = true WHERE id = ?",
          [otpData.id]
        );
        return {
          valid: false,
          reason: "MAX_ATTEMPTS_EXCEEDED",
        };
      }

      // Verify OTP code
      if (otpData.otpCode !== otpCode) {
        // Increment attempts
        await pool.execute(
          "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?",
          [otpData.id]
        );
        return {
          valid: false,
          reason: "INVALID_OTP_CODE",
        };
      }

      // OTP is valid - mark as used
      await pool.execute(
        "UPDATE otp_verifications SET is_used = true WHERE id = ?",
        [otpData.id]
      );

      console.log(`✅ OTP verified successfully for ${phoneNumber}`);
      return { valid: true };
    } catch (error: any) {
      console.error("❌ OTP verification failed:", error.message);
      return {
        valid: false,
        reason: "VERIFICATION_ERROR",
      };
    }
  }

  /**
   * Check rate limiting - how many OTPs sent in last hour
   */
  async checkRateLimit(phoneNumber: string): Promise<{
    allowed: boolean;
    count: number;
    limit: number;
  }> {
    const limit = Number(process.env.OTP_RATE_LIMIT_PER_HOUR) || 3;

    try {
      const [rows] = (await pool.query(
        `SELECT COUNT(*) as count 
         FROM otp_verifications 
         WHERE phone_number = ? 
         AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [phoneNumber]
      )) as any;

      const count = rows[0]?.count || 0;

      return {
        allowed: count < limit,
        count,
        limit,
      };
    } catch (error: any) {
      console.error("❌ Rate limit check failed:", error.message);
      return { allowed: true, count: 0, limit };
    }
  }

  /**
   * Clean up expired OTPs (should be run by cron job)
   */
  async cleanupExpiredOtps(): Promise<number> {
    try {
      const [result] = (await pool.execute(
        "DELETE FROM otp_verifications WHERE expires_at < NOW() OR is_used = true"
      )) as any;

      const deletedCount = result.affectedRows || 0;
      console.log(`🧹 Cleaned up ${deletedCount} expired/used OTPs`);
      return deletedCount;
    } catch (error: any) {
      console.error("❌ OTP cleanup failed:", error.message);
      return 0;
    }
  }
}

export default new OtpService();
