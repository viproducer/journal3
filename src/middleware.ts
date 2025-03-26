import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isJournalPage = request.nextUrl.pathname.startsWith('/journal')

  // If trying to access auth pages while logged in, redirect to journal
  if (isAuthPage && authCookie) {
    return NextResponse.redirect(new URL('/journal', request.url))
  }

  // If trying to access protected pages while logged out, redirect to sign in
  if (isJournalPage && !authCookie) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/journal/:path*',
    '/auth/:path*'
  ]
} 