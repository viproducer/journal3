import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  increment,
  setDoc,
  collectionGroup
} from 'firebase/firestore';
import { db } from './config';
import { Journal, JournalEntry, MarketplaceTemplate, UserSubscription, UserProfile, UserRole, Goal } from './types';

// Helper function to get user's journals collection reference
function getUserJournalsCollection(userId: string) {
  return collection(db, 'users', userId, 'journals');
}

// Helper function to get journal's entries collection reference
function getJournalEntriesCollection(userId: string, journalId: string) {
  return collection(db, 'users', userId, 'journals', journalId, 'entries');
}

// Helper function to get a specific entry reference
function getJournalEntryRef(userId: string, journalId: string, entryId: string) {
  return doc(db, 'users', userId, 'journals', journalId, 'entries', entryId);
}

// Helper function to convert Firestore document to Journal type
function convertToJournal(doc: DocumentData): Journal {
  return {
    id: doc.id,
    name: doc.name || "My Journal",
    description: doc.description || "Your personal journal",
    userId: doc.userId,
    isActive: doc.isActive ?? true,
    isArchived: doc.isArchived ?? false,
    createdAt: doc.createdAt?.toDate() || new Date(),
    updatedAt: doc.updatedAt?.toDate() || new Date(),
    settings: doc.settings || {
      isPrivate: true,
      allowComments: false,
      allowSharing: false
    },
    stats: {
      totalEntries: doc.stats?.totalEntries || 0,
      lastEntryDate: doc.stats?.lastEntryDate?.toDate() || new Date(),
      streakCount: doc.stats?.streakCount || 0
    }
  };
}

// Helper function to convert Firestore document to JournalEntry type
function convertToJournalEntry(doc: DocumentData): JournalEntry {
  return {
    id: doc.id,
    journalId: doc.journalId,
    userId: doc.userId,
    content: doc.content,
    tags: doc.tags || [],
    createdAt: doc.createdAt?.toDate() || new Date(),
    updatedAt: doc.updatedAt?.toDate() || new Date(),
    metadata: doc.metadata || {}
  };
}

// Journals
export const journalsCollection = collection(db, 'journals');

export async function createJournal(journal: Omit<Journal, 'id'>): Promise<Journal> {
  try {
    console.log('Creating new journal:', journal);
    
    // First ensure user document exists
    const userRef = doc(db, 'users', journal.userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User document does not exist, creating it...');
      await setDoc(userRef, {
        id: journal.userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
        settings: {
          notifications: true,
          privacy: {
            shareJournals: false,
            allowAnalytics: true
          }
        }
      });
    }

    const journalsRef = getUserJournalsCollection(journal.userId);
    
    const docRef = await addDoc(journalsRef, {
      ...journal,
      createdAt: Timestamp.fromDate(journal.createdAt),
      updatedAt: Timestamp.fromDate(journal.updatedAt),
      stats: {
        totalEntries: 0,
        lastEntryDate: Timestamp.fromDate(new Date()),
        streakCount: 0
      }
    });

    console.log('Journal created with ID:', docRef.id);

    return {
      id: docRef.id,
      ...journal
    };
  } catch (error) {
    console.error('Error creating journal:', error);
    throw error;
  }
}

export async function getUserJournals(userId: string): Promise<Journal[]> {
  try {
    console.log('Starting getUserJournals with userId:', userId);
    
    if (!userId) {
      console.error('getUserJournals called with empty userId');
      throw new Error('User ID is required');
    }

    // First check if user document exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User document does not exist, creating it...');
      await setDoc(userRef, {
        id: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
        settings: {
          notifications: true,
          privacy: {
            shareJournals: false,
            allowAnalytics: true
          }
        }
      });
    }

    const journalsRef = getUserJournalsCollection(userId);
    const q = query(journalsRef, where('isArchived', '==', false));
    
    console.log('Executing Firestore query:', {
      collection: `users/${userId}/journals`,
      query: 'isArchived == false'
    });

    const snapshot = await getDocs(q);
    
    console.log('Got journals snapshot:', {
      empty: snapshot.empty,
      size: snapshot.size
    });

    // If user has no journals, create a default one
    if (snapshot.empty) {
      console.log('No journals found, creating default journal');
      const defaultJournal = await createJournal({
        userId: userId,
        name: "My Journal",
        description: "Your personal journal",
        isActive: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          isPrivate: true,
          allowComments: false,
          allowSharing: false
        }
      });
      return [defaultJournal];
    }

    const journals = snapshot.docs.map(doc => convertToJournal({
      id: doc.id,
      userId,  // Ensure userId is included
      ...doc.data()
    }));

    // Sort the journals in memory
    journals.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return journals;
  } catch (error) {
    console.error('Error in getUserJournals:', error);
    throw error;
  }
}

