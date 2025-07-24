'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompleteProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [formData, setFormData] = useState({
    phone: '',
    dob: '',
    gender: '',
    emergencyContact: '',
    address: '',
  })

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.isProfileComplete === true) {
      router.replace('/dashboard') // Already complete? redirect
    }
  }, [isLoaded, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  await fetch("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...formData,
      dateOfBirth: formData.dob, // ensure correct key
    }),
  });

  router.push("/dashboard");
};


  return (
    <div className="p-6">
      {/* Your form UI here */}
      <form onSubmit={handleSubmit}>
        {/* Input fields */}
        <input name="phone" onChange={handleChange} required />
        {/* other fields... */}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
