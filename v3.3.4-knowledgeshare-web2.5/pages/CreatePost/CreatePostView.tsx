
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { PostVisibility, PostContentType, FieldType, Location } from '../../types';
import { PremiumLock } from '../../components/feed/PremiumLock';
import { CURRENT_USER, FIELDS } from '../../data/mockData';

// Declare Leaflet global
declare const L: any;

// Access Modes Configuration
type AccessMode = 'private' | 'public' | 'premium';
type FlowStep = 'anchor' | 'editor';
type CreateMode = 'knowledge' | 'review';
type ReviewType = 'url' | 'place';

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return createPortal(
        <div className="fixed bottom-8 right-8 z-[20001] bg-white dark:bg-[#0F1116] border border-green-500/30 text-gray-900 dark:text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Success</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
            </div>
        </div>,
        document.body
    );
};

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

interface CreatePostProps {
    onPublish: (
        title: string, 
        content: string, 
        visibility: PostVisibility, 
        contentType: PostContentType, 
        hint?: string, 
        price?: number, 
        field?: FieldType,
        link?: string,
        location?: Location
    ) => any
}

export const CreatePostView = ({ onPublish }: CreatePostProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- FLOW STATE ---
    const [flowStep, setFlowStep] = useState<FlowStep>('anchor');
    const [mode, setMode] = useState<CreateMode | null>(null);
    const [reviewType, setReviewType] = useState<ReviewType>('url');
    
    // Anchor Form Data
    const [anchorInput, setAnchorInput] = useState(''); // Holds Title, URL, or Place Name
    const [selectedCategory, setSelectedCategory] = useState<FieldType>('General'); // New State for Dropdown
    const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null); // For Place

    // Map Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    // --- MODAL STATES ---
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showToast, setShowToast] = useState(false);

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

    // --- INITIALIZATION FROM ROUTE STATE ---
    useEffect(() => {
        if (location.state?.reservation) {
            const res = location.state.reservation;
            setAnchorInput(res.entity);
            setMode('knowledge');
            setFlowStep('editor');
            setTitle(res.entity); // Pre-fill title
        }
    }, [location.state]);

    // --- MAP INITIALIZATION (Leaflet) ---
    useEffect(() => {
        // Only initialize if Mode is Review + Place and container exists
        if (mode === 'review' && reviewType === 'place' && mapContainerRef.current) {
            
            if (!mapInstanceRef.current) {
                const initialLat = 10.870219615905674;
                const initialLng = 106.80366563953667;

                const map = L.map(mapContainerRef.current, {
                    center: [initialLat, initialLng],
                    zoom: 13,
                    zoomControl: false, 
                    attributionControl: false
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    maxZoom: 20,
                    subdomains: 'abcd'
                }).addTo(map);

                // Handle Map Click
                map.on('click', (e: any) => {
                    const { lat, lng } = e.latlng;
                    setCoords({ lat, lng });
                });

                mapInstanceRef.current = map;
            }
            // Invalidate size to prevent grey tiles if container resized
            setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
            }, 100);
        } else {
            // Cleanup map if we switch away from map view
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        }
    }, [mode, reviewType]);

    // --- MARKER UPDATE ---
    useEffect(() => {
        if (mode === 'review' && reviewType === 'place' && mapInstanceRef.current && coords) {
            if (markerRef.current) {
                markerRef.current.setLatLng([coords.lat, coords.lng]);
            } else {
                const icon = L.divIcon({
                    className: 'custom-pin-marker',
                    html: `<div class="relative w-8 h-8 flex items-center justify-center">
                             <div class="absolute w-8 h-8 bg-red-500 rounded-full opacity-30 animate-ping"></div>
                             <div class="relative w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <span class="material-symbols-outlined text-white text-[14px]">location_on</span>
                             </div>
                           </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                markerRef.current = L.marker([coords.lat, coords.lng], { icon }).addTo(mapInstanceRef.current);
            }
            mapInstanceRef.current.panTo([coords.lat, coords.lng], { animate: true });
        }
    }, [coords, mode, reviewType]);


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

    // --- HANDLERS ---

    const handleExit = () => {
        const hasContent = title.trim() || content.trim();
        if (hasContent) {
            setShowExitConfirm(true);
        } else {
            navigate('/app/feed');
        }
    };

    const confirmExit = () => {
        setShowExitConfirm(false);
        navigate('/app/feed');
    };

    const handleStartWriting = () => {
        if (!anchorInput) return;
        
        // Auto-set title based on input to save user time
        if (mode === 'knowledge') {
            setTitle(anchorInput); 
        } else if (mode === 'review') {
            // If review, maybe keep title empty or set format like "Review: [Place]"
            setTitle(reviewType === 'place' ? `Review: ${anchorInput}` : ''); 
        }
        
        setFlowStep('editor');
    };

    const handlePublish = () => {
        if (!content || !title) return;
        
        setIsPublishing(true);

        let visibility: PostVisibility = 'public';
        let contentType: PostContentType = 'standard';

        if (accessMode === 'private') visibility = 'private';
        else if (accessMode === 'premium') contentType = 'premium';

        setTimeout(() => {
            // Determine additional data
            let link: string | undefined;
            let locationData: Location | undefined;

            if (mode === 'review') {
                if (reviewType === 'url') {
                    link = anchorInput;
                } else if (reviewType === 'place' && coords) {
                    locationData = {
                        id: Date.now().toString(),
                        name: anchorInput,
                        lat: coords.lat,
                        lng: coords.lng,
                        type: 'store', // Default type, could be refined
                        rating: 0,
                        reviewsCount: 0
                    };
                }
            }

            const fieldToPass = mode === 'knowledge' ? selectedCategory : undefined;
            
            onPublish(title, content, visibility, contentType, premiumHint, unlockPrice, fieldToPass, link, locationData);
            navigate('/app/feed');
        }, 1500);
    };

    // --- RENDERERS ---

    const renderExitModal = () => {
        if (!showExitConfirm) return null;
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

    const renderAnchorFlow = () => {
        return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Background Ambient */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Exit Button */}
            <div className="absolute top-6 right-6 z-20">
                <button 
                    onClick={() => navigate('/app/feed')}
                    className="p-3 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>

            <div className="max-w-4xl w-full z-10 animate-fade-in-up">
                
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mb-3">Create Contribution</h1>
                    <p className="text-gray-500 dark:text-gray-400">Share your wisdom or review an entity on the Permaweb.</p>
                </div>

                {/* STEP 1: MODE SELECTION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Mode 1: General Knowledge */}
                    <button
                        onClick={() => { setMode('knowledge'); setAnchorInput(''); }}
                        className={`relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                            mode === 'knowledge' 
                            ? 'bg-white dark:bg-[#13161F] border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]' 
                            : 'bg-white dark:bg-[#13161F] border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-lg'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                            mode === 'knowledge' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">auto_stories</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">General Knowledge</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Write about concepts, theories, history, or science. Create a standard topic entry.
                        </p>
                    </button>

                    {/* Mode 2: Review Source */}
                    <button
                        onClick={() => { setMode('review'); setAnchorInput(''); }}
                        className={`relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                            mode === 'review' 
                            ? 'bg-white dark:bg-[#13161F] border-purple-500 shadow-xl shadow-purple-500/10 scale-[1.02]' 
                            : 'bg-white dark:bg-[#13161F] border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-lg'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                            mode === 'review' ? 'bg-purple-600 text-white' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        }`}>
                            <span className="material-symbols-outlined text-3xl">rate_review</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review Source</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Review an external entity like a Website URL or a Physical Location (Shop, Park, etc).
                        </p>
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
                                            onChange={(e) => setSelectedCategory(e.target.value as FieldType)}
                                            className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-base font-bold text-gray-900 dark:text-white appearance-none outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            {FIELDS.map(field => (
                                                <option key={field.type} value={field.type}>
                                                    {field.type} - {field.description}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                                    </div>
                                </div>

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
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                                            reviewType === 'url' ? 'bg-white dark:bg-[#1A1D24] text-black dark:text-white shadow-sm' : 'text-gray-500'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">link</span> Online Source
                                    </button>
                                    <button
                                        onClick={() => { setReviewType('place'); setAnchorInput(''); }}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                                            reviewType === 'place' ? 'bg-white dark:bg-[#1A1D24] text-black dark:text-white shadow-sm' : 'text-gray-500'
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
                                        <div className="space-y-2">
                                            <label className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Location Name / Address
                                            </label>
                                            <input 
                                                type="text" 
                                                value={anchorInput}
                                                onChange={(e) => setAnchorInput(e.target.value)}
                                                placeholder="e.g. Central Library, New York"
                                                className="w-full bg-gray-50 dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
                                                autoFocus
                                            />
                                        </div>
                                        
                                        {/* Simplified Leaflet Map Container */}
                                        <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner group">
                                            <div ref={mapContainerRef} className="w-full h-full z-0 bg-gray-100 dark:bg-gray-900" />
                                            
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
            {showToast && <Toast message="Draft Created." onClose={() => setShowToast(false)} />}
        </div>
    );};

    const renderToolbar = () => (
        <div className="flex items-center gap-1 mb-6 py-4 border-b border-gray-200 dark:border-gray-800 text-gray-400 sticky top-0 bg-gray-50/95 dark:bg-[#050608]/95 backdrop-blur-sm z-10 transition-all">
            {/* Formatting Tools */}
            {viewMode === 'edit' && (
                <>
                    <div className="flex items-center gap-1 mr-4">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="Bold"><span className="material-symbols-outlined text-xl">format_bold</span></button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="Italic"><span className="material-symbols-outlined text-xl">format_italic</span></button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="Quote"><span className="material-symbols-outlined text-xl">format_quote</span></button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="List"><span className="material-symbols-outlined text-xl">format_list_bulleted</span></button>
                    </div>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
                </>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-auto">
                <button 
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                    <span className="material-symbols-outlined text-sm">edit_square</span> Write
                </button>
                {accessMode === 'premium' && (
                    <button 
                        onClick={() => setViewMode('preview_locked')}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'preview_locked' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        <span className="material-symbols-outlined text-sm">lock</span> Preview Locked
                    </button>
                )}
                <button 
                    onClick={() => setViewMode('preview_unlocked')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${viewMode === 'preview_unlocked' ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
                >
                    <span className="material-symbols-outlined text-sm">visibility</span> Preview
                </button>
            </div>
        </div>
    );

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
                    className="w-full bg-transparent text-4xl md:text-5xl font-serif font-black text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 outline-none leading-tight"
                    autoFocus
                />
             </div>

             {/* ATTACHMENT CARDS (Review Mode) */}
             {mode === 'review' && reviewType === 'place' && coords && (
                <div className="my-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden">
                    <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                        {/* Simulated Map Background */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400">map</span>
                        </div>
                        {/* Pin */}
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

            {/* ATTACHMENT CARDS (Preview Mode) */}
            {mode === 'review' && reviewType === 'place' && coords && (
                <div className="my-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
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
                <PremiumLock 
                    hint={premiumHint || "Unlock to read the full analysis..."}
                    price={unlockPrice}
                    balance={CURRENT_USER.balance_u}
                    onUnlockRequest={() => alert("This is a preview. Your balance is safe.")}
                />
            ) : (
                <div className="prose prose-lg dark:prose-invert max-w-none font-sans text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {content || "Start writing to see your content here..."}
                </div>
            )}
        </div>
    );

    // --- MAIN RENDER ---
    if (flowStep === 'anchor') {
        return renderAnchorFlow();
    }

    // EDITOR VIEW (Reused structure)
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
};
