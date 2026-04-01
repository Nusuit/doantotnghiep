"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import MapComponent from '@/components/Map/MapComponent';
import { FIELDS } from '@/data/mockData';
import { toast } from 'sonner';

// Types
type AccessMode = 'private' | 'public' | 'premium';
type FlowStep = 'anchor' | 'editor';
type CreateMode = 'knowledge' | 'review';
type ReviewType = 'url' | 'place';

interface SearchSuggestion {
    id: string;
    place_name: string;
    center: [number, number];
    text: string;
}

interface FieldType {
    type: string;
    icon: string;
    description: string;
}

// Tooltip Helper
const FormTooltip = ({ text }: { text: string }) => (
    <div className="group/tip relative inline-flex items-center justify-center ml-2 cursor-help">
        <span className="material-symbols-outlined text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-sm">help</span>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-xl text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl text-center">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-white dark:border-t-[#1A1D24]"></div>
        </div>
    </div>
);

export default function CreatePostPage() {
    const router = useRouter();

    // --- FLOW STATE ---
    const [flowStep, setFlowStep] = useState<FlowStep>('anchor');
    const [mode, setMode] = useState<CreateMode | null>(null);
    const [reviewType, setReviewType] = useState<ReviewType>('url');

    // Anchor Form Data
    const [anchorInput, setAnchorInput] = useState(''); // Holds Title, URL, or Place Name
    const [selectedCategory, setSelectedCategory] = useState<string>(FIELDS[0].type); // For Knowledge mode
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null); // For Place

    // Location search state
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // --- MODAL STATES ---
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // --- EDITOR STATE (The Content) ---
    const [title, setTitle] = useState(''); // Separate Title State
    const [content, setContent] = useState('');
    const [premiumHint, setPremiumHint] = useState('');
    const [unlockPrice, setUnlockPrice] = useState<number>(50);

    // UI State
    const [accessMode, setAccessMode] = useState<AccessMode>('public');
    const [viewMode, setViewMode] = useState<'edit' | 'preview_locked' | 'preview_unlocked'>('edit');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Simulated Auto-Save
    useEffect(() => {
        if (flowStep !== 'editor') return;
        const interval = setInterval(() => {
            if (content || title) {
                setIsSaving(true);
                setTimeout(() => setIsSaving(false), 1500);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [content, title, flowStep]);

    // Map ref for programmatic control
    const mapRef = useRef<any>(null);

    // --- LOCATION SEARCH ---
    const searchLocation = async (query: string) => {
        if (!query || query.length < 3) {
            setSearchSuggestions([]);
            return;
        }

        setIsLoadingSearch(true);
        try {
            const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=5&language=vi`
            );
            const data = await response.json();
            setSearchSuggestions(data.features || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error searching location:', error);
            setSearchSuggestions([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const selectSuggestion = (suggestion: SearchSuggestion) => {
        console.log('[Create] Selected suggestion:', suggestion.place_name);
        console.log('[Create] Setting coords to:', { lat: suggestion.center[1], lng: suggestion.center[0] });
        setAnchorInput(suggestion.place_name);
        setCoords({ lat: suggestion.center[1], lng: suggestion.center[0] });
        setShowSuggestions(false);
        setSearchSuggestions([]);
    };

    const getCurrentLocation = () => {
        setIsGettingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCoords({ lat, lng });

                    // Center map on location with animation
                    if (mapRef.current) {
                        mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
                    }

                    // Reverse geocode to get address
                    try {
                        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
                        const response = await fetch(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&language=vi`
                        );
                        const data = await response.json();
                        if (data.features && data.features.length > 0) {
                            setAnchorInput(data.features[0].place_name);
                        }
                    } catch (error) {
                        console.error('Error reverse geocoding:', error);
                    }
                    setIsGettingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Không thể lấy vị trí hiện tại');
                    setIsGettingLocation(false);
                }
            );
        } else {
            toast.error('Trình duyệt không hỗ trợ geolocation');
            setIsGettingLocation(false);
        }
    };

    // Debounce search
    useEffect(() => {
        if (mode === 'review' && reviewType === 'place' && anchorInput) {
            const timer = setTimeout(() => {
                searchLocation(anchorInput);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    }, [anchorInput, mode, reviewType]);

    // --- MAP HANDLER ---
    const handleLocationSelect = (location: { coordinates: [number, number], address: string }) => {
        setCoords({ lat: location.coordinates[1], lng: location.coordinates[0] });
    };

    // --- HANDLERS ---
    const handleExit = () => {
        const hasContent = title.trim() || content.trim();
        if (hasContent) {
            setShowExitConfirm(true);
        } else {
            router.push('/app/feed');
        }
    };

    const confirmExit = () => {
        setShowExitConfirm(false);
        router.push('/app/feed');
    };

    const handleStartWriting = () => {
        if (!anchorInput) return;
        if (mode === 'review' && reviewType === 'place' && !coords) return;

        // Auto-set title based on input
        if (mode === 'knowledge') {
            setTitle(anchorInput);
        } else if (mode === 'review') {
            if (reviewType === 'place') {
                // Extract just the street/location name (first part before comma)
                const locationName = anchorInput.split(',')[0].trim();
                setTitle(`Review: ${locationName}`);
            } else {
                setTitle('');
            }
        }

        setFlowStep('editor');
    };

    const handlePublish = async () => {
        if (!content || !title) return;

        setIsPublishing(true);
        try {
            // Prepare article data
            const articleData: any = {
                title: title.trim(),
                content: content.trim(),
            };

            // Add location context for place reviews
            if (mode === 'review' && reviewType === 'place' && coords && anchorInput) {
                articleData.locationContext = {
                    name: anchorInput.split(',')[0].trim(),
                    address: anchorInput,
                    latitude: coords.lat,
                    longitude: coords.lng
                };
            }

            // Add URL for URL reviews
            if (mode === 'review' && reviewType === 'url' && anchorInput) {
                articleData.url = anchorInput;
            }

            // Import and call the service
            const { createArticle } = await import('@/services/articleService');
            await createArticle(articleData);

            toast.success("Published successfully!");
            router.push('/app/feed');
        } catch (error) {
            console.error('Failed to publish article:', error);
            toast.error('Failed to publish article. Please try again.');
            setIsPublishing(false);
        }
    };

    // --- RENDERERS ---
    const renderExitModal = () => {
        if (!showExitConfirm) return null;
        if (typeof document === 'undefined') return null;

        return createPortal(
            <div className="fixed inset-0 z-[20002] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowExitConfirm(false)}></div>
                <div className="relative w-full max-w-sm bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 dark:text-gray-400">
                            <span className="material-symbols-outlined text-2xl">priority_high</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Discard Changes?</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            You have unsaved content. Leaving now will discard your draft permanently.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider"
                            >
                                Keep Writing
                            </button>
                            <button
                                onClick={confirmExit}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider shadow-lg shadow-red-900/20"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const renderStakeConfirmationModal = () => {
        if (!showStakeConfirm) return null;
        if (typeof document === 'undefined') return null;

        return createPortal(
            <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setShowStakeConfirm(false)}></div>
                <div className="relative w-full max-w-md bg-white dark:bg-[#0B0E14] border border-blue-200 dark:border-blue-900/50 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200 dark:border-blue-500/30">
                            <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-500">lock_clock</span>
                        </div>

                        <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Confirm Reservation</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                            You are about to lock this entity for 7 days.
                        </p>

                        <div className="bg-gray-50 dark:bg-[#161b22] rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-3">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stake Amount</span>
                                <span className="text-lg font-mono font-bold text-red-500">-50 KNOW-U</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lock Duration</span>
                                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">168h 00m 00s</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 justify-center mb-6 text-[10px] font-bold text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/10 py-2 rounded-lg border border-blue-200 dark:border-blue-900/30 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Non-refundable if expired
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowStakeConfirm(false)}
                                className="flex-1 py-3 bg-transparent border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors uppercase text-xs tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStake}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all uppercase text-xs tracking-wider"
                            >
                                Confirm Stake
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    // Filter logic for Topics
    const filteredTopics = POPULAR_TOPICS.filter(t => t.toLowerCase().includes(anchorQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Background Ambient */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200 dark:bg-cyan-900/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Exit Button for Step 1 */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={() => router.push('/app/feed')}
                    className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>

            <div className="max-w-4xl w-full z-10 animate-fade-in-up">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-[#13161F] text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Knowledge Anchoring Protocol
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mb-2">Anchor Knowledge</h1>
                    <p className="text-gray-500 dark:text-gray-500">Define the entity you wish to contribute to. Ensure uniqueness on the Permaweb.</p>
                </div>

                {/* Exit Button */}
                <div className="absolute top-6 right-6 z-20">
                    <button
                        onClick={() => router.push('/app/feed')}
                        className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="max-w-4xl w-full z-10 animate-fade-in-up">
                    {/* STEP 1: MODE SELECTION CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Mode 1: General Knowledge */}
                        <button
                            key={cat.id}
                            onClick={() => { setCategory(cat.id as EntityCategory); setCheckStatus('idle'); }}
                            className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${category === cat.id
                                ? 'bg-white dark:bg-white/5 border-blue-500 shadow-lg shadow-blue-500/10'
                                : 'bg-white/50 dark:bg-[#13161F] border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${mode === 'knowledge' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                                    <span className="material-symbols-outlined text-2xl">auto_stories</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">General Knowledge</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Write about concepts, theories, history, or science.
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Mode 2: Review Place */}
                        <button
                            onClick={() => { setMode('review'); setAnchorInput(''); }}
                            className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group overflow-hidden ${mode === 'review'
                                ? 'bg-white dark:bg-[#13161F] border-purple-500 shadow-xl shadow-purple-500/10 scale-[1.02]'
                                : 'bg-white dark:bg-[#13161F] border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-lg'
                                }`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${mode === 'review' ? 'bg-purple-600 text-white' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}>
                                    <span className="material-symbols-outlined text-2xl">rate_review</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Review Place</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Review a Website URL or a Physical Location.
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* STEP 2: DYNAMIC INPUT AREA */}
                    <div className={`transition-all duration-500 ease-in-out ${mode ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                        <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl relative">

                            {mode === 'knowledge' && (
                                <div className="space-y-4 animate-fade-in">
                                    {/* CATEGORY DROPDOWN */}
                                    <div className="space-y-2">
                                        <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Knowledge Domain
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-base font-bold text-gray-900 dark:text-white appearance-none outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                            >
                                                {FIELDS.map((field: FieldType) => (
                                                    <option key={field.type} value={field.type}>
                                                        {field.type} - {field.description}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>

                                    {/* DROPDOWN MENU */}
                                    {isTopicDropdownOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar z-50 animate-fade-in-up">
                                            <div className="p-2">
                                                {filteredTopics.length > 0 && (
                                                    <div className="mb-2">
                                                        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Popular Topics</div>
                                                        {filteredTopics.map((topic) => (
                                                            <button
                                                                key={topic}
                                                                onClick={() => {
                                                                    setAnchorQuery(topic);
                                                                    setCheckStatus('idle');
                                                                    setIsTopicDropdownOpen(false);
                                                                    setTimeout(handleVerify, 100);
                                                                }}
                                                                className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-gray-500 text-sm">tag</span>
                                                                {topic}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {anchorQuery && (
                                                    <button
                                                        onClick={() => {
                                                            setIsTopicDropdownOpen(false);
                                                            setCheckStatus('available');
                                                        }}
                                                        className="w-full text-left px-3 py-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg group hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                                                    >
                                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                            <span className="material-symbols-outlined text-sm">add_circle</span>
                                                            Create new topic: <span className="text-gray-900 dark:text-white">"{anchorQuery}"</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 pl-6 mt-0.5">Initialize a new knowledge graph node.</p>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* GENERIC INPUT FOR ENTITY / PLACE TITLE */
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {category === 'PLACE' ? 'Place Name' : 'Title'}
                                        <FormTooltip text="The official, canonical name of the knowledge entity." />
                                    </label>
                                    <input
                                        type="text"
                                        value={anchorQuery}
                                        onChange={(e) => { setAnchorQuery(e.target.value); setCheckStatus('idle'); }}
                                        placeholder={category === 'PLACE' ? "e.g. The British Museum" : "e.g. Inception"}
                                        className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-xl font-serif font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white transition-colors"
                                    />
                                </div>
                            )}

                            {/* Entity Specific: Creator */}
                            {category === 'ENTITY' && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Creator / Author
                                        <FormTooltip text="Used to distinguish works with the same title (e.g. 'Avatar' by Cameron vs. Anime)." />
                                    </label>
                                    <input
                                        type="text"
                                        value={creatorName}
                                        onChange={(e) => setCreatorName(e.target.value)}
                                        placeholder="e.g. Christopher Nolan"
                                        className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white transition-colors"
                                    />
                                </div>
                            )}

                            {/* Place Specific: Map & Address */}
                            {category === 'PLACE' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Topic Title
                                            <FormTooltip text="The main subject of your article (e.g. 'Quantum Entanglement')." />
                                        </label>
                                        <input
                                            type="text"
                                            value={anchorInput}
                                            onChange={(e) => setAnchorInput(e.target.value)}
                                            placeholder="e.g. The Philosophy of Science"
                                            className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-xl font-serif font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === 'review' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Sub-Tab for Review Type */}
                                    <div className="flex p-1 bg-gray-100 dark:bg-[#0B0E14] rounded-xl w-fit border border-gray-200 dark:border-gray-800">
                                        <button
                                            onClick={() => { setReviewType('url'); setAnchorInput(''); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${reviewType === 'url' ? 'bg-white dark:bg-[#1A1D24] text-black dark:text-white shadow-sm' : 'text-gray-500'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">link</span> Online Source
                                        </button>
                                        <button
                                            onClick={() => { setReviewType('place'); setAnchorInput(''); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${reviewType === 'place' ? 'bg-white dark:bg-[#1A1D24] text-black dark:text-white shadow-sm' : 'text-gray-500'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">map</span> Physical Location
                                        </button>
                                    </div>

                                    {reviewType === 'url' ? (
                                        <div className="space-y-2 animate-fade-in">
                                            <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Resource URL
                                            </label>
                                            <input
                                                type="text"
                                                value={anchorInput}
                                                onChange={(e) => setAnchorInput(e.target.value)}
                                                placeholder="https://example.com/article..."
                                                className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-base font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-fade-in">
                                            {/* Map Container with overlays */}
                                            <div className="relative h-96 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner group">
                                                <MapComponent
                                                    height="100%"
                                                    zoom={coords ? 15 : 10}
                                                    center={coords ? [coords.lng, coords.lat] : undefined}
                                                    onLocationSelect={handleLocationSelect}
                                                    markers={coords ? [{ id: 'selected', name: 'Selected Location', coordinates: [coords.lng, coords.lat] }] : []}
                                                    onMapLoad={(mapInstance) => { mapRef.current = mapInstance; }}
                                                />

                                                {/* Search Overlay */}
                                                <div className="absolute top-4 left-4 right-4 z-10">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={anchorInput}
                                                            onChange={(e) => setAnchorInput(e.target.value)}
                                                            onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                                                            placeholder="Tìm địa điểm..."
                                                            className="w-full bg-white dark:bg-[#13161F] border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 pr-12 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-purple-500 transition-colors shadow-lg"
                                                        />

                                                        {isLoadingSearch && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                                            </div>
                                                        )}

                                                        {/* Search Suggestions Dropdown */}
                                                        {showSuggestions && searchSuggestions.length > 0 && (
                                                            <div className="absolute w-full mt-2 bg-white dark:bg-[#13161F] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in max-h-64 overflow-y-auto">
                                                                {searchSuggestions.map((suggestion) => (
                                                                    <button
                                                                        key={suggestion.id}
                                                                        type="button"
                                                                        onClick={() => selectSuggestion(suggestion)}
                                                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                                                                    >
                                                                        <span className="material-symbols-outlined text-purple-500 text-xl mt-0.5 flex-shrink-0">location_on</span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{suggestion.text}</div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{suggestion.place_name}</div>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Use My Location Button */}
                                                <button
                                                    type="button"
                                                    onClick={getCurrentLocation}
                                                    disabled={isGettingLocation}
                                                    className="absolute top-4 right-4 z-10 bg-white dark:bg-[#13161F] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-purple-600 dark:text-purple-400 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isGettingLocation ? (
                                                        <>
                                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                                            Đang lấy...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-sm">my_location</span>
                                                            Vị trí hiện tại
                                                        </>
                                                    )}
                                                </button>

                                                {/* Hint overlay when no location selected */}
                                                {!coords && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10 dark:bg-black/30 backdrop-blur-[1px]">
                                                        <span className="text-xs text-white font-bold bg-black/60 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
                                                            <span className="material-symbols-outlined text-sm">touch_app</span>
                                                            Click map to drop pin
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Continue Button */}
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                <button
                                    onClick={handleStartWriting}
                                    disabled={!anchorInput || (mode === 'review' && reviewType === 'place' && !coords)}
                                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
                                >
                                    Start Writing <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

                {/* STEP 4: RESULTS */}
                {checkStatus !== 'idle' && checkStatus !== 'scanning' && (
                    <div className="animate-fade-in-up pb-20">
                        {checkStatus === 'taken' && (
                            <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-gray-700 rounded-2xl p-1 overflow-hidden">
                                <div className="bg-red-50 dark:bg-red-500/10 p-4 border-b border-red-100 dark:border-red-500/20 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Knowledge Already Anchored</h3>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">An official record exists. Duplicates are not allowed.</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-4 p-4 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <h4 className="font-serif font-bold text-lg text-gray-800 dark:text-gray-300">{anchorQuery}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            Existing content snippet would appear here to show the user what is already written...
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button className="flex-1 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-sm">edit_note</span>
                                            Suggest an Edit
                                        </button>
                                        <button
                                            onClick={() => handleOptionSelect('instant')}
                                            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                        >
                                            <span className="material-symbols-outlined text-sm">post_add</span>
                                            Write Article
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {checkStatus === 'available' && (
                            <div className="bg-white dark:bg-[#13161F] border border-green-200 dark:border-green-500/30 rounded-2xl p-1 overflow-hidden shadow-[0_0_40px_-10px_rgba(34,197,94,0.1)]">
                                <div className="bg-green-50 dark:bg-green-500/10 p-4 border-b border-green-100 dark:border-green-500/20 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500 flex items-center justify-center">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">New Discovery!</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">This entity has not been anchored yet.</p>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleOptionSelect('instant')}
                                        className="group text-left p-5 rounded-xl bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-black/40 border border-gray-200 dark:border-gray-700 hover:border-green-500/50 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400">edit_document</span>
                                            <span className="text-[9px] font-bold bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">FREE</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400">Write Now</h4>
                                        <p className="text-[10px] text-gray-500">Contribute immediately. No lock-in.</p>
                                    </button>

                                    <button
                                        onClick={() => handleOptionSelect('reserve')}
                                        className="group text-left p-5 rounded-xl bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-black/40 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400">lock_clock</span>
                                            <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 px-2 py-1 rounded border border-blue-200 dark:border-blue-500/20">50 U</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 dark:group-hover:text-blue-400">Reserve Entity</h4>
                                        <p className="text-[10px] text-gray-500">Lock for 7 days. Burn deposit if inactive.</p>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

    const renderEditor = () => (
        <div className="animate-fade-in relative">
            {/* Main Title Input */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Article Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a catchy title..."
                    className="w-full bg-transparent text-2xl md:text-3xl font-serif font-black text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 outline-none leading-tight"
                    autoFocus
                />
            </div>

            {/* ATTACHMENT CARDS (Review Mode) */}
            {mode === 'review' && reviewType === 'place' && coords && (
                <div className="my-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden">
                    <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400">map</span>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4">
                            <span className="material-symbols-outlined text-4xl text-red-500 drop-shadow-lg">location_on</span>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-2xl text-gray-700 dark:text-white">storefront</span>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Reviewing Location</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{anchorInput}</h3>
                                <div className="text-xs text-gray-500 font-mono">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</div>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800">
                            Verified
                        </div>
                    </div>
                </div>
            )}

            {mode === 'review' && reviewType === 'url' && (
                <div className="my-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <span className="material-symbols-outlined text-2xl">link</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5">Reviewing Source</div>
                        <div className="text-base font-medium text-gray-900 dark:text-white truncate">{anchorInput}</div>
                    </div>
                    <a href={anchorInput} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500 transition-colors">
                        <span className="material-symbols-outlined">open_in_new</span>
                    </a>
                </div>
            )}

            {/* Premium Hint Input */}
            {accessMode === 'premium' && (
                <div className="mb-8 relative group">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-purple-500 rounded-full"></div>
                    <label className="block text-xs font-bold text-purple-600 dark:text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">diamond</span>
                        Premium Hint (Publicly Visible)
                    </label>
                    <textarea
                        className="w-full bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/30 rounded-xl p-4 text-lg font-sans text-gray-800 dark:text-purple-100 placeholder-purple-300 dark:placeholder-purple-400/50 outline-none resize-none min-h-[120px] focus:ring-2 focus:ring-purple-500/50 transition-all"
                        placeholder="Write a compelling teaser..."
                        value={premiumHint}
                        onChange={(e) => setPremiumHint(e.target.value)}
                    />
                </div>
            )}

            {/* Main Content Input */}
            <textarea
                className="w-full min-h-[500px] bg-transparent resize-none outline-none text-lg md:text-xl font-sans text-gray-800 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed custom-scrollbar"
                placeholder={mode === 'review' ? "Write your review or analysis here..." : "Share your deep knowledge..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
        </div>
    );

    const renderPreview = () => (
        <div className="max-w-3xl mx-auto py-10 animate-fade-in">
            <div className="mb-4 text-center">
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {mode === 'knowledge' ? 'Topic' : 'Review'}: {anchorInput}
                </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mb-8 leading-tight text-center">
                {title || "Untitled"}
            </h1>

            {/* Attachment previews */}
            {mode === 'review' && reviewType === 'place' && coords && (
                <div className="my-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400">map</span>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4">
                            <span className="material-symbols-outlined text-4xl text-red-500 drop-shadow-lg">location_on</span>
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-2xl text-gray-700 dark:text-white">storefront</span>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Verified Location</div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{anchorInput}</h3>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-200 dark:border-green-800">Verified</div>
                    </div>
                </div>
            )}

            {mode === 'review' && reviewType === 'url' && (
                <div className="my-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <span className="material-symbols-outlined text-2xl">link</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-0.5">Source Link</div>
                        <div className="text-base font-medium text-gray-900 dark:text-white truncate">{anchorInput}</div>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 -rotate-45">arrow_forward</span>
                </div>
            )}

            {/* Premium Hint Block */}
            {accessMode === 'premium' && viewMode !== 'preview_locked' && (
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-500/20 p-6 rounded-2xl mb-8">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-3">
                        <span className="material-symbols-outlined text-sm">diamond</span> Premium Teaser
                    </div>
                    <p className="text-lg font-sans text-gray-800 dark:text-gray-200 leading-relaxed italic">
                        {premiumHint || "No hint provided yet..."}
                    </p>
                </div>
            )}

            {/* Content Logic */}
            {viewMode === 'preview_locked' && accessMode === 'premium' ? (
                <div className="my-12 text-center p-12 border border-gray-200 dark:border-gray-800 rounded-2xl">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">lock</span>
                    <p className="text-gray-500">Premium content is locked in preview mode</p>
                </div>
            ) : (
                <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {content || "Start writing to see your content here..."}
                </div>
            )}
        </div>
    );

    // --- MAIN RENDER ---
    if (flowStep === 'anchor') {
        return (
            <>
                {renderAnchorFlow()}
                {renderExitModal()}
            </>
        );
    }

    // EDITOR VIEW
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#050608] overflow-hidden transition-colors duration-300">
            {/* LEFT: MAIN WRITING AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#050608] z-20">
                    <button
                        onClick={handleExit}
                        className="group flex items-center gap-2 px-3 py-2 -ml-3 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="font-bold text-xs uppercase tracking-wider">Cancel</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                            {isSaving ? (
                                <span className="text-gray-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Saving...</span>
                            ) : (
                                <span className="text-green-500 flex items-center gap-2"><span className="material-symbols-outlined text-sm">cloud_done</span> Saved</span>
                            )}
                        </div>
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                        <button
                            onClick={handlePublish}
                            disabled={!content.trim() || !title.trim() || isPublishing}
                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold font-mono text-xs uppercase tracking-wider hover:opacity-80 disabled:opacity-50 transition-all rounded-full flex items-center gap-2"
                        >
                            {isPublishing ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto mt-0 px-8 pb-32">
                        {renderToolbar()}
                        {viewMode === 'edit' ? renderEditor() : renderPreview()}
                    </div>
                </div>
            </div>

            {/* RIGHT: ACCESS CONTROL */}
            <div className="w-80 bg-white dark:bg-[#0B0E14] border-l border-gray-200 dark:border-gray-800 flex flex-col z-30 shadow-2xl">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">tune</span>
                        Settings
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Access Level Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">Access Level</label>
                        <div className="space-y-3">
                            <label className={`block cursor-pointer p-4 rounded-xl border transition-all ${accessMode === 'public' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500' : 'bg-transparent border-gray-200 dark:border-gray-800'}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <input type="radio" name="access" className="accent-blue-500" checked={accessMode === 'public'} onChange={() => setAccessMode('public')} />
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">Public</span>
                                </div>
                                <p className="text-xs text-gray-500 pl-6">Open to everyone.</p>
                            </label>

                            <label className={`block cursor-pointer p-4 rounded-xl border transition-all ${accessMode === 'private' ? 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500' : 'bg-transparent border-gray-200 dark:border-gray-800'}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <input type="radio" name="access" className="accent-gray-500" checked={accessMode === 'private'} onChange={() => setAccessMode('private')} />
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">Private Draft</span>
                                        <span className="material-symbols-outlined text-gray-500 text-sm">lock</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 pl-6">Only visible to you.</p>
                            </label>

                            <label className={`block cursor-pointer p-4 rounded-xl border transition-all ${accessMode === 'premium' ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-400 dark:border-purple-500' : 'bg-transparent border-gray-200 dark:border-gray-800'}`}>
                                <div className="flex items-center gap-3 mb-1">
                                    <input type="radio" name="access" className="accent-purple-500" checked={accessMode === 'premium'} onChange={() => setAccessMode('premium')} />
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">Premium</span>
                                        <span className="material-symbols-outlined text-purple-500 text-sm">diamond</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 pl-6">Pay-to-unlock.</p>
                            </label>
                        </div>
                    </div>

                    {/* Premium Settings */}
                    {accessMode === 'premium' && (
                        <div className="animate-fade-in-up">
                            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-6"></div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Unlock Price</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={unlockPrice}
                                    onChange={(e) => setUnlockPrice(Number(e.target.value))}
                                    className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-16 text-gray-900 dark:text-white font-mono font-bold outline-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase">Points</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {renderExitModal()}
        </div>
    );
}
