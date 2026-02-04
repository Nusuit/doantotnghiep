"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';

// --- ANIMATION COMPONENTS ---

// 1. Scroll Reveal Wrapper
export const Reveal: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
            {children}
        </div>
    );
};

// 2. 3D Tilt Card Effect
export const TiltCard: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = "" }) => {
    const [transform, setTransform] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    };

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-transform duration-200 ease-out ${className}`}
            style={{ transform }}
        >
            {children}
        </div>
    );
};

// 3. Live Ticker (High Velocity Mode)
export const LiveTicker: React.FC<{ start: number; suffix?: string }> = ({ start, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const [hasStarted, setHasStarted] = useState(false);

    // Initial Scroll Trigger
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasStarted) {
                setHasStarted(true);
            }
        }, { threshold: 0.1 });

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasStarted]);

    // Animation Logic
    useEffect(() => {
        if (!hasStarted) return;

        // 1. Fast count up to initial value (Reveal Phase)
        let startTime: number;
        const duration = 2000; // 2s duration

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease Out Expo
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = start * ease;

            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 2. Start Continuous "Live" Updates after reveal
                startLiveUpdates();
            }
        };
        requestAnimationFrame(animate);

        let liveInterval: any;
        const startLiveUpdates = () => {
            // Update extremely fast (every 80ms) with large increments to simulate high activity
            liveInterval = setInterval(() => {
                setCount(prev => {
                    const isLarge = start > 1000000;
                    // Large numbers (Staked): Jump by 500 - 3000
                    // Small numbers (Voters): Jump by 1 - 7
                    const increment = isLarge
                        ? Math.floor(Math.random() * 2500) + 500
                        : Math.floor(Math.random() * 7) + 1;

                    return prev + increment;
                });
            }, 80);
        };

        return () => clearInterval(liveInterval);

    }, [hasStarted, start]);

    return (
        <span ref={ref} className="tabular-nums tracking-tight font-mono">
            {Math.floor(count).toLocaleString()}{suffix}
        </span>
    );
};

// --- CSS ART VISUALS FOR PILLARS ---
export const TopicVisual = () => (
    <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Core */}
        <div className="absolute w-8 h-8 bg-cyan-400 rounded-full blur-[2px] shadow-[0_0_20px_#22d3ee] animate-pulse"></div>
        <div className="absolute w-6 h-6 bg-white rounded-full z-10"></div>

        {/* Orbits */}
        <div className="absolute w-24 h-24 border border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]" style={{ transform: 'rotateX(60deg)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
        </div>
        <div className="absolute w-24 h-24 border border-cyan-500/30 rounded-full animate-[spin_5s_linear_infinite_reverse]" style={{ transform: 'rotateY(60deg)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_10px_#67e8f9]"></div>
        </div>
        <div className="absolute w-16 h-16 border border-cyan-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
    </div>
);

export const EntityVisual = () => (
    <div className="relative w-32 h-32 flex items-center justify-center perspective-[500px]">
        {/* 3D Cube Representation */}
        <div className="relative w-16 h-16 animate-[spin_10s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm transform translate-z-[32px]"></div>
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm transform -translate-z-[32px]"></div>
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm transform rotate-y-90 translate-z-[32px]"></div>
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm transform rotate-y-90 -translate-z-[32px]"></div>
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm transform rotate-x-90 translate-z-[32px]"></div>
            <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-500/10 backdrop-blur-sm transform rotate-x-90 -translate-z-[32px]"></div>

            {/* Inner Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-purple-400 blur-md rounded-full shadow-[0_0_30px_#c084fc]"></div>
        </div>
    </div>
);

export const PlaceVisual = () => (
    <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Radar Rings */}
        <div className="absolute w-full h-full border border-emerald-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute w-2/3 h-2/3 border border-emerald-500/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>

        {/* Map Pin 3D */}
        <div className="relative z-10 animate-float">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full rounded-br-none transform rotate-45 shadow-[0_10px_20px_rgba(16,185,129,0.4)] flex items-center justify-center border-2 border-white/20">
                <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
        </div>

        {/* Shadow */}
        <div className="absolute bottom-6 w-10 h-2 bg-black/40 blur-sm rounded-full animate-[pulse_3s_infinite]"></div>
    </div>
);

// --- 3D Icon Component for How It Works ---
export const StepIcon3D = ({ icon, color }: { icon: string, color: string }) => {
    // Map Tailwind color names to hex/rgba for box-shadows if needed, 
    // but using utility classes is cleaner.
    // Assuming color matches tailwind palette names (blue, green, yellow, purple)
    return (
        <div className="relative w-24 h-24 flex items-center justify-center perspective-[800px] group-hover:scale-110 transition-transform duration-500">
            {/* Back Layer (Depth & Glow) */}
            <div className={`absolute inset-0 bg-${color}-500/20 rounded-3xl transform translate-z-[-12px] translate-y-2 blur-md transition-all duration-500 group-hover:bg-${color}-500/30 group-hover:translate-y-4`}></div>

            {/* Front Layer (Glass Body) */}
            <div className={`relative z-10 w-full h-full bg-white dark:bg-[#1A1D24]/90 backdrop-blur-xl border border-${color}-500/30 rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform duration-500 group-hover:rotate-x-6 group-hover:rotate-y-6 group-hover:translate-z-4 border-b-4 border-r-4 border-${color}-500/20`}>

                {/* Floating Icon */}
                <div className={`text-${color}-500 transform translate-z-[30px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]`}>
                    <span className="material-symbols-outlined text-5xl">{icon}</span>
                </div>

                {/* Shine Effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none"></div>
            </div>
        </div>
    );
};
