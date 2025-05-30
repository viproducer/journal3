"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth"
import type { MarketplaceTemplate } from "@/lib/firebase/types"
import { getTemplates, deleteTemplate } from "@/lib/firebase/templates"
import Link from "next/link"
import { AdminNav } from "@/components/admin/admin-nav"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { format } from "date-fns"

export default function AdminTemplatesPage() {
  const router = useRouter()
  const { user, loading, hasRole } = useAuth()
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadTemplates = async () => {
      try {
        setIsLoading(true)
        const loadedTemplates = await getTemplates()
        console.log('Loaded templates:', loadedTemplates)
        setTemplates(loadedTemplates)
      } catch (err) {
        console.error('Error loading templates:', err)
        setError('Failed to load templates')
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [user])

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

  const handleDelete = async (templateId: string) => {
    console.log('Attempting to delete template with ID:', templateId)
    if (!templateId) {
      console.error('No template ID provided')
      return
    }

    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      console.log('Deleting template...')
      await deleteTemplate(templateId)
      console.log('Template deleted, updating UI...')
      setTemplates(templates.filter(t => t.id !== templateId))
      console.log('UI updated')
    } catch (err) {
      console.error('Error deleting template:', err)
      setError('Failed to delete template')
    }
  }

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  }

  if (!user || !hasRole('admin')) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      <header className="container mx-auto py-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground">Manage journal templates</p>
          </div>
          <Button onClick={() => router.push('/admin/templates/new')}>
            New Template
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Templates</CardTitle>
                <CardDescription>{templates.length} templates</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={template.settings.active ? "default" : "destructive"}
                        >
                          {template.settings.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {template.updatedAt ? (
                          (() => {
                            try {
                              return format(new Date(template.updatedAt), 'MMM d, yyyy')
                            } catch (error) {
                              return '-'
                            }
                          })()
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/admin/templates/${template.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/templates/${template.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

