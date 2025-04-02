"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/firebase/auth"
import { getUserGoals, createGoal, updateGoal, deleteGoal, saveProgressHistory, getProgressHistory as getProgressHistoryFromDb, updateGoalTarget } from "@/lib/firebase/db"
import type { Goal, Target, UnitType, ProgressHistory, TrackingUpdate } from "@/lib/firebase/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit2, Trash2, Edit3, LogOut, Camera, X, BarChart3, BarChart } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Timestamp } from "firebase/firestore"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { uploadPhoto } from "@/lib/firebase/storage"
import imageCompression from 'browser-image-compression'
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { doc, getDoc, setDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from "recharts"
import { format } from "date-fns"
import { Navigation } from "@/components/Navigation"

const GOAL_CATEGORIES = {
  "Health": [
    "Walking",
    "Running",
    "Strength Training",
    "Yoga",
    "Swimming",
    "Cycling",
    "Sleep",
    "Nutrition",
    "Water Intake",
    "Meditation",
    "Mindful Walking",
    "Breathing Exercises"
  ],
  "Finance": [
    "Saving Money",
    "Investing Money",
    "Budgeting",
    "Debt Reduction",
    "Income Growth",
    "Expense Tracking"
  ],
  "Personal Growth": [
    "Learning",
    "Skill Development",
    "Habit Formation",
    "Career Development",
    "Reading",
    "Writing",
    "Public Speaking",
    "Language Learning"
  ],
  "Relationships": [
    "Family Time",
    "Social Connections",
    "Networking",
    "Communication",
    "Quality Time"
  ],
  "Creativity": [
    "Art",
    "Music",
    "Writing",
    "Photography",
    "Design",
    "Crafting"
  ],
  "Productivity": [
    "Task Management",
    "Time Management",
    "Project Completion",
    "Focus Time",
    "Organization"
  ],
  "Other": ["Custom"]
} as const;

const PERIODS = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "End Date"] as const;

const UNIT_SYSTEMS = ["metric", "imperial"] as const;

const UNIT_TYPES = {
  "distance": {
    metric: ["km", "m"],
    imperial: ["mi", "yd", "ft"]
  },
  "time": {
    metric: ["hr", "min", "sec"],
    imperial: ["hr", "min", "sec"]
  },
  "weight": {
    metric: ["kg", "g"],
    imperial: ["lb", "oz"]
  },
  "count": {
    metric: ["count", "reps", "sets", "laps", "times"],
    imperial: ["count", "reps", "sets", "laps", "times"]
  },
  "percentage": {
    metric: ["%"],
    imperial: ["%"]
  },
  "money": {
    metric: ["$", "€", "£"],
    imperial: ["$", "€", "£"]
  },
  "volume": {
    metric: ["L", "mL"],
    imperial: ["gal", "qt", "pt", "fl oz"]
  },
  "swimming": {
    metric: ["laps", "hr", "min", "sec", "m"],
    imperial: ["laps", "hr", "min", "sec", "yd"]
  },
  "running": {
    metric: ["km", "m", "hr", "min", "sec"],
    imperial: ["mi", "yd", "hr", "min", "sec"]
  },
  "cycling": {
    metric: ["km", "m", "hr", "min", "sec"],
    imperial: ["mi", "yd", "hr", "min", "sec"]
  },
  "strength": {
    metric: ["kg", "g", "reps", "sets"],
    imperial: ["lb", "oz", "reps", "sets"]
  }
} as const;

// Map categories and types to unit types
const CATEGORY_UNIT_TYPES: Record<keyof typeof GOAL_CATEGORIES, Record<string, keyof typeof UNIT_TYPES>> = {
  "Health": {
    "Walking": "distance",
    "Running": "running",
    "Strength Training": "strength",
    "Yoga": "time",
    "Swimming": "swimming",
    "Cycling": "cycling",
    "Sleep": "time",
    "Nutrition": "weight",
    "Water Intake": "volume",
    "Meditation": "time",
    "Mindful Walking": "distance",
    "Breathing Exercises": "time"
  },
  "Finance": {
    "Saving Money": "money",
    "Investing Money": "money",
    "Budgeting": "money",
    "Debt Reduction": "money",
    "Income Growth": "money",
    "Expense Tracking": "money"
  },
  "Personal Growth": {
    "Learning": "count",
    "Skill Development": "count",
    "Habit Formation": "count",
    "Career Development": "count",
    "Reading": "count",
    "Writing": "count",
    "Public Speaking": "count",
    "Language Learning": "count"
  },
  "Relationships": {
    "Family Time": "time",
    "Social Connections": "count",
    "Networking": "count",
    "Communication": "count",
    "Quality Time": "time"
  },
  "Creativity": {
    "Art": "count",
    "Music": "time",
    "Writing": "count",
    "Photography": "count",
    "Design": "count",
    "Crafting": "count"
  },
  "Productivity": {
    "Task Management": "count",
    "Time Management": "time",
    "Project Completion": "percentage",
    "Focus Time": "time",
    "Organization": "count"
  },
  "Other": {
    "Custom": "count"
  }
} as const;

