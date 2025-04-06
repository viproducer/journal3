import React from "react"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/firebase/auth"

interface NavigationProps {
  onLogout: () => Promise<void>
}

export function Navigation({ onLogout }: NavigationProps) {
  const { hasRole } = useAuth()

  return (
    <nav className="ml-auto flex gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/journal">Dashboard</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/journal/browse">Journal</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/goals">Goals</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/marketplace">Marketplace</Link>
      </Button>
      {hasRole('admin') && (
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/templates">Admin</Link>
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onLogout}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </nav>
  )
} 