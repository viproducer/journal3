"use client"

import { useState } from "react"
import { Heart, Plus, Trash2, Save } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TagInput } from "@/components/ui/tag-input"
import { useToast } from "@/components/ui/use-toast"
import { createEntry } from "@/lib/firebase/db"
import { useAuth } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"

interface GratitudeFormProps {
  journalId: string
  onSuccess?: () => void
}

export function GratitudeForm({ journalId, onSuccess }: GratitudeFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      await createEntry({
        userId: user.uid,
        journalId,
        content: formData.content,
        category: "gratitude",
        type: "gratitude",
        tags: formData.tags,
        metadata: {
          title: formData.title
        },
        createdAt: new Date(),
        updatedAt: new Date()
      })

      toast({
        title: "Entry created",
        description: "Your gratitude entry has been saved."
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/journal/${journalId}`)
      }
    } catch (error) {
      console.error("Error creating entry:", error)
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">What are you grateful for?</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagInput
          tags={formData.tags}
          onTagsChange={(tags) => setFormData({ ...formData, tags })}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Entry"}
      </Button>
    </form>
  )
} 