import bcrypt from 'bcryptjs'
import { db, User } from '@/lib/db'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, name?: string) {
  const existingUser = await db.user.findByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const passwordHash = await hashPassword(password)
  return db.user.create({ email, passwordHash, name })
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await db.user.findByEmail(email)
  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  return user
}
