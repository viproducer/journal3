import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware processing request:', request.nextUrl.pathname)
  
  const authCookie = request.cookies.get('auth')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isJournalPage = request.nextUrl.pathname.startsWith('/journal')

  console.log('Auth state:', { 
    hasAuthCookie: !!authCookie,
    isAuthPage,
    isJournalPage
  })

  // If trying to access auth pages while logged in, redirect to journal
  if (isAuthPage && authCookie) {
    console.log('Redirecting from auth to journal (already logged in)')
    return NextResponse.redirect(new URL('/journal', request.url))
  }

  // If trying to access protected pages while logged out, redirect to sign in
  if (isJournalPage && !authCookie) {
    console.log('Redirecting from journal to signin (not logged in)')
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  console.log('Proceeding with request')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/journal/:path*',
    '/auth/:path*'
  ]
} 