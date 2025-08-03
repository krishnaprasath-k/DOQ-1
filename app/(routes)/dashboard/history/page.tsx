import React, { Suspense } from "react";
import HistoryList from "../_components/HistoryList";

function History() {
  return (
    <div>
      <Suspense fallback={
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }>
        <HistoryList />
      </Suspense>
    </div>
  );
}

export default History;
