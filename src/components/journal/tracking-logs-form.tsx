"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth"
import { getUserGoals } from "@/lib/firebase/goals"
import type { Goal } from "@/lib/firebase/types"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

type TrackingType = "habit" | "fitness" | "nutrition" | "sleep" | "mood" | "finance" | "productivity" | "custom"

interface Metric {
  name: string
  value: string
  unit: string
}

interface TargetProgress {
  targetId: string
  value: string
  secondaryValue: string
  notes: string
}

export default function TrackingLogsForm() {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [trackingType, setTrackingType] = useState<TrackingType>("habit")
  const [isGoalTracking, setIsGoalTracking] = useState(false)
  const [linkedGoalId, setLinkedGoalId] = useState("")
  const [goals, setGoals] = useState<Goal[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([{ name: "", value: "", unit: "" }])
  const [targetProgress, setTargetProgress] = useState<TargetProgress[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setMetrics([...metrics, { name: "", value: "", unit: "" }])
  }

  const removeMetric = (index: number) => {
    const newMetrics = [...metrics]
    newMetrics.splice(index, 1)
    setMetrics(newMetrics)
  }

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...metrics]
    newMetrics[index][field] = value
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

    try {
      const entryData = {
        title,
        content,
        trackingType,
        isGoalTracking,
        linkedGoalId,
        metrics: isGoalTracking ? [] : metrics,
        targetProgress: isGoalTracking ? targetProgress : [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // TODO: Save entry to database
      console.log("Entry data:", entryData)
    } catch (error) {
      console.error("Error saving entry:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          placeholder="Write your thoughts and reflections here..."
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
                  <div key={target.name} className="space-y-2 p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{target.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        Target: {target.value} {target.unit} per {target.period}
                        {target.secondaryValue && ` (${target.secondaryValue} ${target.secondaryUnit})`}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor={`progress_${target.name}`} className="text-xs">
                          Current Value
                        </Label>
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
                          <Label htmlFor={`secondary_progress_${target.name}`} className="text-xs">
                            Secondary Value
                          </Label>
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
                    <div className="space-y-1">
                      <Label htmlFor={`notes_${target.name}`} className="text-xs">
                        Notes
                      </Label>
                      <Input
                        id={`notes_${target.name}`}
                        name={`notes_${target.name}`}
                        placeholder="Add notes about your progress"
                        value={targetProgress.find(p => p.targetId === target.name)?.notes || ""}
                        onChange={(e) => updateTargetProgress(target.name, "notes", e.target.value)}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Metrics</Label>
            <Button type="button" variant="outline" size="sm" onClick={addMetric}>
              <Plus className="mr-1 h-3 w-3" /> Add Metric
            </Button>
          </div>

          <div className="space-y-3">
            {metrics.map((metric, index) => (
              <div key={index} className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`metricName${index}`} className="text-xs">
                    Name
                  </Label>
                  <Input
                    id={`metricName${index}`}
                    name={`metricName${index}`}
                    placeholder="e.g., Steps, Calories"
                    value={metric.name}
                    onChange={(e) => updateMetric(index, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`metricValue${index}`} className="text-xs">
                    Value
                  </Label>
                  <Input
                    id={`metricValue${index}`}
                    name={`metricValue${index}`}
                    type="number"
                    placeholder="Enter value"
                    value={metric.value}
                    onChange={(e) => updateMetric(index, "value", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`metricUnit${index}`} className="text-xs">
                    Unit
                  </Label>
                  <Input
                    id={`metricUnit${index}`}
                    name={`metricUnit${index}`}
                    placeholder="e.g., steps, kcal"
                    value={metric.unit}
                    onChange={(e) => updateMetric(index, "unit", e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetric(index)}
                  disabled={metrics.length === 1}
                  className="col-span-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit">Save Entry</Button>
    </form>
  )
}

