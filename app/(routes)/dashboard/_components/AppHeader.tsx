"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuOptions = [
    { id: 1, name: "Home", path: "/dashboard" },
    { id: 2, name: "History", path: "/dashboard/history" },
    { id: 3, name: "Health Info", path: "/complete-profile" },
    { id: 4, name: "Pricing", path: "/dashboard/billing" },
    { id: 5, name: "Profile", path: "/dashboard/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === path;
  };

  return (
    <header className="w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              title="Back to Main Page"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">DOQ</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuOptions.map((option) => (
              <Link href={option.path} key={option.id}>
                <span className={`text-sm font-medium transition-colors relative ${
                  isActive(option.path)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}>
                  {option.name}
                  {isActive(option.path) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  )}
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
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                    isActive(option.path)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
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
