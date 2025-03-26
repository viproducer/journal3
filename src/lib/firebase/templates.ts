import { db } from '@/lib/firebase/config'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, CollectionReference } from 'firebase/firestore'
import { MarketplaceTemplate } from './types'
import { setDoc } from 'firebase/firestore'

const TEMPLATES_COLLECTION = 'templates'

export const templatesCollection = collection(db, TEMPLATES_COLLECTION)

export async function createTemplate(template: MarketplaceTemplate) {
  try {
    const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return { id: docRef.id, ...template }
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
      return { id: docSnap.id, ...docSnap.data() } as MarketplaceTemplate
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
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await deleteDoc(docRef)
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
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MarketplaceTemplate[]
  } catch (error) {
    console.error('Error getting templates:', error)
    throw error
  }
}

export async function getPublicTemplates() {
  return getTemplates({ isActive: true, isPublic: true })
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
    isActive: true,
    isPublic: true,
    creatorId,
    features: [
      "Task scheduling and reminders",
      "Chore rotation system",
      "Family member assignments",
      "Progress tracking",
      "Customizable chore lists",
      "Weekly and monthly planning"
    ],
    prompts: [
      "What chores need to be done today?",
      "Who is responsible for each task?",
      "Are there any special cleaning tasks this week?",
      "How can we make the distribution more fair?",
      "What new chores should we add to the routine?"
    ],
    tags: ["household", "chores", "cleaning", "organization", "family"],
    settings: {
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
    isActive: true,
    isPublic: true,
    features: [
      "Product library management",
      "Hair care routine tracking",
      "Environmental factor monitoring",
      "Photo progress tracking",
      "Goal setting and monitoring",
      "Custom routine creation"
    ],
    tags: ["hair", "curly", "beauty", "tracking", "routine"],
    settings: {
      allowCustomization: true,
      requireApproval: false,
      maxEntries: 100
    },
    fields: [
      // Product Library Fields
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

      // Hair Goals Fields
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

      // Environmental Tracking Fields
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

      // Photo Tracking Fields
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
    ]
  })
} 