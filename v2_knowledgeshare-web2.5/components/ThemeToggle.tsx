import React, { useContext } from 'react';
import { ThemeContext } from '../App';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-dark-surface shadow-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:scale-110 transition-transform"
      title="Toggle Theme"
    >
      <span className="material-symbols-outlined">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};
