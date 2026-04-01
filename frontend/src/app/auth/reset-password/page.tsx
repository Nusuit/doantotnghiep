"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/services/authService';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email');

    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [emailParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await AuthService.resetPassword(email, otpCode, newPassword);
            if (res.success) {
                toast.success(res.message || 'Password reset successfully!');
                router.push('/auth');
            } else {
                toast.error(res.error || 'Failed to reset password');
            }
        } catch (err) {
            console.error(err);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans items-center justify-center bg-gray-50 dark:bg-[#0B1120] p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#151e32] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in-up">

                <div className="text-center mb-8">
                    <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6 text-sm font-medium">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back
                    </Link>
                    <div className="w-12 h-12 bg-green-600/10 rounded-xl mx-auto flex items-center justify-center text-green-600 font-bold mb-4">
                        <span className="material-symbols-outlined text-2xl">key</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Enter the code sent to your email and set a new password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            readOnly={!!emailParam}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="otp" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Reset Code</label>
                        <input
                            id="otp"
                            type="text"
                            required
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 font-mono text-center tracking-widest text-lg"
                            placeholder="000000"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="newPassword" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">New Password</label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
