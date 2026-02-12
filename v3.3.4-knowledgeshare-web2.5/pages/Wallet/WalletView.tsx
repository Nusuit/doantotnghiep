
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CURRENT_USER } from '../../data/mockData';

// --- HELPER: TOOLTIP ---
const InfoTooltip = ({ content }: { content: string }) => (
    <div className="group/tooltip relative inline-flex items-center ml-1.5 cursor-help z-50">
        <span className="material-symbols-outlined text-[14px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">info</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-900 dark:bg-black border border-gray-700 rounded-lg text-[10px] text-white leading-relaxed opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-xl text-center">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-gray-900 dark:border-t-black"></div>
        </div>
    </div>
);

// --- TYPES & MOCK DATA ---
type TxType = 'buy' | 'earn' | 'swap' | 'stake' | 'unlock' | 'send' | 'receive';
type TxStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
    id: string;
    type: TxType;
    label: string;
    subLabel?: string; 
    date: string; // ISO string for sorting/filtering
    amount: number;
    token: 'U' | 'G';
    status: TxStatus;
    txHash: string;
}

const HISTORY_DATA: Transaction[] = [
    { id: '1', type: 'buy', label: 'Deposit Funds', subLabel: 'Via Credit Card', date: '2024-10-28T10:00:00', amount: 5000, token: 'U', status: 'completed', txHash: '0x3a...9f12' },
    { id: '2', type: 'earn', label: 'Contribution Reward', subLabel: 'Post: Solana Firedancer', date: '2024-10-28T08:30:00', amount: 120, token: 'U', status: 'completed', txHash: 'sys...rew' },
    { id: '3', type: 'swap', label: 'Swap G → U', subLabel: 'Rate: 1 G = 10 U', date: '2024-10-27T15:45:00', amount: 500, token: 'U', status: 'completed', txHash: 'swp...77a' },
    { id: '4', type: 'unlock', label: 'Content Unlock', subLabel: 'Deep Dive: ZK Proofs', date: '2024-10-27T12:00:00', amount: -50, token: 'U', status: 'completed', txHash: 'int...55b' },
    { id: '5', type: 'stake', label: 'Governance Stake', subLabel: 'Delegated to @marcus', date: '2024-10-26T09:00:00', amount: -500, token: 'G', status: 'completed', txHash: 'gov...88c' },
    { id: '6', type: 'earn', label: 'Validator Yield', subLabel: 'Epoch 422 Rewards', date: '2024-10-25T00:00:00', amount: 12.5, token: 'G', status: 'pending', txHash: 'rew...yld' },
    { id: '7', type: 'send', label: 'Gift Sent', subLabel: 'To @sarah_chen', date: '2024-10-24T18:20:00', amount: -100, token: 'U', status: 'completed', txHash: 'tx...99d' },
    { id: '8', type: 'earn', label: 'Staking Reward', subLabel: 'Weekly Distribution', date: '2024-10-20T09:00:00', amount: 45, token: 'G', status: 'completed', txHash: 'rew...wk1' },
    { id: '9', type: 'swap', label: 'Swap U → G', subLabel: 'Rate: 10 U = 1 G', date: '2024-10-18T14:20:00', amount: -1000, token: 'U', status: 'completed', txHash: 'swp...88b' },
];

