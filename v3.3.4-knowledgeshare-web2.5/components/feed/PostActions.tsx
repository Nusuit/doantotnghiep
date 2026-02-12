
import React, { useState } from 'react';

interface PostActionsProps {
    likes: number;
    commentCount: number;
    onToggleFocus?: (e: React.MouseEvent) => void;
    onDonate?: (e: React.MouseEvent) => void;
    isModal?: boolean;
}

export const PostActions: React.FC<PostActionsProps> = ({ likes, commentCount, onToggleFocus, onDonate, isModal = false }) => {
    // --- VOTING STATE ---
    const [votes, setVotes] = useState({ 
        up: likes, 
        down: Math.max(2, Math.floor(likes * 0.18)) 
    });
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

    // Calculate Percentages for Gauge
    const totalVotes = votes.up + votes.down;
    const upPercent = totalVotes === 0 ? 50 : (votes.up / totalVotes) * 100;
    const downPercent = 100 - upPercent;

    const handleVote = (type: 'up' | 'down') => {
        if (userVote === type) {
            setUserVote(null);
            setVotes(prev => ({ ...prev, [type]: prev[type] - 1 }));
        } else {
            setVotes(prev => {
                const newVotes = { ...prev };
                if (userVote) newVotes[userVote] -= 1;
                newVotes[type] += 1;
                return newVotes;
            });
            setUserVote(type);
        }
    };

    return (
        <div className={`flex items-center gap-6 mt-4 pt-2 ${isModal ? 'border-t border-gray-100 dark:border-gray-800' : 'border-t border-transparent'}`}>
             
             {/* --- THE BALANCED GAUGE (Up/Down Vote) --- */}
             <div className="flex items-center gap-3 select-none" onClick={(e) => e.stopPropagation()}>
                {/* UP Button */}
                <button 
                    onClick={() => handleVote('up')}
                    className={`group/up p-1 rounded-full transition-colors ${
                        userVote === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-green-600'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                </button>

                {/* The Gauge Bar */}
                <div className="h-6 w-36 flex rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                    {/* Green Segment */}
                    <div 
                        style={{ width: `${upPercent}%` }} 
                        className={`flex items-center justify-center transition-all duration-500 ease-out group-hover/up:brightness-110 group-hover/up:shadow-[0_0_10px_rgba(34,197,94,0.3)] ${
                            userVote === 'up' ? 'bg-green-500 text-white' : 'bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                        }`}
                    >
                        <span className={`text-[10px] font-bold tracking-tight px-1 truncate ${upPercent < 20 ? 'hidden' : 'block'}`}>
                            {votes.up}
                        </span>
                    </div>

                    {/* Red Segment */}
                    <div 
                        style={{ width: `${downPercent}%` }} 
                        className={`flex items-center justify-center transition-all duration-500 ease-out group-hover/down:brightness-110 group-hover/down:shadow-[0_0_10px_rgba(239,68,68,0.3)] ${
                            userVote === 'down' ? 'bg-red-500 text-white' : 'bg-red-500/20 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                        }`}
                    >
                        <span className={`text-[10px] font-bold tracking-tight px-1 truncate ${downPercent < 20 ? 'hidden' : 'block'}`}>
                            {votes.down}
                        </span>
                    </div>
                </div>

                {/* DOWN Button */}
                <button 
                    onClick={() => handleVote('down')}
                    className={`group/down p-1 rounded-full transition-colors ${
                        userVote === 'down' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                </button>
             </div>

             <button onClick={isModal ? undefined : onToggleFocus} className={`flex items-center gap-2 text-gray-500 hover:text-primary transition-colors ${isModal ? 'cursor-default' : ''}`}>
                <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                <span className="text-xs font-bold">{commentCount} <span className="hidden sm:inline">Comments</span></span>
             </button>

             <button onClick={onDonate} className="flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition-colors ml-auto sm:ml-0">
                 <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                 <span className="text-xs font-bold hidden sm:inline">Tip</span>
             </button>

             <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors ml-auto">
                <span className="material-symbols-outlined text-[20px]">share</span>
             </button>
        </div>
    );
};
