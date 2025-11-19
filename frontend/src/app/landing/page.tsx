"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Base white background */}
      <div className="absolute inset-0 bg-white"></div>

      {/* Base: Very light gradient foundation */}
      <div
        className="absolute inset-0"
        style={{
          background: `rgb(250 252 255)`,
        }}
      ></div>

      {/* Main diagonal stripe: very soft, subtle colors */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg,
              rgba(186, 230, 253, 0.3) 0%,
              rgba(125, 211, 252, 0.3) 12%,
              rgba(56, 189, 248, 0.3) 24%,
              rgba(14, 165, 233, 0.3) 36%,
              rgba(59, 130, 246, 0.3) 48%,
              rgba(99, 102, 241, 0.3) 60%,
              rgba(139, 92, 246, 0.3) 72%,
              rgba(167, 139, 250, 0.3) 84%,
              rgba(196, 181, 253, 0.3) 96%,
              rgba(221, 214, 254, 0.3) 100%
            )
          `,
        }}
      ></div>

      {/* Smooth perpendicular fade */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(45deg,
              rgba(255, 255, 255, 0.7) 0%,
              rgba(255, 255, 255, 0.65) 8%,
              rgba(255, 255, 255, 0.58) 16%,
              rgba(255, 255, 255, 0.5) 24%,
              rgba(255, 255, 255, 0.42) 32%,
              rgba(255, 255, 255, 0.33) 40%,
              rgba(255, 255, 255, 0.23) 45%,
              rgba(255, 255, 255, 0.1) 49%,
              transparent 50.5%,
              rgba(255, 255, 255, 0.1) 52%,
              rgba(255, 255, 255, 0.23) 56%,
              rgba(255, 255, 255, 0.33) 61%,
              rgba(255, 255, 255, 0.42) 69%,
              rgba(255, 255, 255, 0.5) 77%,
              rgba(255, 255, 255, 0.58) 85%,
              rgba(255, 255, 255, 0.65) 93%,
              rgba(255, 255, 255, 0.7) 100%
            )
          `,
        }}
      ></div>

      {/* Subtle blur effects along diagonal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Light sky zone */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] left-[20%] w-[450px] h-[450px] bg-sky-300/25 rounded-full blur-[100px]"></div>

        {/* Center blue transition */}
        <div className="absolute top-[40%] left-[40%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[130px]"></div>
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-indigo-200/18 rounded-full blur-[120px]"></div>
        <div className="absolute top-[60%] left-[60%] w-[500px] h-[500px] bg-violet-200/20 rounded-full blur-[130px]"></div>

        {/* Light violet zone */}
        <div className="absolute top-[80%] left-[80%] w-[450px] h-[450px] bg-violet-300/25 rounded-full blur-[100px]"></div>
        <div className="absolute top-[90%] left-[90%] w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[120px]"></div>
      </div>

      {/* Subtle overall softening */}
      <div className="absolute inset-0 bg-white/5"></div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        <section className="relative overflow-hidden w-full">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full border border-sky-200/80 mb-8 shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 transition-all duration-500">
                <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
                <span className="text-sm text-sky-700">
                  Welcome to Knowledge Sharing Platform
                </span>
              </div>

              {/* Heading with gradient text */}
              <h1 className="mb-8 text-6xl font-bold text-black leading-tight">
                <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  Share knowledge, earn value.
                </span>
              </h1>

              <p className="text-neutral-700 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                A Web2.5 platform where quality contributions are recognized and
                rewarded. Write, review, govern, and grow with the community.
              </p>

              {/* CTA Buttons */}
              <div className="flex justify-center mb-16">
                <button
                  className="group relative px-16 py-5 rounded-full bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600 text-white hover:from-sky-600 hover:via-blue-600 hover:to-violet-700 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02]"
                  onClick={() => router.push("/auth")}
                >
                  <span className="flex items-center gap-3 text-xl">
                    <span>Get Started</span>
                    <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </div>

              {/* Features - Hidden on landing, showing clean simple design */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
