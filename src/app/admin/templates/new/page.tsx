"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth"
import type { MarketplaceTemplate, MarketplaceTemplateField, JournalType } from "@/lib/firebase/types"
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
import { Badge } from "@/components/ui/badge"
import { X, ChevronRight, ChevronLeft, Plus, Trash2, Settings, FileText, Tag, List } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STEPS = [
  {
    id: "basic",
    title: "Basic Information",
    description: "Start by adding the basic details of your template",
    icon: FileText,
  },
  {
    id: "fields",
    title: "Form Fields",
    description: "Define the fields that will appear in your template",
    icon: List,
  },
  {
    id: "features",
    title: "Features & Tags",
    description: "Add features and tags to help users find your template",
    icon: Tag,
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure how your template works",
    icon: Settings,
  },
]

const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select Dropdown" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Buttons" },
  { value: "date", label: "Date Picker" },
  { value: "time", label: "Time Picker" },
  { value: "datetime", label: "Date & Time" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "phone", label: "Phone Number" },
  { value: "rating", label: "Rating" },
  { value: "slider", label: "Slider" },
  { value: "color", label: "Color Picker" },
  { value: "file", label: "File Upload" },
  { value: "image", label: "Image Upload" },
]

export default function NewTemplatePage() {
  const router = useRouter()
  const { user, loading, hasRole } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [newFeature, setNewFeature] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newPrompt, setNewPrompt] = useState("")
  const [newField, setNewField] = useState<MarketplaceTemplateField>({
    id: "",
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    description: "",
    allowCustomOptions: false,
    customOptions: []
  })
  const [newOption, setNewOption] = useState("")

  const [shouldRedirect, setShouldRedirect] = useState(false)

  const [showJournalTypeForm, setShowJournalTypeForm] = useState(false)
  const [newJournalType, setNewJournalType] = useState<JournalType>({
    id: "",
    name: "",
    description: "",
    fields: [],
    prompts: [],
    icon: "📝",
    color: "#4F46E5"
  })

  const [template, setTemplate] = useState<Partial<MarketplaceTemplate>>({
    name: "",
    description: "",
    category: "",
    price: 0,
    features: [],
    tags: [],
    journalTypes: [],
    prompts: [],
    fields: [],
    settings: {
      active: true,
      public: true,
      allowCustomization: true,
      maxEntries: 100,
      requireApproval: false
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
    if (!user) return

    const newTemplate: MarketplaceTemplate = {
      id: "",
      name: template.name || "",
      description: template.description || "",
      category: template.category || "",
      price: template.price || 0,
      features: template.features || [],
      tags: template.tags || [],
      prompts: template.prompts || [],
      fields: template.fields || [],
      journalTypes: template.journalTypes || [],
      settings: {
        active: template.settings?.active ?? true,
        public: template.settings?.public ?? true,
        allowCustomization: template.settings?.allowCustomization ?? true,
        maxEntries: template.settings?.maxEntries ?? 100,
        requireApproval: template.settings?.requireApproval ?? false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      await createTemplate(newTemplate)
      setShouldRedirect(true)
    } catch (error) {
      console.error("Error creating template:", error)
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
        active: template.settings?.active ?? true,
        public: template.settings?.public ?? true,
        allowCustomization: template.settings?.allowCustomization ?? true,
        maxEntries: template.settings?.maxEntries ?? 100,
        requireApproval: template.settings?.requireApproval ?? false,
        ...updates
      }
    })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setTemplate({
        ...template,
        features: [...(template.features || []), newFeature.trim()]
      })
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setTemplate({
      ...template,
      features: template.features?.filter((_, i) => i !== index) || []
    })
  }

  const addTag = () => {
    if (newTag.trim()) {
      setTemplate({
        ...template,
        tags: [...(template.tags || []), newTag.trim()]
      })
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setTemplate({
      ...template,
      tags: template.tags?.filter((_, i) => i !== index) || []
    })
  }

  const addOption = () => {
    if (newOption.trim()) {
      setNewField({
        ...newField,
        options: [...(newField.options || []), newOption.trim()]
      })
      setNewOption("")
    }
  }

  const removeOption = (index: number) => {
    setNewField({
      ...newField,
      options: newField.options?.filter((_, i) => i !== index)
    })
  }

  const handleAddField = () => {
    if (newField.id && newField.name && newField.label) {
      setNewJournalType({
        ...newJournalType,
        fields: [...newJournalType.fields, { ...newField }]
      });
      setNewField({
        id: "",
        name: "",
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        description: "",
        allowCustomOptions: false,
        customOptions: []
      });
      setShowFieldForm(false);
    }
  }

  const removeField = (index: number) => {
    setTemplate({
      ...template,
      fields: template.fields?.filter((_, i) => i !== index) || []
    })
  }

  const addPrompt = () => {
    if (newPrompt.trim()) {
      setTemplate({
        ...template,
        prompts: [...(template.prompts || []), newPrompt.trim()]
      })
      setNewPrompt("")
    }
  }

  const removePrompt = (index: number) => {
    setTemplate({
      ...template,
      prompts: template.prompts?.filter((_: string, i: number) => i !== index) || []
    })
  }

  const addJournalType = () => {
    if (newJournalType.id && newJournalType.name && newJournalType.description) {
      setTemplate({
        ...template,
        journalTypes: [...(template.journalTypes || []), { ...newJournalType }]
      })
      setNewJournalType({
        id: "",
        name: "",
        description: "",
        fields: [],
        prompts: [],
        icon: "📝",
        color: "#4F46E5"
      })
      setShowJournalTypeForm(false)
    }
  }

  const removeJournalType = (index: number) => {
    setTemplate({
      ...template,
      journalTypes: template.journalTypes?.filter((_, i) => i !== index) || []
    })
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "basic":
  return (
          <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
                Start by adding the basic details of your template
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="e.g., Daily Mood Tracker"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  placeholder="Describe what this template is for and how it helps users"
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
        )

      case "fields":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Journal Types & Fields</CardTitle>
              <CardDescription>
                Define different types of journals and their fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Journal Types</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJournalTypeForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Journal Type
                  </Button>
                </div>

                {/* Journal Types List */}
                <div className="space-y-4">
                  {template.journalTypes?.map((journalType, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{journalType.icon}</span>
                            <h4 className="font-medium">{journalType.name}</h4>
                            <Badge 
                              variant="outline" 
                              style={{ backgroundColor: journalType.color + '20', color: journalType.color }}
                            >
                              {journalType.color}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{journalType.description}</p>
                          
                          {/* Fields for this journal type */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Fields</h5>
                            <div className="space-y-2">
                              {journalType.fields.map((field, fieldIndex) => (
                                <div key={fieldIndex} className="flex items-center gap-2 text-sm">
                                  <Badge variant="secondary">{field.type}</Badge>
                                  <span>{field.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Prompts for this journal type */}
                          {journalType.prompts.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium mb-2">Prompts</h5>
                              <div className="flex flex-wrap gap-1">
                                {journalType.prompts.map((prompt, promptIndex) => (
                                  <Badge key={promptIndex} variant="outline" className="text-xs">
                                    {prompt}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJournalType(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Journal Type Form Dialog */}
              <Dialog open={showJournalTypeForm} onOpenChange={setShowJournalTypeForm}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Journal Type</DialogTitle>
                    <DialogDescription>Define a new type of journal for your template</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="journal-type-id">Journal Type ID</Label>
                        <Input
                          id="journal-type-id"
                          placeholder="e.g., morning_routine"
                          value={newJournalType.id}
                          onChange={(e) => setNewJournalType({ ...newJournalType, id: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="journal-type-name">Name</Label>
                        <Input
                          id="journal-type-name"
                          placeholder="e.g., Morning Routine"
                          value={newJournalType.name}
                          onChange={(e) => setNewJournalType({ ...newJournalType, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="journal-type-description">Description</Label>
                      <Textarea
                        id="journal-type-description"
                        placeholder="Describe what this journal type is for..."
                        value={newJournalType.description}
                        onChange={(e) => setNewJournalType({ ...newJournalType, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="journal-type-icon">Icon</Label>
                        <Input
                          id="journal-type-icon"
                          placeholder="e.g., 🌅"
                          value={newJournalType.icon}
                          onChange={(e) => setNewJournalType({ ...newJournalType, icon: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="journal-type-color">Color</Label>
                        <Input
                          id="journal-type-color"
                          type="color"
                          value={newJournalType.color}
                          onChange={(e) => setNewJournalType({ ...newJournalType, color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Fields</Label>
                      <div className="space-y-2">
                        {newJournalType.fields.map((field, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="secondary">{field.type}</Badge>
                            <span className="text-sm">{field.label}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewJournalType({
                                  ...newJournalType,
                                  fields: newJournalType.fields.filter((_, i) => i !== index)
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFieldForm(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Prompts</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a prompt..."
                          value={newPrompt}
                          onChange={(e) => setNewPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newPrompt.trim()) {
                                setNewJournalType({
                                  ...newJournalType,
                                  prompts: [...newJournalType.prompts, newPrompt.trim()]
                                })
                                setNewPrompt("")
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newPrompt.trim()) {
                              setNewJournalType({
                                ...newJournalType,
                                prompts: [...newJournalType.prompts, newPrompt.trim()]
                              })
                              setNewPrompt("")
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newJournalType.prompts.map((prompt, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {prompt}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                setNewJournalType({
                                  ...newJournalType,
                                  prompts: newJournalType.prompts.filter((_, i) => i !== index)
                                })
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowJournalTypeForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addJournalType}>Add Journal Type</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )

      case "features":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Features & Tags</CardTitle>
              <CardDescription>
                Add features and tags to help users find your template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Features</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.features?.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {template.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "settings":
        return (
          <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
                Configure how your template works
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Template Settings</h3>
                <div className="space-y-4">
            <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                        Make this template available for use
                </p>
              </div>
              <Switch
                      checked={template.settings?.active ?? true}
                      onCheckedChange={(checked) => updateSettings({ active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public</Label>
                <p className="text-sm text-muted-foreground">
                        Make this template visible in the marketplace
                </p>
              </div>
              <Switch
                      checked={template.settings?.public ?? true}
                      onCheckedChange={(checked) => updateSettings({ public: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Customization</Label>
                <p className="text-sm text-muted-foreground">
                  Let users customize this template
                </p>
              </div>
              <Switch
                checked={template.settings?.allowCustomization ?? true}
                onCheckedChange={(checked) => updateSettings({ allowCustomization: checked })}
              />
            </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Require admin approval for new entries
                      </p>
                    </div>
                    <Switch
                      checked={template.settings?.requireApproval ?? false}
                      onCheckedChange={(checked) => updateSettings({ requireApproval: checked })}
                    />
                  </div>
            <div className="space-y-2">
                    <Label>Maximum Entries</Label>
              <Input
                type="number"
                min="1"
                value={template.settings?.maxEntries ?? 100}
                onChange={(e) => updateSettings({ maxEntries: parseInt(e.target.value) })}
              />
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Template</h1>
          <p className="text-muted-foreground mt-1">
            {STEPS[currentStep].description}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <step.icon className="h-4 w-4" />
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2",
                    index < currentStep ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <form onSubmit={handleSubmit}>
        {renderStep()}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          {currentStep === STEPS.length - 1 ? (
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Template"}
          </Button>
          ) : (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Field Form Dialog */}
      <Dialog open={showFieldForm} onOpenChange={setShowFieldForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Field</DialogTitle>
            <DialogDescription>Define a new field for this journal type</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-id">Field ID</Label>
                <Input
                  id="field-id"
                  placeholder="e.g., product_name"
                  value={newField.id}
                  onChange={(e) => setNewField({ ...newField, id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  placeholder="e.g., Product Name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-label">Display Label</Label>
              <Input
                id="field-label"
                placeholder="e.g., What is the product name?"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-type">Field Type</Label>
              <Select
                value={newField.type}
                onValueChange={(value) => setNewField({ ...newField, type: value })}
              >
                <SelectTrigger id="field-type">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(newField.type === "select" || newField.type === "multiselect") && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an option..."
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button type="button" onClick={addOption}>
                    Add
                  </Button>
                </div>
                {newField.options && newField.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {newField.options.map((option, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {option}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeOption(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {newField.type === "multiselect" && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Switch
                      id="allow-custom"
                      checked={newField.allowCustomOptions}
                      onCheckedChange={(checked) => 
                        setNewField({ ...newField, allowCustomOptions: checked })
                      }
                    />
                    <Label htmlFor="allow-custom" className="text-sm">
                      Allow users to add custom options
                    </Label>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="field-placeholder">Placeholder Text</Label>
              <Input
                id="field-placeholder"
                placeholder="e.g., Enter the product name..."
                value={newField.placeholder}
                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-description">Description</Label>
              <Textarea
                id="field-description"
                placeholder="Describe what this field is for..."
                value={newField.description}
                onChange={(e) => setNewField({ ...newField, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="field-required"
                checked={newField.required}
                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
              />
              <Label htmlFor="field-required" className="text-sm">
                Required field
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

