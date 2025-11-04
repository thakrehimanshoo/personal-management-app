import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/lib/auth/session'

export async function POST() {
  try {
    await deleteSessionCookie()

    return NextResponse.json({
      message: 'Logged out successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}