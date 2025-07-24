// app/api/complete-profile/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  const clerk=await clerkClient();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // You can also accept profile data in the body
  const { phone, dob, gender, emergencyContact, address } = await req.json()

    await clerk.users.updateUser(userId, {
    publicMetadata: {
        isProfileComplete: true,
        phone,
        dob,
        gender,
        emergencyContact,
        address,
    },
})

  return NextResponse.json({ success: true })
}
