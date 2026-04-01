
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { CURRENT_USER } from '../../data/mockData';
import { PostCard } from '../../components/shared/PostCard';

export const FeedView = ({ posts }: { posts: Post[] }) => {
  const navigate = useNavigate();

  // Helper for initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* --- REDESIGNED COMPOSE TRIGGER --- */}
      <div 
        onClick={() => navigate('/app/create')}
        className="mb-10 group cursor-pointer"
      >
        <div className="relative bg-white dark:bg-[#0B0E14] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 transition-all duration-500 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-[0_0_30px_-10px_rgba(79,70,229,0.15)] overflow-hidden">
           
           {/* Inner Shadow Overlay for Depth */}
           <div className="absolute inset-0 shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)] pointer-events-none rounded-2xl"></div>

           <div className="relative z-10">
              {/* Top Row: Interaction Area */}
              <div className="flex items-center gap-5">
                  {/* Left: Avatar with Pulse Glow */}
                  <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-primary blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full"></div>
                      <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-[#161b22] text-gray-600 dark:text-gray-300 font-mono font-bold text-sm border border-white/50 dark:border-white/10 shadow-sm group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                          {getInitials(CURRENT_USER.name)}
                      </div>
                  </div>

                  {/* Center: Elegant Placeholder */}
                  <div className="flex-1">
                      <span className="text-lg font-serif italic text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors duration-300">
                          Write a new knowledge contribution to Permaweb...
                      </span>
                  </div>

                  {/* Right: Quick Action Icons (Outline Style) */}
                  <div className="hidden sm:flex items-center gap-3 border-l border-gray-100 dark:border-gray-800 pl-5">
                      <div className="p-2.5 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-gray-400 hover:text-blue-500 group/icon" title="Public Post">
                          <span className="material-symbols-outlined text-[22px] group-hover/icon:scale-110 transition-transform">edit_square</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-transparent hover:border-purple-500/30 hover:bg-purple-500/10 transition-all text-gray-400 hover:text-purple-400 group/icon" title="Premium Post">
                          <span className="material-symbols-outlined text-[22px] group-hover/icon:scale-110 transition-transform">diamond</span>
                      </div>
                  </div>
              </div>

              {/* Bottom Row: Technical Metadata Tags */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/50 flex justify-end gap-6 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  {['MARKDOWN SUPPORT', 'ARWEAVE STORAGE', 'PERMAWEB'].map((tag) => (
                      <span key={tag} className="text-[10px] font-mono font-bold tracking-[0.2em] text-gray-400 dark:text-gray-600 uppercase select-none flex items-center gap-1">
                          {tag === 'ARWEAVE STORAGE' && <span className="w-1 h-1 rounded-full bg-green-500/50"></span>}
                          {tag}
                      </span>
                  ))}
              </div>
           </div>
        </div>
      </div>

      {/* Posts Stream with Vertical Spacing */}
      <div className="space-y-8">
        {posts.map(post => (
          <PostCard key={post.id} post={post} navigate={navigate} />
        ))}
      </div>
      
      <div className="py-24 text-center">
         <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-300 dark:text-gray-700">Knowledge is infinite</span>
      </div>
    </div>
  );
};
