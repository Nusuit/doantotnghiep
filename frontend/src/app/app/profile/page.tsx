
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENT_USER } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { WalletAnalyticsModal } from '@/components/profile/WalletAnalyticsModal';
import { GovernanceAnalyticsModal } from '@/components/profile/GovernanceAnalyticsModal';

const PROFILE_EXTRAS = {
    bio: "Researching the intersection of Zero-Knowledge Proofs and Epistemology. Building the verification layer for the permaweb.",
    expertise: ['Technology', 'AI Research', 'Ontology'],
    socials: [
        { label: 'GitHub', url: '#', icon: 'code' },
        { label: 'Twitter', url: '#', icon: 'alternate_email' },
        { label: 'Arweave', url: '#', icon: 'data_object' }
    ]
};

// --- MOCK DATA FOR SUGGESTED PEERS ---
const SUGGESTED_PEERS = [
    { id: 'p1', name: 'Dr. Sarah Chen', handle: '@schen', ks: 1250, expertise: ['Bio', 'Ethics'] },
    { id: 'p2', name: 'Marcus Graph', handle: '@marcus', ks: 980, expertise: ['Data', 'Web3'] },
    { id: 'p3', name: 'Alex Rivera', handle: '@arivera', ks: 890, expertise: ['Art', 'NFT'] },
    { id: 'p4', name: 'Sophia Wise', handle: '@sophia', ks: 920, expertise: ['Phil', 'DAO'] },
];

const WALLET_STATS = {
    totalEarned: 15420,
    totalSpent: 4200,
    giftsReceived: [
        { id: 'coffee', name: 'Coffee', icon: '☕', count: 24, value: 1200 },
        { id: 'clap', name: 'Applause', icon: '👏', count: 150, value: 1500 },
        { id: 'gem', name: 'Gem', icon: '💎', count: 5, value: 2500 },
        { id: 'trophy', name: 'Trophy', icon: '🏆', count: 1, value: 5000 },
    ],
    history: [
        { id: 1, type: 'income', category: 'gift', label: 'Gift: Gem from @alice', amount: 500, date: '2h ago', icon: 'diamond' },
        { id: 2, type: 'income', category: 'content', label: 'Unlock: "ZK Rollups Deep Dive"', amount: 250, date: '5h ago', icon: 'lock_open' },
        { id: 3, type: 'expense', category: 'stake', label: 'Stake: Suggestion on Post #42', amount: -100, date: '1d ago', icon: 'gavel' },
        { id: 4, type: 'income', category: 'reward', label: 'Weekly Contribution Reward', amount: 1200, date: '2d ago', icon: 'savings' },
        { id: 5, type: 'expense', category: 'unlock', label: 'Unlocked: "Alpha Leaks"', amount: -50, date: '3d ago', icon: 'key' },
    ]
};

const GOV_STATS = {
    totalBalance: 4500,
    usdValue: 3150,
    votingPowerPercent: 0.042,
    radar: {
        selfStaked: 85,
        delegated: 45,
        consistency: 92
    },
    yieldHistory: [
        { month: 'JUN', amount: 45 },
        { month: 'JUL', amount: 62 },
        { month: 'AUG', amount: 58 },
        { month: 'SEP', amount: 84 },
        { month: 'OCT', amount: 95 },
        { month: 'NOV', amount: 112 },
    ],
    recentVotes: []
};

