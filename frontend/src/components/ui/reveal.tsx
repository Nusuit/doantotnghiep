"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface RevealProps {
    children: ReactNode;
    className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ children, className = "" }) => {
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
        <div ref={ref} className={cn(
            "transition-all duration-1000 ease-out transform",
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
            className
        )}>
            {children}
        </div>
    );
};
