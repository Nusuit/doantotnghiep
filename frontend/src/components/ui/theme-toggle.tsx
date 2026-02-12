"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-dark-surface shadow-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:scale-110 transition-transform"
            title="Toggle Theme"
        >
            <span className="sr-only">Toggle theme</span>
            <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    )
}
