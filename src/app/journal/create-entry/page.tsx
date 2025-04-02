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

  const handleGoalSubmit = (data: { content: string; category: string; type: string; metadata: any }) => {
    const form = document.querySelector('form')
    if (!form) return

    // Add hidden inputs with the goal data
    const contentInput = document.createElement('input')
    contentInput.type = 'hidden'
    contentInput.name = 'content'
    contentInput.value = data.content
    form.appendChild(contentInput)

    const categoryInput = document.createElement('input')
    categoryInput.type = 'hidden'
    categoryInput.name = 'category'
    categoryInput.value = data.category
    form.appendChild(categoryInput)

    const typeInput = document.createElement('input')
    typeInput.type = 'hidden'
    typeInput.name = 'type'
    typeInput.value = data.type
    form.appendChild(typeInput)

    const metadataInput = document.createElement('input')
    metadataInput.type = 'hidden'
    metadataInput.name = 'metadata'
    metadataInput.value = JSON.stringify(data.metadata)
    form.appendChild(metadataInput)

    // Submit the form
    form.requestSubmit()
  }

  const handleTrackingLogsSubmit = async (data: {
    title: string
    content: string
    trackingType: string
    isGoalTracking: boolean
    linkedGoalId: string
    metrics: any[]
    targetProgress: any[]
  }) => {
    try {
      setSubmitting(true)
      setError(null)

      // Get the user's journals
      const journals = await getUserJournals(user!.uid)
      if (!journals || journals.length === 0) {
        // Create a default journal if none exists
        const defaultJournal = await createJournal({
          userId: user!.uid,
          name: "My Journal",
          description: "My personal journal",
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
        if (!defaultJournal.id) {
          throw new Error("Failed to create default journal")
        }
        await createEntry({
          userId: user!.uid,
          journalId: defaultJournal.id,
          content: data.content,
          category: "tracking-logs",
          type: "tracking",
          metadata: {
            title: data.title,
            trackingType: data.trackingType,
            isGoalTracking: data.isGoalTracking,
            linkedGoalId: data.linkedGoalId,
            metrics: data.metrics,
            targetProgress: data.targetProgress,
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
      } else {
        // Use the first non-archived journal
        const activeJournal = journals.find(j => !j.isArchived)
        if (!activeJournal || !activeJournal.id) {
          throw new Error("No active journal found")
        }
        await createEntry({
          userId: user!.uid,
          journalId: activeJournal.id,
          content: data.content,
          category: "tracking-logs",
          type: "tracking",
          metadata: {
            title: data.title,
            trackingType: data.trackingType,
            isGoalTracking: data.isGoalTracking,
            linkedGoalId: data.linkedGoalId,
            metrics: data.metrics,
            targetProgress: data.targetProgress,
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }

      // Redirect to the journal page
      router.push("/journal")
    } catch (error) {
      console.error("Error creating entry:", error)
      setError("Failed to create entry. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

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
      component: <TrackingLogsForm onSubmit={handleTrackingLogsSubmit} />,
    },
    {
      id: "gratitude-reflection",
      name: "Gratitude & Reflection",
      icon: <Star className="h-5 w-5" />,
      description: "Practice gratitude and reflect on experiences with guided prompts.",
      component: <GratitudeReflectionForm />,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    try {
      const formData = new FormData(e.currentTarget)
      const content = formData.get('content') as string
      const metadata = JSON.parse(formData.get('metadata') as string || '{}')

      // Get or create default journal
      const journals = await getUserJournals(user.uid)
      let journal = journals[0] // Use the first journal or create a new one
      
      if (!journal) {
        journal = await createJournal({
          userId: user.uid,
          name: "My Journal",
          description: "My personal journal",
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

      if (!journal?.id) {
        throw new Error('Failed to get or create journal')
      }

      // Ensure category and type are set correctly
      const entryData = {
        content,
        category: selectedCategory, // Use the selected category from tabs
        type: selectedCategory, // Use the full category name for type
        userId: user.uid,
        journalId: journal.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata
      }

      console.log('Creating entry with data:', entryData)
      await createEntry(entryData)
      router.push('/journal/browse')
    } catch (error) {
      console.error('Error creating entry:', error)
      alert('Failed to create entry. Please try again.')
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

          <form onSubmit={handleSubmit}>
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
                          <div className={`${template.color} text-white p-2 rounded-full`}>
                            {template.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              <Card>
                <CardContent className="p-6">
                  {selectedCategoryData?.component}
                </CardContent>
                <CardFooter className="flex justify-end p-6 pt-0">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Entry"}
                  </Button>
                </CardFooter>
              </Card>
            </Tabs>
          </form>
        </div>
      </main>
    </div>
  )
}