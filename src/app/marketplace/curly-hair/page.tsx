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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function CurlyHairJournalPage() {
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
            <Link href="/journal">Affirmations</Link>
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
        <div className="mx-auto max-w-4xl space-y-8">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/marketplace" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>

          <div className="rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 p-8 text-white">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">Beauty & Self-Care</Badge>
            <h1 className="text-3xl font-bold">Wavy & Curly Hair Journal</h1>
            <p className="mt-2 max-w-2xl text-white/90">
              Track your hair care journey, manage products and ingredients, and see what works best for your unique
              hair type.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <span className="ml-2 font-medium">4.9</span>
                <span className="text-white/70">(215 ratings)</span>
              </div>
              <span className="text-white/70">•</span>
              <span className="text-white/90">3,120 active users</span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Journal Features</CardTitle>
                  <CardDescription>Everything you need to track your hair care journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                        <Scissors className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Product Library</h3>
                        <p className="text-sm text-muted-foreground">
                          Create a personal library of all your hair products with details on ingredients and usage.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-pink-100 p-1.5 text-pink-600 dark:bg-pink-900 dark:text-pink-300">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Ingredient Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                          Track which ingredients work for your hair and which ones to avoid.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Photo Progress</h3>
                        <p className="text-sm text-muted-foreground">
                          Document your hair journey with before and after photos for each routine.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Routine Builder</h3>
                        <p className="text-sm text-muted-foreground">
                          Create and save custom routines with product combinations and application methods.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 font-medium">Track Environmental Factors</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Humidity levels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Weather conditions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Sun exposure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Heat styling usage</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/journal/create-entry?template=curly-hair">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Create Journal Entry
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>Get started with your hair care journal in minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="products">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="routines">Routines</TabsTrigger>
                      <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    </TabsList>
                    <TabsContent value="products" className="mt-4 space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium">Create Your Product Library</h3>
                            <p className="text-sm text-muted-foreground">
                              Add all your hair products to your personal library with details on brand, product type,
                              and key ingredients.
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
                            <h3 className="font-medium">Tag Key Ingredients</h3>
                            <p className="text-sm text-muted-foreground">
                              Mark important ingredients in each product to track what works for your hair over time.
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
                            <h3 className="font-medium">Rate Product Performance</h3>
                            <p className="text-sm text-muted-foreground">
                              After using products, rate how well they worked for your hair to build your personalized
                              recommendations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="routines" className="mt-4 space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium">Create Wash Day Routines</h3>
                            <p className="text-sm text-muted-foreground">
                              Build step-by-step routines selecting products from your library and specifying amounts
                              and application methods.
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
                            <h3 className="font-medium">Save Multiple Routines</h3>
                            <p className="text-sm text-muted-foreground">
                              Create different routines for different needs: clarifying wash, protein treatment, deep
                              conditioning, etc.
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
                            <h3 className="font-medium">Adjust Product Ratios</h3>
                            <p className="text-sm text-muted-foreground">
                              Experiment with different product combinations and ratios to find your perfect formula.
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
                            <h3 className="font-medium">Document With Photos</h3>
                            <p className="text-sm text-muted-foreground">
                              Take before and after photos of each wash day to visually track your progress and results.
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
                            <h3 className="font-medium">Rate Results</h3>
                            <p className="text-sm text-muted-foreground">
                              Rate each wash day on factors like definition, volume, frizz control, and moisture
                              balance.
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
                            <h3 className="font-medium">Analyze Patterns</h3>
                            <p className="text-sm text-muted-foreground">
                              Review your journal entries to identify patterns and discover what works best for your
                              hair.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Add to My Journals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Unlimited product entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Photo progress tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Environmental factor tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Routine builder & saver</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Ingredient analysis</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4">
                  <Button className="w-full" asChild>
                    <Link href="/journal/templates/curly-hair">
                      <Plus className="mr-2 h-4 w-4" />
                      Add to My Journals
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Journals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-md bg-gradient-to-r from-pink-400 to-pink-600"></div>
                    <div>
                      <h3 className="font-medium">Skincare Tracker</h3>
                      <p className="text-sm text-muted-foreground">Track your skincare routine and product results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-md bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div>
                      <h3 className="font-medium">Makeup Collection</h3>
                      <p className="text-sm text-muted-foreground">Organize and track your makeup products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

