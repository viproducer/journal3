"use client"

import Link from "next/link"
import {
  Edit3,
  Search,
  Filter,
  Star,
  TrendingUp,
  Clock,
  Tag,
  Plus,
  ShoppingBag,
  Award,
  Home,
  Baby,
  Droplet,
  Scissors,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/Navigation"
import { useAuth } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"

export default function MarketplacePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/signin');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

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
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">Journal Marketplace</h1>
              <p className="text-muted-foreground">Discover specialized journals for every aspect of your life</p>
            </div>
            <div className="ml-auto flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search journals..."
                  className="w-full min-w-[200px] pl-8 sm:w-[200px] md:w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="health"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Droplet className="mr-2 h-4 w-4" />
                Health & Wellness
              </TabsTrigger>
              <TabsTrigger
                value="home"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Home className="mr-2 h-4 w-4" />
                Home & Family
              </TabsTrigger>
              <TabsTrigger
                value="beauty"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Scissors className="mr-2 h-4 w-4" />
                Beauty & Self-Care
              </TabsTrigger>
              <TabsTrigger
                value="challenges"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Award className="mr-2 h-4 w-4" />
                Challenges
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Popular Journals</span>
              </h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Water Intake Challenge */}
                <Card className="overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-blue-400 to-blue-600 p-6">
                    <div className="flex h-full flex-col justify-between text-white">
                      <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">30-Day Challenge</Badge>
                      <div>
                        <h3 className="text-xl font-bold">Daily Water Intake</h3>
                        <p className="text-sm opacity-90">Track and improve your hydration</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.8 (124 ratings)</span>
                      <span className="mx-2">•</span>
                      <span>2,450 active users</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Daily intake tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Progress visualization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">Achievement badges</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 px-6 py-4">
                    <Button className="w-full" asChild>
                      <Link href="/marketplace/water-intake">
                        <Plus className="mr-2 h-4 w-4" />
                        Add to My Journals
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Household Chores Tracker */}
                <Card className="overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-green-400 to-green-600 p-6">
                    <div className="flex h-full flex-col justify-between text-white">
                      <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">Home Management</Badge>
                      <div>
                        <h3 className="text-xl font-bold">Household Chores</h3>
                        <p className="text-sm opacity-90">Track who does what at home</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.6 (98 ratings)</span>
                      <span className="mx-2">•</span>
                      <span>1,820 active users</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Multi-person tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Scheduling & reminders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Contribution analytics</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 px-6 py-4">
                    <Button className="w-full" asChild>
                      <Link href="/marketplace/household-chores">
                        <Plus className="mr-2 h-4 w-4" />
                        Add to My Journals
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Curly Hair Journal */}
                <Card className="overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-purple-400 to-purple-600 p-6">
                    <div className="flex h-full flex-col justify-between text-white">
                      <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">Beauty & Self-Care</Badge>
                      <div>
                        <h3 className="text-xl font-bold">Wavy & Curly Hair</h3>
                        <p className="text-sm opacity-90">Track your hair care journey</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.9 (215 ratings)</span>
                      <span className="mx-2">•</span>
                      <span>3,120 active users</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Product library & tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-pink-500" />
                        <span className="text-sm">Ingredient analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm">Before & after photos</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 px-6 py-4">
                    <Button className="w-full" asChild>
                      <Link href="/marketplace/curly-hair">
                        <Plus className="mr-2 h-4 w-4" />
                        Add to My Journals
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Baby className="h-5 w-5 text-primary" />
                <span>Parenting Journals</span>
              </h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Baby Tracker */}
                <Card className="overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-pink-400 to-pink-600 p-6">
                    <div className="flex h-full flex-col justify-between text-white">
                      <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">Parenting</Badge>
                      <div>
                        <h3 className="text-xl font-bold">Baby Tracker</h3>
                        <p className="text-sm opacity-90">Complete baby health monitoring</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>4.9 (342 ratings)</span>
                      <span className="mx-2">•</span>
                      <span>5,670 active users</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Baby className="h-4 w-4 text-pink-500" />
                        <span className="text-sm">Diaper tracking (frequency, color)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Feeding & sleep schedules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Growth & milestone tracking</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 px-6 py-4">
                    <Button className="w-full" asChild>
                      <Link href="/marketplace/baby-tracker">
                        <Plus className="mr-2 h-4 w-4" />
                        Add to My Journals
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

