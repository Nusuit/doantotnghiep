"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    MoreHorizontal,
    Bookmark,
    Flag,
    MapPin,
    MessageCircle,
    ArrowBigUp,
    ArrowBigDown,
    DollarSign,
    Share2,
    Edit3,
    Lock,
    Globe,
    BellOff,
    Trash2
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { enqueueView } from '@/lib/interactionBatcher';
import { useAuth } from '@/context/AuthContext';

interface PostCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: any; // Using any for simplicity in this task, normally would be typed
    readonly?: boolean;
    compact?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, readonly = false, compact = false }) => {
    const router = useRouter();
    const { user } = useAuth();
    const isAuthor = user && (user.name === post.author?.name || user.id === post.author?.id);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);
    const viewStateRef = useRef({
        visible: false,
        qualified: false,
        sent: false,
        startedAt: 0,
        totalTimeMs: 0,
        maxDepth: 0
    });
    const [likes, setLikes] = useState<number>(post.likes ?? 0);
    const [hasUpvoted, setHasUpvoted] = useState(false); // Local state for upvote toggle
    const [comments, setComments] = useState<number>(post.comments ?? 0);
    const [shares, setShares] = useState<number>(post.shares ?? 0);
    const [busy, setBusy] = useState(false);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [suggestionText, setSuggestionText] = useState("");
    const [isPrivate, setIsPrivate] = useState<boolean>(post.visibility === "PRIVATE" || post.isPrivate === true);
    const [isDeleted, setIsDeleted] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const node = cardRef.current;
        if (!node) return;

        const updateDepth = () => {
            if (!node) return;
            const rect = node.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const visible = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
            const ratio = rect.height > 0 ? Math.max(0, Math.min(1, visible / rect.height)) : 0;

            const state = viewStateRef.current;
            state.maxDepth = Math.max(state.maxDepth, Math.round(ratio * 100));
        };

        const onScroll = () => {
            if (rafRef.current !== null) return;
            rafRef.current = window.requestAnimationFrame(() => {
                updateDepth();
                rafRef.current = null;
            });
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const state = viewStateRef.current;
                    const now = Date.now();

                    if (entry.isIntersecting) {
                        if (!state.visible) {
                            state.visible = true;
                            state.startedAt = now;
                            updateDepth();

                            if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
                            viewTimerRef.current = setTimeout(() => {
                                if (state.visible) {
                                    state.qualified = true;
                                }
                            }, 1200);
                        }
                    } else if (state.visible) {
                        state.visible = false;
                        state.totalTimeMs += now - state.startedAt;
                        state.startedAt = 0;

                        if (state.qualified && !state.sent) {
                            state.sent = true;
                            enqueueView({
                                articleId: post.id,
                                timeSpentMs: Math.max(0, Math.round(state.totalTimeMs)),
                                scrollDepthPercent: state.maxDepth
                            });
                        }
                    }
                });
            },
            { threshold: [0, 0.25, 0.5, 0.75, 1] }
        );

        observer.observe(node);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);

            if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

            // eslint-disable-next-line react-hooks/exhaustive-deps
            const state = viewStateRef.current;
            if (state.visible) {
                state.totalTimeMs += Date.now() - state.startedAt;
                state.visible = false;
            }

            if (state.qualified && !state.sent) {
                enqueueView({
                    articleId: post.id,
                    timeSpentMs: Math.max(0, Math.round(state.totalTimeMs)),
                    scrollDepthPercent: state.maxDepth
                });
                state.sent = true;
            }
        };
    }, [post.id]);

    const handleUpvote = async () => {
        if (!post?.id || busy) return;
        setBusy(true);
        const newUpvoted = !hasUpvoted;
        setHasUpvoted(newUpvoted);
        setLikes((prev: number) => newUpvoted ? prev + 1 : Math.max(0, prev - 1));

        try {
            // "interact" API handles toggling backend state transparently
            const res = await api.posts.interact(post.id, { type: "UPVOTE" });
            if (res && typeof res.upvoted === "boolean" && res.upvoted !== newUpvoted) {
                setHasUpvoted(res.upvoted);
                setLikes((prev: number) => res.upvoted ? prev + 1 : Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error(error);
            setHasUpvoted(!newUpvoted);
            setLikes((prev: number) => !newUpvoted ? prev + 1 : Math.max(0, prev - 1));
        } finally {
            setBusy(false);
        }
    };

    const handleSave = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await api.posts.interact(post.id, { type: "SAVE" });
            setShares((prev) => prev + 1);
        } catch (error) {
            console.error(error);
        } finally {
            setBusy(false);
        }
    };

    const handleSuggestSubmit = async () => {
        if (busy || !suggestionText.trim()) return;
        setBusy(true);
        setComments((prev) => prev + 1);
        try {
            await api.posts.suggest(post.id, { content: suggestionText.trim() });
            setSuggestionText("");
            setShowSuggestion(false);
        } catch {
            setComments((prev) => Math.max(0, prev - 1));
        } finally {
            setBusy(false);
        }
    };

    const handleToggleVisibility = async () => {
        try {
            await api.posts.toggleVisibility(post.id);
            setIsPrivate(!isPrivate);
            setShowMenu(false);
        } catch (error) {
            console.error("Failed to toggle visibility", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.posts.delete(post.id);
            setIsDeleted(true);
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    if (isDeleted) return null;

    const fieldColors: Record<string, string> = {
        'Blockchain': 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
        'AI': 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
        'Design': 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
        'Development': 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    };

    const fieldColor = fieldColors[post.field] || 'bg-gray-100 text-gray-500';

    // ── Private post — owner-only card ──────────────────────────────────────
    if (isPrivate) {
        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const miniMapUrl = post.location && mapboxToken
            ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+6366f1(${post.location.lng},${post.location.lat})/${post.location.lng},${post.location.lat},14,0/200x130@2x?access_token=${mapboxToken}`
            : null;

        // Use real auth user avatar if this is the author's own post
        const avatarSrc = isAuthor ? (user?.avatar || post.author?.avatar) : post.author?.avatar;
        const avatarName = isAuthor ? (user?.name || post.author?.name) : post.author?.name;

        return (
            <div ref={cardRef} className="mb-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0d1117] shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Top accent bar */}
                <div className="h-[3px] w-full bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 dark:from-gray-800 dark:via-gray-600 dark:to-gray-800" />

                <div className="flex gap-0">
                    {/* ── Left: content ── */}
                    <div className="flex-1 min-w-0 px-5 py-4 flex flex-col gap-2.5">
                        {/* Author row */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {avatarSrc
                                    ? <Image src={avatarSrc} alt={avatarName ?? ""} width={32} height={32} className="rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/10 shrink-0" />
                                    : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-bold text-xs shrink-0">{(avatarName?.[0] ?? "?").toUpperCase()}</div>
                                }
                                <div className="min-w-0">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block truncate">{avatarName}</span>
                                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{post.timestamp}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{post.content}</p>

                        {/* Location chip */}
                        {post.location && (
                            <button
                                onClick={() => router.push(`/app/map?lat=${post.location.lat}&lng=${post.location.lng}&name=${encodeURIComponent(post.location.name ?? "")}`)}
                                className="self-start inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary bg-gray-100 dark:bg-white/5 hover:bg-primary/5 dark:hover:bg-primary/10 border border-gray-200 dark:border-white/10 hover:border-primary/20 px-3 py-1.5 rounded-full transition-all group/loc"
                            >
                                <MapPin className="w-3 h-3 text-gray-400 group-hover/loc:text-primary transition-colors shrink-0" />
                                <span className="truncate max-w-[160px]">{post.location.name}</span>
                            </button>
                        )}

                        {/* Owner actions — always visible */}
                        {isAuthor && (
                            <div className="flex items-center gap-1.5 pt-1">
                                <button
                                    onClick={handleToggleVisibility}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 bg-gray-100 dark:bg-white/5 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-white/10 hover:border-green-300 dark:hover:border-green-700 px-2.5 py-1.5 rounded-lg transition-all"
                                >
                                    <Globe className="w-3 h-3" /> Publish
                                </button>
                                <button
                                    title="Edit"
                                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 bg-gray-100 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 px-2.5 py-1.5 rounded-lg transition-all"
                                >
                                    <Edit3 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    title="Delete"
                                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-700 px-2.5 py-1.5 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Right: mini map ── */}
                    {miniMapUrl && (
                        <button
                            onClick={() => router.push(`/app/map?lat=${post.location.lat}&lng=${post.location.lng}&name=${encodeURIComponent(post.location.name ?? "")}`)}
                            className="relative w-[160px] shrink-0 overflow-hidden border-l border-gray-100 dark:border-white/5 hover:brightness-90 transition-all"
                            title={`Open ${post.location.name} on map`}
                        >
                            <Image
                                src={miniMapUrl}
                                alt={post.location.name ?? "location"}
                                width={320}
                                height={260}
                                className="w-full h-full object-cover"
                            />
                            {/* vignette left edge */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 dark:from-black/30 to-transparent pointer-events-none" />
                            {/* location label */}
                            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center px-2">
                                <span className="flex items-center gap-1 text-[10px] font-medium text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full truncate max-w-[140px]">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    {post.location.name}
                                </span>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div ref={cardRef} className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible mb-6 transition-all hover:shadow-md">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {post.author.avatar
                        ? <Image src={post.author.avatar} alt={post.author.name} width={40} height={40} className="rounded-full object-cover" />
                        : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{(post.author.name?.[0] ?? "?").toUpperCase()}</div>
                    }
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{post.author.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{post.timestamp}</span>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <button className="flex items-center gap-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer" title="Verified on Arweave">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="font-medium">Arweave</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${fieldColor}`}>
                        {post.field}
                    </span>

                    {/* Dropdown Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                {isAuthor ? (
                                    <>
                                        <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                            <Edit3 className="w-4 h-4" /> Edit Post
                                        </button>
                                        <button onClick={handleToggleVisibility} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                            {isPrivate ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {isPrivate ? "Make Public" : "Make Private"}
                                        </button>
                                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                        <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                            <BellOff className="w-4 h-4" /> Hide notifications
                                        </button>
                                        <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors">
                                            <Trash2 className="w-4 h-4" /> Delete Post
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                                        >
                                            <Bookmark className="w-4 h-4" /> Save Post
                                        </button>
                                        <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                            <BellOff className="w-4 h-4" /> Hide notifications of {post.author.name}
                                        </button>
                                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                        <button className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors">
                                            <Flag className="w-4 h-4" /> Report Content
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 pb-3 text-gray-800 dark:text-gray-200">
                <p className={`mb-2 whitespace-pre-line ${compact ? 'line-clamp-3' : ''}`}>{post.content}</p>
                {post.location && (
                    <button
                        onClick={() => router.push(`/app/map?lat=${post.location.lat}&lng=${post.location.lng}&name=${encodeURIComponent(post.location.name ?? "")}`)}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-full transition-colors mb-2 group"
                    >
                        <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        {post.location.name}
                    </button>
                )}
            </div>



            <div className="p-4">
                {showSuggestion && (
                    <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3">
                        <textarea
                            value={suggestionText}
                            onChange={(e) => setSuggestionText(e.target.value)}
                            rows={3}
                            placeholder="Write a suggestion..."
                            className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface p-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowSuggestion(false)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={busy || !suggestionText.trim()}
                                onClick={handleSuggestSubmit}
                                className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {likes > 0
                            ? <span className="text-green-500">{likes} {likes === 1 ? "Upvote" : "Upvotes"}</span>
                            : <span className="text-gray-400">No upvotes yet</span>
                        }
                    </div>
                    <div>{comments} Comments • {shares} Shares</div>
                </div>

                {readonly ? (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => router.push(`/app/feed?focusedPostId=${post.id}`)}
                            className="w-full py-2 bg-primary/10 text-primary focus:outline-none hover:bg-primary/20 rounded-xl font-medium transition-colors"
                        >
                            View in Feed
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 gap-2">
                        {/* Voting Cluster */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
                            <button
                                onClick={handleUpvote}
                                disabled={busy}
                                className={`p-2 rounded-lg transition-all active:scale-95 disabled:opacity-50 ${hasUpvoted ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500' : 'hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-green-500'}`}
                            >
                                <ArrowBigUp className="w-6 h-6" />
                            </button>
                            <span className="px-2 font-bold text-gray-700 dark:text-gray-200 min-w-[30px] text-center text-sm">{likes}</span>
                            <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-red-500 transition-all active:scale-95">
                                <ArrowBigDown className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Comment */}
                        <button
                            onClick={() => setShowSuggestion((prev) => !prev)}
                            disabled={busy}
                            className="flex-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 rounded-xl transition-colors group disabled:opacity-50"
                        >
                            <MessageCircle className="w-5 h-5 group-hover:text-primary transition-colors" />
                            <span className="hidden sm:inline text-sm font-medium">Comment</span>
                        </button>

                        {/* Donate */}
                        {!isAuthor && (
                            <button className="flex-1 flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 py-2 rounded-xl transition-colors border border-yellow-400/20 hover:scale-105">
                                <DollarSign className="w-5 h-5 filled" />
                                <span className="hidden sm:inline text-sm font-bold">Donate</span>
                            </button>
                        )}

                        {/* Share */}
                        {!isAuthor && (
                            <button className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 px-3 rounded-xl transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
