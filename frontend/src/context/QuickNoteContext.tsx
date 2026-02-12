"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    const [isQuickNoteVisible, setIsQuickNoteVisible] = useState(false);

    const toggleQuickNote = () => {
        setIsQuickNoteVisible(prev => !prev);
    };

    return (
        <QuickNoteContext.Provider value={{ isQuickNoteVisible, setIsQuickNoteVisible, toggleQuickNote }}>
            {children}
        </QuickNoteContext.Provider>
    );
};
