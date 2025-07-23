"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { IconArrowRight } from "@tabler/icons-react";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export type doctorAgent = {
  id: number;
  name: string;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?: string;
  subscriptionRequired: boolean;
};
type props = {
  doctor: doctorAgent;
};

function DoctorAgentCard({ doctor }: props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && (has({ plan: "plus" }) || has({ plan: "PLUS" }) || has({ plan: "pro" }));

  const onStartConsultation = async () => {
    setLoading(true);
    try {
      await axios.post("/api/users");
      const result = await axios.post("/api/session-chat", {
        notes: "New query",
        selectedDoctor: doctor,
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-200 relative group h-full flex flex-col overflow-hidden">
      {doctor.subscriptionRequired && (
        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 z-10 text-xs px-2 py-1">
          Premium
        </Badge>
      )}

      <div className="relative mb-4">
        <Image
          src={doctor.image}
          alt={doctor.specialist}
          width={200}
          height={200}
          className="w-full h-[200px] object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
      </div>

      <div className="flex flex-col flex-grow space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{doctor.specialist}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.name}</p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">
          {doctor.description}
        </p>

        <Button
          onClick={onStartConsultation}
          className={`w-full mt-auto ${
            doctor.subscriptionRequired && !paidUser
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={(!paidUser && doctor.subscriptionRequired) || loading}
        >
          {!paidUser && doctor.subscriptionRequired ? (
            <>
              <IconArrowRight className="mr-2 w-4 h-4" />
              Upgrade to Access
            </>
          ) : (
            <>
              {loading ? (
                <Loader2Icon className="mr-2 w-4 h-4 animate-spin" />
              ) : (
                <IconArrowRight className="mr-2 w-4 h-4" />
              )}
              Start Consultation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default DoctorAgentCard;
