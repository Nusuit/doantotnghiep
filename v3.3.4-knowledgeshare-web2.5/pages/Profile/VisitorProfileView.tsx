
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import { GovernanceAnalyticsModal } from '../../components/profile/GovernanceAnalyticsModal';
import { SuggestionContextModal, SuggestionContextData } from '../../components/profile/SuggestionContextModal';
import { PostCard } from '../../components/shared/PostCard';
import { Post, User } from '../../types';

// --- MOCK DATA FOR VISITOR VIEW (Dr. Elena Rust) ---
const VISITOR_PROFILE = {
    name: "Dr. Elena Rust",
    handle: "@elena_zk",
    initials: "ER",
    level: 42,
    bio: "Building zero-knowledge verification layers for the Permaweb. Core contributor to @Arweave & @Solana protocols.",
    expertise: ['Cryptography', 'Rust', 'Protocol Design'],
    followers: 12500,
    following: 420,
    isFollowing: false,
    stats: {
        knowledgeScore: 1550, // Expert
        totalKV: 15420,
        articlesPublished: 89,
        suggestionsApproved: 124,
        networkShare: 0.08, // %
    },
    socials: [
        { label: 'GitHub', url: '#', icon: 'code' },
        { label: 'Twitter', url: '#', icon: 'alternate_email' },
        { label: 'Arweave', url: '#', icon: 'data_object' }
    ],
    trophies: ['🏆', '💎', '🥇', '✒️', '💡'] // Social Proof Icons
};

// --- MOCK DATA FOR SUGGESTED PEERS ---
const SUGGESTED_PEERS = [
    { id: 'p1', name: 'Dr. Sarah Chen', handle: '@schen', ks: 1250, expertise: ['Bio', 'Ethics'] },
    { id: 'p2', name: 'Marcus Graph', handle: '@marcus', ks: 980, expertise: ['Data', 'Web3'] },
    { id: 'p3', name: 'Alex Rivera', handle: '@arivera', ks: 890, expertise: ['Art', 'NFT'] },
    { id: 'p4', name: 'Sophia Wise', handle: '@sophia', ks: 920, expertise: ['Phil', 'DAO'] },
];

// --- MOCK GOVERNANCE STATS ---
const GOV_STATS = {
    totalBalance: 12500,
    usdValue: 8750,
    votingPowerPercent: 0.08,
    radar: { selfStaked: 92, delegated: 88, consistency: 95 },
    yieldHistory: [
        { month: 'JUN', amount: 120 }, { month: 'JUL', amount: 145 },
        { month: 'AUG', amount: 132 }, { month: 'SEP', amount: 160 },
        { month: 'OCT', amount: 185 }, { month: 'NOV', amount: 210 },
    ],
    recentVotes: []
};

// --- HELPER: GENERATE MOCK CONTEXT FOR MODAL ---
const getMockSuggestionContext = (itemId: string, title: string): SuggestionContextData => {
    // Boilerplate content generator
    const baseContent = "The rapid evolution of zero-knowledge proofs has led to a fragmentation of prover standards. In this article, we explore how a unified aggregation layer on Arweave could solve the data availability problem for Layer 3 app-chains. ";
    
    return {
        id: itemId,
        title: title,
        originalContent: baseContent + "Currently, the consensus mechanism relies solely on Proof of History which creates a centralization bottleneck during high congestion periods. This limits the theoretical throughput of the network to the capacity of the leader node.",
        proposedContent: baseContent + "Currently, the consensus mechanism leverages a hybrid of Proof of History and localized fee markets, which mitigates the centralization bottleneck during high congestion periods. This optimization allows the network to scale throughput horizontally across multiple shards.",
        author: VISITOR_PROFILE.name,
        reason: "Fixed technical inaccuracy regarding the consensus bottleneck. The original text failed to account for the recent 1.18 scheduler updates.",
        timestamp: '2 hours ago',
        kvReward: 120
    };
};

