"use client"

import { useState } from "react"
import { Sun, Moon, Star, ArrowUp, ArrowDown } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function DailyCheckinsForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [morningEnergy, setMorningEnergy] = useState([50])
  const [eveningMood, setEveningMood] = useState([50])

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
            placeholder="What was the highlight of your day? What made you smile?"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="biggestChallenge">Biggest Challenge</Label>
          <Textarea
            id="biggestChallenge"
            name="biggestChallenge"
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
            placeholder="What went well today? What are you proud of accomplishing?"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="gratitude">One Thing I'm Grateful For</Label>
          <Textarea 
            id="gratitude" 
            name="gratitude"
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
            placeholder="What do you want to focus on or accomplish tomorrow?"
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  )
}

