"use client";

import React, { useState } from 'react';

interface QuickNoteProps {
    isVisible: boolean;
    onClose: () => void;
}

export const QuickNote: React.FC<QuickNoteProps> = ({ isVisible, onClose }) => {
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!note.trim()) return;
        
        setIsSaving(true);
        // TODO: Implement save to backend/localStorage
        setTimeout(() => {
            setIsSaving(false);
            setNote('');
            // Could show toast notification here
        }, 500);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-40 w-80 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">edit_note</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">Quick Note</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* Note Input */}
            <div className="p-4">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Jot down your thoughts..."
                    className="w-full h-32 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4 pt-0">
                <div className="flex items-center gap-2">
                    <button
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Add Tag"
                    >
                        <span className="material-symbols-outlined text-lg">tag</span>
                    </button>
                    <button
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Set Reminder"
                    >
                        <span className="material-symbols-outlined text-lg">alarm</span>
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!note.trim() || isSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all disabled:cursor-not-allowed flex items-center gap-1"
                >
                    {isSaving ? (
                        <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">save</span>
                            Save
                        </>
                    )}
                </button>
            </div>

            {/* Tip */}
            <div className="px-4 pb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg p-2 flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">info</span>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Quick notes are auto-saved to your local device. Turn into a post anytime!
                    </p>
                </div>
            </div>
        </div>
    );
};
