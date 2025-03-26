"use client"

import { useState } from "react"
import { Target, Plus, Trash2, CheckCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Milestone {
  description: string
  completed: boolean
}

export default function GoalsIntentionsForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [goalCategory, setGoalCategory] = useState("personal")
  const [progress, setProgress] = useState(0)
  const [milestones, setMilestones] = useState<Milestone[]>([{ description: "", completed: false }])

  const addMilestone = () => {
    setMilestones([...milestones, { description: "", completed: false }])
  }

  const removeMilestone = (index: number) => {
    const newMilestones = [...milestones]
    newMilestones.splice(index, 1)
    setMilestones(newMilestones)
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string | boolean) => {
    const newMilestones = [...milestones]
    newMilestones[index][field] = value as never
    setMilestones(newMilestones)
  }

  return (
    <div className="space-y-6">
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
        <Label htmlFor="goalCategory">Goal Category</Label>
        <Select value={goalCategory} onValueChange={setGoalCategory}>
          <SelectTrigger id="goalCategory">
            <SelectValue placeholder="Select goal category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal Development</SelectItem>
            <SelectItem value="career">Career & Professional</SelectItem>
            <SelectItem value="health">Health & Fitness</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="relationships">Relationships</SelectItem>
            <SelectItem value="spiritual">Spiritual</SelectItem>
            <SelectItem value="educational">Educational</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="goalStatement">Goal Statement</Label>
        <Textarea
          id="goalStatement"
          name="goalStatement"
          placeholder="What specific goal are you working toward? Make it clear and measurable."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="goalWhy">Why This Matters</Label>
        <Textarea
          id="goalWhy"
          name="goalWhy"
          placeholder="Why is this goal important to you? How will achieving it improve your life?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label>Current Progress</Label>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>0%</span>
            <span>{progress}%</span>
            <span>100%</span>
          </div>
          <Input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number.parseInt(e.target.value))}
            className="w-full"
            name="progress"
          />
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Milestones</span>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
            <Plus className="mr-1 h-3 w-3" /> Add Milestone
          </Button>
        </div>

        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={milestone.completed ? "text-green-500" : "text-muted-foreground"}
                onClick={() => updateMilestone(index, "completed", !milestone.completed)}
              >
                <CheckCircle className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Milestone description"
                value={milestone.description}
                onChange={(e) => updateMilestone(index, "description", e.target.value)}
                className="flex-1"
                name={`milestone_${index}`}
              />
              <input
                type="hidden"
                name={`milestone_${index}_completed`}
                value={milestone.completed.toString()}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMilestone(index)}
                disabled={milestones.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="nextSteps">Next Steps</Label>
        <Textarea
          id="nextSteps"
          name="nextSteps"
          placeholder="What specific actions will you take next to move toward your goal?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

