import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  const primaryEmail = user?.emailAddresses?.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!user || !primaryEmail) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, primaryEmail));

    if (users?.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(users[0]);
  } catch (e) {
    return NextResponse.json(
      { error: "An error occurred while fetching user profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const user = await currentUser();
  const primaryEmail = user?.emailAddresses?.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!user || !primaryEmail) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const {
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      allergies,
      currentMedications,
      medicalConditions,
      healthGoals,
    } = await req.json();

    const result = await db
      .update(usersTable)
      .set({
        phone,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
        allergies,
        currentMedications,
        medicalConditions,
        healthGoals,
      })
      .where(eq(usersTable.email, primaryEmail))
      .returning();

    if (result?.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json(
      { error: "An error occurred while updating the profile." },
      { status: 500 }
    );
  }
}
