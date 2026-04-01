"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const INTERESTS = [
    { id: 'tech', label: 'Technology', icon: 'memory' },
    { id: 'sci', label: 'Science', icon: 'science' },
    { id: 'art', label: 'Digital Art', icon: 'palette' },
    { id: 'fin', label: 'Finance', icon: 'attach_money' },
    { id: 'phil', label: 'Philosophy', icon: 'psychology' },
    { id: 'travel', label: 'Travel', icon: 'flight' },
    { id: 'gov', label: 'Governance', icon: 'gavel' },
    { id: 'gaming', label: 'Gaming', icon: 'sports_esports' },
    { id: 'hist', label: 'History', icon: 'history_edu' },
    { id: 'med', label: 'Health', icon: 'health_and_safety' },
];

interface InterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selected: string[]) => void;
}

export function InterestModal({ isOpen, onClose, onSave }: InterestModalProps) {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleInterest = (id: string) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(selected);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0B0E14] border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary">interests</span>
                        </div>
                        <DialogTitle className="text-2xl font-serif font-bold mb-2">
                            Personalize your feed
                        </DialogTitle>
                        <DialogDescription className="text-center max-w-md">
                            Select topics you are interested in to help us curate the best content for your knowledge journey.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 py-6">
                    {INTERESTS.map((item) => {
                        const isSelected = selected.includes(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleInterest(item.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${isSelected
                                        ? 'bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-[#0B0E14]'
                                        : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span
                                    className={`material-symbols-outlined text-3xl transition-transform duration-300 ${isSelected ? 'text-primary scale-110' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500'
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-gray-500'
                                    }`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <DialogFooter className="flex-col sm:justify-center gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={selected.length < 3}
                        className="w-full sm:w-auto px-8 rounded-full font-bold"
                    >
                        {selected.length < 3 ? `Select ${3 - selected.length} more` : 'Continue'}
                    </Button>
                    <button
                        onClick={onClose}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        Maybe later
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
