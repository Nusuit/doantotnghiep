
import React from 'react';
import { createPortal } from 'react-dom';

interface GovAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        totalBalance: number;
        usdValue: number;
        votingPowerPercent: number;
        radar: {
            selfStaked: number;
            delegated: number;
            consistency: number;
        };
        yieldHistory: { month: string; amount: number }[];
        recentVotes: any[];
    };
}

// --- HELPER: TOOLTIP COMPONENT ---
const InfoTooltip = ({ text, title, direction = 'top', width = 'w-64', forceVisible = false }: { text: React.ReactNode; title?: string; direction?: 'top' | 'bottom'; width?: string; forceVisible?: boolean }) => (
    <div
        className={`absolute ${direction === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'} left-1/2 -translate-x-1/2 ${width} bg-white/95 dark:bg-[#1A1D24]/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,1)] transition-all duration-200 pointer-events-none z-[9999] ${forceVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0'}`}
    >
        {title && <div className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">{title}</div>}
        <div className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed text-center relative z-10 font-medium font-sans">
            {text}
        </div>
        {/* Arrow */}
        <div
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-[#1A1D24] border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45 ${direction === 'top' ? 'bottom-[-6px] border-l-0 border-t-0' : 'top-[-6px] border-r-0 border-b-0'}`}
        ></div>
    </div>
);

// --- NEW COMPONENT: ATTRIBUTE ROW ---
const AttributeRow = ({
    label,
    value,
    icon,
    color,
    description,
    tier
}: {
    label: string,
    value: number,
    icon: string,
    color: string,
    description: string,
    tier: string
}) => {
    // Dynamic color classes
    const colorClasses: Record<string, string> = {
        purple: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-500 dark:text-purple-400 dark:border-purple-500/30 from-purple-500 to-indigo-500',
        blue: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500 dark:text-blue-400 dark:border-blue-500/30 from-blue-500 to-cyan-500',
        orange: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500 dark:text-orange-400 dark:border-orange-500/30 from-orange-500 to-amber-500'
    };

    return (
        <div className="group/row relative p-4 rounded-xl bg-white dark:bg-[#13161F] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-opacity-50 dark:bg-opacity-10 ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
                        <span className="material-symbols-outlined text-lg">{icon}</span>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-600 font-medium mt-0.5">{tier} Tier</div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">{value}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-600">/100</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color].split('from')[1] ? `from-${colorClasses[color].split('from-')[1].split(' ')[0]} to-${colorClasses[color].split('to-')[1]}` : 'bg-gray-400'}`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>

            {/* Tooltip Wrapper */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/row:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 p-2 rounded-lg shadow-xl w-64 text-center">
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                </div>
                <div className="w-2 h-2 bg-white dark:bg-[#1A1D24] border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
        </div>
    );
};

export const GovernanceAnalyticsModal: React.FC<GovAnalyticsModalProps> = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    // Gamification Calculations
    const multiplier = (stats.radar.consistency / 100) + 1.0;

    const activeProposals = [
        { id: 'KIP-14', title: 'Increase Creator Rewards Pool', endsIn: '2 days', type: 'Treasury' },
        { id: 'KIP-15', title: 'Onboard New Validators', endsIn: '5 hours', type: 'Technical' }
    ];

    const getTier = (val: number) => val >= 90 ? 'Elite' : val >= 70 ? 'Strong' : val >= 50 ? 'Average' : 'Low';

    return createPortal(
        <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 animate-fade-in font-sans text-gray-900 dark:text-white">
            {/* Backdrop Blur */}
            <div
                className="absolute inset-0 bg-black/60 dark:bg-[#000000]/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-6xl bg-gray-50 dark:bg-[#0A0F1C] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-up">

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1423] gap-4">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center shadow-sm dark:shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]">
                            <span className="material-symbols-outlined text-2xl text-purple-600 dark:text-purple-400">shield_person</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Authority Hub
                                </h2>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">DAO Console</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 font-medium">Manage your governance influence and claim rewards.</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* 2. Main Content Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50 dark:bg-[#0B0E14]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                        {/* --- LEFT COLUMN: POWER ATTRIBUTES --- */}
                        <div className="lg:col-span-5 flex flex-col gap-6">

                            {/* Card 1: Power Attributes List */}
                            <div className="bg-white dark:bg-[#10131A] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col relative overflow-visible shadow-sm">
                                <div className="p-5 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-center bg-gray-50/50 dark:bg-[#13161F] rounded-t-2xl">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Power Attributes</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <AttributeRow
                                        label="Personal Stake"
                                        value={stats.radar.selfStaked}
                                        icon="account_balance_wallet"
                                        color="purple"
                                        description="The base power coming from your own locked KNOW-G tokens. More tokens = A stronger foundation."
                                        tier={getTier(stats.radar.selfStaked)}
                                    />
                                    <AttributeRow
                                        label="Community Trust"
                                        value={stats.radar.delegated}
                                        icon="diversity_3"
                                        color="blue"
                                        description="Power assigned to you by other users who trust your expertise. Represents your reputation."
                                        tier={getTier(stats.radar.delegated)}
                                    />
                                    <AttributeRow
                                        label="Voting Activity"
                                        value={stats.radar.consistency}
                                        icon="how_to_vote"
                                        color="orange"
                                        description="Your participation score. Vote regularly on proposals to keep this high and boost your multiplier."
                                        tier={getTier(stats.radar.consistency)}
                                    />
                                </div>
                            </div>

                            {/* Card 2: POWER BOOSTER */}
                            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#10131A] dark:to-[#151922] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4 relative overflow-visible shadow-sm">
                                {/* Glow Effect */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                <div className="flex justify-between items-end mb-2 relative z-10">
                                    {/* Multiplier */}
                                    <div className="flex flex-col group/tooltip relative cursor-help">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            Voting Multiplier
                                            <span className="material-symbols-outlined text-[10px] text-gray-400">help</span>
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{multiplier.toFixed(2)}x</span>
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded">Active</span>
                                        </div>
                                        <InfoTooltip
                                            title="Boost Factor"
                                            text="A dynamic bonus (up to 2.5x) that multiplies your staked tokens based on your activity and community trust."
                                            direction="top"
                                        />
                                    </div>

                                    {/* Total VP */}
                                    <div className="text-right group/tooltip relative cursor-help">
                                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center justify-end gap-1">
                                            Total Voting Power
                                            <span className="material-symbols-outlined text-[10px]">info</span>
                                        </span>
                                        <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">{(stats.totalBalance * multiplier).toLocaleString()} VP</div>
                                        <InfoTooltip
                                            title="Final Influence"
                                            text="Your final 'weight' in any vote. Calculated as: [Total Staked] x [Multiplier]."
                                            direction="top"
                                            width="w-56"
                                        />
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-2"></div>

                                <div className="space-y-3 relative z-10">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Power Boosters (Quests)</div>

                                    {/* Task 1 */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50 group hover:border-orange-400 dark:hover:border-orange-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">how_to_vote</span>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Participate in Votes</div>
                                                <div className="text-[10px] text-gray-500">Tip: Vote on 2 more proposals</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-orange-500 dark:text-orange-400">+0.42x</span>
                                    </div>

                                    {/* Task 2 */}
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50 group hover:border-blue-400 dark:hover:border-blue-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-sm">diversity_3</span>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Build Community Trust</div>
                                                <div className="text-[10px] text-gray-500">Tip: Write high-quality content</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400">+0.50x</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* --- RIGHT COLUMN --- */}
                        <div className="lg:col-span-7 flex flex-col gap-6">

                            {/* Row 1: Staking Overview */}
                            <div className="bg-white dark:bg-[#10131A] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex justify-between items-center group hover:border-gray-300 dark:hover:border-gray-700 transition-colors overflow-visible shadow-sm">
                                <div className="flex gap-4 items-center relative group/tooltip cursor-help">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                                        <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">lock_clock</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                            Total Staked Value
                                            <span className="material-symbols-outlined text-[10px]">info</span>
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{stats.totalBalance.toLocaleString()} G</span>
                                            <span className="text-sm text-gray-500">≈ ${stats.usdValue.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <InfoTooltip
                                        title="Locked Capital"
                                        text="The total amount of your governance tokens currently locked in the system to generate power and rewards."
                                        direction="bottom"
                                    />
                                </div>

                                <div className="text-right relative group/tooltip cursor-help">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                                        Network Share
                                        <span className="material-symbols-outlined text-[10px]">pie_chart</span>
                                    </span>
                                    <span className="text-xl font-mono font-bold text-blue-500 dark:text-blue-400">{stats.votingPowerPercent}%</span>
                                    <InfoTooltip
                                        title="Global Influence"
                                        text="Your percentage of the total voting influence across the entire KSP network. This is your 'slice of the pie'."
                                        direction="bottom"
                                        width="w-56"
                                    />
                                </div>
                            </div>

                            {/* Row 2: ACTIVE PROPOSALS */}
                            <div className="bg-white dark:bg-[#10131A] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm">
                                <div className="p-5 border-b border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-[#13161F] flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Active Proposals
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{activeProposals.length} Open</span>
                                </div>

                                <div className="p-2 space-y-2">
                                    {activeProposals.map((prop) => (
                                        <div key={prop.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0E1116] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all group">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-gray-500 bg-gray-200 dark:bg-gray-800 px-1.5 rounded">{prop.id}</span>
                                                    <span className="text-[10px] font-bold text-gray-500 border border-gray-300 dark:border-gray-700 px-1.5 rounded uppercase">{prop.type}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{prop.title}</h4>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                    <span className="material-symbols-outlined text-[12px]">timer</span>
                                                    Ends in {prop.endsIn}
                                                </div>
                                            </div>

                                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105 flex items-center gap-2">
                                                Vote Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Row 3: Yield & Rewards */}
                            <div className="bg-white dark:bg-[#10131A] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col relative overflow-visible shadow-sm">
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-base">savings</span>
                                            Unclaimed Yield
                                        </h3>
                                        <div className="mt-2 flex items-baseline gap-3">
                                            <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white">145.20 <span className="text-sm text-gray-500">KNOW-G</span></span>
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-2 py-1 rounded border border-green-200 dark:border-green-500/20 flex items-center gap-1 relative group/tooltip cursor-help">
                                                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                                                Current APY: 12%
                                                <InfoTooltip
                                                    title="Annual Yield"
                                                    text="The estimated annual percentage return you earn for securing the network through staking."
                                                    direction="bottom"
                                                />
                                            </span>
                                        </div>
                                    </div>
                                    <button className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wide rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105">
                                        Claim All <span className="material-symbols-outlined text-sm">download</span>
                                    </button>
                                </div>

                                {/* Mini Chart for Yield */}
                                <div className="flex items-end justify-between gap-2 h-24 px-2 pb-2 border-b border-gray-200 dark:border-gray-800/50 mb-2">
                                    {stats.yieldHistory.map((item, idx) => {
                                        const height = Math.max(10, (item.amount / 120) * 100);
                                        return (
                                            <div key={idx} className="relative flex-1 h-full flex flex-col justify-end items-center group/bar">
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity z-[9998] pointer-events-none">
                                                    <span className="text-[9px] font-bold bg-gray-900 dark:bg-gray-800 text-white px-2 py-1 rounded">{item.amount}</span>
                                                </div>
                                                <div className="w-full bg-green-200 dark:bg-green-900/30 rounded-t-sm hover:bg-green-400 dark:hover:bg-green-500/50 transition-colors" style={{ height: `${height}%` }}></div>
                                                <span className="text-[8px] text-gray-500 dark:text-gray-600 font-mono mt-1">{item.month}</span>
                                            </div>
                                        )
                                    })}
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
