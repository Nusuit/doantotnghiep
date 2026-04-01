
import React, { useState } from 'react';
import { Comment } from '../../data/mockData';

// --- HELPER: Initials ---
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const ThreadedComment: React.FC<{ comment: Comment; depth?: number }> = ({ comment, depth = 0 }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isCollapsed) {
        return (
            <div 
                onClick={() => setIsCollapsed(false)}
                className="py-2 cursor-pointer group flex items-center gap-2 select-none opacity-60 hover:opacity-100 transition-opacity"
            >
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500">
                    {getInitials(comment.author)}
                </div>
                <span className="text-xs font-bold text-gray-400 italic">
                    {comment.author} <span className="text-[10px] font-normal not-italic">• {comment.timestamp} • [Compressed]</span>
                </span>
            </div>
        );
    }

    return (
        <div className="relative animate-fade-in flex gap-3">
             {/* Avatar Column */}
             <div className="flex-shrink-0">
                <div className={`rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 ${depth === 0 ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-[10px]'}`}>
                    {getInitials(comment.author)}
                </div>
             </div>

             {/* Content Column */}
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 cursor-pointer group" onClick={() => setIsCollapsed(true)}>
                    <span className="text-xs font-bold text-gray-900 dark:text-white hover:underline">
                        {comment.author}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                        • [KS: {comment.authorLevel}] • {comment.timestamp}
                    </span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans mb-2">
                    {comment.text}
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 mb-2">
                    <div className="flex items-center gap-1 group/vote hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 -ml-1 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm group-hover/vote:text-orange-500">arrow_upward</span>
                        <span className="min-w-[1em] text-center">{comment.likes}</span>
                        <span className="material-symbols-outlined text-sm group-hover/vote:text-blue-500">arrow_downward</span>
                    </div>
                    <button className="hover:text-primary transition-colors">REPLY</button>
                    <button className="hover:text-primary transition-colors">SHARE</button>
                    <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">more_horiz</span></button>
                </div>

                {/* Nested Replies with Vertical Thread Line */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 relative">
                        {/* The Thread Line */}
                        <div className="absolute left-0 top-1 bottom-0 w-[1px] bg-gray-200 dark:bg-white/10 hover:bg-gray-400 dark:hover:bg-white/30 transition-colors"></div>
                        
                        <div className="pl-4 pt-2 space-y-4">
                            {comment.replies.map(reply => (
                                <ThreadedComment key={reply.id} comment={reply} depth={depth + 1} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
