"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth"
import { getJournalEntry, updateJournalEntry } from "@/lib/firebase/db"
import { JournalEntry } from "@/lib/firebase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit3 } from "lucide-react"

interface EditEntryPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditEntryPage({ params }: EditEntryPageProps) {
  const router = useRouter()
  const { user, loading: authLoading, hasRole, logout } = useAuth()
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const resolvedParams = use(params)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [] as string[]
  })

  useEffect(() => {
    if (!user) {
      router.replace("/auth/signin")
      return
    }

    const loadEntry = async () => {
      try {
        setIsLoading(true)
        const journalId = localStorage.getItem('currentJournalId')
        if (!journalId) throw new Error('No journal ID found')

        const entryData = await getJournalEntry(user.uid, journalId, resolvedParams.id)
        if (!entryData) throw new Error('Entry not found')

        setEntry(entryData)
        setFormData({
          title: entryData.metadata?.title || "",
          content: entryData.content || "",
          tags: entryData.tags || []
        })
      } catch (err) {
        console.error('Error loading entry:', err)
        setError(err instanceof Error ? err.message : 'Failed to load entry')
      } finally {
        setIsLoading(false)
      }
    }

    loadEntry()
  }, [user, resolvedParams.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !entry) return

    try {
      setIsLoading(true)
      const journalId = localStorage.getItem('currentJournalId')
      if (!journalId) throw new Error('No journal ID found')

      const updatedEntry: JournalEntry = {
        ...entry,
        content: formData.content,
        metadata: {
          ...entry.metadata,
          title: formData.title
        },
        tags: formData.tags,
        updatedAt: new Date(),
        createdAt: new Date(entry.createdAt)
      }

      await updateJournalEntry(user.uid, journalId, resolvedParams.id, updatedEntry)
      router.push('/journal/browse')
    } catch (err) {
      console.error('Error updating entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to update entry')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-500">{error}</div>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Textarea
                placeholder="Write your entry..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[200px]"
              />
            </div>
            <div>
              <Input
                placeholder="Tags (comma separated)"
                value={formData.tags.join(", ")}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 