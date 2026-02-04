"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    MoreHorizontal,
    Bookmark,
    Share,
    Flag,
    MapPin,
    MessageCircle,
    ArrowBigUp,
    ArrowBigDown,
    DollarSign,
    Share2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { enqueueView } from '@/lib/interactionBatcher';

interface PostCardProps {
    post: any; // Using any for simplicity in this task, normally would be typed
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const router = useRouter();
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
    const [likes, setLikes] = useState<number>(post.likes || 0);
    const [comments, setComments] = useState<number>(post.comments || 0);
    const [shares, setShares] = useState<number>(post.shares || 0);
    const [busy, setBusy] = useState(false);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [suggestionText, setSuggestionText] = useState("");

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
        if (busy) return;
        setBusy(true);
        setLikes((prev) => prev + 1);
        try {
            await api.posts.interact(post.id, { type: "UPVOTE" });
        } catch (error) {
            setLikes((prev) => Math.max(0, prev - 1));
        } finally {
            setBusy(false);
        }
    };

    const handleSave = async () => {
        if (busy) return;
        setBusy(true);
        setShares((prev) => prev + 1);
        try {
            await api.posts.interact(post.id, { type: "SAVE" });
        } catch (error) {
            setShares((prev) => Math.max(0, prev - 1));
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
        } catch (error) {
            setComments((prev) => Math.max(0, prev - 1));
        } finally {
            setBusy(false);
        }
    };

    const fieldColors: Record<string, string> = {
        'Blockchain': 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
        'AI': 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
        'Design': 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400',
        'Development': 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    };

    const fieldColor = fieldColors[post.field] || 'bg-gray-100 text-gray-500';

    return (
        <div ref={cardRef} className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible mb-6 transition-all hover:shadow-md">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
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
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                <button
                                    onClick={handleSave}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                                >
                                    <Bookmark className="w-4 h-4" /> Save Post
                                </button>
                                <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors">
                                    <Share className="w-4 h-4" /> Embed
                                </button>
                                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                <button className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors">
                                    <Flag className="w-4 h-4" /> Report Content
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 pb-3 text-gray-800 dark:text-gray-200">
                <p className="mb-2 whitespace-pre-line">{post.content}</p>
                {post.location && (
                    <button
                        onClick={() => router.push(`/app/map?lat=${post.location.lat}&lng=${post.location.lng}`)}
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
                        <span className="text-green-500">98% Upvoted</span>
                    </div>
                    <div>{comments} Comments • {shares} Shares</div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 gap-2">

                    {/* Voting Cluster */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
                        <button
                            onClick={handleUpvote}
                            disabled={busy}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 hover:text-green-500 transition-all active:scale-95 disabled:opacity-50"
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
                    <button className="flex-1 flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 py-2 rounded-xl transition-colors border border-yellow-400/20 hover:scale-105">
                        <DollarSign className="w-5 h-5 filled" />
                        <span className="hidden sm:inline text-sm font-bold">Donate</span>
                    </button>

                    {/* Share */}
                    <button className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 px-3 rounded-xl transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
