"use client"

import { useState } from "react"
import { Heart, Plus, Trash2, Save } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function GratitudeForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [gratitudeItems, setGratitudeItems] = useState([{ text: "", reflection: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const form = e.target as HTMLFormElement
      form.requestSubmit()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addGratitudeItem = () => {
    setGratitudeItems([...gratitudeItems, { text: "", reflection: "" }])
  }

  const removeGratitudeItem = (index: number) => {
    setGratitudeItems(gratitudeItems.filter((_, i) => i !== index))
  }

  const updateGratitudeItem = (index: number, field: "text" | "reflection", value: string) => {
    const newItems = [...gratitudeItems]
    newItems[index][field] = value
    setGratitudeItems(newItems)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Gratitude Journal</CardTitle>
          <CardDescription>
            Reflect on the things you're grateful for and how they impact your life
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input type="hidden" name="category" value="gratitude" />
          <input type="hidden" name="type" value="gratitude" />
          <input type="hidden" name="metadata" value={JSON.stringify({
            gratitudeItems
          })} />

          <div className="space-y-3">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="content">Journal Entry</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts and feelings here..."
              className="min-h-[200px]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Things I'm Grateful For</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGratitudeItem}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {gratitudeItems.map((item, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Item {index + 1}</Label>
                  {gratitudeItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGratitudeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  value={item.text}
                  onChange={(e) => updateGratitudeItem(index, "text", e.target.value)}
                  placeholder="What are you grateful for?"
                  className="min-h-[100px]"
                />
                <Textarea
                  value={item.reflection}
                  onChange={(e) => updateGratitudeItem(index, "reflection", e.target.value)}
                  placeholder="Why are you grateful for this? How does it impact your life?"
                  className="min-h-[100px]"
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Entry
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
} 