const transformHistoryToPost = (item: any): Post => {
    const isPremium = item.content_type === 'premium';
    const mockContent = isPremium 
        ? "This content is locked. Users must pay KNOW-U to verify and access the deep technical analysis contained within..."
        : "The rapid evolution of zero-knowledge proofs has led to a fragmentation of prover standards. In this article, we explore how a unified aggregation layer on Arweave could solve the data availability problem for Layer 3 app-chains...";
    const mockHint = isPremium ? "Phân tích sâu về 3 điểm nghẽn kỹ thuật trong ZK-Rollups..." : undefined;

    return {
        id: item.id,
        author: {
            name: VISITOR_PROFILE.name,
            handle: VISITOR_PROFILE.handle,
            avatar: 'https://i.pravatar.cc/150?u=elena',
            balance_u: 0, balance_g: 0, isGold: true,
            followers: VISITOR_PROFILE.followers, following: VISITOR_PROFILE.following, isFollowing: VISITOR_PROFILE.isFollowing
        } as User,
        title: item.title,
        content: mockContent,
        timestamp: item.date,
        likes: Math.floor(Math.random() * 500) + 50,
        knowledgeValue: Math.floor(Math.random() * 50) + 80,
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
        tags: ['Cryptography', 'Research'],
        field: 'Technology',
        visibility: item.visibility,
        contentType: item.content_type,
        premiumHint: mockHint,
        unlockPrice: isPremium ? 150 : undefined
    };
};

