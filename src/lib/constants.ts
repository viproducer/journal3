import { 
  Heart,
  BarChart2,
  Star,
  Target,
  Compass,
  HelpCircle,
  Sun,
  Zap
} from "lucide-react"

export const CATEGORIES = [
  { 
    id: "mood-feelings", 
    name: "Mood & Feelings", 
    icon: Heart, 
    color: "text-red-500",
    bgColor: "bg-red-500",
    bgColorLight: "bg-red-100",
    borderColor: "border-red-200",
    hoverBg: "hover:bg-red-50"
  },
  { 
    id: "tracking-logs", 
    name: "Tracking & Logs", 
    icon: BarChart2, 
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    bgColorLight: "bg-blue-100",
    borderColor: "border-blue-200",
    hoverBg: "hover:bg-blue-50"
  },
  { 
    id: "gratitude-reflection", 
    name: "Gratitude & Reflection", 
    icon: Star, 
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    bgColorLight: "bg-yellow-100",
    borderColor: "border-yellow-200",
    hoverBg: "hover:bg-yellow-50"
  },
  { 
    id: "goals-intentions", 
    name: "Goals & Intentions", 
    icon: Target, 
    color: "text-green-500",
    bgColor: "bg-green-500",
    bgColorLight: "bg-green-100",
    borderColor: "border-green-200",
    hoverBg: "hover:bg-green-50"
  },
  { 
    id: "future-visioning", 
    name: "Future Visioning", 
    icon: Compass, 
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    bgColorLight: "bg-purple-100",
    borderColor: "border-purple-200",
    hoverBg: "hover:bg-purple-50"
  },
  { 
    id: "journaling-prompts", 
    name: "Journaling Prompts", 
    icon: HelpCircle, 
    color: "text-indigo-500",
    bgColor: "bg-indigo-500",
    bgColorLight: "bg-indigo-100",
    borderColor: "border-indigo-200",
    hoverBg: "hover:bg-indigo-50"
  },
  { 
    id: "daily-checkins", 
    name: "Daily Check-ins", 
    icon: Sun, 
    color: "text-orange-500",
    bgColor: "bg-orange-500",
    bgColorLight: "bg-orange-100",
    borderColor: "border-orange-200",
    hoverBg: "hover:bg-orange-50"
  },
  { 
    id: "challenges-streaks", 
    name: "Challenges & Streaks", 
    icon: Zap, 
    color: "text-pink-500",
    bgColor: "bg-pink-500",
    bgColorLight: "bg-pink-100",
    borderColor: "border-pink-200",
    hoverBg: "hover:bg-pink-50"
  }
]

export function getCategoryStyles(categoryId: string) {
  const category = CATEGORIES.find(c => c.id === categoryId)
  return category || CATEGORIES[0] // Default to first category if not found
}

export function formatCategoryName(categoryId: string) {
  return categoryId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
} 