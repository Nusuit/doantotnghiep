"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { PublicRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AuthPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi OTP");
      }

      setStep("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otpCode: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP không đúng");
      }

      // Store tokens
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);

      // Redirect
      router.push("/social");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi lại OTP");
      }

      setError("");
      alert("OTP mới đã được gửi!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center px-4">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200/30 via-blue-200/30 to-violet-300/30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent"></div>

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
              <span className="text-white text-2xl font-bold">KS</span>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
            <p className="text-neutral-600">
              Log in to continue to Knowledge Sharing
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-neutral-200/50 p-8 shadow-2xl shadow-violet-500/10">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {step === "phone" ? (
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-black">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <Input
                      type="tel"
                      placeholder="+84 987 654 321"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 bg-neutral-50 border-neutral-200 focus:border-sky-400"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    We'll send you a verification code to this number
                  </p>
                </div>

                <Button
                  className="w-full bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600 text-white hover:from-sky-600 hover:via-blue-600 hover:to-violet-700 shadow-lg hover:shadow-xl shadow-violet-500/30 transition-all duration-300"
                  onClick={handleSendCode}
                  disabled={loading || !phoneNumber}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("phone")}
                    className="mb-4 -ml-2 hover:bg-sky-50 text-neutral-600"
                  >
                    ← Change Number
                  </Button>

                  <label className="block mb-2 text-sm font-medium text-black">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-neutral-50 border-neutral-200 text-center text-2xl tracking-widest focus:border-sky-400"
                    maxLength={6}
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Code sent to {phoneNumber}
                  </p>
                </div>

                <Button
                  className="w-full bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600 text-white hover:from-sky-600 hover:via-blue-600 hover:to-violet-700 shadow-lg hover:shadow-xl shadow-violet-500/30 transition-all duration-300"
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full text-center text-sm text-neutral-600 hover:text-sky-600 transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            )}
          </Card>

          <div className="text-center mt-6">
            <p className="text-neutral-600">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-sky-600 hover:text-blue-600 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
