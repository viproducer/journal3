"use client"

console.log('DEBUG: Journal page script loaded');
console.log('Loading journal page module');

import React from "react"
import { useEffect, useState, type ReactNode, useCallback, useMemo } from "react"
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
  X,
  StickyNote,
  ScrollText,
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
import { Timestamp } from 'firebase/firestore'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getUserJournals, getJournalEntries, deleteJournalEntry, getUserGoals, getProgressHistory } from "@/lib/firebase/db"
import { Journal, JournalEntry, Goal, ProgressHistory } from "@/lib/firebase/types"
import { useAuth } from "@/lib/firebase/auth"
import { createJournal } from "@/lib/firebase/db"
import DailyAffirmation from "@/components/DailyAffirmation"
import { Navigation } from "@/components/Navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Add these type definitions near the top of the file
type DateRange = {
  from: string;
  to: string;
};

type ViewMode = 'DIARY' | 'POSTIT' | 'PAPER' | 'GRID';

const VIEW_OPTIONS = {
  DIARY: 'Diary',
  POSTIT: 'Post-it',
  PAPER: 'Paper',
  GRID: 'Grid'
} as const;

// Add these constants near the top of the file
const CATEGORIES = [
  { id: 'mood-feelings', name: 'Mood & Feelings', icon: Heart, color: 'bg-red-500', hoverColor: 'hover:bg-red-500' },
  { id: 'tracking-logs', name: 'Tracking & Logs', icon: BarChart2, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-500' },
  { id: 'gratitude-reflection', name: 'Gratitude & Reflection', icon: Star, color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-500' },
  { id: 'goals-intentions', name: 'Goals & Intentions', icon: Target, color: 'bg-green-500', hoverColor: 'hover:bg-green-500' },
  { id: 'future-visioning', name: 'Future Visioning', icon: Compass, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-500' },
  { id: 'journaling-prompts', name: 'Journaling Prompts', icon: HelpCircle, color: 'bg-indigo-500', hoverColor: 'hover:bg-indigo-500' },
  { id: 'daily-checkins', name: 'Daily Check-ins', icon: Sun, color: 'bg-orange-500', hoverColor: 'hover:bg-orange-500' },
  { id: 'challenges-streaks', name: 'Challenges & Streaks', icon: Zap, color: 'bg-pink-500', hoverColor: 'hover:bg-pink-500' },
] as const;

const EXPANDED_FIELDS = {
  'mood-feelings': ['moodLevel', 'primaryEmotion', 'secondaryEmotions'],
  'tracking-logs': ['value', 'unit', 'notes'],
  'gratitude-reflection': ['gratitudeLevel', 'reflection'],
  'goals-intentions': ['goalType', 'deadline', 'progress'],
  'future-visioning': ['timeframe', 'visionType'],
  'journaling-prompts': ['promptType', 'responseType'],
  'daily-checkins': ['checkinType', 'status'],
  'challenges-streaks': ['challengeType', 'streakCount'],
} as const;

// Update the type for fields in the entry card
type ExpandedField = keyof typeof EXPANDED_FIELDS;

// Helper function to calculate median
function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export default function DashboardPage() {
  console.log('JournalPage render start');
  
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showActivityOverview, setShowActivityOverview] = useState(false);
  const [trackingUpdates, setTrackingUpdates] = useState<Record<string, ProgressHistory[]>>({});
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

  // Add these state variables inside the DashboardPage component
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' });
  const [viewMode, setViewMode] = useState<ViewMode>('DIARY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [moodTimeRange, setMoodTimeRange] = useState<'week' | 'month' | 'year'>('week')

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

      // Load goals
      console.log('Loading goals for user:', user.uid);
      const userGoals = await getUserGoals(user.uid);
      console.log('Goals loaded:', userGoals);
      setGoals(userGoals);

      // Load entries for all journals
      const allEntries: JournalEntry[] = [];
      for (const journal of userJournals) {
        try {
          const journalEntries = await getJournalEntries(user.uid, journal.id!);
          allEntries.push(...journalEntries);
        } catch (entriesError) {
          console.warn(`Could not load entries for journal ${journal.id}:`, entriesError);
        }
      }
      
      // Sort entries by date (newest first)
      allEntries.sort((a, b) => {
        const dateA = (a.createdAt as unknown as Timestamp)?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = (b.createdAt as unknown as Timestamp)?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setEntries(allEntries)
      console.log('Entries loaded:', allEntries.length);

      setLastFetch(Date.now());
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load journal data');
      setEntries([]); // Set empty array on error
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
      
      // Load journals
      const userJournals = await getUserJournals(user.uid)
      setJournals(userJournals)
      
      // Load goals
      console.log('Loading goals in loadDashboardData');
      const userGoals = await getUserGoals(user.uid);
      console.log('Goals loaded in loadDashboardData:', userGoals);
      setGoals(userGoals);
      
      // Load entries from all journals
      const allEntries: JournalEntry[] = [];
      for (const journal of userJournals) {
        try {
          const journalEntries = await getJournalEntries(user.uid, journal.id!);
          allEntries.push(...journalEntries);
        } catch (entriesError) {
          console.warn(`Could not load entries for journal ${journal.id}:`, entriesError);
        }
      }
      
      // Sort entries by date (newest first)
      allEntries.sort((a, b) => {
        const dateA = (a.createdAt as unknown as Timestamp)?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = (b.createdAt as unknown as Timestamp)?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setEntries(allEntries);
      
      // Calculate stats
      const now = new Date()
      const weekStart = startOfWeek(now)
      const monthStart = startOfMonth(now)
      
      const entriesThisWeek = allEntries.filter(entry => 
        isAfter(new Date(entry.createdAt), weekStart)
      ).length
      
      const entriesThisMonth = allEntries.filter(entry => 
        isAfter(new Date(entry.createdAt), monthStart)
      ).length

      // Calculate morning entries percentage
      const morningEntries = allEntries.filter(entry => {
        const entryHour = new Date(entry.createdAt).getHours()
        return entryHour >= 5 && entryHour < 12 // Between 5 AM and noon
      }).length
      const morningPercentage = allEntries.length > 0 
        ? Math.round((morningEntries / allEntries.length) * 100)
        : 0

      // Calculate consistency
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const daysWithEntries = new Set(
        allEntries
          .filter(entry => isAfter(new Date(entry.createdAt), monthStart))
          .map(entry => format(new Date(entry.createdAt), 'yyyy-MM-dd'))
      ).size
      const consistency = Math.round((daysWithEntries / daysInMonth) * 100)
      
      // Calculate streaks
      let currentStreak = 0
      let longestStreak = 0
      let currentCount = 0
      
      // Group entries by date
      const entriesByDate = allEntries.reduce((acc, entry) => {
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
      
      // Calculate average time
      const totalTime = allEntries.reduce((sum, entry) => {
        const timeSpent = entry.metadata?.timeSpent || 0; // Time in minutes
        return sum + timeSpent;
      }, 0);
      const avgTime = allEntries.length > 0 ? Math.round(totalTime / allEntries.length) : 0;
      
      setStats({
        currentStreak,
        longestStreak,
        thisWeek: entriesThisWeek,
        thisMonth: entriesThisMonth,
        totalEntries: allEntries.length,
        morningPercentage,
        avgTime,
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

  // Load progress history for all goals
  const loadProgressHistory = async () => {
    try {
      if (!user) return;
      
      const updatesByGoal: Record<string, ProgressHistory[]> = {};
      
      // Load progress history for each goal
      for (const goal of goals) {
        const history = await getProgressHistory(goal.id!, user.uid);
        updatesByGoal[goal.id!] = history;
      }
      
      setTrackingUpdates(updatesByGoal);
    } catch (error) {
      console.error('Error loading progress history:', error);
    }
  };

  // Add useEffect to load progress history when goals change
  useEffect(() => {
    if (user && goals.length > 0) {
      loadProgressHistory();
    }
  }, [user, goals]);

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
    { name: "Mood & Feelings", count: entries.filter(e => e.type === "mood-feelings").length, icon: getIconForCategory("mood-feelings"), color: "bg-red-500" },
    { name: "Tracking & Logs", count: entries.filter(e => e.type === "tracking-logs").length, icon: getIconForCategory("tracking-logs"), color: "bg-blue-500" },
    { name: "Gratitude & Reflection", count: entries.filter(e => e.type === "gratitude-reflection").length, icon: getIconForCategory("gratitude-reflection"), color: "bg-yellow-500" },
    { name: "Goals & Intentions", count: entries.filter(e => e.type === "goals-intentions").length, icon: getIconForCategory("goals-intentions"), color: "bg-green-500" },
    { name: "Future Visioning", count: entries.filter(e => e.type === "future-visioning").length, icon: getIconForCategory("future-visioning"), color: "bg-purple-500" },
    { name: "Journaling Prompts", count: entries.filter(e => e.type === "journaling-prompts").length, icon: getIconForCategory("journaling-prompts"), color: "bg-indigo-500" },
    { name: "Daily Check-ins", count: entries.filter(e => e.type === "daily-checkins").length, icon: getIconForCategory("daily-checkins"), color: "bg-orange-500" },
    { name: "Challenges & Streaks", count: entries.filter(e => e.type === "challenges-streaks").length, icon: getIconForCategory("challenges-streaks"), color: "bg-pink-500" },
  ]

  // Total entries
  const totalEntries = entries.length

  // Add this function to get entry style based on view mode
  const getEntryStyle = (mode: ViewMode, index: number): string => {
    switch (mode) {
      case 'DIARY':
        return 'bg-white shadow-sm hover:shadow-md transition-shadow';
      case 'POSTIT':
        return `bg-yellow-50 shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1`;
      case 'PAPER':
        return 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow';
      case 'GRID':
        return 'bg-white shadow-sm hover:shadow-md transition-shadow';
      default:
        return 'bg-white shadow-sm hover:shadow-md transition-shadow';
    }
  };

  // Add this function to refresh entries
  const refreshEntries = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const allEntries: JournalEntry[] = [];
      for (const journal of journals) {
        const journalEntries = await getJournalEntries(user.uid, journal.id!);
        allEntries.push(...journalEntries);
      }
      setEntries(allEntries);
    } catch (err) {
      console.error('Error refreshing entries:', err);
    } finally {
      setLoading(false);
    }
  }, [user, journals]);

  // Add this computed value for filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          entry.metadata?.title?.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filter by date range
      if (dateRange.from || dateRange.to) {
        const entryDate = new Date(entry.createdAt);
        if (dateRange.from && entryDate < new Date(dateRange.from)) return false;
        if (dateRange.to && entryDate > new Date(dateRange.to)) return false;
      }

      // Filter by categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(entry.type || '')) {
        return false;
      }

      // Filter by tags
      if (selectedTags.length > 0 && !entry.tags?.some(tag => selectedTags.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [entries, searchQuery, dateRange, selectedCategories, selectedTags]);

  // Add this computed value for all tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(entry => {
      entry.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [entries]);

  // Add this computed value after the other useMemo hooks
  const moodEntries = useMemo(() => {
    const now = new Date()
    const startDate = new Date()
    
    switch (moodTimeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return entries
      .filter(entry => entry.type === 'mood-feelings' && entry.metadata?.moodLevel)
      .filter(entry => {
        const entryDate = new Date(entry.createdAt)
        return entryDate >= startDate && entryDate <= now
      })
      .map(entry => ({
        date: entry.createdAt,
        moodLevel: Number(entry.metadata?.moodLevel) || 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [entries, moodTimeRange])

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
  console.log('Current goals state:', goals);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Edit3 className="h-5 w-5" />
          <span>JournalMind</span>
        </Link>
        <Navigation onLogout={handleLogout} />
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

          {/* Metrics Grid */}
          <div className="space-y-4">
            <Tabs defaultValue="journal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="journal" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Journal Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Overview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="journal">
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
              </TabsContent>

              <TabsContent value="activity">
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
                      <div className="text-2xl font-bold">
                        {goals.length > 0 
                          ? `${goals.filter(g => {
                              // Calculate overall progress across all targets
                              return g.targets?.every(target => {
                                const progress = Number(target.currentValue || 0);
                                const targetValue = Number(target.value || 0);
                                // Only count targets that have a valid value
                                return targetValue === 0 || (targetValue > 0 && progress >= targetValue);
                              });
                            }).length}/${goals.length}`
                          : "0/0"}
                      </div>
                      <p className="text-sm text-muted-foreground">goals completed</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Daily Affirmation */}
          <div className="mt-6">
            <DailyAffirmation journalTypeId="reflection" />
          </div>

          {/* Goal Progress Section */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Progress
              </h2>
              <Button variant="ghost" size="sm" className="text-blue-500" asChild>
                <Link href="/goals">View All Goals</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                // Calculate progress for each target using tracking updates
                const allProgresses = goal.targets.map(target => {
                  const targetUpdates = trackingUpdates[goal.id!]?.filter(update => update.targetName === target.name) || [];
                  // Sort updates by timestamp in descending order (newest first)
                  const sortedUpdates = [...targetUpdates].sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  );
                  const latestUpdate = sortedUpdates[0]; // Get the first (most recent) update
                  const current = latestUpdate ? Number(latestUpdate.value) : Number(target.currentValue);
                  const targetValue = Number(target.value);
                  const startValue = Number(target.startValue);
                  
                  if (target.direction === 'min') {
                    const totalImprovement = startValue - targetValue;
                    const currentImprovement = startValue - current;
                    return Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100));
                  } else {
                    return Math.min(100, Math.max(0, (current / targetValue) * 100));
                  }
                });

                // Calculate overall progress as median
                const overallProgress = calculateMedian(allProgresses);

                // Check if all targets are met
                const isCompleted = goal.targets.every(target => {
                  const targetUpdates = trackingUpdates[goal.id!]?.filter(update => update.targetName === target.name) || [];
                  const sortedUpdates = [...targetUpdates].sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  );
                  const latestUpdate = sortedUpdates[0];
                  const current = latestUpdate ? Number(latestUpdate.value) : Number(target.currentValue);
                  const targetValue = Number(target.value);
                  
                  if (target.direction === 'min') {
                    return current <= targetValue;
                  } else {
                    return current >= targetValue;
                  }
                });

                return (
                  <Card key={goal.id} className={isCompleted ? "bg-green-50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{goal.title}</h3>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">{goal.category}</div>
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className={isCompleted ? "text-green-500 font-medium" : ""}>
                            {Math.round(overallProgress)}%
                          </span>
                        </div>
                        <Progress 
                          value={overallProgress} 
                          className={isCompleted ? "bg-green-100" : ""}
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          {goal.description || "No description provided"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Entries */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Entries</h2>
                <Button variant="ghost" size="sm" className="text-blue-500" asChild>
                  <Link href="/journal/browse">View All</Link>
                </Button>
              </div>

              <div className="space-y-6">
                {entries.slice(0, 3).map((entry) => {
                  const categoryStyles = getCategoryStyles(entry.type || 'mood-feelings')
                  return (
                    <Card key={entry.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                              categoryStyles.bgColorLight,
                              categoryStyles.color
                            )}>
                              {React.createElement(categoryStyles.icon, { className: "h-3.5 w-3.5" })}
                              {formatCategoryName(entry.type || 'mood-feelings')}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {entry.createdAt instanceof Date 
                                ? format(entry.createdAt, 'MMM d, yyyy')
                                : format(new Date(entry.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted text-red-500 hover:text-red-600"
                            onClick={async () => {
                              if (!user) return;
                              if (window.confirm('Are you sure you want to delete this entry?')) {
                                try {
                                  if (!entry.journalId) {
                                    console.error('No journal ID found in entry')
                                    return
                                  }
                                  
                                  setLoading(true)
                                  await deleteJournalEntry(user.uid, entry.journalId, entry.id!)
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
                        <div className="mt-4">
                          <h3 className="font-medium">
                            {entry.metadata?.title || formatCategoryName(entry.type || 'mood-feelings')}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {entry.metadata?.firstTextBox || entry.content}
                          </p>
                        </div>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag} 
                                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4">
                          <Link
                            href={`/journal/${entry.journalId}/entry/${entry.id}`}
                            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                          >
                            Read More
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="lg:col-span-4">
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
        </div>
      </main>
    </div>
  )
}

