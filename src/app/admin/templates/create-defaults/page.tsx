"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/firebase/auth'
import { createHouseholdChoresTemplate, createCurlyHairTemplate } from '@/lib/firebase/templates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateDefaultTemplatesPage() {
  const router = useRouter()
  const { user, loading, hasRole } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const createTemplates = async () => {
    if (!user) return

    try {
      setStatus('loading')
      setError(null)

      // Create both templates
      await Promise.all([
        createHouseholdChoresTemplate(user.uid),
        createCurlyHairTemplate(user.uid)
      ])

      setStatus('success')
      setTimeout(() => {
        router.push('/admin/templates')
      }, 2000)
    } catch (err) {
      console.error('Error creating templates:', err)
      setError('Failed to create templates')
      setStatus('error')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  }

  if (!user || !hasRole('admin')) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Default Templates</CardTitle>
          <CardDescription>
            Add the Household Chores and Curly Hair templates to the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                This will create two new templates:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Household Chores Journal</li>
                <li>Curly Hair Care Journal</li>
              </ul>
            </div>

            {status === 'success' ? (
              <div className="p-4 bg-green-50 text-green-600 rounded-md">
                Successfully created templates! Redirecting...
              </div>
            ) : (
              <Button 
                onClick={createTemplates} 
                disabled={status === 'loading'}
                className="w-full"
              >
                {status === 'loading' ? 'Creating templates...' : 'Create Templates'}
              </Button>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 