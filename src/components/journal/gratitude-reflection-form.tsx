"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function GratitudeReflectionForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [gratitudePoints, setGratitudePoints] = useState(["", "", ""])
  const [highlight, setHighlight] = useState("")
  const [learnings, setLearnings] = useState("")
  const [nextSteps, setNextSteps] = useState("")

  const updateGratitudePoint = (index: number, value: string) => {
    const newPoints = [...gratitudePoints]
    newPoints[index] = value
    setGratitudePoints(newPoints)
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
        <Label className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>Three things I'm grateful for today</span>
        </Label>
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-6">
              <Textarea
                placeholder="I'm grateful for..."
                name="gratitudePoints[0]"
                value={gratitudePoints[0]}
                onChange={(e) => updateGratitudePoint(0, e.target.value)}
                className="min-h-[80px] border-0 focus-visible:ring-0 p-0 placeholder:text-muted-foreground"
              />
              <div className="mt-2 text-xs text-muted-foreground">Why is this meaningful to you?</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Textarea
                placeholder="I'm grateful for..."
                name="gratitudePoints[1]"
                value={gratitudePoints[1]}
                onChange={(e) => updateGratitudePoint(1, e.target.value)}
                className="min-h-[80px] border-0 focus-visible:ring-0 p-0 placeholder:text-muted-foreground"
              />
              <div className="mt-2 text-xs text-muted-foreground">Why is this meaningful to you?</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Textarea
                placeholder="I'm grateful for..."
                name="gratitudePoints[2]"
                value={gratitudePoints[2]}
                onChange={(e) => updateGratitudePoint(2, e.target.value)}
                className="min-h-[80px] border-0 focus-visible:ring-0 p-0 placeholder:text-muted-foreground"
              />
              <div className="mt-2 text-xs text-muted-foreground">Why is this meaningful to you?</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="highlight">Highlight of the day</Label>
        <Textarea
          id="highlight"
          name="highlight"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          placeholder="What was the best moment of your day? What made it special?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="learnings">Lessons & Insights</Label>
        <Textarea
          id="learnings"
          name="learnings"
          value={learnings}
          onChange={(e) => setLearnings(e.target.value)}
          placeholder="What did you learn today? What insights or wisdom did you gain?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="nextSteps">Next Steps</Label>
        <Textarea
          id="nextSteps"
          name="nextSteps"
          value={nextSteps}
          onChange={(e) => setNextSteps(e.target.value)}
          placeholder="What actions will you take based on your reflections? How will you apply these insights?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

