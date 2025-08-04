"use client";

import React, { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@clerk/nextjs";
import AddNewSessionDialog from "./_components/AddNewSessionDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Crown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

// Lazy load heavy components
const HistoryList = lazy(() => import("./_components/HistoryList"));
const DoctorsAgentList = lazy(() => import("./_components/DoctorsAgentList"));

function Dashboard() {
  const { user,isLoaded} = useUser()
  const router = useRouter()
  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && (has({ plan: "plus" }) || has({ plan: "PLUS" }) || has({ plan: "pro" }));
  const [sessionCount, setSessionCount] = useState(0);
const fetchSessionCount = async () => {
    try {
      const result = await axios.get("/api/session-chat?sessionId=all");
      setSessionCount(result.data?.length || 0);
    } catch (error) {
      console.error("Error fetching session count:", error);
    }
  };
  useEffect(() => {
    fetchSessionCount();
  }, []);

  // Optional: Show profile completion banner instead of forced redirect
  const showProfileBanner = isLoaded && user?.publicMetadata?.isProfileComplete !== true;

  if (!isLoaded) {
    return null // or a loading spinner
  }

  

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Optional Profile Completion Banner */}
      {showProfileBanner && (
        <motion.div
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div>
                {/* <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Complete your profile for a better experience
                </p> */}
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Add your medical information to get personalized recommendations
                </p>
              </div>
            </div>
            <Link href="/complete-profile">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Complete Profile
              </button>
            </Link>
          </div>
        </motion.div>
      )}
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your AI medical consultations and health insights
          </p>
          {!paidUser && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Free Plan: {sessionCount}/5 consultations used
              </span>
              <Link href="/dashboard/billing">
                <Button size="sm" variant="outline" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade
                </Button>
              </Link>
            </div>
          )}
        </div>
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <AddNewSessionDialog />
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {paidUser ? "Total Sessions" : "Sessions Used"}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paidUser ? sessionCount : `${sessionCount}/5`}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-xl">💬</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Status</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paidUser ? "Plus" : "Free"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              {paidUser ? (
                <Crown className="w-6 h-6 text-yellow-600" />
              ) : (
                <span className="text-green-600 text-xl">🆓</span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {paidUser ? "Specialists Available" : "Remaining Sessions"}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paidUser ? "All" : Math.max(0, 5 - sessionCount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 text-xl">
                {paidUser ? "🩺" : "⏳"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Health Information Card */}
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Information</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.publicMetadata?.isProfileComplete ? "Complete" : "Incomplete"}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/complete-profile">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                {user?.publicMetadata?.isProfileComplete ? "Update Health Info" : "Complete Health Info"}
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Suspense fallback={
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size="md" />
          </div>
        }>
          <HistoryList />
        </Suspense>
      </motion.div>

      {/* AI Specialists */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Suspense fallback={
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size="md" />
          </div>
        }>
          <DoctorsAgentList />
        </Suspense>
      </motion.div>
    </div>
  );
}

export default Dashboard;
