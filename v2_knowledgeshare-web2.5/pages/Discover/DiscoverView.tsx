
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FIELDS } from '../../data/mockData';

// --- HELPER: Initials ---
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// --- MOCK DATA ENRICHMENT WITH IMAGES ---
const RICH_FIELDS = FIELDS.map((field) => {
    let volume = '1.2M';
    let authors = 120;
    let trending = 'Introduction to Knowledge Graphs';
    let image = '';

    switch (field.type) {
        case 'Technology':
            volume = '8.4M'; authors = 1240; trending = 'Solana Firedancer: A Deep Dive'; 
            image = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'; // Circuit
            break;
        case 'Science':
            volume = '5.1M'; authors = 850; trending = 'Quantum Entanglement in Biology'; 
            image = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80'; // Lab
            break;
        case 'Art':
            volume = '3.2M'; authors = 420; trending = 'Generative Algorithms as Medium'; 
            image = 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=600&q=80'; // Abstract Art
            break;
        case 'Finance':
            volume = '9.8M'; authors = 1500; trending = 'Concentrated Liquidity Math'; 
            // Updated image link that works reliably
            image = 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=600&q=80'; // Chart/Finance
            break;
        case 'Health':
            volume = '4.5M'; authors = 630; trending = 'CRISPR Ethics Framework'; 
            image = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80'; // DNA/Nature
            break;
        default:
            volume = '2.1M'; authors = 300; trending = 'Epistemology of the Permaweb'; 
            image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80'; // Library
    }

    return {
        ...field,
        volume,
        authors,
        trending,
        image
    };
});

const FEATURED_TAGS = ['Zero-Knowledge', 'Solana', 'Longevity', 'Generative Art', 'Macroeconomics', 'Rust'];

// Use neutral/professional colors for scholars
const SCHOLARS_OF_WEEK = [
    { id: 1, name: 'Dr. Sarah Chen', rank: 'Professor', ks: '2,420', field: 'Bio', bg: 'bg-emerald-900', text: 'text-emerald-100' },
    { id: 2, name: 'Marcus Graph', rank: 'Expert', ks: '980', field: 'Data', bg: 'bg-slate-800', text: 'text-slate-100' },
    { id: 3, name: 'Elena Rust', rank: 'Doctor', ks: '1,520', field: 'Tech', bg: 'bg-indigo-900', text: 'text-indigo-100' },
    { id: 4, name: 'Alex Rivera', rank: 'Scholar', ks: '450', field: 'Art', bg: 'bg-stone-800', text: 'text-stone-100' },
];

export const DiscoverView = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* 1. HERO SECTION - Floating on Background */}
      <div className="relative py-10 px-6 text-center">
        <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 dark:text-white mb-6 tracking-tight">
                Explore the <span className="italic text-gray-500 dark:text-gray-400">knowledge graph</span>
            </h1>
            
            {/* Search Bar - High Contrast Pill */}
            <div className="relative group max-w-lg mx-auto mb-8">
                <div className="relative bg-white dark:bg-[#1A1D24] rounded-full flex items-center p-1.5 border border-gray-300 dark:border-gray-700 shadow-xl group-focus-within:ring-2 ring-gray-200 dark:ring-gray-700 transition-all">
                    <span className="material-symbols-outlined text-gray-400 ml-4 mr-3">search</span>
                    <input 
                        type="text" 
                        placeholder="Search concepts, theorems, or authors..." 
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 h-10 font-sans"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="hidden sm:flex items-center pr-2">
                        <kbd className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[10px] font-mono text-gray-500">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Featured Tags - Solid Pills for visibility */}
            <div className="flex flex-wrap justify-center gap-2">
                {FEATURED_TAGS.map(tag => (
                    <button key={tag} className="px-3 py-1.5 rounded-md bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:text-black dark:hover:text-white transition-all font-sans shadow-sm">
                        {tag}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 2. SCHOLARS OF THE WEEK - Professional Cards */}
      <div>
          <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-white">Notable Contributors</h2>
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
                  View Leaderboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {SCHOLARS_OF_WEEK.map((scholar) => (
                  <Link 
                    key={scholar.id} 
                    to={`/app/u/${scholar.name.toLowerCase().replace(' ', '_')}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#0F1116] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md group"
                  >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-serif tracking-wider shadow-inner ${scholar.bg} ${scholar.text}`}>
                          {getInitials(scholar.name)}
                      </div>
                      <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:underline decoration-gray-400">{scholar.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-gray-200 dark:border-gray-700 px-1.5 rounded">{scholar.rank}</span>
                              <span className="text-[10px] font-mono text-gray-400">{scholar.ks} KS</span>
                          </div>
                      </div>
                  </Link>
              ))}
          </div>
      </div>

      {/* 3. KNOWLEDGE FIELDS - Visual Cards */}
      <div>
        <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-white">Fields of Study</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {RICH_FIELDS.map((field) => (
            <Link 
                key={field.type} 
                to={`/app/discover/${field.type}`}
                className="group relative h-64 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500"
            >
                {/* Background Image with Zoom Effect */}
                <div className="absolute inset-0 overflow-hidden bg-gray-900">
                    <img 
                        src={field.image} 
                        alt={field.type} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700 ease-out"
                    />
                    {/* Sophisticated Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    
                    {/* Top Right Arrow */}
                    <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="material-symbols-outlined text-white text-sm">arrow_outward</span>
                    </div>

                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                        {/* Icon & Title */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-white/80 text-xl">{field.icon}</span>
                            <h3 className="text-2xl font-serif font-medium text-white tracking-wide">
                                {field.type}
                            </h3>
                        </div>

                        {/* Description (Hidden by default, shown on hover/desktop or subtle) */}
                        <p className="text-sm text-gray-300 line-clamp-2 mb-4 opacity-90 font-light leading-relaxed">
                            {field.description}
                        </p>

                        {/* Stats Row - Clean & Minimal */}
                        <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-t border-white/10 pt-4">
                            <div>
                                <span className="text-white">{field.volume}</span> Units
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                            <div>
                                <span className="text-white">{field.authors}</span> Authors
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
            ))}
        </div>
      </div>

    </div>
  );
};
