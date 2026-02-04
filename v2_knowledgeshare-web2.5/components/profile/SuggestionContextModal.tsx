
import React from 'react';
import { createPortal } from 'react-dom';

export interface SuggestionContextData {
    id: string;
    title: string;
    originalContent: string;
    proposedContent: string;
    author: string;
    reason: string;
    timestamp: string;
    kvReward: number;
}

interface SuggestionContextModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SuggestionContextData | null;
    onApprove: () => void;
    onReject: () => void;
}

// --- HELPER: Diff Logic ---
type DiffPart = { type: 'same' | 'added' | 'removed'; value: string };

const computeDiff = (oldText: string, newText: string): DiffPart[] => {
    const oldWords = oldText.split(/(\s+)/); // Keep spaces
    const newWords = newText.split(/(\s+)/);
    const diff: DiffPart[] = [];
    
    let i = 0; 
    let j = 0;

    // Simple diff algorithm for demo purposes
    while (i < oldWords.length || j < newWords.length) {
        if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
            diff.push({ type: 'same', value: oldWords[i] });
            i++; j++;
        } else if (j < newWords.length && (i >= oldWords.length || !oldWords.includes(newWords[j], i))) {
            diff.push({ type: 'added', value: newWords[j] });
            j++;
        } else if (i < oldWords.length) {
            diff.push({ type: 'removed', value: oldWords[i] });
            i++;
        } else {
             i++; j++;
        }
    }
    return diff;
};

export const SuggestionContextModal: React.FC<SuggestionContextModalProps> = ({ 
    isOpen, onClose, data, onApprove, onReject 
}) => {
    if (!isOpen || !data) return null;

    const diffs = computeDiff(data.originalContent, data.proposedContent);

    return createPortal(
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Window */}
            <div className="relative w-full max-w-5xl bg-[#0B0E14] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-scale-up">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#0F1116] z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Peer Review</span>
                                <span className="text-gray-500 text-xs">• {data.timestamp}</span>
                            </div>
                            <h2 className="text-lg font-serif font-bold text-white truncate max-w-md">{data.title}</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stake Reward</span>
                            <span className="text-sm font-mono font-bold text-green-400">+{data.kvReward} KNOW-U</span>
                        </div>
                        <button 
                            onClick={onReject}
                            className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-all"
                        >
                            Reject
                        </button>
                        <button 
                            onClick={onApprove}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">check</span> Approve
                        </button>
                    </div>
                </div>

                {/* Split View Content */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* LEFT: Original Content */}
                    <div className="hidden md:block w-1/2 border-r border-gray-800 bg-[#050608] flex flex-col">
                        <div className="p-3 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center sticky top-0">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">history</span> Original Version
                            </span>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="prose prose-invert max-w-none opacity-60 select-none pointer-events-none">
                                <p className="font-sans text-base leading-relaxed text-gray-300 whitespace-pre-wrap">
                                    {data.originalContent}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Proposed Changes (Diff) */}
                    <div className="w-full md:w-1/2 bg-[#0B0E14] flex flex-col">
                        <div className="p-3 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center sticky top-0">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">edit_note</span> Proposed Change
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <span className="w-2 h-2 bg-green-500/20 border border-green-500 rounded-sm"></span> Added
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <span className="w-2 h-2 bg-red-500/20 border border-red-500 rounded-sm"></span> Removed
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative">
                            
                            {/* Reason Box */}
                            <div className="mb-8 p-4 bg-gray-900/50 border-l-2 border-blue-500 rounded-r-lg">
                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Author's Reason</div>
                                <p className="text-sm text-gray-300 italic">"{data.reason}"</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[9px] text-white font-bold">
                                        {data.author.substring(0,2).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">{data.author}</span>
                                </div>
                            </div>

                            <div className="font-sans text-base leading-relaxed whitespace-pre-wrap text-gray-300">
                                {diffs.map((part, idx) => (
                                    <span key={idx} className={
                                        part.type === 'added' ? 'bg-green-500/20 text-green-200 decoration-green-500/50 underline decoration-2 underline-offset-2 rounded px-0.5' :
                                        part.type === 'removed' ? 'bg-red-500/20 text-red-300 line-through decoration-red-500/50 opacity-60 rounded px-0.5 mx-0.5' :
                                        ''
                                    }>
                                        {part.value}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};
