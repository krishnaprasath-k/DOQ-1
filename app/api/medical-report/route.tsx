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
    if (!sessionId || !sessionDetail || !messages) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, sessionDetail, or messages" },
        { status: 400 }
      );
    }

    const UserInput =
      "AI Doctor Agent Info:" +
      JSON.stringify(sessionDetail) +
      ", Conversation:" +
      JSON.stringify(messages);

    console.log("Generating medical report for session:", sessionId);

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: REPORT_GEN_PROMPT },
        { role: "user", content: UserInput },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
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
      .replace(/^\s*[\r\n]/gm, ""); // Remove empty lines

    console.log("Raw AI response:", cleanedResp);

    let JSONResp;
    try {
      JSONResp = JSON.parse(cleanedResp);
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      console.error("Response that failed to parse:", cleanedResp);

      // Fallback: create a basic report structure
      JSONResp = {
        sessionId: sessionId,
        agent: sessionDetail?.selectedDoctor?.name || "AI Medical Assistant",
        user: "Anonymous",
        timestamp: new Date().toISOString(),
        chiefComplaint: "Medical consultation completed",
        summary: "Voice consultation session completed. Please review the conversation for details.",
        symptoms: [],
        duration: "Not specified",
        severity: "Not specified",
        medicationsMentioned: [],
        recommendations: ["Consult with a healthcare professional for proper diagnosis"]
      };
    }

    // Update database with the report
    const result = await db
      .update(SessionChatTable)
      .set({
        report: JSONResp,
        conversation: messages,
      })
      .where(eq(SessionChatTable.sessionId, sessionId));

    console.log("Medical report generated successfully for session:", sessionId);
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
