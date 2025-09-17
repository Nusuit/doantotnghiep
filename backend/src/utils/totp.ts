import speakeasy from "speakeasy";

export function generateTOTPSecret() {
  return speakeasy.generateSecret({ length: 20 });
}

export function verifyTOTP(token: string, secret: string) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}
