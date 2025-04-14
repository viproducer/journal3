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
import { Navigation } from "@/components/Navigation"

interface PreviewField {
  type: string;
  placeholder?: string;
  options?: string[];
}

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

  const PreviewField = ({ field }: { field: PreviewField }) => {
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

            {/* Journal Types Section */}
            <Card>
              <CardHeader>
                <CardTitle>Create {template.name} Entry</CardTitle>
                <CardDescription>
                  Fill out the form below to create a new entry for your {template.name.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={template.journalTypes[0].id} className="w-full">
                  <TabsList className="w-full flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
                    {template.journalTypes.map((journalType) => (
                      <TabsTrigger 
                        key={journalType.id} 
                        value={journalType.id}
                        className="flex-1 min-w-[120px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                      >
                        {journalType.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {template.journalTypes.map((journalType) => (
                    <div key={journalType.id} className="mt-6">
                      <TabsContent value={journalType.id} className="focus-visible:outline-none">
                        <div className="space-y-6">
                          <div className="border-b pb-4">
                            <h3 className="text-lg font-medium">{journalType.name}</h3>
                            <p className="text-sm text-muted-foreground">{journalType.description}</p>
                          </div>

                          <div className="space-y-4">
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
                        </div>
                      </TabsContent>
                    </div>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 