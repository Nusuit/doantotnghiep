
import React, { useState, useEffect } from 'react';
import { MOCK_HISTORY } from '../data/mockData';

export type TabType = 'contributions' | 'suggestions' | 'votes' | 'proposals' | 'reservations';
export type FilterType = 'all' | 'premium' | 'public' | 'private';

export interface Reservation {
    id: string;
    entity: string;
    category: 'TOPIC' | 'PLACE' | 'ENTITY';
    timeLeft: string; // e.g. "167h 30m"
    deposit: number;
}

export const MOCK_RESERVATIONS: Reservation[] = [
    { id: 'res-1', entity: 'Quantum Entanglement in Bio-Systems', category: 'TOPIC', timeLeft: '166h 45m', deposit: 50 },
    { id: 'res-2', entity: 'The Great Library of Alexandria', category: 'PLACE', timeLeft: '24h 10m', deposit: 50 }
];

export const useProfile = () => {
    const [activeTab, setActiveTab] = useState<TabType>('contributions');
    const [contributionFilter, setContributionFilter] = useState<FilterType>('all');
    const [openMenuRowId, setOpenMenuRowId] = useState<string | null>(null);
    const [upgradeModal, setUpgradeModal] = useState<{isOpen: boolean, postId: string | null}>({isOpen: false, postId: null});

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuRowId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenMenuRowId(openMenuRowId === id ? null : id);
    };

    const handleUpgradeClick = (postId: string) => {
        setUpgradeModal({ isOpen: true, postId });
        setOpenMenuRowId(null);
    };

    const closeUpgradeModal = () => {
        setUpgradeModal({ isOpen: false, postId: null });
    };

    const confirmUpgrade = () => {
        // Logic to update backend/state would go here
        alert('Post Upgraded to Premium!'); 
        closeUpgradeModal();
    };

    // Filter Logic
    const getFilteredHistory = () => {
        let filtered = MOCK_HISTORY.filter(h => {
             if (activeTab === 'contributions') return h.type === 'contribution';
             if (activeTab === 'suggestions') return h.type === 'suggestion';
             if (activeTab === 'votes') return h.type === 'vote';
             if (activeTab === 'proposals') return h.type === 'proposal';
             // Reservations are handled separately in the view
             return false;
        });

        if (activeTab === 'contributions' && contributionFilter !== 'all') {
            filtered = filtered.filter(item => {
                if (contributionFilter === 'premium') return item.content_type === 'premium';
                if (contributionFilter === 'public') return item.visibility === 'public';
                if (contributionFilter === 'private') return item.visibility === 'private';
                return true;
            });
        }
        return filtered;
    };

    return {
        activeTab,
        setActiveTab,
        contributionFilter,
        setContributionFilter,
        openMenuRowId,
        toggleMenu,
        upgradeModal,
        handleUpgradeClick,
        closeUpgradeModal,
        confirmUpgrade,
        filteredHistory: getFilteredHistory(),
        reservations: MOCK_RESERVATIONS
    };
};
