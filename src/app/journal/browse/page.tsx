"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth"
import { getJournalEntries, deleteJournalEntry, getUserJournals } from "@/lib/firebase/db"
import { JournalEntry } from "@/lib/firebase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import * as React from "react"
import { 
  Search, 
  Tag, 
  Filter, 
  X, 
  Edit3, 
  LogOut,
  LayoutGrid,
  BookOpen,
  StickyNote,
  ScrollText,
  Heart,
  BarChart2,
  Star,
  Target,
  Compass,
  HelpCircle,
  Sun,
  Zap,
  Clock,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategoryStyles, formatCategoryName } from "@/lib/constants"
import { Navigation } from "@/components/Navigation"

const VIEW_OPTIONS = {
  DIARY: 'diary',
  POSTIT: 'postit',
  PAPER: 'paper',
  GRID: 'grid'
} as const

const CATEGORIES = [
  {
    id: 'mood-feelings',
    name: 'Mood & Feelings',
    icon: Heart,
    color: 'bg-pink-500 hover:bg-pink-600 text-white',
    hoverColor: 'hover:bg-pink-50 text-pink-500'
  },
  {
    id: 'tracking-logs',
    name: 'Tracking & Logs',
    icon: BarChart2,
    color: 'bg-blue-500 hover:bg-blue-600 text-white',
    hoverColor: 'hover:bg-blue-50 text-blue-500'
  },
  {
    id: 'gratitude-reflection',
    name: 'Gratitude & Reflection',
    icon: Star,
    color: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    hoverColor: 'hover:bg-yellow-50 text-yellow-500'
  },
  {
    id: 'goals-intentions',
    name: 'Goals & Intentions',
    icon: Target,
    color: 'bg-green-500 hover:bg-green-600 text-white',
    hoverColor: 'hover:bg-green-50 text-green-500'
  },
  {
    id: 'future-visioning',
    name: 'Future Visioning',
    icon: Compass,
    color: 'bg-purple-500 hover:bg-purple-600 text-white',
    hoverColor: 'hover:bg-purple-50 text-purple-500'
  },
  {
    id: 'journaling-prompts',
    name: 'Journaling Prompts',
    icon: HelpCircle,
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
    hoverColor: 'hover:bg-orange-50 text-orange-500'
  },
  {
    id: 'daily-checkins',
    name: 'Daily Check-ins',
    icon: Sun,
    color: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    hoverColor: 'hover:bg-indigo-50 text-indigo-500'
  },
  {
    id: 'challenges-streaks',
    name: 'Challenges & Streaks',
    icon: Zap,
    color: 'bg-red-500 hover:bg-red-600 text-white',
    hoverColor: 'hover:bg-red-50 text-red-500'
  }
]

const EXPANDED_FIELDS = {
  'mood-feelings': ['mood', 'feelings', 'triggers', 'copingStrategies'],
  'gratitude-reflection': ['gratitudePoints', 'highlight', 'learnings', 'nextSteps'],
  'future-visioning': ['visionDescription', 'actionSteps', 'obstacles', 'supportNeeded'],
  'goals-intentions': ['goal', 'intention', 'actionSteps', 'timeline'],
  'tracking-logs': ['metric', 'value', 'notes'],
  'daily-checkins': ['energy', 'focus', 'productivity', 'notes'],
  'challenges-streaks': ['challenge', 'progress', 'notes'],
  'journaling-prompts': ['prompt', 'response']
}

