// app/check-profile/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/config/schema";

export default async function CheckProfilePage() {
  const user = await currentUser();

  if (!user) return redirect("/sign-in");

  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!email) return redirect("/sign-in");

  try {
  const dbUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  console.log(dbUser);
  if (dbUser.length > 0&& dbUser[0].isProfileComplete === true) {
    return redirect("/dashboard");
  }

  return redirect("/dashboard");
} catch (e) {
  console.error("Database error in check-profile:", e);
  throw e;
}

}
