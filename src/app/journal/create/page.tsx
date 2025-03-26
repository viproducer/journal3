"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CreateJournalForm from "@/components/journal/create-journal-form"

export default function CreateJournalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Journal</span>
        </Link>
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Create New Journal</h1>
            <p className="text-muted-foreground">
              Create a new journal to organize your thoughts and track your progress
            </p>
          </div>

          <CreateJournalForm />
        </div>
      </main>
    </div>
  )
} 