// Journal Entries
export const entriesCollection = collection(db, 'entries');

export async function createEntry(entryData: Omit<JournalEntry, 'id'>) {
  try {
    // Create the entry under the user's journal
    const entriesRef = getJournalEntriesCollection(entryData.userId, entryData.journalId);
    const docRef = await addDoc(entriesRef, {
      ...entryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Update the journal's stats
    const journalRef = doc(getUserJournalsCollection(entryData.userId), entryData.journalId);
    await updateDoc(journalRef, {
      'stats.totalEntries': increment(1),
      'stats.lastEntryDate': Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    return { id: docRef.id, ...entryData };
  } catch (error) {
    console.error('Error creating entry:', error);
    throw error;
  }
}

export async function getJournalEntries(userId: string, journalId: string, limitCount: number = 10): Promise<JournalEntry[]> {
  try {
    console.log('Starting getJournalEntries:', { userId, journalId });
    
    const entriesRef = getJournalEntriesCollection(userId, journalId);
    const q = query(
      entriesRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    console.log('Got entries snapshot:', {
      empty: snapshot.empty,
      size: snapshot.size
    });

    if (snapshot.empty) {
      return [];
    }

    const entries = snapshot.docs.map(doc => convertToJournalEntry({
      id: doc.id,
      userId,  // Ensure userId is included
      journalId,  // Ensure journalId is included
      ...doc.data()
    }));

    console.log('Successfully loaded entries:', entries.length);
    return entries;
  } catch (error) {
    console.error('Error in getJournalEntries:', error);
    throw error;
  }
}

// Marketplace Templates
export const templatesCollection = collection(db, 'templates');

export async function getMarketplaceTemplates(): Promise<MarketplaceTemplate[]> {
  const q = query(
    templatesCollection,
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as MarketplaceTemplate));
}

export async function getTemplateById(templateId: string): Promise<MarketplaceTemplate | null> {
  const docRef = doc(templatesCollection, templateId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MarketplaceTemplate;
  }
  return null;
}

// User Subscriptions
export const subscriptionsCollection = collection(db, 'subscriptions');

export async function createSubscription(subscriptionData: Omit<UserSubscription, 'id'>) {
  const docRef = await addDoc(subscriptionsCollection, {
    ...subscriptionData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return { id: docRef.id, ...subscriptionData };
}

export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  const q = query(
    subscriptionsCollection,
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as UserSubscription));
}

export const usersCollection = collection(db, 'users');

export async function setUserRole(userId: string, role: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await setDoc(userRef, {
        ...userDoc.data(),
        role: role,
        updatedAt: new Date()
      }, { merge: true });
      return true;
    } else {
      // If user document doesn't exist, create it
      await setDoc(userRef, {
        id: userId,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        subscribedTemplates: [],
        settings: {}
      });
      return true;
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}

export async function getJournalEntry(userId: string, journalId: string, entryId: string): Promise<JournalEntry | null> {
  try {
    console.log('Getting journal entry:', { userId, journalId, entryId });
    const entryRef = getJournalEntryRef(userId, journalId, entryId);
    const entryDoc = await getDoc(entryRef);

    if (!entryDoc.exists()) {
      console.log('Entry not found');
      return null;
    }

    return convertToJournalEntry({
      id: entryDoc.id,
      userId,
      journalId,
      ...entryDoc.data()
    });
  } catch (error) {
    console.error('Error getting journal entry:', error);
    throw error;
  }
}

export async function updateJournalEntry(
  userId: string,
  journalId: string,
  entryId: string,
  updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'journalId' | 'createdAt'>>
): Promise<void> {
  try {
    console.log('Updating journal entry:', { userId, journalId, entryId, updates });
    const entryRef = getJournalEntryRef(userId, journalId, entryId);
    
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
}

export async function deleteJournalEntry(userId: string, journalId: string, entryId: string): Promise<void> {
  try {
    console.log('Deleting journal entry:', { userId, journalId, entryId });
    const entryRef = getJournalEntryRef(userId, journalId, entryId);
    const journalRef = doc(getUserJournalsCollection(userId), journalId);

    // Delete the entry and update journal stats
    await Promise.all([
      deleteDoc(entryRef),
      updateDoc(journalRef, {
        'stats.totalEntries': increment(-1),
        updatedAt: Timestamp.now()
      })
    ]);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
}

// Goals Collection Reference
const getGoalsCollection = (userId: string) => collection(db, 'users', userId, 'goals')

// Create a new goal
export async function createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
  try {
    const goalsRef = getGoalsCollection(goal.userId)
    const docRef = await addDoc(goalsRef, {
      ...goal,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return { id: docRef.id, ...goal }
  } catch (error) {
    console.error('Error creating goal:', error)
    throw error
  }
}

// Get all goals for a user
export async function getUserGoals(userId: string): Promise<Goal[]> {
  try {
    const goalsRef = getGoalsCollection(userId)
    const q = query(goalsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate?.toDate()
    })) as Goal[]
  } catch (error) {
    console.error('Error getting goals:', error)
    throw error
  }
}

// Update a goal
export async function updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
  try {
    const goalRef = doc(getGoalsCollection(userId), goalId)
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}

// Delete a goal
export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  try {
    const goalRef = doc(getGoalsCollection(userId), goalId)
    await deleteDoc(goalRef)
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}

// Get active goals count
export async function getActiveGoalsCount(userId: string): Promise<number> {
  try {
    const goalsRef = getGoalsCollection(userId)
    const q = query(goalsRef, where('status', '==', 'active'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('Error getting active goals count:', error)
    throw error
  }
}

// Time tracking functions
export async function startEntryTimer(userId: string, journalId: string, entryId: string): Promise<void> {
  try {
    const entryRef = doc(getJournalEntriesCollection(userId, journalId), entryId)
    await updateDoc(entryRef, {
      startTime: Timestamp.now()
    })
  } catch (error) {
    console.error('Error starting entry timer:', error)
    throw error
  }
}

export async function endEntryTimer(userId: string, journalId: string, entryId: string): Promise<void> {
  try {
    const entryRef = doc(getJournalEntriesCollection(userId, journalId), entryId)
    const entryDoc = await getDoc(entryRef)
    const entryData = entryDoc.data()

    if (!entryData?.startTime) {
      throw new Error('Entry timer was not started')
    }

    const endTime = Timestamp.now()
    const timeSpent = Math.round((endTime.toMillis() - entryData.startTime.toMillis()) / 60000) // Convert to minutes

    await updateDoc(entryRef, {
      endTime,
      timeSpent
    })
  } catch (error) {
    console.error('Error ending entry timer:', error)
    throw error
  }
}

// Get average time spent on entries
export async function getAverageEntryTime(userId: string, journalId: string): Promise<number> {
  try {
    const entriesRef = getJournalEntriesCollection(userId, journalId)
    const q = query(entriesRef, where('timeSpent', '>', 0))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) return 0

    const totalTime = querySnapshot.docs.reduce((sum, doc) => sum + (doc.data().timeSpent || 0), 0)
    return Math.round(totalTime / querySnapshot.size)
  } catch (error) {
    console.error('Error calculating average entry time:', error)
    throw error
  }
} 