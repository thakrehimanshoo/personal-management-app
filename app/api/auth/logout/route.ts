import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/lib/auth/session'

export async function POST(req: Request) {
  try {
    await deleteSessionCookie()

    // Detect navigation vs. programmatic fetch
    const accept = req.headers.get('accept') || ''
    const isHtmlRequest = accept.includes('text/html')

    if (isHtmlRequest) {
      // Redirect to home for navigations/forms
      return NextResponse.redirect(new URL('/', req.url))
    }

    // For fetch/XHR callers, return JSON; let the client redirect
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
