"use client";

import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickNoteProvider } from '@/context/QuickNoteContext';
import { QuickNote } from '@/components/shared/QuickNote';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardContent: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                {/* Main Content Area */}
                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </main>
            </div>
            
            {/* Quick Note Floating Widget */}
            <QuickNote />
        </div>
    );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <QuickNoteProvider>
            <DashboardContent>{children}</DashboardContent>
        </QuickNoteProvider>
    );
};