// Helper: Format Date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper: Get Icon & Color based on Type
const getTxStyle = (type: TxType) => {
    switch (type) {
        case 'buy': return { icon: 'add_card', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
        case 'earn': return { icon: 'savings', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
        case 'receive': return { icon: 'call_received', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
        case 'send': return { icon: 'call_made', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
        case 'unlock': return { icon: 'lock_open', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' };
        case 'stake': return { icon: 'shield_lock', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
        case 'swap': return { icon: 'swap_horiz', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
        default: return { icon: 'circle', color: 'text-gray-500 bg-gray-500/10' };
    }
};

// --- SUB-COMPONENT: HISTORY ITEM ROW ---
const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const style = getTxStyle(tx.type);
    return (
        <div className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#161920] rounded-xl transition-all cursor-default">
            {/* Left: Icon & Info */}
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${style.color}`}>
                    <span className="material-symbols-outlined text-lg">{style.icon}</span>
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {tx.label}
                        {tx.status === 'pending' && (
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Pending"></span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                        <span>{tx.subLabel}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <span className="font-mono">{tx.txHash}</span>
                    </div>
                </div>
            </div>

            {/* Right: Amount & Status */}
            <div className="text-right">
                <div className={`font-mono font-bold text-sm ${
                    tx.amount > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} {tx.token}
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                    tx.status === 'completed' ? 'text-gray-400' : 
                    tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                    {tx.status}
                </div>
            </div>
        </div>
    );
};

// --- ASSET CARD COMPONENT (PROFESSIONAL MINIMALIST) ---
interface AssetCardProps {
    token: 'U' | 'G';
    balance: number;
    subBalance?: string;
    onClick: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ token, balance, subBalance, onClick }) => {
    const isU = token === 'U';
    
    // Style configurations - Clean, Professional, Dashboard style
    // Removed flashy gradients, using solid backgrounds with accent borders
    const styleConfig = isU ? {
        bg: "bg-white dark:bg-[#161b22]",
        border: "border border-gray-200 dark:border-gray-800 border-l-4 border-l-blue-500",
        text: "text-gray-900 dark:text-white",
        subText: "text-gray-500 dark:text-gray-400",
        iconBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        accent: "bg-blue-500"
    } : {
        bg: "bg-white dark:bg-[#161b22]",
        border: "border border-gray-200 dark:border-gray-800 border-l-4 border-l-purple-500",
        text: "text-gray-900 dark:text-white",
        subText: "text-gray-500 dark:text-gray-400",
        iconBg: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
        accent: "bg-purple-500"
    };
    
    const icon = isU ? 'bolt' : 'token';
    const name = isU ? 'KNOW-U' : 'KNOW-G';
    const label = isU ? 'Utility Points' : 'Governance Token';

    return (
        <div 
            onClick={onClick}
            className={`relative w-full h-40 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group ${styleConfig.bg} ${styleConfig.border}`}
        >
            <div className="flex flex-col justify-between h-full">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styleConfig.iconBg}`}>
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${styleConfig.text}`}>{name}</div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${styleConfig.subText}`}>{label}</div>
                        </div>
                    </div>
                    <span className={`material-symbols-outlined ${styleConfig.subText} group-hover:text-gray-900 dark:group-hover:text-white transition-colors`}>arrow_forward</span>
                </div>

                {/* Balance Area */}
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-mono font-bold tracking-tight ${styleConfig.text}`}>
                            {balance.toLocaleString()}
                        </span>
                        <span className={`text-sm font-medium ${styleConfig.subText}`}>{token}</span>
                    </div>
                    {subBalance && (
                        <div className={`mt-2 inline-flex items-center gap-2 text-xs font-medium ${styleConfig.subText}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${styleConfig.accent}`}></span>
                            {subBalance}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ASSET DETAIL MODAL (THE "CLICKED" STATE) ---
interface AssetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: 'U' | 'G';
    onAction: (action: string) => void;
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ isOpen, onClose, token, onAction }) => {
    if (!isOpen) return null;

    const isU = token === 'U';
    const config = isU 
        ? {
            name: 'KNOW-U',
            label: 'Utility Points',
            color: 'blue',
            icon: 'bolt',
            balance: CURRENT_USER.balance_u,
            actions: [
                { id: 'buy', label: 'Top Up', icon: 'add_card', color: 'bg-blue-600' },
                { id: 'swap', label: 'Swap', icon: 'sync_alt', color: 'bg-purple-600' },
                { id: 'history', label: 'History', icon: 'history', color: 'bg-gray-700' },
            ]
        }
        : {
            name: 'KNOW-G',
            label: 'Governance Token',
            color: 'purple',
            icon: 'token',
            balance: CURRENT_USER.balance_g,
            actions: [
                { id: 'stake', label: 'Stake', icon: 'lock_clock', color: 'bg-purple-600' },
                { id: 'swap', label: 'Swap', icon: 'sync_alt', color: 'bg-pink-600' },
                { id: 'history', label: 'History', icon: 'history', color: 'bg-gray-700' },
            ]
        };

    return createPortal(
        <div className="fixed inset-0 z-[10010] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            {/* Modal Sheet */}
            <div className="relative w-full max-w-sm bg-white dark:bg-[#0B0E14] border-t sm:border border-gray-200 dark:border-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                
                {/* Header Section (Colored) */}
                <div className={`p-6 pb-8 ${isU ? 'bg-gradient-to-br from-cyan-600 to-blue-600 dark:from-cyan-900/50 dark:to-blue-900/50' : 'bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-900/50 dark:to-pink-900/50'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/90">{config.label}</span>
                        <button className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white transition-colors">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>

                    <div className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg mb-4 ${isU ? 'bg-blue-500' : 'bg-purple-500'}`}>
                            <span className="material-symbols-outlined">{config.icon}</span>
                        </div>
                        <h2 className="text-4xl font-mono font-bold text-white mb-1">{config.balance.toLocaleString()}</h2>
                        <p className="text-sm text-white/80 font-medium">Available {config.name}</p>
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="px-6 -mt-6">
                    <div className="flex justify-center gap-4 bg-gray-50 dark:bg-[#161920] p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                        {config.actions.map(action => (
                            <button 
                                key={action.id}
                                onClick={() => { onClose(); onAction(action.id); }}
                                className="flex flex-col items-center gap-2 group min-w-[60px]"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 ${action.color}`}>
                                    <span className="material-symbols-outlined text-xl">{action.icon}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors uppercase tracking-wide">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Mini-List */}
                <div className="p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        {HISTORY_DATA.filter(tx => tx.token === token).slice(0, 3).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700`}>
                                        <span className={`material-symbols-outlined text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {tx.amount > 0 ? 'arrow_downward' : 'arrow_upward'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900 dark:text-white">{tx.label}</div>
                                        <div className="text-[10px] text-gray-500">{formatDate(tx.date)}</div>
                                    </div>
                                </div>
                                <div className={`text-sm font-mono font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

// --- BUY POINTS CONFIGURATION ---
const BUY_PACKAGES = [
    { price: 5, points: 500, bonus: 0 },
    { price: 10, points: 1050, bonus: 5 },
    { price: 20, points: 2200, bonus: 10 }, // Popular
    { price: 50, points: 5750, bonus: 15 },
    { price: 100, points: 12000, bonus: 20 }, // Best Value
    { price: 200, points: 25000, bonus: 25 },
];

const PAYMENT_METHODS = [
    { id: 'qr', name: 'QR Pay (Bank)', icon: 'qr_code_scanner', color: 'text-blue-500 bg-blue-500/10' },
    { id: 'crypto', name: 'Solana Pay', icon: 'currency_bitcoin', color: 'text-purple-500 bg-purple-500/10' },
    { id: 'card', name: 'Credit Card', icon: 'credit_card', color: 'text-orange-500 bg-orange-500/10' },
];

// --- ACTION MODALS (Advanced UX) ---
const ActionModal = ({ 
    isOpen, 
    onClose, 
    type 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    type: 'buy' | 'swap' | 'stake' | null 
}) => {
    const [amount, setAmount] = useState('');
    
    // BUY FLOW STATES
    const [buyStep, setBuyStep] = useState<'select' | 'confirm' | 'qr' | 'card_input' | 'processing' | 'success'>('select');
    const [selectedPackage, setSelectedPackage] = useState<typeof BUY_PACKAGES[0] | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    
    // SWAP FLOW STATES
    const [swapStep, setSwapStep] = useState<'input' | 'review' | 'processing' | 'success'>('input');
    const [swapDirection, setSwapDirection] = useState<'G_TO_U' | 'U_TO_G'>('G_TO_U');

    // STAKE FLOW STATES
    const [stakeStep, setStakeStep] = useState<'input' | 'processing' | 'success'>('input');
    const [stakeDuration, setStakeDuration] = useState<30 | 90 | 0>(90); // 0 = Flexible

    // GENERAL STATES
    const [step, setStep] = useState<'input' | 'simulating' | 'review' | 'processing' | 'success'>('input');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setStep('input');
            
            // Reset Buy Flow
            setBuyStep('select');
            setSelectedPackage(null);
            setSelectedMethod(null);

            // Reset Swap Flow
            setSwapStep('input');
            setSwapDirection('G_TO_U');

            // Reset Stake Flow
            setStakeStep('input');
            setStakeDuration(90);
        }
    }, [isOpen]);

    if (!isOpen || !type) return null;

    // --- GENERIC HANDLERS ---
    const handleCalculate = () => {
        setStep('simulating');
        setTimeout(() => setStep('review'), 800);
    };

    const handleConfirm = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('success');
            setTimeout(onClose, 2000);
        }, 2000);
    };

    // --- BUY SPECIFIC HANDLERS ---
    const handleSelectPackage = (pkg: typeof BUY_PACKAGES[0]) => {
        setSelectedPackage(pkg);
    };

    const handleSelectMethod = (methodId: string) => {
        setSelectedMethod(methodId);
    };

    const handleBuyContinue = () => {
        if (selectedPackage && selectedMethod) {
            setBuyStep('confirm');
        }
    };

    const handleBuyConfirm = () => {
        if (selectedMethod === 'qr' || selectedMethod === 'crypto') {
            setBuyStep('qr');
        } else if (selectedMethod === 'card') {
            setBuyStep('card_input');
        } else {
            setBuyStep('processing');
            setTimeout(() => {
                setBuyStep('success');
                setTimeout(onClose, 2000);
            }, 2500);
        }
    };

    const handleBuyBack = () => {
        if (buyStep === 'confirm') setBuyStep('select');
        else if (buyStep === 'qr' || buyStep === 'card_input') setBuyStep('confirm');
    };

    const handlePaid = () => {
        setBuyStep('processing');
        setTimeout(() => {
            setBuyStep('success');
            setTimeout(onClose, 2500);
        }, 2000);
    };

    // --- SWAP SPECIFIC HANDLERS ---
    const handleSwapReview = () => {
        setSwapStep('review');
    };

    const handleSwapConfirm = () => {
        setSwapStep('processing');
        setTimeout(() => {
            setSwapStep('success');
            setTimeout(onClose, 2000);
        }, 2000);
    };

    // --- STAKE SPECIFIC HANDLERS ---
    const handleStakeConfirm = () => {
        setStakeStep('processing');
        setTimeout(() => {
            setStakeStep('success');
            setTimeout(onClose, 2000);
        }, 2000);
    };

    const handlePercentageClick = (percent: number, balance: number) => {
        setAmount((balance * percent).toFixed(0));
    };

    // --- CONFIGS ---
    const config = {
        buy: {
            title: 'Buy Points',
            subtitle: 'Recharge Balance',
            icon: 'add_card',
            color: 'green',
            accent: 'bg-green-500',
        },
        swap: {
            title: 'Token Swap',
            subtitle: 'Governance to Utility',
            icon: 'sync_alt',
            color: 'blue',
            accent: 'bg-blue-500',
            fromUnit: 'KNOW-G',
            toUnit: 'KNOW-U',
            rate: 10,
            fee: '0.0005 SOL',
            slippage: '< 0.1%'
        },
        stake: {
            title: 'Stake & Earn',
            subtitle: '12% APY',
            icon: 'lock_clock',
            color: 'purple',
            accent: 'bg-purple-500',
            fromUnit: 'KNOW-G',
            toUnit: 'Staked G',
            rate: 1,
            fee: '0.0005 SOL',
            slippage: '0%'
        }
    }[type];

    // --- RENDER BUY FLOW ---
    if (type === 'buy') {
        const activeMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);

        return createPortal(
            <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
                    {/* ... (Existing Buy Code) ... */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#0F1218]">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-green-500 bg-opacity-20 flex items-center justify-center text-green-600 dark:text-green-500`}>
                                <span className="material-symbols-outlined text-lg">add_card</span>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-none">Recharge Points</h3>
                                <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">Secure Payment Gateway</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0B0E14] p-6">
                        {/* REUSE EXISTING CONTENT FROM PREVIOUS STEPS FOR BUY */}
                        {/* STEP 1: SELECT PACKAGE & METHOD */}
                        {buyStep === 'select' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* 1. Select Amount (Grid) */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">1</span>
                                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Select Amount</h4>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {BUY_PACKAGES.map((pkg) => {
                                            const isSelected = selectedPackage?.price === pkg.price;
                                            return (
                                                <button
                                                    key={pkg.price}
                                                    onClick={() => handleSelectPackage(pkg)}
                                                    className={`relative p-4 rounded-xl border-2 transition-all group ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161920] hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#1A1D24]'}`}
                                                >
                                                    <div className="text-center mb-1"><span className={`text-lg font-bold ${isSelected ? 'text-green-600 dark:text-white' : 'text-gray-900 dark:text-gray-300'}`}>${pkg.price}</span></div>
                                                    <div className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-black/30 rounded py-1"><span className="material-symbols-outlined text-[12px] text-green-500">bolt</span><span className="text-sm font-mono font-bold text-green-600 dark:text-green-400">{pkg.points.toLocaleString()}</span></div>
                                                    {pkg.bonus > 0 && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">+{pkg.bonus}%</div>}
                                                    {isSelected && <div className="absolute top-2 left-2 text-green-500"><span className="material-symbols-outlined text-lg">check_circle</span></div>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* 2. Payment Method */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4"><span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">2</span><h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Payment Method</h4></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {PAYMENT_METHODS.map((method) => {
                                            const isSelected = selectedMethod === method.id;
                                            return (
                                                <button key={method.id} onClick={() => handleSelectMethod(method.id)} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161920] hover:bg-gray-100 dark:hover:bg-[#1A1D24] hover:border-gray-400 dark:hover:border-gray-600'}`}>
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.color}`}><span className="material-symbols-outlined">{method.icon}</span></div>
                                                    <div><div className={`text-xs font-bold ${isSelected ? 'text-blue-600 dark:text-white' : 'text-gray-900 dark:text-gray-300'}`}>{method.name}</div><div className="text-[10px] text-gray-500">Instant Process</div></div>
                                                    {isSelected && <div className="ml-auto text-blue-500"><span className="material-symbols-outlined">check_circle</span></div>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                {/* CONTINUE BUTTON */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <button onClick={handleBuyContinue} disabled={!selectedPackage || !selectedMethod} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">Continue<span className="material-symbols-outlined">arrow_forward</span></button>
                                </div>
                            </div>
                        )}
                        {/* STEP 2: CONFIRMATION SUMMARY */}
                        {buyStep === 'confirm' && selectedPackage && activeMethod && (
                            <div className="space-y-6 animate-fade-in max-w-sm mx-auto">
                                <div className="text-center mb-6"><div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30"><span className="material-symbols-outlined text-3xl text-blue-500">receipt_long</span></div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3><p className="text-sm text-gray-500">Review your transaction details</p></div>
                                <div className="bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Package</span><span className="text-sm font-bold text-gray-900 dark:text-white">${selectedPackage.price}.00</span></div>
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Method</span><div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-gray-500">{activeMethod.icon}</span><span className="text-sm font-bold text-gray-900 dark:text-white">{activeMethod.name}</span></div></div>
                                    <div className="p-4 bg-gray-100 dark:bg-gray-800/30 flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Total Receive</span><div className="text-right"><span className="block text-lg font-mono font-bold text-green-600 dark:text-green-400">{selectedPackage.points.toLocaleString()} U</span>{selectedPackage.bonus > 0 && <span className="text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">Includes {selectedPackage.bonus}% Bonus</span>}</div></div>
                                </div>
                                <div className="flex gap-3 pt-2"><button onClick={handleBuyBack} className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button><button onClick={handleBuyConfirm} className="flex-[2] py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-lg">check_circle</span>Confirm Payment</button></div>
                            </div>
                        )}
                        {/* STEP 3A: QR CODE DISPLAY */}
                        {buyStep === 'qr' && selectedPackage && (
                            <div className="flex flex-col items-center text-center animate-fade-in py-4">
                                <div className="mb-6"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Scan to Pay</h3><p className="text-sm text-gray-500">Amount: <span className="text-green-600 dark:text-green-400 font-bold font-mono text-lg">${selectedPackage.price}.00</span></p></div>
                                <div className="p-4 bg-white rounded-2xl mb-6 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)] border border-gray-200 relative group cursor-pointer">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment_know_u_${selectedPackage.price}_usd`} alt="Payment QR" className="w-48 h-48 mix-blend-multiply" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-2xl"><span className="text-black font-bold text-sm">Click to Copy Link</span></div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8"><span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700"><span className="material-symbols-outlined text-sm animate-pulse text-yellow-500">timer</span> 09:59</span><span>Waiting for payment...</span></div>
                                <div className="w-full max-w-sm flex gap-3"><button onClick={handleBuyBack} className="flex-1 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button><button onClick={handlePaid} className="flex-[2] py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20 transition-all">I Have Paid</button></div>
                            </div>
                        )}
                        {/* STEP 3B: CREDIT CARD INPUT */}
                        {buyStep === 'card_input' && selectedPackage && (
                            <div className="animate-fade-in p-2 max-w-md mx-auto">
                                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-4 flex gap-3 mb-6">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">shield_lock</span>
                                    <div className="text-xs text-green-800 dark:text-green-200 leading-relaxed"><span className="font-bold block mb-1">Your card information is protected</span>We partner with trusted payment providers to ensure your card details are absolutely secure.</div>
                                </div>
                                <div className="text-center mb-8"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Payment</span><div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mt-1">${selectedPackage.price}.00</div></div>
                                <div className="space-y-5">
                                    <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Card Number</label><div className="relative"><input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-10 text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /><span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">credit_card</span></div></div>
                                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Expiry Date</label><input type="text" placeholder="MM/YY" className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /></div><div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1">CVV <span className="material-symbols-outlined text-[14px] text-gray-400 cursor-help" title="3 digits on back">help</span></label><input type="text" placeholder="123" className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /></div></div>
                                    <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Cardholder Name</label><input type="text" placeholder="NGUYEN VAN A" className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /></div>
                                </div>
                                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800"><button onClick={handleBuyBack} className="py-3 px-6 rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button><button onClick={handlePaid} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 transform active:scale-95">Pay Now</button></div>
                            </div>
                        )}
                        {/* STEP 4: PROCESSING / SUCCESS */}
                        {(buyStep === 'processing' || buyStep === 'success') && (
                            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                                {buyStep === 'processing' ? (<><div className="w-20 h-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6"></div><h4 className="text-gray-900 dark:text-white font-bold text-xl">Verifying Payment</h4><p className="text-sm text-gray-500 mt-2">Please do not close this window...</p></>) : (<><div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 animate-scale-up"><span className="material-symbols-outlined text-5xl">check_circle</span></div><h4 className="text-gray-900 dark:text-white font-bold text-2xl mb-2">Purchase Successful!</h4><p className="text-gray-500 mb-6">Added <span className="text-gray-900 dark:text-white font-bold">{selectedPackage?.points.toLocaleString()} KNOW-U</span> to your wallet.</p></>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // --- RENDER SWAP FLOW (Professional DEX Style) ---
    if (type === 'swap') {
        const isGtoU = swapDirection === 'G_TO_U';
        const fromToken = isGtoU ? 'KNOW-G' : 'KNOW-U';
        const toToken = isGtoU ? 'KNOW-U' : 'KNOW-G';
        const fromBalance = isGtoU ? CURRENT_USER.balance_g : CURRENT_USER.balance_u;
        const toBalance = isGtoU ? CURRENT_USER.balance_u : CURRENT_USER.balance_g;
        // Rate: 1 G = 10 U
        const rate = isGtoU ? 10 : 0.1;
        
        const fromValue = amount;
        const toValue = amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00';

        return createPortal(
            <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-md bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                    {/* ... (Reuse existing Swap Code) ... */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#0F1218]"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center"><span className="material-symbols-outlined text-lg">sync_alt</span></div><div><h3 className="text-base font-bold text-gray-900 dark:text-white leading-none">Token Swap</h3><p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">Instant Exchange</p></div></div><button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button></div>
                    <div className="p-6 space-y-2">
                        {swapStep === 'input' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="bg-gray-50 dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all focus-within:border-blue-500/50"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">You Pay</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{fromBalance.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-3xl font-mono font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-700"/><div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 min-w-[110px]"><span className={`material-symbols-outlined text-lg ${isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{isGtoU ? 'token' : 'bolt'}</span><span className="font-bold text-gray-900 dark:text-white text-sm">{fromToken.replace('KNOW-', '')}</span></div></div><div className="flex gap-2 mt-3">{[0.25, 0.5, 1].map((pct) => (<button key={pct} onClick={() => handlePercentageClick(pct, fromBalance)} className="px-2 py-1 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">{pct === 1 ? 'MAX' : `${pct * 100}%`}</button>))}</div></div>
                                <div className="flex justify-center -my-6 relative z-10"><button onClick={() => setSwapDirection(prev => prev === 'G_TO_U' ? 'U_TO_G' : 'G_TO_U')} className="w-10 h-10 bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all shadow-xl"><span className="material-symbols-outlined text-xl">swap_vert</span></button></div>
                                <div className="bg-gray-50 dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pt-6"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">You Receive</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{toBalance.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><div className="w-full text-3xl font-mono font-bold text-gray-900 dark:text-white opacity-80">{toValue}</div><div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 min-w-[110px]"><span className={`material-symbols-outlined text-lg ${!isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{!isGtoU ? 'token' : 'bolt'}</span><span className="font-bold text-gray-900 dark:text-white text-sm">{toToken.replace('KNOW-', '')}</span></div></div></div>
                                <div className="bg-gray-100 dark:bg-[#161b22]/50 rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="text-gray-900 dark:text-white font-mono">1 {fromToken.replace('KNOW-', '')} ≈ {rate} {toToken.replace('KNOW-', '')}</span></div><div className="flex justify-between"><span className="text-gray-500">Network Fee</span><span className="text-gray-900 dark:text-white font-mono flex items-center gap-1">{config.fee} <span className="material-symbols-outlined text-[10px] text-gray-500">local_gas_station</span></span></div><div className="flex justify-between"><span className="text-gray-500">Price Impact</span><span className="text-green-500 font-mono">{config.slippage}</span></div></div>
                                <button onClick={handleSwapReview} disabled={!amount || Number(amount) <= 0 || Number(amount) > fromBalance} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">Review Swap</button>
                            </div>
                        )}
                        {swapStep === 'review' && (<div className="space-y-6 animate-fade-in pt-2"><div className="text-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">You are swapping</span><div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mt-1 mb-6">{amount} <span className={`text-xl ${isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{fromToken}</span></div><div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center mx-auto -my-4 relative z-10"><span className="material-symbols-outlined text-gray-400 text-sm">arrow_downward</span></div></div><div className="bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mt-4"><div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-800"><span className="text-gray-500 text-sm">Receive (Est.)</span><span className="text-xl font-bold text-green-500 font-mono">{toValue} {toToken}</span></div><div className="space-y-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Protocol Provider</span><span className="text-gray-900 dark:text-white">Knowledge AMM v2</span></div><div className="flex justify-between"><span className="text-gray-500">Route</span><span className="text-gray-900 dark:text-white font-mono">{fromToken} &gt; SOL &gt; {toToken}</span></div></div></div><div className="flex gap-3"><button onClick={() => setSwapStep('input')} className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button><button onClick={handleSwapConfirm} className="flex-[2] py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-lg">fingerprint</span> Confirm Swap</button></div></div>)}
                        {(swapStep === 'processing' || swapStep === 'success') && (<div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">{swapStep === 'processing' ? (<><div className="relative mb-6"><div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center text-blue-500"><span className="material-symbols-outlined animate-pulse">sync</span></div></div><h4 className="text-gray-900 dark:text-white font-bold text-lg">Swapping Tokens...</h4><p className="text-xs text-gray-500 mt-1 font-mono">Interacting with Solana Smart Contract</p></>) : (<><div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 animate-scale-up"><span className="material-symbols-outlined text-3xl">check</span></div><h4 className="text-gray-900 dark:text-white font-bold text-2xl mb-2">Swap Complete!</h4><p className="text-sm text-gray-500 mb-6">Received <span className="text-green-500 font-bold">{toValue} {toToken}</span></p><div className="w-full bg-gray-50 dark:bg-[#161b22] p-3 rounded-lg border border-gray-200 dark:border-gray-800 flex justify-between items-center"><span className="text-xs text-gray-500 font-mono">Tx: 0x8a...2b9</span><button className="text-blue-500 hover:text-blue-400 text-xs font-bold flex items-center gap-1">View on Solscan <span className="material-symbols-outlined text-[10px]">open_in_new</span></button></div></>)}</div>)}
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // --- RENDER GOVERNANCE STAKE FLOW (New Design) ---
    if (type === 'stake') {
        const apy = stakeDuration === 90 ? 12 : stakeDuration === 30 ? 8 : 4;
        const vpMultiplier = stakeDuration === 90 ? 2 : stakeDuration === 30 ? 1.5 : 1;
        const vpBoost = amount ? (Number(amount) * vpMultiplier).toLocaleString() : '0';
        const expectedYield = amount ? (Number(amount) * (apy / 100)).toFixed(2) : '0.00';

        return createPortal(
            <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
                
                <div className="relative w-full max-w-md bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
                    {/* ... (Reuse existing Stake Code) ... */}
                    <div className="absolute top-0 right-0 z-0 opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/4"><span className="material-symbols-outlined text-[250px] text-purple-500">lock_clock</span></div>
                    <div className="relative z-10 p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-[#0F1218]/90 backdrop-blur-sm flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center border border-purple-500/30"><span className="material-symbols-outlined text-lg">shield_lock</span></div><div><h3 className="text-base font-serif font-bold text-gray-900 dark:text-white leading-none">Governance Staking</h3><p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">Lock G for Power & Yield</p></div></div><button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button></div>
                    <div className="p-6 space-y-6 relative z-10 flex-1">
                        {stakeStep === 'input' && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white text-center leading-tight">Lock KNOW-G for <br/><span className="text-purple-500">Governance Power</span></h2>
                                <div className="bg-gray-50 dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">Stake Amount</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{CURRENT_USER.balance_g.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus className="w-full bg-transparent text-3xl font-mono font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-700"/><div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 min-w-[100px]"><span className="material-symbols-outlined text-lg text-purple-500">token</span><span className="font-bold text-purple-600 dark:text-purple-400 text-sm">KNOW-G</span></div></div><div className="flex gap-2 mt-3">{[0.25, 0.5, 1].map((pct) => (<button key={pct} onClick={() => handlePercentageClick(pct, CURRENT_USER.balance_g)} className="px-2 py-1 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">{pct === 1 ? 'MAX' : `${pct * 100}%`}</button>))}</div></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Lock Duration</label><div className="grid grid-cols-3 gap-2">{[{ val: 0, label: 'Flexible', sub: '4% APY' },{ val: 30, label: '30 Days', sub: '8% APY' },{ val: 90, label: '90 Days', sub: '12% APY' }].map((opt) => (<button key={opt.val} onClick={() => setStakeDuration(opt.val as any)} className={`py-3 px-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${stakeDuration === opt.val ? 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-white shadow-lg shadow-purple-900/20' : 'bg-gray-50 dark:bg-[#161920] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'}`}><span className="text-xs font-bold uppercase">{opt.label}</span><span className={`text-[10px] font-mono font-bold ${stakeDuration === opt.val ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>{opt.sub}</span></button>))}</div></div>
                                <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-200 dark:border-purple-500/20 p-4 relative overflow-hidden"><div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-white/10"><span className="text-xs text-gray-600 dark:text-gray-400">Expected Yield (Yearly)</span><div className="text-right"><span className="block text-lg font-mono font-bold text-green-600 dark:text-green-400">+{expectedYield} G</span><span className="text-[10px] text-green-700 dark:text-green-600 font-bold bg-green-500/10 px-1.5 rounded">{apy}% APY</span></div></div><div className="flex justify-between items-center"><span className="text-xs text-gray-600 dark:text-gray-400">Voting Power</span><div className="text-right"><span className="block text-lg font-mono font-bold text-purple-600 dark:text-purple-400">{vpBoost} VP</span><span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-purple-500/10 px-1.5 rounded">{vpMultiplier}x Multiplier</span></div></div></div>
                                <div><div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 mb-4"><span className="material-symbols-outlined text-sm">lock</span>Staked tokens are escrowed for security.</div><button onClick={handleStakeConfirm} disabled={!amount || Number(amount) <= 0 || Number(amount) > CURRENT_USER.balance_g} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 glow-purple"><span className="material-symbols-outlined">verified_user</span>STAKE & CLAIM POWER</button></div>
                            </div>
                        )}
                        {stakeStep === 'processing' && (<div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in h-full"><div className="relative mb-6"><div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center text-purple-500"><span className="material-symbols-outlined animate-pulse">lock</span></div></div><h4 className="text-gray-900 dark:text-white font-bold text-xl">Locking Assets...</h4><p className="text-sm text-gray-500 mt-2 font-mono">Interacting with Governance Contract</p></div>)}
                        {stakeStep === 'success' && (<div className="flex flex-col items-center justify-center py-8 text-center animate-scale-up h-full"><div className="w-20 h-20 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-6 border border-purple-500/30 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"><span className="material-symbols-outlined text-4xl">shield</span></div><h4 className="text-gray-900 dark:text-white font-bold text-2xl mb-2">Power Claimed!</h4><p className="text-gray-500 mb-6 max-w-xs">You have successfully staked <span className="text-gray-900 dark:text-white font-bold">{amount} KNOW-G</span>. Your voting power has increased.</p><div className="w-full bg-gray-50 dark:bg-[#161b22] p-3 rounded-lg border border-gray-200 dark:border-gray-800 flex justify-between items-center"><span className="text-xs text-gray-500 font-mono">Tx Hash: 0x9b...3c1</span><button className="text-blue-500 hover:text-blue-400 text-xs font-bold flex items-center gap-1">View Receipt <span className="material-symbols-outlined text-[10px]">open_in_new</span></button></div></div>)}
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    return null; // Fallback
};

export const WalletView = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'history'>('dashboard');
  const [activeModal, setActiveModal] = useState<'buy' | 'swap' | 'stake' | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<'U' | 'G' | null>(null);
  
  // History View States
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'swap' | 'stake'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Rank Badge Style Logic
  const getRankBadgeStyle = (isGold: boolean) => {
      if (isGold) return 'border-yellow-500 text-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_-3px_rgba(234,179,8,0.4)]';
      return 'border-blue-500 text-blue-500 bg-blue-500/10';
  };

  const handleAssetAction = (action: string) => {
      setSelectedAsset(null); // Close detail modal
      // Delay slightly for smooth transition
      setTimeout(() => {
          if (action === 'buy') setActiveModal('buy');
          if (action === 'swap') setActiveModal('swap');
          if (action === 'stake') setActiveModal('stake');
      }, 100);
  };

  // --- FILTERING LOGIC ---
  const filteredHistory = useMemo(() => {
      let filtered = HISTORY_DATA;
      
      // 1. Tab Filter
      if (activeTab === 'income') filtered = filtered.filter(tx => tx.amount > 0 && tx.type !== 'swap');
      if (activeTab === 'expense') filtered = filtered.filter(tx => tx.amount < 0 && tx.type !== 'stake');
      if (activeTab === 'swap') filtered = filtered.filter(tx => tx.type === 'swap');
      if (activeTab === 'stake') filtered = filtered.filter(tx => tx.type === 'stake' || (tx.type === 'earn' && tx.token === 'G'));

      // 2. Date Filter
      if (dateFrom) filtered = filtered.filter(tx => new Date(tx.date) >= new Date(dateFrom));
      if (dateTo) filtered = filtered.filter(tx => new Date(tx.date) <= new Date(new Date(dateTo).setHours(23,59,59)));

      // 3. Search Filter
      if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          filtered = filtered.filter(tx => 
              tx.label.toLowerCase().includes(lowerQ) || 
              tx.subLabel?.toLowerCase().includes(lowerQ) ||
              tx.txHash.toLowerCase().includes(lowerQ)
          );
      }

      return filtered;
  }, [activeTab, dateFrom, dateTo, searchQuery]);

  // Group by Date
  const groupedHistory = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};
      filteredHistory.forEach(tx => {
          const d = formatDate(tx.date);
          if (!groups[d]) groups[d] = [];
          groups[d].push(tx);
      });
      return groups;
  }, [filteredHistory]);

  // --- VIEW 1: FULL HISTORY PAGE ---
  if (viewMode === 'history') {
      return (
          <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
              
              {/* Header with Back Button */}
              <div className="flex items-center gap-4 mb-2">
                  <button 
                      onClick={() => setViewMode('dashboard')}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                  >
                      <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                      <p className="text-xs text-gray-500">Detailed records of all your wallet activity.</p>
                  </div>
              </div>

              {/* Filters Toolbar */}
              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
                  
                  {/* Top Row: Tabs & Search */}
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                      {/* Tabs */}
                      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start overflow-x-auto no-scrollbar max-w-full">
                          {['all', 'income', 'expense', 'swap', 'stake'].map((tab) => (
                              <button
                                  key={tab}
                                  onClick={() => setActiveTab(tab as any)}
                                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                      activeTab === tab 
                                      ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                  }`}
                              >
                                  {tab}
                              </button>
                          ))}
                      </div>

                      {/* Search */}
                      <div className="relative flex-1 max-w-xs">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                          <input 
                              type="text" 
                              placeholder="Search transactions..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-700 rounded-xl py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                          />
                      </div>
                  </div>

                  {/* Bottom Row: Date Range */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date Range:</span>
                      <input 
                          type="date" 
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:[color-scheme:dark] [color-scheme:light]"
                      />
                      <span className="text-gray-400">-</span>
                      <input 
                          type="date" 
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:[color-scheme:dark] [color-scheme:light]"
                      />
                      {(dateFrom || dateTo) && (
                          <button 
                              onClick={() => { setDateFrom(''); setDateTo(''); }}
                              className="text-xs text-red-500 hover:underline ml-auto"
                          >
                              Clear Dates
                          </button>
                      )}
                  </div>
              </div>

              {/* Transaction List */}
              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
                  <div className="p-2">
                      {Object.keys(groupedHistory).length > 0 ? (
                          Object.entries(groupedHistory).map(([date, transactions]) => (
                              <div key={date} className="mb-4 last:mb-0 animate-fade-in">
                                  <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-sm z-10 border-b border-gray-100 dark:border-gray-800/50 mb-1">
                                      {date}
                                  </div>
                                  <div className="space-y-1">
                                      {(transactions as Transaction[]).map(tx => <TransactionRow key={tx.id} tx={tx} />)}
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                              <span className="material-symbols-outlined text-4xl mb-2 opacity-30">history_toggle_off</span>
                              <p className="text-sm">No transactions found matching your filters.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW 2: DASHBOARD (DEFAULT) ---
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      
      {/* 1. PORTFOLIO HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-5">
              <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      JD
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#0B0E14] p-0.5 rounded-full">
                      <span className="material-symbols-outlined text-green-500 bg-green-500/20 rounded-full p-0.5 text-xs">verified_user</span>
                  </div>
              </div>
              
              <div>
                  <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{CURRENT_USER.name}</h1>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getRankBadgeStyle(CURRENT_USER.isGold || false)}`}>
                          Professor
                      </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                      Total Knowledge Power
                  </p>
              </div>
          </div>

          <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated Net Worth</p>
              <h2 className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                  $4,250<span className="text-lg text-gray-400">.80</span>
              </h2>
          </div>
      </div>

      {/* 2. MODERN E-WALLET ASSET CARDS (ZaloPay/MoMo Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AssetCard 
              token="U" 
              balance={CURRENT_USER.balance_u} 
              subBalance={`${(CURRENT_USER.balance_u * 0.2).toLocaleString()} Escrowed`}
              onClick={() => setSelectedAsset('U')}
          />
          <AssetCard 
              token="G" 
              balance={CURRENT_USER.balance_g} 
              subBalance={`${(CURRENT_USER.balance_g * 0.6).toFixed(0)} Staked`}
              onClick={() => setSelectedAsset('G')}
          />
      </div>

      {/* 3. SMART ACTION CARDS (Pro UX) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Action 1: Buy */}
          <button 
              onClick={() => setActiveModal('buy')}
              className="group relative overflow-hidden bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-left transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_20px_-10px_rgba(34,197,94,0.3)]"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined">add_card</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-500 transition-colors">Buy Points</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">Instant</span>
                      <span>Credit Card / Crypto</span>
                  </div>
              </div>
          </button>

          {/* Action 2: Swap */}
          <button 
              onClick={() => setActiveModal('swap')}
              className="group relative overflow-hidden bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-left transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined">currency_exchange</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">Swap Tokens</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">Rate</span>
                      <span>1 G ≈ 10 U</span>
                  </div>
              </div>
          </button>

          {/* Action 3: Stake */}
          <button 
              onClick={() => setActiveModal('stake')}
              className="group relative overflow-hidden bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-left transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]"
          >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                      <span className="material-symbols-outlined">lock_clock</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-500 transition-colors">Stake Gov</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                      <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">12% APY</span>
                      <span>Earn Yield</span>
                  </div>
              </div>
          </button>
      </div>

      {/* 4. RECENT ACTIVITY PREVIEW */}
      <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-surface flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500">history</span>
                  Recent Activity
              </h3>
          </div>
          
          <div className="p-2 flex-1">
              <div className="space-y-1">
                  {/* Show only top 4 items for preview */}
                  {HISTORY_DATA.slice(0, 4).map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} />
                  ))}
              </div>
          </div>

          {/* Footer: Toggle to Full History */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161920]">
              <button 
                  onClick={() => setViewMode('history')}
                  className="w-full py-3.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-500 hover:text-primary dark:hover:text-white hover:border-primary dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
              >
                  View Full History
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
          </div>
      </div>

      {/* RENDER ACTIVE MODAL */}
      <ActionModal isOpen={!!activeModal} onClose={() => setActiveModal(null)} type={activeModal} />
      
      {/* RENDER ASSET DETAIL MODAL */}
      <AssetDetailModal 
          isOpen={!!selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
          token={selectedAsset || 'U'}
          onAction={handleAssetAction}
      />

    </div>
  );
};
