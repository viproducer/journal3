"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useAuth } from '@/lib/firebase/auth'
import type { MarketplaceTemplate } from '@/lib/firebase/types'
import { getTemplate } from '@/lib/firebase/templates'
import Link from "next/link"
import {
  ArrowLeft,
  Eye,
  Layers,
  FileText,
  List,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Image,
  FileInput,
  LayoutGrid,
} from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/Navigation"

interface PreviewTemplatePageProps {
  params: Promise<{ id: string }>
}

export default function PreviewTemplatePage({ params }: PreviewTemplatePageProps) {
  const router = useRouter()
  const { user, loading, hasRole, logout } = useAuth()
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resolvedParams = use(params)

  useEffect(() => {
    if (!user || !resolvedParams.id) return

    const loadTemplate = async () => {
      try {
        const template = await getTemplate(resolvedParams.id)
        setTemplate(template)
      } catch (err) {
        console.error('Error loading template:', err)
        setError('Failed to load template')
      }
    }

    loadTemplate()
  }, [user, resolvedParams.id])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
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

  const PreviewField = ({ field }: { field: any }) => {
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
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "multiselect":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Eye className="h-5 w-5" />
          <span>JournalMind</span>
        </Link>
        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Admin</span>
        <Navigation onLogout={handleLogout} />
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
              <h1 className="text-2xl font-bold">Template Preview</h1>
              <p className="text-muted-foreground">See how your template will look in the marketplace</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Hero Section */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{template.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold">{template.name}</h2>
                  <p className="text-muted-foreground mt-2">{template.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="outline">{template.category}</Badge>
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Features Section */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="text-primary">{template.icon}</div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* How It Works Section */}
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">How It Works</h2>
                  <p className="text-muted-foreground">Get started with your {template.name.toLowerCase()} in minutes</p>
                </div>

                <Tabs defaultValue="setup" className="w-full">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="setup">Setup</TabsTrigger>
                    <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>

                  {/* Setup Tab */}
                  <TabsContent value="setup" className="mt-6 space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Add Household Members</h3>
                        <p className="text-muted-foreground">Add all the people in your household who will be sharing responsibilities.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Create Task Categories</h3>
                        <p className="text-muted-foreground">Set up categories like cleaning, cooking, shopping, and maintenance.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Schedule Regular Tasks</h3>
                        <p className="text-muted-foreground">Create recurring tasks and assign them to household members.</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tracking Tab */}
                  <TabsContent value="tracking" className="mt-6 space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Mark Tasks Complete</h3>
                        <p className="text-muted-foreground">Check off tasks as they're completed throughout the day.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Add Notes</h3>
                        <p className="text-muted-foreground">Include any special instructions or feedback about the tasks.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Track Progress</h3>
                        <p className="text-muted-foreground">Monitor task completion and household participation.</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Reports Tab */}
                  <TabsContent value="reports" className="mt-6 space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        1
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">View Weekly Summary</h3>
                        <p className="text-muted-foreground">See task completion rates and participation by household member.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        2
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Analyze Patterns</h3>
                        <p className="text-muted-foreground">Identify peak activity times and task distribution patterns.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        3
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Adjust Schedule</h3>
                        <p className="text-muted-foreground">Optimize your household routine based on the insights.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* Journal Types Section */}
            {template.journalTypes.map((journalType, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-4xl">{journalType.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{journalType.name}</h3>
                    <p className="text-muted-foreground mt-2">{journalType.description}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {journalType.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label>{field.label}</Label>
                      {field.description && (
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                      )}
                      <PreviewField field={field} />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
} 