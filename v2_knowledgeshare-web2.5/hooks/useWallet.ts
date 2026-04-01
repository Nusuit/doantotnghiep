
import { useState } from 'react';

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = () => {
    if (walletAddress) {
      setWalletAddress(null);
    } else {
      // Simulate Solana Phantom Connection (Base58)
      setWalletAddress('H7xX...9mPq');
    }
  };

  return {
    walletAddress,
    handleConnect,
    isConnected: !!walletAddress
  };
};
