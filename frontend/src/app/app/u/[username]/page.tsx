
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { GovernanceAnalyticsModal } from '@/components/profile/GovernanceAnalyticsModal';
import { SuggestionContextModal, SuggestionContextData } from '@/components/profile/SuggestionContextModal';
import { PostCard } from '@/components/shared/PostCard';

// --- MOCK DATA FOR VISITOR VIEW (Dr. Elena Rust) ---
const VISITOR_PROFILE = {
    id: 'u-elena',
    name: 'Dr. Elena Rust',
    handle: '@elena_zkp',
    role: 'Scholar',
    bio: "Pioneering the application of Zero-Knowledge Proofs for decentralized epistemology. Building verification layers for the permaweb.",
    followers: 1240,
    following: 405,
    ks: 850,
    joined: 'Jan 2023',
    socials: [
        { label: 'Twitter', url: '#', icon: 'alternate_email' },
        { label: 'GitHub', url: '#', icon: 'code' },
        { label: 'Website', url: '#', icon: 'link' }
    ],
    badges: [
        { id: 'b1', name: 'Top Contributor', icon: 'military_tech', color: 'orange' },
        { id: 'b2', name: 'Governance Active', icon: 'how_to_vote', color: 'purple' },
        { id: 'b3', name: 'Early Adopter', icon: 'rocket_launch', color: 'blue' }
    ]
};

