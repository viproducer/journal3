import { db } from '@/lib/firebase/config'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, CollectionReference } from 'firebase/firestore'
import { MarketplaceTemplate } from './types'
import { setDoc } from 'firebase/firestore'

const TEMPLATES_COLLECTION = 'templates'

export const templatesCollection = collection(db, TEMPLATES_COLLECTION)

export async function createTemplate(template: MarketplaceTemplate) {
  try {
    const { settings, howItWorks, ...templateData } = template
    const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
      ...templateData,
      howItWorks,
      isActive: settings.active,
      isPublic: settings.public,
      allowCustomization: settings.allowCustomization,
      maxEntries: settings.maxEntries,
      requireApproval: settings.requireApproval,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return { ...template, id: docRef.id }
  } catch (error) {
    console.error('Error creating template:', error)
    throw error
  }
}

export async function getTemplate(templateId: string) {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        settings: {
          active: data.isActive,
          public: data.isPublic,
          allowCustomization: data.allowCustomization,
          maxEntries: data.maxEntries,
          requireApproval: data.requireApproval
        }
      } as MarketplaceTemplate
    } else {
      throw new Error('Template not found')
    }
  } catch (error) {
    console.error('Error getting template:', error)
    throw error
  }
}

export async function updateTemplate(templateId: string, updates: Partial<MarketplaceTemplate>) {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
    return { id: templateId, ...updates }
  } catch (error) {
    console.error('Error updating template:', error)
    throw error
  }
}

export async function deleteTemplate(templateId: string) {
  try {
    if (!templateId) {
      console.error('No template ID provided')
      throw new Error('Template ID is required')
    }
    console.log('Deleting template with ID:', templateId)
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await deleteDoc(docRef)
    console.log('Template deleted successfully')
    return true
  } catch (error) {
    console.error('Error deleting template:', error)
    throw error
  }
}

export async function getTemplates(options: {
  isActive?: boolean
  isPublic?: boolean
  creatorId?: string
  category?: string
} = {}) {
  try {
    const collectionRef = collection(db, TEMPLATES_COLLECTION) as CollectionReference
    const conditions = []

    if (options.isActive !== undefined) {
      conditions.push(where('isActive', '==', options.isActive))
    }
    if (options.isPublic !== undefined) {
      conditions.push(where('isPublic', '==', options.isPublic))
    }
    if (options.creatorId) {
      conditions.push(where('creatorId', '==', options.creatorId))
    }
    if (options.category) {
      conditions.push(where('category', '==', options.category))
    }

    conditions.push(orderBy('createdAt', 'desc'))

    const q = query(collectionRef, ...conditions)
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      const template = {
        id: doc.id,
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        features: data.features || [],
        tags: data.tags || [],
        journalTypes: data.journalTypes || [],
        icon: data.icon,
        color: data.color,
        howItWorks: data.howItWorks,
        settings: {
          active: data.isActive,
          public: data.isPublic,
          allowCustomization: data.allowCustomization,
          maxEntries: data.maxEntries,
          requireApproval: data.requireApproval
        },
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as MarketplaceTemplate
      return template
    })
  } catch (error) {
    console.error('Error getting templates:', error)
    throw error
  }
}

export async function getPublicTemplates() {
  try {
    // First try with the composite index
    return await getTemplates({ isActive: true, isPublic: true })
  } catch (error: any) {
    // If the error is about missing index, fall back to a simpler query
    if (error?.code === 'failed-precondition' && error?.message?.includes('requires an index')) {
      console.log('Index not ready, falling back to simpler query')
      const collectionRef = collection(db, TEMPLATES_COLLECTION)
      const q = query(
        collectionRef,
        where('isActive', '==', true),
        where('isPublic', '==', true)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          features: data.features || [],
          tags: data.tags || [],
          journalTypes: data.journalTypes || [],
          icon: data.icon,
          color: data.color,
          howItWorks: data.howItWorks,
          settings: {
            active: data.isActive,
            public: data.isPublic,
            allowCustomization: data.allowCustomization,
            maxEntries: data.maxEntries,
            requireApproval: data.requireApproval
          },
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as MarketplaceTemplate
      })
    }
    throw error
  }
}

