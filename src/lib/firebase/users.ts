import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, UserRole } from './types';

export const usersCollection = collection(db, 'users');

export async function createUserProfile(userId: string, email: string, role: UserRole = 'user'): Promise<UserProfile> {
  const userProfile: UserProfile = {
    id: userId,
    email,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    subscribedTemplates: [],
    settings: {
      notifications: true,
      privacy: {
        shareJournals: false,
        allowAnalytics: true
      }
    }
  };

  await setDoc(doc(usersCollection, userId), {
    ...userProfile,
    createdAt: Timestamp.fromDate(userProfile.createdAt),
    updatedAt: Timestamp.fromDate(userProfile.updatedAt)
  });

  return userProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(usersCollection, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const docRef = doc(usersCollection, userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  const q = query(usersCollection, where('role', '==', role));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as UserProfile[];
}

export async function subscribeToTemplate(userId: string, templateId: string): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    subscribedTemplates: arrayUnion(templateId),
    updatedAt: Timestamp.now()
  });
}

export async function unsubscribeFromTemplate(userId: string, templateId: string): Promise<void> {
  const userRef = doc(usersCollection, userId);
  await updateDoc(userRef, {
    subscribedTemplates: arrayRemove(templateId),
    updatedAt: Timestamp.now()
  });
}

export async function isUserSubscribedToTemplate(userId: string, templateId: string): Promise<boolean> {
  const userProfile = await getUserProfile(userId);
  return userProfile?.subscribedTemplates.includes(templateId) || false;
} 