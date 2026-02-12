
import React, { useState, useMemo } from 'react';
import { MOCK_LEADERBOARD, CURRENT_USER } from '../../data/mockData';

export const LeaderboardView = () => {
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<'cycle' | 'allTime'>('cycle');

  // Helper for initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- RANKING LOGIC (Based on Points) ---
  const getRankInfo = (points: number, rank: number) => {
      // Honorary Rank (Sage)
      if (rank === 1 && points > 50000) {
          return { 
              label: 'Sage', 
              style: 'border-red-500/30 bg-red-500/5', 
              glow: 'bg-red-500/40', 
              text: 'text-red-500', 
              badgeIcon: 'auto_awesome',
              rankIcon: 'local_fire_department' 
          };
      }
      
      if (points >= 10000) return { 
          label: 'Professor', 
          style: 'border-yellow-500/30 bg-yellow-500/5', 
          glow: 'bg-yellow-500/40', 
          text: 'text-yellow-500', 
          badgeIcon: 'school',
          rankIcon: 'workspace_premium' 
      };
      
      if (points >= 4000)  return { 
          label: 'Doctor', 
          style: 'border-purple-500/30 bg-purple-500/5', 
          glow: 'bg-purple-500/40', 
          text: 'text-purple-500', 
          badgeIcon: 'psychology',
          rankIcon: 'psychology'
      };
      
      if (points >= 1500)  return { 
          label: 'Expert', 
          style: 'border-green-500/30 bg-green-500/5', 
          glow: 'bg-green-500/40', 
          text: 'text-green-500', 
          badgeIcon: 'workspace_premium',
          rankIcon: 'workspace_premium'
      };
      
      if (points >= 500)   return { 
          label: 'Scholar', 
          style: 'border-blue-500/20 bg-blue-500/5', 
          glow: 'bg-blue-500/20', 
          text: 'text-blue-500', 
          badgeIcon: 'menu_book',
          rankIcon: 'leaderboard'
      };
      
      return { 
          label: 'Contributor', 
          style: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface', 
          glow: 'bg-gray-500/20', 
          text: 'text-gray-500', 
          badgeIcon: 'edit',
          rankIcon: 'leaderboard'
      };
  };

  // Generate data based on timeframe
  const activeData = useMemo(() => {
      if (timeframe === 'cycle') {
          return MOCK_LEADERBOARD;
      }
      
      // Simulate All Time Data (Deterministic logic for demo)
      return MOCK_LEADERBOARD.map(entry => {
          // Multiply points to simulate long-term accumulation
          // Add a pseudo-random offset based on name length to shuffle ranks slightly
          const multiplier = 40; 
          const offset = (entry.user.name.length % 5) * 500; 
          const newPoints = (entry.points * multiplier) + offset;
          
          return {
              ...entry,
              points: newPoints,
              articles: entry.articles * multiplier,
              reviews: entry.reviews * multiplier,
          };
      }).sort((a, b) => b.points - a.points).map((entry, idx) => ({
          ...entry,
          rank: idx + 1
      }));
  }, [timeframe]);

  // Enhance data with styling logic based on rank
  const richLeaderboard = useMemo(() => {
    return activeData.map(entry => {
        const rankInfo = getRankInfo(entry.points, entry.rank);
        
        // Default Styles based on Title/Points
        let style = rankInfo.style;
        let glowColor = rankInfo.glow;
        let iconColor = rankInfo.text;
        let rankIcon = rankInfo.rankIcon;

        // OVERRIDE STYLES FOR TOP 3 (Gold, Silver, Bronze)
        if (entry.rank === 1) {
            style = 'border-yellow-500/60 bg-yellow-500/10 shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)] z-20 scale-[1.01]';
            glowColor = 'bg-yellow-500/60';
            iconColor = 'text-yellow-500';
            rankIcon = rankInfo.label === 'Sage' ? 'local_fire_department' : 'emoji_events'; // Keep Sage icon if Sage
        } else if (entry.rank === 2) {
            style = 'border-slate-400/50 bg-slate-400/10 shadow-[0_0_15px_-5px_rgba(148,163,184,0.3)] z-10';
            glowColor = 'bg-slate-400/50';
            iconColor = 'text-slate-400 dark:text-slate-300';
            rankIcon = 'emoji_events';
        } else if (entry.rank === 3) {
            style = 'border-orange-700/50 bg-orange-700/10 shadow-[0_0_15px_-5px_rgba(194,65,12,0.3)] z-10';
            glowColor = 'bg-orange-700/50';
            iconColor = 'text-orange-700 dark:text-orange-500';
            rankIcon = 'emoji_events';
        }

        let reward = '10 KNOW-G';
        
        if (timeframe === 'cycle') {
            if (entry.rank === 1) reward = '1,000 KNOW-G';
            else if (entry.rank === 2) reward = '750 KNOW-G';
            else if (entry.rank === 3) reward = '500 KNOW-G';
            else if (entry.rank <= 10) reward = '100 KNOW-G';
            else if (rankInfo.label === 'Scholar') reward = '50 KNOW-G (Bonus)';
        } else {
            // All Time Rewards
            if (entry.rank === 1) reward = 'Genesis NFT';
            else if (entry.rank <= 3) reward = 'DAO Seat';
            else if (entry.rank <= 10) reward = 'Validator Node';
            else reward = 'Profile Badge';
        }

        return { 
            ...entry, 
            style, 
            glowColor, 
            iconColor, 
            badge: rankInfo.label,
            badgeIcon: rankInfo.badgeIcon,
            rankIcon,
            reward 
        };
    });
  }, [activeData, timeframe]);

  // Find Current User
  const currentUserEntry = useMemo(() => {
      return richLeaderboard.find(u => u.user.name === CURRENT_USER.name) || richLeaderboard[richLeaderboard.length - 1]; // Fallback to last if not found
  }, [richLeaderboard]);

  // Filtering Logic
  const displayedUsers = useMemo(() => {
    if (!searchQuery.trim()) {
        return richLeaderboard; // Show all to allow scrolling
    }
    return richLeaderboard.filter(user => 
        user.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, richLeaderboard]);

  // Reusable Row Renderer
  const renderRow = (user: typeof richLeaderboard[0], isSticky: boolean = false) => {
      return (
        <div 
            key={user.rank}
            onMouseEnter={() => !isSticky && setHoveredRank(user.rank)}
            onMouseLeave={() => !isSticky && setHoveredRank(null)}
            className={`relative grid grid-cols-12 items-center px-4 py-3 rounded-xl border transition-all duration-300 ease-out cursor-default ${
                isSticky 
                ? 'bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/30 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] backdrop-blur-md' 
                : `${user.style} ${hoveredRank === user.rank ? 'scale-[1.01] shadow-lg z-20 border-opacity-100 ring-1 ring-white/20' : 'scale-100 z-10 border-opacity-50'}`
            }`}
        >
            {/* Ambient Glow Background on Hover (Only for list items) */}
            {!isSticky && (
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 blur-xl -z-10 ${user.glowColor} ${hoveredRank === user.rank ? 'opacity-100' : 'opacity-0'}`}></div>
            )}

            {/* Rank Column with Icon */}
            <div className="col-span-2 sm:col-span-1 flex justify-center">
            {user.rank <= 3 ? (
                <span className={`material-symbols-outlined text-2xl ${user.iconColor} drop-shadow-sm`}>{user.rankIcon}</span>
            ) : (
                <span className={`font-mono font-bold ${user.rank <= 10 ? 'text-blue-500' : 'text-gray-500'}`}>#{user.rank}</span>
            )}
            </div>
            
            {/* User Column */}
            <div className="col-span-5 sm:col-span-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono tracking-wider flex-shrink-0 ${
                    user.rank <= 3 
                    ? `bg-opacity-10 ${user.iconColor.replace('text', 'bg')} ${user.iconColor} border border-opacity-20` 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                {getInitials(user.user.name)}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                <span className="font-bold text-gray-900 dark:text-white truncate">{user.user.name} {isSticky && <span className="text-[9px] text-blue-500 ml-1">(You)</span>}</span>
                <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border truncate flex items-center gap-1 ${
                    user.badge === 'Sage' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    user.badge === 'Professor' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    user.badge === 'Doctor' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                    user.badge === 'Expert' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    user.badge === 'Scholar' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                }`}>
                    {user.badge}
                </span>
                </div>
            </div>
            
            {/* Score Column */}
            <div className="col-span-3 sm:col-span-2 text-right sm:text-center font-mono font-bold text-gray-700 dark:text-gray-300">
                {user.points.toLocaleString()}
            </div>
            
            {/* Contribs Column (Desktop) */}
            <div className="col-span-2 sm:col-span-2 text-center text-sm text-gray-500 hidden sm:block">
            <span className="flex items-center justify-center gap-1" title="Articles / Reviews">
                <span className="font-bold">{user.articles.toLocaleString()}</span> / {user.reviews.toLocaleString()}
            </span>
            </div>

            {/* Reward Column */}
            <div className="col-span-2 text-right">
                <span className={`font-bold text-xs px-2 py-1 rounded-lg ${
                    user.rank <= 3 ? 'text-green-600 dark:text-green-400 bg-green-500/10' :
                    user.reward.includes('Bonus') || user.reward.includes('Node') ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' :
                    'text-gray-500 bg-gray-100 dark:bg-gray-800'
                }`}>
                {user.reward}
                </span>
            </div>
        </div>
      );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
        <div className="text-center mb-10">
           <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Worker Service Leaderboard</h1>
           <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
             Real-time ranking based on <b>Knowledge Score (KS)</b>.<br/>
             Ranks: <span className="text-gray-500">Contributor</span> → <span className="text-blue-500">Scholar</span> → <span className="text-green-500">Expert</span> → <span className="text-purple-500">Doctor</span> → <span className="text-yellow-500">Professor</span>
           </p>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="bg-white/50 dark:bg-dark-surface/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[750px]">
           
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

           {/* 1. HEADER SECTION (Sticky at top of card logic if needed, currently flex-col flow) */}
           <div className="p-8 pb-4 flex-shrink-0 z-10 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    {/* Left: Title Block */}
                    <div className="text-center md:text-left w-full md:w-auto">
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                            <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Live Ranking</span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Proof-of-Reputation</h3>
                    </div>
                    
                    {/* Right: Actions (Toggle + Search) */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {/* REFINED MICRO TOGGLE */}
                        <div className="flex p-1 bg-gray-100 dark:bg-black/40 rounded-lg border border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={() => setTimeframe('cycle')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                                        timeframe === 'cycle' 
                                        ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Cycle
                                </button>
                                <button
                                    onClick={() => setTimeframe('allTime')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                                        timeframe === 'allTime' 
                                        ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                                >
                                    All Time
                                </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors text-lg">search</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find user..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-[#0B0E14] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider relative z-20 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
                    <div className="col-span-5 sm:col-span-5">User</div>
                    <div className="col-span-3 sm:col-span-2 text-right sm:text-center">Score (KS)</div>
                    <div className="col-span-2 sm:col-span-2 text-center hidden sm:block">Contribs</div>
                    <div className="col-span-2 text-right">Reward</div>
                </div>
           </div>

           {/* 2. SCROLLABLE LIST SECTION */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2 pb-0">
                <div className="space-y-3 relative pb-4">
                    {displayedUsers.length > 0 ? displayedUsers.map((user) => renderRow(user, false)) : (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">search_off</span>
                            <p className="text-gray-500">No users found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
           </div>

           {/* 3. STICKY USER RANK FOOTER */}
           {/* This sits outside the scroll container, pinned to the bottom of the card */}
           <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#0F1116]/90 backdrop-blur-md z-30 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Your Current Standing</div>
               {renderRow(currentUserEntry, true)}
           </div>

        </div>
    </div>
  );
};
