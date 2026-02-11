"use client";

import React, { useState } from "react";
import { BookmarkCard } from "@/components/bookmarks/BookmarkCard";
import { BookmarkMapModal } from "@/components/bookmarks/BookmarkMapModal";
import { toast } from "sonner";

// Types
type Category = 'article' | 'place' | 'video';

interface Bookmark {
    id: string;
    title: string;
    excerpt: string;
    author: { name: string; avatar?: string };
    category: Category;
    rating?: number;
    folderId: string;
    date: string;
    location?: { lat: number; lng: number; address: string };
}

interface Folder {
    id: string;
    name: string;
    icon: string;
    type?: 'general' | 'place' | 'all';
}

// Mock Data
const INITIAL_FOLDERS: Folder[] = [
    { id: "all", name: "All Items", icon: "inventory_2", type: 'all' },
    { id: "restaurants", name: "Restaurants", icon: "restaurant", type: 'place' },
    { id: "coffee", name: "Coffee & Tea", icon: "local_cafe", type: 'place' },
    { id: "street-food", name: "Street Food", icon: "fastfood", type: 'place' },
    { id: "research", name: "Research & Science", icon: "science", type: 'general' },
    { id: "attractions", name: "Attractions", icon: "attractions", type: 'place' },
    { id: "ideas", name: "Project Ideas", icon: "lightbulb", type: 'general' },
];

const INITIAL_BOOKMARKS: Bookmark[] = [
    {
        id: "1",
        title: "Advanced React Patterns",
        excerpt: "Deep dive into render props and hooks. A must read for senior devs.",
        author: { name: "Vitalik B.", avatar: "" },
        category: "article",
        rating: 5,
        folderId: "research",
        date: "10/22/2024",
    },
    {
        id: "2",
        title: "Huberman Lab: Sleep Toolkit",
        excerpt: "Protocols for better sleep hygiene. Sunlight viewing, temperature control, and NSDR.",
        author: { name: "Huberman", avatar: "" },
        category: "article",
        rating: 5,
        folderId: "research",
        date: "10/26/2024",
    },
    {
        id: "3",
        title: "The Art of Doing Nothing",
        excerpt: "A philosophical exploration of rest and productivity.",
        author: { name: "Author", avatar: "" },
        category: "place",
        rating: 5,
        folderId: "restaurants",
        date: "10/28/2024",
        location: { lat: 35.0116, lng: 135.7681, address: "Kyoto, Japan" }
    },
    {
        id: "4",
        title: "Hidden Gem: The Quiet Cafe",
        excerpt: "Best coffee spot in District 1. Excellent cold brew and silence for working.",
        author: { name: "Author", avatar: "" },
        category: "place",
        rating: 3,
        folderId: "coffee",
        date: "10/23/2024",
        location: { lat: 35.6762, lng: 139.6503, address: "Tokyo, Japan" }
    },
    {
        id: "5",
        title: "Solana Breakpoint 2024",
        excerpt: "Key takeaways from the conference. Firedancer, Saga phone updates, and more.",
        author: { name: "Solana", avatar: "" },
        category: "article",
        rating: 4,
        folderId: "research",
        date: "10/30/2024",
    },
];

