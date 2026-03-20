'use client';

import React from 'react';

export default function PrivacySettingsPage() {
    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Privacy & Security</h1>
                    <p className="text-sm text-gray-500">Manage your security preferences and visibility.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
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
            </div>
        </div>
    );
}
