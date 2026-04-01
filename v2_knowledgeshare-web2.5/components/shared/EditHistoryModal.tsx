import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Post } from '../../types';

interface EditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

// --- MOCK HISTORY DATA ---
interface Version {
    id: string;
    versionLabel: string;
    timestamp: string;
    author: string;
    ksRank: string;
    summary: string; // Short reason for change
    title: string;
    content: string;
    arweaveHash: string;
    blockTime: number;
}

const getMockHistory = (currentPost: Post): Version[] => [
    {
        id: 'v3',
        versionLabel: 'v1.2 (Current)',
        timestamp: 'Just now',
        author: currentPost.author.name,
        ksRank: currentPost.author.isGold ? 'Gold Peer' : 'Contributor',
        summary: 'Merged community suggestion regarding Sealevel concurrency.',
        title: currentPost.title,
        content: currentPost.content,
        arweaveHash: 'ar://8x9s...kL2m',
        blockTime: 18459203
    },
    {
        id: 'v2',
        versionLabel: 'v1.1',
        timestamp: '2 days ago',
        author: currentPost.author.name,
        ksRank: currentPost.author.isGold ? 'Gold Peer' : 'Contributor',
        summary: 'Fixed typos and expanded the introduction paragraph.',
        title: currentPost.title,
        content: "Unlike EVM's single-threaded model, Solana's Sealevel runtime enables parallel processing. By describing all states a transaction will read or write, non-overlapping transactions execute concurrently.\n\nThis architecture theoretically allows the network to scale performance with Moore's Law. It is a fundamental shift from the global state locking mechanisms found in older chains.",
        arweaveHash: 'ar://3nF1...p9Xq',
        blockTime: 18451000
    },
    {
        id: 'v1',
        versionLabel: 'v1.0 (Genesis)',
        timestamp: '4 days ago',
        author: currentPost.author.name,
        ksRank: currentPost.author.isGold ? 'Gold Peer' : 'Contributor',
        summary: 'Initial publication.',
        title: "Sealevel: Parallel Execution",
        content: "Solana's Sealevel runtime enables parallel processing of smart contracts. This allows the network to scale performance with Moore's Law.",
        arweaveHash: 'ar://1aZ9...m2Vb',
        blockTime: 18440500
    }
];

export const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ isOpen, onClose, post }) => {
    const history = getMockHistory(post);
    const [selectedVersion, setSelectedVersion] = useState<Version>(history[0]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-white/60 dark:bg-[#050608]/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-6xl h-[85vh] bg-white dark:bg-[#0B0E14] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col animate-scale-up">
                
                {/* Header */}
                <div className="h-16 flex-shrink-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0B0E14] px-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                             <span className="material-symbols-outlined">history</span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Version History</h3>
                            <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-white truncate">
                                {post.title}
                            </h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                             <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Current KV</span>
                             <span className="text-xl font-mono font-bold text-green-500">{post.knowledgeValue}</span>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body - Two Column Layout */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* LEFT COLUMN: Version Navigation (30%) */}
                    <div className="w-[30%] border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0F1115] flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-3">
                            {history.map((ver) => (
                                <button
                                    key={ver.id}
                                    onClick={() => setSelectedVersion(ver)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                                        selectedVersion.id === ver.id 
                                        ? 'bg-white dark:bg-[#161b22] border-blue-500/30 shadow-md ring-1 ring-blue-500/20' 
                                        : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {/* Active Indicator */}
                                    {selectedVersion.id === ver.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}

                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-bold font-mono ${selectedVersion.id === ver.id ? 'text-blue-500' : 'text-gray-900 dark:text-white'}`}>
                                            {ver.versionLabel}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{ver.timestamp}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                                        <span>{ver.author}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] border ${ver.ksRank.includes('Gold') ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
                                            {ver.ksRank}
                                        </span>
                                    </div>

                                    <p className={`text-xs line-clamp-2 leading-relaxed ${selectedVersion.id === ver.id ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>
                                        {ver.summary}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Content Display (70%) */}
                    <div className="w-[70%] bg-white dark:bg-[#0B0E14] flex flex-col relative">
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-6">
                                    {selectedVersion.title}
                                </h1>
                                <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                    {selectedVersion.content}
                                </div>
                            </div>
                        </div>

                        {/* Immutable Metadata Footer */}
                        <div className="flex-shrink-0 bg-gray-50 dark:bg-[#050608] border-t border-gray-100 dark:border-gray-800 p-4">
                            <div className="max-w-3xl mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Arweave Hash (Immutable)</span>
                                        <div className="flex items-center gap-2 group cursor-pointer">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">fingerprint</span>
                                            <span className="text-xs font-mono text-blue-500 group-hover:underline">{selectedVersion.arweaveHash}</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Block Time</span>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">deployed_code</span>
                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-300">#{selectedVersion.blockTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">verified</span> Verified on-chain
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};