export default function BookmarksPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'source'>('general');
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState<'all' | 3 | 4 | 5>('all');

    // Data State
    const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(INITIAL_BOOKMARKS);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("all");

    // Modal State
    const [selectedBookmark, setSelectedBookmark] = useState<any>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Drag & Drop State
    const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

    // Filter Logic
    const filteredBookmarks = bookmarks.filter(item => {
        // Tab Filter
        if (activeTab === 'general' && item.category === 'place') return false;
        if (activeTab === 'source' && item.category !== 'place') return false;

        // Folder Filter
        if (selectedFolderId !== 'all' && item.folderId !== selectedFolderId) return false;

        // Rating Filter
        if (ratingFilter !== 'all' && (item.rating || 0) < ratingFilter) return false;

        return true;
    });

    // Filter Folders based on Active Tab
    const visibleFolders = folders.filter(f =>
        f.type === 'all' ||
        (activeTab === 'general' && (f.type === 'general' || !f.type)) ||
        (activeTab === 'source' && f.type === 'place')
    );

    const handleMapClick = (bookmark: any) => {
        setSelectedBookmark(bookmark);
        setIsMapModalOpen(true);
    };

    // --- Drag & Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        setDraggedBookmarkId(id);
    };

    const handleDragOver = (e: React.DragEvent, folderId: string) => {
        e.preventDefault();
        if (folderId !== 'all') {
            setDragOverFolderId(folderId);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        setDragOverFolderId(null);
    };

    const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
        e.preventDefault();
        setDragOverFolderId(null);
        setDraggedBookmarkId(null);

        const bookmarkId = e.dataTransfer.getData("text/plain");
        if (!bookmarkId || targetFolderId === 'all') return;

        setBookmarks(prev => prev.map(b =>
            b.id === bookmarkId ? { ...b, folderId: targetFolderId } : b
        ));

        const folderName = folders.find(f => f.id === targetFolderId)?.name;
        toast.success(`Moved to ${folderName}`);
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newId = newFolderName.toLowerCase().replace(/\s+/g, '-');
        setFolders(prev => [...prev, { id: newId, name: newFolderName, icon: "folder" }]);
        setNewFolderName("");
        setIsCreateFolderOpen(false);
        toast.success("Folder created!");
    };

    const handleRate = (bookmarkId: string, rating: number) => {
        setBookmarks(prev => prev.map(b =>
            b.id === bookmarkId ? { ...b, rating } : b
        ));
        toast.success(`Rated ${rating} stars!`);
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 animate-fade-in flex gap-10">

            {/* --- MAIN CONTENT (70%) --- */}
            <div className="flex-1 min-w-0">
                {/* Header: Tabs & Filter */}
                <div className="flex items-center justify-between mb-8">

                    {/* Dark Segmented Tabs */}
                    <div className="flex bg-[#0E1217] p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'general'
                                ? 'bg-[#1C2128] text-white shadow-sm ring-1 ring-white/10'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">article</span>
                            GENERAL KNOWLEDGE
                        </button>
                        <button
                            onClick={() => setActiveTab('source')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'source'
                                ? 'bg-[#1C2128] text-white shadow-sm ring-1 ring-white/10'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">map</span>
                            REVIEW SOURCE
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 uppercase">Filter:</span>
                        <div className="flex bg-[#0E1217] rounded-lg p-1 border border-white/5">
                            {['all', 3, 4, 5].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRatingFilter(r as any)}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${ratingFilter === r
                                        ? 'bg-amber-500 text-black'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {r === 'all' ? 'All' : `${r}+ ★`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="space-y-4 animate-fade-in-up">
                    {filteredBookmarks.map((bookmark) => (
                        <BookmarkCard
                            key={bookmark.id}
                            {...bookmark}
                            folder={folders.find(f => f.id === bookmark.folderId)?.name}
                            onMapClick={activeTab === 'source' && 'location' in bookmark ? () => handleMapClick(bookmark) : undefined}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, bookmark.id)}
                            showMapPreview={activeTab === 'source'}
                            onRate={(rating) => handleRate(bookmark.id, rating)}
                        />
                    ))}
                </div>

                {filteredBookmarks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 bg-[#0E1217] rounded-2xl border border-dashed border-white/5 mt-4">
                        <span className="material-symbols-outlined text-6xl text-gray-600">bookmark_border</span>
                        <h3 className="text-xl font-bold text-white mt-4">No bookmarks found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {selectedFolderId !== 'all'
                                ? "Drag items here or add new bookmarks."
                                : "Try adjusting your filters."}
                        </p>
                    </div>
                )}
            </div>

            {/* --- RIGHT SIDEBAR: LIBRARY (300px) --- */}
            <div className="w-[300px] flex-shrink-0 pt-[88px]">
                <div className="bg-[#0E1217] border border-white/5 rounded-3xl p-6 shadow-xl sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Library</h3>
                        <button
                            onClick={() => setIsCreateFolderOpen(!isCreateFolderOpen)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>

                    {/* Create Folder Input */}
                    {isCreateFolderOpen && (
                        <div className="mb-4 animate-fade-in p-3 bg-[#1C2128] rounded-xl border border-white/5">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Folder Name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary mb-3"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCreateFolderOpen(false)}
                                    className="text-xs font-bold text-gray-500 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    className="text-xs font-bold text-primary hover:text-primary-light"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Folder List */}
                    <div className="space-y-2">
                        {visibleFolders.map(folder => {
                            const isDropTarget = dragOverFolderId === folder.id;
                            const isActive = selectedFolderId === folder.id;
                            const count = bookmarks.filter(b => b.folderId === folder.id).length;
                            const displayCount = folder.id === 'all' ? bookmarks.length : count;

                            return (
                                <button
                                    key={folder.id}
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    onDragOver={(e) => handleDragOver(e, folder.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, folder.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                        ? "bg-[#1C2128] text-white ring-1 ring-white/10"
                                        : isDropTarget
                                            ? "bg-primary/20 text-primary border border-primary border-dashed"
                                            : "text-gray-400 hover:bg-[#1C2128] hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? "text-white" : "text-gray-600 group-hover:text-gray-400"
                                            }`}>
                                            {folder.icon}
                                        </span>
                                        {folder.name}
                                    </div>
                                    <span className={`text-[10px] min-w-[20px] h-5 flex items-center justify-center rounded-full font-bold transition-colors ${isActive
                                        ? "bg-white text-black"
                                        : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-400"
                                        }`}>
                                        {displayCount}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Map Modal */}
            <BookmarkMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                bookmark={selectedBookmark}
            />
        </div>
    );
};
