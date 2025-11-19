"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Wallet, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/social", label: "Feeds" },
    { path: "/map", label: "Map" },
    { path: "/social/editor", label: "Write" },
    { path: "/social/leaderboard", label: "Leaderboard" },
    { path: "/social/wallet", label: "Wallet" },
    { path: "/social/governance", label: "Governance" },
  ];

  // Desktop navigation links (subset)
  const desktopLinks = [
    { path: "/social", label: "Feeds" },
    { path: "/social/leaderboard", label: "Leaderboard" },
    { path: "/social/wallet", label: "Wallet" },
    { path: "/social/governance", label: "Governance" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-sm">KS</span>
            </div>
            <span className="hidden sm:block text-black font-semibold">
              Knowledge Sharing
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {desktopLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pathname === link.path
                    ? "bg-gradient-to-br from-sky-50 to-blue-50 text-sky-700 font-medium"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                type="search"
                placeholder="Search articles, users..."
                className="pl-10 bg-neutral-50 border-neutral-200 focus:border-sky-400"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/social/editor">Start Writing</Link>
            </Button>
            {!walletConnected ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sky-300 text-sky-700 hover:bg-sky-50"
                  asChild
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-br from-sky-500 via-blue-500 to-violet-600 text-white hover:from-sky-600 hover:via-blue-600 hover:to-violet-700 shadow-lg hover:shadow-xl shadow-violet-500/30 transition-all duration-300"
                  onClick={() => setWalletConnected(true)}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connected
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-4 py-2 rounded-lg ${
                    pathname === link.path
                      ? "bg-neutral-100 text-black font-medium"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 py-2 flex flex-col gap-2 border-t border-neutral-200 mt-2 pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-black text-white hover:bg-neutral-800"
                  asChild
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setWalletConnected(!walletConnected);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {walletConnected ? "Connected" : "Connect Wallet"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
