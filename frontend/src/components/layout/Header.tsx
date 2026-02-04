"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/context/AuthContext';

// --- MOCK NOTIFICATIONS ---
const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'Reward Received', content: 'You earned 120 KNOW-U for your recent article.', time: '2m ago', read: false, type: 'reward' },
    { id: 2, title: 'Proposal KIP-12 Live', content: 'Voting is now open for Treasury Allocation.', time: '1h ago', read: false, type: 'gov' },
    { id: 3, title: 'New Follower', content: 'Dr. Sarah Chen started following you.', time: '3h ago', read: true, type: 'social' },
    { id: 4, title: 'Edit Suggestion', content: 'Marcus Graph suggested an edit on "Solana Architecture".', time: '1d ago', read: true, type: 'edit' },
];

export const Header = () => {
    const { walletAddress, handleConnect } = useWallet();
    const { user } = useAuth();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const notifRef = useRef<HTMLDivElement>(null);

    // Helper to truncate address
    const shortAddress = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';

    const displayName = user?.name || user?.email || "Guest";
    const initials = displayName.substring(0, 2).toUpperCase();
    const avatarUrl = user?.avatar;

    // Mock Balances (Until we have real balance in SessionUser)
    const balanceU = user?.balance_u || 0;
    const balanceG = user?.balance_g || 0;

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotifIcon = (type: string) => {
        switch (type) {
            case 'reward': return { icon: 'savings', color: 'text-green-500 bg-green-500/10' };
            case 'gov': return { icon: 'how_to_vote', color: 'text-purple-500 bg-purple-500/10' };
            case 'edit': return { icon: 'edit_document', color: 'text-blue-500 bg-blue-500/10' };
            default: return { icon: 'person', color: 'text-gray-500 bg-gray-500/10' };
        }
    };

    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-[#0B0E14]/90 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">

            {/* LEFT: Mobile Logo & Brand */}
            <div className="lg:hidden flex items-center gap-3">
                <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">KS</div>
                </Link>
            </div>

            {/* CENTER: Search Bar */}
            <div className="flex-1 max-w-xl mx-auto hidden md:block px-4">
                <div className={`relative group transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
                    <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`}>
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search topics, users, or proposals..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="w-full bg-gray-100 dark:bg-[#161b22] border border-transparent focus:border-primary/50 dark:focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none transition-all shadow-inner dark:shadow-none"
                    />
                    {/* Keyboard Shortcut Hint */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex gap-1">
                        <kbd className="hidden lg:inline-block bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-500 dark:text-gray-400">⌘K</kbd>
                    </div>
                </div>
            </div>

            {/* RIGHT: Actions & Profile */}
            <div className="flex items-center gap-3 md:gap-4">

                {/* Network Indicator (Desktop only) */}
                <div className="hidden xl:flex items-center gap-2 bg-green-500/5 border border-green-500/10 rounded-full px-3 py-1">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Solana Mainnet</span>
                </div>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-full transition-colors ${showNotifications
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0B0E14]"></span>
                    </button>

                    {/* Dropdown Menu */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up origin-top-right z-50">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                                <button className="text-[10px] font-bold text-primary hover:underline">Mark all read</button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {MOCK_NOTIFICATIONS.map(notif => {
                                    const style = getNotifIcon(notif.type);
                                    return (
                                        <div key={notif.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-gray-800/50 flex gap-3 ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.color}`}>
                                                <span className="material-symbols-outlined text-sm">{style.icon}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white">{notif.title}</span>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{notif.content}</p>
                                            </div>
                                            {!notif.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-2 text-center bg-gray-50 dark:bg-[#0B0E14]">
                                <button className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">View All History</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

                {/* 1. SEPARATED WALLET CONNECT BUTTON - PURPLE with SHADOW */}
                <button
                    onClick={handleConnect}
                    className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border ${walletAddress
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                        : 'bg-primary text-white hover:opacity-90 border-transparent shadow-lg shadow-primary/20'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">
                        {walletAddress ? 'account_balance_wallet' : 'wallet'}
                    </span>
                    {walletAddress ? shortAddress : 'Connect Wallet'}
                </button>

                {/* 2. SEPARATED PROFILE DISPLAY (Always Visible) */}
                <Link
                    href="/app/profile"
                    className="group relative overflow-hidden rounded-xl bg-gray-50/50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 pl-1 pr-4 py-1 transition-all duration-300 flex items-center gap-3"
                >
                    {/* User Initials Avatar (Circular) */}
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover shadow-inner ring-2 ring-white/20 dark:ring-white/10"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-inner ring-2 ring-white/20 dark:ring-white/10">
                            {initials}
                        </div>
                    )}

                    {/* Info Stack */}
                    <div className="flex flex-col items-start">
                        {/* Token Balances Row */}
                        <div className="flex items-center gap-2 text-[10px] font-mono leading-none mb-0.5">
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                                {balanceU.toLocaleString()} U
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                                {balanceG.toFixed(0)} G
                            </span>
                        </div>

                        {/* Name */}
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-bold">
                            {displayName}
                        </div>
                    </div>
                </Link>

            </div>
        </header>
    );
};
