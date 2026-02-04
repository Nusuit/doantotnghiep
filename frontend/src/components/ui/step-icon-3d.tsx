"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface StepIcon3DProps {
    icon: string;
    color: "blue" | "green" | "yellow" | "purple";
}

const colorStyles = {
    blue: {
        back: "bg-blue-500/20 group-hover:bg-blue-500/30",
        border: "border-blue-500/30 border-blue-500/20",
        text: "text-blue-500",
    },
    green: {
        back: "bg-green-500/20 group-hover:bg-green-500/30",
        border: "border-green-500/30 border-green-500/20",
        text: "text-green-500",
    },
    yellow: {
        back: "bg-yellow-500/20 group-hover:bg-yellow-500/30",
        border: "border-yellow-500/30 border-yellow-500/20",
        text: "text-yellow-500",
    },
    purple: {
        back: "bg-purple-500/20 group-hover:bg-purple-500/30",
        border: "border-purple-500/30 border-purple-500/20",
        text: "text-purple-500",
    }
};

export const StepIcon3D: React.FC<StepIcon3DProps> = ({ icon, color }) => {
    const styles = colorStyles[color];

    return (
        <div className="relative w-24 h-24 flex items-center justify-center perspective-[800px] group-hover:scale-110 transition-transform duration-500">
            {/* Back Layer (Depth & Glow) */}
            <div className={cn(
                "absolute inset-0 rounded-3xl transform translate-z-[-12px] translate-y-2 blur-md transition-all duration-500 group-hover:translate-y-4",
                styles.back
            )}></div>

            {/* Front Layer (Glass Body) */}
            <div className={cn(
                "relative z-10 w-full h-full bg-white dark:bg-[#1A1D24]/90 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform duration-500 group-hover:rotate-x-6 group-hover:rotate-y-6 group-hover:translate-z-4 border border-b-4 border-r-4",
                styles.border
            )}>

                {/* Floating Icon */}
                <div className={cn(
                    "transform translate-z-[30px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]",
                    styles.text
                )}>
                    <span className="material-symbols-outlined text-5xl">{icon}</span>
                </div>

                {/* Shine Effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none"></div>
            </div>
        </div>
    );
};
