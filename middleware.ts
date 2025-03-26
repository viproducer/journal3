import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname

  // Redirect root path to /journal
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/journal", request.url))
  }

  // Check if the pathname is /journal/new
  if (pathname === "/journal/new") {
    // Redirect to the create-entry page instead of new-entry
    return NextResponse.redirect(new URL("/journal/create-entry", request.url))
  }

  // Also redirect the problematic new-entry route to create-entry
  if (pathname === "/journal/new-entry") {
    return NextResponse.redirect(new URL("/journal/create-entry", request.url))
  }

  // Continue with the request if no redirect is needed
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/journal/new", "/journal/new-entry"],
}

