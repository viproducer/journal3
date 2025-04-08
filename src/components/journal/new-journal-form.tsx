"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createEntry, createJournal, getUserJournals } from "@/lib/firebase/db"
import { JournalEntry, Journal } from "@/lib/firebase/types"
import { useAuth } from "@/lib/firebase/auth"

export default function NewJournalForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("Mood & Feelings")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Debug useEffect to check component mounting and user state
  useEffect(() => {
    console.log("NewJournalForm mounted")
    console.log("Current user state:", user)
  }, [user])

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault()
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()])
      }
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    
    if (!user) {
      console.log("No user found")
      setError("You must be logged in to create a journal entry")
      return
    }

    console.log("User found:", user.uid)

    if (!title.trim() || !content.trim()) {
      console.log("Missing required fields")
      setError("Title and content are required")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("Starting journal entry creation...")
      console.log("Current user:", user.uid)
      
      // Get or create a default journal for the user
      console.log("Fetching user journals...")
      let journals = await getUserJournals(user.uid)
      console.log("Found journals:", journals)
      
      let journalId: string | undefined

      if (journals.length === 0) {
        console.log("No journals found, creating default journal...")
        // Create a default journal if none exists
        const defaultJournal: Omit<Journal, 'id'> = {
          name: "My Journal",
          description: "My personal journal",
          color: "#4CAF50",
          userId: user.uid,
          isActive: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          entries: [],
          settings: {
            isPrivate: true,
            allowComments: false,
            allowSharing: false
          }
        }
        console.log("Creating default journal with data:", defaultJournal)
        const newJournal = await createJournal(defaultJournal)
        journalId = newJournal.id
        console.log("Created new journal:", journalId)
      } else {
        journalId = journals[0].id // Use the first journal
        console.log("Using existing journal:", journalId)
      }

      if (!journalId) {
        throw new Error("Failed to get or create a journal")
      }

      const entryData: Omit<JournalEntry, "id"> = {
        journalId,
        userId: user.uid,
        content: content.trim(),
        category,
        type: category,
        tags,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log("Creating entry with data:", { ...entryData, content: "..." })
      const result = await createEntry(entryData)
      console.log("Entry created successfully:", result)
      
      setSuccess(true)
      // Wait a moment to show the success message before redirecting
      setTimeout(() => {
        router.push("/journal")
      }, 1000)
    } catch (err: any) {
      console.error("Error creating entry:", err)
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        stack: err.stack
      })
      setError(err.message || "Failed to create journal entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Debug function to check form state
  const debugFormState = () => {
    console.log("Form State:", {
      title,
      content: content.substring(0, 20) + "...",
      category,
      tags,
      isSubmitting,
      error,
      success,
      user: user?.uid
    })
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      onClick={() => console.log("Form clicked")}
    >
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            console.log("Title changed:", e.target.value)
          }}
          className="w-full p-2 border rounded-md"
          placeholder="Enter a title"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            console.log("Category changed:", e.target.value)
          }}
          className="w-full p-2 border rounded-md"
          disabled={isSubmitting}
        >
          <option value="mood-feelings">Mood & Feelings</option>
          <option value="tracking-logs">Tracking & Logs</option>
          <option value="gratitude-reflection">Gratitude & Reflection</option>
          <option value="goals-intentions">Goals & Intentions</option>
          <option value="future-visioning">Future Visioning</option>
          <option value="journaling-prompts">Journaling Prompts</option>
          <option value="daily-checkins">Daily Check-ins</option>
          <option value="challenges-streaks">Challenges & Streaks</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            console.log("Content changed, length:", e.target.value.length)
          }}
          className="w-full p-2 border rounded-md min-h-[200px]"
          placeholder="Write your journal entry here..."
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="block text-sm font-medium">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          id="tags"
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full p-2 border rounded-md"
          placeholder="Add tags (press Enter)"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">Entry created successfully! Redirecting...</div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            console.log("Submit button clicked")
            debugFormState()
          }}
        >
          {isSubmitting ? "Creating..." : "Create Entry"}
        </button>
        <Link
          href="/journal"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

