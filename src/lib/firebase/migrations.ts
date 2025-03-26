import { adminDb } from './admin';
import type { JournalEntry } from './types';

const BATCH_SIZE = 500; // Firestore has a limit of 500 writes per batch

export async function migrateEntriesToUserStructure() {
  const entriesRef = adminDb.collection('entries');
  const entriesSnapshot = await entriesRef.get();
  const entries = entriesSnapshot.docs;
  
  console.log(`Found ${entries.length} entries to migrate`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process entries in batches
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = adminDb.batch();
    const batchEntries = entries.slice(i, i + BATCH_SIZE);
    
    for (const docRef of batchEntries) {
      try {
        const entry = docRef.data() as JournalEntry;
        const userId = entry.userId;
        const journalId = entry.journalId || 'default';
        
        // Add to new nested structure
        const newRef = adminDb
          .collection('users').doc(userId)
          .collection('journals').doc(journalId)
          .collection('entries').doc(docRef.id);
        
        batch.set(newRef, entry);
        batch.delete(docRef.ref);
        successCount++;
      } catch (error) {
        console.error(`Error processing entry ${docRef.id}:`, error);
        errorCount++;
      }
    }
    
    try {
      await batch.commit();
      console.log(`Processed batch ${i / BATCH_SIZE + 1}`);
    } catch (error) {
      console.error(`Error committing batch ${i / BATCH_SIZE + 1}:`, error);
      errorCount += batchEntries.length;
    }
  }
  
  console.log(`Migration complete. Successfully migrated: ${successCount}, Errors: ${errorCount}`);
}

export async function rollbackMigration() {
  let successCount = 0;
  let errorCount = 0;
  
  // Get all users
  const usersRef = adminDb.collection('users');
  const usersSnapshot = await usersRef.get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    
    // Get all journals for this user
    const journalsRef = userDoc.ref.collection('journals');
    const journalsSnapshot = await journalsRef.get();
    
    for (const journalDoc of journalsSnapshot.docs) {
      const journalId = journalDoc.id;
      
      // Get entries in batches
      const entriesRef = journalDoc.ref.collection('entries');
      let processedEntries = 0;
      
      while (true) {
        const entriesSnapshot = await entriesRef.limit(BATCH_SIZE).get();
        
        if (entriesSnapshot.empty) break;
        
        const batch = adminDb.batch();
        
        for (const entryDoc of entriesSnapshot.docs) {
          try {
            const entry = entryDoc.data() as JournalEntry;
            
            // Move back to root entries collection
            const rootEntryRef = adminDb.collection('entries').doc(entryDoc.id);
            batch.set(rootEntryRef, entry);
            batch.delete(entryDoc.ref);
            
            successCount++;
          } catch (error) {
            console.error(`Error processing entry ${entryDoc.id}:`, error);
            errorCount++;
          }
        }
        
        try {
          await batch.commit();
          processedEntries += entriesSnapshot.docs.length;
          console.log(`Rolled back ${processedEntries} entries for user ${userId}, journal ${journalId}`);
        } catch (error) {
          console.error(`Error committing batch for user ${userId}, journal ${journalId}:`, error);
          errorCount += entriesSnapshot.docs.length;
        }
      }
    }
  }
  
  console.log(`Rollback complete. Successfully rolled back: ${successCount}, Errors: ${errorCount}`);
} 