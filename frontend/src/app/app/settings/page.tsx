
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENT_USER } from '@/data/mockData';

type SocialLink = {
    id: string;
    platform: 'twitter' | 'github' | 'discord' | 'website' | 'linkedin';
    value: string;
};

export default function SettingsPage() {
    const router = useRouter();

    // Local state for form handling
    const [formData, setFormData] = useState({
        name: CURRENT_USER.name,
        handle: CURRENT_USER.handle,
        email: 'dr.elena@university.edu',
        bio: "Researching the intersection of Zero-Knowledge Proofs and Epistemology. Building the verification layer for the permaweb.",
        theme: 'dark',
    });

    const [notifications, setNotifications] = useState({
        emailDigest: true,
        newFollowers: true,
        mentions: true,
        projectUpdates: false,
        governanceAlerts: true
    });

    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
        { id: '1', platform: 'twitter', value: '@elena_zkp' },
        { id: '2', platform: 'github', value: 'github.com/elena-rust' },
        { id: '3', platform: 'website', value: 'https://elena.research.xyz' }
    ]);

    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'wallet'>('general');

    const handleSave = () => {
        // Mock save logic
        alert('Settings Saved Successfully!');
        router.push('/app/profile');
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

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h1>
                    <p className="text-sm text-gray-500">Manage your account preferences and profile.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">

                {/* SETTINGS SIDEBAR */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden sticky top-24">
                        <div className="p-2 space-y-1">
                            {[
                                { id: 'general', label: 'General', icon: 'settings' },
                                { id: 'notifications', label: 'Notifications', icon: 'notifications' },
                                { id: 'privacy', label: 'Privacy & Security', icon: 'lock' },
                                { id: 'wallet', label: 'Wallet & Payouts', icon: 'account_balance_wallet' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-bold text-sm transition-all ${activeTab === item.id
                                            ? 'bg-primary/10 text-primary dark:text-primary-foreground'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined ${activeTab === item.id ? 'fill-current' : ''}`}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-white/5 mt-2">
                            <button className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg flex items-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-sm">logout</span> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">

                        {/* --- TAB: GENERAL --- */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-fade-in">
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
                            </div>
                        )}

                        {/* --- TAB: NOTIFICATIONS --- */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
                                        <span className="material-symbols-outlined text-gray-400">notifications_active</span> Email Notifications
                                    </h2>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'emailDigest', label: 'Weekly Digest', desc: 'A summary of top content in your network.' },
                                            { id: 'newFollowers', label: 'New Followers', desc: 'Get notified when someone follows you.' },
                                            { id: 'mentions', label: 'Mentions & Replies', desc: 'When someone mentions you in a post or comment.' },
                                            { id: 'projectUpdates', label: 'Product Updates', desc: 'News about new features and improvements.' },
                                            { id: 'governanceAlerts', label: 'Governance Alerts', desc: 'Important voting deadlines and proposal updates.' },
                                        ].map((setting) => (
                                            <div key={setting.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white text-sm">{setting.label}</div>
                                                    <div className="text-xs text-gray-500">{setting.desc}</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={(notifications as any)[setting.id]}
                                                        onChange={() => setNotifications({ ...notifications, [setting.id]: !(notifications as any)[setting.id] })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: PRIVACY (Stub) --- */}
                        {activeTab === 'privacy' && (
                            <div className="text-center py-20 animate-fade-in">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <span className="material-symbols-outlined text-4xl">lock</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Privacy Settings</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
                                    Control who can see your profile, your graph connections, and manage your blocked users list.
                                    <br /><br />
                                    <span className="inline-block bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded text-xs font-bold">Coming Soon</span>
                                </p>
                            </div>
                        )}

                        {/* --- TAB: WALLET (Stub) --- */}
                        {activeTab === 'wallet' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
                                        <span className="material-symbols-outlined text-gray-400">account_balance_wallet</span> Connected Wallets
                                    </h2>

                                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0E1116] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                                ETH
                                            </div>
                                            <div>
                                                <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">0x71C...9A23</div>
                                                <div className="text-xs text-green-500 font-bold flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Connected
                                                </div>
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                            Disconnect
                                        </button>
                                    </div>

                                    <button className="mt-4 w-full py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">add_circle</span> Connect Another Wallet
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* Action Buttons */}
                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
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
        </div>
    );
};
