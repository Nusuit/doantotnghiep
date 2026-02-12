"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useQuickNote } from "@/context/QuickNoteContext";

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { isQuickNoteVisible, toggleQuickNote } = useQuickNote();
    const [showMenu, setShowMenu] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        'governance': true
    });

    const menuRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => pathname?.startsWith(path);
    const isParentActive = (children: any[]) => children.some(child => pathname?.startsWith(child.path));

    const toggleSubMenu = (key: string) => {
        setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

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
        { name: "Bookmarks", icon: "bookmarks", path: "/app/bookmarks" },
        {
            name: "Governance",
            icon: "admin_panel_settings",
            id: "governance",
            children: [
                { name: "DAO Voting", icon: "how_to_vote", path: "/app/governance" },
                { name: "Leaderboard", icon: "leaderboard", path: "/app/leaderboard" },
            ]
        },
        { name: "Profile", icon: "account_circle", path: "/app/profile" },
    ];

    // Check if we are in settings section
    const isSettingsPage = pathname?.startsWith('/app/settings');

    const settingsNavItems = [
        { name: "General", icon: "settings", path: "/app/settings/general" },
        { name: "Appearance", icon: "palette", path: "/app/settings/appearance" },
        { name: "Notifications", icon: "notifications", path: "/app/settings/notifications" },
        { name: "Privacy & Security", icon: "lock", path: "/app/settings/privacy" },
    ];

    if (!user) return null; // Require authentication

    const currentNavItems = isSettingsPage ? settingsNavItems : navItems;

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
                {isSettingsPage && (
                    <div className="mb-4 px-2">
                        <Link
                            href="/app/feed"
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to App
                        </Link>
                    </div>
                )}

                {currentNavItems.map((item: any) => {
                    if (item.children) {
                        const isOpen = expandedMenus[item.id];
                        const active = isParentActive(item.children);

                        return (
                            <div key={item.name} className="space-y-1 mb-1">
                                <button
                                    onClick={() => toggleSubMenu(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${active
                                        ? "text-black dark:text-white font-bold bg-gray-50 dark:bg-white/5"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-black dark:hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined ${active ? 'text-black dark:text-white' : ''}`}>{item.icon}</span>
                                        {item.name}
                                    </div>
                                    <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {item.children.map((child: any) => (
                                        <Link
                                            key={child.name}
                                            href={child.path}
                                            className={`flex items-center gap-3 px-4 py-3 ml-4 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${isActive(child.path)
                                                ? "bg-gray-100 dark:bg-white text-black dark:text-black font-bold"
                                                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{child.icon}</span>
                                            {child.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
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
                    );
                })}
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
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-fade-in-up origin-bottom z-50">
                            <div className="p-2 space-y-1">
                                {/* Theme Toggle with Animated Switch */}
                                <div
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                    </span>
                                    
                                    {/* Animated Switch with Decorations */}
                                    <div className={`relative w-12 h-6 rounded-full transition-colors duration-500 ease-in-out flex items-center ${theme === 'dark' ? 'bg-[#1A1D24] border border-gray-600' : 'bg-cyan-200 border border-cyan-300'}`}>
                                        {/* Decor: Clouds (Light Mode) */}
                                        {theme !== 'dark' && (
                                            <>
                                                <div className="absolute right-3 top-1.5 w-2 h-1 bg-white rounded-full opacity-80"></div>
                                                <div className="absolute right-1.5 bottom-1.5 w-3 h-1.5 bg-white rounded-full opacity-60"></div>
                                            </>
                                        )}
                                        {/* Decor: Stars (Dark Mode) */}
                                        {theme === 'dark' && (
                                            <>
                                                <div className="absolute left-2 top-1.5 w-0.5 h-0.5 bg-white rounded-full opacity-80"></div>
                                                <div className="absolute left-3.5 bottom-2 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
                                                <div className="absolute left-1.5 bottom-1.5 w-0.5 h-0.5 bg-white rounded-full opacity-40"></div>
                                            </>
                                        )}

                                        {/* The Knob (Sun/Moon) */}
                                        <div className={`absolute w-5 h-5 rounded-full shadow-sm transform transition-transform duration-500 flex items-center justify-center ${
                                            theme === 'dark' 
                                            ? 'translate-x-[26px] bg-slate-200' 
                                            : 'translate-x-[2px] bg-yellow-400'
                                        }`}>
                                            {/* Optional: Moon crater decoration */}
                                            {theme === 'dark' && <div className="w-1 h-1 bg-slate-400 rounded-full mr-1 mb-1 opacity-50"></div>}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={toggleQuickNote}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white flex items-center gap-2">Quick Note</span>
                                    <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 flex items-center ${isQuickNoteVisible ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                        <div className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isQuickNoteVisible ? 'translate-x-[22px]' : 'translate-x-[4px]'}`}></div>
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800 my-1" />

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
