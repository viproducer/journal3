"use client"

import { useState } from "react"
import { Target, Plus, Trash2, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth"
import { createGoal } from "@/lib/firebase/db"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UnitSystem = "metric" | "imperial"

interface Target {
  name: string
  value: string
  startValue: string
  unit: string
  period: string
  targetDate: string
  trackingType: 'period' | 'date'
  secondaryValue?: string
  secondaryUnit?: string
  unitSystem?: UnitSystem
}

interface Milestone {
  description: string
  completed: boolean
  targetValue?: string
}

interface UnitOption {
  value: string
  label: string
  system: UnitSystem
}

interface Goal {
  title: string
  description: string
  category: string
  type: string
  targets: Target[]
  progress: number
  goalStatement: string
  goalWhy: string
  nextSteps: string
  milestones: Milestone[]
  metadata: {
    category: string
    type: string
  }
}

interface GoalsIntentionsFormProps {
  onSubmit: (data: {
    content: string
    category: string
    type: string
    metadata: any
  }) => void
}

export default function GoalsIntentionsForm({ onSubmit }: GoalsIntentionsFormProps) {
  const { user } = useAuth()
  const [goalCategory, setGoalCategory] = useState("personal")
  const [goalType, setGoalType] = useState("")
  const [targets, setTargets] = useState<Target[]>([{ 
    name: "", 
    value: "", 
    startValue: "", 
    unit: "", 
    period: "",
    targetDate: new Date().toISOString().split('T')[0],
    trackingType: 'period' as const
  }])
  const [goalStatement, setGoalStatement] = useState("")
  const [goalWhy, setGoalWhy] = useState("")
  const [nextSteps, setNextSteps] = useState("")
  const [showMilestoneSetup, setShowMilestoneSetup] = useState(false)

  const goalTypes = {
    "health": ["Weight Loss", "Water Intake", "Sleep Quality", "Exercise"],
    "fitness": ["Walking", "Running", "Cycling", "Swimming", "Strength Training"],
    "creative": ["Writing", "Drawing", "Photography", "Music"],
    "financial": ["Savings", "Investments", "Budgeting"],
    "personal": ["Reading", "Learning", "Meditation", "Habits"],
    "other": ["Custom"]
  }

  const units = {
    "Weight Loss": {
      metric: "kg",
      imperial: "lbs"
    },
    "Water Intake": {
      metric: "ml",
      imperial: "fl oz"
    },
    "Sleep Quality": {
      metric: "hours",
      imperial: "hours"
    },
    "Exercise": {
      metric: "minutes",
      imperial: "minutes"
    },
    "Walking": {
      metric: "km",
      imperial: "miles"
    },
    "Running": {
      metric: "km",
      imperial: "miles"
    },
    "Cycling": {
      metric: "km",
      imperial: "miles"
    },
    "Swimming": {
      metric: "laps",
      imperial: "laps"
    },
    "Strength Training": {
      metric: "kg",
      imperial: "lbs"
    },
    "Writing": {
      metric: "words",
      imperial: "words"
    },
    "Drawing": {
      metric: "pieces",
      imperial: "pieces"
    },
    "Photography": {
      metric: "photos",
      imperial: "photos"
    },
    "Music": {
      metric: "songs",
      imperial: "songs"
    },
    "Savings": {
      metric: "currency",
      imperial: "currency"
    },
    "Investments": {
      metric: "currency",
      imperial: "currency"
    },
    "Budgeting": {
      metric: "currency",
      imperial: "currency"
    },
    "Reading": {
      metric: "pages",
      imperial: "pages"
    },
    "Learning": {
      metric: "hours",
      imperial: "hours"
    },
    "Meditation": {
      metric: "minutes",
      imperial: "minutes"
    },
    "Habits": {
      metric: "times",
      imperial: "times"
    },
    "Custom": {
      metric: "custom",
      imperial: "custom"
    }
  }

  const periods = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]

  const getUnitOptions = (goalType: string): UnitOption[] => {
    if (!goalType || goalType === "Custom") {
      return [{ value: "custom", label: "Custom", system: "metric" }]
    }

    const typeUnits = units[goalType as keyof typeof units]
    if (!typeUnits) {
      return [{ value: "custom", label: "Custom", system: "metric" }]
    }

    return [
      { value: typeUnits.metric, label: typeUnits.metric, system: "metric" },
      { value: typeUnits.imperial, label: typeUnits.imperial, system: "imperial" }
    ]
  }

  const addTarget = () => {
    setTargets([...targets, { 
      name: "", 
      value: "", 
      startValue: "", 
      unit: "", 
      period: "", 
      targetDate: new Date().toISOString().split('T')[0],
      trackingType: 'period' as const
    }])
  }

  const removeTarget = (index: number) => {
    const newTargets = [...targets]
    newTargets.splice(index, 1)
    setTargets(newTargets)
  }

  const updateTarget = (index: number, field: keyof Target, value: string | UnitSystem | 'period' | 'date') => {
    const newTargets = [...targets]
    if (field === "unitSystem") {
      newTargets[index][field] = value as UnitSystem
    } else if (field === "trackingType") {
      newTargets[index][field] = value as 'period' | 'date'
    } else {
      newTargets[index][field] = value as string
    }
    setTargets(newTargets)
  }

  const handleGoalTypeChange = (value: string) => {
    setGoalType(value)
    const defaultUnit = value === "Custom" ? "" : units[value as keyof typeof units]?.metric || ""
    setTargets([{ 
      name: "", 
      value: "", 
      startValue: "",
      unit: defaultUnit,
      period: "",
      targetDate: new Date().toISOString().split('T')[0],
      trackingType: 'period' as const,
      unitSystem: "metric" as UnitSystem
    }])
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      // Create metadata object with all the goal data
      const metadata = {
        userId: user.uid,
        title: goalStatement,
        description: goalStatement,
        category: 'goals-intentions',
        type: 'goals-intentions',
        goalCategory,
        goalType,
        goalStatement,
        goalWhy,
        nextSteps,
        targets: targets.map(target => ({
          name: target.name,
          value: target.value,
          startValue: target.startValue,
          unit: target.unit,
          period: target.period,
          targetDate: target.targetDate,
          trackingType: target.trackingType
        })),
        progress: 0
      }

      // Call the parent's onSubmit handler with just the goal statement text as content
      onSubmit({
        content: goalStatement,
        category: 'goals-intentions',
        type: 'goals-intentions',
        metadata
      })

      // Reset form
      setGoalCategory("personal")
      setGoalType("")
      setTargets([{ 
        name: "", 
        value: "", 
        startValue: "", 
        unit: "", 
        period: "", 
        targetDate: new Date().toISOString().split('T')[0],
        trackingType: 'period'
      }])
      setGoalStatement("")
      setGoalWhy("")
      setNextSteps("")
      setShowMilestoneSetup(false)
    } catch (error) {
      console.error("Error preparing goal data:", error)
      alert("Failed to prepare goal data. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="goalCategory">Goal Category</Label>
          <Select value={goalCategory} onValueChange={setGoalCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(goalTypes).map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="goalType">Goal Type</Label>
          <Select value={goalType} onValueChange={handleGoalTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a goal type" />
            </SelectTrigger>
            <SelectContent>
              {goalTypes[goalCategory as keyof typeof goalTypes].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="goalStatement">Goal Statement</Label>
          <Textarea
            id="goalStatement"
            value={goalStatement}
            onChange={(e) => setGoalStatement(e.target.value)}
            placeholder="What do you want to achieve?"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="goalWhy">Why This Goal?</Label>
          <Textarea
            id="goalWhy"
            value={goalWhy}
            onChange={(e) => setGoalWhy(e.target.value)}
            placeholder="Why is this goal important to you?"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="nextSteps">Next Steps</Label>
          <Textarea
            id="nextSteps"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="What are your next steps to achieve this goal?"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label>Targets</Label>
          <div className="space-y-4">
            {targets.map((target, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Label>Target Name</Label>
                    <Input
                      placeholder="Target name"
                      value={target.name}
                      onChange={(e) => updateTarget(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Starting Value</Label>
                    <Input
                      type="number"
                      placeholder="Current value"
                      value={target.startValue}
                      onChange={(e) => updateTarget(index, "startValue", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      placeholder="Goal value"
                      value={target.value}
                      onChange={(e) => updateTarget(index, "value", e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Label>Unit</Label>
                    <Select 
                      value={target.unit} 
                      onValueChange={(value) => {
                        // Allow custom unit input if selected
                        if (value === "custom") {
                          const customUnit = prompt("Enter custom unit:")
                          if (customUnit) {
                            updateTarget(index, "unit", customUnit)
                          }
                        } else {
                          updateTarget(index, "unit", value)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add common units that make sense for any target */}
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="inches">Inches (in)</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>Tracking Type</Label>
                    <Select 
                      value={target.trackingType} 
                      onValueChange={(value: 'period' | 'date') => updateTarget(index, "trackingType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How to track?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="period">By Period</SelectItem>
                        <SelectItem value="date">By Target Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {target.trackingType === 'period' ? (
                    <div className="flex-1">
                      <Label>Period</Label>
                      <Select value={target.period} onValueChange={(value) => updateTarget(index, "period", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period} value={period}>
                              {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={target.targetDate}
                        onChange={(e) => updateTarget(index, "targetDate", e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTarget(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addTarget} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Target
            </Button>
          </div>
        </div>
      </div>

      <Button type="button" onClick={handleSubmit} className="w-full">
        Create Goal
      </Button>
    </div>
  )
}

