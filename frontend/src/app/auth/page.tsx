"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_API_URL } from '@/lib/config';

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const { login, register, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/app/feed');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (errorParam) {
      const messages: Record<string, string> = {
        'ACCOUNT_LOCKED': "Account is locked.",
        'SERVER_ERROR': "Server error during login.",
        'google_auth_failed': "Google authentication failed.",
      };
      toast.error(messages[errorParam] || "Authentication failed.");
      router.replace('/auth');
    }
  }, [errorParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        registerSchema.parse({ email, password, fullName });
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await login({ username: email, password });
        if (res.error === 'ERR_VERIFY_REQUIRED') {
          toast.error('Please verify your email first.');
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
          return;
        }
        if (res.success) {
          toast.success('Welcome back!');
          // Small delay to ensure cookies are set before redirect
          await new Promise(resolve => setTimeout(resolve, 200));
          router.push('/app/feed');
        } else {
          toast.error(res.error || 'Invalid credentials');
        }
      } else {
        const res = await register({ email, password, name: fullName });
        if (res.success) {
          toast.success('Account created successfully!');
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        } else {
          toast.error(res.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT SIDE: Brand & Vision (Dark Blue Theme) */}
      <div className="hidden lg:flex w-1/2 bg-[#0B1120] relative overflow-hidden flex-col justify-between p-16 text-white">

        {/* Abstract Background Grid/Noise */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

        {/* Header: Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center font-bold font-display text-xl text-white shadow-lg shadow-blue-500/20">KS</div>
            <span className="font-bold font-display text-xl tracking-tight">KnowledgeShare</span>
          </Link>
        </div>

        {/* Center: Main Content */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Decentralized Knowledge Protocol
          </div>

          <h1 className="text-5xl font-black font-display leading-[1.1] mb-6 tracking-tight">
            Own your content.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Monetize your mind.</span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-12 max-w-lg">
            Join the first platform where knowledge contributions are immutable, verifiable, and directly rewarded with ownership.
          </p>

          {/* Testimonial Card */}
          <div className="bg-[#151e32]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative">
            <div className="text-blue-500 text-4xl font-serif absolute top-4 left-4 opacity-50">"</div>
            <div className="relative z-10 pl-2">
              <p className="text-lg text-gray-200 font-serif italic mb-6">
                The beautiful thing about learning is that no one can take it away from you.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-300 font-bold border border-blue-500/30">BB</div>
                <div>
                  <div className="text-sm font-bold text-white">B.B. King</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Legendary Blues Musician</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-gray-500 font-mono">
          <span>© 2026 Knowledge Sharing Inc.</span>
          <div className="flex items-center gap-4 ml-auto">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Protocol</a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form (Light/Clean) */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#0B1120] flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[420px] space-y-8 animate-fade-in-up">

          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold mb-4">KS</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KnowledgeShare</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isLogin ? 'Enter your details to access your workspace.' : 'Start your journey to reputation ownership.'}
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch(`${API_BASE_API_URL}/auth/google`);
                  const data = await res.json();
                  if (data.success && data.data.authUrl) {
                    window.location.href = data.data.authUrl;
                  } else {
                    toast.error('Failed to initiate Google Login');
                  }
                } catch (e) {
                  console.error(e);
                  toast.error('Error connecting to server');
                }
              }}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 p-3 h-12 rounded-xl text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all font-medium text-sm"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={() => toast.info('Wallet Auth coming soon!')}
              className="w-full flex items-center justify-center gap-3 bg-[#eff6ff] dark:bg-[#1a2a3e] border border-blue-100 dark:border-blue-900/50 p-3 h-12 rounded-xl text-blue-600 dark:text-blue-300 hover:bg-[#dbeafe] dark:hover:bg-[#1e3a5a] transition-all font-medium text-sm"
            >
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              Connect Phantom Wallet
            </button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-400">
              <span className="px-4 bg-white dark:bg-[#0B1120]">or continue with</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="Dr. Alice Smith"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
                {isLogin && <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot password?</a>}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Sign in to Dashboard' : 'Create Account'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-blue-600 hover:text-blue-700 ml-1 hover:underline transition-all"
              >
                {isLogin ? 'Create account' : 'Log in'}
              </button>
            </p>
          </div>

        </div>

        {/* Floating Theme Toggle (Optional/Mock) */}
        <div className="absolute bottom-8 right-8 hidden lg:block">
          <button className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
            <span className="material-symbols-outlined text-sm">dark_mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
