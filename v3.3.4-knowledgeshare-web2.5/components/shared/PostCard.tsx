
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Post } from '../../types';
import { MOCK_COMMENTS, CURRENT_USER, FIELDS } from '../../data/mockData';
import { SuggestEditModal } from './SuggestEditModal';
import { ReportModal } from './ReportModal';
import { SuggestionsListModal } from './SuggestionsListModal';
import { EditHistoryModal } from './EditHistoryModal';

// Imported Sub-Components
import { ThreadedComment } from '../feed/ThreadedComment';
import { PostActions } from '../feed/PostActions';
import { PremiumLock } from '../feed/PremiumLock';
import { UnlockConfirmModal } from '../feed/UnlockConfirmModal';

interface PostCardProps {
  post: Post;
  navigate: (path: string, state?: any) => void;
}

// --- CONSTANTS: GIFT PRESETS ---
const GIFTS = [
    { id: 'applause', name: 'Applause', price: 10, icon: '👏' },
    { id: 'coffee', name: 'Coffee', price: 50, icon: '☕' },
    { id: 'pen', name: 'Quill', price: 100, icon: '✒️' },
    { id: 'book', name: 'Book', price: 200, icon: '📘' },
    { id: 'bulb', name: 'Idea', price: 300, icon: '💡' },
    { id: 'gem', name: 'Gem', price: 500, icon: '💎' },
    { id: 'medal', name: 'Medal', price: 1000, icon: '🥇' },
    { id: 'trophy', name: 'Trophy', price: 5000, icon: '🏆' },
];

