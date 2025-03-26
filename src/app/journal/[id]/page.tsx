"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit3, Trash2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth"
import { getJournalEntry, updateJournalEntry, deleteJournalEntry, startEntryTimer, endEntryTimer } from "@/lib/firebase/db"
import type { JournalEntry, Goal } from "@/lib/firebase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserGoals } from "@/lib/firebase/db"

// Helper function to get mood emoji
const getMoodEmoji = (moodLevel: number) => {
  if (moodLevel >= 80) return "😊" // Very happy
  if (moodLevel >= 60) return "🙂" // Happy
  if (moodLevel >= 40) return "😐" // Neutral
  if (moodLevel >= 20) return "🙁" // Sad
  return "😢" // Very sad
}

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [editedContent, setEditedContent] = useState<string>("")
  const [isEditing, setIsEditing] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localMetadata, setLocalMetadata] = useState<JournalEntry['metadata']>({})

  // Handle new/create-entry redirects
  useEffect(() => {
  if (params.id === "new" || params.id === "new-entry") {
      router.push("/journal/create-entry")
      return
    }
  }, [params.id, router])

  // Load entry data
  useEffect(() => {
    if (!user) return

    const loadEntry = async () => {
      try {
        setLoading(true)
        setError(null)

        const journalId = localStorage.getItem('currentJournalId') || 'default'
        const entryData = await getJournalEntry(user.uid, journalId, params.id)
        
        if (!entryData) {
          setError("Entry not found")
          return
        }

        setEntry(entryData)
        setEditedContent(entryData.content)
        setSelectedGoals(entryData.relatedGoals || [])
        setLocalMetadata(entryData.metadata || {})
      } catch (err) {
        console.error("Error loading entry:", err)
        setError("Failed to load entry")
      } finally {
        setLoading(false)
      }
    }

    loadEntry()
  }, [user, params.id])

  // Load goals separately
  useEffect(() => {
    if (!user) return

    const loadGoals = async () => {
      try {
        const userGoals = await getUserGoals(user.uid)
        setGoals(userGoals)
      } catch (err) {
        console.error("Error loading goals:", err)
      }
    }

    loadGoals()
  }, [user])

  const handleMetadataChange = (field: string, value: any) => {
    setLocalMetadata((prev: JournalEntry['metadata'] | null) => ({
      ...(prev || {}),
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!entry || !user) return

    if (isTimerRunning) {
      await endEntryTimer(user.uid, entry.journalId, entry.id!)
      setIsTimerRunning(false)
    }

    const updates = {
      content: editedContent || "",
      metadata: {
        ...localMetadata,
        title: localMetadata?.title || "Journal Entry",
        type: localMetadata?.type || "mood-feelings"
      },
      tags: entry.tags || [],
      updatedAt: new Date(),
      relatedGoals: selectedGoals || [],
      userId: entry.userId,
      journalId: entry.journalId,
      createdAt: entry.createdAt,
      id: entry.id
    }

    try {
      await updateJournalEntry(user.uid, entry.journalId, entry.id!, updates)
      setEntry({ ...entry, ...updates })
      setIsEditing(false)
    } catch (err) {
      console.error("Error saving entry:", err)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    // Start timer when editing begins
    if (entry && user) {
      startEntryTimer(user.uid, entry.journalId, entry.id!)
      setIsTimerRunning(true)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedContent(entry?.content || "")
    // End timer without saving time if editing is cancelled
    if (isTimerRunning && entry && user) {
      endEntryTimer(user.uid, entry.journalId, entry.id!)
      setIsTimerRunning(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !entry || !confirm("Are you sure you want to delete this entry?")) return

    try {
      await deleteJournalEntry(user.uid, entry.journalId, entry.id!)
      router.push("/journal")
    } catch (err) {
      console.error("Error deleting entry:", err)
      setError("Failed to delete entry")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-500">{error || "Entry not found"}</div>
          <Link href="/journal" className="mt-4 text-blue-500 hover:underline">
            Back to Journal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Link
          href="/journal/browse"
          className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Journal
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{entry.metadata?.title || "Journal Entry"}</CardTitle>
              <CardDescription>
                {new Date(entry.createdAt).toLocaleDateString()} at{" "}
                {new Date(entry.createdAt).toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={isEditing}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <h3 className="font-medium">Title</h3>
                <input
                  type="text"
                  value={localMetadata?.title || ""}
                  onChange={(e) => handleMetadataChange('title', e.target.value)}
                  className="w-full rounded-md border p-2"
                />
              </div>

              {/* Category-specific fields */}
              {entry.metadata?.type === 'mood-feelings' && (
                <>
                  {/* Mood Level */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Mood Level</h3>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localMetadata?.moodLevel || 50}
                      onChange={(e) => handleMetadataChange('moodLevel', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0%</span>
                      <span className="flex items-center gap-1">
                        {getMoodEmoji(localMetadata?.moodLevel || 50)}
                        {localMetadata?.moodLevel || 50}%
                      </span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Primary Emotion */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Primary Emotion</h3>
                    <input
                      type="text"
                      value={localMetadata?.primaryEmotion || ""}
                      onChange={(e) => handleMetadataChange('primaryEmotion', e.target.value)}
                      className="w-full rounded-md border p-2"
                    />
                  </div>

                  {/* Triggers */}
                  <div className="space-y-2">
                    <h3 className="font-medium">What triggered these feelings?</h3>
                    <textarea
                      value={localMetadata?.triggers || ""}
                      onChange={(e) => handleMetadataChange('triggers', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>

                  {/* Physical Sensations */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Physical Sensations</h3>
                    <textarea
                      value={localMetadata?.physical || ""}
                      onChange={(e) => handleMetadataChange('physical', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>

                  {/* Healthy Response */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Did you respond to your emotions in a healthy way?</h3>
                    <select
                      value={localMetadata?.healthyResponse || "yes"}
                      onChange={(e) => handleMetadataChange('healthyResponse', e.target.value)}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="somewhat">Somewhat</option>
                    </select>
                  </div>

                  {/* Reflection */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Reflection</h3>
                    <textarea
                      value={localMetadata?.reflection || ""}
                      onChange={(e) => handleMetadataChange('reflection', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>
                </>
              )}

              {entry.metadata?.type === 'future-visioning' && (
                <>
                  {/* Timeframe Selection */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Timeframe</h3>
                    <Select
                      value={localMetadata?.timeframe || "5-years"}
                      onValueChange={(value) => handleMetadataChange('timeframe', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="3-years">3 Years</SelectItem>
                        <SelectItem value="5-years">5 Years</SelectItem>
                        <SelectItem value="10-years">10 Years</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Life Area */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Life Area</h3>
                    <select
                      value={localMetadata?.lifeArea || "career"}
                      onChange={(e) => handleMetadataChange('lifeArea', e.target.value)}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="career">Career</option>
                      <option value="health">Health</option>
                      <option value="relationships">Relationships</option>
                      <option value="personal-growth">Personal Growth</option>
                      <option value="finances">Finances</option>
                      <option value="lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  {/* Vision Description */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Vision Description</h3>
                    <textarea
                      value={localMetadata?.visionDescription || ""}
                      onChange={(e) => handleMetadataChange('visionDescription', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>

                  {/* Action Steps */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Action Steps</h3>
                    <textarea
                      value={localMetadata?.actionSteps || ""}
                      onChange={(e) => handleMetadataChange('actionSteps', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>

                  {/* Obstacles */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Potential Obstacles</h3>
                    <textarea
                      value={localMetadata?.obstacles || ""}
                      onChange={(e) => handleMetadataChange('obstacles', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>

                  {/* Support Needed */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Support Needed</h3>
                    <textarea
                      value={localMetadata?.supportNeeded || ""}
                      onChange={(e) => handleMetadataChange('supportNeeded', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>
                </>
              )}

              {entry.metadata?.type === 'gratitude-reflection' && (
                <>
                  {/* Gratitude Points */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Three things I'm grateful for today</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((index) => {
                        // Handle both array and string formats
                        const points = Array.isArray(localMetadata?.gratitudePoints)
                          ? localMetadata.gratitudePoints
                          : (localMetadata?.gratitudePoints || '').split('\n\n');
                        
                        return (
                          <div key={index} className="space-y-2">
                            <textarea
                              value={points[index - 1] || ""}
                              onChange={(e) => {
                                const newPoints = [...(points || ["", "", ""])]
                                newPoints[index - 1] = e.target.value
                                // Always save as array
                                handleMetadataChange('gratitudePoints', newPoints)
                              }}
                              className="w-full min-h-[80px] rounded-md border p-2"
                              placeholder={`I'm grateful for...`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Highlight */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Highlight of the day</h3>
                    <textarea
                      value={localMetadata?.highlight || ""}
                      onChange={(e) => handleMetadataChange('highlight', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>

                  {/* Learnings */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Lessons & Insights</h3>
                    <textarea
                      value={localMetadata?.learnings || ""}
                      onChange={(e) => handleMetadataChange('learnings', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Reflection on Growth</h3>
                    <textarea
                      value={localMetadata?.nextSteps || ""}
                      onChange={(e) => handleMetadataChange('nextSteps', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                    />
                  </div>
                </>
              )}

              {entry.metadata?.type === 'daily-checkins' && (
                <>
                  {/* Energy Level */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Energy Level</h3>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localMetadata?.energyLevel || 50}
                      onChange={(e) => handleMetadataChange('energyLevel', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Low</span>
                      <span>{localMetadata?.energyLevel || 50}%</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Overall Mood */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Overall Mood</h3>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={localMetadata?.overallMood || 50}
                      onChange={(e) => handleMetadataChange('overallMood', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>😢</span>
                      <span>{localMetadata?.overallMood || 50}%</span>
                      <span>😊</span>
                    </div>
                  </div>

                  {/* Today's Intention */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Today's Intention</h3>
                    <textarea
                      value={localMetadata?.todaysIntention || ""}
                      onChange={(e) => handleMetadataChange('todaysIntention', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                      placeholder="What is your intention for today?"
                    />
                  </div>

                  {/* Day Reflection */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Day Reflection</h3>
                    <textarea
                      value={localMetadata?.dayReflection || ""}
                      onChange={(e) => handleMetadataChange('dayReflection', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                      placeholder="Reflect on your day..."
                    />
                  </div>

                  {/* Best Part of Today */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Best Part of Today</h3>
                    <textarea
                      value={localMetadata?.bestPartOfDay || ""}
                      onChange={(e) => handleMetadataChange('bestPartOfDay', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                      placeholder="What was the best part of your day?"
                    />
                  </div>

                  {/* Biggest Challenge */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Biggest Challenge</h3>
                    <textarea
                      value={localMetadata?.biggestChallenge || ""}
                      onChange={(e) => handleMetadataChange('biggestChallenge', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                      placeholder="What was your biggest challenge today?"
                    />
                  </div>

                  {/* Today's Wins */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Today's Wins (Big or Small)</h3>
                    <textarea
                      value={localMetadata?.todaysWins || ""}
                      onChange={(e) => handleMetadataChange('todaysWins', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                      placeholder="What wins did you have today?"
                    />
                  </div>

                  {/* Gratitude */}
                  <div className="space-y-2">
                    <h3 className="font-medium">One Thing I'm Grateful For</h3>
                    <textarea
                      value={localMetadata?.gratitude || ""}
                      onChange={(e) => handleMetadataChange('gratitude', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                      placeholder="What are you grateful for today?"
                    />
                  </div>

                  {/* Focus for Tomorrow */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Focus for Tomorrow</h3>
                    <textarea
                      value={localMetadata?.focusForTomorrow || ""}
                      onChange={(e) => handleMetadataChange('focusForTomorrow', e.target.value)}
                      className="w-full min-h-[100px] rounded-md border p-2"
                      placeholder="What will you focus on tomorrow?"
                    />
                  </div>
                </>
              )}

              {/* Main Content */}
              <div className="space-y-2">
                <h3 className="font-medium">Journal Entry</h3>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full min-h-[200px] rounded-md border p-2"
                />
              </div>

              {/* Related Goals */}
              <div className="space-y-2">
                <h3 className="font-semibold">Related Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => (
                    <label key={goal.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(goal.id!)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGoals([...selectedGoals, goal.id!])
                          } else {
                            setSelectedGoals(selectedGoals.filter(id => id !== goal.id))
                          }
                        }}
                        className="form-checkbox"
                      />
                      <span>{goal.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none space-y-6">
              {/* Display category-specific data */}
              {entry.metadata?.type === 'mood-feelings' && (
                <>
                  {entry.metadata?.moodLevel && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Mood Level</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${entry.metadata.moodLevel}%` }}
                          ></div>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          {getMoodEmoji(entry.metadata.moodLevel)}
                          {entry.metadata.moodLevel}%
                        </span>
                      </div>
                    </div>
                  )}

                  {entry.metadata?.primaryEmotion && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Primary Emotion</h3>
                      <p>{entry.metadata.primaryEmotion}</p>
                    </div>
                  )}

                  {entry.metadata?.triggers && (
                    <div className="space-y-2">
                      <h3 className="font-medium">What triggered these feelings?</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.triggers}</p>
                    </div>
                  )}

                  {entry.metadata?.physical && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Physical Sensations</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.physical}</p>
                    </div>
                  )}

                  {entry.metadata?.healthyResponse && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Did you respond to your emotions in a healthy way?</h3>
                      <p className="capitalize">{entry.metadata.healthyResponse}</p>
                    </div>
                  )}

                  {entry.metadata?.reflection && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Reflection</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.reflection}</p>
                    </div>
                  )}
                </>
              )}

              {entry.metadata?.type === 'future-visioning' && (
                <>
                  {entry.metadata?.timeframe && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Timeframe</h3>
                      <p>
                        {entry.metadata.timeframe === "1-year" && "1 Year"}
                        {entry.metadata.timeframe === "3-years" && "3 Years"}
                        {entry.metadata.timeframe === "5-years" && "5 Years"}
                        {entry.metadata.timeframe === "10-years" && "10 Years"}
                        {entry.metadata.timeframe === "lifetime" && "Lifetime"}
                      </p>
                    </div>
                  )}

                  {entry.metadata?.lifeArea && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Life Area</h3>
                      <p className="capitalize">{entry.metadata.lifeArea}</p>
                    </div>
                  )}

                  {entry.metadata?.visionDescription && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Vision Description</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.visionDescription}</p>
                    </div>
                  )}

                  {entry.metadata?.actionSteps && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Action Steps</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.actionSteps}</p>
                    </div>
                  )}

                  {entry.metadata?.obstacles && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Potential Obstacles</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.obstacles}</p>
                    </div>
                  )}

                  {entry.metadata?.supportNeeded && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Support Needed</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.supportNeeded}</p>
                    </div>
                  )}
                </>
              )}

              {entry.metadata?.type === 'gratitude-reflection' && (
                <>
                  {entry.metadata?.gratitudePoints && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Three things I'm grateful for today</h3>
                      <div className="space-y-3">
                        {Array.isArray(entry.metadata.gratitudePoints) 
                          ? entry.metadata.gratitudePoints.map((point: string, index: number) => (
                              <div key={index} className="space-y-2">
                                <p>{point}</p>
                              </div>
                            ))
                          : (entry.metadata.gratitudePoints || '').split('\n\n').filter(Boolean).map((point: string, index: number) => (
                              <div key={index} className="space-y-2">
                                <p>{point}</p>
                              </div>
                            ))
                        }
                      </div>
                    </div>
                  )}

                  {entry.metadata?.highlight && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Highlight of the day</h3>
                      <p>{entry.metadata.highlight}</p>
                    </div>
                  )}

                  {entry.metadata?.learnings && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Lessons & Insights</h3>
                      <p>{entry.metadata.learnings}</p>
                    </div>
                  )}

                  {entry.metadata?.nextSteps && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Reflection on Growth</h3>
                      <p>{entry.metadata.nextSteps}</p>
                    </div>
                  )}
                </>
              )}

              {entry.metadata?.type === 'daily-checkins' && (
                <>
                  {entry.metadata?.energyLevel !== undefined && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Energy Level</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${entry.metadata.energyLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{entry.metadata.energyLevel}%</span>
                      </div>
                    </div>
                  )}

                  {entry.metadata?.overallMood !== undefined && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Overall Mood</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${entry.metadata.overallMood}%` }}
                          ></div>
                        </div>
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          {entry.metadata.overallMood < 33 ? "😢" : entry.metadata.overallMood < 66 ? "😐" : "😊"}
                          {entry.metadata.overallMood}%
                        </span>
                      </div>
                    </div>
                  )}

                  {entry.metadata?.todaysIntention && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Today's Intention</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.todaysIntention}</p>
                    </div>
                  )}

                  {entry.metadata?.dayReflection && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Day Reflection</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.dayReflection}</p>
                    </div>
                  )}

                  {entry.metadata?.bestPartOfDay && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Best Part of Today</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.bestPartOfDay}</p>
                    </div>
                  )}

                  {entry.metadata?.biggestChallenge && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Biggest Challenge</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.biggestChallenge}</p>
                    </div>
                  )}

                  {entry.metadata?.todaysWins && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Today's Wins (Big or Small)</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.todaysWins}</p>
                    </div>
                  )}

                  {entry.metadata?.gratitude && (
                    <div className="space-y-2">
                      <h3 className="font-medium">One Thing I'm Grateful For</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.gratitude}</p>
                    </div>
                  )}

                  {entry.metadata?.focusForTomorrow && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Focus for Tomorrow</h3>
                      <p className="whitespace-pre-wrap">{entry.metadata.focusForTomorrow}</p>
                    </div>
                  )}
                </>
              )}

              {/* Display main content */}
              <div className="space-y-2">
                <h3 className="font-medium">Journal Entry</h3>
                <p className="whitespace-pre-wrap">{entry.content || ""}</p>
              </div>

              {entry.relatedGoals && entry.relatedGoals.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Related Goals:</h3>
                  <ul className="list-disc list-inside">
                    {entry.relatedGoals.map(goalId => {
                      const goal = goals.find(g => g.id === goalId)
                      return goal ? (
                        <li key={goalId}>{goal.title}</li>
                      ) : null
                    })}
                  </ul>
                </div>
              )}

              {entry.timeSpent && (
                <div className="text-sm text-gray-600">
                  Time spent: {entry.timeSpent} minutes
                </div>
              )}
            </div>
          )}
        </CardContent>

        {entry.tags && entry.tags.length > 0 && (
          <CardFooter>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

