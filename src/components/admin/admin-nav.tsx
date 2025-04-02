"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Edit3, LogOut } from "lucide-react"
import { useAuth } from "@/lib/firebase/auth"

const navItems = [
  {
    title: "Admin Dashboard",
    href: "/admin",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Templates",
    href: "/admin/templates",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Edit3 className="h-5 w-5" />
        <span>JournalMind</span>
      </Link>
      <nav className="ml-auto flex gap-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              pathname === item.href && "bg-accent"
            )}
          >
            <Link href={item.href}>{item.title}</Link>
          </Button>
        ))}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </nav>
    </header>
  )
} 