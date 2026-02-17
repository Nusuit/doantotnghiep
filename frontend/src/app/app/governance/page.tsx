"use client";

import React, { useState } from 'react';
import { CURRENT_USER, RICH_PROPOSALS, TOP_DELEGATES } from '@/data/mockData';
import { CreateProposalModal } from '@/components/governance/CreateProposalModal';

// Reusable Tooltip Component
const InfoTooltip = ({ title, content }: { title?: string, content: string }) => (
    <div className="group/tip relative inline-block text-left">
        <span className="material-symbols-outlined text-[14px] text-gray-400 cursor-help hover:text-white transition-colors">help</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-[#1A1D24] border border-gray-700 rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] opacity-0 group-hover/tip:opacity-100 transition-all duration-200 pointer-events-none z-50 text-center transform translate-y-2 group-hover/tip:translate-y-0">
            {title && <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-1 border-b border-gray-700 pb-1">{title}</div>}
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{content}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-[#1A1D24]"></div>
        </div>
    </div>
);

export default function GovernancePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());

    const filteredProposals = RICH_PROPOSALS.filter(p => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.author.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            p.type.toLowerCase().includes(query)
        );
    });

    const handleVote = (id: string) => {
        const newSet = new Set(votedProposals);
        newSet.add(id);
        setVotedProposals(newSet);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">

            {/* 1. HEADER & MACRO STATS */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Governance Console</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl text-lg">
                            Participate in the decentralized decision-making of the Knowledge Protocol.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white dark:bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-gray-200 transition-colors"
                    >
                        <span className="material-symbols-outlined">add</span> New Proposal
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Ecosystem Staked */}
                    <div className="group bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 p-6 rounded-2xl relative overflow-visible">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-colors pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 cursor-help w-fit">
                                <span className="material-symbols-outlined text-purple-500">token</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-dashed border-gray-600">Ecosystem Staked</span>
                                <InfoTooltip title="TVL Governance" content="Total KNOW-G tokens currently locked in voting contracts across the entire network." />
                            </div>
                            <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">4,200,500 <span className="text-sm text-gray-500">G</span></div>
                            <div className="mt-2 text-xs text-green-500 flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-xs">trending_up</span> +5.2% this epoch
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Active Proposals */}
                    <div className="group bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 p-6 rounded-2xl relative overflow-visible">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 cursor-help w-fit">
                                <span className="material-symbols-outlined text-blue-500">how_to_vote</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-dashed border-gray-600">Active Proposals</span>
                                <InfoTooltip title="Epoch 42" content="Proposals currently in the voting period. Votes cast now are locked until the epoch ends." />
                            </div>
                            <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">3 <span className="text-sm text-gray-500">Live</span></div>
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                Next epoch closes in <span className="text-gray-900 dark:text-white font-bold">14h 20m</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Voting Influence */}
                    <div className="group bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 p-6 rounded-2xl relative overflow-visible">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/10 transition-colors pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 cursor-help w-fit">
                                <span className="material-symbols-outlined text-yellow-500">shield_person</span>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-dashed border-gray-600">Your Influence</span>
                                <InfoTooltip title="Voting Power" content="Your calculated weight in governance. Includes Personal Stake + Delegated Tokens x Activity Multiplier." />
                            </div>
                            <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">{CURRENT_USER.balance_g.toFixed(0)} <span className="text-sm text-gray-500">VP</span></div>
                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                <span className="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold">Top 12%</span> Network Share
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* --- LEFT: PROPOSAL FEED --- */}
                <div className="lg:col-span-3 space-y-6">

                    {filteredProposals.map((prop) => {
                        const hasVoted = votedProposals.has(prop.id);
                        return (
                            <div key={prop.id} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-300 shadow-sm relative overflow-visible group">

                                {/* Header: Metadata */}
                                <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${prop.type === 'Treasury' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            prop.type === 'Protocol' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                            }`}>
                                            {prop.type}
                                        </span>
                                        <span className="text-xs font-mono text-gray-500">{prop.id}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            by <span className="text-gray-900 dark:text-white hover:underline cursor-pointer">{prop.author}</span>
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 text-sm font-bold ${prop.status === 'Active' ? 'text-green-500' :
                                        prop.status === 'Passed' ? 'text-green-500' : 'text-gray-500'
                                        }`}>
                                        {prop.status === 'Active' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                                        {prop.status === 'Active' ? `Ends in ${prop.endDate}` : prop.status}
                                    </div>
                                </div>

                                {/* Body: Content */}
                                <div className="mb-8">
                                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3 leading-tight transition-colors">
                                        {prop.title}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {prop.description}
                                    </p>
                                    <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-blue-500 hover:text-blue-400 mt-2">
                                        Read Full Proposal <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    </a>
                                </div>

                                {/* Consensus Visualization */}
                                <div className="mb-8 p-4 bg-gray-50 dark:bg-[#161920] rounded-xl border border-gray-200 dark:border-gray-800">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Consensus</div>
                                        <div className="text-xs font-mono text-gray-400">{prop.totalVotes.toLocaleString()} VP Total</div>
                                    </div>

                                    {/* The Bar */}
                                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex relative group/bar">
                                        {/* Yes Segment - Pale Green */}
                                        <div className="h-full bg-green-500/60 dark:bg-green-500/50" style={{ width: `${prop.votes.yes}%` }}></div>
                                        {/* No Segment */}
                                        <div className="h-full bg-gray-500" style={{ width: `${prop.votes.no}%` }}></div>
                                        {/* Abstain Segment */}
                                        <div className="h-full bg-gray-300 dark:bg-white/20" style={{ width: `${prop.votes.abstain}%` }}></div>

                                        {/* Quorum Marker */}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-white border-x border-black/20 z-10 cursor-help"
                                            style={{ left: `${prop.quorum}%` }}
                                        >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                                                Quorum: {prop.quorum}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs font-mono">
                                        {/* Pale Green Text */}
                                        <span className="text-green-600 dark:text-green-400 font-bold">YES {prop.votes.yes}%</span>
                                        <span className="text-gray-500 dark:text-gray-300">ABSTAIN {prop.votes.abstain}%</span>
                                        <span className="text-gray-500">NO {prop.votes.no}%</span>
                                    </div>
                                </div>

                                {/* Footer: Actions & Provenance */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    {/* Actions */}
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        {prop.status === 'Active' ? (
                                            <>
                                                {/* Vote Yes - Pale by default, Bright if Voted */}
                                                <button
                                                    onClick={() => handleVote(prop.id)}
                                                    disabled={hasVoted}
                                                    className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${hasVoted
                                                        ? 'bg-green-600 text-white shadow-green-500/20'
                                                        : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20'
                                                        }`}
                                                >
                                                    {hasVoted ? 'Voted' : 'Vote Yes'}
                                                </button>
                                                <button className="flex-1 sm:flex-none px-6 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm transition-colors">
                                                    Vote No
                                                </button>
                                                <button className="px-4 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold transition-colors">
                                                    Abstain
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-sm font-bold text-gray-500 italic">
                                                Voting Closed
                                            </div>
                                        )}
                                    </div>

                                    {/* Provenance Tooltip */}
                                    <div className="group/provenance relative">
                                        <div className="flex items-center gap-3 text-xs font-mono text-gray-400 cursor-help hover:text-white transition-colors bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-600">
                                            <span className="material-symbols-outlined text-sm text-gray-500 group-hover/provenance:text-green-400">verified_user</span>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">storage</span>
                                                <span className="material-symbols-outlined text-[14px]">token</span>
                                            </div>
                                            <span>Verify On-Chain</span>
                                        </div>

                                        {/* Tooltip Content */}
                                        <div className="absolute bottom-full right-0 mb-3 w-64 bg-[#1A1D24] border border-gray-700 p-4 rounded-xl shadow-2xl opacity-0 group-hover/provenance:opacity-100 transition-all duration-200 pointer-events-none z-50 transform translate-y-2 group-hover/provenance:translate-y-0">
                                            <div className="text-[10px] uppercase font-bold text-gray-500 mb-3 border-b border-gray-700 pb-2">Immutable Record</div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm text-gray-400">storage</span>
                                                        <span className="text-xs text-gray-300 font-bold">Arweave</span>
                                                    </div>
                                                    <a href="#" className="text-[10px] font-mono text-blue-400 hover:underline">{prop.arweaveTx.substring(0, 8)}...</a>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm text-gray-400">token</span>
                                                        <span className="text-xs text-gray-300 font-bold">Solana</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-purple-400">Slot #{prop.solanaSlot}</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-gray-700 text-[9px] text-gray-500 text-center italic">
                                                Cryptographically verified state
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full right-6 -mt-[1px] border-4 border-transparent border-t-[#1A1D24]"></div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}

                </div>

                {/* --- RIGHT: SIDEBAR --- */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Search Bar */}
                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">search</span>
                            Search Proposals
                        </h3>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Title, author, type..."
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <div className="mt-2 px-2 text-xs text-gray-500">
                                {filteredProposals.length} result{filteredProposals.length !== 1 ? 's' : ''} found
                            </div>
                        )}
                    </div>

                    {/* Top Delegates */}
                    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">diversity_3</span>
                            Top Delegates
                        </h3>
                        <div className="space-y-4">
                            {TOP_DELEGATES.map((delegate, idx) => (
                                <div key={idx} className="flex items-center justify-between px-2 group relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {delegate.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1 cursor-help">
                                                {delegate.name}
                                                {delegate.trust > 95 && <span className="material-symbols-outlined text-[10px] text-green-500">verified</span>}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono">{delegate.power} VP</div>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold text-blue-500 hover:bg-blue-500/10 px-2 py-1 rounded transition-colors">
                                        Delegate
                                    </button>

                                    {/* Delegate Tooltip */}
                                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/90 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                        Trust Score: <span className="text-green-400 font-bold">{delegate.trust}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-300 border-t border-gray-800 transition-colors">
                            View All Delegates
                        </button>
                    </div>

                    {/* Resources Link */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-white mb-2">Governance Docs</h4>
                        <p className="text-xs text-gray-400 mb-3">Learn how voting power is calculated and the quorum requirements.</p>
                        <a href="#" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                            Read Documentation <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                </div>
            </div>

            {/* --- CREATE MODAL --- */}
            <CreateProposalModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </div>
    );
};
