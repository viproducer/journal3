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
import { TagInput } from "@/components/ui/tag-input"

interface FutureVisioningFormProps {
  onSubmit?: (formData: FormData) => Promise<void>
}

export default function FutureVisioningForm({ onSubmit }: FutureVisioningFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [visionYears, setVisionYears] = useState("5")
  const [visionAreas, setVisionAreas] = useState({
    career: "",
    relationships: "",
    health: "",
    personal: "",
    financial: "",
    spiritual: ""
  })
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Add metadata to form data
      const metadata = {
        title,
        visionYears,
        visionAreas,
        tags
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="visionYears">Vision Timeline</Label>
            <Select value={visionYears} onValueChange={setVisionYears}>
              <SelectTrigger id="visionYears">
                <SelectValue placeholder="Select vision timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Year Vision</SelectItem>
                <SelectItem value="3">3 Year Vision</SelectItem>
                <SelectItem value="5">5 Year Vision</SelectItem>
                <SelectItem value="10">10 Year Vision</SelectItem>
              </SelectContent>
            </Select>
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

          <Tabs defaultValue="career" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="career">Career</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>
            <TabsContent value="career" className="space-y-4">
              <div className="space-y-3">
                <Label>Career Vision</Label>
                <Textarea
                  value={visionAreas.career}
                  onChange={(e) => setVisionAreas(prev => ({ ...prev, career: e.target.value }))}
                  placeholder="Describe your career aspirations and professional goals..."
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
            <TabsContent value="personal" className="space-y-4">
              <div className="space-y-3">
                <Label>Personal Vision</Label>
                <Textarea
                  value={visionAreas.personal}
                  onChange={(e) => setVisionAreas(prev => ({ ...prev, personal: e.target.value }))}
                  placeholder="Describe your personal growth and life goals..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-3">
                <Label>Relationships</Label>
                <Textarea
                  value={visionAreas.relationships}
                  onChange={(e) => setVisionAreas(prev => ({ ...prev, relationships: e.target.value }))}
                  placeholder="Describe your vision for relationships and social connections..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-3">
                <Label>Health & Wellness</Label>
                <Textarea
                  value={visionAreas.health}
                  onChange={(e) => setVisionAreas(prev => ({ ...prev, health: e.target.value }))}
                  placeholder="Describe your vision for health and wellness..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-3">
                <Label>Spiritual Growth</Label>
                <Textarea
                  value={visionAreas.spiritual}
                  onChange={(e) => setVisionAreas(prev => ({ ...prev, spiritual: e.target.value }))}
                  placeholder="Describe your vision for spiritual growth and development..."
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
            <TabsContent value="financial" className="space-y-4">
              <div className="space-y-3">
                <Label>Financial Vision</Label>
                <Textarea
                  value={visionAreas.financial}
                  onChange={(e) => setVisionAreas(prev => ({ ...prev, financial: e.target.value }))}
                  placeholder="Describe your financial goals and aspirations..."
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3">
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onTagsChange={setTags}
            />
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

