import { Loader2 } from "lucide-react"

export default function CurlyHairJournalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your curly hair journal setup...</p>
      </div>
    </div>
  )
}

