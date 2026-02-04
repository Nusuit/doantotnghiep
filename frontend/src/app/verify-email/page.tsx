"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            setStatus('error');
            toast.error("Invalid verification link");
            return;
        }

        const verify = async () => {
            try {
                await api.auth.verifyEmail(email, token);
                setStatus('success');
                toast.success("Email verified successfully!");
                // Redirect after 3s
                setTimeout(() => router.push('/app/feed'), 3000);
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        };

        verify();
    }, [searchParams, router]);

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
            {status === 'verifying' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <h2 className="text-2xl font-bold text-white">Verifying your email...</h2>
                    <p className="text-gray-400">Please wait while we secure your reputation.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <h2 className="text-2xl font-bold text-white">Verified!</h2>
                    <p className="text-gray-400">Your email has been successfully verified.</p>
                    <Link href="/app/feed" className="bg-primary text-white px-6 py-2 rounded-xl font-bold mt-2">
                        Go to App
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4">
                    <XCircle className="w-16 h-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                    <p className="text-gray-400">The link may be invalid or expired.</p>
                    <Link href="/auth" className="text-primary hover:underline">
                        Back to Login
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-900/20 to-blue-900/20 z-0"></div>
            <div className="relative z-10">
                <Suspense fallback={<div>Loading...</div>}>
                    <VerifyContent />
                </Suspense>
            </div>
        </div>
    );
}
