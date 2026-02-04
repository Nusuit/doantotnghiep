"use client";
import { useState } from 'react';

export const useWallet = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const handleConnect = async () => {
        // Mock connection for MVP Design Sync
        if (walletAddress) {
            setWalletAddress(null);
        } else {
            // Simulate random solana address
            setWalletAddress("8x...3j9s");
        }
    };

    return { walletAddress, handleConnect };
};