export default function BrowseJournalPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{
    from: string
    to: string
  }>({
    from: "",
    to: "",
  })
  const [viewMode, setViewMode] = useState<keyof typeof VIEW_OPTIONS>('DIARY')
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadEntries = async () => {
      try {
        setLoading(true)
        const userJournals = await getUserJournals(user.uid)
        
        // Load entries from all journals
        const allEntries: JournalEntry[] = []
        for (const journal of userJournals) {
          try {
            const journalEntries = await getJournalEntries(user.uid, journal.id!)
            allEntries.push(...journalEntries)
          } catch (entriesError) {
            console.warn(`Could not load entries for journal ${journal.id}:`, entriesError)
          }
        }

        // Sort entries by date (newest first)
        allEntries.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0)
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0)
          return dateB.getTime() - dateA.getTime()
        })
        
        setEntries(allEntries)
        
        // Extract all unique tags
        const tags = new Set<string>()
        allEntries.forEach(entry => {
          entry.tags?.forEach(tag => tags.add(tag))
        })
        setAllTags(Array.from(tags))
        
        setFilteredEntries(allEntries)
      } catch (error) {
        console.error("Error loading entries:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [user])

  // Update refreshEntries to match the new loading logic
  const refreshEntries = async () => {
    if (!user) return
    try {
      setLoading(true)
      const userJournals = await getUserJournals(user.uid)
      
      // Load entries from all journals
      const allEntries: JournalEntry[] = []
      for (const journal of userJournals) {
        try {
          const journalEntries = await getJournalEntries(user.uid, journal.id!)
          allEntries.push(...journalEntries)
        } catch (entriesError) {
          console.warn(`Could not load entries for journal ${journal.id}:`, entriesError)
        }
      }

      // Sort entries by date (newest first)
      allEntries.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0)
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setEntries(allEntries)
      
      // Extract all unique tags
      const tags = new Set<string>()
      allEntries.forEach(entry => {
        entry.tags?.forEach(tag => tags.add(tag))
      })
      setAllTags(Array.from(tags))
      
      setFilteredEntries(allEntries)
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...entries]

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.metadata?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        entry.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(entry =>
        selectedCategories.includes(entry.metadata?.type || '')
      )
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.createdAt)
        if (dateRange.from && dateRange.to) {
          return entryDate >= new Date(dateRange.from) && entryDate <= new Date(dateRange.to)
        } else if (dateRange.from) {
          return entryDate >= new Date(dateRange.from)
        } else if (dateRange.to) {
          return entryDate <= new Date(dateRange.to)
        }
        return true
      })
    }

    setFilteredEntries(filtered)
  }, [searchQuery, selectedTags, selectedCategories, dateRange, entries])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getEntryStyle = (viewMode: keyof typeof VIEW_OPTIONS, index: number) => {
    const baseStyles = "group relative overflow-hidden rounded-lg p-6 transition-all hover:shadow-lg"
    
    switch (viewMode) {
      case 'DIARY':
        return cn(
          baseStyles,
          "bg-white border shadow-sm",
          "before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(to_bottom,#00000008_1px,transparent_1px)] before:bg-[size:100%_24px]"
        )
      case 'POSTIT':
        // Generate more varied rotation angles
        const rotations = [-3, -2, -1, 0, 1, 2, 3]
        const rotation = rotations[index % rotations.length]

        return cn(
          baseStyles,
          "bg-yellow-100",
          "shadow-md",
          `rotate-[${rotation}deg] hover:rotate-0 transition-transform duration-300`,
          "before:absolute before:bottom-0 before:right-0 before:h-[20px] before:w-[20px] before:bg-yellow-200 before:rounded-tl-lg"
        )
      case 'PAPER':
        return cn(
          baseStyles,
          "bg-[url('/paper-texture.png')] bg-white border-r border-b font-kalam",
          "before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] before:bg-[size:24px_24px]"
        )
      default:
        return cn(
          baseStyles,
          "bg-white border"
        )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
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

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Journal</h1>
            <Button asChild>
              <Link href="/journal/create-entry">New Entry</Link>
            </Button>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Date Range Inputs */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-auto"
              />
              <span>to</span>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-auto"
              />
              {(dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDateRange({ from: "", to: "" })}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* View Options */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">View as:</span>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as keyof typeof VIEW_OPTIONS)}>
              <TabsList>
                <TabsTrigger value="DIARY" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Diary
                </TabsTrigger>
                <TabsTrigger value="POSTIT" className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Post-its
                </TabsTrigger>
                <TabsTrigger value="PAPER" className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Paper
                </TabsTrigger>
                <TabsTrigger value="GRID" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <Button
                key={category.id}
                variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex items-center gap-2",
                  selectedCategories.includes(category.id) ? category.color : category.hoverColor
                )}
                onClick={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category.id)
                      ? prev.filter(c => c !== category.id)
                      : [...prev, category.id]
                  )
                }}
              >
                <category.icon className="h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>

          {/* Tags Filter */}
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Journal Entries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry, index) => {
            const categoryStyles = getCategoryStyles(entry.metadata?.type || 'mood-feelings')
            const isExpanded = expandedEntryId === entry.id
            const fields = EXPANDED_FIELDS[entry.metadata?.type as keyof typeof EXPANDED_FIELDS] || []
            
            return (
              <div 
                key={entry.id} 
                className={cn(
                  getEntryStyle(viewMode, index),
                  isExpanded && "col-span-full"
                )}
              >
                <div className="flex items-start justify-between relative z-10">
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
                    <div className="flex items-center gap-1">
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
                              await refreshEntries()
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
                </div>
                
                <div className={cn(
                  "transition-all duration-500 ease-in-out relative z-10",
                  isExpanded ? "max-h-[5000px] opacity-100" : "max-h-20 overflow-hidden opacity-90"
                )}>
                  {/* Main content */}
                  <div className="prose prose-sm max-w-none relative z-10">
                    <p className="text-sm whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>

                  {/* Metadata fields */}
                  {isExpanded && entry.metadata && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {Object.entries(entry.metadata).map(([key, value]) => {
                        if (key === 'type' || key === 'title' || !value) return null;
                        return (
                          <div key={key} className="space-y-1">
                            <h4 className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{value}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tags */}
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

                {/* Expand/Collapse button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedEntryId(isExpanded ? null : entry.id || null)}
                  className="self-center mt-2"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 