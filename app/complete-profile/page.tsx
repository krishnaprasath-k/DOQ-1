'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from "motion/react"
import { Heart, Pill, Save, Plus, X, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import AppHeader from "@/app/(routes)/dashboard/_components/AppHeader"

export default function CompleteProfilePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [healthData, setHealthData] = useState({
    allergies: [] as string[],
    currentMedications: [] as string[],
    medicalConditions: [] as string[],
    healthGoals: [] as string[],
  })
  const [newInputs, setNewInputs] = useState({
    allergies: '',
    currentMedications: '',
    medicalConditions: '',
    healthGoals: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [existingData, setExistingData] = useState(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchExistingHealthData()
    }
  }, [isLoaded, user])

  const fetchExistingHealthData = async () => {
    setIsDataLoading(true)
    try {
      console.log("Fetching existing health data...")
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched health data:", data)

        if (data.allergies || data.currentMedications || data.medicalConditions || data.healthGoals) {
          setExistingData(data)
          setHealthData({
            allergies: data.allergies ? data.allergies.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
            currentMedications: data.currentMedications ? data.currentMedications.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
            medicalConditions: data.medicalConditions ? data.medicalConditions.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
            healthGoals: data.healthGoals ? data.healthGoals.split(',').map((item: string) => item.trim()).filter(Boolean) : [],
          })
        }
      }
    } catch (error) {
      console.error("Error fetching health data:", error)
      toast.error("Failed to load existing health data")
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleInputChange = (category: string, value: string) => {
    setNewInputs(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const addTag = (category: string) => {
    const value = newInputs[category as keyof typeof newInputs].trim()
    if (value && !healthData[category as keyof typeof healthData].includes(value)) {
      setHealthData(prev => ({
        ...prev,
        [category]: [...prev[category as keyof typeof prev], value]
      }))
      setNewInputs(prev => ({
        ...prev,
        [category]: ''
      }))
    }
  }

  const removeTag = (category: string, tagToRemove: string) => {
    setHealthData(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].filter(item => item !== tagToRemove)
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent, category: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(category)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert arrays to comma-separated strings
      const dataToSave = {
        allergies: healthData.allergies.join(', '),
        currentMedications: healthData.currentMedications.join(', '),
        medicalConditions: healthData.medicalConditions.join(', '),
        healthGoals: healthData.healthGoals.join(', '),
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      })

      if (response.ok) {
        toast.success("Health information saved successfully!")
        router.push("/dashboard")
      } else {
        toast.error("Failed to save health information. Please try again.")
      }
    } catch (error) {
      console.error("Error saving health data:", error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader />
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {existingData ? 'Update Health Information' : 'Complete Health Information'}
          </h1>
          <p className="text-gray-600">
            {existingData
              ? 'Update your health information or add new entries'
              : 'Help us provide better medical assistance by completing your health information'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="w-6 h-6 text-blue-600" />
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Health Information</h3>
                  <p className="text-gray-600 text-center">
                    Please wait while we fetch your existing health data...
                  </p>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Allergies */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Allergies
                  </Label>

                  {/* Display existing allergies as tags */}
                  {healthData.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {healthData.allergies.map((allergy, index) => (
                        <div
                          key={index}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {allergy}
                          <button
                            type="button"
                            onClick={() => removeTag('allergies', allergy)}
                            className="hover:bg-red-200 rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input to add new allergy */}
                  <div className="flex gap-2">
                    <Input
                      value={newInputs.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'allergies')}
                      placeholder="Enter allergy (e.g., Peanuts, Penicillin, Pollen)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => addTag('allergies')}
                      disabled={!newInputs.allergies.trim()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Medications */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-500" />
                    Current Medications
                  </Label>

                  {/* Display existing medications as tags */}
                  {healthData.currentMedications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {healthData.currentMedications.map((medication, index) => (
                        <div
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {medication}
                          <button
                            type="button"
                            onClick={() => removeTag('currentMedications', medication)}
                            className="hover:bg-blue-200 rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input to add new medication */}
                  <div className="flex gap-2">
                    <Input
                      value={newInputs.currentMedications}
                      onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'currentMedications')}
                      placeholder="Enter medication (e.g., Aspirin 100mg daily)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => addTag('currentMedications')}
                      disabled={!newInputs.currentMedications.trim()}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-green-500" />
                    Medical Conditions
                  </Label>

                  {/* Display existing conditions as tags */}
                  {healthData.medicalConditions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {healthData.medicalConditions.map((condition, index) => (
                        <div
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {condition}
                          <button
                            type="button"
                            onClick={() => removeTag('medicalConditions', condition)}
                            className="hover:bg-green-200 rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input to add new condition */}
                  <div className="flex gap-2">
                    <Input
                      value={newInputs.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'medicalConditions')}
                      placeholder="Enter medical condition (e.g., Diabetes Type 2, Hypertension)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => addTag('medicalConditions')}
                      disabled={!newInputs.medicalConditions.trim()}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Health Goals */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-500" />
                    Health Goals
                  </Label>

                  {/* Display existing goals as tags */}
                  {healthData.healthGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {healthData.healthGoals.map((goal, index) => (
                        <div
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {goal}
                          <button
                            type="button"
                            onClick={() => removeTag('healthGoals', goal)}
                            className="hover:bg-purple-200 rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input to add new goal */}
                  <div className="flex gap-2">
                    <Input
                      value={newInputs.healthGoals}
                      onChange={(e) => handleInputChange('healthGoals', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'healthGoals')}
                      placeholder="Enter health goal (e.g., Lose 10 pounds, Exercise 3x per week)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => addTag('healthGoals')}
                      disabled={!newInputs.healthGoals.trim()}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {existingData ? 'Update Health Information' : 'Save Health Information'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
