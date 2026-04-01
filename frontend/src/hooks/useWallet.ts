"use client";
import { useMemo, useState } from "react";
import { API_BASE_API_URL } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";

type WalletAction = "link" | "unlink";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, display?: "hex" | "utf8") => Promise<{ signature: Uint8Array }>;
};

function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const provider = (window as any)?.phantom?.solana;
  if (!provider?.isPhantom) return null;
  return provider as PhantomProvider;
}

function toBase58(bytes: Uint8Array) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  if (bytes.length === 0) return "";
  const digits = [0];
  for (let i = 0; i < bytes.length; i += 1) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j += 1) {
      const x = digits[j] * 256 + carry;
      digits[j] = x % 58;
      carry = (x / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  let result = "";
  for (let i = 0; i < bytes.length && bytes[i] === 0; i += 1) result += alphabet[0];
  for (let i = digits.length - 1; i >= 0; i -= 1) result += alphabet[digits[i]];
  return result;
}

export const useWallet = () => {
  const { user, refreshAuth } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const walletAddress = user?.walletAddress || null;
  const isLinked = Boolean(walletAddress);
  const isInstalled = Boolean(getPhantomProvider());

  const shortAddress = useMemo(() => {
    if (!walletAddress) return "";
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const csrf = () =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];

  const requestChallenge = async (action: WalletAction, address?: string) => {
    const token = csrf();
    const response = await fetch(`${API_BASE_API_URL}/auth/wallet/challenge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-csrf-token": token } : {}),
      },
      credentials: "include",
      body: JSON.stringify({
        action,
        ...(address ? { walletAddress: address } : {}),
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to get wallet challenge");
    }
    return data.data as { nonce: string; message: string; expiresAt: string };
  };

  const submitLink = async (wallet: string, nonce: string, signature: string) => {
    const token = csrf();
    const response = await fetch(`${API_BASE_API_URL}/auth/wallet/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-csrf-token": token } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ walletAddress: wallet, nonce, signature }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to link wallet");
    }
  };

  const submitUnlink = async (nonce: string, signature: string) => {
    const token = csrf();
    const response = await fetch(`${API_BASE_API_URL}/auth/wallet/unlink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-csrf-token": token } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ nonce, signature }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to unlink wallet");
    }
  };

  const connect = async () => {
    const provider = getPhantomProvider();
    if (!provider) throw new Error("Phantom wallet is not installed");
    const response = await provider.connect();
    return response.publicKey.toString();
  };

  const linkWallet = async () => {
    const provider = getPhantomProvider();
    if (!provider) throw new Error("Phantom wallet is not installed");

    const connectedWallet = await connect();
    const challenge = await requestChallenge("link", connectedWallet);
    const signed = await provider.signMessage(new TextEncoder().encode(challenge.message), "utf8");
    await submitLink(connectedWallet, challenge.nonce, toBase58(signed.signature));
    await refreshAuth();
  };

  const unlinkWallet = async () => {
    const provider = getPhantomProvider();
    if (!provider) throw new Error("Phantom wallet is not installed");

    const challenge = await requestChallenge("unlink");
    const signed = await provider.signMessage(new TextEncoder().encode(challenge.message), "utf8");
    await submitUnlink(challenge.nonce, toBase58(signed.signature));
    await provider.disconnect();
    await refreshAuth();
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setLastError(null);
    try {
      if (isLinked) await unlinkWallet();
      else await linkWallet();
    } catch (error: any) {
      setLastError(error?.message || "Wallet action failed");
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    walletAddress,
    shortAddress,
    isLinked,
    isInstalled,
    isConnecting,
    lastError,
    connect: linkWallet,
    disconnect: unlinkWallet,
    handleConnect,
  };
};
