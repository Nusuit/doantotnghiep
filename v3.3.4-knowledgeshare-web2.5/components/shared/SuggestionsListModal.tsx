import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Post } from '../../types';

interface SuggestionsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

// --- MOCK DATA FOR SUGGESTIONS ---
interface Suggestion {
    id: string;
    author: string;
    ksRank: string;
    timestamp: string;
    stake: number;
    reason: string;
    votesFor: number;
    votesAgainst: number;
    newTitle?: string;
    newContent?: string;
}

const MOCK_SUGGESTIONS: Suggestion[] = [
    {
        id: 's1',
        author: 'Dr. Sarah Chen',
        ksRank: 'Gold Peer',
        timestamp: '2h ago',
        stake: 500,
        reason: 'Corrected the technical explanation regarding Sealevel\'s optimistic concurrency control. The previous description conflated it with locking mechanisms.',
        votesFor: 45,
        votesAgainst: 2,
        newContent: "Unlike EVM's single-threaded model, Solana's Sealevel runtime enables parallel processing of smart contracts. By describing all states a transaction will read or write, Sealevel can schedule non-overlapping transactions concurrently. This optimistic concurrency model ensures high throughput without traditional locking overhead."
    },
    {
        id: 's2',
        author: 'Anon_99',
        ksRank: 'Contributor',
        timestamp: '5h ago',
        stake: 120,
        reason: 'Fixed several grammatical errors and improved readability in the second paragraph.',
        votesFor: 12,
        votesAgainst: 15
    },
    {
        id: 's3',
        author: 'Marcus Graph',
        ksRank: 'Validator',
        timestamp: '1d ago',
        stake: 1200,
        reason: 'Expanded the section on Moore\'s Law to include recent hardware benchmarks provided by the Solana Foundation.',
        votesFor: 89,
        votesAgainst: 4
    }
];

// --- DIFF HELPER (Reused logic for visual consistency) ---
type DiffPart = { type: 'same' | 'added' | 'removed'; value: string };
const computeDiff = (oldText: string, newText: string): DiffPart[] => {
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    const diff: DiffPart[] = [];
    let i = 0; let j = 0;
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
        } else { i++; j++; }
    }
    return diff;
};

export const SuggestionsListModal: React.FC<SuggestionsListModalProps> = ({ isOpen, onClose, post }) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    // Handle Reject/Approve Actions
    const handleAction = (type: 'reject' | 'approve') => {
        setIsSubmitting(true);
        // Simulate Network Request
        setTimeout(() => {
            setIsSubmitting(false);
            if (type === 'reject') {
                alert(`Suggestion by ${selectedSuggestion?.author} rejected. Stake slashed.`);
            } else {
                alert(`Suggestion by ${selectedSuggestion?.author} merged successfully! Content updated.`);
            }
            setSelectedSuggestion(null);
        }, 800);
    };

    // --- SUB-VIEW: REVIEW DIFF ---
    if (selectedSuggestion) {
        const diff = selectedSuggestion.newContent 
            ? computeDiff(post.content, selectedSuggestion.newContent)
            : computeDiff(post.content, post.content); // Fallback if only title changed

        return createPortal(
            <div className="fixed inset-0 z-[10002] bg-[#0B0E14] text-white flex flex-col animate-fade-in">
                 {/* Header */}
                 <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0B0E14] z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedSuggestion(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                            <span className="text-sm font-bold uppercase tracking-wider">Back to List</span>
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleAction('reject')}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-900/20 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                            Reject
                        </button>
                        <button 
                            onClick={() => handleAction('approve')}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                            Approve Merge
                        </button>
                    </div>
                </div>

                {/* Diff Viewer */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-4xl mx-auto w-full">
                    <div className="mb-6 bg-gray-900 border border-gray-800 p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                {selectedSuggestion.author.substring(0,2).toUpperCase()}
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-white">{selectedSuggestion.author}</div>
                                 <div className="text-xs text-gray-500">Proposed Change • {selectedSuggestion.timestamp}</div>
                             </div>
                        </div>
                        <p className="text-sm text-gray-300 italic">"{selectedSuggestion.reason}"</p>
                    </div>

                    <div className="font-sans text-lg leading-relaxed whitespace-pre-wrap">
                        {diff.map((part, idx) => (
                            <span key={idx} className={
                                part.type === 'added' ? 'text-green-400 bg-green-900/30 font-medium px-0.5 rounded border-b-2 border-green-500' :
                                part.type === 'removed' ? 'text-red-400 bg-red-900/20 line-through opacity-60 px-0.5 mx-0.5' :
                                'text-gray-400'
                            }>
                                {part.value}{' '}
                            </span>
                        ))}
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // --- MAIN VIEW: LIST ---
    return createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-white/60 dark:bg-[#050608]/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B0E14] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0B0E14] z-10">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">ballot</span>
                            Pending Suggestions
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                            <span>Base KV:</span>
                            <span className="text-green-500 font-bold">{post.knowledgeValue}</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white truncate">
                        {post.title}
                    </h2>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {MOCK_SUGGESTIONS.map((suggestion) => {
                        const totalVotes = suggestion.votesFor + suggestion.votesAgainst;
                        const approvalRate = totalVotes > 0 ? (suggestion.votesFor / totalVotes) * 100 : 0;

                        return (
                            <div key={suggestion.id} className="bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all group">
                                
                                {/* Top Row: Contributor & Stake */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {suggestion.author.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{suggestion.author}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                    suggestion.ksRank.includes('Gold') 
                                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 border-transparent'
                                                }`}>
                                                    {suggestion.ksRank}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400">{suggestion.timestamp}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Economic Info */}
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-gray-900 dark:text-white">
                                            <span className="material-symbols-outlined text-[14px] text-gray-400">lock</span>
                                            {suggestion.stake} KNOW-U
                                        </div>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Staked</span>
                                    </div>
                                </div>

                                {/* Middle: Reason Summary */}
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                                    {suggestion.reason}
                                </p>

                                {/* Bottom: Gauge & Action */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700/50">
                                    {/* Mini Gauge */}
                                    <div className="flex flex-col gap-1 w-32">
                                        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                                            <span className="text-green-500">{suggestion.votesFor}</span>
                                            <span className="text-red-500">{suggestion.votesAgainst}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-green-500" style={{ width: `${approvalRate}%` }}></div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedSuggestion(suggestion)}
                                        className="text-xs font-bold text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">difference</span>
                                        Review Diff
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0B0E14] flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};