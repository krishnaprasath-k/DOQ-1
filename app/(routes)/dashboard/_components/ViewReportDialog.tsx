"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import moment from "moment";
import { Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type Props = {
  record: SessionDetail;
  onDelete?: () => void;
};

function ViewReportDialog({ record, onDelete }: Props) {
  const report: any = record?.report;
  const [formattedDate, setFormattedDate] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("ViewReportDialog - Record:", record);
    console.log("ViewReportDialog - Report:", report);
    console.log("ViewReportDialog - Has report:", !!report);
  }, [record, report]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFormattedDate(
        moment(record?.createdOn).format("MMMM Do YYYY, h:mm a")
      );
    }
  }, [record?.createdOn]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this medical report? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log("=== DELETE DEBUG ===");
      console.log("Deleting session:", record.sessionId);
      console.log("Record object:", record);
      console.log("API URL:", `/api/session-chat?sessionId=${record.sessionId}`);

      const response = await axios.delete(`/api/session-chat?sessionId=${record.sessionId}`);
      console.log("Delete response:", response.data);

      // Close dialog first
      setIsOpen(false);

      // Show success message
      toast.success("Medical report deleted successfully");

      // Wait a moment for the database operation to complete, then refresh
      setTimeout(() => {
        if (onDelete) {
          console.log("Triggering history list refresh after delete");
          onDelete();
        }
      }, 500);
    } catch (error: any) {
      console.error("=== DELETE ERROR ===");
      console.error("Error object:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);

      if (error.response?.status === 404) {
        toast.error("Session not found. It may have already been deleted.");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else if (error.response?.data?.error) {
        toast.error("Delete failed: " + error.response.data.error);
      } else {
        toast.error("Failed to delete medical report. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"link"} size={"sm"} className="cursor-pointer">
          <Eye className="w-4 h-4 mr-1" />
          View Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white shadow-lg p-6 min-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-500 mb-4 text-center">
            🩺 Medical AI Voice Agent Report
          </DialogTitle>
        </DialogHeader>

        {!report ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Report Generated</h3>
              <p className="text-gray-600 mb-4">This consultation session exists but no medical report was generated.</p>
              <p className="text-sm text-gray-500">This usually happens when the voice conversation was too short or the AI report generation failed.</p>
            </div>
            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Session"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
        <div className="space-y-6 text-gray-800 text-sm">
          {/* Session Info */}
          <div>
            <h2 className="font-bold text-blue-500 text-lg mb-1">
              Session Info
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
              <div>
                <span className="font-bold">Doctor:</span>{" "}
                {record?.selectedDoctor?.name || "-"}
              </div>
              <div>
                <span className="font-bold">User:</span> {report?.user || "-"}
              </div>
              <div>
                <span className="font-bold">Consulted On:</span>{" "}
                <span suppressHydrationWarning>{formattedDate}</span>
              </div>
              <div>
                <span className="font-bold">Agent:</span>{" "}
                {record?.selectedDoctor?.name
                  ? `${record?.selectedDoctor?.specialist} AI`
                  : "-"}
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          <div>
            <h2 className="font-bold text-blue-500 text-lg mb-1">
              Chief Complaint
            </h2>
            <div className="border-b border-blue-200 mb-1" />
            <div>{report?.chiefComplaint || "-"}</div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="font-bold text-blue-500 text-lg mb-1">Summary</h2>
            <div className="border-b border-blue-200 mb-1" />
            <div>{report?.summary || "-"}</div>
          </div>

          {/* Symptoms */}
          <div>
            <h2 className="font-bold text-blue-500 text-lg mb-1">Symptoms</h2>
            <div className="border-b border-blue-200 mb-1" />
            <ul className="list-disc ml-5">
              {Array.isArray(report?.symptoms) && report.symptoms.length > 0 ? (
                report.symptoms.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))
              ) : (
                <li>-</li>
              )}
            </ul>
          </div>

          {/* Duration & Severity */}
          <div>
            <h2 className="font-bold text-blue-500 text-lg mb-1">
              Duration & Severity
            </h2>
            <div className="border-b border-blue-200 mb-1" />
            <div className="flex gap-8">
              <div>
                <span className="font-bold">Duration:</span>{" "}
                {report?.duration || "Not specified"}
              </div>
              <div>
                <span className="font-bold">Severity:</span>{" "}
                {report?.severity || "-"}
              </div>
            </div>
          </div>

          {/* Medications Mentioned */}
          <div>
            <h2 className="font-bold text-blue-500 text-lg mb-1">
              Medications Mentioned
            </h2>
            <div className="border-b border-blue-200 mb-1" />
            <ul className="list-disc ml-5">
              {Array.isArray(report?.medicationsMentioned) &&
              report.medicationsMentioned.length > 0 ? (
                report.medicationsMentioned.map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))
              ) : (
                <li>-</li>
              )}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="font-bold text-blue-500 text-lg mb-1">
              Recommendations
            </h2>
            <div className="border-b border-blue-200 mb-1" />
            <ul className="list-disc ml-5">
              {Array.isArray(report?.recommendations) &&
              report.recommendations.length > 0 ? (
                report.recommendations.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))
              ) : (
                <li>-</li>
              )}
            </ul>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 border-t pt-2 mt-4">
            This report was generated by an AI Medical Assistant for
            informational purposes only.
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Report"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;
