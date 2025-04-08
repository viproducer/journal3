"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface FutureVisioningFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
}

export default function FutureVisioningForm({ onSubmit }: FutureVisioningFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [visionAreas, setVisionAreas] = useState({
    career: "",
    relationships: "",
    health: "",
    personal: "",
    financial: "",
    spiritual: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Add metadata to form data
      const metadata = {
        visionAreas
      }

      // Set category and type in both formData and metadata
      formData.set('category', 'future-visioning')
      formData.set('type', 'future-visioning')
      formData.set('metadata', JSON.stringify(metadata))

      if (onSubmit) {
        await onSubmit(formData)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Future Visioning</CardTitle>
          <CardDescription>
            Envision and plan your future across different life areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input type="hidden" name="category" value="future-visioning" />
          <input type="hidden" name="type" value="future-visioning" />
          
          <div className="space-y-3">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your vision a title..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="content">Overview</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a general overview of your future vision..."
              required
            />
          </div>

          {Object.entries(visionAreas).map(([area, value]) => (
            <div key={area} className="space-y-3">
              <Label htmlFor={area}>{area.charAt(0).toUpperCase() + area.slice(1)}</Label>
              <Textarea
                id={area}
                value={value}
                onChange={(e) => setVisionAreas(prev => ({ ...prev, [area]: e.target.value }))}
                placeholder={`Describe your vision for your ${area}...`}
              />
            </div>
          ))}
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

