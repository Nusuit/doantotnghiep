"use client";

import Link from 'next/link';
import { Home, Compass, Map as MapIcon, RotateCcw } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">

                {/* Animated 404 Graphic */}
                <div className="relative w-64 h-64 mx-auto">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="relative bg-white dark:bg-dark-surface rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-600">
                            404
                        </h1>
                        <p className="text-gray-400 font-mono mt-2">Page Not Found</p>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 bg-white dark:bg-dark-surface p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 animate-bounce delay-100">
                        <Compass className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-white dark:bg-dark-surface p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 animate-bounce delay-300">
                        <MapIcon className="w-6 h-6 text-purple-500" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Lost in the Metaverse?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Looks like you've ventured into uncharted territory. The page you're looking for doesn't exist or has been moved to another dimension.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-primary/25"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-bold transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Go Back
                    </button>
                </div>

            </div>
        </div>
    );
}
