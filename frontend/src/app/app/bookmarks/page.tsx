"use client";

import React, { useState, useEffect, useCallback } from "react";

import { BookmarkMapModal } from "@/components/bookmarks/BookmarkMapModal";
import { PostCard } from "@/components/shared/PostCard";
import { toast } from "sonner";
import { Globe, Lock, Bookmark, ChevronDown, Loader2, Share2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = "private" | "public" | "saved" | "shared";
type Category = 'article' | 'place' | 'video';

interface BookmarkItem {
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

interface PostItem {
    id: number;
    title: string;
    content: string;
    visibility: string;
    createdAt: string;
    likes: number;
    comments: number;
    shares: number;
    author?: { name: string; avatar: string };
    location?: { name: string; lat: number; lng: number } | null;
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchMyPosts(visibility: "PUBLIC" | "PRIVATE"): Promise<PostItem[]> {
    const res = await fetch(
        `${API_BASE_URL}/api/articles/me?visibility=${visibility}&limit=20`,
        { credentials: "include" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.items ?? [];
}

async function fetchSavedPosts(type: "SAVE" | "SHARE" = "SAVE"): Promise<PostItem[]> {
    const res = await fetch(
        `${API_BASE_URL}/api/articles/saved?type=${type}&limit=20`,
        { credentials: "include" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.items ?? [];
}

// ── View mode meta ────────────────────────────────────────────────────────────

const VIEW_MODES: { key: ViewMode; label: string; icon: React.ElementType; desc: string }[] = [
    { key: "private", label: "Private",  icon: Lock,     desc: "Your private posts & location notes" },
    { key: "public",  label: "Public",   icon: Globe,    desc: "Your published public posts" },
    { key: "saved",   label: "Saved",    icon: Bookmark, desc: "Posts you bookmarked from others" },
    { key: "shared",  label: "Shared",    icon: Share2, desc: "Posts from others you've shared" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookmarksPage() {
    // View mode (dropdown)
    const [viewMode, setViewMode] = useState<ViewMode>("private");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Data State
    const [folders, setFolders] = useState<Folder[]>([
        { id: "all", name: "All Items", icon: "inventory_2", type: 'all' }
    ]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
    const [userFolderMappings, setUserFolderMappings] = useState<Record<string, string>>({});

    useEffect(() => {
        const storedFolders = localStorage.getItem('library_folders');
        if (storedFolders) setFolders(JSON.parse(storedFolders));
        const storedMappings = localStorage.getItem('bookmark_mappings');
        if (storedMappings) setUserFolderMappings(JSON.parse(storedMappings));
    }, []);

    // Modal State
    const [selectedBookmark, setSelectedBookmark] = useState<any>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Drag & Drop State
    const [draggedBookmarkId, setDraggedBookmarkId] = useState<string | null>(null);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

    // Real posts state (Private / Public / Saved tabs)
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    // ── Load real posts when viewMode changes ──────────────────────────────
    const loadPosts = useCallback(async (mode: ViewMode) => {
        setLoadingPosts(true);
        setPosts([]);
        try {
            if (mode === "private") setPosts(await fetchMyPosts("PRIVATE"));
            else if (mode === "public") setPosts(await fetchMyPosts("PUBLIC"));
            else if (mode === "saved") setPosts(await fetchSavedPosts("SAVE"));
            else if (mode === "shared") setPosts(await fetchSavedPosts("SHARE"));
        } finally {
            setLoadingPosts(false);
        }
    }, []);

    useEffect(() => { loadPosts(viewMode); }, [viewMode, loadPosts]);

    const filteredPosts = posts.filter(post => {
        if (selectedFolderId === 'all') return true;
        return userFolderMappings[post.id.toString()] === selectedFolderId;
    });

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        setDraggedBookmarkId(id);
    };

    const handleDragOver = (e: React.DragEvent, folderId: string) => {
        e.preventDefault();
        if (folderId !== 'all') setDragOverFolderId(folderId);
    };

    const handleDragLeave = () => { setDragOverFolderId(null); };

    const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
        e.preventDefault();
        setDragOverFolderId(null);
        setDraggedBookmarkId(null);
        const bookmarkId = e.dataTransfer.getData("text/plain");
        if (!bookmarkId || targetFolderId === 'all') return;
        
        setUserFolderMappings(prev => {
            const next = { ...prev, [bookmarkId]: targetFolderId };
            localStorage.setItem('bookmark_mappings', JSON.stringify(next));
            return next;
        });
        const folderName = folders.find(f => f.id === targetFolderId)?.name;
        toast.success(`Moved to ${folderName}`);
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        const newId = newFolderName.toLowerCase().replace(/\s+/g, '-');
        const newFolders = [...folders, { id: newId, name: newFolderName, icon: "folder", type: 'general' as any }];
        setFolders(newFolders);
        localStorage.setItem('library_folders', JSON.stringify(newFolders));
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

    const activeViewMeta = VIEW_MODES.find(v => v.key === viewMode)!;
    const ActiveViewIcon = activeViewMeta.icon;

    const toPostCardShape = (item: PostItem) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        visibility: item.visibility,
        timestamp: item.createdAt ? (() => {
            const diff = Date.now() - new Date(item.createdAt).getTime();
            const m = Math.floor(diff / 60000);
            if (m < 1) return "just now";
            if (m < 60) return `${m}m ago`;
            const h = Math.floor(m / 60);
            if (h < 24) return `${h}h ago`;
            return `${Math.floor(h / 24)}d ago`;
        })() : "",
        likes: item.likes,
        comments: item.comments,
        shares: item.shares,
        createdAt: item.createdAt,
        author: item.author ?? { name: "You", avatar: "" },
        location: item.location ?? undefined,
        field: item.visibility === "PRIVATE" ? "Private" : "General",
        category: null,
        tags: [],
        excerpt: item.content?.slice(0, 150) ?? "",
    });

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 animate-fade-in flex gap-10">

            {/* ── MAIN CONTENT (70%) ─────────────────────────────────── */}
            <div className="flex-1 min-w-0">

                {/* Header: View Mode Dropdown + Filter */}
                <div className="flex items-center justify-between mb-8">

                    {/* Governance-style dropdown — replaces the two dark tabs */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                                bg-white dark:bg-[#0E1217] border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1C2128]"
                        >
                            <ActiveViewIcon className="w-4 h-4" />
                            {activeViewMeta.label.toUpperCase()}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        <div className={`absolute left-0 top-full mt-2 w-60 overflow-hidden transition-all duration-200 origin-top-left z-20
                            bg-white dark:bg-[#0E1217] border border-gray-200 dark:border-white/5 rounded-2xl shadow-xl
                            ${dropdownOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                            <div className="p-1.5 space-y-0.5">
                                {VIEW_MODES.map(v => {
                                    const Icon = v.icon;
                                    const isActive = viewMode === v.key;
                                    return (
                                        <button
                                            key={v.key}
                                            onClick={() => { setViewMode(v.key); setDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                                ${isActive
                                                    ? "bg-gray-100 dark:bg-[#1C2128] text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-white/10 font-bold"
                                                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#1C2128] dark:hover:text-white hover:bg-gray-50"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 shrink-0" />
                                            <div className="text-left">
                                                <div>{v.label}</div>
                                                <div className="text-[10px] font-normal opacity-70 dark:opacity-50 leading-tight">{v.desc}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Real posts ─────────── */}
                {loadingPosts ? (
                    <div className="flex items-center justify-center py-24 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading…
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 dark:border-white/5 text-center bg-white dark:bg-[#0E1217]">
                        <ActiveViewIcon className="w-10 h-10 text-gray-400 dark:text-gray-700 mb-3" />
                        <p className="text-base font-semibold text-gray-600 dark:text-gray-400">Nothing here yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-600 mt-1">{activeViewMeta.desc}</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in-up">
                        {filteredPosts.map(item => (
                            <div 
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id.toString())}
                                className="cursor-move"
                            >
                                <PostCard post={toPostCardShape(item)} readonly compact />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── RIGHT SIDEBAR: LIBRARY (300px) ────────────────────── */}
            <div className="w-[300px] flex-shrink-0 pt-[88px]">
                <div className="bg-white dark:bg-[#0E1217] border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-xl sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Library</h3>
                        <button
                            onClick={() => setIsCreateFolderOpen(!isCreateFolderOpen)}
                            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>

                    {isCreateFolderOpen && (
                        <div className="mb-4 animate-fade-in p-3 bg-gray-50 dark:bg-[#1C2128] rounded-xl border border-gray-200 dark:border-white/5">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Folder Name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary mb-3"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsCreateFolderOpen(false)} className="text-xs font-bold text-gray-500 hover:text-white">Cancel</button>
                                <button onClick={handleCreateFolder} className="text-xs font-bold text-primary hover:text-primary-light">Create</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {folders.map(folder => {
                            const isDropTarget = dragOverFolderId === folder.id;
                            const isActive = selectedFolderId === folder.id;
                            const count = posts.filter(p => folder.id === 'all' || userFolderMappings[p.id.toString()] === folder.id).length;

                            return (
                                <button
                                    key={folder.id}
                                    onClick={() => setSelectedFolderId(folder.id)}
                                    onDragOver={(e) => handleDragOver(e, folder.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, folder.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                        ? "bg-gray-100 dark:bg-[#1C2128] text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-white/10"
                                        : isDropTarget
                                            ? "bg-primary/10 dark:bg-primary/20 text-primary border border-primary border-dashed"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1C2128] hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400"}`}>
                                            {folder.icon}
                                        </span>
                                        {folder.name}
                                    </div>
                                    <span className={`text-[10px] min-w-[20px] h-5 flex items-center justify-center rounded-full font-bold transition-colors ${isActive
                                        ? "bg-white text-black drop-shadow-sm"
                                        : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-white/10 group-hover:text-gray-700 dark:group-hover:text-gray-400"
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <BookmarkMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                bookmark={selectedBookmark}
            />
        </div>
    );
}
