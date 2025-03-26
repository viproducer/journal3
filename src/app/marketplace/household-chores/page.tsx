import Link from "next/link"
import { Edit3, ArrowLeft, Star, TrendingUp, Plus, Users, CalendarDays, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function HouseholdChoresJournalPage() {
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
        <div className="mx-auto max-w-4xl space-y-8">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/marketplace" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>

          <div className="rounded-xl bg-gradient-to-r from-green-400 to-green-600 p-8 text-white">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">Home Management</Badge>
            <h1 className="text-3xl font-bold">Household Chores Journal</h1>
            <p className="mt-2 max-w-2xl text-white/90">
              Track who does what at home, schedule tasks, and ensure fair distribution of household responsibilities.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <Star className="h-5 w-5 text-yellow-300" />
                <span className="ml-2 font-medium">4.6</span>
                <span className="text-white/70">(98 ratings)</span>
              </div>
              <span className="text-white/70">•</span>
              <span className="text-white/90">1,820 active users</span>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Journal Features</CardTitle>
                  <CardDescription>Everything you need to manage household responsibilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 p-1.5 text-green-600 dark:bg-green-900 dark:text-green-300">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Multi-person Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                          Add all household members and track who completes which tasks.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Task Scheduling</h3>
                        <p className="text-sm text-muted-foreground">
                          Schedule recurring tasks and one-time responsibilities.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-purple-100 p-1.5 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Contribution Analytics</h3>
                        <p className="text-sm text-muted-foreground">
                          View charts and reports on household task distribution.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Reminders & Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Set reminders for upcoming tasks and receive notifications.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>Get started with your household chores journal in minutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="setup">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="setup">Setup</TabsTrigger>
                      <TabsTrigger value="tracking">Tracking</TabsTrigger>
                      <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="setup" className="mt-4 space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium">Add Household Members</h3>
                            <p className="text-sm text-muted-foreground">
                              Add all the people in your household who will be sharing responsibilities.
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
                            <h3 className="font-medium">Create Task Categories</h3>
                            <p className="text-sm text-muted-foreground">
                              Set up categories like cleaning, cooking, shopping, and maintenance.
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
                            <h3 className="font-medium">Schedule Regular Tasks</h3>
                            <p className="text-sm text-muted-foreground">
                              Create recurring tasks and assign them to household members.
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
                            <h3 className="font-medium">Mark Tasks as Complete</h3>
                            <p className="text-sm text-muted-foreground">
                              Household members can check off tasks as they complete them.
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
                            <h3 className="font-medium">Log Additional Details</h3>
                            <p className="text-sm text-muted-foreground">
                              Add notes, time spent, or issues encountered with specific tasks.
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
                            <h3 className="font-medium">Receive Reminders</h3>
                            <p className="text-sm text-muted-foreground">
                              Get notifications for upcoming or overdue tasks.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="reports" className="mt-4 space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium">View Task Distribution</h3>
                            <p className="text-sm text-muted-foreground">
                              See how household tasks are distributed among members.
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
                            <h3 className="font-medium">Track Completion Rates</h3>
                            <p className="text-sm text-muted-foreground">
                              Monitor which tasks are being completed on time and which are often delayed.
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
                            <h3 className="font-medium">Adjust Task Allocation</h3>
                            <p className="text-sm text-muted-foreground">
                              Use insights to rebalance household responsibilities for fairness.
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
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Multi-person task tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Recurring task scheduling</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Task distribution analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Reminders and notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="text-sm">Customizable task categories</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/journal/create-entry?template=household-chores">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Create Journal Entry
                      </Link>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4">
                  <Button className="w-full" asChild>
                    <Link href="/journal/templates/household-chores">
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
                    <div className="h-12 w-12 rounded-md bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div>
                      <h3 className="font-medium">Grocery & Meal Planning</h3>
                      <p className="text-sm text-muted-foreground">Plan meals and track grocery shopping</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-md bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    <div>
                      <h3 className="font-medium">Home Maintenance</h3>
                      <p className="text-sm text-muted-foreground">Track repairs and regular maintenance tasks</p>
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

