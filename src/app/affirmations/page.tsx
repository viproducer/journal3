import Link from "next/link"
import { Edit3, Star, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AffirmationsPage() {
  // Sample data - in a real app, this would come from a database
  const affirmations = [
    {
      id: 1,
      text: "I am capable of achieving my goals and overcoming any obstacles in my path.",
      category: "Success",
      favorite: true,
      createdAt: "Mar 15, 2025",
    },
    {
      id: 2,
      text: "I embrace challenges as opportunities for growth and learning.",
      category: "Growth",
      favorite: true,
      createdAt: "Mar 10, 2025",
    },
    {
      id: 3,
      text: "I am worthy of love, respect, and happiness.",
      category: "Self-love",
      favorite: false,
      createdAt: "Mar 5, 2025",
    },
    {
      id: 4,
      text: "My potential to succeed is limitless.",
      category: "Success",
      favorite: false,
      createdAt: "Feb 28, 2025",
    },
    {
      id: 5,
      text: "I trust my intuition and make decisions with confidence.",
      category: "Confidence",
      favorite: true,
      createdAt: "Feb 20, 2025",
    },
    {
      id: 6,
      text: "I am grateful for all the abundance in my life.",
      category: "Gratitude",
      favorite: false,
      createdAt: "Feb 15, 2025",
    },
  ]

  // Affirmations by category for the journal entry types
  const journalAffirmations = [
    {
      category: "Mood & Feelings",
      affirmations: [
        "I acknowledge my emotions without judgment.",
        "My feelings are valid and deserve to be expressed.",
        "I am in control of how I respond to my emotions.",
      ],
    },
    {
      category: "Tracking & Logs",
      affirmations: [
        "Each small step I track brings me closer to my goals.",
        "Consistency in my habits creates powerful change.",
        "I celebrate my progress, no matter how small.",
      ],
    },
    {
      category: "Gratitude & Reflection",
      affirmations: [
        "I find joy in appreciating the small things in life.",
        "Gratitude opens my heart to abundance.",
        "Reflecting on my experiences helps me grow.",
      ],
    },
    {
      category: "Goals & Intentions",
      affirmations: [
        "I have the power to turn my dreams into reality.",
        "My goals are worthy and achievable.",
        "I take consistent action toward what matters most.",
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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/goals">Goals</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/affirmations">Affirmations</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">Marketplace</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/templates">Admin</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">Affirmations</h1>
              <p className="text-muted-foreground">Positive statements to boost your mindset</p>
            </div>
            <div className="ml-auto">
              <Button asChild>
                <Link href="/affirmations/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Affirmation
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {affirmations.map((affirmation) => (
              <Card key={affirmation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      <Badge variant="outline" className="bg-primary/5">
                        {affirmation.category}
                      </Badge>
                    </CardTitle>
                    {affirmation.favorite && (
                      <div className="text-yellow-500">
                        <Star className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Added on {affirmation.createdAt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">"{affirmation.text}"</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/affirmations/${affirmation.id}`}>View</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Affirmations by Journal Category</CardTitle>
              <CardDescription>Tailored affirmations for different types of journal entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {journalAffirmations.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h3 className="font-medium">{category.category}</h3>
                  <div className="space-y-2">
                    {category.affirmations.map((text, index) => (
                      <div key={index} className="rounded-lg bg-muted p-3">
                        <p className="text-sm italic">"{text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/journal/new">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Start Journaling
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}

