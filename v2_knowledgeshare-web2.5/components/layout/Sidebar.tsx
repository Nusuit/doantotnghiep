
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../../data/mockData';
import { ThemeContext } from '../../App';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Access Theme Context
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const isActive = (path: string) => location.pathname.includes(path);

  // Helper for initials
  const initials = CURRENT_USER.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    navigate('/auth');
  };

  const navItems = [
    { name: 'Feed', icon: 'home', path: '/app/feed' },
    { name: 'Discover', icon: 'explore', path: '/app/discover' },
    { name: 'Map', icon: 'map', path: '/app/map' },
    { name: 'Wallet', icon: 'account_balance_wallet', path: '/app/wallet' },
    { name: 'DAO Governance', icon: 'how_to_vote', path: '/app/governance' },
    { name: 'Leaderboard', icon: 'leaderboard', path: '/app/leaderboard' },
    { name: 'Profile', icon: 'account_circle', path: '/app/profile' },
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col h-screen sticky top-0 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg transition-all z-30">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold font-serif">KS</div>
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">KnowledgeShare</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-gray-100 dark:bg-white text-black dark:text-black font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-black dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <Link 
            to="/app/create" 
            className="w-full bg-[#2970FF] hover:bg-[#2563eb] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined">edit_square</span>
          Create Post
        </Link>

        {/* User Profile Section with Dropdown */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-all border border-transparent hover:border-gray-200 dark:hover:border-dark-border group"
            >
                {/* Monochromatic Initials */}
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white text-xs font-bold ring-1 ring-gray-200 dark:ring-gray-700">
                    {initials}
                </div>
                
                <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{CURRENT_USER.name}</p>
                    <p className="text-xs text-gray-500 truncate">{CURRENT_USER.handle}</p>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">more_vert</span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-xl overflow-hidden animate-fade-in-up origin-bottom z-50">
                    <div className="p-2 space-y-1">
                        
                        {/* Custom Theme Toggle Switch */}
                        <div 
                            onClick={toggleTheme}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </span>
                            
                            {/* Animated Switch */}
                            <div className={`relative w-12 h-6 rounded-full transition-colors duration-500 ease-in-out flex items-center ${isDark ? 'bg-[#1A1D24] border border-gray-600' : 'bg-cyan-200 border border-cyan-300'}`}>
                                {/* Decor: Clouds (Light Mode) */}
                                {!isDark && (
                                    <>
                                        <div className="absolute right-3 top-1.5 w-2 h-1 bg-white rounded-full opacity-80"></div>
                                        <div className="absolute right-1.5 bottom-1.5 w-3 h-1.5 bg-white rounded-full opacity-60"></div>
                                    </>
                                )}
                                {/* Decor: Stars (Dark Mode) */}
                                {isDark && (
                                    <>
                                        <div className="absolute left-2 top-1.5 w-0.5 h-0.5 bg-white rounded-full opacity-80"></div>
                                        <div className="absolute left-3.5 bottom-2 w-0.5 h-0.5 bg-white rounded-full opacity-60"></div>
                                        <div className="absolute left-1.5 bottom-1.5 w-0.5 h-0.5 bg-white rounded-full opacity-40"></div>
                                    </>
                                )}

                                {/* The Knob (Sun/Moon) */}
                                <div className={`absolute w-5 h-5 rounded-full shadow-sm transform transition-transform duration-500 flex items-center justify-center ${
                                    isDark 
                                    ? 'translate-x-[26px] bg-slate-200' 
                                    : 'translate-x-[2px] bg-yellow-400'
                                }`}>
                                    {/* Optional: Icon inside knob */}
                                    {isDark && <div className="w-1 h-1 bg-slate-400 rounded-full mr-1 mb-1 opacity-50"></div>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800 my-1" />

                        <Link 
                            to="/app/settings" 
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            onClick={() => setShowMenu(false)}
                        >
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Settings
                        </Link>
                        
                        <button 
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </aside>
  );
};
