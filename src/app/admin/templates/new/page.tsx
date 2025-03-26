"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth"
import type { MarketplaceTemplate } from "@/lib/firebase/types"
import { createTemplate } from "@/lib/firebase/templates"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function NewTemplatePage() {
  const router = useRouter()
  const { user, loading, hasRole } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  const [template, setTemplate] = useState<Partial<MarketplaceTemplate>>({
    name: "",
    description: "",
    category: "",
    price: 0,
    isActive: true,
    isPublic: true,
    features: [],
    prompts: [],
    tags: [],
    settings: {
      allowCustomization: true,
      requireApproval: false,
      maxEntries: 100
    }
  })

  useEffect(() => {
    if (!loading && (!user || !hasRole('admin'))) {
      setShouldRedirect(true)
    }
  }, [user, loading, hasRole])

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/auth/signin')
    }
  }, [shouldRedirect, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !template.name || !template.description || !template.category) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await createTemplate({
        ...template,
        creatorId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          allowCustomization: template.settings?.allowCustomization ?? true,
          requireApproval: template.settings?.requireApproval ?? false,
          maxEntries: template.settings?.maxEntries ?? 100
        }
      } as MarketplaceTemplate)

      router.push('/admin/templates')
    } catch (err) {
      console.error('Error creating template:', err)
      setError('Failed to create template')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  }

  if (!user || !hasRole('admin')) {
    return null
  }

  const updateSettings = (updates: Partial<MarketplaceTemplate['settings']>) => {
    setTemplate({
      ...template,
      settings: {
        allowCustomization: template.settings?.allowCustomization ?? true,
        requireApproval: template.settings?.requireApproval ?? false,
        maxEntries: template.settings?.maxEntries ?? 100,
        ...updates
      }
    })
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Template</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for your template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={template.category}
                onValueChange={(value) => setTemplate({ ...template, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health & Wellness</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="personal">Personal Growth</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={template.price}
                onChange={(e) => setTemplate({ ...template, price: parseFloat(e.target.value) })}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure template settings and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Make this template available in the marketplace
                </p>
              </div>
              <Switch
                id="isActive"
                checked={template.isActive}
                onCheckedChange={(checked) => setTemplate({ ...template, isActive: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPublic">Public</Label>
                <p className="text-sm text-muted-foreground">
                  Make this template visible to all users
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={template.isPublic}
                onCheckedChange={(checked) => setTemplate({ ...template, isPublic: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowCustomization">Allow Customization</Label>
                <p className="text-sm text-muted-foreground">
                  Let users customize this template
                </p>
              </div>
              <Switch
                id="allowCustomization"
                checked={template.settings?.allowCustomization ?? true}
                onCheckedChange={(checked) => updateSettings({ allowCustomization: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxEntries">Maximum Entries</Label>
              <Input
                id="maxEntries"
                type="number"
                min="1"
                value={template.settings?.maxEntries ?? 100}
                onChange={(e) => updateSettings({ maxEntries: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  )
}

