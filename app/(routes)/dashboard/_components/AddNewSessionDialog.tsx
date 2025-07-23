"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Crown } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { doctorAgent } from "./DoctorAgentCard";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import { toast } from "sonner";

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>();
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>();
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);
  const router = useRouter();

  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && (has({ plan: "plus" }) || has({ plan: "PLUS" }) || has({ plan: "pro" }));

  useEffect(() => {
    GetHistoryList();
  }, []);

  const GetHistoryList = async () => {
    const result = await axios.get("/api/session-chat?sessionId=all");
    setHistoryList(result.data);
  };

  const OnClickNext = async () => {
    try {
      setLoading(true);
      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      });
      setSuggestedDoctors(result.data);
    } catch (err: any) {
      if (err?.response?.data?.error) {
        toast.error(
          "An error occurred in AI services: " + err.response.data.error
        );
      } else {
        toast.error(
          "An error occurred in AI services. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const onStartConsultation = async () => {
    setLoading(true);
    try {
      await axios.post("/api/users");
      const result = await axios.post("/api/session-chat", {
        notes: note,
        selectedDoctor: selectedDoctor,
      });
      if (result.data?.sessionId) {
        router.push("/dashboard/medical-agent/" + result.data.sessionId);
      }
    } catch (err: any) {
      if (err?.response?.data?.error) {
        toast.error(
          "An error occurred in AI services: " + err.response.data.error
        );
      } else {
        toast.error(
          "An error occurred in AI services. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const canStartConsultation = paidUser || historyList?.length < 5; // Free users get 5 consultations

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative">
          <Button
            className={`${
              canStartConsultation
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            disabled={!canStartConsultation}
          >
            + Start a Consultation
          </Button>
          {!paidUser && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {historyList?.length || 0}/5 free consultations used
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!paidUser && historyList?.length >= 5 ? "Upgrade Required" : "Add Basic Details"}
          </DialogTitle>
          <DialogDescription asChild>
            {!paidUser && historyList?.length >= 5 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  You've reached your free consultation limit
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Upgrade to Plus for just $5/month to get unlimited consultations and access to all specialist doctors.
                </p>
                <div className="flex gap-3 justify-center">
                  <DialogClose asChild>
                    <Button variant="outline">Maybe Later</Button>
                  </DialogClose>
                  <Link href="/dashboard/billing">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Upgrade to Plus
                    </Button>
                  </Link>
                </div>
              </div>
            ) : !suggestedDoctors ? (
              <div>
                <h2>Add Symptoms or Any Other Details</h2>
                <Textarea
                  className="h-[200px] mt-1"
                  placeholder="Add details here"
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <h2>Select the doctor</h2>
                <div className="grid grid-cols-3 gap-5">
                  {suggestedDoctors.map((doctor) => (
                    <SuggestedDoctorCard
                      doctorAgent={doctor}
                      setSelectedDoctor={() => setSelectedDoctor(doctor)}
                      //@ts-ignore
                      selectedDoctor={selectedDoctor}
                      key={doctor.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>

          {!suggestedDoctors ? (
            <Button disabled={!note || loading} onClick={() => OnClickNext()}>
              Next{" "}
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
          ) : (
            <Button
              disabled={loading || !selectedDoctor}
              onClick={() => onStartConsultation()}
            >
              Start Consultation
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
