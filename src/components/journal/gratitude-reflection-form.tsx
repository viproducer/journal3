"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Star, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getCategoryStyles } from "@/lib/constants"

interface GratitudeReflectionFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
}

export default function GratitudeReflectionForm({ onSubmit }: GratitudeReflectionFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [gratitudePoints, setGratitudePoints] = useState(["", "", ""])
  const [highlight, setHighlight] = useState("")
  const [learnings, setLearnings] = useState("")
  const [nextSteps, setNextSteps] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categoryStyles = getCategoryStyles('gratitude-reflection')

  const updateGratitudePoint = (index: number, value: string) => {
    const newPoints = [...gratitudePoints]
    newPoints[index] = value
    setGratitudePoints(newPoints)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Add metadata to form data
      const metadata = {
        category: 'gratitude-reflection',
        type: 'gratitude-reflection',
        title,
        gratitudePoints,
        highlight,
        learnings,
        nextSteps
      }

      formData.set('category', 'gratitude-reflection')
      formData.set('type', 'gratitude-reflection')
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`rounded-full p-2 ${categoryStyles.bgColorLight} ${categoryStyles.color}`}>
              {React.createElement(categoryStyles.icon, { className: "h-5 w-5" })}
            </div>
            <div>
              <CardTitle>{categoryStyles.name}</CardTitle>
              <CardDescription>
                Practice gratitude and reflect on your experiences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <input type="hidden" name="category" value="gratitude-reflection" />
          <input type="hidden" name="type" value="gratitude-reflection" />

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

