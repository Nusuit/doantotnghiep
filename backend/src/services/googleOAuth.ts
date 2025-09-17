import { OAuth2Client } from "google-auth-library";
import axios from "axios";

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

class GoogleOAuthService {
  private client: OAuth2Client | null = null;

  constructor() {
    // Check if required env vars exist
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn(
        "⚠️  Google OAuth not configured - missing CLIENT_ID or CLIENT_SECRET"
      );
      return;
    }

    try {
      this.client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      console.log("✅ Google OAuth client initialized");
    } catch (error) {
      console.error("❌ Error initializing Google OAuth client:", error);
    }
  }

  // Generate Google OAuth URL
  generateAuthUrl(): string {
    if (!this.client) {
      throw new Error("Google OAuth client not initialized");
    }

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string) {
    if (!this.client) {
      throw new Error("Google OAuth client not initialized");
    }

    const { tokens } = await this.client.getToken(code);
    return tokens;
  }

  // Get user info from Google API
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    return response.data;
  }

  // Verify ID token
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo | null> {
    if (!this.client) {
      throw new Error("Google OAuth client not initialized");
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) return null;

      return {
        sub: payload.sub || "",
        name: payload.name || "",
        given_name: payload.given_name || "",
        family_name: payload.family_name || "",
        picture: payload.picture || "",
        email: payload.email || "",
        email_verified: payload.email_verified || false,
        locale: payload.locale || "en",
      };
    } catch (error) {
      console.error("Error verifying ID token:", error);
      return null;
    }
  }

  // Check if service is configured
  isConfigured(): boolean {
    return (
      !!this.client &&
      !!process.env.GOOGLE_CLIENT_ID &&
      !!process.env.GOOGLE_CLIENT_SECRET
    );
  }
}

export default new GoogleOAuthService();
