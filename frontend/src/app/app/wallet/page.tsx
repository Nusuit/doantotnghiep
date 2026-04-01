"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

// --- MOCK DATA ---
const CURRENT_USER = {
  name: 'Jane Doe',
  balance_u: 2450,
  balance_g: 840,
  isGold: true,
};

interface Transaction {
  id: number;
  type: 'buy' | 'earn' | 'swap' | 'stake' | 'unlock' | 'send' | 'receive';
  label: string;
  subLabel?: string;
  amount: number;
  token: 'U' | 'G';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  txHash: string;
}

const HISTORY_DATA: Transaction[] = [
  { id: 1, type: 'buy', label: 'Purchased Points', subLabel: 'Credit Card', amount: 500, token: 'U', date: '2026-02-12', status: 'completed', txHash: '0x8a7d...2b9c' },
  { id: 2, type: 'earn', label: 'Knowledge Published', subLabel: 'Article #423', amount: 120, token: 'U', date: '2026-02-12', status: 'completed', txHash: '0x9bc2...3e1f' },
  { id: 3, type: 'swap', label: 'Token Exchange', subLabel: '100 G → 1000 U', amount: 1000, token: 'U', date: '2026-02-11', status: 'completed', txHash: '0x5e6f...8a2d' },
  { id: 4, type: 'stake', label: 'Staked Governance', subLabel: '90-Day Lock', amount: -200, token: 'G', date: '2026-02-10', status: 'completed', txHash: '0x3c4d...7b1a' },
  { id: 5, type: 'earn', label: 'Staking Reward', subLabel: '12% APY', amount: 85, token: 'G', date: '2026-02-09', status: 'completed', txHash: '0x2b3c...6a9e' },
  { id: 6, type: 'unlock', label: 'Stake Matured', subLabel: 'From 30-Day Lock', amount: 150, token: 'G', date: '2026-02-08', status: 'completed', txHash: '0x1a2b...5c8d' },
  { id: 7, type: 'send', label: 'Sent to @alice', subLabel: 'Gift Transfer', amount: -50, token: 'U', date: '2026-02-07', status: 'completed', txHash: '0x9d8e...4f7c' },
  { id: 8, type: 'receive', label: 'From @bob', subLabel: 'Collaboration Fee', amount: 200, token: 'U', date: '2026-02-06', status: 'completed', txHash: '0x8c7d...3e6b' },
  { id: 9, type: 'swap', label: 'G to U Exchange', subLabel: '50 G → 500 U', amount: 500, token: 'U', date: '2026-02-05', status: 'completed', txHash: '0x7b6c...2d5a' },
];

// --- BUY POINTS CONFIGURATION ---
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
  { id: 'crypto', name: 'Solana Pay', icon: 'currency_bitcoin', color: 'text-cyan-500 bg-cyan-500/10' },
  { id: 'card', name: 'Credit Card', icon: 'credit_card', color: 'text-blue-500 bg-blue-500/10' },
];

// --- HELPER: FORMAT DATE ---
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getDate() === d2.getDate() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getFullYear() === d2.getFullYear();
  
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- HELPER: INFO TOOLTIP ---
const InfoTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block cursor-help">
    <span className="material-symbols-outlined text-[14px] text-gray-400">help</span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50 shadow-xl">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
    </div>
  </div>
);

