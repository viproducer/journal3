"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth"
import { getUserGoals } from "@/lib/firebase/goals"
import type { Goal } from "@/lib/firebase/types"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TagInput } from "@/components/ui/tag-input"

type TrackingType = "habit" | "fitness" | "nutrition" | "sleep" | "mood" | "finance" | "productivity" | "custom"

interface Metric {
  name: string
  value: string
  unit: string
  unitType: string
  unitSystem: "metric" | "imperial"
  secondaryValue?: string
  secondaryUnit?: string
  notes?: string
}

interface TargetProgress {
  targetId: string
  value: string
  secondaryValue: string
  notes: string
}

interface TrackingLogsFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
}

export default function TrackingLogsForm({ onSubmit }: TrackingLogsFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [trackingType, setTrackingType] = useState<TrackingType>("habit")
  const [isGoalTracking, setIsGoalTracking] = useState(false)
  const [linkedGoalId, setLinkedGoalId] = useState("")
  const [goals, setGoals] = useState<Goal[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([{
    name: "",
    value: "",
    unit: "",
    unitType: "",
    unitSystem: "metric",
    secondaryValue: "",
    secondaryUnit: "",
    notes: ""
  }])
  const [targetProgress, setTargetProgress] = useState<TargetProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (user?.uid) {
      loadGoals()
    }
  }, [user?.uid])

  const loadGoals = async () => {
    if (!user?.uid) return
    try {
      setIsLoading(true)
      setError(null)
      const userGoals = await getUserGoals(user.uid)
      setGoals(userGoals)
    } catch (error) {
      console.error("Error loading goals:", error)
      setError("Failed to load goals. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedGoal = goals.find(goal => goal.id === linkedGoalId)

  const addMetric = () => {
    setMetrics([...metrics, { 
      name: "", 
      value: "", 
      unit: "", 
      unitType: "count",
      unitSystem: "metric",
      secondaryValue: "", 
      secondaryUnit: "", 
      notes: "" 
    }])
  }

  const removeMetric = (index: number) => {
    const newMetrics = [...metrics]
    newMetrics.splice(index, 1)
    setMetrics(newMetrics)
  }

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...metrics]
    newMetrics[index] = {
      ...newMetrics[index],
      [field]: value
    }
    setMetrics(newMetrics)
  }

  const updateTargetProgress = (targetId: string, field: keyof TargetProgress, value: string) => {
    setTargetProgress(prev => {
      const existing = prev.find(p => p.targetId === targetId)
      if (existing) {
        return prev.map(p => p.targetId === targetId ? { ...p, [field]: value } : p)
      }
      return [...prev, { targetId, value: "", secondaryValue: "", notes: "" }]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Add metadata to form data
      const metadata = {
        category: 'tracking-logs',
        type: 'tracking-logs',
        title,
        trackingType,
        isGoalTracking,
        linkedGoalId,
        metrics,
        targetProgress,
        tags
      }

      formData.set('category', 'tracking-logs')
      formData.set('type', 'tracking-logs')
      formData.set('metadata', JSON.stringify(metadata))

      if (onSubmit) {
        await onSubmit(formData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Tracking & Logs</CardTitle>
          <CardDescription>
            Track your daily activities, habits, and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="content">Journal Entry</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts and feelings here..."
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-3">
            <Label>Tracking Type</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="standalone"
                  name="trackingType"
                  value="standalone"
                  checked={!isGoalTracking}
                  onChange={() => setIsGoalTracking(false)}
                  className="h-4 w-4"
                />
                <Label htmlFor="standalone">Standalone Tracking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="goalTracking"
                  name="trackingType"
                  value="goalTracking"
                  checked={isGoalTracking}
                  onChange={() => setIsGoalTracking(true)}
                  className="h-4 w-4"
                />
                <Label htmlFor="goalTracking">Goal Progress Tracking</Label>
              </div>
            </div>
          </div>

          {isGoalTracking ? (
            <div className="space-y-3">
              <Label htmlFor="linkedGoal">Select Goal to Track</Label>
              <Select value={linkedGoalId} onValueChange={setLinkedGoalId}>
                <SelectTrigger id="linkedGoal">
                  <SelectValue placeholder={isLoading ? "Loading goals..." : "Select a goal to track"} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading goals...</SelectItem>
                  ) : error ? (
                    <SelectItem value="error" disabled className="text-red-500">{error}</SelectItem>
                  ) : goals.length === 0 ? (
                    <SelectItem value="empty" disabled>No goals found</SelectItem>
                  ) : (
                    goals.map((goal) => (
                      <SelectItem key={goal.id || ''} value={goal.id || ''}>
                        {goal.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedGoal && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <h3 className="font-medium">{selectedGoal.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedGoal.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Progress Updates</Label>
                    {selectedGoal.targets?.map((target) => (
                      <div key={target.name} className="space-y-4 border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{target.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            Target: {target.value} {target.unit} per {target.period}
                            {target.secondaryValue && ` (${target.secondaryValue} ${target.secondaryUnit})`}
                          </span>
                        </div>

                        {/* First Row: Current Value, Secondary Value */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor={`progress_${target.name}`}>Current Value</Label>
                            <Input
                              id={`progress_${target.name}`}
                              name={`progress_${target.name}`}
                              type="number"
                              placeholder={`Enter value in ${target.unit}`}
                              value={targetProgress.find(p => p.targetId === target.name)?.value || ""}
                              onChange={(e) => updateTargetProgress(target.name, "value", e.target.value)}
                            />
                          </div>
                          {target.secondaryValue && (
                            <div className="space-y-1">
                              <Label htmlFor={`secondary_progress_${target.name}`}>Secondary Value</Label>
                              <Input
                                id={`secondary_progress_${target.name}`}
                                name={`secondary_progress_${target.name}`}
                                type="number"
                                placeholder={`Enter value in ${target.secondaryUnit || ""}`}
                                value={targetProgress.find(p => p.targetId === target.name)?.secondaryValue || ""}
                                onChange={(e) => updateTargetProgress(target.name, "secondaryValue", e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        {/* Second Row: Notes */}
                        <div className="space-y-1">
                          <Label htmlFor={`notes_${target.name}`}>Notes</Label>
                          <Textarea
                            id={`notes_${target.name}`}
                            name={`notes_${target.name}`}
                            placeholder="Add notes about your progress"
                            value={targetProgress.find(p => p.targetId === target.name)?.notes || ""}
                            onChange={(e) => updateTargetProgress(target.name, "notes", e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Progress</Label>
                            <span className="text-sm text-muted-foreground">
                              {target.currentValue} / {target.value} {target.unit}
                            </span>
                          </div>
                          <Progress 
                            value={(Number(target.currentValue) / Number(target.value)) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Overall Progress</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedGoal.progress} className="flex-1" />
                      <span className="text-sm">{selectedGoal.progress}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Metric {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMetric(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label>Metric Name</Label>
                      <Input
                        value={metric.name}
                        onChange={(e) => updateMetric(index, "name", e.target.value)}
                        placeholder="e.g., Steps, Water Intake"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Value</Label>
                        <Input
                          type="number"
                          value={metric.value}
                          onChange={(e) => updateMetric(index, "value", e.target.value)}
                          placeholder="Enter value"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Unit Type</Label>
                        <Select 
                          value={metric.unitType} 
                          onValueChange={(value) => updateMetric(index, "unitType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="distance">Distance</SelectItem>
                            <SelectItem value="time">Time</SelectItem>
                            <SelectItem value="weight">Weight</SelectItem>
                            <SelectItem value="volume">Volume</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="money">Money</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Unit</Label>
                        <Input
                          value={metric.unit}
                          onChange={(e) => updateMetric(index, "unit", e.target.value)}
                          placeholder="e.g., steps, ml"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Unit System</Label>
                        <Select 
                          value={metric.unitSystem} 
                          onValueChange={(value: "metric" | "imperial") => updateMetric(index, "unitSystem", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metric">Metric</SelectItem>
                            <SelectItem value="imperial">Imperial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Secondary Value (Optional)</Label>
                        <Input
                          type="number"
                          value={metric.secondaryValue || ""}
                          onChange={(e) => updateMetric(index, "secondaryValue", e.target.value)}
                          placeholder="Enter secondary value"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Secondary Unit (Optional)</Label>
                        <Input
                          value={metric.secondaryUnit || ""}
                          onChange={(e) => updateMetric(index, "secondaryUnit", e.target.value)}
                          placeholder="e.g., calories, minutes"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Notes (Optional)</Label>
                      <Input
                        value={metric.notes || ""}
                        onChange={(e) => updateMetric(index, "notes", e.target.value)}
                        placeholder="Add notes about this metric"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addMetric}>
                <Plus className="h-4 w-4 mr-2" />
                Add Metric
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

