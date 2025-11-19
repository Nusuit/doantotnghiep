"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SocialHeaderProps {
  className?: string;
}

const SocialHeader: React.FC<SocialHeaderProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("Home");
  const router = useRouter();

  const navItems = [
    { name: "Home", href: "/social" },
    { name: "Friends", href: "/social/friends" },
    { name: "Groups", href: "/social/groups" },
    { name: "Settings", href: "/social/settings" },
  ];

  return (
    <header
      className={`bg-blue-600 text-white shadow-lg social-header ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/social" className="text-xl font-bold">
              SOCIAL
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveTab(item.name)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:text-blue-200 ${
                    activeTab === item.name
                      ? "text-white border-b-2 border-blue-200"
                      : "text-blue-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - Search and Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-blue-500 rounded-lg leading-5 bg-blue-700 text-white placeholder-blue-300 focus:outline-none focus:bg-blue-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                placeholder="Search..."
              />
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center">
              <button
                className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center hover:bg-blue-300 transition-colors duration-200"
                onClick={() => {
                  // Handle profile menu
                }}
              >
                <div className="w-6 h-6 rounded-full bg-white"></div>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-blue-200 hover:text-white focus:outline-none focus:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setActiveTab(item.name)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === item.name
                    ? "text-white bg-blue-700"
                    : "text-blue-100 hover:text-white hover:bg-blue-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SocialHeader;
