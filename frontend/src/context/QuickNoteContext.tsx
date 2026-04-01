"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface QuickNoteContextType {
    isQuickNoteVisible: boolean;
    setIsQuickNoteVisible: (visible: boolean) => void;
    toggleQuickNote: () => void;
}

const QuickNoteContext = createContext<QuickNoteContextType | undefined>(undefined);

export const useQuickNote = () => {
    const context = useContext(QuickNoteContext);
    if (!context) {
        throw new Error('useQuickNote must be used within QuickNoteProvider');
    }
    return context;
};

export const QuickNoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Persist state in localStorage
    const [isQuickNoteVisible, setIsQuickNoteVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('ks_widget_quicknote');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ks_widget_quicknote', JSON.stringify(isQuickNoteVisible));
        }
    }, [isQuickNoteVisible]);

    const toggleQuickNote = () => {
        setIsQuickNoteVisible(prev => !prev);
    };

    return (
        <QuickNoteContext.Provider value={{ isQuickNoteVisible, setIsQuickNoteVisible, toggleQuickNote }}>
            {children}
        </QuickNoteContext.Provider>
    );
};
