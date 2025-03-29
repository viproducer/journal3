"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from './config'
import { UserProfile, UserRole } from './types'
import { createUserProfile, getUserProfile } from './users'
import Cookies from 'js-cookie'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email)
      setUser(user)
      
      if (user) {
        try {
          // Get or create user profile
          let profile = await getUserProfile(user.uid)
          if (!profile) {
            profile = await createUserProfile(user.uid, user.email || '', 'user')
          }
          setUserProfile(profile)
          Cookies.set('auth', 'true', { 
            expires: 7,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          })
        } catch (error) {
          console.error('Error loading user profile:', error)
        }
      } else {
        setUserProfile(null)
        Cookies.remove('auth')
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await createUserProfile(userCredential.user.uid, email, 'user')
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      Cookies.remove('auth')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const hasRole = (role: UserRole): boolean => {
    if (!userProfile) return false
    
    if (role === 'admin') {
      return userProfile.role === 'admin'
    }
    if (role === 'creator') {
      return userProfile.role === 'creator' || userProfile.role === 'admin'
    }
    return true // Everyone has basic user role
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 