'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENT_USER } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

type SocialLink = {
    id: string;
    platform: 'twitter' | 'github' | 'discord' | 'website' | 'linkedin';
    value: string;
};

export default function GeneralSettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { walletAddress, shortAddress, isInstalled, isConnecting, handleConnect } = useWallet();

    // Local state for form handling
    const [formData, setFormData] = useState({
        name: CURRENT_USER.name,
        handle: CURRENT_USER.handle,
        email: 'dr.elena@university.edu',
        bio: "Researching the intersection of Zero-Knowledge Proofs and Epistemology. Building the verification layer for the permaweb.",
    });

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
        { id: '1', platform: 'twitter', value: '@elena_zkp' },
        { id: '2', platform: 'github', value: 'github.com/elena-rust' },
        { id: '3', platform: 'website', value: 'https://elena.research.xyz' }
    ]);

    const handleSave = () => {
        // Mock save logic
        toast.success('Settings Saved Successfully!');
    };

    const handleSocialChange = (id: string, value: string) => {
        setSocialLinks(prev => prev.map(link => link.id === id ? { ...link, value } : link));
    };

    const removeSocialLink = (id: string) => {
        setSocialLinks(prev => prev.filter(link => link.id !== id));
    };

    const addSocialLink = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setSocialLinks([...socialLinks, { id: newId, platform: 'twitter', value: '' }]);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">General Settings</h1>
                    <p className="text-sm text-gray-500">Manage your public profile and connected accounts.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="space-y-8 animate-fade-in">

                    {/* 1. WALLET SECTION */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
                            <span className="material-symbols-outlined text-gray-400">account_balance_wallet</span> Connected Wallets
                        </h2>

                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0E1116] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C47FF] to-[#3A2CCF] flex items-center justify-center text-white font-bold text-xs">
                                    PHT
                                </div>
                                <div>
                                    <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                                        {walletAddress ? shortAddress : 'No wallet linked'}
                                    </div>
                                    <div className={`text-xs font-bold flex items-center gap-1 ${walletAddress ? 'text-green-500' : 'text-gray-500'}`}>
                                        <span className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {walletAddress ? 'Connected' : 'Not Connected'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!isInstalled) {
                                        toast.error('Phantom wallet is not installed');
                                        return;
                                    }
                                    try {
                                        await handleConnect();
                                        toast.success(walletAddress ? 'Wallet disconnected' : 'Wallet connected');
                                    } catch (err: any) {
                                        toast.error(err?.message || 'Wallet action failed');
                                    }
                                }}
                                disabled={isConnecting}
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
                            >
                                {isConnecting ? 'Processing...' : (walletAddress ? 'Disconnect' : 'Connect')}
                            </button>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            Account: {user?.email || "Unknown"} • Network target: Solana Devnet
                        </div>
                    </div>

                    {/* 2. PROFILE SECTION */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
                            <span className="material-symbols-outlined text-gray-400">badge</span> Public Profile
                        </h2>

                        <div className="space-y-6">
                            {/* Avatar & Cover */}
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-3xl font-serif text-white font-bold border-4 border-white dark:border-[#0B0E14] shadow-xl">
                                        ER
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white">camera_alt</span>
                                    </div>
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                                        Change Avatar
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Display Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#0E1116] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Handle (Username)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                        <input
                                            type="text"
                                            value={formData.handle.replace('@', '')}
                                            onChange={(e) => setFormData({ ...formData, handle: '@' + e.target.value.replace('@', '') })}
                                            className="w-full bg-gray-50 dark:bg-[#0E1116] border border-gray-200 dark:border-gray-800 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-[#0E1116] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all h-24 resize-none leading-relaxed"
                                ></textarea>
                                <div className="flex justify-end">
                                    <span className="text-[10px] text-gray-500">{formData.bio.length}/160</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
                            <span className="material-symbols-outlined text-gray-400">link</span> Social Links
                        </h2>
                        <div className="space-y-4">
                            {socialLinks.map((link) => (
                                <div key={link.id} className="flex gap-3">
                                    <div className="relative w-32 md:w-40">
                                        <select
                                            value={link.platform}
                                            onChange={(e) => {
                                                const newPlatform = e.target.value as SocialLink['platform'];
                                                setSocialLinks(prev => prev.map(l => l.id === link.id ? { ...l, platform: newPlatform } : l));
                                            }}
                                            className="w-full h-full bg-gray-50 dark:bg-[#0E1116] border border-gray-200 dark:border-gray-800 rounded-xl px-3 text-sm font-bold text-gray-700 dark:text-gray-300 outline-none appearance-none"
                                        >
                                            <option value="twitter">Twitter</option>
                                            <option value="github">GitHub</option>
                                            <option value="discord">Discord</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="website">Website</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">expand_more</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={link.value}
                                            onChange={(e) => handleSocialChange(link.id, e.target.value)}
                                            placeholder="URL or Username"
                                            className="w-full bg-gray-50 dark:bg-[#0E1116] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeSocialLink(link.id)}
                                        className="w-10 h-[46px] flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addSocialLink}
                                className="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 w-full justify-center"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Social Link
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                        <button
                            onClick={handleSave}
                            className="px-8 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
