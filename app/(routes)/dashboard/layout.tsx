"use client";

import React from "react";
import { motion } from "motion/react";
import AppHeader from "./_components/AppHeader";
import { Toaster } from "@/components/ui/sonner";

function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <AppHeader />
      <motion.main
        className="px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
        <Toaster />
      </motion.main>
    </div>
  );
}

export default DashboardLayout;
