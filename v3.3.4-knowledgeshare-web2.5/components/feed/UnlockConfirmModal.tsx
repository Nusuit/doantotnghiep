
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface UnlockConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    price: number;
    balance: number;
    title: string;
}

export const UnlockConfirmModal: React.FC<UnlockConfirmModalProps> = ({ 
    isOpen, onClose, onConfirm, price, balance, title 
}) => {
    const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
    
    // Reset step when reopening
    useEffect(() => {
        if (isOpen) setStep('confirm');
    }, [isOpen]);

    const handleConfirm = () => {
        setStep('processing');
        // Simulate Blockchain Transaction Delay
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onConfirm(); // This will trigger the parent to close and unlock
            }, 1000);
        }, 1500);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={step !== 'processing' ? onClose : undefined} />
            
            <div className="relative w-full max-w-sm bg-[#0B0E14] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                
                {/* Header Decoration */}
                <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 w-full" />

                <div className="p-6">
                    {step === 'confirm' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">lock_open</span>
                                    Unlock Content
                                </h3>
                                <button onClick={onClose} className="text-gray-500 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="bg-[#161b22] rounded-xl p-4 mb-6 border border-gray-800">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Item</p>
                                <p className="text-sm text-gray-300 font-medium truncate mb-4">{title}</p>
                                
                                <div className="flex justify-between items-end border-t border-gray-700 pt-3">
                                    <div className="text-left">
                                        <p className="text-xs text-gray-500">Total Cost</p>
                                        <p className="text-xl font-mono font-bold text-white">{price} <span className="text-xs text-purple-500">KNOW-U</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Balance</p>
                                        <p className={`text-sm font-mono font-bold ${balance >= price ? 'text-green-500' : 'text-red-500'}`}>
                                            {balance}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleConfirm}
                                disabled={balance < price}
                                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">fingerprint</span>
                                Sign & Pay
                            </button>
                            {balance < price && (
                                <p className="text-center text-xs text-red-500 mt-3">Insufficient funds to proceed.</p>
                            )}
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                            <h4 className="text-white font-bold text-lg mb-1">Processing Transaction...</h4>
                            <p className="text-xs text-gray-500 font-mono">Confirming on-chain...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl">check</span>
                            </div>
                            <h4 className="text-white font-bold text-lg mb-1">Success!</h4>
                            <p className="text-xs text-gray-500">Redirecting to content...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
