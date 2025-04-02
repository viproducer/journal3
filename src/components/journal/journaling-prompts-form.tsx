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
      "What are three things you value most about yourself and why?",
      "Describe a moment when you felt truly proud of yourself. What made it special?",
      "What limiting beliefs are holding you back, and how can you challenge them?",
      "If you could give advice to your younger self, what would you say?",
      "What does success mean to you, and how has that definition changed over time?",
      "What personal qualities do you admire in others and see in yourself?",
      "If money and time weren’t an issue, what would you pursue?",
      "Describe a moment when you felt completely at peace. What contributed to that feeling?",
      "What childhood interests or dreams have stayed with you? Why?",
      "What kind of legacy do you want to leave behind?",
      "If you could instantly master any skill, what would it be and why?",
      "What habits make you feel your best self?",
      "What is your greatest strength, and how has it helped you in life?",
      "Describe a time you surprised yourself.",
      "What emotions are you avoiding, and why?",
      "What does your ideal future self look like?",
      "What’s something you’ve recently learned about yourself?",
      "How do you define happiness in your own life?",
      "If you had to write a book about your life, what would the title be?",
      "What’s a part of your personality that you used to dislike but have now embraced?",
      "How do you typically react to challenges, and what does that say about you?",
      "What role does fear play in your life?",
      "What is your inner critic saying, and how can you reframe it?",
      "What inspires you to be a better person?",
      "Describe a time when you felt deeply understood.",
      "What core values guide your decisions?",
      "What is a belief you hold strongly that others might disagree with?",
      "How do you want to be remembered?",
      "What’s one thing you love about yourself today?",
      "If you could talk to your future self, what would you ask them?"
   
    ],
    creativity: [
      "If you could create anything without limitations, what would it be?",
      "Write about a color and all the emotions and memories it evokes for you.",
      "Imagine your life as a movie. What would be the title, and who would play you?",
      "Describe your perfect day from start to finish in vivid detail.",
      "If you could have a conversation with any fictional character, who would it be and why?",
      "If you could create anything without limitations, what would it be?",
      "Write about a color and all the emotions and memories it evokes for you.",
      "Imagine your life as a movie. What would be the title, and who would play you?",
      "Describe your perfect day from start to finish in vivid detail.",
      "If you could have a conversation with any fictional character, who would it be and why?",
      "If you could design a new holiday, what would it celebrate and how would people observe it?",
      "Write a short story about a random object in your room coming to life.",
      "Invent a new word and describe what it means and how it’s used.",
      "If your emotions were a landscape, what would it look like?",
      "Rewrite a memory from your life as if it were a fairytale or science fiction story.",
      "Describe a dream you once had that stuck with you.",
      "If you could rewrite the ending of any book or movie, what would you change?",
      "What song would be the soundtrack to your life right now?",
      "Write a letter to creativity itself.",
      "What’s the weirdest idea you’ve ever had?",
      "If you had to express yourself through a different art form, what would it be?",
      "What childhood game or toy do you wish you could play with again?",
      "If you had to describe yourself in five symbols, what would they be?",
      "Create a fictional character based on your personality traits.",
      "If you could time travel to any era, where would you go and why?",
      "Describe a world where colors have flavors and sounds have textures.",
      "What’s the most creative thing you’ve done recently?",
      "If your life was a novel, what genre would it be?",
      "What’s something ridiculous but fun you’d love to invent?",
      "Write about an imaginary place where you feel completely at home.",
      "If your pet or favorite animal could talk, what would they say?",
      "What’s a creative risk you’d love to take?",
      "Describe an alternate version of yourself living a totally different life.",
      "If you could collaborate on a project with any artist (living or dead), who would it be?",
      "What’s the most inspiring piece of art you’ve ever encountered?"
   
    ],
    gratitude: [
      "What unexpected blessing have you experienced recently?",
      "Write about someone who has positively influenced your life and why you're grateful for them.",
      "What simple pleasures in your daily routine are you thankful for?",
      "Describe a challenge you've faced that ultimately led to growth or positive change.",
      "What aspects of nature fill you with wonder and appreciation?",
      "What unexpected blessing have you experienced recently?",
      "Write about someone who has positively influenced your life and why you're grateful for them.",
      "What simple pleasures in your daily routine are you thankful for?",
      "Describe a challenge you've faced that ultimately led to growth or positive change.",
      "What aspects of nature fill you with wonder and appreciation?",
      "What past challenge are you now grateful for, and why?",
      "List five things you take for granted that someone else might appreciate deeply.",
      "What piece of music, book, or movie has brought you comfort or joy recently?",
      "Who in your life deserves more appreciation, and how can you show it?",
      "Describe a moment of kindness—given or received—that stuck with you.",
      "What’s a place that makes you feel grateful every time you visit?",
      "What’s something about your body that you’re grateful for?",
      "What lesson did you learn recently that you appreciate?",
      "What’s something in your daily life you didn’t always have but now appreciate?",
      "Who’s the most supportive person in your life, and how do they show it?",
      "What’s a past version of yourself that you’re grateful for?",
      "Write about a time when a stranger’s kindness surprised you.",
      "What’s a difficult experience that helped you grow?",
      "What’s something in your home that brings you joy?",
      "What’s a recent interaction that made you smile?",
      "What’s a talent or skill you’re grateful for?",
      "Write about a time when you felt truly at peace.",
      "What’s a small luxury that you enjoy regularly?",
      "Who has helped shape your values?",
      "What’s something you’ve accomplished that you’re proud of?",
      "Write about a time when you were grateful for patience.",
      "What’s something about your culture or background that you appreciate?",
      "How has technology positively impacted your life?",
      "What’s a moment of beauty you’ve experienced recently?",
      "How has gratitude improved your life over time?"
    
    ],
    reflection: [
      "What has been your biggest lesson this month, and how will you apply it?",
      "Describe a mistake you made and what you learned from it.",
      "How have your priorities shifted over the past year?",
      "What patterns do you notice in your life that you'd like to change?",
      "Write about a time when your perspective completely changed on something important.",
      "What has been your biggest lesson this month, and how will you apply it?",
      "Describe a mistake you made and what you learned from it.",
      "How have your priorities shifted over the past year?",
      "What patterns do you notice in your life that you'd like to change?",
      "Write about a time when your perspective completely changed on something important.",
      "What is one piece of advice you wish you had followed sooner?",
      "How have your relationships shaped the person you are today?",
      "What have you recently changed your mind about and why?",
      "What is something you once feared that no longer scares you?",
      "Describe a time when you had to make a difficult decision. How did you handle it?",
      "If you could relive one day differently, what would you change and why?",
      "What is one thing you wish you had done differently this past year?",
      "When was the last time you felt truly at peace? What contributed to that feeling?",
      "How do you handle conflict, and how could you improve?",
      "What’s something you’ve learned about yourself in the last six months?",
      "Reflect on a time when you felt misunderstood. What could you have done differently?",
      "What’s a memory that still teaches you something valuable today?",
      "How do you usually respond to failure? How would you like to respond?",
      "What qualities in others do you admire and want to develop in yourself?",
      "What’s one thing from your past that you’re still working to forgive?",
      "When was the last time you stepped out of your comfort zone? What did you learn?",
      "What’s a habit or behavior that no longer serves you?",
      "How have your strengths helped you overcome challenges?",
      "What’s one lesson you learned the hard way?",
      "If you could give your younger self one piece of wisdom, what would it be?",
      "How do you usually process your emotions? Is it effective?",
      "What’s a belief you used to hold but have since let go of?",
      "What’s one thing you’re currently struggling with, and how can you move forward?",
      "How do you define personal success, and has that definition changed?",
      "What’s something you’ve accomplished that you haven’t taken the time to celebrate?"
    
    ],
    growth: [
      "What skill would you like to develop, and what steps can you take to learn it?",
      "Describe a fear you'd like to overcome. What small step could you take toward facing it?",
      "What does personal growth mean to you, and how do you measure it?",
      "Write about a time when you stepped outside your comfort zone. What happened?",
      "What habits would you like to build or break, and why?",
      "What skill would you like to develop, and what steps can you take to learn it?",
      "Describe a fear you'd like to overcome. What small step could you take toward facing it?",
      "What does personal growth mean to you, and how do you measure it?",
      "Write about a time when you stepped outside your comfort zone. What happened?",
      "What habits would you like to build or break, and why?",
      "What’s one area of your life you’d like to improve?",
      "How do you handle criticism, and what can you learn from it?",
      "What’s one challenge you’ve faced that made you stronger?",
      "What’s something new you’ve tried recently? What was the experience like?",
      "How do you keep yourself motivated when working toward a goal?",
      "Who in your life inspires you to grow? Why?",
      "What’s one lesson you’ve learned from failure?",
      "What’s an obstacle that’s currently holding you back, and how can you tackle it?",
      "Describe a recent situation where you chose growth over comfort.",
      "How do you react to change? How can you embrace it more?",
      "What’s a quality you admire in others that you’d like to develop?",
      "What’s a goal you’ve been putting off? What’s stopping you from pursuing it?",
      "What’s a book, podcast, or video that has inspired your personal growth?",
      "How do you practice self-discipline in your daily life?",
      "What’s something you wish you had more patience for?",
      "How do you track your progress in personal development?",
      "What’s a past struggle that has turned into a strength?",
      "How can you better balance work, relationships, and self-care?",
      "What’s a belief about yourself that you’d like to change?",
      "What’s a new perspective you’ve recently gained?",
      "How do you push yourself to keep learning and evolving?",
      "What’s one way you can step out of your comfort zone this month?",
      "If you could develop a new habit overnight, what would it be and why?",
      "What’s something you’ve been afraid to ask for? How can you build confidence to do it?",
      "What advice would your future self give you about personal growth?"
   
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

