"use client"

import { AuthProvider } from '@/lib/firebase/auth'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
} 