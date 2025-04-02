"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/firebase/auth'
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
      
      // Get the user's ID token
      const idToken = await user.getIdToken()
      
      // Call the API endpoint
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
      } else {
        setError(data.error || 'Failed to update role')
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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Admin Role</CardTitle>
          <CardDescription>
            This will set up the admin role for your account. This action can only be performed by the first user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current user:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            
            {status === 'success' && (
              <div className="p-4 bg-green-50 text-green-700 rounded-md">
                Admin role has been set successfully!
              </div>
            )}
            
            {status === 'error' && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <Button 
              onClick={makeAdmin}
              disabled={status === 'loading' || status === 'success'}
              className="w-full"
            >
              {status === 'loading' ? 'Setting up...' : 'Setup Admin Role'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 