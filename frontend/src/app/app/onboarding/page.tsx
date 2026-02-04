"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserService } from "@/services/userService";
import { toast } from "sonner";

const TOPICS = [
    "Blockchain", "DeFi", "NFTs", "DAO", "Layer 2",
    "Solana", "Ethereum", "Bitcoin", "AI", "Metaverse",
    "GameFi", "SocialFi", "Zero Knowledge", "Security"
];

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { refetch } = useCurrentUser();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        displayName: user?.name || "",
        bio: "",
        selectedTopics: [] as string[]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.name) {
            setFormData(prev => ({ ...prev, displayName: user.name || "" }));
        }
    }, [user]);

    const toggleTopic = (topic: string) => {
        setFormData(prev => {
            if (prev.selectedTopics.includes(topic)) {
                return { ...prev, selectedTopics: prev.selectedTopics.filter(t => t !== topic) };
            } else {
                if (prev.selectedTopics.length >= 5) {
                    toast.warning("You can select up to 5 topics");
                    return prev;
                }
                return { ...prev, selectedTopics: [...prev.selectedTopics, topic] };
            }
        });
    };

    const handleSubmit = async () => {
        if (!formData.displayName.trim()) {
            toast.error("Please enter your display name");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Update Profile (Name & Bio)
            // Note: Backend doesn't support topics yet, strictly speaking, 
            // but we could append them to bio or just ignore for MVP.
            // For now, let's just update the profile standard fields.

            let bioWithTopics = formData.bio;
            if (formData.selectedTopics.length > 0) {
                // HACK: Store topics in Bio for now if backend doesn't support preferences
                // Or just don't save them (Client-side onboarding only).
                // Let's just save the bio normally.
            }

            const { success, error } = await UserService.updateProfile({
                fullName: formData.displayName,
                bio: formData.bio
            });

            if (!success) {
                throw new Error(error);
            }

            await refetch(); // Update local user state
            toast.success("Welcome to KnowledgeShare!");
            router.push("/app/feed");

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0E14] p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#161b22] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-8">
                    {/* Progress */}
                    <div className="flex justify-center mb-8 gap-2">
                        <div className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        <div className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                    </div>

                    <h1 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">
                        {step === 1 ? "Complete your profile" : "What are you interested in?"}
                    </h1>
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
                        {step === 1 ? "Tell us a bit about yourself to get started." : "Pick a few topics to personalize your feed."}
                    </p>

                    {step === 1 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none"
                                    placeholder="e.g. Satoshi Nakamoto"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                    Bio (Optional)
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none min-h-[100px] resize-none"
                                    placeholder="I love blockchain and..."
                                />
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-primary/30"
                            >
                                Next Step
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {TOPICS.map(topic => {
                                    const isSelected = formData.selectedTopics.includes(topic);
                                    return (
                                        <button
                                            key={topic}
                                            onClick={() => toggleTopic(topic)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isSelected
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                                                }`}
                                        >
                                            {topic}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-[2] bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Setup...
                                        </>
                                    ) : (
                                        "Get Started"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
