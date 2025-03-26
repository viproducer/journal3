"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Book } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();

  return (
    <Link
      href="/journal/browse"
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
        pathname === "/journal/browse"
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Book className="h-4 w-4" />
      Journal
    </Link>
  );
} 