export async function getCreatorTemplates(creatorId: string) {
  return getTemplates({ creatorId })
}

export async function getCategoryTemplates(category: string) {
  return getTemplates({ category, isActive: true, isPublic: true })
}

export async function createPredefinedTemplate(template: Omit<MarketplaceTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = doc(templatesCollection)
    await setDoc(docRef, {
      ...template,
      id: docRef.id,
      isActive: template.settings.active,
      isPublic: template.settings.public,
      allowCustomization: template.settings.allowCustomization,
      maxEntries: template.settings.maxEntries,
      requireApproval: template.settings.requireApproval,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return { id: docRef.id, ...template }
  } catch (error) {
    console.error('Error creating predefined template:', error)
    throw error
  }
}

export async function createHouseholdChoresTemplate(creatorId: string) {
  return createPredefinedTemplate({
    name: "Household Chores Journal",
    description: "Track who does what at home, schedule tasks, and ensure fair distribution of household responsibilities.",
    category: "Home Management",
    price: 0,
    features: [
      "Task scheduling and reminders",
      "Chore rotation system",
      "Family member assignments",
      "Progress tracking",
      "Customizable chore lists",
      "Weekly and monthly planning"
    ],
    tags: ["household", "chores", "cleaning", "organization", "family"],
    journalTypes: [
      {
        id: "household_chores",
        name: "Household Chores",
        description: "Track and manage household tasks and responsibilities",
        fields: [
          {
            id: "task_name",
            name: "task_name",
            label: "Task Name",
            type: "text",
            required: true,
            placeholder: "Enter task name",
            description: "What needs to be done?"
          },
          {
            id: "assigned_to",
            name: "assigned_to",
            label: "Assigned To",
            type: "select",
            required: true,
            options: ["Me", "Partner", "Children", "Other"],
            placeholder: "Who is responsible?",
            description: "Who will do this task?"
          },
          {
            id: "due_date",
            name: "due_date",
            label: "Due Date",
            type: "date",
            required: true,
            placeholder: "Select due date",
            description: "When should this be done?"
          },
          {
            id: "status",
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: ["Not Started", "In Progress", "Completed"],
            placeholder: "Select status",
            description: "Current status of the task"
          },
          {
            id: "notes",
            name: "notes",
            label: "Notes",
            type: "textarea",
            required: false,
            placeholder: "Add any notes about the task...",
            description: "Additional information about the task"
          }
        ],
        prompts: [
          "What chores need to be done today?",
          "Who is responsible for each task?",
          "Are there any special cleaning tasks this week?",
          "How can we make the distribution more fair?",
          "What new chores should we add to the routine?"
        ],
        icon: "🏠",
        color: "#4F46E5"
      }
    ],
    icon: "🏠",
    color: "#4F46E5",
    howItWorks: {
      tabs: [
        {
          title: "Setup",
          content: "Create your household chore list and assign responsibilities to family members. Set up recurring tasks and customize the schedule to fit your family's needs.",
          icon: "🎯"
        },
        {
          title: "Tracking",
          content: "Log completed tasks, track who did what, and monitor progress. Add notes about any issues or improvements needed.",
          icon: "📝"
        },
        {
          title: "Progress",
          content: "View task completion rates, identify patterns, and ensure fair distribution of household responsibilities.",
          icon: "📊"
        }
      ]
    },
    settings: {
      active: true,
      public: true,
      allowCustomization: true,
      requireApproval: false,
      maxEntries: 1000
    }
  })
}

export async function createCurlyHairTemplate(creatorId: string) {
  return createPredefinedTemplate({
    name: "Wavy & Curly Hair Journal",
    description: "Track and optimize your curly hair care routine with this comprehensive journal template. Monitor products, routines, and environmental factors to achieve your best curls.",
    category: "beauty",
    price: 0,
    features: [
      "Product library management",
      "Hair care routine tracking",
      "Environmental factor monitoring",
      "Photo progress tracking",
      "Goal setting and monitoring",
      "Custom routine creation"
    ],
    tags: ["hair", "curly", "beauty", "tracking", "routine"],
    journalTypes: [
      {
        id: "curly_hair",
        name: "Curly Hair Care",
        description: "Track your curly hair care routine and progress",
        fields: [
          {
            id: "product_name",
            name: "product_name",
            label: "Product Name",
            type: "text",
            required: true,
            placeholder: "e.g., Curl Enhancing Smoothie",
            description: "Enter the full name of the product"
          },
          {
            id: "product_brand",
            name: "product_brand",
            label: "Brand",
            type: "text",
            required: true,
            placeholder: "e.g., SheaMoisture",
            description: "Enter the brand name"
          },
          {
            id: "product_type",
            name: "product_type",
            label: "Product Type",
            type: "select",
            required: true,
            options: [
              "Shampoo",
              "Conditioner",
              "Leave-in Conditioner",
              "Deep Conditioner",
              "Protein Treatment",
              "Gel",
              "Mousse",
              "Cream",
              "Oil",
              "Serum",
              "Spray",
              "Clarifying Treatment",
              "Co-wash",
              "Other"
            ],
            description: "Select the type of product"
          },
          {
            id: "ingredients",
            name: "ingredients",
            label: "Full Ingredients List",
            type: "textarea",
            required: false,
            placeholder: "Paste the full ingredients list here...",
            description: "Optional: Add the complete ingredients list"
          },
          {
            id: "key_ingredients",
            name: "key_ingredients",
            label: "Key Ingredients",
            type: "multiselect",
            required: false,
            options: [
              "Aloe Vera",
              "Argan Oil",
              "Avocado Oil",
              "Behentrimonium Chloride",
              "Butters (Shea, Cocoa, Mango)",
              "Castor Oil",
              "Cetearyl Alcohol",
              "Coconut Oil",
              "Dimethicone",
              "Glycerin",
              "Hydrolyzed Proteins",
              "Jojoba Oil",
              "Panthenol",
              "Polyquaternium",
              "Silicones",
              "Sodium Laureth Sulfate",
              "Sodium Lauryl Sulfate"
            ],
            description: "Select the key ingredients in this product"
          },
          {
            id: "product_notes",
            name: "product_notes",
            label: "Notes",
            type: "textarea",
            required: false,
            placeholder: "Add any notes about this product...",
            description: "Optional: Add any additional notes about the product"
          },
          {
            id: "hair_goals",
            name: "hair_goals",
            label: "Hair Goals",
            type: "multiselect",
            required: true,
            options: [
              "More curl definition",
              "Reduce frizz",
              "Better moisture balance",
              "More volume",
              "Hair growth",
              "Repair damage"
            ],
            description: "Select your main hair goals"
          },
          {
            id: "humidity",
            name: "humidity",
            label: "Humidity Level",
            type: "toggle",
            required: true,
            description: "Track humidity levels"
          },
          {
            id: "weather",
            name: "weather",
            label: "Weather Conditions",
            type: "toggle",
            required: true,
            description: "Track weather conditions"
          },
          {
            id: "sun_exposure",
            name: "sun_exposure",
            label: "Sun Exposure",
            type: "toggle",
            required: true,
            description: "Track sun exposure"
          },
          {
            id: "heat_styling",
            name: "heat_styling",
            label: "Heat Styling",
            type: "toggle",
            required: true,
            description: "Track heat styling usage"
          },
          {
            id: "before_photo",
            name: "before_photo",
            label: "Before Photo (Wet Hair)",
            type: "image",
            required: false,
            description: "Upload a photo of your hair before styling"
          },
          {
            id: "after_photo",
            name: "after_photo",
            label: "After Photo (Dry Hair)",
            type: "image",
            required: false,
            description: "Upload a photo of your hair after styling"
          },
          {
            id: "refresh_photo",
            name: "refresh_photo",
            label: "Day 2+ Photo (Refresh Results)",
            type: "image",
            required: false,
            description: "Upload a photo of your hair after refreshing"
          }
        ],
        icon: "💇",
        color: "#EC4899"
      }
    ],
    icon: "💇",
    color: "#EC4899",
    howItWorks: {
      tabs: [
        {
          title: "Setup",
          content: "Create your product library and set your hair goals. Customize your tracking preferences and set up your routine schedule.",
          icon: "🎯"
        },
        {
          title: "Tracking",
          content: "Log your hair care routine, track product usage, and monitor environmental factors. Add photos to document your progress.",
          icon: "📝"
        },
        {
          title: "Progress",
          content: "View your hair journey progress, analyze product effectiveness, and identify what works best for your curls.",
          icon: "📊"
        }
      ]
    },
    settings: {
      active: true,
      public: true,
      allowCustomization: true,
      requireApproval: false,
      maxEntries: 100
    }
  })
}

export async function createWaterIntakeTemplate() {
  return createPredefinedTemplate({
    name: "Daily Water Intake",
    description: "Track and improve your hydration",
    category: "challenge",
    price: 0,
    features: [
      "Daily intake tracking",
      "Progress visualization",
      "Achievement badges"
    ],
    tags: ["health", "hydration", "wellness", "tracking", "30-day-challenge"],
    icon: "💧",
    color: "#4B83F2",
    journalTypes: [
      {
        id: "daily_tracking",
        name: "Daily Tracking",
        description: "Track your daily water intake",
        fields: [
          {
            id: "morning_intake",
            name: "morning_intake",
            label: "Morning Water Intake",
            type: "number",
            required: true,
            description: "How much water did you drink in the morning? (in oz/ml)",
            placeholder: "Enter amount"
          },
          {
            id: "afternoon_intake",
            name: "afternoon_intake",
            label: "Afternoon Water Intake",
            type: "number",
            required: true,
            description: "How much water did you drink in the afternoon? (in oz/ml)",
            placeholder: "Enter amount"
          },
          {
            id: "evening_intake",
            name: "evening_intake",
            label: "Evening Water Intake",
            type: "number",
            required: true,
            description: "How much water did you drink in the evening? (in oz/ml)",
            placeholder: "Enter amount"
          },
          {
            id: "daily_goal",
            name: "daily_goal",
            label: "Daily Goal",
            type: "number",
            required: true,
            description: "Your daily water intake goal (in oz/ml)",
            placeholder: "Set your goal"
          },
          {
            id: "mood",
            name: "mood",
            label: "Energy Level",
            type: "select",
            required: false,
            options: ["Low", "Medium", "High"],
            description: "How is your energy level today?"
          },
          {
            id: "notes",
            name: "notes",
            label: "Notes",
            type: "textarea",
            required: false,
            description: "Any additional notes about your hydration today",
            placeholder: "Add your notes here"
          }
        ],
        prompts: [
          "How do you feel compared to yesterday?",
          "Did you notice any changes in your energy levels?",
          "What helps you remember to drink water throughout the day?"
        ]
      }
    ],
    howItWorks: {
      tabs: [
        {
          title: "Setup",
          content: "Set your daily water intake goal and preferred measurement unit (oz/ml).",
          icon: "⚙️"
        },
        {
          title: "Tracking",
          content: "Log your water intake throughout the day - morning, afternoon, and evening.",
          icon: "📝"
        },
        {
          title: "Reports",
          content: "View your progress, streaks, and achievements over time.",
          icon: "📊"
        }
      ]
    },
    settings: {
      active: true,
      public: true,
      allowCustomization: true,
      maxEntries: 365,
      requireApproval: false
    }
  })
}

export async function createBabyDevelopmentTemplate() {
  return createPredefinedTemplate({
    name: "Baby Development Journal",
    description: "Track your baby's growth, milestones, and daily activities. Document precious moments and monitor development progress.",
    category: "parenting",
    price: 0,
    features: [
      "Milestone tracking",
      "Growth measurements",
      "Photo diary",
      "Feeding schedule",
      "Sleep patterns",
      "Development tips"
    ],
    tags: ["baby", "parenting", "development", "milestones", "growth"],
    icon: "👶",
    color: "#F472B6",
    journalTypes: [
      {
        id: "daily_log",
        name: "Daily Activity Log",
        description: "Track your baby's daily activities and routines",
        fields: [
          {
            id: "sleep_duration",
            name: "sleep_duration",
            label: "Sleep Duration",
            type: "number",
            required: true,
            description: "Total hours of sleep in the last 24 hours",
            placeholder: "Enter hours"
          },
          {
            id: "feeding_times",
            name: "feeding_times",
            label: "Number of Feedings",
            type: "number",
            required: true,
            description: "Number of feedings in the last 24 hours",
            placeholder: "Enter number"
          },
          {
            id: "diaper_changes",
            name: "diaper_changes",
            label: "Diaper Changes",
            type: "number",
            required: true,
            description: "Number of diaper changes in the last 24 hours",
            placeholder: "Enter number"
          },
          {
            id: "mood",
            name: "mood",
            label: "Overall Mood",
            type: "select",
            required: true,
            options: ["Happy", "Fussy", "Tired", "Energetic"],
            description: "Baby's general mood today"
          },
          {
            id: "activities",
            name: "activities",
            label: "Activities Done",
            type: "multiselect",
            required: false,
            options: [
              "Tummy time",
              "Reading",
              "Singing",
              "Bath time",
              "Outdoor walk",
              "Play time",
              "Exercise/Stretching"
            ],
            description: "Activities completed today"
          }
        ],
        prompts: [
          "What new things did your baby discover today?",
          "Any new sounds or expressions?",
          "How was their energy level throughout the day?",
          "What activities seemed to engage them the most?"
        ]
      },
      {
        id: "growth_tracking",
        name: "Growth & Development",
        description: "Track physical growth and developmental milestones",
        fields: [
          {
            id: "weight",
            name: "weight",
            label: "Weight",
            type: "number",
            required: true,
            description: "Current weight in pounds/kilograms",
            placeholder: "Enter weight"
          },
          {
            id: "height",
            name: "height",
            label: "Height",
            type: "number",
            required: true,
            description: "Current height in inches/centimeters",
            placeholder: "Enter height"
          },
          {
            id: "head_circumference",
            name: "head_circumference",
            label: "Head Circumference",
            type: "number",
            required: false,
            description: "Head circumference in inches/centimeters",
            placeholder: "Enter measurement"
          },
          {
            id: "milestones",
            name: "milestones",
            label: "Milestones Reached",
            type: "multiselect",
            required: false,
            options: [
              "First smile",
              "Rolling over",
              "Sitting up",
              "Crawling",
              "First words",
              "First steps",
              "First tooth",
              "Clapping",
              "Waving",
              "Pointing"
            ],
            description: "Select any new milestones reached"
          },
          {
            id: "photos",
            name: "photos",
            label: "Development Photos",
            type: "image",
            required: false,
            description: "Upload photos to document growth"
          },
          {
            id: "notes",
            name: "notes",
            label: "Development Notes",
            type: "textarea",
            required: false,
            description: "Additional notes about development progress",
            placeholder: "Add any observations or concerns..."
          }
        ],
        prompts: [
          "What new skills is your baby developing?",
          "Are they meeting age-appropriate milestones?",
          "Any concerns about their development?",
          "What support do they need for the next developmental stage?"
        ]
      }
    ],
    howItWorks: {
      tabs: [
        {
          title: "Setup",
          content: "Enter your baby's basic information and set up tracking preferences. Choose which aspects of development you want to monitor.",
          icon: "📝"
        },
        {
          title: "Daily Tracking",
          content: "Log daily activities, feeding schedules, and sleep patterns. Document new achievements and milestones.",
          icon: "📊"
        },
        {
          title: "Development",
          content: "Monitor growth measurements, track milestone achievements, and maintain a photo diary of your baby's progress.",
          icon: "📈"
        }
      ]
    },
    settings: {
      active: true,
      public: true,
      allowCustomization: true,
      maxEntries: 1095,
      requireApproval: false
    }
  })
} 