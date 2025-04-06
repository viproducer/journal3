"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth"
import { createWaterIntakeTemplate } from "@/lib/firebase/templates"
import { AdminNav } from "@/components/admin/admin-nav"

export default function CreateWaterIntakeTemplatePage() {
  const router = useRouter()
  const { user, loading, hasRole } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
    if (!hasRole('admin')) {
      router.push('/')
      return
    }

    const createTemplate = async () => {
      try {
        setCreating(true)
        const template = await createWaterIntakeTemplate()
        console.log('Created water intake template:', template)
        router.push('/admin/templates')
      } catch (err) {
        console.error('Error creating template:', err)
        setError('Failed to create template')
      } finally {
        setCreating(false)
      }
    }

    createTemplate()
  }, [user, loading, hasRole, router])

  if (loading || creating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">
            {loading ? 'Loading...' : 'Creating water intake template...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Creating Water Intake Template</h1>
          <p className="mt-2 text-muted-foreground">Please wait while we create the template...</p>
        </div>
      </main>
    </div>
  )
} 