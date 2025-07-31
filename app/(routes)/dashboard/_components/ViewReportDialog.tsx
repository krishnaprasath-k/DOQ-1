"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
      await axios.delete(`/api/session-chat?sessionId=${record.sessionId}`);
      toast.success("Medical report deleted successfully");
      setIsOpen(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete medical report");
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
          <DialogDescription>
            <DialogTitle className="text-2xl font-bold text-blue-500 mb-4 text-center">
              🩺 Medical AI Voice Agent Report
            </DialogTitle>
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;
