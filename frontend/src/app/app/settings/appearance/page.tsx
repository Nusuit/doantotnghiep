'use client';

import React, { useState } from 'react';
import { useTheme } from "next-themes";

const THEMES = [
    { id: 'light', name: 'Classic Light', bg: '#ffffff', primary: '#2970FF', mode: 'light' },
    { id: 'dark', name: 'Classic Dark', bg: '#0B0E14', primary: '#2970FF', mode: 'dark' },
    { id: 'serene', name: 'Serene', bg: '#F0F4F8', primary: '#0D9488', mode: 'light' },
    { id: 'ocean', name: 'Ocean', bg: '#0F172A', primary: '#38BDF8', mode: 'dark' },
];

export default function AppearanceSettingsPage() {
    const { theme, setTheme } = useTheme();
    const [textSize, setTextSize] = useState(16);
    const [textScope, setTextScope] = useState<'global' | 'content'>('global');

    // --- SUB-COMPONENT: POST PREVIEW ---
    const PostPreview = () => (
        <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-5">
                <div className="flex-shrink-0 pt-1">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold font-mono tracking-wider bg-primary/5 text-primary dark:bg-primary/20 dark:text-blue-400 ring-1 ring-primary/10">
                        KP
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Knowledge Protocol</span>
                            <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                            <span className="text-xs text-gray-500">Just now</span>
                        </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-white leading-tight mt-1 mb-2">
                        Typography Preview
                    </h2>

                    <div
                        style={{ fontSize: `${textSize}px` }}
                        className="font-sans text-gray-700 dark:text-gray-300 leading-relaxed opacity-90 mb-4 whitespace-pre-wrap transition-all duration-200"
                    >
                        This is how your reading experience will look. Adjust the slider to find the perfect text size for absorbing knowledge on the Permaweb. Legibility is key to understanding complex topics.
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-2 border-t border-transparent text-gray-400 text-xs font-bold">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">arrow_upward</span> 42
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">chat_bubble</span> 5
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="material-symbols-outlined text-[18px]">share</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Appearance</h1>
                    <p className="text-sm text-gray-500">Customize how KnowledgeShare looks on your device.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="space-y-6 animate-fade-in">

                    <div className="bg-white dark:bg-[#0B0E14] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-1">Typography</h3>
                                <p className="text-xs text-gray-500">Adjust content size for better readability.</p>
                            </div>

                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setTextScope('global')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${textScope === 'global'
                                        ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Global
                                </button>
                                <button
                                    onClick={() => setTextScope('content')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${textScope === 'content'
                                        ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Posts Only
                                </button>
                            </div>
                        </div>

                        <div className="mb-8 pl-1 pr-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-400">Aa</span>
                                <span className="text-lg font-mono text-gray-900 dark:text-white font-bold">{textSize}px</span>
                                <span className="text-xl font-bold text-gray-400">Aa</span>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="32"
                                step="1"
                                value={textSize}
                                onChange={(e) => setTextSize(Number(e.target.value))}
                                className="w-full cursor-pointer"
                            />
                        </div>

                        {/* LIVE PREVIEW AREA */}
                        <div className="p-4 bg-gray-100 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800/50">
                            <div className="mb-2 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Preview</span>
                                <span className="text-[10px] text-gray-400">
                                    {textScope === 'global' ? 'Scales Everything' : 'Scales Post Body'}
                                </span>
                            </div>
                            <PostPreview />
                        </div>
                    </div>

                    {/* COLOR THEME SELECTOR */}
                    <div className="bg-white dark:bg-[#0B0E14] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <h3 className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-6">Color theme</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {THEMES.map((t) => {
                                const isSelected = theme === t.mode; // Simple check for now
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.mode)}
                                        className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 ${isSelected ? 'border-purple-500 scale-[1.02] shadow-xl' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <div
                                            className="h-20 w-full p-3 flex flex-col justify-end relative"
                                            style={{ backgroundColor: t.bg }}
                                        >
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg absolute bottom-3 right-3" style={{ backgroundColor: t.primary }}>
                                                {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
                                            </div>
                                        </div>
                                        <div className="py-2 text-center bg-gray-50 dark:bg-[#161b22] border-t border-gray-100 dark:border-gray-800">
                                            <span className={`text-xs font-bold ${isSelected ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {t.name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
