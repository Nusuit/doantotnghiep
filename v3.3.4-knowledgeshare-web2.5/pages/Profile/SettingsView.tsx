
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../../data/mockData';

type SocialLink = {
    id: string;
    platform: 'twitter' | 'github' | 'discord' | 'website' | 'linkedin';
    value: string;
};

export const SettingsView = () => {
    const navigate = useNavigate();

    // Local state for form handling
    const [formData, setFormData] = useState({
        name: CURRENT_USER.name,
        bio: "Researching the intersection of Zero-Knowledge Proofs and Epistemology. Building the verification layer for the permaweb.",
        email: "john.doe@example.com",
        notifications: {
            email: true,
            airdrop: true,
            proposals: false
        }
    });

    // Dynamic Social Links State
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
        { id: '1', platform: 'twitter', value: '@john_doe' },
        { id: '2', platform: 'github', value: 'github.com/johndoe' }
    ]);

    const [tags, setTags] = useState(['Technology', 'AI Research', 'Ontology']);
    const [newTag, setNewTag] = useState('');

    // --- HANDLERS ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (key: keyof typeof formData.notifications) => {
        setFormData(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [key]: !prev.notifications[key] }
        }));
    };

    // Tag Management
    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            if (!tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
            }
            setNewTag('');
        }
    };
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Social Link Management
    const addSocialLink = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setSocialLinks([...socialLinks, { id: newId, platform: 'website', value: '' }]);
    };

    const removeSocialLink = (id: string) => {
        setSocialLinks(socialLinks.filter(link => link.id !== id));
    };

    const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
        setSocialLinks(socialLinks.map(link => 
            link.id === id ? { ...link, [field]: value } : link
        ));
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'twitter': return 'flutter_dash'; // Using flutter_dash as bird alternative
            case 'github': return 'code';
            case 'discord': return 'chat_bubble';
            case 'website': return 'public';
            case 'linkedin': return 'work';
            default: return 'link';
        }
    };

    // Action Buttons Logic
    const handleSave = () => {
        // Logic to save data to backend would go here
        alert("Profile updated successfully!");
        navigate('/app/profile');
    };

    const handleDiscard = () => {
        if (window.confirm("Discard unsaved changes?")) {
            navigate('/app/profile');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your identity on the Permaweb.</p>
            </div>

            {/* 1. Identity Section */}
            <div className="bg-white dark:bg-[#0B0E14] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">badge</span>
                        Public Identity
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">This information is visible to everyone on the platform.</p>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* Name & Wallet Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name} 
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-100 dark:bg-[#161b22] border border-transparent focus:border-primary dark:focus:border-primary rounded-xl px-4 py-3 text-gray-900 dark:text-white font-medium outline-none transition-all"
                                />
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">edit</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Solana Address</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={CURRENT_USER.handle} 
                                    disabled 
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-500 font-mono text-sm cursor-not-allowed"
                                />
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm" title="Verified">verified_user</span>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio / Manifesto</label>
                        <textarea 
                            name="bio"
                            rows={4} 
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="w-full bg-gray-100 dark:bg-[#161b22] border border-transparent focus:border-primary dark:focus:border-primary rounded-xl px-4 py-3 text-gray-900 dark:text-gray-300 leading-relaxed outline-none transition-all resize-none"
                            placeholder="Share your philosophy..."
                        ></textarea>
                        <p className="text-[10px] text-right text-gray-400">{formData.bio.length}/500</p>
                    </div>

                    {/* Expertise Tags */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expertise Tags</label>
                        <div className="p-4 bg-gray-100 dark:bg-[#161b22] rounded-xl flex flex-wrap gap-2 border border-transparent focus-within:border-primary transition-all">
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                </span>
                            ))}
                            <input 
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add tag + Enter..."
                                className="bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 min-w-[120px] flex-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Connections Section (Updated) */}
            <div className="bg-white dark:bg-[#0B0E14] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">link</span>
                            Connections
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Link your social profiles to build reputation.</p>
                    </div>
                    <button 
                        onClick={addSocialLink}
                        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-lg shadow-blue-500/30"
                        title="Add Connection"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                </div>
                
                <div className="p-8 space-y-6">
                     {/* Static Email Field */}
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email (Private)</label>
                        <div className="flex items-center bg-gray-100 dark:bg-[#161b22] rounded-xl px-4 py-3 border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600 transition-colors">
                            <span className="material-symbols-outlined text-gray-400 mr-3">mail</span>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="bg-transparent w-full outline-none text-gray-900 dark:text-white text-sm"
                            />
                        </div>
                     </div>

                     <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>

                     {/* Dynamic Social Links */}
                     <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Social Profiles</label>
                        {socialLinks.map((link) => (
                            <div key={link.id} className="flex flex-col sm:flex-row gap-3 animate-fade-in">
                                {/* Platform Select */}
                                <div className="relative min-w-[140px]">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <span className="material-symbols-outlined text-sm">{getPlatformIcon(link.platform)}</span>
                                    </div>
                                    <select 
                                        value={link.platform}
                                        onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                                        className="w-full bg-gray-100 dark:bg-[#161b22] border border-transparent rounded-xl py-3 pl-9 pr-8 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <option value="twitter">Twitter</option>
                                        <option value="github">GitHub</option>
                                        <option value="discord">Discord</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="website">Website</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                        <span className="material-symbols-outlined text-sm">expand_more</span>
                                    </div>
                                </div>

                                {/* Value Input */}
                                <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#161b22] rounded-xl px-4 py-3 border border-transparent focus-within:border-blue-500 transition-colors">
                                    <input 
                                        type="text" 
                                        value={link.value}
                                        onChange={(e) => updateSocialLink(link.id, 'value', e.target.value)}
                                        placeholder={link.platform === 'website' ? 'https://...' : 'Username / Handle'}
                                        className="bg-transparent w-full outline-none text-gray-900 dark:text-white text-sm"
                                    />
                                </div>

                                {/* Remove Button */}
                                <button 
                                    onClick={() => removeSocialLink(link.id)}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                                    title="Remove"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}

                        {socialLinks.length === 0 && (
                            <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 text-sm">
                                No social links added. Click the + button above to add one.
                            </div>
                        )}
                     </div>
                </div>
            </div>

            {/* 3. Notifications & Preferences */}
            <div className="bg-white dark:bg-[#0B0E14] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                 <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">notifications</span>
                        Preferences
                    </h2>
                </div>
                <div className="p-8 space-y-6">
                    {/* Toggle Item */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Email Digest</h3>
                            <p className="text-xs text-gray-500">Receive weekly summaries of top content.</p>
                        </div>
                        <button 
                            onClick={() => handleToggle('email')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.notifications.email ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.notifications.email ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    
                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Airdrop Alerts</h3>
                            <p className="text-xs text-gray-500">Get notified when Treasury distributes KNOW-G.</p>
                        </div>
                        <button 
                            onClick={() => handleToggle('airdrop')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.notifications.airdrop ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.notifications.airdrop ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800"></div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Governance Proposals</h3>
                            <p className="text-xs text-gray-500">Notify me when new DAO votes are live.</p>
                        </div>
                        <button 
                            onClick={() => handleToggle('proposals')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.notifications.proposals ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.notifications.proposals ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/5 rounded-2xl border border-red-200 dark:border-red-900/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Delete Account</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                        This will permanently delete your profile and off-chain reputation (KNOW-U). Your on-chain tokens and Arweave content will remain accessible but unlinked.
                    </p>
                </div>
                <button className="whitespace-nowrap px-6 py-3 bg-white dark:bg-transparent border-2 border-red-500 text-red-600 dark:text-red-500 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/20">
                    Delete Data
                </button>
            </div>
            
            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4 z-40">
                <button 
                    onClick={handleDiscard}
                    className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    Discard
                </button>
                <button 
                    onClick={handleSave}
                    className="px-8 py-2 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 transform hover:scale-105"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};
