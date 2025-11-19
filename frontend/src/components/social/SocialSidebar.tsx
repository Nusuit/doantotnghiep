"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SocialSidebarProps {
  className?: string;
}

const SocialSidebar: React.FC<SocialSidebarProps> = ({ className = "" }) => {
  const [activeItem, setActiveItem] = useState("Feed");

  const menuItems = [
    {
      name: "Feed",
      href: "/social",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      name: "Messages",
      href: "/social/messages",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      ),
    },
    {
      name: "Events",
      href: "/social/events",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Saved",
      href: "/social/saved",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ),
    },
    {
      name: "Photos",
      href: "/social/photos",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 social-sidebar ${className}`}
    >
      <div className="p-4">
        <nav className="space-y-2 sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setActiveItem(item.name)}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeItem === item.name
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`mr-3 ${
                  activeItem === item.name ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {item.icon}
              </span>
              {item.name}
              {item.name === "Messages" && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  3
                </span>
              )}
              {item.name === "Events" && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                  2
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Shortcuts Section */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Shortcuts
        </h3>
        <div className="space-y-2">
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded mr-3 flex-shrink-0"></div>
            <span className="truncate">Design Team</span>
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded mr-3 flex-shrink-0"></div>
            <span className="truncate">Project Alpha</span>
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded mr-3 flex-shrink-0"></div>
            <span className="truncate">Marketing</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SocialSidebar;
