import { db } from "./config";
import { collection, doc, getDoc, setDoc, query, where, getDocs, Timestamp, updateDoc, deleteDoc } from "firebase/firestore";
import type { UserAffirmation, Affirmation, AffirmationCategory } from "./types";
import { getRandomAffirmation } from "../data/affirmations";

export const getUserAffirmation = async (userId: string, journalTypeId: string): Promise<Affirmation | null> => {
  try {
    if (!userId || !journalTypeId) {
      console.error("Missing required parameters:", { userId, journalTypeId });
      return null;
    }

    // Get the user's last shown affirmation
    const userAffirmationsRef = collection(db, "userAffirmations");
    const q = query(
      userAffirmationsRef,
      where("userId", "==", userId),
      where("journalTypeId", "==", journalTypeId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // If no affirmation exists, create a new one
      const affirmation = getRandomAffirmation(journalTypeId);
      if (!affirmation) {
        console.error("Failed to get random affirmation for type:", journalTypeId);
        return null;
      }
      const userAffirmation: UserAffirmation = {
        userId,
        journalTypeId,
        lastShownDate: new Date(),
        affirmationId: affirmation.id
      };
      await setDoc(doc(userAffirmationsRef), userAffirmation);
      return affirmation;
    }

    const userAffirmation = querySnapshot.docs[0].data() as UserAffirmation;
    const lastShownDate = (userAffirmation.lastShownDate as unknown as Timestamp).toDate();
    const today = new Date();
    
    // Check if the affirmation was shown today
    if (
      lastShownDate.getDate() === today.getDate() &&
      lastShownDate.getMonth() === today.getMonth() &&
      lastShownDate.getFullYear() === today.getFullYear()
    ) {
      // Return the same affirmation if it was shown today
      const affirmation = getRandomAffirmation(journalTypeId);
      if (!affirmation) {
        console.error("Failed to get random affirmation for type:", journalTypeId);
        return null;
      }
      return affirmation;
    }

    // Get a new random affirmation
    const affirmation = getRandomAffirmation(journalTypeId);
    if (!affirmation) {
      console.error("Failed to get random affirmation for type:", journalTypeId);
      return null;
    }
    await setDoc(doc(userAffirmationsRef, querySnapshot.docs[0].id), {
      ...userAffirmation,
      lastShownDate: Timestamp.now(),
      affirmationId: affirmation.id
    });

    return affirmation;
  } catch (error) {
    console.error("Error getting user affirmation:", error);
    return null;
  }
};

export const updateUserAffirmation = async (
  userId: string,
  journalTypeId: string,
  affirmationId: string
): Promise<void> => {
  try {
    if (!userId || !journalTypeId || !affirmationId) {
      console.error("Missing required parameters:", { userId, journalTypeId, affirmationId });
      return;
    }

    const userAffirmationsRef = collection(db, "userAffirmations");
    const q = query(
      userAffirmationsRef,
      where("userId", "==", userId),
      where("journalTypeId", "==", journalTypeId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new user affirmation
      const userAffirmation: UserAffirmation = {
        userId,
        journalTypeId,
        lastShownDate: new Date(),
        affirmationId
      };
      await setDoc(doc(userAffirmationsRef), userAffirmation);
    } else {
      // Update existing user affirmation
      await setDoc(doc(userAffirmationsRef, querySnapshot.docs[0].id), {
        lastShownDate: Timestamp.now(),
        affirmationId
      });
    }
  } catch (error) {
    console.error("Error updating user affirmation:", error);
  }
};

export const saveAffirmation = async (affirmation: Affirmation): Promise<void> => {
  try {
    const affirmationsRef = collection(db, "affirmations");
    await setDoc(doc(affirmationsRef, affirmation.id), affirmation);
  } catch (error) {
    console.error("Error saving affirmation:", error);
    throw error;
  }
};

export const updateAffirmation = async (affirmation: Affirmation): Promise<void> => {
  try {
    const affirmationsRef = collection(db, "affirmations");
    await updateDoc(doc(affirmationsRef, affirmation.id), affirmation);
  } catch (error) {
    console.error("Error updating affirmation:", error);
    throw error;
  }
};

export const deleteAffirmation = async (id: string): Promise<void> => {
  try {
    const affirmationsRef = collection(db, "affirmations");
    await deleteDoc(doc(affirmationsRef, id));
  } catch (error) {
    console.error("Error deleting affirmation:", error);
    throw error;
  }
};

export const getAllAffirmations = async (): Promise<Affirmation[]> => {
  try {
    const affirmationsRef = collection(db, "affirmations");
    const querySnapshot = await getDocs(affirmationsRef);
    return querySnapshot.docs.map(doc => doc.data() as Affirmation);
  } catch (error) {
    console.error("Error fetching affirmations:", error);
    throw error;
  }
}; 