// Add type for target update state
type TargetUpdateState = {
  [targetName: string]: {
    currentValue: number;
  };
};

// Add type for graph data
type GraphData = {
  date: Date;
  value: number;
  targetName: string;
};

// Add type for compression options
type CompressionOptions = {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
};

// Add photo validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PHOTOS = 4;
const COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};

// Add helper function to get default direction
const getDefaultDirection = (type: string): 'min' | 'max' => {
  const minTypes = ['Running', 'Swimming', 'Cycling', 'Time Management', 'Focus Time'];
  return minTypes.includes(type) ? 'min' : 'max';
};

// Add helper function to validate direction
const isValidDirection = (type: string, direction: 'min' | 'max'): boolean => {
  const defaultDir = getDefaultDirection(type);
  return direction === defaultDir;
};

// Add helper function to calculate median
const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

// Add helper function to format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Add helper function to calculate progress
const calculateProgressForUpdate = (
  target: Target,
  update: TrackingUpdate,
  targetValue: number
): number => {
  const currentValue = update.currentValue;
  const startValue = Number(target.startValue);

  if (target.direction === 'min') {
    // For minimum targets (like reducing time), progress increases as we get closer to target
    const totalImprovement = startValue - targetValue;
    const currentImprovement = startValue - currentValue;
    return Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100));
  } else {
    // For maximum targets (like increasing distance), progress is percentage of target
    return Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
  }
};

// Add helper function to handle Timestamp conversion
const convertToDate = (timestamp: Date | Timestamp | string): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  } else if (timestamp instanceof Date) {
    return timestamp;
  } else {
    return new Date(timestamp);
  }
};

