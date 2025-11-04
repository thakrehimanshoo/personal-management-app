import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findById(session.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password in database
    // Note: We need to add an update method to db.user
    // For now, we'll read, modify, and write back
    const users = await readUsersFile()
    const userIndex = users.findIndex((u: any) => u.id === session.userId)
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    users[userIndex].passwordHash = newPasswordHash
    users[userIndex].updatedAt = new Date().toISOString()

    await writeUsersFile(users)

    return NextResponse.json({
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

// Helper functions (temporary - should be in db utility)
import fs from 'fs/promises'
import path from 'path'

async function readUsersFile() {
  const filePath = path.join(process.cwd(), 'data', 'users.json')
  const data = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}

async function writeUsersFile(users: any[]) {
  const filePath = path.join(process.cwd(), 'data', 'users.json')
  await fs.writeFile(filePath, JSON.stringify(users, null, 2))
}