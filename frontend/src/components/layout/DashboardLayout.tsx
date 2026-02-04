"use client";

import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
    children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
        </div>
    );
};