// Add helper function to get progress history for graph
const getProgressHistoryForGraph = (
  goal: Goal,
  progressHistory: ProgressHistory[]
): GraphData[] => {
  const progressData: GraphData[] = [];

  // Add initial progress for each target and overall
  const startDate = goal.createdAt instanceof Timestamp 
    ? goal.createdAt.toDate() 
    : typeof goal.createdAt === 'string' 
      ? new Date(goal.createdAt)
      : goal.createdAt instanceof Date
        ? goal.createdAt
        : new Date();

  // Calculate initial progress for each target
  const targetProgresses = goal.targets.map(target => {
    const startValue = Number(target.startValue);
    const targetValue = Number(target.value);
    
    if (target.direction === 'min') {
      const totalImprovement = startValue - targetValue;
      const currentImprovement = startValue - startValue;
      return Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100));
    } else {
      return Math.min(100, Math.max(0, (startValue / targetValue) * 100));
    }
  });

  // Add initial data point for each target
  goal.targets.forEach((target, index) => {
    progressData.push({
      date: startDate,
      value: targetProgresses[index],
      targetName: target.name
    });
  });

  // Add initial overall progress
  progressData.push({
    date: startDate,
    value: calculateMedian(targetProgresses),
    targetName: 'Overall'
  });

  // Add progress from each history entry
  progressHistory.forEach(entry => {
    const target = goal.targets.find(t => t.name === entry.targetName);
    if (!target) return;

    const startValue = Number(target.startValue);
    const targetValue = Number(target.value);
    const currentValue = Number(entry.value);
    
    let progress = 0;
    if (target.direction === 'min') {
      const totalImprovement = startValue - targetValue;
      const currentImprovement = startValue - currentValue;
      progress = Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100));
    } else {
      progress = Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
    }

    // Add target-specific progress
    progressData.push({
      date: convertToDate(entry.timestamp),
      value: progress,
      targetName: entry.targetName
    });

    // Calculate and add overall progress for this timestamp
    const allTargetProgresses = goal.targets.map(t => {
      if (t.name === entry.targetName) {
        return progress;
      }
      const targetUpdates = progressHistory
        .filter(u => u.targetName === t.name && u.timestamp <= entry.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (targetUpdates.length === 0) {
        return Number(t.currentValue);
      }

      const latestUpdate = targetUpdates[0];
      const current = Number(latestUpdate.value);
      const targetValue = Number(t.value);
      const startValue = Number(t.startValue);

      if (t.direction === 'min') {
        const totalImprovement = startValue - targetValue;
        const currentImprovement = startValue - current;
        return Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100));
      } else {
        return Math.min(100, Math.max(0, (current / targetValue) * 100));
      }
    });

    progressData.push({
      date: convertToDate(entry.timestamp),
      value: calculateMedian(allTargetProgresses),
      targetName: 'Overall'
    });
  });

  // Sort data by date
  return progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export default function GoalsPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [trackingUpdates, setTrackingUpdates] = useState<Record<string, ProgressHistory[]>>({})
  const [currentUpdate, setCurrentUpdate] = useState<TargetUpdateState>({})
  const [reflection, setReflection] = useState("")
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [progressHistory, setProgressHistory] = useState<ProgressHistory[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goalStatement, setGoalStatement] = useState("")
  const [goalWhy, setGoalWhy] = useState("")
  const [nextSteps, setNextSteps] = useState("")
  const [category, setCategory] = useState<keyof typeof GOAL_CATEGORIES>("Health")
  const [type, setType] = useState<string>(GOAL_CATEGORIES["Health"][0])
  const [period, setPeriod] = useState<typeof PERIODS[number]>("Weekly")
  const [targets, setTargets] = useState<Target[]>([{
    name: "Target 1",
    value: "",
    unit: "",
    period: "Weekly",
    startValue: "0",
    currentValue: "0",
    unitType: "count",
    unitSystem: "metric",
    direction: "min"
  }])
  const [endDate, setEndDate] = useState("")
  const [unitSystem, setUnitSystem] = useState<typeof UNIT_SYSTEMS[number]>("metric")
  const [unitType, setUnitType] = useState<UnitType>("distance")
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  // Update the useEffect for unit type changes
  useEffect(() => {
    if (category && type) {
      const categoryTypes = CATEGORY_UNIT_TYPES[category]
      if (categoryTypes && type in categoryTypes) {
        const newUnitType = categoryTypes[type]
        if (newUnitType) {
          setUnitType(newUnitType)
          // Reset targets with default direction and all required fields
          const defaultDirection = getDefaultDirection(type)
          setTargets([{ 
            name: "Target 1", 
            value: "", 
            unit: "", 
            period: period || "Weekly",
            startValue: "0",
            currentValue: "0",
            unitType: newUnitType,
            unitSystem: unitSystem || "metric",
            direction: defaultDirection,
            targetDate: endDate || undefined
          }])
        }
      }
    }
  }, [category, type, period, unitSystem, endDate])

  useEffect(() => {
    if (!user) return

    const loadGoals = async () => {
      try {
        setLoading(true)
        const userGoals = await getUserGoals(user.uid)
        setGoals(userGoals)
      } catch (err) {
        console.error("Error loading goals:", err)
        setError("Failed to load goals")
      } finally {
        setLoading(false)
      }
    }

    loadGoals()
  }, [user])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setGoalStatement("")
    setGoalWhy("")
    setNextSteps("")
    setCategory("Health")
    setType(GOAL_CATEGORIES["Health"][0])
    setPeriod("Weekly")
    setTargets([{
      name: "Target 1",
      value: "",
      unit: "",
      period: "Weekly",
      startValue: "0",
      currentValue: "0",
      unitType: "count",
      unitSystem: "metric",
      direction: "min"
    }])
    setEndDate("")
    setUnitSystem("metric")
    setUnitType("distance")
    setEditingGoal(null)
  }

  const handleAddTarget = () => {
    setTargets([
      ...targets,
      {
        name: `Target ${targets.length + 1}`,
        value: "",
        unit: "",
        period: period || "Weekly",
        startValue: "0",
        currentValue: "0",
        unitType: unitType,
        unitSystem: unitSystem || "metric",
        direction: getDefaultDirection(type),
        targetDate: endDate || undefined
      }
    ]);
  };

  const handleRemoveTarget = (index: number) => {
    if (targets.length > 1) {
      setTargets(targets.filter((_, i) => i !== index))
    }
  }

  const handleTargetChange = (
    index: number, 
    field: keyof Target, 
    value: string
  ) => {
    const newTargets = [...targets];
    newTargets[index] = {
      ...newTargets[index],
      [field]: value
    };
    setTargets(newTargets);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a goal",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate required fields
      if (!title || !description || !category || !type || targets.some(t => !t.name || !t.value || !t.unit)) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Create goal object with default values for optional fields
      const goalData: Omit<Goal, 'id'> = {
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        targets: targets.map(t => ({
          name: t.name.trim(),
          value: t.value.trim(),
          unit: t.unit.trim(),
          period: period || "Weekly",
          startValue: t.startValue || "0",
          currentValue: t.currentValue || "0",
          unitType: t.unitType || unitType,
          unitSystem: t.unitSystem || unitSystem,
          direction: t.direction || getDefaultDirection(type)
        })),
        progress: 0,
        goalStatement: goalStatement?.trim() || "",
        goalWhy: goalWhy?.trim() || "",
        nextSteps: nextSteps?.trim() || "",
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          category,
          type
        }
      };

      if (editingGoal) {
        const updatedGoal = await updateGoal(user.uid, editingGoal.id!, goalData);
        setGoals(prev => prev.map(g => g.id === editingGoal.id ? updatedGoal : g));
        toast({
          title: "Success",
          description: "Goal updated successfully",
        });
      } else {
        const newGoal = await createGoal(goalData);
        setGoals(prev => [...prev, newGoal]);
        toast({
          title: "Success",
          description: "Goal created successfully",
        });
      }

      // Only close dialog and reset form after successful save
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to save goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (goal: Goal) => {
    setTitle(goal.title);
    setDescription(goal.description);
    setCategory(goal.category);
    setType(goal.type);
    setTargets(goal.targets.map(t => ({
      name: t.name,
      value: t.value,
      unit: t.unit,
      period: t.period,
      startValue: t.startValue,
      currentValue: t.currentValue,
      unitType: t.unitType,
      unitSystem: t.unitSystem,
      direction: t.direction
    })));
    setPeriod(goal.targets[0].period as typeof PERIODS[number]);
    setEndDate(goal.targets[0].targetDate || "");
    setGoalStatement(goal.goalStatement);
    setGoalWhy(goal.goalWhy);
    setNextSteps(goal.nextSteps);
    setIsDialogOpen(true);
    setIsEditMode(true);
    setEditingGoalId(goal.id!);
  };

  const handleDelete = async (goalId: string) => {
    if (!user || !confirm("Are you sure you want to delete this goal?")) return

    try {
      await deleteGoal(user.uid, goalId)
      setGoals(goals.filter(g => g.id !== goalId))
    } catch (err) {
      console.error("Error deleting goal:", err)
      setError("Failed to delete goal")
    }
  }

  const handleProgressUpdate = async (goal: Goal, newCurrent: number) => {
    if (!user) return

    try {
      const updatedGoal = {
        ...goal,
        progress: newCurrent,
        updatedAt: new Date()
      };
      await updateGoal(user.uid, goal.id!, updatedGoal);
      setGoals(goals.map(g => g.id === goal.id ? updatedGoal : g));
    } catch (err) {
      console.error("Error updating progress:", err);
      setError("Failed to update progress");
    }
  };

  const handleLogout = async () => {
    try {
      await logout()
      router.replace('/auth/signin')
    } catch (err) {
      setError('Failed to log out. Please try again.')
    }
  }

  // Add a function to get available units
  const getAvailableUnits = () => {
    if (!unitType || !unitSystem) return []
    return UNIT_TYPES[unitType]?.[unitSystem] || []
  }

  // Update handlePhotoSelect to use toast notifications
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file count
    if (photoFiles.length + files.length > MAX_PHOTOS) {
      toast({
        title: "Too many photos",
        description: `You can only upload up to ${MAX_PHOTOS} photos at once`,
        variant: "destructive",
      })
      return
    }

    // Validate and compress each file
    const validFiles = await Promise.all(
      files.map(async (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: `File ${file.name} is too large. Maximum size is 5MB`,
            variant: "destructive",
          })
          return null
        }

        try {
          const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS as CompressionOptions)
          return compressedFile
        } catch (error) {
          console.error('Error compressing image:', error)
          toast({
            title: "Error processing image",
            description: "Failed to process image. Please try again.",
            variant: "destructive",
          })
          return null
        }
      })
    )

    // Filter out null values and update state
    const newFiles = validFiles.filter((file): file is File => file !== null)
    setPhotoFiles(prev => [...prev, ...newFiles])

    // Create previews for new files
    const newPreviews = await Promise.all(
      newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })
    )
    setPhotoPreviews(prev => [...prev, ...newPreviews])
  }

  // Add function to remove a photo
  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Load progress history for all goals
  const loadProgressHistory = async () => {
    try {
      if (!user) return;
      
      const allProgress: ProgressHistory[] = [];
      const updatesByGoal: Record<string, ProgressHistory[]> = {};
      
      // Load progress history for each goal
      for (const goal of goals) {
        const history = await getProgressHistoryFromDb(goal.id!, user.uid);
        allProgress.push(...history);
        updatesByGoal[goal.id!] = history;
      }
      
      // Sort by timestamp
      allProgress.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setProgressHistory(allProgress);
      setTrackingUpdates(updatesByGoal);
    } catch (error) {
      console.error('Error loading progress history:', error);
      toast({
        title: "Error",
        description: "Failed to load progress history",
        variant: "destructive",
      });
    }
  };

  // Add useEffect to load progress history when goals change
  useEffect(() => {
    if (user && goals.length > 0) {
      loadProgressHistory();
    }
  }, [user, goals]);

  // Add helper function to handle tracking updates
  const handleTrackingUpdate = async (
    goalId: string,
    targetName: string,
    value: string,
    photoUrls: string[] = [],
    reflection: string = ''
  ) => {
    try {
      if (!user) {
        console.log('No user found, cannot update progress');
        return;
      }

      // Convert value to number and validate
      const numericValue = Number(value);
      if (isNaN(numericValue)) {
        throw new Error('Invalid value provided');
      }

      // Create progress history entry
      const update = {
        targetName,
        value: value,
        currentValue: numericValue,
        photoUrls: photoUrls || [],
        reflection: reflection || '',
        timestamp: new Date()
      };

      // Save progress history and update goal target
      console.log('Starting parallel operations for progress update');
      await Promise.all([
        saveProgressHistory(user.uid, goalId, [update], user.email || ''),
        updateGoalTarget(user.uid, goalId, targetName, numericValue)
      ]);
      console.log('Successfully completed parallel operations');

      // Update the goals state with the new progress
      setGoals(prevGoals => 
        prevGoals.map(goal => {
          if (goal.id !== goalId) return goal;

          // Update the specific target with new value
          const updatedTargets = goal.targets.map(target => {
            if (target.name === targetName) {
              return {
                ...target,
                currentValue: value
              };
            }
            return target;
          });

          // Calculate new progress for each target
          const targetProgresses = updatedTargets.map(target => {
            const current = target.name === targetName ? numericValue : Number(target.currentValue);
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

          // Calculate overall progress
          const overallProgress = calculateMedian(targetProgresses);

          return {
            ...goal,
            targets: updatedTargets,
            progress: overallProgress
          };
        })
      );

      // Reset form state
      setReflection('');
      setPhotoFiles([]);
      setPhotoPreviews([]);
      setCurrentUpdate({});
      setIsTrackingDialogOpen(false);

      // Reload progress history
      await loadProgressHistory();

      toast({
        title: "Success",
        description: "Progress updated successfully",
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update progress",
        variant: "destructive",
      });
    }
  };

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

      <main className="flex-1 container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Goals</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
              <DialogDescription>
                Set a new goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter goal title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter goal description"
                />
              </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goalStatement">Goal Statement</Label>
                    <Textarea
                      id="goalStatement"
                      value={goalStatement}
                      onChange={(e) => setGoalStatement(e.target.value)}
                      placeholder="What do you want to achieve?"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goalWhy">Why This Goal?</Label>
                    <Textarea
                      id="goalWhy"
                      value={goalWhy}
                      onChange={(e) => setGoalWhy(e.target.value)}
                      placeholder="Why is this goal important to you?"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextSteps">Next Steps</Label>
                    <Textarea
                      id="nextSteps"
                      value={nextSteps}
                      onChange={(e) => setNextSteps(e.target.value)}
                      placeholder="What are your next steps to achieve this goal?"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                    <Select 
                      value={category} 
                      onValueChange={(value: keyof typeof GOAL_CATEGORIES) => setCategory(value)}
                    >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(GOAL_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                    <Select 
                      value={type} 
                      onValueChange={(value: string) => setType(value)}
                    >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                        {category && GOAL_CATEGORIES[category]?.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Targets</h3>
                  </div>

                  {targets.map((target, index) => (
                    <div key={index} className="space-y-4 border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{target.name}</h4>
                        {targets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTarget(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* First Row: Target Name, Unit Type, Current Value, Target Value */}
                      <div className="grid grid-cols-4 gap-4">
              <div>
                          <Label htmlFor={`target-name-${index}`}>Target Name</Label>
                          <Input
                            id={`target-name-${index}`}
                            value={target.name}
                            onChange={(e) => handleTargetChange(index, 'name', e.target.value)}
                            placeholder="e.g., Distance, Time"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unit-${index}`}>Unit Type</Label>
                          <Select 
                            value={target.unit} 
                            onValueChange={(value) => handleTargetChange(index, 'unit', value)}
                          >
                  <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                              {getAvailableUnits().map((u) => (
                                <SelectItem key={u} value={u}>
                                  {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                        <div>
                          <Label htmlFor={`current-value-${index}`}>Current Value</Label>
                  <Input
                            id={`current-value-${index}`}
                    type="number"
                            value={target.currentValue}
                            onChange={(e) => handleTargetChange(index, 'currentValue', e.target.value)}
                            placeholder="Enter current value"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`target-value-${index}`}>Target Value</Label>
                          <Input
                            id={`target-value-${index}`}
                            type="number"
                            value={target.value}
                            onChange={(e) => handleTargetChange(index, 'value', e.target.value)}
                    placeholder="Enter target value"
                    required
                  />
                </div>
                      </div>

                      {/* Second Row: Target Direction */}
                      <div>
                        <Label htmlFor={`target-direction-${index}`}>Target Direction</Label>
                  <Select 
                          value={target.direction} 
                          onValueChange={(value: 'min' | 'max') => handleTargetChange(index, 'direction', value)}
                  >
                    <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                            <SelectItem value="min">Minimum (e.g., running time)</SelectItem>
                            <SelectItem value="max">Maximum (e.g., weight loss)</SelectItem>
                    </SelectContent>
                  </Select>
                        {!isValidDirection(type, target.direction) && (
                          <p className="text-sm text-red-500 mt-1">
                            This direction may not be appropriate for {type} goals
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {target.direction === 'min' 
                            ? "Progress increases as you get closer to the target (e.g., running faster)"
                            : "Progress increases as you exceed the target (e.g., running further)"}
                        </p>
                </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTarget}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Target
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="period">Period</Label>
                  <Select 
                      value={period} 
                      onValueChange={(value: typeof PERIODS[number]) => setPeriod(value)}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        {PERIODS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div>
                    <Label htmlFor="end-date">Goal End Date</Label>
                <Input
                      id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                      disabled={period !== "End Date"}
                    />
                  </div>
                </div>

                <div>
                  <Label>Unit System</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={unitSystem === "metric" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUnitSystem("metric")}
                      className="w-full"
                    >
                      Metric
                    </Button>
                    <Button
                      variant={unitSystem === "imperial" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUnitSystem("imperial")}
                      className="w-full"
                    >
                      Imperial
                    </Button>
                  </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  console.log('Submit button clicked');
                  handleSubmit();
                }}
              >
                {editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription>{goal.category}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(goal)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(goal.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {goal.description && (
                <p className="mb-4 text-sm text-gray-600">{goal.description}</p>
              )}
                <div className="space-y-4">
                  {goal.targets.map((target, index) => {
                    // Get the most recent tracking update for this target
                    const targetUpdates = trackingUpdates[goal.id!]?.filter(update => update.targetName === target.name) || []
                    // Sort updates by timestamp in descending order (newest first)
                    const sortedUpdates = [...targetUpdates].sort((a, b) => 
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )
                    const latestUpdate = sortedUpdates[0] // Get the first (most recent) update
                    const current = latestUpdate ? Number(latestUpdate.value) : Number(target.currentValue)
                    const targetValue = Number(target.value)
                    const startValue = Number(target.startValue)
                    let progress = 0
                    let isOverTarget = false

                    if (target.direction === 'min') {
                      // For minimum targets (e.g., time), calculate progress based on improvement from start
                      const totalImprovement = startValue - targetValue
                      const currentImprovement = startValue - current
                      progress = Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100))
                      isOverTarget = current > targetValue
                    } else {
                      // For maximum targets (e.g., distance), progress increases as we exceed target
                      progress = Math.min(100, Math.max(0, (current / targetValue) * 100))
                      isOverTarget = current < targetValue
                    }

                    return (
                      <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                          <span>{target.name}: {current} / {target.value} {target.unit}</span>
                          <span className={isOverTarget ? "text-red-500" : ""}>
                            {Math.round(progress)}%
                          </span>
                </div>
                        <div className="relative">
                          <Progress 
                            value={progress} 
                            className={isOverTarget ? "bg-red-100" : ""}
                          />
                          {isOverTarget && (
                            <div className="absolute inset-0 border-2 border-red-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  <Tabs defaultValue="overall" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overall">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overall Progress
                      </TabsTrigger>
                      <TabsTrigger value="trend">
                        <BarChart className="h-4 w-4 mr-2" />
                        Progress Trend
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overall">
                      {(() => {
                        const allProgresses = goal.targets.map(target => {
                          const targetUpdates = trackingUpdates[goal.id!]?.filter(update => update.targetName === target.name) || []
                          // Sort updates by timestamp in descending order (newest first)
                          const sortedUpdates = [...targetUpdates].sort((a, b) => 
                            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                          )
                          const latestUpdate = sortedUpdates[0] // Get the first (most recent) update
                          const current = latestUpdate ? Number(latestUpdate.value) : Number(target.currentValue)
                          const targetValue = Number(target.value)
                          const startValue = Number(target.startValue)
                          
                          if (target.direction === 'min') {
                            const totalImprovement = startValue - targetValue
                            const currentImprovement = startValue - current
                            return Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100))
                          } else {
                            return Math.min(100, Math.max(0, (current / targetValue) * 100))
                          }
                        })
                        
                        const medianProgress = calculateMedian(allProgresses)
                        
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-medium">
                              <span>Overall Progress</span>
                              <span>{Math.round(medianProgress)}%</span>
                            </div>
                            <Progress value={medianProgress} />
                          </div>
                        )
                      })()}
                    </TabsContent>
                    <TabsContent value="trend">
                      <div className="space-y-6">
                        {/* Progress Graph */}
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-lg font-semibold mb-4">Progress Over Time</h3>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getProgressHistoryForGraph(goal, progressHistory)}>
                                <XAxis 
                                  dataKey="date" 
                                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                />
                                <YAxis 
                                  domain={[0, 100]}
                                  tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                  labelFormatter={(value: any) => {
                                    if (!value || !value.date) return '';
                                    return format(new Date(value.date), 'MMM d, yyyy');
                                  }}
                                  formatter={(value, name) => [`${value}%`, name]}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#2563eb" 
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  name="Overall Progress"
                                  data={getProgressHistoryForGraph(goal, progressHistory).filter(d => d.targetName === 'Overall')}
                                />
                                {goal.targets.map((target, index) => (
                                  <Line
                                    key={target.name}
                                    type="monotone"
                                    dataKey="value"
                                    stroke={index === 0 ? "#22c55e" : "#f59e0b"}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    name={`${target.name} (${target.value} ${target.unit})`}
                                    data={getProgressHistoryForGraph(goal, progressHistory).filter(d => d.targetName === target.name)}
                                  />
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Progress History List */}
                        <div className="bg-white rounded-lg shadow p-6">
                          <h3 className="text-lg font-semibold mb-4">Progress History</h3>
                          <div className="space-y-4">
                            {trackingUpdates[goal.id!]?.length > 0 ? (
                              trackingUpdates[goal.id!]?.map((update) => (
                                <div 
                                  key={update.id} 
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">
                                          {update.value}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {update.targetName}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {format(new Date(update.timestamp), 'MMM d, yyyy h:mm a')}
                                      </p>
                                    </div>
                                  </div>
                                  {update.reflection && (
                                    <p className="text-sm text-gray-600 italic">
                                      "{update.reflection}"
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-center py-4">
                                No progress entries yet. Start tracking your progress to see your history here.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress Photos */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Progress Photos</h3>
                            {trackingUpdates[goal.id!]?.some(update => update.photoUrls?.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                                onClick={() => {
                                  setSelectedGoal(goal);
                                  setIsGalleryOpen(true);
                                }}
                  >
                                View All Photos
                  </Button>
                            )}
                          </div>
                          
                          {trackingUpdates[goal.id!]?.some(update => update.photoUrls?.length > 0) ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {trackingUpdates[goal.id!]
                                ?.filter(update => update.photoUrls?.length > 0)
                                .slice(0, 3) // Show only the 3 most recent photos
                                .map((update, updateIndex) => (
                                  update.photoUrls?.map((url, photoIndex) => (
                                    <div
                                      key={`${updateIndex}-${photoIndex}`}
                                      className="relative aspect-video cursor-pointer group"
                                      onClick={() => {
                                        setSelectedGoal(goal);
                                        setSelectedPhotoIndex(updateIndex * MAX_PHOTOS + photoIndex);
                                        setIsGalleryOpen(true);
                                      }}
                                    >
                                      <Image
                                        src={url}
                                        alt={`Progress photo from ${formatDate(convertToDate(update.timestamp))}`}
                                        fill
                                        className="object-cover rounded-lg"
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
                                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs">
                                        {formatDate(convertToDate(update.timestamp))}
                                      </div>
                                    </div>
                                  ))
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-sm text-gray-500">
                              No progress photos yet. Add photos when tracking your progress.
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="flex justify-end">
                    <Dialog open={isTrackingDialogOpen && selectedGoal?.id === goal.id} onOpenChange={setIsTrackingDialogOpen}>
                      <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                          onClick={() => {
                            setSelectedGoal(goal)
                            setIsTrackingDialogOpen(true)
                          }}
                  >
                          Track Progress
                  </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Track Progress</DialogTitle>
                          <DialogDescription>
                            Update your progress and reflect on your journey
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {goal.targets.map((target, index) => (
                            <div key={index} className="space-y-2">
                              <Label>{target.name}</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={currentUpdate[target.name]?.currentValue || target.currentValue}
                                  onChange={(e) => setCurrentUpdate(prev => ({
                                    ...prev,
                                    [target.name]: {
                                      currentValue: Number(e.target.value)
                                    }
                                  }))}
                                  placeholder={`Enter current ${target.unit}`}
                                  className="flex-1"
                                />
                                <span className="text-sm text-gray-500">{target.unit}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Target: {target.value} {target.unit}
                              </div>
                            </div>
                          ))}
                          <div>
                            <Label>Photos (Optional)</Label>
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Input
                                  id="photo-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoSelect}
                                  multiple
                                  className="hidden"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById('photo-upload')?.click()}
                                  className="w-full"
                                  disabled={photoFiles.length >= MAX_PHOTOS}
                                >
                                  <Camera className="mr-2 h-4 w-4" />
                                  {photoFiles.length > 0 ? 'Add More Photos' : 'Upload Photos'}
                                  {photoFiles.length > 0 && ` (${photoFiles.length}/${MAX_PHOTOS})`}
                                </Button>
                              </div>
                              {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                  {photoPreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-video group">
                                      <Image
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg"
                                      />
                                      <button
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {trackingUpdates[goal.id!]?.some(update => update.photoUrls?.length > 0) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsGalleryOpen(true)}
                                  className="w-full"
                                >
                                  View Photo Gallery
                                </Button>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label>Reflection</Label>
                            <Textarea
                              value={reflection}
                              onChange={(e) => setReflection(e.target.value)}
                              placeholder="How are you feeling about your progress?"
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTrackingDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={async () => {
                            if (!user) return;
                            
                            // Update all targets
                            const photoUrls = photoFiles.length > 0 
                              ? await Promise.all(photoFiles.map(file => uploadPhoto(file, user.uid))) 
                              : [];
                            
                            // Create an array of promises for each target update
                            const updatePromises = goal.targets.map(target => 
                              handleTrackingUpdate(
                                goal.id!,
                                target.name,
                                Number(currentUpdate[target.name]?.currentValue || target.currentValue).toString(),
                                photoUrls,
                                reflection
                              )
                            );
                            
                            // Wait for all updates to complete
                            await Promise.all(updatePromises);
                          }}>
                            Update Progress
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Started: {goal.createdAt ? (goal.createdAt instanceof Timestamp ? goal.createdAt.toDate().toLocaleDateString() : new Date(goal.createdAt).toLocaleDateString()) : 'Not set'}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

        {/* Photo Gallery Dialog */}
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Progress Photo Gallery</DialogTitle>
              <DialogDescription>
                View your progress photos over time
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {trackingUpdates[selectedGoal?.id!]?.map((update, updateIndex) => (
                update.photoUrls?.map((url, photoIndex) => (
                  <div
                    key={`${updateIndex}-${photoIndex}`}
                    className="relative aspect-video cursor-pointer"
                    onClick={() => setSelectedPhotoIndex(updateIndex * MAX_PHOTOS + photoIndex)}
                  >
                    <Image
                      src={url}
                      alt={`Progress photo ${photoIndex + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                      {formatDate(convertToDate(update.timestamp))}
                    </div>
                  </div>
                ))
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Full-screen Photo View */}
        {selectedPhotoIndex !== null && (
          <Dialog open={true} onOpenChange={() => setSelectedPhotoIndex(null)}>
            <DialogContent className="max-w-4xl">
              <div className="relative aspect-video">
                <Image
                  src={trackingUpdates[selectedGoal?.id!]?.flatMap(update => update.photoUrls || [])[selectedPhotoIndex] || ''}
                  alt="Full size photo"
                  fill
                  className="object-contain"
                />
                <button
                  onClick={() => setSelectedPhotoIndex(null)}
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
      <Toaster />
    </div>
  )
} 