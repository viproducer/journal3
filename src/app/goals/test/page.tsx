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
      category: "Personal Growth",
      type: "Personal Growth",
      targets: [{
        name: "Main Target",
        value: "10",
        unit: "items",
        period: "total"
      }],
      progress: 0,
      goalStatement: "Test goal statement",
      goalWhy: "To test goal creation",
      nextSteps: "Test next steps",
      milestones: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        category: "Personal Growth",
        type: "Personal Growth"
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