const VISITOR_STATS = {
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

// Mock Posts for Visitor View
const VISITOR_POSTS = [
    {
        id: 'p-101',
        author: {
            name: VISITOR_PROFILE.name,
            handle: VISITOR_PROFILE.handle,
            avatar: 'ER',
            time: '2h ago'
        },
        content: "Just published a deep dive into Recursive sNARKs and their implication for trustless verification layers. This is the future of scaling! 🧵",
        stats: { likes: 124, comments: 18, shares: 12, tips: 1450 },
        tags: ['zkp', 'scaling', 'research'],
        field: 'Blockchain',
        hasContext: true
    },
    {
        id: 'p-102',
        author: {
            name: VISITOR_PROFILE.name,
            handle: VISITOR_PROFILE.handle,
            avatar: 'ER',
            time: '5h ago'
        },
        content: "The trade-off between prover time and verifier time is getting smaller every day. Halo2 is a game changer.",
        stats: { likes: 89, comments: 12, shares: 5, tips: 560 },
        tags: ['cryptography', 'tech'],
        field: 'AI',
        hasContext: false
    },
    {
        id: 'p-103',
        author: {
            name: VISITOR_PROFILE.name,
            handle: VISITOR_PROFILE.handle,
            avatar: 'ER',
            time: '1d ago'
        },
        content: "Proposal KIP-14 needs more eyes. While increasing creator rewards is good, we need to ensure the treasury remains sustainable for at least 5 years. I've posted my analysis in the governance forum.",
        stats: { likes: 256, comments: 45, shares: 32, tips: 2100 },
        tags: ['governance', 'dao'],
        field: 'Governance',
        hasContext: true
    }
];

// Mock Suggestion Data
const MOCK_SUGGESTION_DATA: SuggestionContextData = {
    id: 's-404',
    title: 'Correction on Prover Efficiency',
    originalContent: "The trade-off between prover time and verifier time is getting smaller every day. Halo2 is a game changer.",
    proposedContent: "The trade-off between prover time and verifier time is getting smaller every day. Halo2 is a game changer, specifically due to its use of PLONKish arithmetization which removes the need for trusted setups.",
    author: '@vitalik_fan',
    reason: "Added context about why Halo2 is significant (trusted setup removal).",
    timestamp: '10m ago',
    kvReward: 15
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default function VisitorProfilePage({ params }: { params: { username: string } }) {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media'>('posts');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showGovAnalytics, setShowGovAnalytics] = useState(false);

    const [suggestionModal, setSuggestionModal] = useState<{ isOpen: boolean, data: SuggestionContextData | null }>({
        isOpen: false,
        data: null
    });

    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
    };

    const handleOpenContext = (postId: string) => {
        setSuggestionModal({ isOpen: true, data: MOCK_SUGGESTION_DATA });
    };

    const handleApproveSuggestion = () => {
        alert('Suggestion Approved! Reward minted.');
        setSuggestionModal({ isOpen: false, data: null });
    };

    const handleRejectSuggestion = () => {
        alert('Suggestion Rejected.');
        setSuggestionModal({ isOpen: false, data: null });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in text-gray-900 dark:text-white">

            {/* 1. VISITOR HERO HEADER */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-xl dark:shadow-[0_0_20px_-5px_rgba(79,70,229,0.1)]">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/10 to-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Avatar Column */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-black border-4 border-white dark:border-[#0B0E14] shadow-2xl flex items-center justify-center text-3xl font-serif font-bold text-gray-700 dark:text-white relative">
                            {getInitials(VISITOR_PROFILE.name)}
                            <div className="absolute bottom-1 right-1 w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center border-4 border-white dark:border-[#0B0E14]" title="Scholar Tier">
                                <span className="material-symbols-outlined text-white dark:text-black text-sm">school</span>
                            </div>
                        </div>

                        {/* Reputation Score */}
                        <div
                            onClick={() => setShowGovAnalytics(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full cursor-pointer hover:bg-yellow-400/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-lg">verified</span>
                            <span className="font-mono font-bold text-yellow-700 dark:text-yellow-400 text-sm">{VISITOR_PROFILE.ks} KS</span>
                        </div>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 min-w-0 pt-2">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-1">{VISITOR_PROFILE.name}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <span className="font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-200 dark:border-white/5">{VISITOR_PROFILE.handle}</span>
                                    <span>•</span>
                                    <span>Joined {VISITOR_PROFILE.joined}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:scale-105 ${isFollowing
                                            ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 border border-gray-200 dark:border-white/5'
                                            : 'bg-primary text-primary-foreground shadow-primary/20'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-2xl">
                            {VISITOR_PROFILE.bio}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 mb-6">
                            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                                <span className="font-black text-lg text-gray-900 dark:text-white">{VISITOR_PROFILE.followers.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 font-medium">Followers</span>
                            </div>
                            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
                                <span className="font-black text-lg text-gray-900 dark:text-white">{VISITOR_PROFILE.following.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 font-medium">Following</span>
                            </div>
                            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                            <div className="flex items-center gap-2">
                                {VISITOR_PROFILE.socials.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.url}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 text-gray-400 transition-colors"
                                        title={social.label}
                                    >
                                        <span className="material-symbols-outlined text-sm">{social.icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Badges Row */}
                        <div className="flex items-center gap-3">
                            {VISITOR_PROFILE.badges.map(badge => (
                                <div key={badge.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#151922] border border-gray-200 dark:border-gray-800" title={badge.name}>
                                    <span className={`material-symbols-outlined text-sm text-${badge.color}-500`}>{badge.icon}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CONTENT FEED SECTION */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT: Feed */}
                <div className="flex-1 space-y-4">

                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-800 px-4">
                        {['posts', 'replies', 'media'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`py-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Posts List */}
                    <div className="space-y-4">
                        {VISITOR_POSTS.map(post => {
                            // Convert mock post to align with PostCard props
                            const cardProps = {
                                id: post.id,
                                author: {
                                    name: post.author.name,
                                    handle: post.author.handle,
                                    avatar: post.author.avatar,
                                },
                                content: post.content,
                                timestamp: post.author.time,
                                field: post.field || 'General',
                                likes: post.stats.likes,
                                comments: post.stats.comments,
                                shares: post.stats.shares,
                                // location: undefined 
                            };

                            return (
                                <PostCard key={post.id} post={cardProps} />
                            );
                        })}
                    </div>

                </div>

                {/* RIGHT: Sidebar (Suggestions / Connections) */}
                <div className="hidden lg:block w-80 space-y-6">

                    {/* Common Connections */}
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Mutual Connections</h3>
                        <div className="flex -space-x-2 overflow-hidden mb-3 pl-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#0B0E14] bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                                    P{i}
                                </div>
                            ))}
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#0B0E14] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                +12
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">You both follow <span className="font-bold text-gray-900 dark:text-white">Vitalik Buterin</span> and 14 others.</p>
                    </div>

                    {/* Trending in their network */}
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Popular in Network</h3>
                        <ul className="space-y-3">
                            {['#ZKSync', '#Layer3', '#DataAvailability'].map(topic => (
                                <li key={topic} className="flex justify-between items-center group cursor-pointer">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors">{topic}</span>
                                    <span className="text-xs text-gray-500">2.4k posts</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>

            {/* MODALS */}
            <GovernanceAnalyticsModal
                isOpen={showGovAnalytics}
                onClose={() => setShowGovAnalytics(false)}
                stats={VISITOR_STATS}
            />

            <SuggestionContextModal
                isOpen={suggestionModal.isOpen}
                onClose={() => setSuggestionModal({ isOpen: false, data: null })}
                data={suggestionModal.data}
                onApprove={handleApproveSuggestion}
                onReject={handleRejectSuggestion}
            />

        </div>
    );
};
