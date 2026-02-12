"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, RotateCcw } from 'lucide-react';

function VerifyOtpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email');

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    if (!email) {
        return <div className="text-white">Invalid Request: Missing email</div>;
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.auth.verifyEmailOtp(email, otp);
            toast.success("Email verified! Let's personalize your experience ✨");
            router.push('/app/onboarding');
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await api.auth.resendEmailOtp(email);
            toast.success(`OTP resent to ${email}`);
        } catch (err: any) {
            console.error(err);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
            <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 mb-6">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
                Enter it below to verify your account.
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-primary transition-all"
                    autoFocus
                />

                <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Account <ArrowRight className="w-5 h-5" /></>}
                </button>
            </form>

            <div className="mt-6">
                <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                    {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Did't receive code? Resend
                </button>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-cyan-900/20 to-blue-900/20 z-0"></div>
            <div className="relative z-10 w-full max-w-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <VerifyOtpContent />
                </Suspense>
            </div>
        </div>
    );
}
