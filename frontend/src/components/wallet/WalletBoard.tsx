"use client";
// WalletBoard Component


import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';

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

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

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

const TransactionRow: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const style = getTxStyle(tx.type);
    return (
        <div className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#161920] rounded-xl transition-all cursor-default">
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

            <div className="text-right">
                <div className={`font-mono font-bold text-sm ${tx.amount > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-900 dark:text-white'
                    }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} {tx.token}
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${tx.status === 'completed' ? 'text-gray-400' :
                    tx.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                    {tx.status}
                </div>
            </div>
        </div>
    );
};

interface AssetCardProps {
    token: 'U' | 'G';
    balance: number;
    subBalance?: string;
    onClick: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ token, balance, subBalance, onClick }) => {
    const isU = token === 'U';

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

interface AssetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: 'U' | 'G';
    onAction: (action: string) => void;
    balances: { u: number, g: number };
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ isOpen, onClose, token, onAction, balances }) => {
    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    const isU = token === 'U';
    const config = isU
        ? {
            name: 'KNOW-U',
            label: 'Utility Points',
            color: 'blue',
            icon: 'bolt',
            balance: balances.u,
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
            balance: balances.g,
            actions: [
                { id: 'stake', label: 'Stake', icon: 'lock_clock', color: 'bg-purple-600' },
                { id: 'swap', label: 'Swap', icon: 'sync_alt', color: 'bg-pink-600' },
                { id: 'history', label: 'History', icon: 'history', color: 'bg-gray-700' },
            ]
        };

    return createPortal(
        <div className="fixed inset-0 z-[10010] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-sm bg-white dark:bg-[#0B0E14] border-t sm:border border-gray-200 dark:border-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

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

const BUY_PACKAGES = [
    { price: 5, points: 500, bonus: 0 },
    { price: 10, points: 1050, bonus: 5 },
    { price: 20, points: 2200, bonus: 10 },
    { price: 50, points: 5750, bonus: 15 },
    { price: 100, points: 12000, bonus: 20 },
    { price: 200, points: 25000, bonus: 25 },
];

const PAYMENT_METHODS = [
    { id: 'qr', name: 'QR Pay (Bank)', icon: 'qr_code_scanner', color: 'text-blue-500 bg-blue-500/10' },
    { id: 'crypto', name: 'Solana Pay', icon: 'currency_bitcoin', color: 'text-purple-500 bg-purple-500/10' },
    { id: 'card', name: 'Credit Card', icon: 'credit_card', color: 'text-orange-500 bg-orange-500/10' },
];

const ActionModal = ({
    isOpen,
    onClose,
    type,
    balances
}: {
    isOpen: boolean,
    onClose: () => void,
    type: 'buy' | 'swap' | 'stake' | null,
    balances: { u: number, g: number }
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
    const [stakeDuration, setStakeDuration] = useState<30 | 90 | 0>(90);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setBuyStep('select');
            setSelectedPackage(null);
            setSelectedMethod(null);
            setSwapStep('input');
            setSwapDirection('G_TO_U');
            setStakeStep('input');
        }
    }, [isOpen]);

    if (!isOpen || !type || typeof document === 'undefined') return null;

    // --- BUY HANDLERS ---
    const handleSelectPackage = (pkg: typeof BUY_PACKAGES[0]) => setSelectedPackage(pkg);
    const handleSelectMethod = (methodId: string) => setSelectedMethod(methodId);
    const handleBuyContinue = () => { if (selectedPackage && selectedMethod) setBuyStep('confirm'); };
    const handleBuyConfirm = () => {
        if (selectedMethod === 'qr' || selectedMethod === 'crypto') setBuyStep('qr');
        else if (selectedMethod === 'card') setBuyStep('card_input');
        else { setBuyStep('processing'); setTimeout(() => { setBuyStep('success'); setTimeout(onClose, 2000); }, 2500); }
    };
    const handleBuyBack = () => {
        if (buyStep === 'confirm') setBuyStep('select');
        else if (buyStep === 'qr' || buyStep === 'card_input') setBuyStep('confirm');
    };
    const handlePaid = () => { setBuyStep('processing'); setTimeout(() => { setBuyStep('success'); setTimeout(onClose, 2500); }, 2000); };

    // --- SWAP HANDLERS ---
    const handleSwapReview = () => setSwapStep('review');
    const handleSwapConfirm = () => { setSwapStep('processing'); setTimeout(() => { setSwapStep('success'); setTimeout(onClose, 2000); }, 2000); };
    const handlePercentageClick = (percent: number, balance: number) => setAmount((balance * percent).toFixed(0));

    // --- STAKE HANDLERS ---
    const handleStakeConfirm = () => { setStakeStep('processing'); setTimeout(() => { setStakeStep('success'); setTimeout(onClose, 2000); }, 2000); };

    // --- CONFIGS ---
    const config = {
        buy: { title: 'Buy Points', color: 'green' },
        swap: { title: 'Token Swap', color: 'blue', fee: '0.0005 SOL', slippage: '< 0.1%' },
        stake: { title: 'Stake & Earn', color: 'purple' }
    }[type];

    // --- RENDER ---
    const renderBuyFlow = () => {
        const activeMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
        return (
            <>
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

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0B0E14] p-6 max-h-[70vh]">
                    {buyStep === 'select' && (
                        <div className="space-y-8 animate-fade-in">
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
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                <button onClick={handleBuyContinue} disabled={!selectedPackage || !selectedMethod} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">Continue<span className="material-symbols-outlined">arrow_forward</span></button>
                            </div>
                        </div>
                    )}
                    {(buyStep === 'processing' || buyStep === 'success') && (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                            {buyStep === 'processing' ? (<><div className="w-20 h-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6"></div><h4 className="text-gray-900 dark:text-white font-bold text-xl">Verifying Payment</h4><p className="text-sm text-gray-500 mt-2">Please do not close this window...</p></>) : (<><div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 animate-scale-up"><span className="material-symbols-outlined text-5xl">check_circle</span></div><h4 className="text-gray-900 dark:text-white font-bold text-2xl mb-2">Purchase Successful!</h4><p className="text-gray-500 mb-6">Added <span className="text-gray-900 dark:text-white font-bold">{selectedPackage?.points.toLocaleString()} KNOW-U</span> to your wallet.</p></>)}
                        </div>
                    )}
                    {buyStep === 'confirm' && (
                        <div className="text-center p-8">
                            <button onClick={handleBuyConfirm} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Mock Confirm Payment</button>
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderSwapFlow = () => {
        const isGtoU = swapDirection === 'G_TO_U';
        const fromToken = isGtoU ? 'KNOW-G' : 'KNOW-U';
        const toToken = isGtoU ? 'KNOW-U' : 'KNOW-G';
        const fromBalance = isGtoU ? balances.g : balances.u;
        const toBalance = isGtoU ? balances.u : balances.g;
        const rate = isGtoU ? 10 : 0.1;

        const toValue = amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00';

        return (
            <>
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#0F1218]"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center"><span className="material-symbols-outlined text-lg">sync_alt</span></div><div><h3 className="text-base font-bold text-gray-900 dark:text-white leading-none">Token Swap</h3><p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">Instant Exchange</p></div></div><button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button></div>
                <div className="p-6 space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {swapStep === 'input' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-gray-50 dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all focus-within:border-blue-500/50"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">You Pay</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{fromBalance.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-3xl font-mono font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-700" /><div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 min-w-[110px]"><span className={`material-symbols-outlined text-lg ${isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{isGtoU ? 'token' : 'bolt'}</span><span className="font-bold text-gray-900 dark:text-white text-sm">{fromToken.replace('KNOW-', '')}</span></div></div><div className="flex gap-2 mt-3">{[0.25, 0.5, 1].map((pct) => (<button key={pct} onClick={() => handlePercentageClick(pct, fromBalance)} className="px-2 py-1 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">{pct === 1 ? 'MAX' : `${pct * 100}%`}</button>))}</div></div>
                            <div className="flex justify-center -my-6 relative z-10"><button onClick={() => setSwapDirection(prev => prev === 'G_TO_U' ? 'U_TO_G' : 'G_TO_U')} className="w-10 h-10 bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all shadow-xl"><span className="material-symbols-outlined text-xl">swap_vert</span></button></div>
                            <div className="bg-gray-50 dark:bg-[#161920] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pt-6"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">You Receive</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{toBalance.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><div className="w-full text-3xl font-mono font-bold text-gray-900 dark:text-white opacity-80">{toValue}</div><div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 min-w-[110px]"><span className={`material-symbols-outlined text-lg ${!isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{!isGtoU ? 'token' : 'bolt'}</span><span className="font-bold text-gray-900 dark:text-white text-sm">{toToken.replace('KNOW-', '')}</span></div></div></div>
                            <div className="bg-gray-100 dark:bg-[#161b22]/50 rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="text-gray-900 dark:text-white font-mono">1 {fromToken.replace('KNOW-', '')} ≈ {rate} {toToken.replace('KNOW-', '')}</span></div><div className="flex justify-between"><span className="text-gray-500">Network Fee</span><span className="text-gray-900 dark:text-white font-mono flex items-center gap-1">{config.fee} <span className="material-symbols-outlined text-[10px] text-gray-500">local_gas_station</span></span></div><div className="flex justify-between"><span className="text-gray-500">Price Impact</span><span className="text-green-500 font-mono">{config.slippage}</span></div></div>
                            <button onClick={handleSwapReview} disabled={!amount || Number(amount) <= 0 || Number(amount) > fromBalance} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">Review Swap</button>
                        </div>
                    )}
                </div>
            </>
        );
    };

    return createPortal(
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className={`relative w-full ${type === 'buy' ? 'max-w-2xl' : 'max-w-md'} bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]`}>
                {type === 'buy' ? renderBuyFlow() : type === 'swap' ? renderSwapFlow() : null}
            </div>
        </div>,
        document.body
    );
};

export const WalletBoard = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<'dashboard' | 'history'>('dashboard');
    const [activeModal, setActiveModal] = useState<'buy' | 'swap' | 'stake' | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<'U' | 'G' | null>(null);

    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'swap' | 'stake'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const balance_u = user ? 1240 : 1240;
    const balance_g = user ? 4500 : 4500;

    const handleAssetAction = (action: string) => {
        setSelectedAsset(null);
        setTimeout(() => {
            if (action === 'buy') setActiveModal('buy');
            if (action === 'swap') setActiveModal('swap');
            if (action === 'stake') setActiveModal('stake');
        }, 100);
    };

    const filteredHistory = useMemo(() => {
        let filtered = HISTORY_DATA;
        if (activeTab === 'income') filtered = filtered.filter(tx => tx.amount > 0 && tx.type !== 'swap');
        if (activeTab === 'expense') filtered = filtered.filter(tx => tx.amount < 0 && tx.type !== 'stake');
        if (activeTab === 'swap') filtered = filtered.filter(tx => tx.type === 'swap');
        if (activeTab === 'stake') filtered = filtered.filter(tx => tx.type === 'stake' || (tx.type === 'earn' && tx.token === 'G'));
        if (dateFrom) filtered = filtered.filter(tx => new Date(tx.date) >= new Date(dateFrom));
        if (dateTo) filtered = filtered.filter(tx => new Date(tx.date) <= new Date(new Date(dateTo).setHours(23, 59, 59)));
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

    // --- VIEW 1: HISTORY ---
    if (viewMode === 'history') {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in relative z-10">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => setViewMode('dashboard')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                        <p className="text-xs text-gray-500">Detailed records of all your wallet activity.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start overflow-x-auto no-scrollbar max-w-full">
                            {['all', 'income', 'expense', 'swap', 'stake'].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{tab}</button>
                            ))}
                        </div>
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 border border-transparent focus-within:border-blue-500 transition-all flex-1">
                            <span className="material-symbols-outlined text-gray-400">search</span>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search transactions..." className="bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white w-full ml-2 placeholder-gray-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 space-y-2">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                        ) : (
                            <div className="text-center py-12 text-gray-400">No transactions found</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: DASHBOARD ---
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-1">My Wallet</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Solana Mainnet Beta
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('history')} className="p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all text-gray-600 dark:text-gray-300">
                        <span className="material-symbols-outlined">history</span>
                    </button>
                    <button className="p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all text-gray-600 dark:text-gray-300">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <AssetCard token="U" balance={balance_u} subBalance="+234 Score" onClick={() => setSelectedAsset('U')} />
                <AssetCard token="G" balance={balance_g} subBalance="Voting Power: 1x" onClick={() => setSelectedAsset('G')} />
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { id: 'buy', label: 'Top Up', icon: 'add_card', color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
                    { id: 'send', label: 'Send', icon: 'send', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
                    { id: 'swap', label: 'Swap', icon: 'sync_alt', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
                    { id: 'stake', label: 'Stake', icon: 'lock_clock', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
                ].map(action => (
                    <button key={action.id} onClick={() => setActiveModal(action.id as any)} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 p-4 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined text-xl">{action.icon}</span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{action.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
                    <button onClick={() => setViewMode('history')} className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest">View All</button>
                </div>
                <div className="space-y-2">
                    {HISTORY_DATA.slice(0, 4).map(tx => <TransactionRow key={tx.id} tx={tx} />)}
                </div>
            </div>

            <AssetDetailModal
                isOpen={selectedAsset !== null}
                onClose={() => setSelectedAsset(null)}
                token={selectedAsset || 'U'}
                onAction={handleAssetAction}
                balances={{ u: balance_u, g: balance_g }}
            />

            <ActionModal
                isOpen={activeModal !== null}
                onClose={() => setActiveModal(null)}
                type={activeModal}
                balances={{ u: balance_u, g: balance_g }}
            />
        </div>
    );
};
