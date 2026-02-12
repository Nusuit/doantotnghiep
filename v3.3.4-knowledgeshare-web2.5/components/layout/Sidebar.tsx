
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../../data/mockData';
import { ThemeContext } from '../../App';
import { useWidget } from '../../contexts/WidgetContext';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  // State for collapsible menus. Default 'governance' to open for better discovery initially.
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'governance': true
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { isQuickNoteVisible, toggleQuickNote } = useWidget();

  // Check if a specific path is active
  const isActive = (path: string) => location.pathname === path;
  
  // Check if a parent menu should be highlighted (if any child is active)
  const isParentActive = (children: any[]) => children.some(child => location.pathname === child.path);

  const toggleSubMenu = (key: string) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const initials = CURRENT_USER.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

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

  // Nav Structure with optional children
  // REMOVED: Wallet item from here
  const navItems = [
    { name: 'Feed', icon: 'home', path: '/app/feed' },
    { name: 'Discover', icon: 'explore', path: '/app/discover' },
    { name: 'Map', icon: 'map', path: '/app/map' },
    { 
      name: 'Governance', 
      icon: 'admin_panel_settings', // Shield icon
      id: 'governance',
      children: [
        { name: 'DAO Voting', icon: 'how_to_vote', path: '/app/governance' },
        { name: 'Leaderboard', icon: 'leaderboard', path: '/app/leaderboard' }
      ]
    },
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
        {navItems.map((item: any) => {
          if (item.children) {
            // RENDER PARENT WITH CHILDREN
            const isOpen = expandedMenus[item.id];
            const active = isParentActive(item.children);
            
            return (
              <div key={item.name} className="space-y-1 mb-1">
                <button
                  onClick={() => toggleSubMenu(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${
                    active
                      ? 'text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-white/5'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-black dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${active ? 'text-gray-900 dark:text-white' : ''}`}>{item.icon}</span>
                    {item.name}
                  </div>
                  <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Submenu */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {item.children.map((child: any) => (
                    <Link
                      key={child.name}
                      to={child.path}
                      // UPDATED: Child items now use the same Active style (White BG, Black Text) as main items
                      className={`flex items-center gap-3 px-4 py-3 ml-4 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
                        isActive(child.path)
                          ? 'bg-gray-100 dark:bg-white text-black dark:text-black font-bold shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{child.icon}</span>
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          // RENDER SIMPLE ITEM
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gray-100 dark:bg-white text-black dark:text-black font-bold shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface hover:text-black dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
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
                        
                        {/* Theme Toggle - CUSTOM SUN/MOON DESIGN */}
                        <div 
                            onClick={toggleTheme}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </span>
                            
                            {/* Animated Switch Container */}
                            <div className={`relative w-12 h-6 rounded-full transition-colors duration-500 ease-in-out flex items-center border ${
                                isDark ? 'bg-[#1F2937] border-gray-600' : 'bg-cyan-200 border-cyan-300'
                            }`}>
                                {/* DARK MODE DECOR (Stars/Dots) */}
                                <div className={`absolute left-1.5 top-1.5 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full absolute top-0.5 left-0.5"></div>
                                    <div className="w-0.5 h-0.5 bg-gray-400 rounded-full absolute top-2.5 left-0"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full absolute top-1.5 left-2.5"></div>
                                </div>

                                {/* LIGHT MODE DECOR (Clouds) */}
                                <div className={`absolute right-1.5 top-1.5 transition-opacity duration-300 ${!isDark ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-3 h-1.5 bg-white rounded-full absolute top-0 right-0 opacity-80"></div>
                                    <div className="w-2 h-1 bg-white rounded-full absolute top-2.5 right-1 opacity-60"></div>
                                </div>

                                {/* THE HANDLE (Sun/Moon) */}
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow-sm transform transition-transform duration-500 flex items-center justify-center ${
                                    isDark 
                                    ? 'translate-x-[26px] bg-slate-200' 
                                    : 'translate-x-[2px] bg-yellow-400'
                                }`}>
                                    {/* Optional Moon Crater Detail */}
                                    {isDark && <div className="w-1.5 h-1.5 bg-slate-300 rounded-full opacity-50 mr-1 mb-1"></div>}
                                </div>
                            </div>
                        </div>

                        {/* Quick Note Toggle (Chat Head Style) */}
                        <div 
                            onClick={toggleQuickNote}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white flex items-center gap-2">
                                Quick Note
                            </span>
                            
                            <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 flex items-center ${isQuickNoteVisible ? 'bg-[#2970FF]' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                <div className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                                    isQuickNoteVisible ? 'translate-x-[22px]' : 'translate-x-[4px]'
                                }`}></div>
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
