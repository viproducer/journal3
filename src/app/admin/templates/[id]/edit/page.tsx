"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useAuth } from '@/lib/firebase/auth'
import type { MarketplaceTemplate } from '@/lib/firebase/types'
import { getTemplate, updateTemplate } from '@/lib/firebase/templates'
import Link from "next/link"
import {
  Edit3,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Pencil,
  Eye,
  Layers,
  LayoutGrid,
  FileText,
  X,
  Image,
  Calendar,
  ToggleLeft,
  List,
  CheckSquare,
  FileInput,
  Upload,
  MoreHorizontal,
  EyeOff,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface EditTemplatePageProps {
  params: Promise<{ id: string }>
}

type TemplateField = MarketplaceTemplate['fields'][number]

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const router = useRouter()
  const { user, loading, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState("basic-info")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [showAddField, setShowAddField] = useState(false)
  const [editingField, setEditingField] = useState<TemplateField | null>(null)
  const [newField, setNewField] = useState<TemplateField>({
    id: "",
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
    placeholder: "",
    description: ""
  })
  const [newOption, setNewOption] = useState("")
  const [fields, setFields] = useState<TemplateField[]>([])
  const [newFeature, setNewFeature] = useState("")
  const [newTag, setNewTag] = useState("")
  
  const resolvedParams = use(params)

  // Field types
  const fieldTypes = [
    { id: "text", name: "Text", icon: <FileText className="h-4 w-4" /> },
    { id: "textarea", name: "Text Area", icon: <Layers className="h-4 w-4" /> },
    { id: "number", name: "Number", icon: <FileText className="h-4 w-4" /> },
    { id: "select", name: "Select", icon: <List className="h-4 w-4" /> },
    { id: "multiselect", name: "Multi-Select", icon: <CheckSquare className="h-4 w-4" /> },
    { id: "checkbox", name: "Checkbox", icon: <CheckSquare className="h-4 w-4" /> },
    { id: "toggle", name: "Toggle", icon: <ToggleLeft className="h-4 w-4" /> },
    { id: "date", name: "Date", icon: <Calendar className="h-4 w-4" /> },
    { id: "image", name: "Image Upload", icon: <Image className="h-4 w-4" /> },
    { id: "file", name: "File Upload", icon: <FileInput className="h-4 w-4" /> },
    { id: "grid", name: "Grid Layout", icon: <LayoutGrid className="h-4 w-4" /> },
  ]

  useEffect(() => {
    if (!user || !resolvedParams.id) return

    const loadTemplate = async () => {
      try {
        const template = await getTemplate(resolvedParams.id)
        setTemplate(template)
        // Initialize fields from template data if they exist
        if (template.fields) {
          setFields(template.fields)
        }
      } catch (err) {
        console.error('Error loading template:', err)
        setError('Failed to load template')
      }
    }

    loadTemplate()
  }, [user, resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !template || !template.name || !template.description || !template.category) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await updateTemplate(resolvedParams.id, {
        ...template,
        fields,
        updatedAt: new Date(),
        settings: {
          allowCustomization: template.settings?.allowCustomization ?? true,
          requireApproval: template.settings?.requireApproval ?? false,
          maxEntries: template.settings?.maxEntries ?? 100
        }
      })

      router.push('/admin/templates')
    } catch (err) {
      console.error('Error updating template:', err)
      setError('Failed to update template')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddField = () => {
    if (!template || !newField.name || !newField.label || !newField.type) {
      setError('Please fill in all required field information')
      return
    }

    const fieldToAdd: TemplateField = {
      ...newField,
      id: editingField ? editingField.id : crypto.randomUUID(),
      options: newField.options || [],
      placeholder: newField.placeholder || "",
      description: newField.description || ""
    }

    setTemplate({
      ...template,
      fields: editingField 
        ? template.fields.map(f => f.id === editingField.id ? fieldToAdd : f)
        : [...template.fields, fieldToAdd]
    })

    setNewField({
      id: "",
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
      placeholder: "",
      description: ""
    })
    setEditingField(null)
    setShowAddField(false)
  }

  const handleEditField = (field: TemplateField) => {
    setEditingField(field)
    setNewField(field)
    setShowAddField(true)
  }

  const handleRemoveField = (fieldId: string) => {
    if (!template) return
    setTemplate({
      ...template,
      fields: template.fields.filter((field) => field.id !== fieldId)
    })
  }

  const handleAddOption = () => {
    if (newOption && !newField.options.includes(newOption)) {
      setNewField({
        ...newField,
        options: [...newField.options, newOption],
      })
      setNewOption("")
    }
  }

  const handleRemoveOption = (option: string) => {
    setNewField({
      ...newField,
      options: newField.options.filter((item) => item !== option),
    })
  }

  const addFeature = () => {
    if (!newFeature || !template) return
    setTemplate({
      ...template,
      features: [...template.features, newFeature]
    })
    setNewFeature("")
  }

  const removeFeature = (index: number) => {
    if (!template) return
    const newFeatures = [...template.features]
    newFeatures.splice(index, 1)
    setTemplate({ ...template, features: newFeatures })
  }

  const addTag = () => {
    if (!newTag || !template) return
    const tag = newTag.toLowerCase()
    setTemplate({
      ...template,
      tags: [...template.tags, tag]
    })
    setNewTag("")
  }

  const removeTag = (index: number) => {
    if (!template) return
    const newTags = [...template.tags]
    newTags.splice(index, 1)
    setTemplate({ ...template, tags: newTags })
  }

  const PreviewField = ({ field }: { field: TemplateField }) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder}
            disabled={true}
          />
        )
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled={true}
          />
        )
      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            disabled={true}
          />
        )
      case "select":
        return (
          <select className="w-full p-2 border rounded" disabled={true}>
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )
      case "multiselect":
        return (
          <select className="w-full p-2 border rounded" multiple disabled={true}>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )
      default:
        return null
    }
  }

  if (loading || !template) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  }

  if (!user || !hasRole('admin')) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Edit3 className="h-5 w-5" />
          <span>JournalMind</span>
        </Link>
        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Admin</span>
        <nav className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/journal">Dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/journal">Journal</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/templates">Templates</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/users">Users</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/analytics">Analytics</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <Button variant="ghost" size="sm" className="mb-2" asChild>
                <Link href="/admin/templates" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Templates
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Edit Template</h1>
              <p className="text-muted-foreground">Update your journal template</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Exit Preview
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {previewMode ? (
            <div className="space-y-8">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{template.name}</h2>
                <p className="text-gray-600 mb-6">{template.description}</p>
                
                <div className="space-y-6">
                  {template.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label>{field.label}</Label>
                      {field.description && (
                        <p className="text-sm text-gray-500 mb-2">{field.description}</p>
                      )}
                      <PreviewField field={field} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="fields">Fields & Structure</TabsTrigger>
                <TabsTrigger value="settings">Settings & Publishing</TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Information</CardTitle>
                    <CardDescription>Update the basic details for your template</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                        placeholder="e.g., Wavy & Curly Hair Journal"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="template-category">Category</Label>
                        <Select
                          value={template.category}
                          onValueChange={(value) => setTemplate({ ...template, category: value })}
                        >
                          <SelectTrigger id="template-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="health">Health & Wellness</SelectItem>
                            <SelectItem value="beauty">Beauty & Self-Care</SelectItem>
                            <SelectItem value="home">Home Management</SelectItem>
                            <SelectItem value="parenting">Parenting</SelectItem>
                            <SelectItem value="challenge">30-Day Challenge</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="mood">Mood & Feelings</SelectItem>
                            <SelectItem value="tracking">Tracking & Logs</SelectItem>
                            <SelectItem value="gratitude">Gratitude & Reflection</SelectItem>
                            <SelectItem value="goals">Goals & Intentions</SelectItem>
                            <SelectItem value="future">Future Visioning</SelectItem>
                            <SelectItem value="prompts">Journaling Prompts</SelectItem>
                            <SelectItem value="checkins">Daily Check-ins</SelectItem>
                            <SelectItem value="challenges">Challenges & Streaks</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-tags">Tags</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag"
                          />
                          <Button type="button" onClick={addTag}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag, index) => (
                            <Badge key={index} className="flex items-center gap-1">
                              {tag}
                              <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(index)} />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-description">Description</Label>
                      <Textarea
                        id="template-description"
                        value={template.description}
                        onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                        placeholder="Detailed description of your journal template"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-price">Price ($)</Label>
                      <Input
                        id="template-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={template.price}
                        onChange={(e) => setTemplate({ ...template, price: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Features</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add a feature"
                        />
                        <Button type="button" onClick={addFeature}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fields" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Template Fields</CardTitle>
                        <CardDescription>Define the data entry fields for your journal template</CardDescription>
                      </div>
                      <Button onClick={() => {
                        setEditingField(null)
                        setNewField({
                          id: "",
                          name: "",
                          label: "",
                          type: "text",
                          required: false,
                          options: [],
                          placeholder: "",
                          description: ""
                        })
                        setShowAddField(true)
                      }} disabled={previewMode}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Field
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {template.fields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Layers className="h-10 w-10 text-muted-foreground/60" />
                        <h3 className="mt-4 text-lg font-medium">No fields yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                          Start building your template by adding fields for users to fill out.
                        </p>
                        <Button className="mt-4" onClick={() => {
                          setEditingField(null)
                          setNewField({
                            id: "",
                            name: "",
                            label: "",
                            type: "text",
                            required: false,
                            options: [],
                            placeholder: "",
                            description: ""
                          })
                          setShowAddField(true)
                        }} disabled={previewMode}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Field
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {template.fields.map((field) => (
                          <Card key={field.id}>
                            <CardHeader className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {fieldTypes.find((type) => type.id === field.type)?.icon}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <CardTitle className="text-base">{field.label}</CardTitle>
                                      {field.required && (
                                        <Badge variant="outline" className="text-red-500 border-red-500">
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{field.name}</p>
                                    {field.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditField(field)}
                                    className="flex items-center gap-1"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleRemoveField(field.id)}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                              {(field.type === "select" || field.type === "multiselect") && field.options && field.options.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                  <p className="text-sm font-medium mb-2">Options:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {field.options.map((option, optionIndex) => (
                                      <Badge key={optionIndex} variant="secondary">{option}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Dialog open={showAddField} onOpenChange={setShowAddField}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{editingField ? 'Edit Field' : 'Add New Field'}</DialogTitle>
                      <DialogDescription>
                        {editingField ? 'Modify the existing field' : 'Define a new data entry field for your template'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="field-name">Field Name (ID)</Label>
                          <Input
                            id="field-name"
                            placeholder="e.g., product_name"
                            value={newField.name}
                            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="field-label">Field Label</Label>
                          <Input
                            id="field-label"
                            placeholder="e.g., Product Name"
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-type">Field Type</Label>
                        <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center gap-2">
                                  {type.icon}
                                  <span>{type.name}</span>
                                </div>
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
                              placeholder="Enter an option"
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newOption.trim()) {
                                    setNewField({
                                      ...newField,
                                      options: [...(newField.options || []), newOption.trim()]
                                    });
                                    setNewOption('');
                                  }
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              onClick={() => {
                                if (newOption.trim()) {
                                  setNewField({
                                    ...newField,
                                    options: [...(newField.options || []), newOption.trim()]
                                  });
                                  setNewOption('');
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newField.options?.map((option, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {option}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = [...(newField.options || [])];
                                    newOptions.splice(index, 1);
                                    setNewField({
                                      ...newField,
                                      options: newOptions
                                    });
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          {newField.options?.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Add at least one option for the {newField.type === "select" ? "dropdown" : "multi-select"} field
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="field-description">Description</Label>
                        <Input
                          id="field-description"
                          placeholder="Field description"
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
                        <Label htmlFor="field-required">Required field</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddField(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddField}>Add Field</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="settings" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Settings</CardTitle>
                    <CardDescription>Configure template settings and permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isActive">Active Status</Label>
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

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isPublic">Public Visibility</Label>
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

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowCustomization">Customization</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to customize this template
                        </p>
                      </div>
                      <Switch
                        id="allowCustomization"
                        checked={template.settings?.allowCustomization}
                        onCheckedChange={(checked) =>
                          setTemplate({
                            ...template,
                            settings: { ...template.settings, allowCustomization: checked }
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireApproval">Require Approval</Label>
                        <p className="text-sm text-muted-foreground">
                          Require admin approval for user customizations
                        </p>
                      </div>
                      <Switch
                        id="requireApproval"
                        checked={template.settings?.requireApproval}
                        onCheckedChange={(checked) =>
                          setTemplate({
                            ...template,
                            settings: { ...template.settings, requireApproval: checked }
                          })
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push('/admin/templates')}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 