const formatNumber = (num?: number) => num ? (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString()) : '0';
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export const VisitorProfileView = () => {
    const navigate = useNavigate();
    const { activeTab, setActiveTab, filteredHistory } = useProfile();

    // UX States
    const [isFollowing, setIsFollowing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showGovAnalytics, setShowGovAnalytics] = useState(false);
    
    // Suggestion Review Logic
    const [processedSuggestions, setProcessedSuggestions] = useState<Record<string, string>>({});
    const [selectedContext, setSelectedContext] = useState<SuggestionContextData | null>(null);
    const [showContextModal, setShowContextModal] = useState(false);

    const displayItems = filteredHistory.filter(item => {
        if (activeTab === 'contributions') return item.type === 'contribution' && item.visibility !== 'private';
        if (activeTab === 'suggestions') return item.type === 'suggestion';
        return false;
    });

    // Open the Review Modal with Mock Data
    const handleViewContext = (item: any) => {
        const mockContext = getMockSuggestionContext(item.id, item.title);
        setSelectedContext(mockContext);
        setShowContextModal(true);
    };

    // Callback when approved in modal
    const handleApprove = () => {
        if (selectedContext) {
            setProcessedSuggestions(prev => ({ ...prev, [selectedContext.id]: 'approved' }));
            setShowContextModal(false);
            alert(`Suggestion for "${selectedContext.title}" approved! Reputation updated.`);
        }
    };

    // Callback when rejected in modal
    const handleReject = () => {
        if (selectedContext) {
            setProcessedSuggestions(prev => ({ ...prev, [selectedContext.id]: 'rejected' }));
            setShowContextModal(false);
            alert('Suggestion rejected.');
        }
    };

    // Quick action on list (bypassing modal)
    const handleQuickAction = (e: React.MouseEvent, id: string, action: 'approved' | 'rejected') => {
        e.stopPropagation(); // Prevents opening the modal when clicking action buttons
        setProcessedSuggestions(prev => ({ ...prev, [id]: action }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            
            {/* 1. VISITOR HEADER IDENTITY SECTION */}
            <div className="relative rounded-3xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-[0_0_20px_-5px_rgba(79,70,229,0.1)] overflow-hidden transition-all duration-500">
                {/* Background Decor - Subtle in Light Mode */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/50 to-blue-100/50 dark:from-purple-900/10 dark:to-blue-900/10 blur-3xl -z-10 rounded-full pointer-events-none opacity-60 dark:opacity-100"></div>
                
                <div className="p-8 flex flex-col items-start gap-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 w-full items-start">
                        {/* Identity Block */}
                        <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-white dark:from-[#1A1D24] dark:to-black border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-lg group cursor-pointer hover:border-purple-500/50 transition-colors">
                                <span className="text-3xl font-serif font-bold text-gray-800 dark:text-white tracking-wider">{VISITOR_PROFILE.initials}</span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-100 dark:bg-green-500 text-green-700 dark:text-white text-[10px] font-bold px-2 py-1 rounded-md border border-green-200 dark:border-green-400/50 font-mono shadow-sm">Expert</div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                        {VISITOR_PROFILE.name}
                                    </h1>
                                    
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-black/40 rounded-lg font-mono text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 flex items-center gap-2">
                                            {VISITOR_PROFILE.handle}
                                            <span className="material-symbols-outlined text-[14px] text-green-500" title="Verified">verified</span>
                                        </span>
                                        {VISITOR_PROFILE.expertise.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm mb-3">
                                        <div className="flex items-center gap-1 group cursor-pointer">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{formatNumber(VISITOR_PROFILE.followers)}</span>
                                            <span className="text-gray-500">Followers</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                        <div className="flex items-center gap-1 group cursor-pointer">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{formatNumber(VISITOR_PROFILE.following)}</span>
                                            <span className="text-gray-500">Following</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reputation & Trophy */}
                                <div className="flex flex-col gap-3 items-end">
                                    <div className="flex items-center gap-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-3 pr-6 backdrop-blur-sm shadow-sm">
                                        <div className="relative w-12 h-12">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                <path className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="92, 100" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-lg text-yellow-500 dark:text-yellow-400">workspace_premium</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{VISITOR_PROFILE.stats.knowledgeScore}</span>
                                            <span className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Knowledge Score</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1 bg-gray-100 dark:bg-black/20 p-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                                        {VISITOR_PROFILE.trophies.map((icon, idx) => (
                                            <div key={idx} className="w-6 h-6 flex items-center justify-center text-sm grayscale hover:grayscale-0 transition-all cursor-help hover:scale-125" title="Community Gift">
                                                {icon}
                                            </div>
                                        ))}
                                        <div className="w-6 h-6 flex items-center justify-center text-[10px] text-gray-500 font-bold bg-white dark:bg-white/5 rounded border border-gray-200 dark:border-transparent cursor-pointer">+12</div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200 dark:bg-white/5 w-full my-6"></div>

                            <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
                                <div className="flex-1">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 max-w-2xl font-serif italic">
                                        "{VISITOR_PROFILE.bio}"
                                    </p>
                                    <div className="flex gap-3">
                                        {VISITOR_PROFILE.socials.map(social => (
                                            <a key={social.label} href={social.url} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent hover:border-gray-300 dark:hover:border-white/20" title={social.label}>
                                                <span className="material-symbols-outlined text-lg">{social.icon}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {/* Follow Button */}
                                    <button 
                                        onClick={() => setIsFollowing(!isFollowing)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                                            isFollowing 
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800' 
                                            : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-gray-900/10 dark:shadow-white/10'
                                        }`}
                                    >
                                        {isFollowing ? (
                                            <><span className="material-symbols-outlined text-sm">check</span> Following</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-sm">add</span> Follow</>
                                        )}
                                    </button>

                                    <button 
                                        onClick={() => setShowSuggestions(!showSuggestions)}
                                        className={`p-2.5 rounded-xl border transition-colors ${
                                            showSuggestions 
                                            ? 'bg-gray-200 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white' 
                                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
                                        }`}
                                        title="Suggested Peers"
                                    >
                                        <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${showSuggestions ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>

                                    <button 
                                        className="flex items-center gap-2 px-5 py-2.5 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 hover:border-yellow-400 dark:hover:border-yellow-500 rounded-xl text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md group"
                                        title="Send a Knowledge Gift"
                                    >
                                        <span className="material-symbols-outlined text-lg group-hover:animate-bounce">redeem</span>
                                        Tip
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* THE EXPANDED TRAY: Suggested Peers */}
                <div 
                    className={`bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-white/5 transition-all duration-500 ease-in-out overflow-hidden ${
                        showSuggestions ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Similar to {VISITOR_PROFILE.name}</h3>
                            <button 
                                onClick={() => navigate('/app/discover')}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                                Explore <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                        </div>

                        {/* Horizontal Scroll Container */}
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {SUGGESTED_PEERS.map(peer => (
                                <div key={peer.id} className="min-w-[180px] bg-white dark:bg-[#161920] border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-3 shadow-inner group cursor-pointer" onClick={() => navigate('/app/u/elena')}>
                                        <span className="text-sm font-serif font-bold text-gray-700 dark:text-white group-hover:text-blue-500 transition-colors">{getInitials(peer.name)}</span>
                                    </div>
                                    <div className="mb-1">
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[140px] cursor-pointer hover:text-primary" onClick={() => navigate('/app/u/elena')}>{peer.name}</h4>
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

            {/* 2. IMPACT METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Knowledge Impact */}
                <div className="group relative rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 flex items-stretch hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex-1 flex flex-col justify-between pr-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined text-xl">history_edu</span>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-0.5">Knowledge Impact</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Content Output</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                                {VISITOR_PROFILE.stats.articlesPublished} <span className="text-lg text-gray-400 dark:text-gray-500 font-medium">Articles</span>
                            </h2>
                            <div className="text-xs text-gray-500">
                                Total KV Generated: <span className="text-blue-600 dark:text-blue-400 font-bold">{VISITOR_PROFILE.stats.totalKV.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent mx-2"></div>
                    <div className="flex flex-col justify-center items-end min-w-[80px]">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Consistency</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">98%</span>
                        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1"><div className="w-[98%] h-full bg-green-500 dark:bg-green-400 rounded-full"></div></div>
                    </div>
                </div>

                {/* Governance Weight */}
                <div 
                    onClick={() => setShowGovAnalytics(true)}
                    className="group relative rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 flex items-stretch hover:border-purple-500/30 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                >
                    <div className="flex-1 flex flex-col justify-between pr-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
                                <span className="material-symbols-outlined text-xl">how_to_vote</span>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-0.5">Protocol Alignment</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">DAO Influence</div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                                {VISITOR_PROFILE.stats.suggestionsApproved} <span className="text-lg text-gray-400 dark:text-gray-500 font-medium">Approved</span>
                            </h2>
                            <div className="text-xs text-gray-500">
                                Network Share: <span className="text-purple-600 dark:text-purple-400 font-bold">{VISITOR_PROFILE.stats.networkShare}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent mx-2"></div>
                    <div className="flex flex-col justify-center items-end min-w-[80px]">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Accuracy</span>
                         <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">Top 1%</span>
                         <span className="text-[9px] text-gray-500 dark:text-gray-400">Validator Tier</span>
                    </div>
                </div>
            </div>

            {/* 3. CONTENT FEED (Replaces Table) */}
            <div className="space-y-6 pb-20">
                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 px-2 sticky top-16 bg-gray-50/95 dark:bg-[#0B0E14]/95 backdrop-blur z-20">
                    <button 
                        onClick={() => setActiveTab('contributions')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'contributions' ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Contributions
                    </button>
                    <button 
                        onClick={() => setActiveTab('suggestions')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'suggestions' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Suggestions
                    </button>
                </div>

                {/* --- FEED CONTENT --- */}
                
                {/* A. CONTRIBUTIONS FEED */}
                {activeTab === 'contributions' && (
                    <div className="space-y-8 animate-fade-in">
                        {displayItems.length > 0 ? (
                            displayItems.map((item) => (
                                <PostCard 
                                    key={item.id} 
                                    post={transformHistoryToPost(item)} 
                                    navigate={navigate} 
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#161920]">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">feed</span>
                                <p>No contributions published yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* B. SUGGESTIONS (PEER REVIEW) FEED */}
                {activeTab === 'suggestions' && (
                    <div className="space-y-4 animate-fade-in">
                        {displayItems.length > 0 ? (
                            displayItems.map((item) => {
                                // Determine Status (processed or initial)
                                const currentStatus = processedSuggestions[item.id] 
                                    ? (processedSuggestions[item.id] === 'approved' ? 'Approved' : 'Rejected') 
                                    : item.status;

                                return (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleViewContext(item)}
                                    className={`relative bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 group overflow-hidden cursor-pointer shadow-sm hover:shadow-md ${
                                        currentStatus === 'Approved' ? 'border-l-4 border-l-green-500' :
                                        currentStatus === 'Rejected' ? 'border-l-4 border-l-red-500' :
                                        'border-l-4 border-l-yellow-500 hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        {/* Avatar Column */}
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                                {VISITOR_PROFILE.initials}
                                            </div>
                                            <div className="h-full w-px bg-gray-200 dark:bg-gray-800 mx-auto mt-2 group-hover:bg-gray-300 dark:group-hover:bg-gray-700 transition-colors"></div>
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 min-w-0">
                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                                                <div className="flex-1">
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                                                        Suggested Change on:
                                                        <span className="material-symbols-outlined text-[14px] text-gray-400 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors ml-auto sm:ml-0">open_in_full</span>
                                                    </p>
                                                    <h3 className="text-gray-900 dark:text-white font-serif font-bold text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-100 transition-colors">
                                                        "{item.title}"
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-blue-500 dark:text-blue-400 font-bold">{VISITOR_PROFILE.name}</span>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">• {item.date}</span>
                                                    </div>
                                                </div>
                                                
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap self-start ${
                                                    currentStatus === 'Approved' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' :
                                                    currentStatus === 'Rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' :
                                                    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                                                }`}>
                                                    {currentStatus}
                                                </span>
                                            </div>

                                            {/* Diff Snippet Card */}
                                            <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-4 font-mono text-xs leading-relaxed relative group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-colors">
                                                <div className="absolute top-0 right-0 px-2 py-1 bg-gray-200 dark:bg-gray-800 text-[9px] text-gray-500 dark:text-gray-400 rounded-bl-lg border-b border-l border-gray-300 dark:border-gray-700">DIFF PREVIEW</div>
                                                <div className="text-gray-600 dark:text-gray-400 pt-2">
                                                    ...the consensus mechanism <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 line-through decoration-red-500/50 px-1 rounded">relies solely on</span> <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-b border-green-500 px-1 rounded">leverages a hybrid of</span> Proof of History...
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-gray-800/50">
                                                
                                                {/* Left: Hint Text */}
                                                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest flex items-center gap-1 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                                                    Click to view context & details
                                                </div>

                                                {/* Right: Review Actions (Only show if pending) */}
                                                {currentStatus === 'Pending' ? (
                                                    <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            onClick={(e) => handleQuickAction(e, item.id, 'rejected')}
                                                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold uppercase tracking-wider transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button 
                                                            onClick={(e) => handleQuickAction(e, item.id, 'approved')}
                                                            className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-green-900/20"
                                                        >
                                                            Approve
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 dark:text-gray-600 font-mono italic">
                                                        Review processed.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})
                        ) : (
                            <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#161920]">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">rate_review</span>
                                <p>No peer reviews active.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

             {/* MODALS */}
             <GovernanceAnalyticsModal 
                isOpen={showGovAnalytics} 
                onClose={() => setShowGovAnalytics(false)} 
                stats={GOV_STATS}
             />

             {/* NEW CONTEXT MODAL */}
             <SuggestionContextModal 
                isOpen={showContextModal}
                onClose={() => setShowContextModal(false)}
                data={selectedContext}
                onApprove={handleApprove}
                onReject={handleReject}
             />
        </div>
    );
};
