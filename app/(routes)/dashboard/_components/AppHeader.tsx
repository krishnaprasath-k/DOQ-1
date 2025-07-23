"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuOptions = [
    { id: 1, name: "Home", path: "/dashboard" },
    { id: 2, name: "History", path: "/dashboard/history" },
    { id: 3, name: "Pricing", path: "/dashboard/billing" },
    { id: 4, name: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <header className="w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">DOQ</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuOptions.map((option) => (
              <Link href={option.path} key={option.id}>
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  {option.name}
                </span>
              </Link>
            ))}
            <UserButton />
          </nav>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <UserButton />
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
              {menuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex flex-col space-y-4">
              {menuOptions.map((option) => (
                <Link
                  href={option.path}
                  key={option.id}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  {option.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
