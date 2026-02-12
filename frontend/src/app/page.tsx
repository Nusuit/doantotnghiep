"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { EarthScene } from '@/components/3d/EarthScene';
import { Reveal } from '@/components/ui/reveal';
import { TiltCard } from '@/components/ui/tilt-card';
import { LiveTicker } from '@/components/ui/live-ticker';
import { StepIcon3D } from '@/components/ui/step-icon-3d';
import { TopicVisual, EntityVisual, PlaceVisual } from '@/components/landing/Visuals';

// --- DATA ---
const steps = [
  {
    id: 1,
    title: "Contribute & Verify",
    desc: "Post knowledge or validate content (Off-chain action).",
    icon: "edit_document",
    color: "blue" as const,
    glowColor: "bg-blue-500/20",
  },
  {
    id: 2,
    title: "Earn Reputation",
    desc: "Accumulate KNOW-U points and increase Knowledge Score.",
    icon: "bar_chart",
    color: "green" as const,
    glowColor: "bg-green-500/20",
  },
  {
    id: 3,
    title: "Climb the Ranks",
    desc: "Top contributors on the Leaderboard qualify for rewards.",
    icon: "trophy",
    color: "yellow" as const,
    glowColor: "bg-yellow-500/20",
  },
  {
    id: 4,
    title: "Receive Ownership",
    desc: "System auto-distributes KNOW-G (Solana) to your Wallet.",
    icon: "account_balance_wallet",
    color: "purple" as const,
    glowColor: "bg-purple-500/20",
  }
];

const leaderboardPreview = [
  {
    rank: 1,
    name: 'Alisa Hester',
    handle: '@alisa_h',
    score: 10450,
    reward: '1000 KNOW-G',
    badge: 'Professor',
    style: 'border-yellow-500/60 bg-yellow-500/10 z-20',
    iconColor: 'text-yellow-500',
    rankIcon: 'emoji_events',
    glowColor: 'bg-yellow-500/60'
  },
  {
    rank: 2,
    name: 'Robert Fox',
    handle: '@robert_f',
    score: 4320,
    reward: '750 KNOW-G',
    badge: 'Doctor',
    style: 'border-slate-400/50 bg-slate-400/10 z-10',
    iconColor: 'text-slate-400 dark:text-slate-300',
    rankIcon: 'emoji_events',
    glowColor: 'bg-slate-400/50'
  },
  {
    rank: 3,
    name: 'Jane Cooper',
    handle: '@jane_c',
    score: 1580,
    reward: '500 KNOW-G',
    badge: 'Expert',
    style: 'border-orange-700/50 bg-orange-700/10 z-10',
    iconColor: 'text-orange-700 dark:text-orange-500',
    rankIcon: 'emoji_events',
    glowColor: 'bg-orange-700/50'
  },
  {
    rank: 4,
    name: 'David Kim',
    handle: '@david_k',
    score: 950,
    reward: '100 KNOW-G',
    badge: 'Scholar',
    style: 'border-blue-500/20 bg-blue-500/5',
    iconColor: 'text-blue-500',
    rankIcon: 'leaderboard',
    glowColor: 'bg-blue-500/20'
  },
  {
    rank: 5,
    name: 'Emily White',
    handle: '@emily_w',
    score: 210,
    reward: '10 KNOW-G',
    badge: 'Contributor',
    style: 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface',
    iconColor: 'text-gray-500',
    rankIcon: 'leaderboard',
    glowColor: 'bg-gray-500/20'
  },
];

const governanceProposals = [
  {
    id: 'KIP-12',
    title: 'Allocate 10,000 KNOW-G for Content Creators Fund',
    description: 'Establish a monthly grant pool for high-impact technical writers.',
    status: 'Voting Active',
    statusColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    votesYes: 65,
    votesNo: 35,
    timeLeft: '2 days left',
    category: 'Treasury',
    icon: 'account_balance'
  },
  {
    id: 'KIP-11',
    title: 'Update Knowledge Score Algorithm v2.0',
    description: 'Refine the weighting of citations and peer reviews in KS calculation.',
    status: 'Passed',
    statusColor: 'text-green-400 bg-green-400/10 border-green-400/20',
    votesYes: 88,
    votesNo: 12,
    timeLeft: 'Ended Oct 24',
    category: 'Protocol',
    icon: 'tune'
  }
];

