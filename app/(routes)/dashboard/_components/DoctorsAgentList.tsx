"use client";

import { AIDoctorAgents } from "@/shared/list";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import React from "react";
import DoctorAgentCard from "./DoctorAgentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";

function DoctorsAgentList() {
  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && (has({ plan: "plus" }) || has({ plan: "PLUS" }) || has({ plan: "pro" }));

  const freeAgents = AIDoctorAgents.filter(doctor => !doctor.subscriptionRequired);
  const premiumAgents = AIDoctorAgents.filter(doctor => doctor.subscriptionRequired);

  return (
    <div className="space-y-8">
      {/* Free Specialists */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Specialists</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {freeAgents.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="h-full"
            >
              <DoctorAgentCard doctor={doctor} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Premium Specialists */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Premium Specialists</h2>
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          {!paidUser && (
            <Link href="/dashboard/billing">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Upgrade to Plus
              </Button>
            </Link>
          )}
        </div>

        {!paidUser && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Unlock Premium Specialists
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Get access to specialized doctors including Pediatricians, Dermatologists, Psychologists, and more with unlimited consultations.
                  </p>
                </div>
                <Link href="/dashboard/billing">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Upgrade to Plus
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${!paidUser ? 'opacity-60' : ''}`}>
          {premiumAgents.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: (index + freeAgents.length) * 0.1,
                ease: "easeOut"
              }}
              className="relative h-full"
            >
              <DoctorAgentCard doctor={doctor} />
              {!paidUser && (
                <motion.div
                  className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (index + freeAgents.length) * 0.1 + 0.2 }}
                >
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-lg">
                    <Lock className="w-6 h-6 text-gray-600 dark:text-gray-300 mx-auto" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default DoctorsAgentList;
