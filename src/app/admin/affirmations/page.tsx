"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Edit3,
  PlusCircle,
  Trash2,
  Save,
  X,
  ChevronLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/firebase/auth"
import { getAllAffirmations, saveAffirmation, updateAffirmation, deleteAffirmation } from "@/lib/firebase/affirmations"
import type { Affirmation, AffirmationCategory } from "@/lib/firebase/types"
import { Navigation } from "@/components/Navigation"

const CATEGORIES: AffirmationCategory[] = [
  "confidence",
  "relationships",
  "health",
  "productivity",
  "forgiveness",
  "gratitude",
  "creativity",
  "abundance",
  "peace",
  "growth",
  "strength",
  "joy",
  "purpose",
  "wisdom",
  "balance",
  "love",
  "success",
  "freedom",
  "self-discovery",
  "reflection",
  "money",
  "nature"
]

export default function AdminAffirmationsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [affirmationsList, setAffirmationsList] = useState<Affirmation[]>([])
  const [editingAffirmation, setEditingAffirmation] = useState<Affirmation | null>(null)
  const [newAffirmation, setNewAffirmation] = useState<Partial<Affirmation>>({
    text: "",
    category: "confidence" as AffirmationCategory
  })
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory | "all">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAffirmations()
  }, [])

  const loadAffirmations = async () => {
    try {
      setLoading(true)
      const affirmations = await getAllAffirmations()
      setAffirmationsList(affirmations)
    } catch (err) {
      console.error("Error loading affirmations:", err)
      setError("Failed to load affirmations")
    } finally {
      setLoading(false)
    }
  }

  // Filter affirmations by category
  const filteredAffirmations = selectedCategory === "all"
    ? affirmationsList
    : affirmationsList.filter(a => a.category === selectedCategory)

  const handleAddAffirmation = async () => {
    if (!newAffirmation.text || !newAffirmation.category) return

    try {
      const newId = `${newAffirmation.category.slice(0, 2)}-${affirmationsList.length + 1}`
      const affirmation: Affirmation = {
        id: newId,
        text: newAffirmation.text,
        category: newAffirmation.category
      }

      await saveAffirmation(affirmation)
      setAffirmationsList([...affirmationsList, affirmation])
      setNewAffirmation({ text: "", category: "confidence" as AffirmationCategory })
    } catch (err) {
      console.error("Error adding affirmation:", err)
      setError("Failed to add affirmation")
    }
  }

  const handleEditAffirmation = (affirmation: Affirmation) => {
    setEditingAffirmation(affirmation)
  }

  const handleSaveEdit = async () => {
    if (!editingAffirmation) return

    try {
      await updateAffirmation(editingAffirmation)
      setAffirmationsList(affirmationsList.map(a => 
        a.id === editingAffirmation.id ? editingAffirmation : a
      ))
      setEditingAffirmation(null)
    } catch (err) {
      console.error("Error updating affirmation:", err)
      setError("Failed to update affirmation")
    }
  }

  const handleDeleteAffirmation = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this affirmation?")) {
      try {
        await deleteAffirmation(id)
        setAffirmationsList(affirmationsList.filter(a => a.id !== id))
      } catch (err) {
        console.error("Error deleting affirmation:", err)
        setError("Failed to delete affirmation")
      }
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading affirmations...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-500">{error}</div>
          <Button onClick={loadAffirmations} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Edit3 className="h-5 w-5" />
          <span>JournalMind</span>
        </Link>
        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Admin</span>
        <Navigation onLogout={handleLogout} />
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Manage Affirmations</h1>
              <p className="text-muted-foreground">
                Add, edit, and organize affirmations by category
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Admin
              </Link>
            </Button>
          </div>

          {/* Add New Affirmation */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Affirmation</CardTitle>
              <CardDescription>
                Create a new affirmation and assign it to a category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={newAffirmation.category}
                    onValueChange={(value) => setNewAffirmation({ ...newAffirmation, category: value as AffirmationCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="text" className="text-sm font-medium">
                    Affirmation Text
                  </label>
                  <Textarea
                    id="text"
                    value={newAffirmation.text}
                    onChange={(e) => setNewAffirmation({ ...newAffirmation, text: e.target.value })}
                    placeholder="Enter the affirmation text..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddAffirmation} disabled={!newAffirmation.text || !newAffirmation.category}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Affirmation
              </Button>
            </CardFooter>
          </Card>

          {/* Affirmations List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Affirmations</CardTitle>
                  <CardDescription>
                    View and manage existing affirmations
                  </CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AffirmationCategory | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAffirmations.map((affirmation) => (
                  <div
                    key={affirmation.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    {editingAffirmation?.id === affirmation.id ? (
                      <div className="flex-1 space-y-4">
                        <div className="grid gap-2">
                          <label htmlFor="edit-category" className="text-sm font-medium">
                            Category
                          </label>
                          <Select
                            value={editingAffirmation.category}
                            onValueChange={(value) => setEditingAffirmation({ ...editingAffirmation, category: value as AffirmationCategory })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="edit-text" className="text-sm font-medium">
                            Affirmation Text
                          </label>
                          <Textarea
                            id="edit-text"
                            value={editingAffirmation.text}
                            onChange={(e) => setEditingAffirmation({ ...editingAffirmation, text: e.target.value })}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEdit} size="sm">
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAffirmation(null)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {affirmation.category.replace("-", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm">{affirmation.text}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAffirmation(affirmation)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteAffirmation(affirmation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 