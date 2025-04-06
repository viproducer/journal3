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
import { getPublicTemplates } from "@/lib/firebase/templates"
import { JournalEntry, Journal, MarketplaceTemplate } from "@/lib/firebase/types"

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
import { Navigation } from "@/components/Navigation"

export default function CreateEntryPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("mood-feelings")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<MarketplaceTemplate[]>([])

  // Check if there's a template query parameter
  const [searchParams, setSearchParams] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search)
    }
    return new URLSearchParams()
  })
  const templateParam = searchParams.get("template")

  // Load marketplace templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await getPublicTemplates()
        setMarketplaceTemplates(templates)
      } catch (err) {
        console.error('Error loading marketplace templates:', err)
        setError('Failed to load marketplace templates')
      }
    }

    loadTemplates()
  }, [])

  // If a template is specified in the URL, show it first
  useEffect(() => {
    if (templateParam) {
      // Set the selected category to match the template if it exists
      const matchingTemplate = marketplaceTemplates.find((t) => t.id === templateParam)
      if (matchingTemplate) {
        setSelectedCategory(`marketplace-${templateParam}`)
      }
    }
  }, [templateParam, marketplaceTemplates])

  const handleGoalSubmit = async (data: { 
    title: string
    content: string
    trackingType: "habit" | "fitness" | "nutrition" | "sleep" | "mood" | "finance" | "productivity" | "custom"
    isGoalTracking: boolean
    linkedGoalId: string
    metrics: Array<{
      name: string
      value: string
      unit: string
      unitType: string
      unitSystem: "metric" | "imperial"
      secondaryValue?: string
      secondaryUnit?: string
      notes?: string
    }>
    targetProgress: Array<{
      targetId: string
      value: string
      secondaryValue: string
      notes: string
    }>
  }) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const form = document.querySelector('form')
        if (!form) {
          reject(new Error('Form not found'))
          return
        }

        // Add hidden inputs with the tracking data
        const contentInput = document.createElement('input')
        contentInput.type = 'hidden'
        contentInput.name = 'content'
        contentInput.value = data.content
        form.appendChild(contentInput)

        const categoryInput = document.createElement('input')
        categoryInput.type = 'hidden'
        categoryInput.name = 'category'
        categoryInput.value = 'tracking-logs'
        form.appendChild(categoryInput)

        const typeInput = document.createElement('input')
        typeInput.type = 'hidden'
        typeInput.name = 'type'
        typeInput.value = data.trackingType
        form.appendChild(typeInput)

        const metadataInput = document.createElement('input')
        metadataInput.type = 'hidden'
        metadataInput.name = 'metadata'
        metadataInput.value = JSON.stringify({
          title: data.title,
          isGoalTracking: data.isGoalTracking,
          linkedGoalId: data.linkedGoalId,
          metrics: data.metrics,
          targetProgress: data.targetProgress
        })
        form.appendChild(metadataInput)

        // Submit the form
        form.requestSubmit()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
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
      component: <TrackingLogsForm onSubmit={handleGoalSubmit} />,
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
        <Card className="border-2 border-dashed">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">How It Works</h2>
                <p className="text-muted-foreground">Get started with your {template.name.toLowerCase()} in minutes</p>
              </div>

              <Tabs defaultValue="setup" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="setup">Setup</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                  {template.howItWorks.tabs.map((tab, index) => (
                    <div key={tab.title} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{tab.title}</h3>
                        <p className="text-muted-foreground">{tab.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tabs>
            </div>

            <div className="mt-6 flex justify-end">
              <Button asChild>
                <Link href={`/admin/templates/${template.id}`}>Open Template</Link>
              </Button>
            </div>
          </CardContent>
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
      const category = formData.get('category') as string
      const type = formData.get('type') as string
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

      const data = {
        content,
        category,
        type,
        userId: user.uid,
        journalId: journal.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata
      }

      console.log('Creating entry with data:', data)
      await createEntry(data)
      router.push('/journal/browse')
    } catch (error) {
      console.error('Error creating entry:', error)
      alert('Failed to create entry. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Edit3 className="h-5 w-5" />
          <span>JournalMind</span>
        </Link>
        <Navigation onLogout={handleLogout} />
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
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" className="w-full sm:w-auto">
                      Create Entry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Tabs>
          </form>
        </div>
      </main>
    </div>
  )
}