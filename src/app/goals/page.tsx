"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/auth"
import { getUserGoals, createGoal, updateGoal, deleteGoal } from "@/lib/firebase/db"
import type { Goal } from "@/lib/firebase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const GOAL_CATEGORIES = [
  "Writing",
  "Reading",
  "Mindfulness",
  "Health",
  "Personal Growth",
  "Other"
]

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState(GOAL_CATEGORIES[0])
  const [target, setTarget] = useState("")
  const [unit, setUnit] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (!user) return

    const loadGoals = async () => {
      try {
        setLoading(true)
        const userGoals = await getUserGoals(user.uid)
        setGoals(userGoals)
      } catch (err) {
        console.error("Error loading goals:", err)
        setError("Failed to load goals")
      } finally {
        setLoading(false)
      }
    }

    loadGoals()
  }, [user])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory(GOAL_CATEGORIES[0])
    setTarget("")
    setUnit("")
    setEndDate("")
    setEditingGoal(null)
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      const goalData = {
        userId: user.uid,
        title,
        description,
        category,
        target: Number(target),
        current: 0,
        unit,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (editingGoal) {
        await updateGoal(user.uid, editingGoal.id!, {
          ...goalData,
          current: editingGoal.current
        })
        setGoals(goals.map(g => g.id === editingGoal.id ? { ...goalData, id: editingGoal.id, current: editingGoal.current } : g))
      } else {
        const newGoal = await createGoal(goalData)
        setGoals([newGoal, ...goals])
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error saving goal:", err)
      setError("Failed to save goal")
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description || "")
    setCategory(goal.category)
    setTarget(goal.target.toString())
    setUnit(goal.unit)
    setEndDate(goal.endDate ? goal.endDate.toISOString().split('T')[0] : "")
    setIsDialogOpen(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!user || !confirm("Are you sure you want to delete this goal?")) return

    try {
      await deleteGoal(user.uid, goalId)
      setGoals(goals.filter(g => g.id !== goalId))
    } catch (err) {
      console.error("Error deleting goal:", err)
      setError("Failed to delete goal")
    }
  }

  const handleProgressUpdate = async (goal: Goal, newCurrent: number) => {
    if (!user) return

    try {
      await updateGoal(user.uid, goal.id!, { current: newCurrent })
      setGoals(goals.map(g => g.id === goal.id ? { ...g, current: newCurrent } : g))
    } catch (err) {
      console.error("Error updating progress:", err)
      setError("Failed to update progress")
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

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
              <DialogDescription>
                Set a new goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter goal title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter goal description"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Enter target value"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., pages, hours"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription>{goal.category}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(goal)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(goal.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {goal.description && (
                <p className="mb-4 text-sm text-gray-600">{goal.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress: {goal.current} / {goal.target} {goal.unit}</span>
                  <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProgressUpdate(goal, Math.max(0, goal.current - 1))}
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProgressUpdate(goal, goal.current + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Started: {goal.startDate.toLocaleDateString()}</span>
                {goal.endDate && (
                  <span>Due: {goal.endDate.toLocaleDateString()}</span>
                )}
                <span className="capitalize">Status: {goal.status}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 