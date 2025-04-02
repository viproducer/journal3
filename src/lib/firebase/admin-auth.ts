import { getAuth } from 'firebase-admin/auth';
import { adminDb } from './admin';

export async function setAdminRole(userId: string): Promise<boolean> {
  try {
    // Set custom claim
    await getAuth().setCustomUserClaims(userId, { role: 'admin' });

    // Update user document
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.set({
      role: 'admin',
      updatedAt: new Date()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error setting admin role:', error);
    return false;
  }
}

export async function removeAdminRole(userId: string): Promise<boolean> {
  try {
    // Remove custom claim
    await getAuth().setCustomUserClaims(userId, { role: 'user' });

    // Update user document
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.set({
      role: 'user',
      updatedAt: new Date()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
} 