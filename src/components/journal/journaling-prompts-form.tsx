"use client"

import { useState } from "react"
import { HelpCircle, RefreshCw } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

type PromptCategory = "self-discovery" | "creativity" | "gratitude" | "reflection" | "growth"

type Prompts = {
  [K in PromptCategory]: string[]
}

export default function JournalingPromptsForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [promptCategory, setPromptCategory] = useState<PromptCategory>("self-discovery")
  const [currentPrompt, setCurrentPrompt] = useState("")

  // Sample prompts by category
  const prompts: Prompts = {
    "self-discovery": [
      "What are three things you value most about yourself and why?",
      "Describe a moment when you felt truly proud of yourself. What made it special?",
      "What limiting beliefs are holding you back, and how can you challenge them?",
      "If you could give advice to your younger self, what would you say?",
      "What does success mean to you, and how has that definition changed over time?",
    ],
    creativity: [
      "If you could create anything without limitations, what would it be?",
      "Write about a color and all the emotions and memories it evokes for you.",
      "Imagine your life as a movie. What would be the title, and who would play you?",
      "Describe your perfect day from start to finish in vivid detail.",
      "If you could have a conversation with any fictional character, who would it be and why?",
    ],
    gratitude: [
      "What unexpected blessing have you experienced recently?",
      "Write about someone who has positively influenced your life and why you're grateful for them.",
      "What simple pleasures in your daily routine are you thankful for?",
      "Describe a challenge you've faced that ultimately led to growth or positive change.",
      "What aspects of nature fill you with wonder and appreciation?",
    ],
    reflection: [
      "What has been your biggest lesson this month, and how will you apply it?",
      "Describe a mistake you made and what you learned from it.",
      "How have your priorities shifted over the past year?",
      "What patterns do you notice in your life that you'd like to change?",
      "Write about a time when your perspective completely changed on something important.",
    ],
    growth: [
      "What skill would you like to develop, and what steps can you take to learn it?",
      "Describe a fear you'd like to overcome. What small step could you take toward facing it?",
      "What does personal growth mean to you, and how do you measure it?",
      "Write about a time when you stepped outside your comfort zone. What happened?",
      "What habits would you like to build or break, and why?",
    ],
  }

  // Get a random prompt from the selected category
  const getRandomPrompt = () => {
    const categoryPrompts = prompts[promptCategory]
    const randomIndex = Math.floor(Math.random() * categoryPrompts.length)
    setCurrentPrompt(categoryPrompts[randomIndex])
  }

  // Set initial prompt when category changes
  const handleCategoryChange = (value: PromptCategory) => {
    setPromptCategory(value)
    const categoryPrompts = prompts[value]
    const randomIndex = Math.floor(Math.random() * categoryPrompts.length)
    setCurrentPrompt(categoryPrompts[randomIndex])
  }

  // Set initial prompt on first render
  if (!currentPrompt) {
    getRandomPrompt()
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
        <Label htmlFor="promptCategory">Prompt Category</Label>
        <Select value={promptCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger id="promptCategory">
            <SelectValue placeholder="Select prompt category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="self-discovery">Self-Discovery</SelectItem>
            <SelectItem value="creativity">Creativity</SelectItem>
            <SelectItem value="gratitude">Gratitude</SelectItem>
            <SelectItem value="reflection">Reflection</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-medium">Today's Prompt</h3>
              <p className="text-muted-foreground">{currentPrompt}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={getRandomPrompt} className="text-primary">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Label htmlFor="promptResponse">Your Response</Label>
        <Textarea
          id="promptResponse"
          name="promptResponse"
          placeholder="Write your response to the prompt..."
          className="min-h-[250px]"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="insights">Insights & Takeaways</Label>
        <Textarea
          id="insights"
          name="insights"
          placeholder="What insights or realizations did you have while responding to this prompt?"
          className="min-h-[100px]"
        />
      </div>
    </div>
  )
}

