'use client';

import React, { useState } from 'react';

export default function NotificationsSettingsPage() {
    const [notifications, setNotifications] = useState({
        emailDigest: true,
        newFollowers: true,
        mentions: true,
        projectUpdates: false,
        governanceAlerts: true
    });

    const settings = [
        { id: 'emailDigest', label: 'Weekly Digest', desc: 'A summary of top content in your network.' },
        { id: 'newFollowers', label: 'New Followers', desc: 'Get notified when someone follows you.' },
        { id: 'mentions', label: 'Mentions & Replies', desc: 'When someone mentions you in a post or comment.' },
        { id: 'projectUpdates', label: 'Product Updates', desc: 'News about new features and improvements.' },
        { id: 'governanceAlerts', label: 'Governance Alerts', desc: 'Important voting deadlines and proposal updates.' },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Notifications</h1>
                    <p className="text-sm text-gray-500">Choose what updates you want to receive.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
                            <span className="material-symbols-outlined text-gray-400">notifications_active</span> Email Notifications
                        </h2>
                        <div className="space-y-4">
                            {settings.map((setting) => (
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
            </div>
        </div>
    );
}
