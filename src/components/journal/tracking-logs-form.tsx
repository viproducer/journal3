"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TrackingType = "habit" | "fitness" | "nutrition" | "sleep" | "mood" | "finance" | "productivity" | "custom"

interface Metric {
  name: string
  value: string
  unit: string
}

export default function TrackingLogsForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [trackingType, setTrackingType] = useState<TrackingType>("habit")
  const [metrics, setMetrics] = useState<Metric[]>([{ name: "", value: "", unit: "" }])

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
        <Label htmlFor="trackingType">What are you tracking?</Label>
        <Select value={trackingType} onValueChange={(value: TrackingType) => setTrackingType(value)}>
          <SelectTrigger id="trackingType">
            <SelectValue placeholder="Select what you're tracking" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="habit">Habit</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="nutrition">Nutrition</SelectItem>
            <SelectItem value="sleep">Sleep</SelectItem>
            <SelectItem value="mood">Mood</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Metrics</Label>
          <Button type="button" variant="outline" size="sm" onClick={addMetric}>
            <Plus className="mr-1 h-3 w-3" /> Add Metric
          </Button>
        </div>

        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <Label htmlFor={`metricName${index}`} className="text-xs">
                  Name
                </Label>
                <Input
                  id={`metricName${index}`}
                  name={`metricName${index}`}
                  placeholder="e.g., Steps, Weight, Hours"
                  value={metric.name}
                  onChange={(e) => updateMetric(index, "name", e.target.value)}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label htmlFor={`metricValue${index}`} className="text-xs">
                  Value
                </Label>
                <Input
                  id={`metricValue${index}`}
                  name={`metricValue${index}`}
                  placeholder="e.g., 10000, 68.5, 8"
                  value={metric.value}
                  onChange={(e) => updateMetric(index, "value", e.target.value)}
                />
              </div>
              <div className="space-y-1 w-20">
                <Label htmlFor={`metricUnit${index}`} className="text-xs">
                  Unit
                </Label>
                <Input
                  id={`metricUnit${index}`}
                  name={`metricUnit${index}`}
                  placeholder="e.g., steps, kg, hrs"
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
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Add any additional notes about today's tracking..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="observations">Observations & Patterns</Label>
        <Textarea
          id="observations"
          name="observations"
          placeholder="Have you noticed any patterns or trends? What insights can you draw from your tracking?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

