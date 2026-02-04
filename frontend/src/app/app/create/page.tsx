"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import MapComponent from '@/components/Map/MapComponent';
import { toast } from 'sonner';

// Access Modes Configuration
type AccessMode = 'private' | 'public' | 'premium';
type FlowStep = 'anchor' | 'editor';
type EntityCategory = 'PLACE' | 'ENTITY' | 'TOPIC';

const POPULAR_TOPICS = [
    'Science',
    'Technology',
    'Art',
    'History',
    'Health',
    'Finance',
    'Education',
    'Travel',
    'Music',
    'Sports',
    'Artificial Intelligence',
    'Cryptocurrency',
    'Philosophy',
    'Psychology',
    'Environment'
];

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

    // --- ANCHORING STATE (The Subject) ---
    const [flowStep, setFlowStep] = useState<FlowStep>('anchor');
    const [category, setCategory] = useState<EntityCategory | null>('TOPIC'); // Default to TOPIC

    // Anchor Form Data
    const [anchorQuery, setAnchorQuery] = useState(''); // Main Name/Title
    const [creatorName, setCreatorName] = useState(''); // For Entity
    const [address, setAddress] = useState(''); // For Place
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null); // For Place

    // Topic Dropdown State
    const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [checkStatus, setCheckStatus] = useState<'idle' | 'scanning' | 'taken' | 'available'>('idle');
    const [commitMode, setCommitMode] = useState<'instant' | 'reserve'>('instant');

    // --- MODAL STATES ---
    const [showStakeConfirm, setShowStakeConfirm] = useState(false);
    const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
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

    // Handle clicking outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTopicDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // --- REAL MAP HANDLER ---
    const handleLocationSelect = (location: { coordinates: [number, number], address: string }) => {
        // Mapbox returns [lng, lat]
        // We store as { lat, lng }
        setCoords({ lat: location.coordinates[1], lng: location.coordinates[0] });
        // Optionally update address if reverse geocoding is available in the location object
        // setAddress(location.address); 
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

    const handleVerify = () => {
        if (!anchorQuery) return;

        setCheckStatus('scanning');

        // Simulate Network Delay & Check
        setTimeout(() => {
            const taken = ['solana', 'bitcoin', 'arweave', 'ethereum', 'inception', 'london'].includes(anchorQuery.toLowerCase());
            setCheckStatus(taken ? 'taken' : 'available');
        }, 1500);
    };

    const handleOptionSelect = (mode: 'instant' | 'reserve') => {
        if (mode === 'reserve') {
            setShowStakeConfirm(true);
        } else {
            setCommitMode('instant');
            if (!title) setTitle(anchorQuery);
            setFlowStep('editor');
            router.push('/app/create/compose'); // Or handle inline if desired
            // NOTE: For now staying inline to match logic for Demo? 
            // The original logic just sets flowStep = 'editor'. 
            // Next.js routing might want a separate page, but for "exact port" let's keeping single page or pushing state.
            // If I push to /compose, I need to pass state.
            // Let's stick to single page flow for now to match the "Design" perfectly.
        }
    };

    const confirmStake = () => {
        setShowStakeConfirm(false);
        toast.success("Entity Reserved Successfully. Access it via your Profile to start writing.");
        setTimeout(() => {
            router.push('/app/feed');
        }, 2000);
    };

    const handleReleaseClick = () => {
        setShowReleaseConfirm(true);
    };

    const confirmRelease = () => {
        setShowReleaseConfirm(false);
        setFlowStep('anchor');
        setAnchorQuery('');
        setCheckStatus('idle');
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
                            You have unsaved content in your article. Leaving now will discard your draft permanently.
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
                <div className="relative w-full max-w-md bg-white dark:bg-[#0B0E14] border border-orange-200 dark:border-orange-900/50 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                    <div className="h-1 bg-gradient-to-r from-orange-600 to-red-600"></div>
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-200 dark:border-orange-500/30">
                            <span className="material-symbols-outlined text-3xl text-orange-600 dark:text-orange-500">lock_clock</span>
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

                        <div className="flex items-center gap-2 justify-center mb-6 text-[10px] font-bold text-orange-600 dark:text-orange-500 bg-orange-100 dark:bg-orange-900/10 py-2 rounded-lg border border-orange-200 dark:border-orange-900/30 uppercase tracking-widest">
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
                                className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 transition-all uppercase text-xs tracking-wider"
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
        <div className="min-h-screen bg-gray-100 dark:bg-[#0B0E14] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Background Ambient */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200 dark:bg-orange-900/10 rounded-full blur-[100px]"></div>
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
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        Knowledge Anchoring Protocol
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mb-2">Anchor Knowledge</h1>
                    <p className="text-gray-500 dark:text-gray-500">Define the entity you wish to contribute to. Ensure uniqueness on the Permaweb.</p>
                </div>

                {/* STEP 1: CATEGORY PICKER */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { id: 'TOPIC', icon: 'topic', label: 'Topic', desc: 'Concepts, theories, or general subjects.' },
                        { id: 'ENTITY', icon: 'library_books', label: 'Entity', desc: 'Books, movies, artworks, or specific items.' },
                        { id: 'PLACE', icon: 'map', label: 'Place', desc: 'Restaurants, parks, historical sites.' }
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setCategory(cat.id as EntityCategory); setCheckStatus('idle'); }}
                            className={`p-6 rounded-2xl border text-left transition-all duration-300 group ${category === cat.id
                                ? 'bg-white dark:bg-white/5 border-purple-500 shadow-lg shadow-purple-500/10'
                                : 'bg-white/50 dark:bg-[#13161F] border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${category === cat.id ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-700 group-hover:text-gray-900 dark:group-hover:text-white'
                                }`}>
                                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                            </div>
                            <h3 className={`text-lg font-bold mb-1 ${category === cat.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                {cat.label}
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
                        </button>
                    ))}
                </div>

                {/* STEP 2: DYNAMIC INPUT FIELDS */}
                <div className={`transition-all duration-500 ease-in-out ${category ? 'opacity-100 max-h-[800px]' : 'opacity-50 max-h-0 overflow-hidden'}`}>
                    <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 mb-8 shadow-2xl overflow-visible">

                        {/* Dynamic Form Content */}
                        <div className="space-y-6">

                            {/* TOPIC SPECIFIC INPUT (COMBOBOX) */}
                            {category === 'TOPIC' ? (
                                <div className="space-y-2 relative" ref={dropdownRef}>
                                    <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Topic Name (Subject)
                                        <FormTooltip text="This is the Subject you are writing about (e.g. Quantum Physics), NOT the title of your article." />
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={anchorQuery}
                                            onChange={(e) => {
                                                setAnchorQuery(e.target.value);
                                                setCheckStatus('idle');
                                                setIsTopicDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsTopicDropdownOpen(true)}
                                            placeholder="Select or create a topic (e.g. Quantum Physics)"
                                            className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-xl font-serif font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white transition-colors pr-10"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                            <span className="material-symbols-outlined">expand_more</span>
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
                                                        className="w-full text-left px-3 py-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg group hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all"
                                                    >
                                                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
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
                                            Address / Location
                                            <FormTooltip text="Search for the street address." />
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="e.g. Great Russell St, London WC1B 3DG"
                                            className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-gray-400 dark:focus:border-white transition-colors"
                                        />
                                    </div>

                                    {/* INTERACTIVE MAP UI (MAPBOX) */}
                                    <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner group">
                                        <MapComponent
                                            height="100%"
                                            zoom={coords ? 15 : 10}
                                            center={coords ? [coords.lng, coords.lat] : undefined} // MapComponent default is HCM if undefined
                                            onLocationSelect={handleLocationSelect}
                                            markers={coords ? [{ id: 'selected', name: 'Selected Location', coordinates: [coords.lng, coords.lat] }] : []}
                                        />

                                        {/* Helper Overlay (Fades out once user clicks) */}
                                        {!coords && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 z-10">
                                                <span className="text-xs text-white font-bold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">touch_app</span>
                                                    Click anywhere to drop pin
                                                </span>
                                            </div>
                                        )}

                                        {/* Coords Display Floating on Map */}
                                        <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-gray-700 flex justify-between items-center z-[400] pointer-events-none">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coordinates</span>
                                            <span className="text-[10px] font-mono text-green-400">
                                                {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'No location selected'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* STEP 3: VERIFICATION ACTION */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-center">
                            <button
                                onClick={handleVerify}
                                disabled={!anchorQuery || (category === 'ENTITY' && !creatorName) || (category === 'PLACE' && !coords) || checkStatus === 'scanning'}
                                className="group relative px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-gray-700 dark:hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden w-full md:w-auto shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {checkStatus === 'scanning' ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Scanning Knowledge Base...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">fingerprint</span>
                                            Verify & Continue
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

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
                                        className="group text-left p-5 rounded-xl bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-black/40 border border-gray-200 dark:border-gray-700 hover:border-orange-500/50 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400">lock_clock</span>
                                            <span className="text-[9px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 px-2 py-1 rounded border border-orange-200 dark:border-orange-500/20">50 U</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 dark:group-hover:text-orange-400">Reserve Entity</h4>
                                        <p className="text-[10px] text-gray-500">Lock for 7 days. Burn deposit if inactive.</p>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {renderStakeConfirmationModal()}
                {renderExitModal()}
            </div>
        </div>
    );
}
