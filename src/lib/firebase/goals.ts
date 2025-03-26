import { db } from "./config"
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp, serverTimestamp } from "firebase/firestore"
import { Goal, GoalProgress } from "./types"

export async function createGoal(userId: string, goalData: Goal) {
  try {
    console.log("Creating goal in Firestore:", {
      userId,
      goalData: {
        ...goalData,
        createdAt: "serverTimestamp()",
        updatedAt: "serverTimestamp()"
      }
    })

    const goalsRef = collection(db, "users", userId, "goals")
    const docRef = await addDoc(goalsRef, {
      ...goalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      progress: 0,
      type: "goals-intentions",
      metadata: {
        category: goalData.category,
        type: goalData.type
      }
    })

    console.log("Goal created successfully with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating goal in Firestore:", error)
    throw error
  }
}

export async function updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
  const goalRef = doc(db, "users", userId, "goals", goalId)
  await updateDoc(goalRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  const goalRef = doc(db, "users", userId, "goals", goalId)
  await deleteDoc(goalRef)
}

export async function getUserGoals(userId: string): Promise<Goal[]> {
  const goalsRef = collection(db, "users", userId, "goals")
  const q = query(goalsRef, orderBy("createdAt", "desc"))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Goal[]
}

export async function getGoalProgress(userId: string, goalId: string): Promise<GoalProgress[]> {
  const progressRef = collection(db, "users", userId, "goals", goalId, "progress")
  const q = query(progressRef, orderBy("date", "desc"))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
  })) as GoalProgress[]
}

export async function addGoalProgress(
  userId: string,
  goalId: string,
  progress: Omit<GoalProgress, "id" | "date">
): Promise<string> {
  const progressRef = collection(db, "users", userId, "goals", goalId, "progress")
  const docRef = await addDoc(progressRef, {
    ...progress,
    date: Timestamp.now(),
  })
  return docRef.id
}

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  progressId: string,
  updates: Partial<GoalProgress>
): Promise<void> {
  const progressRef = doc(db, "users", userId, "goals", goalId, "progress", progressId)
  await updateDoc(progressRef, updates)
}

export async function deleteGoalProgress(
  userId: string,
  goalId: string,
  progressId: string
): Promise<void> {
  const progressRef = doc(db, "users", userId, "goals", goalId, "progress", progressId)
  await deleteDoc(progressRef)
} 