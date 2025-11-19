"use client";

import React from "react";
import SocialHeaderNew from "./SocialHeaderNew";
import "./social.scss";

interface SocialLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  className?: string;
}

const SocialLayout: React.FC<SocialLayoutProps> = ({
  children,
  leftSidebar,
  rightSidebar,
  className = "",
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 social-layout ${className}`}>
      {/* Header */}
      <SocialHeaderNew />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 left-sidebar">
            <div className="sticky top-6">{leftSidebar}</div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-6 main-content">{children}</main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3 right-sidebar">
            <div className="sticky top-6">{rightSidebar}</div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SocialLayout;
