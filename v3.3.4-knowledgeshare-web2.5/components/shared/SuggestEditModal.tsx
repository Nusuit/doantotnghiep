
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Post } from '../../types';

interface SuggestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  userBalance: number;
}

// --- HELPER: Simple Diff Algorithm ---
type DiffPart = { type: 'same' | 'added' | 'removed'; value: string };

const computeDiff = (oldText: string, newText: string): DiffPart[] => {
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    const diff: DiffPart[] = [];
    let i = 0; 
    let j = 0;

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

// --- SUB-COMPONENT: Economics Widget (Redesigned) ---
const EconomicsWidget = ({ requiredStake, potentialGainPoints, potentialGainKS, hasSufficientStake }: { 
    requiredStake: number, 
    potentialGainPoints: number, 
    potentialGainKS: number,
    hasSufficientStake: boolean 
}) => {
    return (
        <div className="bg-white dark:bg-[#0F1115] border border-gray-200 dark:border-gray-800 rounded-xl flex flex-col sm:flex-row overflow-visible relative shadow-xl">
            {/* Left: Risk / Stake */}
            <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 relative group">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Locked Stake</span>
                    {/* Tooltip Trigger Icon */}
                    <div className="relative">
                        <span className="material-symbols-outlined text-[16px] text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-help transition-colors">info</span>
                        
                        {/* TOOLTIP: Fixed Positioning & Z-Index */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[9999] translate-y-2 group-hover:translate-y-0">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
                                <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-yellow-500">lock</span>
                                    Smart Contract Escrow
                                </h4>
                            </div>
                            <div className="p-3 space-y-2">
                                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Your <b>{requiredStake} KNOW-U</b> will be locked in the contract.
                                </p>
                                <ul className="text-[10px] text-gray-500 space-y-1 ml-1">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        <span className="text-gray-600 dark:text-gray-300">Edit Accepted:</span> Stake Returned + Reward
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        <span className="text-gray-600 dark:text-gray-300">Edit Rejected:</span> Stake Burned (Slashing)
                                    </li>
                                </ul>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-white dark:border-t-gray-900"></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-mono font-bold ${hasSufficientStake ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                        {requiredStake}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-600">KNOW-U</span>
                </div>
                
                {!hasSufficientStake && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase tracking-wider animate-pulse">
                        <span className="material-symbols-outlined text-[12px]">warning</span> Insufficient Balance
                    </div>
                )}
            </div>

            {/* Right: Reward / Yield */}
            <div className="flex-1 p-4 relative overflow-hidden bg-gradient-to-br from-green-50 to-transparent dark:from-transparent dark:to-green-900/10">
                 {/* Decor */}
                 <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/10 dark:bg-green-500/20 blur-xl rounded-full pointer-events-none"></div>

                 <div className="flex justify-between items-start mb-1 relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">Projected Yield</span>
                 </div>

                 <div className="flex flex-col relative z-10">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">+{potentialGainPoints}</span>
                        <span className="text-xs font-bold text-gray-500">KNOW-U</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 font-mono">
                            +{potentialGainKS} KS Reputation
                        </span>
                    </div>
                 </div>
            </div>
        </div>
    );
};

// --- MAIN MODAL COMPONENT ---
export const SuggestEditModal: React.FC<SuggestEditModalProps> = ({ isOpen, onClose, post, userBalance }) => {
    const [editContent, setEditContent] = useState(post.content);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editReason, setEditReason] = useState('');
    const [editorMode, setEditorMode] = useState<'write' | 'diff' | 'preview'>('write');

    // Calculations
    const requiredStake = useMemo(() => post.knowledgeValue * 10, [post.knowledgeValue]);
    const hasSufficientStake = userBalance >= requiredStake;
    const potentialGainPoints = useMemo(() => Math.floor(requiredStake * 0.5), [requiredStake]);
    const potentialGainKS = useMemo(() => Math.floor(post.knowledgeValue * 0.05), [post.knowledgeValue]);

    if (!isOpen) return null;

    const renderDiff = () => {
        // Concatenate Title and Content for a full diff view
        const oldFull = `${post.title}\n\n${post.content}`;
        const newFull = `${editTitle}\n\n${editContent}`;
        const diffs = computeDiff(oldFull, newFull);
        
        return (
            <div className="font-sans text-lg leading-relaxed whitespace-pre-wrap">
                {diffs.map((part, idx) => (
                    <span key={idx} className={
                        part.type === 'added' ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 font-medium px-0.5 rounded border-b-2 border-green-500' :
                        part.type === 'removed' ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 line-through opacity-60 px-0.5 mx-0.5' :
                        'text-gray-400 dark:text-gray-500'
                    }>
                        {part.value}{' '}
                    </span>
                ))}
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-[#0B0E14] text-gray-900 dark:text-white flex flex-col animate-fade-in">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-[#0B0E14] z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">Suggesting Edit</h2>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-md">{post.title}</h1>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Current KV</span>
                    <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{post.knowledgeValue}</span>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Original (Read Only) */}
                <div className="w-1/2 bg-gray-50 dark:bg-[#050608] border-r border-gray-200 dark:border-gray-800 p-8 overflow-y-auto custom-scrollbar hidden md:block">
                    <div className="max-w-2xl mx-auto opacity-60 select-none hover:opacity-100 transition-opacity">
                        
                        {/* Original Title Display */}
                        <div className="mb-8">
                             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                                <span>Original Title</span>
                                <span className="material-symbols-outlined text-sm">lock</span>
                            </h3>
                            <h2 className="text-2xl font-serif font-bold text-gray-400 leading-tight">
                                {post.title}
                            </h2>
                        </div>

                        {/* Original Content Display */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                                <span>Original Content</span>
                                <span className="material-symbols-outlined text-sm">lock</span>
                            </h3>
                            <p className="font-sans text-lg leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{post.content}</p>
                        </div>
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="w-full md:w-1/2 bg-white dark:bg-[#0B0E14] flex flex-col relative">
                    
                    {/* 1. Top Bar: Focus Label & View Modes */}
                    <div className="flex justify-between items-center px-8 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14]">
                        <h3 className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Focus Editor
                        </h3>
                        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
                            <button onClick={() => setEditorMode('write')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${editorMode === 'write' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>Write</button>
                            <button onClick={() => setEditorMode('diff')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${editorMode === 'diff' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>Diff</button>
                            <button onClick={() => setEditorMode('preview')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${editorMode === 'preview' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>Preview</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div className="max-w-2xl mx-auto h-full flex flex-col">

                            {editorMode === 'write' ? (
                                <>
                                    {/* 2. New Title Input */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            New Title
                                        </label>
                                        <input 
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-transparent text-2xl font-serif font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 focus:border-green-500 outline-none pb-2 transition-colors placeholder-gray-300 dark:placeholder-gray-700"
                                            placeholder="Enter article title..."
                                        />
                                    </div>

                                    {/* 3. Rich Text Toolbar */}
                                    <div className="flex items-center gap-1 mb-4 py-2 border-b border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500">
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-gray-900 dark:hover:text-white transition-colors" title="Bold"><span className="material-symbols-outlined text-lg">format_bold</span></button>
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-gray-900 dark:hover:text-white transition-colors" title="Italic"><span className="material-symbols-outlined text-lg">format_italic</span></button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-gray-900 dark:hover:text-white transition-colors" title="Heading"><span className="material-symbols-outlined text-lg">title</span></button>
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-gray-900 dark:hover:text-white transition-colors" title="Quote"><span className="material-symbols-outlined text-lg">format_quote</span></button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-gray-900 dark:hover:text-white transition-colors" title="Bullet List"><span className="material-symbols-outlined text-lg">format_list_bulleted</span></button>
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-gray-900 dark:hover:text-white transition-colors" title="Numbered List"><span className="material-symbols-outlined text-lg">format_list_numbered</span></button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded hover:text-gray-900 dark:hover:text-white transition-colors" title="Link"><span className="material-symbols-outlined text-lg">link</span></button>
                                    </div>

                                    {/* 4. Body Content Input */}
                                    <textarea 
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="flex-1 w-full bg-transparent resize-none outline-none font-sans text-lg leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-700 min-h-[300px]"
                                        placeholder="Start editing content..."
                                    />
                                </>
                            ) : editorMode === 'diff' ? (
                                <div className="flex-1 w-full overflow-y-auto">
                                    <div className="mb-4 text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-800">
                                        <span className="text-green-600 dark:text-green-400 font-bold">+ Added</span> <span className="mx-2">|</span> <span className="text-red-600 dark:text-red-400 line-through">Removed</span>
                                    </div>
                                    {renderDiff()}
                                </div>
                            ) : (
                                <div className="flex-1 w-full overflow-y-auto">
                                    <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4">{editTitle}</h1>
                                    <div className="prose prose-lg dark:prose-invert max-w-none">
                                        <p className="font-sans text-lg leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{editContent}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Economics Bar */}
            <div className="h-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] p-6 z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-end">
                    
                    {/* Summary Input */}
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Reason for Change <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text"
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                            placeholder="e.g. Corrected consensus mechanism description..."
                        />
                    </div>

                    {/* Economics Widget */}
                    <div className="w-full lg:w-auto min-w-[340px]">
                        <EconomicsWidget 
                            requiredStake={requiredStake}
                            potentialGainPoints={potentialGainPoints}
                            potentialGainKS={potentialGainKS}
                            hasSufficientStake={hasSufficientStake}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full lg:w-auto h-[78px] items-end pb-1">
                        <button 
                            onClick={onClose}
                            className="px-6 py-3 h-[50px] border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 font-bold text-sm rounded-xl transition-colors"
                        >
                            Discard
                        </button>
                        <button 
                            disabled={!editReason || (editContent === post.content && editTitle === post.title) || !hasSufficientStake}
                            className="px-8 py-3 h-[50px] bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-sm text-gray-400 dark:text-gray-600">lock</span>
                            Submit & Stake
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
