"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBabyDevelopmentTemplate } from "@/lib/firebase/templates"
import { useAuth } from "@/lib/firebase/auth"

export default function CreateBabyDevelopmentTemplatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createTemplate = async () => {
      try {
        if (!user) {
          setError("Please sign in to create templates")
          return
        }

        const template = await createBabyDevelopmentTemplate()
        router.push(`/admin/templates/${template.id}`)
      } catch (err) {
        console.error("Error creating template:", err)
        setError("Failed to create template")
      }
    }

    createTemplate()
  }, [user, router])

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Creating baby development template...</p>
      </div>
    </div>
  )
} 