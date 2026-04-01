"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuickNote } from '@/context/QuickNoteContext';

interface Note {
    id: string;
    content: string;
    updatedAt: number;
}

export const QuickNote = () => {
    const { isQuickNoteVisible, setIsQuickNoteVisible } = useQuickNote();
    
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
    
    // Position state for Dragging
    const [position, setPosition] = useState(() => {
        // Initial position: Bottom Right
        if (typeof window !== 'undefined') {
            return { x: window.innerWidth - 80, y: window.innerHeight - 100 };
        }
        return { x: 0, y: 0 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isHoveringDelete, setIsHoveringDelete] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    
    // Notes Logic
    const [notes, setNotes] = useState<Note[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('ks_quick_notes');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Save to LocalStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ks_quick_notes', JSON.stringify(notes));
        }
    }, [notes]);

    // Handle Window Resize to keep bubble in bounds
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - 70),
                y: Math.min(prev.y, window.innerHeight - 70)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- DRAG HANDLERS ---
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isOpen) return; // Don't drag if panel is open
        
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        dragOffset.current = {
            x: clientX - position.x,
            y: clientY - position.y
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || typeof window === 'undefined') return;
        e.preventDefault();

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        const newX = clientX - dragOffset.current.x;
        const newY = clientY - dragOffset.current.y;

        setPosition({ x: newX, y: newY });

        // Check distance to "X" zone (Bottom Center)
        const deleteZoneX = window.innerWidth / 2;
        const deleteZoneY = window.innerHeight - 50;
        const distance = Math.hypot(deleteZoneX - (newX + 30), deleteZoneY - (newY + 30)); // +30 for center of bubble
        
        setIsHoveringDelete(distance < 80);

    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging || typeof window === 'undefined') return;
        setIsDragging(false);

        if (isHoveringDelete) {
            setIsQuickNoteVisible(false);
            setIsHoveringDelete(false);
            // Reset position for next time it's enabled
            setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 100 });
        } else {
            // Snap to nearest side (optional UX improvement)
            const snapToRight = position.x > window.innerWidth / 2;
            setPosition(prev => ({
                x: snapToRight ? window.innerWidth - 70 : 20,
                y: Math.min(Math.max(prev.y, 50), window.innerHeight - 80) // Keep vertical bounds
            }));
        }
    }, [isDragging, isHoveringDelete, position.x, setIsQuickNoteVisible]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    // --- NOTE LOGIC ---
    const handleCreateNote = () => {
        const newNote: Note = { id: Date.now().toString(), content: '', updatedAt: Date.now() };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
        setViewMode('editor');
    };

    const handleUpdateContent = (content: string) => {
        if (!activeNoteId) return;
        setIsSaving(true);
        setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, content, updatedAt: Date.now() } : n));
        setTimeout(() => setIsSaving(false), 800);
    };

    const handleDeleteNote = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setNotes(notes.filter(n => n.id !== id));
        if (activeNoteId === id) { setActiveNoteId(null); setViewMode('list'); }
    };

    const getNoteTitle = (content: string) => content.trim() ? (content.split('\n')[0].substring(0, 30) + (content.length > 30 ? '...' : '')) : 'Untitled Note';
    const activeNote = notes.find(n => n.id === activeNoteId);

    // If disabled globally, don't render anything
    if (!isQuickNoteVisible) return null;

    return (
        <>
            {/* DELETE ZONE (Visible when dragging) */}
            <div 
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] transition-all duration-300 pointer-events-none flex flex-col items-center gap-2 ${
                    isDragging ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            >
                <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isHoveringDelete 
                        ? 'bg-red-500 border-red-600 scale-125 shadow-lg' 
                        : 'bg-black/50 border-white/20 scale-100 backdrop-blur-sm'
                    }`}
                >
                    <span className="material-symbols-outlined text-white text-3xl">close</span>
                </div>
                {isHoveringDelete && <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded backdrop-blur">Release to Hide</span>}
            </div>

            {/* FLOATING WIDGET CONTAINER */}
            <div 
                style={{ 
                    left: isOpen ? 'auto' : position.x, 
                    top: isOpen ? 'auto' : position.y,
                    // If open, we anchor it to bottom-right fixed for stability, otherwise standard absolute positioning
                    ...(isOpen ? { bottom: '2rem', right: '2rem' } : { position: 'fixed' })
                }}
                className={`z-[1500] ${isOpen ? 'fixed' : 'fixed touch-none'}`}
            >
                {/* 1. THE PANEL (Only visible when open) */}
                <div 
                    className={`absolute bottom-full right-0 mb-4 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${
                        isOpen 
                        ? 'w-80 h-96 opacity-100 scale-100 pointer-events-auto' 
                        : 'w-0 h-0 opacity-0 scale-50 pointer-events-none'
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shadow-md z-10 shrink-0">
                        {viewMode === 'editor' ? (
                            <button onClick={() => setViewMode('list')} className="p-1 -ml-2 rounded-full hover:bg-white/20 transition-colors"><span className="material-symbols-outlined text-lg">arrow_back</span></button>
                        ) : (
                            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">inventory_2</span><span className="text-sm font-bold">My Notes</span></div>
                        )}
                        <div className="flex items-center gap-2">
                            {viewMode === 'editor' && <span className={`text-[10px] font-bold uppercase tracking-wider transition-opacity ${isSaving ? 'opacity-100' : 'opacity-0'}`}>Saving...</span>}
                            <button onClick={handleCreateNote} className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-sm font-bold">add</span></button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative bg-gray-50 dark:bg-[#0B0E14] overflow-hidden">
                        {viewMode === 'list' && (
                            <div className="absolute inset-0 overflow-y-auto p-3 space-y-2">
                                {notes.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-70"><span className="material-symbols-outlined text-4xl mb-2">note_add</span><p className="text-xs">No notes yet.</p><button onClick={handleCreateNote} className="mt-2 text-blue-500 font-bold text-xs hover:underline">Create one</button></div>
                                ) : (
                                    notes.map(note => (
                                        <div key={note.id} onClick={() => { setActiveNoteId(note.id); setViewMode('editor'); }} className="group bg-white dark:bg-[#161920] p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer shadow-sm transition-all">
                                            <div className="flex justify-between items-start mb-1"><h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{getNoteTitle(note.content)}</h4><button onClick={(e) => handleDeleteNote(e, note.id)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-sm">delete</span></button></div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{new Date(note.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {viewMode === 'editor' && (
                            <textarea ref={textareaRef} value={activeNote?.content || ''} onChange={(e) => handleUpdateContent(e.target.value)} placeholder="Type something..." className="w-full h-full bg-white dark:bg-[#0B0E14] text-sm text-gray-800 dark:text-gray-200 p-4 resize-none outline-none leading-relaxed" />
                        )}
                    </div>
                </div>

                {/* 2. THE CHAT HEAD (BUBBLE) */}
                <div 
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    onClick={() => !isDragging && setIsOpen(!isOpen)}
                    className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-100 ${
                        isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105 active:scale-95'
                    } ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-blue-600'}`}
                >
                    {/* Icon */}
                    <span className="material-symbols-outlined text-2xl text-white pointer-events-none transition-transform duration-300">
                        {isOpen ? 'close' : 'edit_note'}
                    </span>

                    {/* Badge (Number of notes) */}
                    {!isOpen && notes.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-600">
                            {notes.length}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
