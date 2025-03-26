"use client"

import { useState } from "react"
import { Trophy, Calendar, CheckCircle2, XCircle } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function ChallengesStreaksForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [challengeType, setChallengeType] = useState("fitness")
  const [currentDay, setCurrentDay] = useState(1)
  const [totalDays, setTotalDays] = useState(30)
  const [completed, setCompleted] = useState(true)

  // Calculate progress percentage
  const progressPercentage = (currentDay / totalDays) * 100

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
        <Label htmlFor="challengeType">Challenge Type</Label>
        <Select value={challengeType} onValueChange={setChallengeType}>
          <SelectTrigger id="challengeType">
            <SelectValue placeholder="Select challenge type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="creativity">Creativity</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="challengeName">Challenge Name</Label>
        <Input 
          id="challengeName" 
          name="challengeName"
          placeholder="e.g., 30-Day Meditation Challenge, Couch to 5K" 
        />
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Challenge Progress</h3>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Day {currentDay} of {totalDays}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>0%</span>
              <span>{Math.round(progressPercentage)}%</span>
              <span>100%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentDay">Current Day</Label>
              <Input
                id="currentDay"
                name="currentDay"
                type="number"
                min="1"
                max={totalDays}
                value={currentDay}
                onChange={(e) => setCurrentDay(Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalDays">Total Days</Label>
              <Input
                id="totalDays"
                name="totalDays"
                type="number"
                min="1"
                value={totalDays}
                onChange={(e) => setTotalDays(Number.parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Today's Status:</Label>
            <div className="flex gap-4">
              <div
                className={`flex items-center gap-1 cursor-pointer ${completed ? "text-green-500 font-medium" : "text-muted-foreground"}`}
                onClick={() => setCompleted(true)}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Completed</span>
              </div>
              <div
                className={`flex items-center gap-1 cursor-pointer ${!completed ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                onClick={() => setCompleted(false)}
              >
                <XCircle className="h-5 w-5" />
                <span>Missed</span>
              </div>
            </div>
            <input type="hidden" name="completed" value={completed.toString()} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Label htmlFor="todayActivity">Today's Activity</Label>
        <Textarea
          id="todayActivity"
          name="todayActivity"
          placeholder="What did you do for your challenge today? How did it go?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="difficulties">Difficulties & Obstacles</Label>
        <Textarea
          id="difficulties"
          name="difficulties"
          placeholder="What challenges did you face today? How did you overcome them (or how will you address them tomorrow)?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="learnings">Insights & Learnings</Label>
        <Textarea
          id="learnings"
          name="learnings"
          placeholder="What have you learned so far from this challenge? How are you growing?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="tomorrowPlan">Plan for Tomorrow</Label>
        <Textarea
          id="tomorrowPlan"
          name="tomorrowPlan"
          placeholder="What's your plan for tomorrow's challenge? How will you prepare for success?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

