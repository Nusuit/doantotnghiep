"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Updated Data with Real Images
const INTERESTS = [
    { id: 'tech', label: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80' },
    { id: 'sci', label: 'Science', image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80' },
    { id: 'art', label: 'Digital Art', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
    { id: 'fin', label: 'Finance', image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80' },
    { id: 'phil', label: 'Philosophy', image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=400&q=80' },
    { id: 'travel', label: 'Travel', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80' },
    { id: 'gov', label: 'Governance', image: 'https://images.unsplash.com/photo-1575320181282-9afab399332c?auto=format&fit=crop&w=400&q=80' },
    { id: 'gaming', label: 'Gaming', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { id: 'hist', label: 'History', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80' },
    { id: 'med', label: 'Health', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80' },
    { id: 'lit', label: 'Literature', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80' },
    { id: 'dev', label: 'Development', image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=400&q=80' },
    { id: 'sus', label: 'Nature', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80' },
    { id: 'space', label: 'Astronomy', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80' },
    { id: 'food', label: 'Culinary', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
    { id: 'places', label: 'Places', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);
    const MIN_SELECTION = 3;

    const toggleInterest = (id: string) => {
        setSelected(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id) 
                : [...prev, id]
        );
    };

    const handleContinue = async () => {
        if (selected.length >= MIN_SELECTION) {
            try {
                await api.auth.completeOnboarding(selected);
                toast.success("Preferences saved! Welcome to KnowledgeShare 🎉");
                router.push("/app/feed");
            } catch (error) {
                console.error("Failed to save onboarding:", error);
                toast.error("Failed to save preferences. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#020305] text-white relative overflow-hidden flex flex-col font-sans selection:bg-cyan-500/30">
            
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20"></div>
            </div>

            {/* Header Content */}
            <div className="relative z-10 pt-16 pb-8 px-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto mb-6">KS</div>
                <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-3 text-white drop-shadow-sm">
                    Choose your interests
                </h1>
                <p className="text-gray-400 text-base max-w-lg mx-auto font-light">
                    Select at least <span className="text-white font-bold">{MIN_SELECTION}</span> topics to personalize your feed.
                </p>
            </div>

            {/* Circular Grid Content */}
            <div className="relative z-10 flex-1 px-4 pb-32 max-w-5xl mx-auto w-full overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-y-10 gap-x-4 justify-items-center">
                    {INTERESTS.map((item) => {
                        const isSelected = selected.includes(item.id);
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleInterest(item.id)}
                                className="group flex flex-col items-center gap-3 relative focus:outline-none"
                            >
                                {/* Circle Node Container */}
                                <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 ease-out shadow-lg overflow-hidden ${
                                    isSelected 
                                    ? 'ring-4 ring-blue-500 scale-100' 
                                    : 'ring-2 ring-white/10 hover:ring-white/30 hover:scale-105'
                                }`}>
                                    
                                    {/* Image Background */}
                                    <img 
                                        src={item.image} 
                                        alt={item.label}
                                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isSelected ? 'scale-100' : 'group-hover:scale-110'}`}
                                    />
                                    
                                    {/* Subtle Overlay for Unselected */}
                                    <div className={`absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300`}></div>

                                    {/* Selected Overlay & Checkmark */}
                                    <div className={`absolute inset-0 bg-blue-600/80 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 ${
                                        isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                                    }`}>
                                        <span className="material-symbols-outlined text-white text-4xl sm:text-5xl font-bold drop-shadow-md">check</span>
                                    </div>
                                </div>

                                {/* Label Underneath */}
                                <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider text-center transition-colors duration-300 ${
                                    isSelected ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                                }`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 w-full z-20 p-6 bg-gradient-to-t from-[#020305] via-[#020305] to-transparent pointer-events-none flex justify-center">
                <button
                    onClick={handleContinue}
                    disabled={selected.length < MIN_SELECTION}
                    className={`pointer-events-auto relative group px-10 py-3 rounded-full font-bold text-base tracking-wide transition-all duration-500 transform shadow-2xl flex items-center gap-2 ${
                        selected.length >= MIN_SELECTION 
                        ? 'bg-white text-black hover:scale-105 hover:bg-gray-100' 
                        : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
                    }`}
                >
                    {selected.length >= MIN_SELECTION ? (
                        <>
                            Next <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </>
                    ) : (
                        `Select ${MIN_SELECTION - selected.length} more`
                    )}
                </button>
            </div>

        </div>
    );
}
