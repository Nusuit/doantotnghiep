"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => pathname?.startsWith(path);

    // Use name/avatar from AuthContext (flattened)
    const displayName = user?.name || user?.email || "Guest";
    const handle = user?.email ? `@${user.email.split('@')[0]}` : "@guest";
    const initials = displayName.substring(0, 2).toUpperCase();
    const avatarUrl = user?.avatar;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
    };

    const navItems = [
        { name: "Feed", icon: "home", path: "/app/feed" },
        { name: "Discover", icon: "explore", path: "/app/discover" },
        { name: "Map", icon: "map", path: "/app/map" },
        { name: "Wallet", icon: "account_balance_wallet", path: "/app/wallet" },
        { name: "DAO Governance", icon: "how_to_vote", path: "/app/governance" },
        { name: "Leaderboard", icon: "leaderboard", path: "/app/leaderboard" },
        { name: "Profile", icon: "account_circle", path: "/app/profile" },
    ];

    if (!user) return null; // Or skeleton

    return (
        <aside className="w-64 hidden lg:flex flex-col h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-xl transition-all z-30">
            <div className="p-6">
                <Link
                    href="/"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold font-serif">
                        KS
                    </div>
                    <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                        KnowledgeShare
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive(item.path)
                            ? "bg-gray-100 dark:bg-white text-black dark:text-black font-bold"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-black dark:hover:text-white"
                            }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 space-y-4">
                <Link
                    href="/app/create"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                    <span className="material-symbols-outlined">edit_square</span>
                    Create Post
                </Link>

                {/* User Profile Section with Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-all border border-transparent hover:border-gray-200 dark:hover:border-dark-border group"
                    >
                        {/* Monochromatic Initials or Avatar */}
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white text-xs font-bold ring-1 ring-gray-200 dark:ring-gray-700">
                                {initials}
                            </div>
                        )}

                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{handle}</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                            more_vert
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-dark-border rounded-xl shadow-xl overflow-hidden animate-fade-in-up origin-bottom z-50">
                            <div className="p-2 space-y-1">
                                <Link
                                    href="/app/settings"
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        settings
                                    </span>
                                    Settings
                                </Link>
                                <hr className="border-gray-100 dark:border-gray-800 my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        logout
                                    </span>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