// --- COMPONENT: TRANSACTION ROW ---
const TransactionRow = ({ tx }: { tx: Transaction }) => {
  const typeIcons = {
    buy: 'shopping_cart',
    earn: 'trending_up',
    swap: 'swap_horiz',
    stake: 'lock',
    unlock: 'lock_open',
    send: 'arrow_upward',
    receive: 'arrow_downward',
  }[tx.type];

  const isPositive = tx.amount > 0;
  const amountColor = isPositive 
    ? 'text-green-600 dark:text-green-400 bg-green-500/10' 
    : 'text-red-600 dark:text-red-400 bg-red-500/10';

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-default group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${amountColor} border-current/20`}>
          <span className="material-symbols-outlined text-base">{typeIcons}</span>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">{tx.label}</div>
          {tx.subLabel && <div className="text-[10px] text-gray-500 dark:text-gray-400">{tx.subLabel}</div>}
          <div className="text-[9px] text-gray-400 font-mono mt-0.5">{formatDate(tx.date)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs font-mono font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? '+' : ''}{tx.amount}
        </div>
        <div className="text-[10px] text-gray-500 font-mono">{tx.token}</div>
      </div>
    </div>
  );
};

// --- COMPONENT: ASSET CARD ---
const AssetCard = ({ 
  token, 
  balance, 
  subBalance, 
  onClick 
}: { 
  token: 'U' | 'G'; 
  balance: number; 
  subBalance: string; 
  onClick: () => void;
}) => {
  const isU = token === 'U';
  const config = isU 
    ? {
        name: 'KNOW-U',
        label: 'Utility Points',
        icon: 'bolt',
        borderColor: 'border-l-blue-500',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-600 dark:text-blue-400',
        hoverShadow: 'hover:shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]'
      }
    : {
        name: 'KNOW-G',
        label: 'Governance Token',
        icon: 'token',
        borderColor: 'border-l-purple-500',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-600 dark:text-purple-400',
        hoverShadow: 'hover:shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]'
      };

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white dark:bg-white/5 border-l-3 ${config.borderColor} border-y border-r border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-left transition-all duration-300 ${config.hoverShadow} hover:border-r-gray-400 dark:hover:border-white/20`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center border border-current/20 ${config.iconColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          <span className="material-symbols-outlined text-xl">{config.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{config.name}</span>
            <InfoTooltip text={config.label} />
          </div>
          <h3 className="text-xl font-mono font-bold text-gray-900 dark:text-white mb-0.5">
          {balance.toLocaleString()}
          </h3>
          <p className="text-[9px] text-gray-500 font-mono">{subBalance}</p>
        </div>
        
        <span className="material-symbols-outlined text-base text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0">
          arrow_forward
        </span>
      </div>
    </button>
  );
};

// --- COMPONENT: ASSET DETAIL MODAL ---
const AssetDetailModal = ({ 
  isOpen, 
  onClose, 
  token,
  onAction 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  token: 'U' | 'G';
  onAction: (action: string) => void;
}) => {
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
          { id: 'swap', label: 'Swap', icon: 'sync_alt', color: 'bg-blue-600' },
          { id: 'history', label: 'History', icon: 'history', color: 'bg-gray-700' },
        ]
      };

  return createPortal(
    <div className="fixed inset-0 z-[10010] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-white dark:bg-white/5 border-t sm:border border-gray-200 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        
        <div className={`p-5 pb-6 ${isU ? 'bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-900/50 dark:to-cyan-900/50' : 'bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-900/50 dark:to-pink-900/50'}`}>
          <div className="flex justify-between items-center mb-4">
            <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">{config.label}</span>
            <button className="p-1.5 -mr-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-2xl text-white shadow-lg mb-3 ${isU ? 'bg-blue-500' : 'bg-purple-500'}`}>
              <span className="material-symbols-outlined">{config.icon}</span>
            </div>
            <h2 className="text-3xl font-mono font-bold text-white mb-0.5">{config.balance.toLocaleString()}</h2>
            <p className="text-xs text-white/80 font-medium">Available {config.name}</p>
          </div>
        </div>

        <div className="px-5 -mt-5">
          <div className="flex justify-center gap-3 bg-gray-50 dark:bg-white/5 p-3 rounded-xl shadow-xl border border-gray-200 dark:border-white/10">
            {config.actions.map(action => (
              <button 
                key={action.id}
                onClick={() => { onClose(); onAction(action.id); }}
                className="flex flex-col items-center gap-1.5 group min-w-[56px]"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 ${action.color}`}>
                  <span className="material-symbols-outlined text-lg">{action.icon}</span>
                </div>
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors uppercase tracking-wide">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Recent Activity</h3>
          <div className="space-y-1.5">
            {HISTORY_DATA.filter(tx => tx.token === token).slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-default">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700`}>
                    <span className={`material-symbols-outlined text-xs ${tx.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tx.amount > 0 ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-900 dark:text-white">{tx.label}</div>
                    <div className="text-[9px] text-gray-500">{formatDate(tx.date)}</div>
                  </div>
                </div>
                <div className={`text-xs font-mono font-bold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
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
      setStakeDuration(90);
    }
  }, [isOpen]);

  if (!isOpen || !type) return null;

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

  // --- RENDER BUY FLOW ---
  if (type === 'buy') {
    const activeMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);

    return createPortal(
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-blue-500 bg-opacity-20 flex items-center justify-center text-blue-600 dark:text-blue-500`}>
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

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-white/5 p-6">
            {buyStep === 'select' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">1</span>
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Select Amount</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BUY_PACKAGES.map((pkg) => {
                      const isSelected = selectedPackage?.price === pkg.price;
                      return (
                        <button
                          key={pkg.price}
                          onClick={() => handleSelectPackage(pkg)}
                          className={`relative p-4 rounded-xl border-2 transition-all group ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-gray-400 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                          <div className="text-center mb-1"><span className={`text-lg font-bold ${isSelected ? 'text-blue-600 dark:text-white' : 'text-gray-900 dark:text-gray-300'}`}>${pkg.price}</span></div>
                          <div className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-black/30 rounded py-1"><span className="material-symbols-outlined text-[12px] text-blue-500">bolt</span><span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{pkg.points.toLocaleString()}</span></div>
                          {pkg.bonus > 0 && <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">+{pkg.bonus}%</div>}
                          {isSelected && <div className="absolute top-2 left-2 text-blue-500"><span className="material-symbols-outlined text-lg">check_circle</span></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4"><span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">2</span><h4 className="text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Payment Method</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedMethod === method.id;
                      return (
                        <button key={method.id} onClick={() => handleSelectMethod(method.id)} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/20'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.color}`}><span className="material-symbols-outlined">{method.icon}</span></div>
                          <div><div className={`text-xs font-bold ${isSelected ? 'text-blue-600 dark:text-white' : 'text-gray-900 dark:text-gray-300'}`}>{method.name}</div><div className="text-[10px] text-gray-500">Instant Process</div></div>
                          {isSelected && <div className="ml-auto text-blue-500"><span className="material-symbols-outlined">check_circle</span></div>}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                  <button onClick={handleBuyContinue} disabled={!selectedPackage || !selectedMethod} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">Continue<span className="material-symbols-outlined">arrow_forward</span></button>
                </div>
              </div>
            )}
            {buyStep === 'confirm' && selectedPackage && activeMethod && (
              <div className="space-y-6 animate-fade-in max-w-sm mx-auto">
                <div className="text-center mb-6"><div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30"><span className="material-symbols-outlined text-3xl text-blue-500">receipt_long</span></div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3><p className="text-sm text-gray-500">Review your transaction details</p></div>
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Package</span><span className="text-sm font-bold text-gray-900 dark:text-white">${selectedPackage.price}.00</span></div>
                  <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Method</span><div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-gray-500">{activeMethod.icon}</span><span className="text-sm font-bold text-gray-900 dark:text-white">{activeMethod.name}</span></div></div>
                  <div className="p-4 bg-gray-100 dark:bg-gray-800/30 flex justify-between items-center"><span className="text-sm text-gray-500 dark:text-gray-400">Total Receive</span><div className="text-right"><span className="block text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{selectedPackage.points.toLocaleString()} U</span>{selectedPackage.bonus > 0 && <span className="text-[10px] text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">Includes {selectedPackage.bonus}% Bonus</span>}</div></div>
                </div>
                <div className="flex gap-3 pt-2"><button onClick={handleBuyBack} className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button><button onClick={handleBuyConfirm} className="flex-[2] py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-lg">check_circle</span>Confirm Payment</button></div>
              </div>
            )}
            {buyStep === 'qr' && selectedPackage && (
              <div className="flex flex-col items-center text-center animate-fade-in py-4">
                <div className="mb-6"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Scan to Pay</h3><p className="text-sm text-gray-500">Amount: <span className="text-blue-600 dark:text-blue-400 font-bold font-mono text-lg">${selectedPackage.price}.00</span></p></div>
                <div className="p-4 bg-white rounded-2xl mb-6 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] border border-gray-200 relative group cursor-pointer">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=payment_know_u_${selectedPackage.price}_usd`} alt="Payment QR" className="w-48 h-48 mix-blend-multiply" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-2xl"><span className="text-black font-bold text-sm">Click to Copy Link</span></div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8"><span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700"><span className="material-symbols-outlined text-sm animate-pulse text-yellow-500">timer</span> 09:59</span><span>Waiting for payment...</span></div>
                <div className="w-full max-w-sm flex gap-3"><button onClick={handleBuyBack} className="flex-1 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button><button onClick={handlePaid} className="flex-[2] py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">I Have Paid</button></div>
              </div>
            )}
            {buyStep === 'card_input' && selectedPackage && (
              <div className="animate-fade-in p-2 max-w-md mx-auto">
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 flex gap-3 mb-6">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">shield_lock</span>
                  <div className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed"><span className="font-bold block mb-1">Your card information is protected</span>We partner with trusted payment providers to ensure your card details are absolutely secure.</div>
                </div>
                <div className="text-center mb-8"><span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Payment</span><div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mt-1">${selectedPackage.price}.00</div></div>
                <div className="space-y-5">
                  <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Card Number</label><div className="relative"><input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /><span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">credit_card</span></div></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Expiry Date</label><input type="text" placeholder="MM/YY" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /></div><div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1">CVV <span className="material-symbols-outlined text-[14px] text-gray-400 cursor-help" title="3 digits on back">help</span></label><input type="text" placeholder="123" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /></div></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Cardholder Name</label><input type="text" placeholder="NGUYEN VAN A" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-gray-900 dark:text-white uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" /></div>
                </div>
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-white/10"><button onClick={handleBuyBack} className="py-3 px-6 rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button><button onClick={handlePaid} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 transform active:scale-95">Pay Now</button></div>
              </div>
            )}
            {(buyStep === 'processing' || buyStep === 'success') && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                {buyStep === 'processing' ? (<><div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div><h4 className="text-gray-900 dark:text-white font-bold text-xl">Verifying Payment</h4><p className="text-sm text-gray-500 mt-2">Please do not close this window...</p></>) : (<><div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-6 animate-scale-up"><span className="material-symbols-outlined text-5xl">check_circle</span></div><h4 className="text-gray-900 dark:text-white font-bold text-2xl mb-2">Purchase Successful!</h4><p className="text-gray-500 mb-6">Added <span className="text-gray-900 dark:text-white font-bold">{selectedPackage?.points.toLocaleString()} KNOW-U</span> to your wallet.</p></>)}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- RENDER SWAP FLOW ---
  if (type === 'swap') {
    const isGtoU = swapDirection === 'G_TO_U';
    const fromToken = isGtoU ? 'KNOW-G' : 'KNOW-U';
    const toToken = isGtoU ? 'KNOW-U' : 'KNOW-G';
    const fromBalance = isGtoU ? CURRENT_USER.balance_g : CURRENT_USER.balance_u;
    const toBalance = isGtoU ? CURRENT_USER.balance_u : CURRENT_USER.balance_g;
    const rate = isGtoU ? 10 : 0.1;
    
    const fromValue = amount;
    const toValue = amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00';

    return createPortal(
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center"><span className="material-symbols-outlined text-lg">sync_alt</span></div><div><h3 className="text-base font-bold text-gray-900 dark:text-white leading-none">Token Swap</h3><p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">Instant Exchange</p></div></div><button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button></div>
          <div className="p-6 space-y-2">
            {swapStep === 'input' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 transition-all focus-within:border-blue-500/50"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">You Pay</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{fromBalance.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-3xl font-mono font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-700"/><div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/10 min-w-[110px]"><span className={`material-symbols-outlined text-lg ${isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{isGtoU ? 'token' : 'bolt'}</span><span className="font-bold text-gray-900 dark:text-white text-sm">{fromToken.replace('KNOW-', '')}</span></div></div><div className="flex gap-2 mt-3">{[0.25, 0.5, 1].map((pct) => (<button key={pct} onClick={() => handlePercentageClick(pct, fromBalance)} className="px-2 py-1 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">{pct === 1 ? 'MAX' : `${pct * 100}%`}</button>))}</div></div>
                <div className="flex justify-center -my-6 relative z-10"><button onClick={() => setSwapDirection(prev => prev === 'G_TO_U' ? 'U_TO_G' : 'G_TO_U')} className="w-10 h-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all shadow-xl"><span className="material-symbols-outlined text-xl">swap_vert</span></button></div>
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 pt-6"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">You Receive</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{toBalance.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><div className="w-full text-3xl font-mono font-bold text-gray-900 dark:text-white opacity-80">{toValue}</div><div className="flex items-center gap-2 bg-gray-200 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-white/10 min-w-[110px]"><span className={`material-symbols-outlined text-lg ${!isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{!isGtoU ? 'token' : 'bolt'}</span><span className="font-bold text-gray-900 dark:text-white text-sm">{toToken.replace('KNOW-', '')}</span></div></div></div>
                <div className="bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 p-3 space-y-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="text-gray-900 dark:text-white font-mono">1 {fromToken.replace('KNOW-', '')} ≈ {rate} {toToken.replace('KNOW-', '')}</span></div><div className="flex justify-between"><span className="text-gray-500">Network Fee</span><span className="text-gray-900 dark:text-white font-mono flex items-center gap-1">0.0005 SOL <span className="material-symbols-outlined text-[10px] text-gray-500">local_gas_station</span></span></div><div className="flex justify-between"><span className="text-gray-500">Price Impact</span><span className="text-green-500 font-mono">&lt; 0.1%</span></div></div>
                <button onClick={handleSwapReview} disabled={!amount || Number(amount) <= 0 || Number(amount) > fromBalance} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">Review Swap</button>
              </div>
            )}
            {swapStep === 'review' && (<div className="space-y-6 animate-fade-in pt-2"><div className="text-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">You are swapping</span><div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mt-1 mb-6">{amount} <span className={`text-xl ${isGtoU ? 'text-purple-500' : 'text-blue-500'}`}>{fromToken}</span></div><div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-white/10 flex items-center justify-center mx-auto -my-4 relative z-10"><span className="material-symbols-outlined text-gray-400 text-sm">arrow_downward</span></div></div><div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 mt-4"><div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-white/10"><span className="text-gray-500 text-sm">Receive (Est.)</span><span className="text-xl font-bold text-blue-500 font-mono">{toValue} {toToken}</span></div><div className="space-y-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Protocol Provider</span><span className="text-gray-900 dark:text-white">Knowledge AMM v2</span></div><div className="flex justify-between"><span className="text-gray-500">Route</span><span className="text-gray-900 dark:text-white font-mono">{fromToken} &gt; SOL &gt; {toToken}</span></div></div></div><div className="flex gap-3"><button onClick={() => setSwapStep('input')} className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button><button onClick={handleSwapConfirm} className="flex-[2] py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-lg">fingerprint</span> Confirm Swap</button></div></div>)}
            {(swapStep === 'processing' || swapStep === 'success') && (<div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">{swapStep === 'processing' ? (<><div className="relative mb-6"><div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center text-blue-500"><span className="material-symbols-outlined animate-pulse">sync</span></div></div><h4 className="text-gray-900 dark:text-white font-bold text-lg">Swapping Tokens...</h4><p className="text-xs text-gray-500 mt-1 font-mono">Interacting with Solana Smart Contract</p></>) : (<><div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 animate-scale-up"><span className="material-symbols-outlined text-3xl">check</span></div><h4 className="text-gray-900 dark:text-white font-bold text-2xl mb-2">Swap Complete!</h4><p className="text-sm text-gray-500 mb-6">Received <span className="text-blue-500 font-bold">{toValue} {toToken}</span></p><div className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/10 flex justify-between items-center"><span className="text-xs text-gray-500 font-mono">Tx: 0x8a...2b9</span><button className="text-blue-500 hover:text-blue-400 text-xs font-bold flex items-center gap-1">View on Solscan <span className="material-symbols-outlined text-[10px]">open_in_new</span></button></div></>)}</div>)}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- RENDER STAKE FLOW ---
  if (type === 'stake') {
    const apy = stakeDuration === 90 ? 12 : stakeDuration === 30 ? 8 : 4;
    const vpMultiplier = stakeDuration === 90 ? 2 : stakeDuration === 30 ? 1.5 : 1;
    const vpBoost = amount ? (Number(amount) * vpMultiplier).toLocaleString() : '0';
    const expectedYield = amount ? (Number(amount) * (apy / 100)).toFixed(2) : '0.00';

    return createPortal(
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col">
          <div className="absolute top-0 right-0 z-0 opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/4"><span className="material-symbols-outlined text-[250px] text-purple-500">lock_clock</span></div>
          <div className="relative z-10 p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50/90 dark:bg-white/5 backdrop-blur-sm flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center border border-purple-500/30"><span className="material-symbols-outlined text-lg">shield_lock</span></div><div><h3 className="text-base font-serif font-bold text-gray-900 dark:text-white leading-none">Governance Staking</h3><p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-wider">Lock G for Power & Yield</p></div></div><button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button></div>
          <div className="p-6 space-y-6 relative z-10 flex-1">
            {stakeStep === 'input' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white text-center leading-tight">Lock KNOW-G for <br/><span className="text-purple-500">Governance Power</span></h2>
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 transition-all focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20"><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2"><span className="font-bold uppercase tracking-wider">Stake Amount</span><span>Balance: <span className="text-gray-900 dark:text-white font-mono">{CURRENT_USER.balance_g.toLocaleString()}</span></span></div><div className="flex items-center gap-4"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus className="w-full bg-transparent text-3xl font-mono font-bold text-gray-900 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-700"/><div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 min-w-[100px]"><span className="material-symbols-outlined text-lg text-purple-500">token</span><span className="font-bold text-purple-600 dark:text-purple-400 text-sm">KNOW-G</span></div></div><div className="flex gap-2 mt-3">{[0.25, 0.5, 1].map((pct) => (<button key={pct} onClick={() => handlePercentageClick(pct, CURRENT_USER.balance_g)} className="px-2 py-1 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">{pct === 1 ? 'MAX' : `${pct * 100}%`}</button>))}</div></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Lock Duration</label><div className="grid grid-cols-3 gap-2">{[{ val: 0, label: 'Flexible', sub: '4% APY' },{ val: 30, label: '30 Days', sub: '8% APY' },{ val: 90, label: '90 Days', sub: '12% APY' }].map((opt) => (<button key={opt.val} onClick={() => setStakeDuration(opt.val as any)} className={`py-3 px-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${stakeDuration === opt.val ? 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-white shadow-lg shadow-purple-900/20' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/20'}`}><span className="text-xs font-bold uppercase">{opt.label}</span><span className={`text-[10px] font-mono font-bold ${stakeDuration === opt.val ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>{opt.sub}</span></button>))}</div></div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/10 rounded-xl border border-purple-200 dark:border-purple-500/20 p-4 relative overflow-hidden"><div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-300 dark:border-white/10"><span className="text-xs text-gray-600 dark:text-gray-400">Expected Yield (Yearly)</span><div className="text-right"><span className="block text-lg font-mono font-bold text-green-600 dark:text-green-400">+{expectedYield} G</span><span className="text-[10px] text-green-700 dark:text-green-600 font-bold bg-green-500/10 px-1.5 rounded">{apy}% APY</span></div></div><div className="flex justify-between items-center"><span className="text-xs text-gray-600 dark:text-gray-400">Voting Power</span><div className="text-right"><span className="block text-lg font-mono font-bold text-purple-600 dark:text-purple-400">{vpBoost} VP</span><span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-purple-500/10 px-1.5 rounded">{vpMultiplier}x Multiplier</span></div></div></div>
                <div><div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 mb-4"><span className="material-symbols-outlined text-sm">lock</span>Staked tokens are escrowed for security.</div><button onClick={handleStakeConfirm} disabled={!amount || Number(amount) <= 0 || Number(amount) > CURRENT_USER.balance_g} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"><span className="material-symbols-outlined">verified_user</span>STAKE & CLAIM POWER</button></div>
              </div>
            )}
            {stakeStep === 'processing' && (<div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in h-full"><div className="relative mb-6"><div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center text-purple-500"><span className="material-symbols-outlined animate-pulse">lock</span></div></div><h4 className="text-gray-900 dark:text-white font-bold text-xl">Locking Assets...</h4><p className="text-sm text-gray-500 mt-2 font-mono">Interacting with Governance Contract</p></div>)}
            {stakeStep === 'success' && (<div className="flex flex-col items-center justify-center py-8 text-center animate-scale-up h-full"><div className="w-20 h-20 bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-6 border border-purple-500/30 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]"><span className="material-symbols-outlined text-4xl">shield</span></div><h4 className="text-gray-900 dark:text-white font-bold text-2xl mb-2">Power Claimed!</h4><p className="text-gray-500 mb-6 max-w-xs">You have successfully staked <span className="text-gray-900 dark:text-white font-bold">{amount} KNOW-G</span>. Your voting power has increased.</p><div className="w-full bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/10 flex justify-between items-center"><span className="text-xs text-gray-500 font-mono">Tx Hash: 0x9b...3c1</span><button className="text-blue-500 hover:text-blue-400 text-xs font-bold flex items-center gap-1">View Receipt <span className="material-symbols-outlined text-[10px]">open_in_new</span></button></div></div>)}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return null;
};

// --- MAIN WALLET VIEW ---
export default function WalletPage() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'history'>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<'U' | 'G' | null>(null);
  const [activeModal, setActiveModal] = useState<'buy' | 'swap' | 'stake' | null>(null);
  
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'swap' | 'stake'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getRankBadgeStyle = (isGold: boolean) => {
    if (isGold) return 'border-yellow-500 text-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_-3px_rgba(234,179,8,0.4)]';
    return 'border-blue-500 text-blue-500 bg-blue-500/10';
  };

  const handleAssetAction = (action: string) => {
    setSelectedAsset(null);
    setTimeout(() => {
      if (action === 'buy') setActiveModal('buy');
      if (action === 'swap') setActiveModal('swap');
      if (action === 'stake') setActiveModal('stake');
      if (action === 'history') setViewMode('history');
    }, 100);
  };

  const filteredHistory = useMemo(() => {
    let filtered = HISTORY_DATA;
    
    if (activeTab === 'income') filtered = filtered.filter(tx => tx.amount > 0 && tx.type !== 'swap');
    if (activeTab === 'expense') filtered = filtered.filter(tx => tx.amount < 0 && tx.type !== 'stake');
    if (activeTab === 'swap') filtered = filtered.filter(tx => tx.type === 'swap');
    if (activeTab === 'stake') filtered = filtered.filter(tx => tx.type === 'stake' || (tx.type === 'earn' && tx.token === 'G'));

    if (dateFrom) filtered = filtered.filter(tx => new Date(tx.date) >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter(tx => new Date(tx.date) <= new Date(new Date(dateTo).setHours(23,59,59)));

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

  const groupedHistory = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredHistory.forEach(tx => {
      const d = formatDate(tx.date);
      if (!groups[d]) groups[d] = [];
      groups[d].push(tx);
    });
    return groups;
  }, [filteredHistory]);

  if (viewMode === 'history') {
    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-20 animate-fade-in">
        
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => setViewMode('dashboard')}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
            <p className="text-[10px] text-gray-500">Detailed records of all your wallet activity.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3.5 shadow-sm space-y-3.5">
          
          <div className="flex flex-col md:flex-row justify-between gap-3.5">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start overflow-x-auto no-scrollbar max-w-full">
              {['all', 'income', 'expense', 'swap', 'stake'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeTab === tab 
                    ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-8 pr-3 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-white/10">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date Range:</span>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md px-2.5 py-1.5 text-[10px] text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:[color-scheme:dark]"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md px-2.5 py-1.5 text-[10px] text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:[color-scheme:dark]"
            />
            {(dateFrom || dateTo) && (
              <button 
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-[10px] text-red-500 hover:underline ml-auto"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
          <div className="p-1.5">
            {Object.keys(groupedHistory).length > 0 ? (
              Object.entries(groupedHistory).map(([date, transactions]) => (
                <div key={date} className="mb-3 last:mb-0 animate-fade-in">
                  <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-white/5 backdrop-blur-sm z-10 border-b border-gray-100 dark:border-white/10 mb-0.5">
                    {date}
                  </div>
                  <div className="space-y-0.5">
                    {(transactions as Transaction[]).map(tx => <TransactionRow key={tx.id} tx={tx} />)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                <span className="material-symbols-outlined text-3xl mb-2 opacity-30">history_toggle_off</span>
                <p className="text-xs">No transactions found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-20 animate-fade-in">
      
      {/* HEADER - Full Width */}
      <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/app/profile"
              aria-label="Back to Profile"
              title="Back to Profile"
              className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>

            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-white/10 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                JD
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                <span className="material-symbols-outlined text-white text-xs font-bold">check</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{CURRENT_USER.name}</h1>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${getRankBadgeStyle(CURRENT_USER.isGold || false)}`}>
                  Professor
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                Total Knowledge Power
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-500"><span className="font-bold text-gray-900 dark:text-white">1.2k</span> Following</span>
                <span className="text-gray-500"><span className="font-bold text-gray-900 dark:text-white">3.5k</span> Followers</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Net Worth</p>
            <h2 className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
              $4,250<span className="text-lg text-gray-400">.80</span>
            </h2>
            <p className="text-xs text-green-500 font-medium mt-1">+12.5% this month</p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Portfolio Summary */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              Portfolio
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-white/10">
                <span className="text-xs text-gray-500">Total Balance</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">$4,250.80</span>
              </div>
              
              {/* Monthly Income Chart */}
              <div className="py-3 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                  <span>Monthly Income</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-[8px] text-blue-500 font-bold">KNOW-U</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-[8px] text-purple-500 font-bold">KNOW-G</span>
                    </div>
                  </div>
                </div>
                
                {/* Line Chart */}
                <div className="relative h-32 bg-gradient-to-b from-blue-500/5 to-transparent rounded-lg p-3">
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-white/5" strokeDasharray="2,2" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-white/5" strokeDasharray="2,2" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-white/5" strokeDasharray="2,2" />
                    
                    {/* Token U Area under line */}
                    <path
                      d="M 0 80 L 50 70 L 100 55 L 150 60 L 200 35 L 250 25 L 300 20 L 300 100 L 0 100 Z"
                      fill="url(#gradientU)"
                      opacity="0.2"
                    />
                    
                    {/* Token G Area under line */}
                    <path
                      d="M 0 90 L 50 85 L 100 75 L 150 70 L 200 55 L 250 45 L 300 40 L 300 100 L 0 100 Z"
                      fill="url(#gradientG)"
                      opacity="0.2"
                    />
                    
                    {/* Token U Line */}
                    <path
                      d="M 0 80 L 50 70 L 100 55 L 150 60 L 200 35 L 250 25 L 300 20"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Token G Line */}
                    <path
                      d="M 0 90 L 50 85 L 100 75 L 150 70 L 200 55 L 250 45 L 300 40"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Token U Data points */}
                    <circle cx="0" cy="80" r="2.5" fill="#3b82f6" className="drop-shadow" />
                    <circle cx="50" cy="70" r="2.5" fill="#3b82f6" className="drop-shadow" />
                    <circle cx="100" cy="55" r="2.5" fill="#3b82f6" className="drop-shadow" />
                    <circle cx="150" cy="60" r="2.5" fill="#3b82f6" className="drop-shadow" />
                    <circle cx="200" cy="35" r="2.5" fill="#3b82f6" className="drop-shadow" />
                    <circle cx="250" cy="25" r="2.5" fill="#3b82f6" className="drop-shadow" />
                    <circle cx="300" cy="20" r="3.5" fill="#3b82f6" stroke="white" strokeWidth="2" className="drop-shadow" />
                    
                    {/* Token G Data points */}
                    <circle cx="0" cy="90" r="2.5" fill="#a855f7" className="drop-shadow" />
                    <circle cx="50" cy="85" r="2.5" fill="#a855f7" className="drop-shadow" />
                    <circle cx="100" cy="75" r="2.5" fill="#a855f7" className="drop-shadow" />
                    <circle cx="150" cy="70" r="2.5" fill="#a855f7" className="drop-shadow" />
                    <circle cx="200" cy="55" r="2.5" fill="#a855f7" className="drop-shadow" />
                    <circle cx="250" cy="45" r="2.5" fill="#a855f7" className="drop-shadow" />
                    <circle cx="300" cy="40" r="3.5" fill="#a855f7" stroke="white" strokeWidth="2" className="drop-shadow" />
                    
                    <defs>
                      <linearGradient id="gradientU" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gradientG" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Month labels */}
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] text-gray-400 font-mono">JAN</span>
                    <span className="text-[8px] text-gray-400 font-mono">FEB</span>
                    <span className="text-[8px] text-gray-400 font-mono">MAR</span>
                    <span className="text-[8px] text-gray-400 font-mono">APR</span>
                    <span className="text-[8px] text-gray-400 font-mono">MAY</span>
                    <span className="text-[8px] text-gray-400 font-mono">JUN</span>
                    <span className="text-[8px] text-blue-500 font-mono font-bold">JUL</span>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <div className="text-[9px] text-gray-500 mb-0.5">KNOW-U Earned</div>
                    <div className="text-xs font-bold text-blue-500">+1,240</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-500/5 rounded-lg border border-purple-500/20">
                    <div className="text-[9px] text-gray-500 mb-0.5">KNOW-G Earned</div>
                    <div className="text-xs font-bold text-purple-500">+320</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Cards */}
          <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* SMART ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <button 
              onClick={() => setActiveModal('buy')}
              className="group relative overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-left transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">add_card</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-blue-500 transition-colors">Buy Points</h3>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono">
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">Instant</span>
                    <span className="truncate">Card / Crypto</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-base text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0">arrow_forward</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveModal('swap')}
              className="group relative overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-left transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">currency_exchange</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-purple-500 transition-colors">Swap Tokens</h3>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono">
                    <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">Rate</span>
                    <span className="truncate">1 G ≈ 10 U</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-base text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0">arrow_forward</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveModal('stake')}
              className="group relative overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-left transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <span className="material-symbols-outlined text-xl">lock_clock</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-purple-500 transition-colors">Stake Gov</h3>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono">
                    <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">12% APY</span>
                    <span className="truncate">Earn Yield</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-base text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0">arrow_forward</span>
              </div>
            </button>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-gray-500">history</span>
                Recent Activity
              </h3>
            </div>
            
            <div className="p-3 flex-1">
              <div className="space-y-1">
                {HISTORY_DATA.slice(0, 5).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <button 
                onClick={() => setViewMode('history')}
                className="w-full py-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-500 hover:text-blue-600 dark:hover:text-white hover:border-blue-600 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
              >
                View Full History
                <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <AssetDetailModal 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        token={selectedAsset || 'U'}
        onAction={handleAssetAction}
      />

      <ActionModal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        type={activeModal} 
      />

    </div>
  );
}
