import Link from "next/link"
import { Edit3, Heart, BarChart2, Star, Target, Compass, HelpCircle, Sun, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CategoryFormsPage() {
  const categories = [
    {
      id: "mood-feelings",
      name: "Mood & Feelings",
      icon: <Heart className="h-5 w-5" />,
      description: "Track emotions, moods, and feelings with sliders, emotion selection, and reflection prompts.",
      fields: [
        "Mood level slider",
        "Primary emotion selection",
        "Emotion triggers",
        "Physical sensations",
        "Response reflection",
      ],
    },
    {
      id: "tracking-logs",
      name: "Tracking & Logs",
      icon: <BarChart2 className="h-5 w-5" />,
      description: "Log and track habits, activities, and metrics with customizable fields.",
      fields: [
        "Tracking type selection",
        "Custom metrics with values and units",
        "Notes section",
        "Observations and patterns",
      ],
    },
    {
      id: "gratitude-reflection",
      name: "Gratitude & Reflection",
      icon: <Star className="h-5 w-5" />,
      description: "Practice gratitude and reflect on experiences with guided prompts.",
      fields: [
        "Three gratitude items with meaning",
        "Day highlight capture",
        "Lessons and insights",
        "Growth reflection",
      ],
    },
    {
      id: "goals-intentions",
      name: "Goals & Intentions",
      icon: <Target className="h-5 w-5" />,
      description: "Set, track, and reflect on goals with progress tracking and milestone management.",
      fields: [
        "Goal category selection",
        "Goal statement and purpose",
        "Progress tracking",
        "Milestone management",
        "Next steps planning",
      ],
    },
    {
      id: "future-visioning",
      name: "Future Visioning",
      icon: <Compass className="h-5 w-5" />,
      description: "Envision and plan for your future across different life areas and timeframes.",
      fields: [
        "Timeframe selection",
        "Career, personal, and lifestyle visions",
        "Obstacle identification",
        "First steps planning",
      ],
    },
    {
      id: "journaling-prompts",
      name: "Journaling Prompts",
      icon: <HelpCircle className="h-5 w-5" />,
      description: "Respond to thought-provoking prompts across different categories.",
      fields: ["Prompt category selection", "Random prompt generator", "Response area", "Insights and takeaways"],
    },
    {
      id: "daily-checkins",
      name: "Daily Check-ins",
      icon: <Sun className="h-5 w-5" />,
      description: "Quick daily check-ins for morning and evening with mood and energy tracking.",
      fields: [
        "Morning and evening check-ins",
        "Energy and mood tracking",
        "Day highlights and challenges",
        "Wins and gratitude",
        "Next day planning",
      ],
    },
    {
      id: "challenges-streaks",
      name: "Challenges & Streaks",
      icon: <Zap className="h-5 w-5" />,
      description: "Track progress on challenges and streaks with day counting and reflection.",
      fields: [
        "Challenge type and name",
        "Progress tracking",
        "Day counting",
        "Activity documentation",
        "Obstacles and learnings",
      ],
    },
  ]

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
            <Link href="/journal">Journal</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold">Journal Entry Categories</h1>
            <p className="text-muted-foreground">
              Each category has a specialized form to help you capture the most relevant information
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">{category.icon}</div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Fields:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {category.fields.map((field, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{field}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/journal/new">Create New Journal Entry</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

