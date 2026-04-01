"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuthService } from '@/services/authService';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await AuthService.forgotPassword(email);
            if (res.success) {
                toast.success(res.message || 'If an account exists, a reset code has been sent.');
                // Redirect to reset password page with email pre-filled
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(res.error || 'Failed to send reset email');
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
                    <Link href="/auth" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6 text-sm font-medium">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Login
                    </Link>
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl mx-auto flex items-center justify-center text-blue-600 font-bold mb-4">
                        <span className="material-symbols-outlined text-2xl">lock_reset</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                            placeholder="you@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Send Reset Code'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}
