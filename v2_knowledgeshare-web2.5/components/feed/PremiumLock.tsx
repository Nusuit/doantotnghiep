
import React from 'react';

interface PremiumLockProps {
    hint: string;
    price: number;
    balance: number;
    onUnlockRequest: () => void;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({ hint, price, balance, onUnlockRequest }) => {
    return (
        <div className="my-6 relative">
             {/* 1. The Premium Insight Card (The Teaser) */}
             <div className="relative z-10 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)] overflow-hidden">
                 {/* Decorative Elements */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                 
                 <div className="flex items-center gap-2 mb-3">
                     <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-purple-500/40">
                         Premium Insight
                     </span>
                     <span className="text-[10px] font-mono text-purple-400/80 uppercase tracking-widest">
                         // High Value
                     </span>
                 </div>
                 
                 <p className="text-gray-800 dark:text-gray-100 font-serif text-lg leading-relaxed italic relative z-10">
                    "{hint}"
                 </p>
             </div>

             {/* 2. The "Vault" Effect (Fade into Encryption) */}
             <div className="relative -mt-4 pt-12 pb-8 rounded-b-2xl overflow-hidden group/vault">
                  {/* Matrix / Noise Overlay Background */}
                  <div className="absolute inset-0 bg-gray-50 dark:bg-[#0B0E14] opacity-90"></div>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                  
                  {/* Gradient Mask for Fade Out */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-[#0B0E14]/80 dark:to-[#0B0E14]"></div>

                  {/* Locked Content Skeleton (Visual hint of length) */}
                  <div className="relative z-0 flex flex-col gap-3 px-6 opacity-30 blur-sm scale-[0.98]">
                       <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-full group-hover/vault:w-[98%] transition-all duration-1000"></div>
                       <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-11/12 group-hover/vault:w-[95%] transition-all duration-1000"></div>
                       <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-full"></div>
                       <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-4/5 group-hover/vault:w-[82%] transition-all duration-1000"></div>
                  </div>

                  {/* 3. The CTA Button (The Key) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-10">
                       <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onUnlockRequest();
                            }}
                            className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-[0_10px_40px_-10px_rgba(124,58,237,0.5)] transition-all duration-300 transform hover:scale-105 overflow-hidden hover:shadow-[0_15px_50px_-10px_rgba(124,58,237,0.7)]"
                       >
                            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            
                            <div className="flex items-center gap-3 relative z-10 min-w-[180px] justify-center">
                                <span className="material-symbols-outlined text-xl">lock_open</span>
                                <span>Unlock Full Analysis</span>
                                <span className="bg-black/20 px-2 py-0.5 rounded text-sm font-mono border border-white/10">
                                    {price} KP
                                </span>
                            </div>
                       </button>
                       
                       {/* Hint Text below button */}
                       <div className="mt-4 flex flex-col items-center">
                            <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Verified
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> On-chain
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono">
                                Wallet Balance: <span className={balance >= price ? "text-gray-300" : "text-red-400"}>{balance} KNOW-U</span>
                            </p>
                       </div>
                  </div>
             </div>
        </div>
    );
};