// --- HELPER: Initials ---
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// --- MAIN POST CARD ---
export const PostCard: React.FC<PostCardProps> = ({ post, navigate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // UX State for Unlocking
  const [isUnlocked, setIsUnlocked] = useState(post.contentType === 'standard');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  // --- FOLLOW STATE ---
  const [isFollowing, setIsFollowing] = useState(post.author.isFollowing || false);
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  // --- MODAL STATES ---
  const [showSuggestEdit, setShowSuggestEdit] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false); 
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);

  // --- DONATE STATE ---
  const [showDonate, setShowDonate] = useState(false);
  const [selectedGift, setSelectedGift] = useState(GIFTS[1]);
  const [donateMessage, setDonateMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donateStatus, setDonateStatus] = useState<'idle' | 'success'>('idle');
  const [currentBalance, setCurrentBalance] = useState(CURRENT_USER.balance_u);

  const menuRef = useRef<HTMLDivElement>(null);
  
  const comments = MOCK_COMMENTS[post.id] || [];
  const kvClass = post.knowledgeValue >= 150 ? 'text-purple-500 font-bold' : post.knowledgeValue >= 90 ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-600 dark:text-gray-400 font-medium';
  
  // Determine Rank Text based on Implicit Score (Mock Logic)
  // Logic: 0-499 Contributor, 500-1499 Scholar, 1500-3999 Expert, 4000-9999 Doctor, 10000+ Professor
  let rankText = 'Contributor';
  let rankColor = 'text-gray-500';
  
  // Using author properties to simulate total score range
  if (post.author.isGold) {
      if (post.knowledgeValue > 200) { rankText = 'Professor'; rankColor = 'text-yellow-500'; }
      else if (post.knowledgeValue > 150) { rankText = 'Doctor'; rankColor = 'text-purple-500'; }
      else { rankText = 'Expert'; rankColor = 'text-green-500'; }
  } else {
      if (post.knowledgeValue > 100) { rankText = 'Scholar'; rankColor = 'text-blue-500'; }
      else { rankText = 'Contributor'; rankColor = 'text-gray-500'; }
  }

  // Get Field Metadata
  const fieldInfo = useMemo(() => FIELDS.find(f => f.type === post.field) || FIELDS[5], [post.field]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      const lockScroll = isFocusMode || showDonate || showSuggestEdit || showReportModal || showSuggestionsList || showEditHistory || showUnlockModal;
      document.body.style.overflow = lockScroll ? 'hidden' : 'auto';
      return () => { document.body.style.overflow = 'auto'; }
  }, [isFocusMode, showDonate, showSuggestEdit, showReportModal, showSuggestionsList, showEditHistory, showUnlockModal]);

  const toggleFocusMode = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsFocusMode(true);
  };

  const closeFocusMode = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setIsFocusMode(false);
  };

  const handleToggleFollow = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsFollowing(!isFollowing);
      // Here you would typically emit an event or call an API
  };

  // --- CONFIRMATION UNLOCK LOGIC ---
  const handleUnlockRequest = () => {
      setShowUnlockModal(true);
  };

  const onConfirmUnlock = () => {
      setCurrentBalance(prev => prev - (post.unlockPrice || 0));
      setIsUnlocked(true);
      setShowUnlockModal(false);
  };

  const handleDonateOpen = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDonate(true);
      setDonateStatus('idle');
      setDonateMessage('');
      setIsAnonymous(false);
      setSelectedGift(GIFTS[1]);
  };

  const handleDonateConfirm = () => {
      const amount = selectedGift.price;
      if (amount <= currentBalance) {
          setCurrentBalance(prev => prev - amount);
          setDonateStatus('success');
          setTimeout(() => {
              setShowDonate(false);
          }, 3500);
      }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Logic to determine if it's "me" or "other"
      if (post.author.name === CURRENT_USER.name) {
          navigate('/app/profile');
      } else {
          // Use a dummy ID for now, or the post author's ID if available
          navigate('/app/u/elena'); // Hardcoded for demo to show the visitor view
      }
  };

  const handleLocationClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (post.location) {
          navigate('/app/map', { state: { targetLocation: post.location } });
      }
  };

  // Menu Handlers
  const handleSuggestEditOpen = (e: React.MouseEvent) => { e.stopPropagation(); setShowMenu(false); setShowSuggestEdit(true); };
  const handleSuggestionsListOpen = (e: React.MouseEvent) => { e.stopPropagation(); setShowMenu(false); setShowSuggestionsList(true); };
  const handleReportOpen = (e: React.MouseEvent) => { e.stopPropagation(); setShowMenu(false); setShowReportModal(true); };
  const handleEditHistoryOpen = (e: React.MouseEvent) => { e.stopPropagation(); setShowMenu(false); setShowEditHistory(true); };

  const renderPostContent = (inModal: boolean) => (
      <>
         <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                     <span 
                        className="font-bold text-sm text-gray-900 dark:text-white hover:underline cursor-pointer"
                        onClick={handleProfileClick}
                     >
                        {post.author.name}
                    </span>
                    
                    {/* FOLLOW BUTTON (Compact) */}
                    <button 
                        onClick={handleToggleFollow}
                        onMouseEnter={() => setIsHoveringFollow(true)}
                        onMouseLeave={() => setIsHoveringFollow(false)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 border flex items-center gap-1 ${
                            isFollowing 
                            ? 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500' 
                            : 'border-blue-500/20 bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white'
                        }`}
                    >
                        {isFollowing ? (
                            isHoveringFollow ? (
                                <>
                                    <span className="material-symbols-outlined text-[10px]">close</span>
                                    Unfollow
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[10px]">check</span>
                                    Following
                                </>
                            )
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[10px]">add</span>
                                Follow
                            </>
                        )}
                    </button>

                    <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                    <span className="text-xs text-gray-500">{post.timestamp}</span>
                </div>
            </div>
            
            {!inModal && (
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                    
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                             <div className="py-1">
                                <button onClick={handleSuggestEditOpen} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-lg text-gray-500">edit_note</span> Suggest Edit
                                </button>
                                <button onClick={handleSuggestionsListOpen} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-lg text-blue-500">ballot</span> View Suggestions
                                </button>
                                <button onClick={handleEditHistoryOpen} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-lg text-gray-500">history</span> Edit History
                                </button>
                                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                                <button onClick={handleReportOpen} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined text-lg">flag</span> Report
                                </button>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="flex items-center gap-2">
            <h2 className={`${inModal ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'} font-serif font-bold text-gray-900 dark:text-white leading-tight mt-1 mb-2 cursor-pointer hover:text-primary transition-colors`}>
                {post.title}
            </h2>
            {post.contentType === 'premium' && (
                <span className="material-symbols-outlined text-purple-500 text-2xl animate-pulse" title="Premium Content">diamond</span>
            )}
        </div>

        <div className="flex items-center flex-wrap gap-3 mb-4 font-mono text-xs tracking-tight select-none">
            <span className={kvClass}>KV: {post.knowledgeValue}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className={`${rankColor} font-bold`}>{rankText}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-gray-400">{post.field}</span>
        </div>

        {/* --- CONTENT AREA --- */}
        {!isUnlocked && post.contentType === 'premium' ? (
            <PremiumLock 
                hint={post.premiumHint || "Unlock to read..."} 
                price={post.unlockPrice || 0} 
                balance={currentBalance}
                onUnlockRequest={handleUnlockRequest}
            />
        ) : (
            <div className="animate-fade-in relative">
                {/* Visual Indicator that this is Premium Content */}
                {post.contentType === 'premium' && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-transparent border-l-2 border-purple-500 rounded-r-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm">verified_user</span>
                             Authenticated Owner
                        </span>
                        <span className="text-[10px] text-purple-500/70 font-mono">Access Unlocked</span>
                    </div>
                )}

                <p className={`text-base font-sans text-gray-700 dark:text-gray-300 leading-relaxed opacity-90 mb-4 whitespace-pre-wrap ${inModal || isExpanded ? '' : 'line-clamp-3'}`}>
                    {post.content}
                </p>

                {/* --- LOCATION CARD (If Verified Place) --- */}
                {post.location && (
                    <div className="mt-3 mb-4 p-0 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden group/map cursor-pointer transition-all hover:border-blue-500/30 shadow-sm" onClick={handleLocationClick}>
                        {/* Mini Map Placeholder */}
                        <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-gray-400">map</span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono backdrop-blur-sm">
                                {post.location.lat.toFixed(4)}, {post.location.lng.toFixed(4)}
                            </div>
                        </div>
                        <div className="p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 border border-red-200 dark:border-red-500/20">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Verified Location</div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{post.location.name}</div>
                            </div>
                            <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 text-xs font-bold border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors flex items-center gap-1">
                                View Map <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- URL LINK CARD (If Review Link) --- */}
                {post.link && (
                    <div className="mt-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-3 group/link hover:border-blue-500/30 transition-all cursor-pointer shadow-sm" onClick={() => window.open(post.link, '_blank')}>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0">
                            <span className="material-symbols-outlined">link</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Source Link</div>
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate group-hover/link:underline">{post.link}</div>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 -rotate-45 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform">arrow_forward</span>
                    </div>
                )}
                
                {!inModal && !isExpanded && (
                    <div className="flex justify-end -mt-1 mb-2 relative z-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className="text-primary hover:text-primary-dark text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm pl-2 py-1 rounded-md transition-colors"
                        >
                            View More <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                )}
                 {!inModal && isExpanded && (
                    <div className="flex justify-end -mt-1 mb-2 relative z-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className="text-primary hover:text-primary-dark text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm pl-2 py-1 rounded-md transition-colors"
                        >
                            Show Less <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                    </div>
                )}
            </div>
        )}
      </>
  );

  return (
    <>
        {/* --- 1. CARD VIEW (Feed) --- */}
        <article 
            onClick={toggleFocusMode}
            className="group relative bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-start gap-5">
                <div className="flex-shrink-0 pt-1">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold font-mono tracking-wider transition-transform group-hover:scale-105 ${
                        post.author.isGold 
                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800' 
                        : 'bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-light ring-1 ring-primary/10'
                    }`}>
                        {getInitials(post.author.name)}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    {renderPostContent(false)}
                    <PostActions 
                        likes={post.likes} 
                        commentCount={comments.length} 
                        onToggleFocus={toggleFocusMode}
                        onDonate={handleDonateOpen}
                        isModal={false}
                    />
                </div>
            </div>
        </article>

        {/* --- 2. FOCUS MODE MODAL --- */}
        {isFocusMode && createPortal(
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
                onClick={closeFocusMode}
            >
                <div 
                    className="w-full max-w-[720px] bg-white dark:bg-dark-surface rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative animate-scale-up border border-gray-200 dark:border-gray-700/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={closeFocusMode}
                        className="absolute right-4 top-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white dark:bg-dark-surface">
                        <div className="p-8 md:p-10">
                            {/* Header Section: Author & Metadata */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold font-mono tracking-wider ${
                                        post.author.isGold 
                                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 ring-1 ring-yellow-200 dark:ring-yellow-800' 
                                        : 'bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-light ring-1 ring-primary/10'
                                    }`}>
                                        {getInitials(post.author.name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className="font-bold text-gray-900 dark:text-white text-base hover:underline cursor-pointer"
                                                onClick={handleProfileClick}
                                            >
                                                {post.author.name}
                                            </span>
                                            {post.author.isGold && <span className="material-symbols-outlined text-yellow-500 text-sm" title="Gold Peer">verified</span>}
                                            
                                            {/* Follow Button In Modal */}
                                            <button 
                                                onClick={handleToggleFollow}
                                                className={`text-xs font-bold ml-2 transition-colors ${
                                                    isFollowing 
                                                    ? 'text-gray-400 hover:text-red-500' 
                                                    : 'text-blue-500 hover:text-blue-600'
                                                }`}
                                            >
                                                {isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                            <span>{post.author.handle || '@user'}</span>
                                            <span>•</span>
                                            <span>{post.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <span className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${fieldInfo.color}`}>
                                    <span className="material-symbols-outlined text-sm">{fieldInfo.icon}</span>
                                    {post.field}
                                </span>
                            </div>

                            {/* Stats Metadata */}
                            <div className="flex items-center gap-3 mb-4 text-xs font-mono text-gray-500 dark:text-gray-400 select-none">
                                <span className={kvClass}>KV: {post.knowledgeValue}</span>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <span className={`${rankColor} font-bold`}>{rankText}</span>
                                <span className="sm:hidden text-gray-300 dark:text-gray-600">|</span>
                                <span className="sm:hidden">{post.field}</span>
                            </div>

                            {/* Title */}
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-serif font-black text-gray-900 dark:text-white leading-tight mb-6">
                                    {post.title}
                                </h1>
                                {post.contentType === 'premium' && (
                                    <span className="material-symbols-outlined text-purple-500 text-3xl mb-6 animate-pulse" title="Premium Content">diamond</span>
                                )}
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-gray-800 mb-8"></div>
                            
                            {/* Main Content (Locked or Unlocked) */}
                            {!isUnlocked && post.contentType === 'premium' ? (
                                <PremiumLock 
                                    hint={post.premiumHint || "Unlock to read..."} 
                                    price={post.unlockPrice || 0} 
                                    balance={currentBalance}
                                    onUnlockRequest={handleUnlockRequest}
                                />
                            ) : (
                                <>
                                    <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </div>

                                    {/* Location / Link in Modal */}
                                    {post.location && (
                                        <div className="mt-6 mb-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-4 cursor-pointer hover:border-blue-500/30 transition-all group" onClick={handleLocationClick}>
                                            <div className="h-16 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg relative overflow-hidden shrink-0">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-2xl text-gray-400">map</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Verified Location</div>
                                                <div className="text-base font-bold text-gray-900 dark:text-white truncate">{post.location.name}</div>
                                            </div>
                                            <div className="p-2 rounded-full bg-white dark:bg-white/10 text-gray-400 group-hover:text-blue-500 transition-colors">
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </div>
                                        </div>
                                    )}

                                    {post.link && (
                                        <div className="mt-6 mb-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-4 cursor-pointer hover:border-blue-500/30 transition-all group" onClick={() => window.open(post.link, '_blank')}>
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0">
                                                <span className="material-symbols-outlined text-2xl">link</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Source Link</div>
                                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate group-hover:underline">{post.link}</div>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-500 -rotate-45 transition-colors">arrow_forward</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-8">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded hover:text-primary cursor-pointer transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <PostActions 
                                likes={post.likes} 
                                commentCount={comments.length} 
                                onToggleFocus={undefined} // Already focused
                                onDonate={handleDonateOpen}
                                isModal={true}
                            />
                        </div>

                        {/* Comments Section */}
                        <div className="bg-gray-50 dark:bg-black/20 p-6 md:p-8 border-t border-gray-200 dark:border-gray-800">
                             <h4 className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">forum</span>
                                Comments ({comments.length})
                             </h4>
                             {comments.length > 0 ? (
                                    <div className="space-y-6">
                                        {comments.map((comment, index) => (
                                            <div key={comment.id}>
                                                {index > 0 && <div className="h-px bg-gray-200 dark:bg-gray-800 my-6"></div>}
                                                <ThreadedComment comment={comment} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">No comments yet. Be the first to add value.</p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Sticky Footer (Input) */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface flex items-end gap-3 flex-shrink-0 z-20">
                         <div className="flex-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 flex items-center border border-transparent focus-within:border-primary/50 focus-within:bg-white dark:focus-within:bg-black/20 transition-all">
                            <input 
                                type="text" 
                                placeholder="Add to the discussion..." 
                                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
                            />
                            <button className="text-gray-400 hover:text-primary transition-colors p-1">
                                <span className="material-symbols-outlined text-xl">send</span>
                            </button>
                         </div>
                    </div>
                </div>
            </div>,
            document.body
        )}

        {/* --- OTHER MODALS --- */}
        <SuggestEditModal isOpen={showSuggestEdit} onClose={() => setShowSuggestEdit(false)} post={post} userBalance={currentBalance} />
        <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title={post.title} />
        <SuggestionsListModal isOpen={showSuggestionsList} onClose={() => setShowSuggestionsList(false)} post={post} />
        <EditHistoryModal isOpen={showEditHistory} onClose={() => setShowEditHistory(false)} post={post} />
        
        {/* NEW UNLOCK CONFIRM MODAL */}
        <UnlockConfirmModal 
            isOpen={showUnlockModal} 
            onClose={() => setShowUnlockModal(false)} 
            onConfirm={onConfirmUnlock}
            price={post.unlockPrice || 0}
            balance={currentBalance}
            title={post.title}
        />

        {/* DONATE MODAL (Simplified for brevity, same as before) */}
        {showDonate && createPortal(
            <div 
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm animate-fade-in"
                onClick={(e) => { e.stopPropagation(); setShowDonate(false); }}
            >
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100 mx-4 flex flex-col max-h-[90vh]"
                >
                    {donateStatus === 'idle' ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 pb-4 text-center border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Acknowledge Contribution</p>
                                <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white">{post.author.name}</h3>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    {GIFTS.map((gift) => (
                                        <button 
                                            key={gift.id}
                                            onClick={() => setSelectedGift(gift)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                                                selectedGift.id === gift.id 
                                                ? 'border-primary ring-2 ring-primary ring-opacity-50 bg-primary/5' 
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-dark-bg'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{gift.icon}</div>
                                            <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200 leading-tight">{gift.name}</div>
                                            <div className="text-[9px] font-mono text-gray-400 mt-1">{gift.price}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg/50 flex-shrink-0">
                                    <div className="flex justify-between items-center mb-4 text-xs">
                                        <span className="text-gray-500">Available Balance:</span>
                                        <span className="font-mono font-bold text-gray-900 dark:text-white">{currentBalance.toLocaleString()} KNOW-U</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowDonate(false)} className="py-3 px-6 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                        <button onClick={handleDonateConfirm} disabled={selectedGift.price > currentBalance} className="flex-1 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                                            <span>Gift {selectedGift.name}</span>
                                            <span className="bg-white/20 dark:bg-black/10 px-1.5 py-0.5 rounded text-xs font-mono">{selectedGift.price}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 flex flex-col items-center text-center animate-fade-in justify-center min-h-[400px]">
                            <div className="mb-6 relative"><span className="text-6xl animate-bounce">{selectedGift.icon}</span></div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2 leading-tight">Gift Sent!</h3>
                            <div className="flex flex-col items-center gap-1 mt-8">
                                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Deducted</span>
                                <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white">-{selectedGift.price}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>,
            document.body
        )}
    </>
  );
};
