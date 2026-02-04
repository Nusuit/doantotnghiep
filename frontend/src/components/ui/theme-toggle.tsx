"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white hover:scale-110 transition-transform"
            title="Toggle Theme"
        >
            <span className="sr-only">Toggle theme</span>
            <div className="relative w-6 h-6">
                <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute top-0 left-0" />
                <Moon className="h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute top-0 left-0" />
            </div>
        </button>
    )
}
