"use client";

import React, { useState, useEffect, useRef } from 'react';

interface LiveTickerProps {
    start: number;
    suffix?: string;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ start, suffix = "" }) => {
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

        let liveInterval: NodeJS.Timeout;
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
