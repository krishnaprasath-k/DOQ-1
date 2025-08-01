import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Primary email not found" }, { status: 400 });
    }

    const sessionId = uuidv4();
    console.log("Creating new session:", sessionId);
    console.log("Created by:", email);
    console.log("Selected doctor:", selectedDoctor?.name);

    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId,
        createdBy: email,
        notes,
        selectedDoctor,
        createdOn: new Date().toISOString(),
      })
      .returning();

    console.log("Session created successfully:", result[0]);
    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("Chat data insertion error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Primary email not found" }, { status: 400 });
    }

    if (sessionId === "all") {
      const result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, email))
        .orderBy(desc(SessionChatTable.id));

      // Filter out sessions without valid reports
      const sessionsWithReports = result.filter(session => {
        const hasReport = session.report !== null && session.report !== undefined;
        const hasValidReport = hasReport && typeof session.report === 'object' && session.report.summary;
        console.log(`Session ${session.sessionId}: hasReport=${hasReport}, hasValidReport=${hasValidReport}`);
        return hasValidReport;
      });

      console.log("Total sessions:", result.length);
      console.log("Sessions with valid reports:", sessionsWithReports.length);

      return NextResponse.json(sessionsWithReports);
    } else {
      const result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.sessionId, sessionId));

      return NextResponse.json(result[0]);
    }
  } catch (error) {
    console.error("GET /api/session-chat failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  console.log("=== DELETE API CALLED ===");
  console.log("Request URL:", req.url);

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    console.log("Extracted sessionId:", sessionId);

    const user = await currentUser();
    console.log("User authenticated:", !!user);

    if (!user) {
      console.log("DELETE failed: No user authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Primary email not found" }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    console.log("DELETE - Session ID:", sessionId);
    console.log("DELETE - User email:", email);

    // First, check if the session exists at all
    const existingSession = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    console.log("DELETE - Found sessions:", existingSession.length);
    if (existingSession.length > 0) {
      console.log("DELETE - Session createdBy:", existingSession[0].createdBy);
      console.log("DELETE - Current user email:", email);
    }

    // Delete the session, but only if it belongs to the current user
    const result = await db
      .delete(SessionChatTable)
      .where(
        and(
          eq(SessionChatTable.sessionId, sessionId),
          eq(SessionChatTable.createdBy, email)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Session not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/session-chat failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
