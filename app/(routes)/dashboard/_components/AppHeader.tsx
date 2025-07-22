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
    <header className="w-full bg-white dark:bg-slate-900 shadow px-6 md:px-20 lg:px-40 sticky top-0 z-50">
      <div className="flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent cursor-pointer select-none">
            DocTalk AI
          </h1>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-10 items-center">
          {menuOptions.map((option) => (
            <Link href={option.path} key={option.id}>
              <span className="hover:font-semibold cursor-pointer transition-colors hover:text-blue-600 dark:hover:text-blue-400">
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
              <X className="w-7 h-7 text-blue-600 dark:text-blue-300" />
            ) : (
              <Menu className="w-7 h-7 text-blue-600 dark:text-blue-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute left-0 w-full bg-white dark:bg-slate-900 shadow-md flex flex-col items-center py-4 gap-4 z-50 animate-slide-down">
          {menuOptions.map((option) => (
            <Link
              href={option.path}
              key={option.id}
              onClick={() => setMenuOpen(false)}
              className="text-lg hover:text-blue-600 dark:hover:text-blue-400"
            >
              {option.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
