"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doctorAgent } from "../../_components/DoctorAgentCard";
import { Circle, Loader, PhoneCall, PhoneOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Vapi from "@vapi-ai/web";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type SessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
};
type messagesType = {
  role: string;
  text: string;
};
function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [messages, setMessages] = useState<messagesType[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  // Fetch session details when component mounts
  useEffect(() => {
    sessionId && GetSessionDetails();
  }, [sessionId]);

  const GetSessionDetails = async () => {
    const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
    setSessionDetail(result.data);
  };

  const StartCall = async () => {
    if (!sessionDetail) return;
    setLoading(true);

    // Check if VAPI credentials are configured
    const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (!vapiPublicKey) {
      toast.error("VAPI public key not configured. Please add NEXT_PUBLIC_VAPI_PUBLIC_KEY to your environment variables.");
      setLoading(false);
      return;
    }

    if (!vapiAssistantId) {
      toast.error("VAPI assistant ID not configured. Please add NEXT_PUBLIC_VAPI_ASSISTANT_ID to your environment variables.");
      setLoading(false);
      return;
    }

    // Initialize VAPI with your public key
    const vapi = new Vapi(vapiPublicKey);
    setVapiInstance(vapi);

    try {
      // Start call with your pre-configured public assistant
      await vapi.start(vapiAssistantId);
      vapi.on("call-start", () => {
        setCallStarted(true);
        setLoading(false);
      });
      vapi.on("call-end", () => {
        setCallStarted(false);
        setLoading(false);
      });
      vapi.on("message", (message) => {
        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;
          if (transcriptType == "partial") {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType == "final") {
            setMessages((prev: any) => [
              ...prev,
              { role: role, text: transcript },
            ]);
            setLiveTranscript("");
            setCurrentRole(null);
          }
        }
      });
      vapi.on("speech-start", () => {
        setCurrentRole("assistant");
      });
      vapi.on("speech-end", () => {
        setCurrentRole("user");
      });
    } catch (e: any) {
      if (e?.response?.data?.error) {
        toast.error(
          "An error occurred in AI services: " + e.response.data.error
        );
      } else {
        toast.error(
          "An error occurred in AI services. Please try again later."
        );
      }
      setLoading(false);
    }
  };
  const endCall = async () => {
    if (!vapiInstance) return;

    // Stop the call first
    vapiInstance.stop();
    setCallStarted(false);
    setVapiInstance(null);

    // Show loading state
    setLoading(true);

    try {
      console.log("Ending call and generating report...");
      await GenerateReport();
      toast.success("Medical report generated successfully!");

      // Wait a moment then redirect with refresh parameter
      setTimeout(() => {
        router.replace("/dashboard?refresh=true");
      }, 1500);
    } catch (error) {
      console.error("Report generation failed:", error);
      toast.error("Report generation failed, but session was saved");

      // Still redirect after error
      setTimeout(() => {
        router.replace("/dashboard?refresh=true");
      }, 2000);
    }
  };

  const GenerateReport = async () => {
    setLoading(true);
    try {
      console.log("=== GENERATE REPORT DEBUG ===");
      console.log("Session ID:", sessionId);
      console.log("Messages:", messages);
      console.log("Messages length:", messages?.length || 0);
      console.log("Session Detail:", sessionDetail);
      console.log("============================");

      // Always try to generate a report, even with no messages
      const result = await axios.post("/api/medical-report", {
        messages: messages || [],
        sessionDetail: sessionDetail,
        sessionId: sessionId,
      });

      console.log("Report generated successfully:", result.data);
      setLoading(false);
      await GetSessionDetails();
      return result.data;
    } catch (err: any) {
      console.error("Report generation error:", err);
      setLoading(false);

      if (err?.response?.data?.error) {
        console.error("API Error:", err.response.data.error);
        throw new Error("Report generation failed: " + err.response.data.error);
      } else if (err?.response?.status === 401) {
        throw new Error("API authentication failed. Please check your OpenRouter API key.");
      } else {
        throw new Error("Failed to generate medical report. The session was saved without a report.");
      }
    }
  };
  return (
    <div className="p-5 border rounded-3xl bg-secondary">
      <div className="flex items-center justify-between">
        <h2 className="p-1 px-2 border rounded-md flex items-center gap-2">
          <Circle
            className={`size-4 rounded-full ${
              callStarted ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {callStarted ? "Connected" : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>
      {sessionDetail && (
        <div className="flex items-center flex-col mt-10">
          <Image
            src={sessionDetail?.selectedDoctor?.image}
            alt={sessionDetail?.selectedDoctor?.name}
            width={120}
            height={120}
            className="size-[100px] object-cover rounded-full"
          />
          <h2 className="mt-2 text-lg">
            {sessionDetail?.selectedDoctor?.specialist}
          </h2>
          <h3 className="text-md">Dr. {sessionDetail?.selectedDoctor?.name}</h3>
          <p className="text-sm text-gray-400">AI Medical Voice Agent</p>

          <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52">
            {messages?.slice(-4).map((msg: messagesType, i) => (
              <h2 className="text-gray-400 p-2" key={i}>
                {msg.role} : {msg.text}
              </h2>
            ))}

            {liveTranscript && liveTranscript?.length > 0 && (
              <h2 className="text-lg">
                {currentRole} : {liveTranscript}
              </h2>
            )}
          </div>

          {!callStarted ? (
            <Button className="mt-20" onClick={StartCall} disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : <PhoneCall />}
              Start Call
            </Button>
          ) : (
            <Button
              variant={"destructive"}
              onClick={endCall}
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : <PhoneOff />}{" "}
              Disconnect
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default MedicalVoiceAgent;
