import { db } from "@/config/db";
import { openai } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on doctor AI agent info and Conversation between AI medical agent and user, generate a structured report with the following fields:
1. sessionId: a unique session identifier
2. agent: the medical specialist name (e.g., "General Physician AI")
3. user: name of the patient or "Anonymous" if not provided
4. timestamp: current date and time in ISO format
5. chiefComplaint: one-sentence summary of the main health concern
6. summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations
7. symptoms: list of symptoms mentioned by the user
8. duration: how long the user has experienced the symptoms
9. severity: mild, moderate, or severe
10. medicationsMentioned: list of any medicines mentioned
11. recommendations: list of AI suggestions (e.g., rest, see a doctor)
Return the result in this JSON format:
{
"sessionId": "string",
"agent": "string",
"user": "string",
"timestamp": "ISO Date string",
"chiefComplaint": "string",
"summary": "string",
"symptoms": ["symptom1","symptom2"],
"duration": "string",
"severity": "string",
"medicationsMentioned": ["med1","med2"],
"recommendations": ["rec1","rec2"],
}
Only include valid fields. Respond with nothing else.`;

export async function POST(req: NextRequest) {
  const { sessionId, sessionDetail, messages } = await req.json();

  // Check if OpenRouter API key is configured
  if (!process.env.OPEN_ROUTER_API_KEY) {
    console.error("OPEN_ROUTER_API_KEY not configured");
    return NextResponse.json(
      { error: "OpenRouter API key not configured. Please add OPEN_ROUTER_API_KEY to your environment variables." },
      { status: 500 }
    );
  }

  try {
    // Validate input data
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    console.log("=== MEDICAL REPORT GENERATION ===");
    console.log("Session ID:", sessionId);
    console.log("Session Detail:", sessionDetail);
    console.log("Messages:", messages);
    console.log("Messages length:", messages?.length || 0);

    const UserInput =
      "AI Doctor Agent Info:" +
      JSON.stringify(sessionDetail) +
      ", Conversation:" +
      JSON.stringify(messages);

    console.log("Generating medical report for session:", sessionId);

    let JSONResp;
    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: REPORT_GEN_PROMPT },
          { role: "user", content: UserInput },
        ],
        temperature: 0.3,
      });

      const rawResp = completion.choices[0].message;
      if (!rawResp?.content) {
        throw new Error("No content received from OpenAI");
      }

      // Clean up the response and parse JSON
      let cleanedResp = rawResp.content
        .trim()
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .replace(/^\s*[\r\n]/gm, "");

      console.log("Raw AI response:", cleanedResp);
      JSONResp = JSON.parse(cleanedResp);
      console.log("Parsed AI report successfully");

    } catch (aiError) {
      console.error("AI generation failed:", aiError);

      // Create fallback report
      JSONResp = {
        sessionId: sessionId,
        agent: sessionDetail?.selectedDoctor?.name || "AI Medical Assistant",
        user: "Anonymous",
        timestamp: new Date().toISOString(),
        chiefComplaint: "Medical consultation completed",
        summary: `Voice consultation with ${sessionDetail?.selectedDoctor?.name || "AI Doctor"}. AI report generation encountered an issue, but conversation was recorded with ${messages?.length || 0} messages.`,
        symptoms: messages?.filter((m: any) => m.role === 'user').map((m: any) => m.text).slice(0, 3) || [],
        duration: "Not specified",
        severity: "Not specified",
        medicationsMentioned: [],
        recommendations: ["Consult with a healthcare professional for proper diagnosis"]
      };
      console.log("Created fallback report");
    }

    // Update database with the report
    console.log("Updating database for session:", sessionId);
    console.log("Report data:", JSONResp);

    const result = await db
      .update(SessionChatTable)
      .set({
        report: JSONResp,
        conversation: messages,
      })
      .where(eq(SessionChatTable.sessionId, sessionId))
      .returning();

    console.log("Database update result:", result);
    console.log("Updated rows:", result.length);

    if (result.length === 0) {
      console.error("No rows updated - session not found:", sessionId);
      return NextResponse.json(
        { error: "Session not found for report update" },
        { status: 404 }
      );
    }

    console.log("Medical report generated and saved successfully for session:", sessionId);
    return NextResponse.json(JSONResp);

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    console.error("Medical report generation error:", errorMsg, e);

    // Return more specific error information
    if (e instanceof Error && e.message.includes("API key")) {
      return NextResponse.json(
        { error: "OpenRouter API authentication failed. Please check your API key." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while generating the report: " + errorMsg },
      { status: 500 }
    );
  }
}
