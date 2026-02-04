"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CURRENT_USER } from '@/data/mockData';

interface CreateProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'draft' | 'config' | 'preview';
type Category = 'Treasury' | 'Technical' | 'Community' | 'Parameter';

const CATEGORIES: { id: Category; icon: string; desc: string }[] = [
    { id: 'Treasury', icon: 'account_balance', desc: 'Fund allocation & grants' },
    { id: 'Technical', icon: 'terminal', desc: 'Protocol upgrades & code' },
    { id: 'Community', icon: 'diversity_3', desc: 'Events & guidelines' },
    { id: 'Parameter', icon: 'tune', desc: 'System var adjustments' },
];

// --- HELPER: TOOLTIP ---
const GovTooltip = ({ text }: { text: string }) => (
    <div className="group/tip relative inline-block ml-1">
        <span className="material-symbols-outlined text-[14px] text-gray-500 cursor-help hover:text-purple-500 transition-colors">help</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl text-center">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-white dark:border-t-[#1A1D24]"></div>
        </div>
    </div>
);

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<Step>('draft');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('Treasury');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState<3 | 7 | 14>(3);
    const [isPublishing, setIsPublishing] = useState(false);

    // Hardcoded logic for demo
    // User Balance is ~145.23 in mockData. We set requirement to 100 to allow testing.
    const stakeRequired = 100;
    const currentBalance = CURRENT_USER.balance_g;
    const hasEnoughStake = currentBalance >= stakeRequired;

    if (!isOpen) return null;

    const handlePublish = () => {
        setIsPublishing(true);
        setTimeout(() => {
            setIsPublishing(false);
            onClose();
            // Reset form for next open
            setStep('draft');
            setTitle('');
            setDescription('');
            alert('Proposal KIP-X Published on Solana Devnet!');
        }, 2000);
    };

    // --- RENDERERS ---

    const renderStepper = () => (
        <div className="flex justify-center items-center gap-4 mb-8">
            {[
                { id: 'draft', label: '1. Draft Content' },
                { id: 'config', label: '2. Governance' },
                { id: 'preview', label: '3. Preview & Sign' }
            ].map((s, idx) => {
                const isActive = s.id === step;
                const isDone = (step === 'config' && idx === 0) || (step === 'preview' && idx <= 1);

                return (
                    <div key={s.id} className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isActive
                            ? 'bg-purple-100 dark:bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 shadow-md'
                            : isDone
                                ? 'bg-green-100 dark:bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-500'
                                : 'bg-transparent border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-600'
                            }`}>
                            {isDone ? (
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            ) : (
                                <span className={`text-xs font-mono font-bold ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-600'}`}>{idx + 1}</span>
                            )}
                            <span className="text-xs font-bold uppercase tracking-wider">{s.label.split('. ')[1]}</span>
                        </div>
                        {idx < 2 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-800"></div>}
                    </div>
                );
            })}
        </div>
    );

    const renderStepDraft = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Title */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Proposal Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., KIP-13: Allocate Budget for Hackathon"
                    className="w-full bg-gray-50 dark:bg-[#13161F] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-xl font-serif font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                    autoFocus
                />
            </div>

            {/* Category Grid */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === cat.id
                                ? 'bg-purple-100 dark:bg-purple-500/10 border-purple-500 text-purple-900 dark:text-white shadow-lg'
                                : 'bg-white dark:bg-[#13161F] border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-2xl ${category === cat.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>{cat.icon}</span>
                            <div className="text-center">
                                <div className="text-xs font-bold uppercase tracking-wider">{cat.id}</div>
                                <div className="text-[9px] text-gray-500 dark:text-gray-600 mt-0.5">{cat.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Markdown Editor */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (Markdown)</label>
                    <span className="text-[10px] text-gray-500">Supports **bold**, *italic*, [links]</span>
                </div>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your proposal in detail. Why should the DAO vote for this? Include timeline, budget, and impact."
                    className="w-full h-64 bg-gray-50 dark:bg-[#13161F] border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-sans text-gray-800 dark:text-gray-300 leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none custom-scrollbar"
                />
            </div>
        </div>
    );

    const renderStepConfig = () => (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
            {/* Stake Warning */}
            <div className={`bg-white dark:bg-[#13161F] border ${hasEnoughStake ? 'border-gray-200 dark:border-gray-800' : 'border-red-200 dark:border-red-900/50'} rounded-2xl p-6 flex items-center justify-between relative overflow-hidden transition-colors shadow-sm`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex gap-4 items-center z-10">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-500">lock</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Anti-Spam Stake</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                            To create a proposal, you must lock tokens. If passed, tokens are returned. If vetoed/spam, tokens are burned.
                        </p>
                    </div>
                </div>

                <div className="text-right z-10">
                    <div className="text-xs font-bold text-gray-500 uppercase">Required</div>
                    <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{stakeRequired} <span className="text-sm text-purple-500">G</span></div>
                    <div className={`text-[10px] font-bold mt-1 ${hasEnoughStake ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {hasEnoughStake ? 'Balance Sufficient' : `Insufficient (${currentBalance.toFixed(0)} G)`}
                    </div>
                </div>
            </div>

            {/* Voting Params */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Voting Duration <GovTooltip text="How long the voting window remains open. Longer durations allow for more deliberation." />
                    </label>
                    <div className="flex bg-gray-100 dark:bg-[#13161F] rounded-xl p-1 border border-gray-200 dark:border-gray-800">
                        {[3, 7, 14].map(d => (
                            <button
                                key={d}
                                onClick={() => setDuration(d as any)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${duration === d
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                    }`}
                            >
                                {d} Days
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Execution Delay <GovTooltip text="Time lock after a proposal passes before it can be executed on-chain." />
                    </label>
                    <div className="w-full bg-gray-50 dark:bg-[#13161F] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-400 text-sm font-mono flex justify-between items-center opacity-70 cursor-not-allowed">
                        <span>24 Hours</span>
                        <span className="material-symbols-outlined text-xs">lock</span>
                    </div>
                </div>
            </div>

            {/* Thresholds Info */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Governance Thresholds (System)</label>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-[#13161F] rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex justify-center items-center gap-1">
                            Quorum <GovTooltip text="Minimum % of total voting power required for the vote to be valid." />
                        </div>
                        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">4%</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-[#13161F] rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex justify-center items-center gap-1">
                            Pass Threshold <GovTooltip text="Percentage of 'Yes' votes required to pass (excluding abstentions)." />
                        </div>
                        <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">{'>'}50%</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-[#13161F] rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex justify-center items-center gap-1">
                            Veto Power <GovTooltip text="The Security Council can veto malicious proposals within the timelock." />
                        </div>
                        <div className="text-lg font-mono font-bold text-yellow-500">Active</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStepPreview = () => (
        <div className="flex flex-col lg:flex-row h-full gap-0 lg:gap-8 animate-fade-in">
            {/* Left: Summary Panel */}
            <div className="w-full lg:w-1/3 bg-gray-50 dark:bg-[#13161F] border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">On-Chain Transaction</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Network</span>
                            <span className="text-green-600 dark:text-green-400 font-mono font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Solana Devnet
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Program ID</span>
                            <span className="text-gray-700 dark:text-gray-300 font-mono text-xs">Gov...3f12</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Instruction</span>
                            <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">NewProposal()</span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800 w-full"></div>

                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Your Position</h3>
                    <div className="bg-white dark:bg-[#0B0E14] p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-500 font-bold text-xs">
                            {CURRENT_USER.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-900 dark:text-white font-bold">{CURRENT_USER.name}</div>
                            <div className="text-[10px] text-gray-500">{CURRENT_USER.handle}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500">Voting Power</div>
                            <div className="text-xs text-gray-900 dark:text-white font-mono font-bold">{CURRENT_USER.balance_g.toFixed(0)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Visual Preview */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0B0E14]">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Feed Preview</h3>

                {/* MOCK CARD PREVIEW */}
                <div className="bg-gray-50 dark:bg-[#0F1115] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 relative overflow-hidden group max-w-xl mx-auto shadow-lg">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-200 dark:border-purple-500/20`}>
                                {category}
                            </span>
                            <span className="text-xs font-mono text-gray-500">KIP-XX</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                by <span className="text-gray-900 dark:text-white">{CURRENT_USER.name}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-green-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Starts in 24h
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                            {title || "Untitled Proposal"}
                        </h2>
                        <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm whitespace-pre-wrap line-clamp-4">
                            {description || "No description provided."}
                        </div>
                    </div>

                    {/* Mock Progress */}
                    <div className="mb-6 p-4 bg-gray-100 dark:bg-[#161920] rounded-xl border border-gray-200 dark:border-gray-800 opacity-50">
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Consensus</div>
                            <div className="text-xs font-mono text-gray-400">0 VP Total</div>
                        </div>
                        <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-5xl bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F1115]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="material-symbols-outlined text-white text-sm">edit_document</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Proposal (KIP)</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-[#0B0E14]">
                    {renderStepper()}

                    <div className="max-w-4xl mx-auto">
                        {step === 'draft' && renderStepDraft()}
                        {step === 'config' && renderStepConfig()}
                        {step === 'preview' && renderStepPreview()}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F1115] flex justify-between items-center z-10">
                    <button
                        onClick={() => {
                            if (step === 'config') setStep('draft');
                            if (step === 'preview') setStep('config');
                        }}
                        disabled={step === 'draft'}
                        className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-0 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>

                    <div className="flex gap-3">
                        {step !== 'preview' ? (
                            <button
                                onClick={() => {
                                    if (step === 'draft') {
                                        if (!title || !description) return alert('Please fill in content');
                                        setStep('config');
                                    }
                                    else if (step === 'config') {
                                        // Validation is strict, but for demo we lowered stakeRequired
                                        if (!hasEnoughStake) return alert('Insufficient Stake');
                                        setStep('preview');
                                    }
                                }}
                                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-lg"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] flex items-center gap-2 transform hover:scale-105"
                            >
                                {isPublishing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Broadcasting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                                        PUBLISH ON-CHAIN
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
