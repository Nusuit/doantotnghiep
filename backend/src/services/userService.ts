import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

// Database connection (same as auth.ts)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

interface GoogleProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

interface User {
  id: number;
  email: string;
  google_id?: string;
  given_name?: string;
  family_name?: string;
  full_name?: string;
  profile_picture?: string;
  locale?: string;
  auth_provider: "local" | "google";
  is_email_verified: boolean;
  account_status: "active" | "inactive" | "suspended";
  role: "user" | "admin" | "moderator";
  created_at: Date;
  updated_at: Date;
}

class UserService {
  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    const [rows] = (await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    )) as any;

    return rows.length > 0 ? rows[0] : null;
  }

  // Find user by Google ID
  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const [rows] = (await pool.query(
      "SELECT * FROM users WHERE google_id = ? LIMIT 1",
      [googleId]
    )) as any;

    return rows.length > 0 ? rows[0] : null;
  }

  // Create new user from Google profile
  async createGoogleUser(profile: GoogleProfile): Promise<User> {
    try {
      // Debug log the profile data
      console.log("🔍 Creating user with profile:", {
        email: profile.email,
        sub: profile.sub,
        given_name: profile.given_name,
        family_name: profile.family_name,
        name: profile.name,
        picture: profile.picture,
        locale: profile.locale,
        email_verified: profile.email_verified,
      });

      // Ensure no undefined values
      const params = [
        profile.email || null,
        profile.sub || null,
        profile.given_name || null,
        profile.family_name || null,
        profile.name || null,
        profile.picture || null,
        profile.locale || null,
        profile.email_verified || true,
      ];

      console.log("🔍 SQL parameters:", params);

      const [result] = (await pool.execute(
        `INSERT INTO users (
          email, google_id, given_name, family_name, full_name, 
          profile_picture, locale, auth_provider, is_email_verified, 
          account_status, role, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'google', ?, 'active', 'user', NOW(), NOW())`,
        params
      )) as any;

      const userId = result.insertId;
      console.log(`✅ Created new Google user with ID: ${userId}`);

      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error("Failed to create user");
      }
      return user;
    } catch (error: any) {
      console.error("❌ Error creating Google user:", error);
      throw error;
    }
  }

  // Update existing user with Google profile data
  async updateUserWithGoogleProfile(
    userId: number,
    profile: GoogleProfile
  ): Promise<User> {
    try {
      // Debug log the profile data
      console.log("🔍 Updating user with profile:", {
        email: profile.email,
        sub: profile.sub,
        given_name: profile.given_name,
        family_name: profile.family_name,
        name: profile.name,
        picture: profile.picture,
        locale: profile.locale,
        email_verified: profile.email_verified,
      });

      // Ensure no undefined values
      const params = [
        profile.sub || null,
        profile.given_name || null,
        profile.family_name || null,
        profile.name || null,
        profile.picture || null,
        profile.locale || null,
        profile.email_verified || true,
        userId,
      ];

      console.log("🔍 SQL update parameters:", params);

      await pool.execute(
        `UPDATE users SET 
          google_id = ?, 
          given_name = COALESCE(given_name, ?), 
          family_name = COALESCE(family_name, ?),
          full_name = COALESCE(full_name, ?),
          profile_picture = COALESCE(profile_picture, ?),
          locale = COALESCE(locale, ?),
          is_email_verified = CASE 
            WHEN auth_provider = 'local' AND is_email_verified = 0 THEN ? 
            ELSE is_email_verified 
          END,
          updated_at = NOW()
        WHERE id = ?`,
        params
      );

      // Also create/update user_profiles with Google data
      const [existingProfile] = (await pool.query(
        "SELECT id FROM user_profiles WHERE user_id = ?",
        [userId]
      )) as any;

      if (existingProfile.length === 0) {
        // Create new profile record with Google data
        await pool.execute(
          `INSERT INTO user_profiles (
            user_id, display_name, first_name, last_name, 
            avatar_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            userId,
            profile.name || null,
            profile.given_name || null,
            profile.family_name || null,
            profile.picture || null,
          ]
        );
      } else {
        // Update existing profile with Google data (only if empty)
        await pool.execute(
          `UPDATE user_profiles SET 
            display_name = COALESCE(display_name, ?),
            first_name = COALESCE(first_name, ?),
            last_name = COALESCE(last_name, ?),
            avatar_url = COALESCE(avatar_url, ?),
            updated_at = NOW()
          WHERE user_id = ?`,
          [
            profile.name || null,
            profile.given_name || null,
            profile.family_name || null,
            profile.picture || null,
            userId,
          ]
        );
      }

      console.log(`✅ Updated user ${userId} with Google profile`);

      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error("Failed to update user");
      }
      return user;
    } catch (error: any) {
      console.error("❌ Error updating user with Google profile:", error);
      throw error;
    }
  }

  // Find user by ID
  async findUserById(id: number): Promise<User | null> {
    const [rows] = (await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    )) as any;

    return rows.length > 0 ? rows[0] : null;
  }

  // Process Google OAuth login/registration
  async processGoogleAuth(
    profile: GoogleProfile
  ): Promise<{ user: User; isNewUser: boolean }> {
    console.log(
      `🔍 Processing Google auth for: ${profile.email} (Google ID: ${profile.sub})`
    );

    // First, check if user exists by Google ID
    let user = await this.findUserByGoogleId(profile.sub);

    if (user) {
      console.log(`👤 Found existing user by Google ID: ${user.email}`);
      // User exists with Google ID, update profile data
      user = await this.updateUserWithGoogleProfile(user.id, profile);
      return { user, isNewUser: false };
    }

    // Check if user exists by email
    user = await this.findUserByEmail(profile.email);

    if (user) {
      console.log(
        `👤 Found existing user by email: ${user.email}, linking Google account`
      );
      // User exists with email but no Google ID, merge accounts
      user = await this.updateUserWithGoogleProfile(user.id, profile);
      return { user, isNewUser: false };
    }

    console.log(`👤 Creating new user from Google profile`);
    // Create new user
    user = await this.createGoogleUser(profile);
    return { user, isNewUser: true };
  }

  // Generate JWT token for user
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      auth_provider: user.auth_provider,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
  }

  // Update last login time
  async updateLastLogin(userId: number): Promise<void> {
    try {
      await pool.execute(
        "UPDATE users SET last_login_at = NOW() WHERE id = ?",
        [userId]
      );
      console.log(`✅ Updated last login for user ${userId}`);
    } catch (error: any) {
      console.error("❌ Error updating last login:", error);
    }
  }
}

export default new UserService();
