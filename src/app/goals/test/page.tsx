"use client"

import { useAuth } from "@/lib/firebase/auth"
import { createGoal } from "@/lib/firebase/db"
import { Button } from "@/components/ui/button"
import { Timestamp } from "firebase/firestore"

export default function TestGoalsPage() {
  const { user } = useAuth()

  const createTestGoal = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    console.log('Creating test goal for user:', user.uid);

    const testGoal = {
      userId: user.uid,
      title: "Test Goal",
      description: "This is a test goal",
      category: "Health" as const,
      type: "fitness",
      targets: [
        {
          name: "Push-ups",
          value: "50",
          unit: "reps",
          period: "daily",
          startValue: "0",
          currentValue: "0",
          unitType: "count" as const,
          unitSystem: "metric" as const,
          direction: "max" as const
        }
      ],
      progress: 0,
      goalStatement: "I want to do 50 push-ups daily",
      goalWhy: "To improve upper body strength",
      nextSteps: "Start with 10 push-ups and gradually increase",
      milestones: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        category: "Health" as const,
        type: "fitness"
      }
    }

    try {
      console.log('Attempting to create test goal:', testGoal);
      const newGoal = await createGoal(testGoal);
      console.log('Test goal created successfully:', newGoal);
    } catch (error) {
      console.error('Error creating test goal:', error);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Test Goal Creation</h1>
      <Button onClick={createTestGoal}>
        Create Test Goal
      </Button>
    </div>
  )
} 