// Tooltip Component for Profile Stats
const ProfileTooltip = ({ text }: { text: string }) => (
    <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 text-right">
        <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed font-sans">{text}</p>
        <div className="absolute top-full right-2 -mt-[1px] border-4 border-transparent border-t-white dark:border-t-[#1A1D24]"></div>
    </div>
);

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth(); // Get authenticated user
    const {
        activeTab, setActiveTab,
        contributionFilter, setContributionFilter,
        openMenuRowId, toggleMenu,
        upgradeModal, handleUpgradeClick, closeUpgradeModal, confirmUpgrade,
        filteredHistory, reservations
    } = useProfile();

    // Use Auth User if available, otherwise fallback to MOCK
    const profileUser = user ? {
        ...CURRENT_USER, // Keep mock stats (followers, balance, etc) that might be missing in session
        name: user.name || CURRENT_USER.name,
        handle: user.email ? `@${user.email.split('@')[0]}` : CURRENT_USER.handle,
        avatar: user.avatar || CURRENT_USER.avatar
    } : CURRENT_USER;

    const [showWalletAnalytics, setShowWalletAnalytics] = useState(false);
    const [showGovAnalytics, setShowGovAnalytics] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    // Correctly typed navigation or specialized function if needed, for now using direct push
    const handleWriteReservation = (reservation: any) => {
        // In Next.js, passing state via router.push is different. 
        // For MVP, we'll just navigate to create page.
        // If we need to pass data, we might use query params or a global store.
        router.push('/app/create');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">

            {/* 1. HERO IDENTITY SECTION (Full Width) */}
            <div className="relative rounded-3xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_20px_-5px_rgba(79,70,229,0.1)] overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-cyan-500/20 blur-3xl -z-10 rounded-full pointer-events-none"></div>

                <div className="p-8 flex flex-col items-start gap-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 w-full items-start">
                        {/* Identity Block */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-xl overflow-hidden">
                                {profileUser.avatar ? (
                                    <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-serif font-bold text-white tracking-wider">{getInitials(profileUser.name)}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-blue-400/50 font-mono shadow-lg">Scholar</div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                                        {profileUser.name}
                                    </h1>

                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-black/40 rounded font-mono text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 flex items-center gap-2">
                                            {profileUser.handle}
                                            <span className="material-symbols-outlined text-[10px] cursor-pointer hover:text-gray-900 dark:hover:text-white">content_copy</span>
                                        </span>
                                        <span className="text-gray-500 text-xs">Member since 2023</span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm mb-3">
                                        <div className="flex items-center gap-1 group cursor-pointer">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{formatNumber(profileUser.followers)}</span>
                                            <span className="text-gray-500">Followers</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                        <div className="flex items-center gap-1 group cursor-pointer">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{formatNumber(profileUser.following)}</span>
                                            <span className="text-gray-500">Following</span>
                                        </div>
                                    </div>
                                </div>

                                {/* INTEGRATED REPUTATION SCORE */}
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-3 pr-6 backdrop-blur-sm">
                                    <div className="relative w-12 h-12">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-gray-200 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path className="text-primary drop-shadow-[0_0_5px_rgba(79,70,229,0.8)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="85, 100" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg text-yellow-500 dark:text-yellow-400">verified</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none">850</span>
                                        <span className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Knowledge Score</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200 dark:bg-white/5 w-full my-4"></div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                                        {PROFILE_EXTRAS.bio}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {PROFILE_EXTRAS.expertise.map(tag => (
                                            <span key={tag} className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 justify-end items-start md:items-end min-w-[140px]">
                                    <div className="flex gap-2">
                                        {PROFILE_EXTRAS.socials.map(social => (
                                            <a key={social.label} href={social.url} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all" title={social.label}>
                                                <span className="material-symbols-outlined text-sm">{social.icon}</span>
                                            </a>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => router.push('/app/wallet')}
                                            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">account_balance_wallet</span> My Wallet
                                        </button>
                                        <button
                                            onClick={() => router.push('/app/settings')}
                                            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span> Edit Profile
                                        </button>

                                        {/* THE TRIGGER: Suggested Peers Chevron */}
                                        <button
                                            onClick={() => setShowSuggestions(!showSuggestions)}
                                            className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${showSuggestions
                                                ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border-gray-300 dark:border-white/20'
                                                : 'bg-white dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white'
                                                }`}
                                            title="Find Peers"
                                        >
                                            <span className={`material-symbols-outlined text-xl transition-transform duration-300 ${showSuggestions ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THE EXPANDED TRAY: Suggested Peers */}
                <div
                    className={`bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/5 transition-all duration-500 ease-in-out overflow-hidden ${showSuggestions ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connect with Peers</h3>
                            <button
                                onClick={() => router.push('/app/leaderboard')}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                                See All <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                        </div>

                        {/* Horizontal Scroll Container */}
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {SUGGESTED_PEERS.map(peer => (
                                <div key={peer.id} className="min-w-[170px] bg-white dark:bg-[#161920] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-3 shadow-inner group cursor-pointer" onClick={() => router.push('/app/u/elena')}>
                                        <span className="text-sm font-serif font-bold text-gray-700 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">{getInitials(peer.name)}</span>
                                    </div>
                                    <div className="mb-1">
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[140px] cursor-pointer hover:text-primary" onClick={() => router.push('/app/u/elena')}>{peer.name}</h4>
                                        <span className="text-[9px] text-gray-500 font-mono block">{peer.handle}</span>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                                        {peer.expertise.map(tag => (
                                            <span key={tag} className="text-[8px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-auto w-full space-y-3">
                                        <div className="text-[10px] font-mono text-yellow-600 dark:text-yellow-500 font-bold flex items-center justify-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">star</span> {peer.ks} KS
                                        </div>
                                        <button className="w-full py-1.5 rounded-lg border border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2-COLUMN LAYOUT: Sidebar + Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                
                {/* LEFT SIDEBAR */}
                <div className="lg:col-span-1 space-y-4">
                    
                    {/* Card 1: Utility */}
                    <div 
                        onClick={() => setShowWalletAnalytics(true)}
                        className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-500/30 cursor-pointer transition-all shadow-sm group"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-2xl">bolt</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Utility</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{profileUser.balance_u || 1240}</span>
                                <span className="text-xs text-gray-400">U</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">+12%</span>
                        </div>
                    </div>

                    {/* Card 2: Governance */}
                    <div 
                        onClick={() => setShowGovAnalytics(true)}
                        className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-purple-500/30 cursor-pointer transition-all shadow-sm group"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-2xl">token</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Governance</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{profileUser.balance_g || 1500}</span>
                                <span className="text-xs text-gray-400">G</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded">5.7k VP</span>
                        </div>
                    </div>

                    {/* Card 3: Reputation */}
                    <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-sm group">
                        <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 group-hover:rotate-12 transition-transform">
                            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reputation</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">850</span>
                                <span className="text-xs text-gray-400">KS</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded">Scholar</span>
                        </div>
                    </div>

                </div>

                {/* RIGHT MAIN CONTENT */}
                <div className="lg:col-span-3">
                    
                    {/* CONTENT HISTORY */}
                    <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-visible min-h-[400px]">
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            {['contributions', 'suggestions', 'votes', 'proposals', 'reservations'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${activeTab === tab
                                        ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white bg-gray-100 dark:bg-white/5'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    {tab === 'reservations' ? 'MY RESERVATIONS' : tab}
                                </button>
                            ))}
                        </div>
                        <div>
                            <div className="overflow-visible min-h-[200px]">{/* Filter Tabs for Contributions */}
                        {activeTab === 'contributions' && (
                            <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800/50">
                                {[
                                    { id: 'all', label: 'All', icon: 'layers' },
                                    { id: 'premium', label: 'Premium', icon: 'diamond', color: 'text-purple-500 dark:text-purple-400' },
                                    { id: 'public', label: 'Public', icon: 'public', color: 'text-blue-500 dark:text-blue-400' },
                                    { id: 'private', label: 'Private', icon: 'lock', color: 'text-gray-400' }
                                ].map((filter) => (
                                    <button
                                        key={filter.id}
                                        onClick={() => setContributionFilter(filter.id as any)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${contributionFilter === filter.id
                                            ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-white/20'
                                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[16px] ${(filter as any).color || ''}`}>{filter.icon}</span>
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === 'reservations' ? (
                            <table className="w-full">
                                <thead className="text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Entity</th>
                                        <th className="px-6 py-4 text-center">Time Remaining</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                    {reservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-serif font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{res.entity}</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 w-fit px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{res.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-500 text-base border border-cyan-200 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 rounded-md">
                                                    {res.timeLeft}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        className="text-xs font-bold text-gray-500 hover:text-red-500 px-3 py-2 rounded transition-colors uppercase tracking-wider"
                                                    >
                                                        Release
                                                    </button>
                                                    <button
                                                        onClick={() => handleWriteReservation(res)}
                                                        className="bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider px-6 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-lg"
                                                    >
                                                        Write Now
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full">
                                <thead className="text-xs uppercase text-gray-500 font-bold border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-16">ID</th>
                                        <th className="px-4 py-3 text-left">Description</th>
                                        <th className="px-4 py-3 text-center w-32">Date</th>
                                        <th className="px-4 py-3 text-center w-28">Status</th>
                                        <th className="px-4 py-3 text-right w-40">Earnings/Reward</th>
                                        <th className="px-4 py-3 text-right w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                    {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-4 font-mono text-gray-400 dark:text-gray-500 text-xs">#{item.id}</td>
                                            <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    {/* Status Icon */}
                                                    {item.type === 'contribution' && (
                                                        <div title={item.content_type === 'premium' ? 'Premium Content' : item.visibility === 'private' ? 'Private Draft' : 'Public Content'}>
                                                            {item.content_type === 'premium' ? (
                                                                <span className="material-symbols-outlined text-purple-500 dark:text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">diamond</span>
                                                            ) : item.visibility === 'private' ? (
                                                                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">lock</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">public</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {item.type === 'proposal' && (
                                                        <div>
                                                            <span className="material-symbols-outlined text-cyan-500 dark:text-cyan-400">campaign</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span>{item.title}</span>
                                                        {item.content_type === 'premium' && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Premium Exclusive</span>
                                                                <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700" title="Visible Public Hint">
                                                                    <span className="material-symbols-outlined text--[10px]">visibility</span> Hint Visible
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">{item.date}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Approved' || item.status === 'Active' || item.status === 'Passed' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                                    item.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                                                        item.status === 'Draft' ? 'bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400' :
                                                            item.status.includes('Voted') ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                                                'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono">
                                                {item.content_type === 'premium' ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-green-600 dark:text-green-400 font-bold">{item.reward}</span>
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.unlocks} unlocks</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-green-600 dark:text-green-400">{item.reward}</span>
                                                )}
                                            </td>
                                            <td className="px-2 py-4 text-right relative">
                                                <button
                                                    onClick={(e) => toggleMenu(e, item.id)}
                                                    className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">more_vert</span>
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openMenuRowId === item.id && (
                                                    <div className="absolute right-8 top-8 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                                                        {item.type === 'contribution' && (
                                                            <>
                                                                {item.visibility === 'private' ? (
                                                                    /* Private / Draft Logic */
                                                                    <>
                                                                        <button className="w-full text-left px-4 py-3 text-xs font-bold text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2 transition-colors">
                                                                            <span className="material-symbols-outlined text-sm">public</span> Publish (Make Public)
                                                                        </button>
                                                                        <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                            <span className="material-symbols-outlined text-sm">edit_square</span> Edit Post
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    /* Public Logic */
                                                                    <>
                                                                        {item.content_type === 'standard' ? (
                                                                            <>
                                                                                {/* Standard Public */}
                                                                                <button
                                                                                    onClick={() => handleUpgradeClick(item.id)}
                                                                                    className="w-full text-left px-4 py-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2 transition-colors"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-sm">diamond</span> Upgrade to Premium
                                                                                </button>
                                                                                <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                                    <span className="material-symbols-outlined text-sm">visibility_off</span> Make Private
                                                                                </button>
                                                                                <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                                    <span className="material-symbols-outlined text-sm">edit_square</span> Edit Post
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {/* Premium Public */}
                                                                                <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                                    <span className="material-symbols-outlined text-sm">edit_note</span> Edit Public Hint
                                                                                </button>
                                                                                <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                                    <span className="material-symbols-outlined text-sm">price_change</span> Change Price
                                                                                </button>
                                                                                <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                                    <span className="material-symbols-outlined text-sm">public</span> Switch to Standard
                                                                                </button>
                                                                                <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                                    <span className="material-symbols-outlined text-sm">visibility_off</span> Make Private
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                        {item.type === 'proposal' && (
                                                            <>
                                                                <button onClick={() => router.push('/app/governance')} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                    <span className="material-symbols-outlined text-sm">open_in_new</span> View Details
                                                                </button>
                                                                <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                                                                    <span className="material-symbols-outlined text-sm">share</span> Share Proposal
                                                                </button>
                                                            </>
                                                        )}
                                                        <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                                                        <button className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                                                            <span className="material-symbols-outlined text-sm">delete</span> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-500">
                                                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">filter_list_off</span>
                                                <p>No activity found for this filter.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
                    
                </div>

            </div>

            {/* MODALS using Imported Components */}
            <WalletAnalyticsModal
                isOpen={showWalletAnalytics}
                onClose={() => setShowWalletAnalytics(false)}
                stats={WALLET_STATS}
            />

            <GovernanceAnalyticsModal
                isOpen={showGovAnalytics}
                onClose={() => setShowGovAnalytics(false)}
                stats={GOV_STATS}
            />

            {/* Upgrade Modal (Kept minimal) */}
            {upgradeModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">diamond</span>
                                Upgrade to Premium
                            </h3>
                            <button onClick={closeUpgradeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Premium posts are locked by default. You must provide a "Public Hint" (teaser) to attract readers to unlock it.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Unlock Price (KNOW-U)</label>
                                <input type="number" className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. 50" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Public Hint (Teaser)</label>
                                <textarea className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all" placeholder="Write a compelling summary visible to everyone..."></textarea>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button onClick={closeUpgradeModal} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
                                <button onClick={confirmUpgrade} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105">Confirm Upgrade</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
