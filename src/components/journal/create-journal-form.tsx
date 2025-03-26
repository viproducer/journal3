"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createJournal } from "@/lib/firebase/db"
import { Journal } from "@/lib/firebase/types"
import { useAuth } from "@/lib/firebase/auth"

export default function CreateJournalForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Mood & Feelings")
  const [color, setColor] = useState("bg-blue-500")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const colors = [
    { value: "bg-blue-500", label: "Blue" },
    { value: "bg-red-500", label: "Red" },
    { value: "bg-green-500", label: "Green" },
    { value: "bg-yellow-500", label: "Yellow" },
    { value: "bg-purple-500", label: "Purple" },
    { value: "bg-pink-500", label: "Pink" },
    { value: "bg-indigo-500", label: "Indigo" },
    { value: "bg-orange-500", label: "Orange" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const journalData: Omit<Journal, "id"> = {
        name,
        description,
        category,
        color,
        userId: user.uid,
        icon: "📝", // TODO: Add icon selection
        createdAt: new Date(),
        updatedAt: new Date(),
        entries: 0,
        lastEntry: new Date()
      }

      await createJournal(journalData)
      router.push("/journal")
    } catch (err) {
      setError("Failed to create journal. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Journal Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Enter a name for your journal"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Describe what this journal is for"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="Mood & Feelings">Mood & Feelings</option>
          <option value="Tracking & Logs">Tracking & Logs</option>
          <option value="Gratitude & Reflection">Gratitude & Reflection</option>
          <option value="Goals & Intentions">Goals & Intentions</option>
          <option value="Future Visioning">Future Visioning</option>
          <option value="Journaling Prompts">Journaling Prompts</option>
          <option value="Daily Check-ins">Daily Check-ins</option>
          <option value="Challenges & Streaks">Challenges & Streaks</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Color Theme
        </label>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => setColor(colorOption.value)}
              className={`p-2 rounded-md text-white ${colorOption.value} ${
                color === colorOption.value ? "ring-2 ring-offset-2 ring-offset-white ring-black" : ""
              }`}
            >
              {colorOption.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Journal"}
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