"use client"

import { useState } from "react"
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

export default function MoodFeelingsForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [moodLevel, setMoodLevel] = useState([50])
  const [primaryEmotion, setPrimaryEmotion] = useState("")
  const [healthyResponse, setHealthyResponse] = useState<string>("yes")
  const [triggers, setTriggers] = useState("")
  const [physical, setPhysical] = useState("")
  const [reflection, setReflection] = useState("")

  const emotions = [
    "Happy",
    "Excited",
    "Grateful",
    "Content",
    "Calm",
    "Anxious",
    "Stressed",
    "Sad",
    "Angry",
    "Frustrated",
    "Overwhelmed",
    "Hopeful",
    "Proud",
    "Confused",
    "Tired",
  ]

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
          placeholder="Write your thoughts and feelings here..."
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-4">
        <Label>How are you feeling today?</Label>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Frown className="h-4 w-4" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <Meh className="h-4 w-4" />
              <span>Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <Smile className="h-4 w-4" />
              <span>High</span>
            </div>
          </div>
          <input type="hidden" name="mood_level" value={moodLevel[0]} />
          <Slider value={moodLevel} onValueChange={setMoodLevel} max={100} step={1} />
          <div className="text-center text-sm font-medium">Mood Level: {moodLevel}%</div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Primary emotion you're experiencing</Label>
        <div className="grid grid-cols-3 gap-2">
          {emotions.map((emotion) => (
            <div key={emotion} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`emotion-${emotion.toLowerCase().replace(/\s+/g, "-")}`}
                name="primary_emotion"
                value={emotion}
                checked={primaryEmotion === emotion}
                onChange={() => setPrimaryEmotion(emotion)}
                className="h-4 w-4"
              />
              <Label htmlFor={`emotion-${emotion.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm font-normal">
                {emotion}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="triggers">What triggered these feelings?</Label>
        <Textarea
          id="triggers"
          name="triggers"
          value={triggers}
          onChange={(e) => setTriggers(e.target.value)}
          placeholder="Describe what events or thoughts led to how you're feeling..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="physical">Physical sensations</Label>
        <Textarea
          id="physical"
          name="physical"
          value={physical}
          onChange={(e) => setPhysical(e.target.value)}
          placeholder="Describe any physical sensations you're experiencing (e.g., tension, fatigue, energy)..."
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label>Did you respond to your emotions in a healthy way?</Label>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="response-yes"
              name="healthy_response"
              value="yes"
              checked={healthyResponse === "yes"}
              onChange={() => setHealthyResponse("yes")}
              className="h-4 w-4"
            />
            <Label htmlFor="response-yes" className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" /> Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="response-no"
              name="healthy_response"
              value="no"
              checked={healthyResponse === "no"}
              onChange={() => setHealthyResponse("no")}
              className="h-4 w-4"
            />
            <Label htmlFor="response-no" className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4" /> No
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="reflection">Reflection</Label>
        <Textarea
          id="reflection"
          name="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What can you learn from these emotions? How might you respond differently next time?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

