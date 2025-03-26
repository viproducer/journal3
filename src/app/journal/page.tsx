"use client"

console.log('DEBUG: Journal page script loaded');
console.log('Loading journal page module');

import React from "react"
import { useEffect, useState, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Edit3,
  PlusCircle,
  Search,
  Heart,
  BarChart2,
  Star,
  Target,
  Compass,
  HelpCircle,
  Sun,
  Zap,
  CalendarIcon,
  Scissors,
  Home,
  Droplet,
  ChevronRight,
  Clock,
  TrendingUp,
  CheckCircle,
  BookOpen,
  LayoutGrid,
  PieChart,
  Calendar,
  Flame,
  LogOut,
  CalendarDays,
  ShoppingBag,
  Activity,
  Trash2,
} from "lucide-react"
import { getCategoryStyles, formatCategoryName } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
  startOfWeek,
  startOfMonth,
  isAfter,
  format,
  subDays
} from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getUserJournals, getJournalEntries, deleteJournalEntry } from "@/lib/firebase/db"
import { Journal, JournalEntry } from "@/lib/firebase/types"
import { useAuth } from "@/lib/firebase/auth"
import { createJournal } from "@/lib/firebase/db"

export default function DashboardPage() {
  console.log('JournalPage render start');
  
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalEntries: 0,
    morningPercentage: 0,
    avgTime: 0,
    consistency: 0
  });

  useEffect(() => {
    console.log('JournalPage useEffect - Auth state:', { 
      userId: user?.uid, 
      authLoading, 
      loading 
    });

    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    if (!user) {
      console.log('No user found, redirecting to signin');
      router.push('/auth/signin');
      return;
    }

    const loadJournals = async () => {
      try {
        console.log('Loading journals for user:', user.uid);
        setLoading(true);
        setError(null);
        
        const userJournals = await getUserJournals(user.uid);
        console.log('Journals loaded:', userJournals.length);
        
        setJournals(userJournals);
      } catch (err) {
        console.error('Error loading journals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load journals');
      } finally {
        setLoading(false);
      }
    };

    loadJournals();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/signin');
    } catch (err) {
      setError('Failed to log out. Please try again.');
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
      return;
    }
  }, [user, authLoading, router]);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Load journals
      const userJournals = await getUserJournals(user.uid);
      setJournals(userJournals);

      // Only try to load entries if we have journals
      if (userJournals.length > 0) {
        try {
          // Store the current journal ID
          localStorage.setItem('currentJournalId', userJournals[0].id!);
          const journalEntries = await getJournalEntries(user.uid, userJournals[0].id!);
          setEntries(journalEntries);
        } catch (entriesError) {
          console.warn('Could not load entries:', entriesError);
          setEntries([]);
        }
      }

      setLastFetch(Date.now());
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load journal data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data when authenticated
  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user, loadData]);

  useEffect(() => {
    console.log('JournalPage mounted');
    return () => {
      console.log('JournalPage unmounted');
    };
  }, []);

  async function loadDashboardData() {
    if (!user) return
    
    try {
      setLoading(true)
      const journalId = localStorage.getItem('currentJournalId') || 'default'
      
      // Load journals
      const userJournals = await getUserJournals(user.uid)
      setJournals(userJournals)
      
      // Load entries
      const journalEntries = await getJournalEntries(user.uid, journalId)
      setEntries(journalEntries)
      
      // Calculate stats
      const now = new Date()
      const weekStart = startOfWeek(now)
      const monthStart = startOfMonth(now)
      
      const entriesThisWeek = journalEntries.filter(entry => 
        isAfter(new Date(entry.createdAt), weekStart)
      ).length
      
      const entriesThisMonth = journalEntries.filter(entry => 
        isAfter(new Date(entry.createdAt), monthStart)
      ).length

      // Calculate morning entries percentage
      const morningEntries = journalEntries.filter(entry => {
        const entryHour = new Date(entry.createdAt).getHours()
        return entryHour >= 5 && entryHour < 12 // Between 5 AM and noon
      }).length
      const morningPercentage = journalEntries.length > 0 
        ? Math.round((morningEntries / journalEntries.length) * 100)
        : 0

      // Calculate consistency
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const daysWithEntries = new Set(
        journalEntries
          .filter(entry => isAfter(new Date(entry.createdAt), monthStart))
          .map(entry => format(new Date(entry.createdAt), 'yyyy-MM-dd'))
      ).size
      const consistency = Math.round((daysWithEntries / daysInMonth) * 100)
      
      // Calculate streaks
      let currentStreak = 0
      let longestStreak = 0
      let currentCount = 0
      
      // Group entries by date
      const entriesByDate = journalEntries.reduce((acc, entry) => {
        const date = format(new Date(entry.createdAt), 'yyyy-MM-dd')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Calculate streaks
      let date = new Date()
      while (entriesByDate[format(date, 'yyyy-MM-dd')]) {
        currentStreak++
        date = subDays(date, 1)
      }
      
      // Calculate longest streak
      Object.keys(entriesByDate).sort().forEach(date => {
        if (entriesByDate[date]) {
          currentCount++
          longestStreak = Math.max(longestStreak, currentCount)
        } else {
          currentCount = 0
        }
      })
      
      setStats({
        currentStreak,
        longestStreak,
        thisWeek: entriesThisWeek,
        thisMonth: entriesThisMonth,
        totalEntries: journalEntries.length,
        morningPercentage,
        avgTime: 12, // Placeholder value
        consistency
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Call loadDashboardData when user changes
  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Helper function to get icon component based on category
  function getIconForCategory(category: string | undefined): ReactNode {
    switch (category) {
      case "mood-feelings":
        return <Heart className="h-4 w-4" />;
      case "tracking-logs":
        return <BarChart2 className="h-4 w-4" />;
      case "gratitude-reflection":
        return <Star className="h-4 w-4" />;
      case "goals-intentions":
        return <Target className="h-4 w-4" />;
      case "future-visioning":
        return <Compass className="h-4 w-4" />;
      case "journaling-prompts":
        return <HelpCircle className="h-4 w-4" />;
      case "daily-checkins":
        return <Sun className="h-4 w-4" />;
      case "challenges-streaks":
        return <Zap className="h-4 w-4" />;
      default:
        return <Edit3 className="h-4 w-4" />;
    }
  }

  // Calculate category distribution from entries
  const categoryDistribution = [
    { name: "Mood & Feelings", count: entries.filter(e => e.metadata?.type === "mood-feelings").length, icon: getIconForCategory("mood-feelings"), color: "bg-red-500" },
    { name: "Tracking & Logs", count: entries.filter(e => e.metadata?.type === "tracking-logs").length, icon: getIconForCategory("tracking-logs"), color: "bg-blue-500" },
    { name: "Gratitude & Reflection", count: entries.filter(e => e.metadata?.type === "gratitude-reflection").length, icon: getIconForCategory("gratitude-reflection"), color: "bg-yellow-500" },
    { name: "Goals & Intentions", count: entries.filter(e => e.metadata?.type === "goals-intentions").length, icon: getIconForCategory("goals-intentions"), color: "bg-green-500" },
    { name: "Future Visioning", count: entries.filter(e => e.metadata?.type === "future-visioning").length, icon: getIconForCategory("future-visioning"), color: "bg-purple-500" },
    { name: "Journaling Prompts", count: entries.filter(e => e.metadata?.type === "journaling-prompts").length, icon: getIconForCategory("journaling-prompts"), color: "bg-indigo-500" },
    { name: "Daily Check-ins", count: entries.filter(e => e.metadata?.type === "daily-checkins").length, icon: getIconForCategory("daily-checkins"), color: "bg-orange-500" },
    { name: "Challenges & Streaks", count: entries.filter(e => e.metadata?.type === "challenges-streaks").length, icon: getIconForCategory("challenges-streaks"), color: "bg-pink-500" },
  ]

  // Total entries
  const totalEntries = entries.length

  if (authLoading) {
    console.log('Showing auth loading state');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('No user, redirecting to signin');
    router.replace("/auth/signin");
    return null;
  }

  if (loading) {
    console.log('Showing data loading state');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading your journal...</div>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('Showing error state:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-500">Error loading journal</div>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">{error}</div>
          <Button 
            onClick={() => {
              console.log('Retrying data load');
              loadData();
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  console.log('Rendering main content');
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
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl p-6 md:p-8 lg:p-10 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">Journal Dashboard</h1>
              <p className="text-muted-foreground">Track your journaling progress and insights</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search entries..."
                  className="w-full min-w-[200px] pl-8"
                />
              </div>
              <Button>
                <Link href="/journal/create-entry">New Entry</Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-medium">Current Streak</h3>
                  </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{stats.currentStreak} days</div>
                  <div className="text-sm text-muted-foreground">Longest: {stats.longestStreak} days</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">This Week</h3>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{stats.thisWeek} entries</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((stats.thisWeek / 7) * 100, 100)}%` }} 
                      />
                    </div>
                    <div className="min-w-[3rem] text-right">
                      <span className="text-sm text-muted-foreground">
                        {Math.round((stats.thisWeek / 7) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium">This Month</h3>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{stats.thisMonth} entries</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(stats.thisMonth / 30) * 100}%` }} 
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((stats.thisMonth / 30) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Total Entries</h3>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{stats.totalEntries}</div>
                  <div className="text-sm text-muted-foreground">Across {categoryDistribution.length} categories</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Entries */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Entries</h2>
                <Button variant="ghost" size="sm" className="text-blue-500" asChild>
                  <Link href="/journal/browse">View All</Link>
                </Button>
              </div>

              <div className="space-y-4">
                {entries.slice(0, 3).map((entry) => {
                  const categoryStyles = getCategoryStyles(entry.metadata?.type || 'mood-feelings')
                  return (
                    <div key={entry.id} className="flex flex-col space-y-2 rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{entry.metadata?.title || "Journal Entry"}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {new Date(entry.createdAt).toLocaleString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                            categoryStyles.bgColorLight,
                            categoryStyles.color
                          )}>
                            {React.createElement(categoryStyles.icon, { className: "h-3.5 w-3.5" })}
                            {formatCategoryName(entry.metadata?.type || 'mood-feelings')}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted text-red-500 hover:text-red-600"
                            onClick={async () => {
                              if (!user) return;
                              if (window.confirm('Are you sure you want to delete this entry?')) {
                                try {
                                  const journalId = localStorage.getItem('currentJournalId')
                                  if (!journalId) {
                                    console.error('No journal ID found')
                                    return
                                  }
                                  
                                  setLoading(true)
                                  await deleteJournalEntry(user.uid, journalId, entry.id!)
                                  // Reload the page to refresh all data
                                  window.location.reload()
                                } catch (err) {
                                  console.error('Error deleting entry:', err)
                                } finally {
                                  setLoading(false)
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete entry</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.metadata?.firstTextBox || entry.content}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags?.map((tag) => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="pt-2">
                        <Link
                          href={`/journal/${entry.id}`}
                          className="inline-flex items-center justify-center gap-2 text-sm font-medium hover:text-primary"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category Distribution */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    <CardTitle>Category Distribution</CardTitle>
                  </div>
                  <CardDescription>
                    Breakdown of your journal entries by category
                  </CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    {categoryDistribution.map((category) => {
                      const percentage = totalEntries > 0 ? (category.count / totalEntries) * 100 : 0
                      return (
                        <div key={category.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`rounded-full p-1 bg-opacity-20 ${category.color.replace('bg-', 'text-')}`}>
                                {category.icon}
                              </div>
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{category.count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div
                                className={`h-2 rounded-full ${category.color}`}
                                style={{ width: `${percentage.toFixed(4)}%` }} 
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Marketplace Journals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Your Marketplace Journals</h2>
                      </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {journals.map((journal) => (
                <Card key={journal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${journal.color} p-2 rounded-full text-white`}>
                        {getIconForCategory(journal.metadata?.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{journal.metadata?.title || "Journal"}</h3>
                        <p className="text-sm text-muted-foreground">{journal.entries?.length || 0} entries</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Last entry: {journal.entries && journal.entries.length > 0 
                        ? new Date(journal.entries[journal.entries.length - 1].createdAt).toLocaleDateString() 
                        : "No entries yet"}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/journal/${journal.id}`}>Open Journal</Link>
                      </Button>
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/journal/create-entry?template=${journal.id}`}>
                          Create Entry
                        </Link>
                      </Button>
                  </div>
                  </CardContent>
                </Card>
                ))}
              </div>
          </div>

          {/* Activity Overview */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Consistency</h3>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{stats.consistency}%</div>
                  <p className="text-sm text-muted-foreground">of days this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Average Time</h3>
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{stats.avgTime} min</div>
                  <p className="text-sm text-muted-foreground">per journal entry</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Morning Entries</h3>
                    <Sun className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold">{stats.morningPercentage}%</div>
                  <p className="text-sm text-muted-foreground">of all entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Goal Progress</h3>
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">3/5</div>
                  <p className="text-sm text-muted-foreground">active goals</p>
                </CardContent>
              </Card>
                </div>
              </div>
        </div>
      </main>
    </div>
  )
}

