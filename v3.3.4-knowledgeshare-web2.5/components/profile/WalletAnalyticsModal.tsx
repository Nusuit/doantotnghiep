
import React from 'react';
import { createPortal } from 'react-dom';

interface WalletAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        totalEarned: number;
        totalSpent: number;
        giftsReceived: any[];
        history: any[];
    };
}

export const WalletAnalyticsModal: React.FC<WalletAnalyticsModalProps> = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 animate-fade-in text-gray-900 dark:text-white">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>
            
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0B0E14]">
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
                            <span className="material-symbols-outlined text-xl">analytics</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wallet Analytics</h2>
                            <p className="text-sm text-gray-500">Income, Expenses & Gifts Breakdown</p>
                        </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    
                    {/* 1. Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        <div className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent border border-green-200 dark:border-green-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-widest mb-1">Total Earned</p>
                                    <h3 className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">+{stats.totalEarned.toLocaleString()}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Lifetime earnings from contributions & gifts.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-900/20 dark:to-transparent border border-red-200 dark:border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-red-600 dark:text-red-500 uppercase tracking-widest mb-1">Total Spent</p>
                                    <h3 className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">-{stats.totalSpent.toLocaleString()}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total spent on unlocks & staking.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                    </div>

                    {/* 2. Gift Cabinet */}
                    <div className="px-6 mb-8">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-yellow-500">redeem</span>
                            Gift Cabinet (Received)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.giftsReceived.map(gift => (
                                <div key={gift.id} className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors group shadow-sm">
                                    <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">{gift.icon}</div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{gift.name}</div>
                                    <div className="text-xs text-gray-500">x{gift.count} Received</div>
                                    <div className="mt-2 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                                        Val: {gift.value.toLocaleString()} U
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Transaction History */}
                    <div className="px-6 pb-6">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-blue-500">history</span>
                            Recent Activity
                        </h3>
                        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                            {stats.history.map((tx, index) => (
                                <div key={tx.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${index !== stats.history.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            tx.type === 'income' 
                                            ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500' 
                                            : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500'
                                        }`}>
                                            <span className="material-symbols-outlined text-lg">{tx.icon}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{tx.label}</div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider">{tx.category} • {tx.date}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold text-sm ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount} U
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
};
