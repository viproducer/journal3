"use client"

import { useState } from "react"
import { Sun, Moon, Star, ArrowUp, ArrowDown, Save } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TagInput } from "@/components/ui/tag-input"

interface DailyCheckinsFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
}

export default function DailyCheckinsForm({ onSubmit }: DailyCheckinsFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [morningEnergy, setMorningEnergy] = useState([50])
  const [eveningMood, setEveningMood] = useState([50])
  const [todaysIntention, setTodaysIntention] = useState("")
  const [dayReflection, setDayReflection] = useState("")
  const [bestPartOfDay, setBestPartOfDay] = useState("")
  const [biggestChallenge, setBiggestChallenge] = useState("")
  const [todaysWins, setTodaysWins] = useState("")
  const [gratitude, setGratitude] = useState("")
  const [focusForTomorrow, setFocusForTomorrow] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Add metadata to form data
      const metadata = {
        category: 'daily-checkins',
        type: 'daily-checkins',
        morningEnergy: morningEnergy[0],
        eveningMood: eveningMood[0],
        todaysIntention,
        dayReflection,
        bestPartOfDay,
        biggestChallenge,
        todaysWins,
        gratitude,
        focusForTomorrow,
        title,
        tags
      }

      formData.set('category', 'daily-checkins')
      formData.set('type', 'daily-checkins')
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
          <CardTitle>Daily Check-ins</CardTitle>
          <CardDescription>
            Track your daily energy, mood, and reflections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input type="hidden" name="category" value="daily-checkins" />
          <input type="hidden" name="type" value="daily-checkins" />

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
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-medium">Morning Check-in</h3>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="todaysIntention">Today's Intention</Label>
                  <Textarea
                    id="todaysIntention"
                    name="todaysIntention"
                    value={todaysIntention}
                    onChange={(e) => setTodaysIntention(e.target.value)}
                    placeholder="What do you intend to focus on or accomplish today?"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="energyLevel">Energy Level</Label>
                  <input type="hidden" name="energyLevel" value={morningEnergy[0]} />
                  <Slider value={morningEnergy} onValueChange={setMorningEnergy} max={100} step={1} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-medium">Evening Check-in</h3>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="dayReflection">Day Reflection</Label>
                  <Textarea
                    id="dayReflection"
                    name="dayReflection"
                    value={dayReflection}
                    onChange={(e) => setDayReflection(e.target.value)}
                    placeholder="How did your day go? Did you accomplish what you intended?"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="overallMood">Overall Mood</Label>
                  <input type="hidden" name="overallMood" value={eveningMood[0]} />
                  <Slider value={eveningMood} onValueChange={setEveningMood} max={100} step={1} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>😢</span>
                    <span>😐</span>
                    <span>😊</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium">Day Highlights</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="bestPartOfDay">Best Part of Today</Label>
              <Textarea
                id="bestPartOfDay"
                name="bestPartOfDay"
                value={bestPartOfDay}
                onChange={(e) => setBestPartOfDay(e.target.value)}
                placeholder="What was the highlight of your day? What made you smile?"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="biggestChallenge">Biggest Challenge</Label>
              <Textarea
                id="biggestChallenge"
                name="biggestChallenge"
                value={biggestChallenge}
                onChange={(e) => setBiggestChallenge(e.target.value)}
                placeholder="What was challenging today? How did you handle it?"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Wins & Gratitude</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="todaysWins">Today's Wins (Big or Small)</Label>
              <Textarea
                id="todaysWins"
                name="todaysWins"
                value={todaysWins}
                onChange={(e) => setTodaysWins(e.target.value)}
                placeholder="What went well today? What are you proud of accomplishing?"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="gratitude">One Thing I'm Grateful For</Label>
              <Textarea 
                id="gratitude" 
                name="gratitude"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="What are you thankful for today?" 
                className="min-h-[80px]" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Looking Forward</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="focusForTomorrow">Focus for Tomorrow</Label>
              <Textarea
                id="focusForTomorrow"
                name="focusForTomorrow"
                value={focusForTomorrow}
                onChange={(e) => setFocusForTomorrow(e.target.value)}
                placeholder="What do you want to focus on or accomplish tomorrow?"
                className="min-h-[100px]"
              />
            </div>
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

