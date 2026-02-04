"use client";

import React from 'react';

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
