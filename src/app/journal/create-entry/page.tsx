"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Edit3,
  Heart,
  BarChart2,
  Star,
  Target,
  Compass,
  HelpCircle,
  Sun,
  Zap,
  ArrowLeft,
  Scissors,
  Home,
  Droplet,
  ShoppingBag,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth"
import { createEntry, getUserJournals, createJournal } from "@/lib/firebase/db"
import { JournalEntry, Journal } from "@/lib/firebase/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import MoodFeelingsForm from "@/components/journal/mood-feelings-form"
import TrackingLogsForm from "@/components/journal/tracking-logs-form"
import GratitudeReflectionForm from "@/components/journal/gratitude-reflection-form"
import GoalsIntentionsForm from "@/components/journal/goals-intentions-form"
import FutureVisioningForm from "@/components/journal/future-visioning-form"
import JournalingPromptsForm from "@/components/journal/journaling-prompts-form"
import DailyCheckinsForm from "@/components/journal/daily-checkins-form"
import ChallengesStreaksForm from "@/components/journal/challenges-streaks-form"

export default function CreateEntryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("mood-feelings")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if there's a template query parameter
  const [searchParams, setSearchParams] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search)
    }
    return new URLSearchParams()
  })
  const templateParam = searchParams.get("template")

  // Marketplace templates the user has subscribed to
  const marketplaceTemplates = [
    {
      id: "curly-hair",
      name: "Wavy & Curly Hair Journal",
      icon: <Scissors className="h-5 w-5" />,
      description: "Track your hair care journey and product results",
      color: "bg-purple-500",
    },
    {
      id: "household-chores",
      name: "Household Chores Tracker",
      icon: <Home className="h-5 w-5" />,
      description: "Track who does what at home",
      color: "bg-green-500",
    },
    {
      id: "water-intake",
      name: "Daily Water Intake",
      icon: <Droplet className="h-5 w-5" />,
      description: "Track and improve your hydration",
      color: "bg-blue-500",
    },
  ]

  // If a template is specified in the URL, show it first
  useEffect(() => {
    if (templateParam) {
      // Set the selected category to match the template if it exists
      const matchingTemplate = marketplaceTemplates.find((t) => t.id === templateParam)
      if (matchingTemplate) {
        setSelectedCategory(`marketplace-${templateParam}`)
      }
    }
  }, [templateParam])

  const categories = [
    {
      id: "mood-feelings",
      name: "Mood & Feelings",
      icon: <Heart className="h-5 w-5" />,
      description: "Track emotions, moods, and feelings with reflection prompts.",
      component: <MoodFeelingsForm />,
    },
    {
      id: "tracking-logs",
      name: "Tracking & Logs",
      icon: <BarChart2 className="h-5 w-5" />,
      description: "Log and track habits, activities, and metrics with customizable fields.",
      component: <TrackingLogsForm />,
    },
    {
      id: "gratitude-reflection",
      name: "Gratitude & Reflection",
      icon: <Star className="h-5 w-5" />,
      description: "Practice gratitude and reflect on experiences with guided prompts.",
      component: <GratitudeReflectionForm />,
    },
    {
      id: "goals-intentions",
      name: "Goals & Intentions",
      icon: <Target className="h-5 w-5" />,
      description: "Set, track, and reflect on goals with progress tracking and milestone management.",
      component: <GoalsIntentionsForm />,
    },
    {
      id: "future-visioning",
      name: "Future Visioning",
      icon: <Compass className="h-5 w-5" />,
      description: "Envision and plan for your future across different life areas and timeframes.",
      component: <FutureVisioningForm />,
    },
    {
      id: "journaling-prompts",
      name: "Journaling Prompts",
      icon: <HelpCircle className="h-5 w-5" />,
      description: "Respond to thought-provoking prompts across different categories.",
      component: <JournalingPromptsForm />,
    },
    {
      id: "daily-checkins",
      name: "Daily Check-ins",
      icon: <Sun className="h-5 w-5" />,
      description: "Quick daily check-ins for morning and evening with mood and energy tracking.",
      component: <DailyCheckinsForm />,
    },
    {
      id: "challenges-streaks",
      name: "Challenges & Streaks",
      icon: <Zap className="h-5 w-5" />,
      description: "Track progress on challenges and streaks with day counting and reflection.",
      component: <ChallengesStreaksForm />,
    },
  ]

  const allCategories = [
    ...categories,
    ...marketplaceTemplates.map((template) => ({
      id: `marketplace-${template.id}`,
      name: template.name,
      icon: template.icon,
      description: template.description,
      component: (
        <Card className="border-2 border-dashed p-6 flex flex-col items-center justify-center text-center">
          <div className={`${template.color} text-white p-3 rounded-full mb-4`}>{template.icon}</div>
          <h3 className="text-lg font-medium mb-2">{template.name}</h3>
          <p className="text-muted-foreground mb-4">{template.description}</p>
          <Button asChild>
            <Link href={`/journal/templates/${template.id}`}>Open Template</Link>
          </Button>
        </Card>
      ),
    })),
  ]

  const selectedCategoryData = allCategories.find((category) => category.id === selectedCategory)

  const handleSubmit = async (formData: FormData) => {
    if (!user) {
      setError('You must be logged in to create an entry')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Get or create default journal
      const userJournals = await getUserJournals(user.uid)
      let journal = userJournals[0]

      if (!journal) {
        journal = await createJournal({
          userId: user.uid,
          name: 'My Journal',
          description: 'My personal journal',
          isActive: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            isPrivate: true,
            allowComments: false,
            allowSharing: false
          }
        })
      }

      // Collect form data based on the selected category
      const metadata: any = {
        type: selectedCategory || 'general',
        title: formData.get('title') as string
      }

      // Add category-specific data
      if (selectedCategory === 'mood-feelings') {
        metadata.moodLevel = Number(formData.get('mood_level')) || 50
        metadata.primaryEmotion = formData.get('primary_emotion') as string
        metadata.triggers = formData.get('triggers') as string
        metadata.physical = formData.get('physical') as string
        metadata.healthyResponse = formData.get('healthy_response') as string
        metadata.reflection = formData.get('reflection') as string
      } else if (selectedCategory === 'future-visioning') {
        metadata.timeframe = formData.get('timeframe') as string
        metadata.lifeArea = formData.get('lifeArea') as string
        metadata.title = formData.get('title') as string
        metadata.visionDescription = formData.get('visionDescription') as string
        metadata.actionSteps = formData.get('actionSteps') as string
        metadata.obstacles = formData.get('obstacles') as string
        metadata.supportNeeded = formData.get('supportNeeded') as string

        // Log the metadata for debugging
        console.log('Future Visioning Metadata:', metadata)
      } else if (selectedCategory === 'tracking-logs') {
        metadata.metrics = formData.get('metrics') as string
        metadata.notes = formData.get('notes') as string
        metadata.trends = formData.get('trends') as string
      } else if (selectedCategory === 'gratitude-reflection') {
        // Get all gratitude points as an array
        const gratitudePoints = [
          formData.get('gratitudePoints[0]') as string,
          formData.get('gratitudePoints[1]') as string,
          formData.get('gratitudePoints[2]') as string
        ].filter(point => point) // Remove any empty points
        
        metadata.gratitudePoints = gratitudePoints // Store as array instead of joining
        metadata.highlight = formData.get('highlight') as string
        metadata.learnings = formData.get('learnings') as string
        metadata.nextSteps = formData.get('nextSteps') as string

        // Log the metadata for debugging
        console.log('Gratitude Reflection Metadata:', metadata)
      } else if (selectedCategory === 'goals-intentions') {
        metadata.goal = formData.get('goal') as string
        metadata.progress = Number(formData.get('progress')) || 0
        metadata.milestones = formData.get('milestones') as string
        metadata.challenges = formData.get('challenges') as string
        metadata.nextActions = formData.get('next_actions') as string
      } else if (selectedCategory === 'journaling-prompts') {
        metadata.prompt = formData.get('prompt') as string
        metadata.response = formData.get('response') as string
        metadata.insights = formData.get('insights') as string
      } else if (selectedCategory === 'daily-checkins') {
        metadata.energyLevel = Number(formData.get('energyLevel')) || 50
        metadata.overallMood = Number(formData.get('overallMood')) || 50
        metadata.todaysIntention = formData.get('todaysIntention') as string
        metadata.dayReflection = formData.get('dayReflection') as string
        metadata.bestPartOfDay = formData.get('bestPartOfDay') as string
        metadata.biggestChallenge = formData.get('biggestChallenge') as string
        metadata.todaysWins = formData.get('todaysWins') as string
        metadata.gratitude = formData.get('gratitude') as string
        metadata.focusForTomorrow = formData.get('focusForTomorrow') as string

        // Log the metadata for debugging
        console.log('Daily Check-in Metadata:', metadata)
      } else if (selectedCategory === 'challenges-streaks') {
        metadata.challenge = formData.get('challenge') as string
        metadata.currentStreak = Number(formData.get('current_streak')) || 0
        metadata.longestStreak = Number(formData.get('longest_streak')) || 0
        metadata.progress = formData.get('progress') as string
        metadata.obstacles = formData.get('obstacles') as string
        metadata.strategies = formData.get('strategies') as string
      }

      const entryData: Omit<JournalEntry, 'id'> = {
        userId: user.uid,
        journalId: journal.id || '',
        content: formData.get('content') as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata
      }

      await createEntry(entryData)
      router.push('/journal/browse')
    } catch (err) {
      console.error('Error creating entry:', err)
      setError('Failed to create entry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Edit3 className="h-5 w-5" />
          <span>JournalMind</span>
        </Link>
        <nav className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/journal">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/journal/browse">Journal</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/affirmations">Affirmations</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">Marketplace</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <Button variant="ghost" size="sm" className="mb-2" asChild>
              <Link href="/journal/browse" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Journal
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Create New Journal Entry</h1>
            <p className="text-muted-foreground">
              Select a journal category to customize your entry for different purposes
            </p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              {categories.slice(0, 8).map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  {category.icon}
                  <span className="truncate">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {marketplaceTemplates.length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-6 mb-3">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Your Marketplace Journals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {marketplaceTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer hover:border-primary transition-colors ${selectedCategory === `marketplace-${template.id}` ? "border-primary" : ""}`}
                      onClick={() => setSelectedCategory(`marketplace-${template.id}`)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`${template.color} text-white p-2 rounded-full`}>{template.icon}</div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Tabs>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {selectedCategoryData?.icon}
                <CardTitle>{selectedCategoryData?.name}</CardTitle>
              </div>
              <CardDescription>{selectedCategoryData?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleSubmit(formData)
              }}>
                {selectedCategoryData?.component}
                <div className="mt-6 flex justify-end gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/journal/browse">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Entry"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

