
import React, { useState, createContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { InterestSelection } from './pages/Onboarding/InterestSelection';
import { WidgetProvider } from './contexts/WidgetContext';

// Theme Context to manage dark/light mode
export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

const App = () => {
  // Check system preference or localStorage
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark for that cool Web3 vibe
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <WidgetProvider>
        <Router>
          <div className="text-gray-900 dark:text-gray-100 font-sans antialiased selection:bg-primary selection:text-white">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              {/* New Onboarding Route */}
              <Route path="/onboarding/interests" element={<InterestSelection />} />
              
              <Route path="/app/*" element={<Dashboard />} />
              {/* Redirects */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </WidgetProvider>
    </ThemeContext.Provider>
  );
};

export default App;
