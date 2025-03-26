import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './config'
import type { UserProfile, UserRole } from './types'

export async function setUserRole(userId: string, role: UserRole) {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      await setDoc(userRef, {
        ...userDoc.data(),
        role: role,
        updatedAt: new Date()
      }, { merge: true })
      return true
    } else {
      console.error('User document does not exist')
      return false
    }
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
} 