export default function Landing() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white flex flex-col overflow-x-hidden font-sans transition-colors duration-300">

      {/* 1. UPGRADED STICKY HEADER */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-xl bg-white/70 dark:bg-dark-bg/80 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* CHANGED: KS Logo to Blue Gradient */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">KS</div>
            <span className="font-bold text-xl hidden sm:block tracking-tight">KnowledgeShare</span>
          </div>

          {/* Centered Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <button onClick={() => scrollToId('explore')} className="hover:text-blue-500 transition-colors">Explore</button>
            <button onClick={() => scrollToId('governance')} className="hover:text-blue-500 transition-colors">DAO Governance</button>
            <button onClick={() => scrollToId('leaderboard')} className="hover:text-blue-500 transition-colors">Leaderboard</button>
            <button onClick={() => scrollToId('economy')} className="hover:text-blue-500 transition-colors">Economy</button>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth" className="hidden sm:block text-sm font-semibold hover:text-blue-500 transition-colors">Login</Link>
            {/* UPDATED: Get Started Button to Blue Gradient */}
            <Link href="/auth" className="px-6 py-2.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION UPGRADE */}
      <div id="explore" className="relative pt-40 pb-20 px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[90vh]">

        {/* Left: Text Content */}
        <div className="z-10 flex flex-col items-start text-left animate-fade-in-up">
          {/* Badge color Blue */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-300 px-4 py-1.5 rounded-full mb-6 font-bold text-xs border border-blue-500/20 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            The Single Source of Truth on Permaweb
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Combat Info Pollution, <br />
            {/* Text gradient Blue/Cyan */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 drop-shadow-sm">Own Your Value.</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
            A decentralized knowledge sharing platform solving the trust crisis.
            Accumulate <b>KNOW-U</b> points to prove quality, receive <b>KNOW-G</b> tokens from the DAO Treasury.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
            {/* Button gradient Blue */}
            <Link href="/auth" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25">
              Start Earning
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </Link>
            <button onClick={() => scrollToId('pillars')} className="flex-1 sm:flex-none px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Learn More
            </button>
          </div>

          {/* Partner Logos (Grayscale) */}
          <div className="flex flex-wrap items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">bolt</span>
              <span className="font-bold text-sm">Powered by Solana</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">storage</span>
              <span className="font-bold text-sm">Stored on Arweave</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">psychology</span>
              <span className="font-bold text-sm">Verified by AI</span>
            </div>
          </div>
        </div>

        {/* Right: 3D Earth Globe */}
        <div className="relative h-[500px] lg:h-[700px] w-full flex items-center justify-center order-first lg:order-last">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-[100px] -z-10 transform scale-75 animate-float"></div>
          <div className="w-full h-full">
            <EarthScene />
          </div>
        </div>
      </div>

      {/* 3. KNOWLEDGE PILLARS SECTION (ENHANCED) */}
      <div id="pillars" className="py-28 px-6 relative bg-gradient-to-b from-white to-gray-50 dark:from-[#0F1116] dark:to-[#050608]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 relative z-10">
            <span className="text-blue-500 font-bold tracking-widest uppercase text-sm mb-3 block">Structured Knowledge Graph</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">Knowledge Pillars</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              We organize chaos into three immutable primitives. Every piece of information finds its home here.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">

            {/* PILLAR 1: TOPIC */}
            <TiltCard>
              <div className="group relative bg-white/60 dark:bg-[#161920]/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2rem] p-8 h-full overflow-hidden transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_50px_-10px_rgba(34,211,238,0.2)]">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] group-hover:bg-cyan-500/30 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col items-center text-center h-full">
                  <div className="mb-8 scale-110 group-hover:scale-125 transition-transform duration-700">
                    <TopicVisual />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600">TOPIC</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                    Abstract Concepts, Scientific Theories, and General Subjects. The connective tissue of the graph.
                  </p>

                  <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span> Network Node
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* PILLAR 2: ENTITY */}
            <TiltCard className="md:-mt-8 md:mb-8">
              <div className="group relative bg-white/60 dark:bg-[#161920]/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2rem] p-8 h-full overflow-hidden transition-all duration-500 hover:border-purple-500/30 hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)]">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] group-hover:bg-purple-500/30 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col items-center text-center h-full">
                  <div className="mb-8 scale-110 group-hover:scale-125 transition-transform duration-700">
                    <EntityVisual />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600">ENTITY</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                    Books, Creative Works, Movies, and Objects. Distinct items with verified creators and metadata.
                  </p>

                  <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span> Unique ID
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* PILLAR 3: PLACE */}
            <TiltCard>
              <div className="group relative bg-white/60 dark:bg-[#161920]/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2rem] p-8 h-full overflow-hidden transition-all duration-500 hover:border-emerald-500/30 hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)]">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/30 transition-all duration-700"></div>

                <div className="relative z-10 flex flex-col items-center text-center h-full">
                  <div className="mb-8 scale-110 group-hover:scale-125 transition-transform duration-700">
                    <PlaceVisual />
                  </div>
                  <h3 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-green-600">PLACE</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                    Physical Locations, Landmarks, and Venues. Anchored to coordinates on the map.
                  </p>

                  <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Geo-Spatial
                  </div>
                </div>
              </div>
            </TiltCard>

          </div>
        </div>
      </div>

      {/* 4. The Dual-Token Economy - WITH TILT EFFECTS */}
      <div id="economy" className="bg-white dark:bg-[#0B0E14] py-24 px-6 relative overflow-hidden border-t border-gray-200 dark:border-gray-800">
        {/* Background Ambient Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">
              The Dual-Token Economy
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              A sustainable loop separating <span className="text-cyan-600 dark:text-cyan-400 font-bold">Utility</span> (High Velocity) from <span className="text-purple-600 dark:text-purple-400 font-bold">Governance</span> (Store of Value).
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Card 1: KNOW-U */}
            <TiltCard>
              <div className="relative group p-8 rounded-[2rem] bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(34,211,238,0.3)] h-full">
                <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-200 dark:border-cyan-500/20">
                  <span className="material-symbols-outlined text-4xl text-cyan-600 dark:text-cyan-400">bolt</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">KNOW-U</h3>
                <p className="text-cyan-600 dark:text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4">Off-Chain Utility</p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  High velocity points for daily actions. Inflation controlled via "Mint & Burn". Fuel for the ecosystem.
                </p>
              </div>
            </TiltCard>

            {/* Card 2: KNOW-G (Center - Larger) */}
            <TiltCard className="md:-mt-8 md:mb-8 z-10">
              <div className="relative group p-10 rounded-[2.5rem] bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/40 dark:to-black/40 backdrop-blur-xl border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_60px_-10px_rgba(168,85,247,0.4)] h-full">
                <div className="absolute inset-0 bg-purple-500/5 rounded-[2.5rem] group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30">
                    <span className="material-symbols-outlined text-5xl text-white">token</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">KNOW-G</h3>
                  <p className="text-amber-600 dark:text-amber-400 text-sm font-bold uppercase tracking-wider mb-6">Solana Governance</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    Scare governance token. Distributed by the <b>Worker Service</b> from the DAO Treasury. Represents true ownership.
                  </p>
                </div>
              </div>
            </TiltCard>

            {/* Card 3: Arweave */}
            <TiltCard>
              <div className="relative group p-8 rounded-[2rem] bg-gray-50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-400/50 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.1)] h-full">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-500/10 flex items-center justify-center mb-6 border border-gray-300 dark:border-gray-500/20">
                  <span className="material-symbols-outlined text-4xl text-gray-700 dark:text-gray-300">storage</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Arweave</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">The Foundation</p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Permanent, decentralized storage. Your intellectual property is stored on the Permaweb forever.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* 5. How It Works Section (The Loop) - NO SCROLL REVEAL & 3D ICONS */}
      <div className="py-24 px-6 bg-gray-50 dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The Earning Loop: From contributing knowledge to owning the platform.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">

            {/* 1. Base Connecting Line (Inactive Gray) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-1 bg-gray-200 dark:bg-gray-800 rounded-full -z-0"></div>

            {/* 2. Active Connecting Line (Glows on Hover) */}
            <div
              className={`hidden md:block absolute top-12 left-[12%] right-[12%] h-1 rounded-full -z-0 transition-all duration-500 ${hoveredStep !== null ? 'opacity-100' : 'opacity-0'}`}
              style={{
                background: hoveredStep !== null
                  ? `linear-gradient(90deg, transparent, ${hoveredStep === 0 ? '#3B82F6' : // Blue
                    hoveredStep === 1 ? '#22C55E' : // Green
                      hoveredStep === 2 ? '#EAB308' : // Yellow
                        '#A855F7' // Purple
                  }, transparent)`
                  : 'transparent',
                boxShadow: hoveredStep !== null
                  ? `0 0 15px 2px ${hoveredStep === 0 ? 'rgba(59,130,246,0.5)' :
                    hoveredStep === 1 ? 'rgba(34,197,94,0.5)' :
                      hoveredStep === 2 ? 'rgba(234,179,8,0.5)' :
                        'rgba(168,85,247,0.5)'
                  }`
                  : 'none'
              }}
            ></div>

            {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative flex flex-col items-center text-center group z-10 cursor-default"
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Dynamic Background Glow for each step */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full blur-[80px] -z-10 transition-opacity duration-500 pointer-events-none ${step.glowColor} ${hoveredStep === index ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* 3D Icon Component */}
                <div className="mb-8">
                  <StepIcon3D icon={step.icon} color={step.color} />
                </div>

                {/* Mobile Connector */}
                {index < steps.length - 1 && (
                  <div className="md:hidden absolute bottom-[-32px] w-1 h-8 bg-gray-200 dark:bg-gray-700"></div>
                )}

                <h3 className={`text-xl font-bold mb-2 text-gray-900 dark:text-white transition-colors ${hoveredStep === index ? `text-${step.color}-500` : ''}`}>
                  {step.id}. {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-[200px] leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                  {step.desc}
                </p>
              </div>
            ))}

          </div>
        </div>

        {/* LIVE LEADERBOARD PREVIEW SECTION - NO SCROLL REVEAL */}
        <div id="leaderboard" className="max-w-5xl mx-auto">
          <div className="bg-white/50 dark:bg-dark-surface/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl overflow-visible relative">

            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="text-center mb-10">
              <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2 inline-block animate-pulse">Live Preview</span>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">Proof-of-Reputation</h3>
              <p className="text-gray-500 mt-2">Top contributors automatically qualify for weekly Treasury distribution.</p>
            </div>

            <div className="space-y-3 relative">
              <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider relative z-20">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-5 sm:col-span-6">User</div>
                <div className="col-span-3 sm:col-span-2 text-center">Score (KS)</div>
                <div className="col-span-3 text-right">Reward</div>
              </div>

              {leaderboardPreview.map((user) => (
                <div
                  key={user.rank}
                  onMouseEnter={() => setHoveredRank(user.rank)}
                  onMouseLeave={() => setHoveredRank(null)}
                  className={`relative grid grid-cols-12 items-center px-4 py-3 rounded-xl border transition-all duration-300 ease-out cursor-default ${user.style} ${hoveredRank === user.rank
                    ? 'scale-105 z-30 border-opacity-100 ring-2 ring-white/30 dark:ring-white/10 bg-opacity-100 shadow-2xl'
                    : 'scale-100 z-10 border-opacity-50'
                    }`}
                >
                  {/* Stronger Ambient Glow Background on Hover */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 blur-xl -z-10 ${user.glowColor} ${hoveredRank === user.rank ? 'opacity-100' : 'opacity-0'}`}></div>

                  <div className="col-span-1 flex justify-center">
                    {user.rank <= 3 ? (
                      <span className={`material-symbols-outlined text-xl sm:text-2xl ${user.iconColor} drop-shadow-sm`}>{user.rankIcon}</span>
                    ) : (
                      <span className="font-bold text-gray-500">#{user.rank}</span>
                    )}
                  </div>

                  <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono tracking-wider transition-transform duration-300 ${user.rank === 1 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30' :
                      user.rank === 2 ? 'bg-slate-400/10 text-slate-500 dark:text-slate-300 border border-slate-400/30' :
                        user.rank === 3 ? 'bg-orange-700/10 text-orange-700 dark:text-orange-500 border border-orange-700/30' :
                          'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      } ${hoveredRank === user.rank ? 'scale-110' : ''}`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className={`font-bold transition-colors ${hoveredRank === user.rank ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{user.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${user.badge === 'Professor' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        user.badge === 'Doctor' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                          user.badge === 'Expert' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            user.badge === 'Scholar' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                        }`}>
                        {user.badge}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-2 text-center font-mono font-bold text-gray-700 dark:text-gray-300">
                    {user.score.toLocaleString()}
                  </div>

                  <div className="col-span-3 text-right">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                      {user.reward}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/auth" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-500 font-semibold transition-colors">
                View Full Leaderboard
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6. DAO Governance Section - WITH ANIMATED COUNTERS */}
      <div id="governance" className="py-24 px-6 relative overflow-hidden bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-gray-800">
        {/* Decorative background element */}
        <div className="absolute top-1/2 left-0 w-full h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 -skew-y-6 transform -z-0 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-purple-500 font-bold tracking-wider uppercase text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Decentralized Governance
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">You Shape the Platform</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Hold <b>KNOW-G</b> to propose and vote on protocol upgrades. True ownership means having a say in the future.
              </p>
            </div>
            <div className="flex gap-8 text-sm font-mono text-gray-500 bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide mb-1">Total Staked</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  <LiveTicker start={4200000} /> <span className="text-xs text-purple-500">KNOW-G</span>
                </span>
              </div>
              <div className="w-px bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide mb-1">Active Voters</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  <LiveTicker start={12450} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {governanceProposals.map((proposal) => (
              <Reveal key={proposal.id}>
                <div className="group bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                        <span className="material-symbols-outlined text-2xl">{proposal.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-gray-500">{proposal.id}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{proposal.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{proposal.title}</h3>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${proposal.statusColor} flex items-center gap-1.5`}>
                      {proposal.status === 'Voting Active' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                      {proposal.status}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
                    {proposal.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                      <span>Yes ({proposal.votesYes}%)</span>
                      <span>No ({proposal.votesNo}%)</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-purple-500" style={{ width: `${proposal.votesYes}%` }}></div>
                      <div className="h-full bg-gray-400 dark:bg-gray-600" style={{ width: `${proposal.votesNo}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {proposal.timeLeft}
                      </span>
                      <Link href="/auth" className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1">
                        View Proposal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* 7. ENTERPRISE FOOTER */}
      <footer className="bg-gray-50 dark:bg-[#050608] py-20 border-t border-gray-200 dark:border-gray-800 text-gray-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Column 1: Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">KS</div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">KnowledgeShare</span>
            </div>
            <p className="text-sm mb-6 leading-relaxed">
              Building the decentralized library of Alexandria for the digital age. Owned by the people, stored forever.
            </p>
            <div className="text-xs font-mono text-gray-400">
              Built for eternity on <span className="text-gray-900 dark:text-white font-bold">Arweave</span> & <span className="text-gray-900 dark:text-white font-bold">Solana</span>.
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => scrollToId('explore')} className="hover:text-blue-500 transition-colors">Explore Knowledge</button></li>
              <li><button onClick={() => scrollToId('economy')} className="hover:text-blue-500 transition-colors">Token Economy</button></li>
              <li><button onClick={() => scrollToId('governance')} className="hover:text-blue-500 transition-colors">DAO Governance</button></li>
              <li><button onClick={() => scrollToId('leaderboard')} className="hover:text-blue-500 transition-colors">Leaderboard</button></li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Community</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Twitter (X)</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Discord Server</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Telegram Chat</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">GitHub Repository</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Media Kit</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© 2024 KnowledgeShare Protocol. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
