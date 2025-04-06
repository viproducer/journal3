import Link from "next/link"
import {
  Edit3,
  ArrowLeft,
  Star,
  Scissors,
  Tag,
  Plus,
  Check,
  Camera,
  Sparkles,
  Droplet,
  Wind,
  Sun,
  Thermometer,
  Calendar,
  Beaker,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/lib/firebase/auth"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function CurlyHairJournalPage() {
  const { logout } = useAuth()

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
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/marketplace" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>

          <div className="rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 p-8 text-white">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">Beauty & Wellness</Badge>
            <h1 className="text-3xl font-bold">Curly Hair Care Journal</h1>
            <p className="mt-2 max-w-2xl text-white/90">
              Track your curly hair care routine, products, and results to achieve your best curls.
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <Star className="h-5 w-5 text-yellow-300" />
                  <Star className="h-5 w-5 text-yellow-300" />
                  <Star className="h-5 w-5 text-yellow-300" />
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="ml-2 font-medium">4.8</span>
                  <span className="text-white/70">(156 ratings)</span>
                </div>
                <span className="text-white/70">•</span>
                <span className="text-white/90">2,450 active users</span>
              </div>
              <Button className="bg-white text-purple-600 hover:bg-white/90" asChild>
                <Link href="/journal/templates/curly-hair">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to My Journals
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Journal Features</CardTitle>
                <CardDescription>Everything you need to track your curly hair journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Routine Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Log your wash days, treatments, and styling routines.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      <Beaker className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Product Reviews</h3>
                      <p className="text-sm text-muted-foreground">
                        Track which products work best for your hair type and needs.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-green-100 p-1.5 text-green-600 dark:bg-green-900 dark:text-green-300">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Progress Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor your hair health and growth over time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Photo Journal</h3>
                      <p className="text-sm text-muted-foreground">
                        Document your hair journey with before and after photos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Get started with your curly hair care journal in minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="setup">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="setup">Setup</TabsTrigger>
                    <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                  </TabsList>
                  <TabsContent value="setup" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          1
                        </div>
                        <div>
                          <h3 className="font-medium">Document Your Hair Type</h3>
                          <p className="text-sm text-muted-foreground">
                            Record your curl pattern, porosity, and other key characteristics.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          2
                        </div>
                        <div>
                          <h3 className="font-medium">Set Your Goals</h3>
                          <p className="text-sm text-muted-foreground">
                            Define what you want to achieve with your hair care journey.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          3
                        </div>
                        <div>
                          <h3 className="font-medium">Create Your Routine</h3>
                          <p className="text-sm text-muted-foreground">
                            Set up your regular wash days and treatment schedule.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tracking" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          1
                        </div>
                        <div>
                          <h3 className="font-medium">Log Wash Days</h3>
                          <p className="text-sm text-muted-foreground">
                            Record your cleansing and conditioning routines.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          2
                        </div>
                        <div>
                          <h3 className="font-medium">Track Products</h3>
                          <p className="text-sm text-muted-foreground">
                            Document which products you use and their effects.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          3
                        </div>
                        <div>
                          <h3 className="font-medium">Note Observations</h3>
                          <p className="text-sm text-muted-foreground">
                            Record how your hair responds to different products and techniques.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="progress" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          1
                        </div>
                        <div>
                          <h3 className="font-medium">Track Growth</h3>
                          <p className="text-sm text-muted-foreground">
                            Monitor your hair length and health over time.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          2
                        </div>
                        <div>
                          <h3 className="font-medium">Photo Progress</h3>
                          <p className="text-sm text-muted-foreground">
                            Compare before and after photos to see your progress.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          3
                        </div>
                        <div>
                          <h3 className="font-medium">Adjust Your Routine</h3>
                          <p className="text-sm text-muted-foreground">
                            Use insights to refine your hair care approach.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Journals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-pink-400 to-pink-600 p-4">
                      <div className="flex h-full flex-col justify-between text-white">
                        <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">Beauty</Badge>
                        <div>
                          <h3 className="text-xl font-bold">Skincare Journal</h3>
                          <p className="text-sm opacity-90">Track your skincare routine and results</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/marketplace/skincare">
                          <Plus className="mr-2 h-4 w-4" />
                          Add to My Journals
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-rose-400 to-rose-600 p-4">
                      <div className="flex h-full flex-col justify-between text-white">
                        <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">Beauty</Badge>
                        <div>
                          <h3 className="text-xl font-bold">Makeup Collection</h3>
                          <p className="text-sm opacity-90">Organize and track your makeup inventory</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/marketplace/makeup-collection">
                          <Plus className="mr-2 h-4 w-4" />
                          Add to My Journals
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

