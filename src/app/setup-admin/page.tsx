"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/firebase/auth'
import { setUserRole } from '@/lib/firebase/user-roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupAdminPage() {
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const makeAdmin = async () => {
    if (!user) return

    try {
      setStatus('loading')
      setError(null)
      
      const success = await setUserRole(user.uid, 'admin')
      
      if (success) {
        setStatus('success')
      } else {
        setError('Failed to update role')
        setStatus('error')
      }
    } catch (err) {
      console.error('Error making user admin:', err)
      setError('An unexpected error occurred')
      setStatus('error')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Please sign in first</p>
    </div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Setup Admin User</CardTitle>
          <CardDescription>
            Make your account an admin user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Current user: {user.email}
              </p>
            </div>

            {status === 'success' ? (
              <div className="p-4 bg-green-50 text-green-600 rounded-md">
                Successfully made user an admin!
              </div>
            ) : (
              <Button 
                onClick={makeAdmin} 
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Making admin...' : 'Make Admin'}
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