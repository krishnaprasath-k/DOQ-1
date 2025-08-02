"use client";
import React, { useEffect, useState } from "react";
import AddNewSessionDialog from "./AddNewSessionDialog";
import axios from "axios";
import HistoryTable from "./HistoryTable";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import DoctorsAgentList from "./DoctorsAgentList";
import { useSearchParams } from "next/navigation";

function HistoryList() {
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    GetHistoryList();
  }, []);

  // Check for refresh parameter and refresh list if present
  useEffect(() => {
    const shouldRefresh = searchParams.get('refresh');
    if (shouldRefresh === 'true') {
      console.log("Refresh parameter detected, refreshing history list...");
      // Add a small delay to ensure the database has been updated
      setTimeout(() => {
        GetHistoryList();
      }, 1000);
    }
  }, [searchParams]);

  const GetHistoryList = async () => {
    try {
      console.log("Fetching history list...");
      const result = await axios.get("/api/session-chat?sessionId=all");
      console.log("History list result:", result.data);
      console.log("Number of sessions:", result.data.length);
      setHistoryList(result.data);
    } catch (error) {
      console.error("Failed to fetch history list:", error);
    }
  };
  return (
    <div className="space-y-8">
      {historyList.length == 0 ? (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your First Consultation
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose a specialist below to begin your AI medical consultation
            </p>
          </div>
          <DoctorsAgentList />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Medical Reports
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Sessions: {historyList.length}
              </p>
            </div>
            <AddNewSessionDialog />
          </div>
          <HistoryTable historyList={historyList} onRefresh={GetHistoryList} />
        </div>
      )}
    </div>
  );
}

export default HistoryList;
