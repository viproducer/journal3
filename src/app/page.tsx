import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the journal dashboard
  redirect("/journal")
}

