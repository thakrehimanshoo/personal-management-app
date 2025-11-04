import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
// Check if we should use MySQL or JSON
const USE_MYSQL = process.env.DB_HOST && process.env.DB_NAME

// Import MySQL operations
import { mysqlDb } from './mysql-operations'

const DB_PATH = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_PATH, 'users.json')
const IDEAS_FILE = path.join(DB_PATH, 'ideas.json')
const SUBSCRIPTIONS_FILE = path.join(DB_PATH, 'subscriptions.json')

export interface User {
  id: string
  email: string
  passwordHash: string
  name?: string
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  title: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  category?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Subscription {
  id: string
  name: string
  description?: string
  cost: number
  currency: string
  billingCycle: 'monthly' | 'yearly' | 'quarterly'
  renewalDate: string
  category?: string
  status: 'active' | 'cancelled' | 'paused'
  website?: string
  createdAt: string
  updatedAt: string
  userId: string
}

// Initialize database files
async function ensureDbExists() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true })
    
    for (const file of [USERS_FILE, IDEAS_FILE, SUBSCRIPTIONS_FILE]) {
      try {
        await fs.access(file)
      } catch {
        await fs.writeFile(file, JSON.stringify([]))
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// Generic CRUD operations
async function readFile<T>(filePath: string): Promise<T[]> {
  await ensureDbExists()
  const data = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}

async function writeFile<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDbExists()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

function generateId(): string {
  return crypto.randomBytes(16).toString('hex')
}

// User operations
export const db = USE_MYSQL ? mysqlDb :  {
  user: {
    async findByEmail(email: string): Promise<User | null> {
      const users = await readFile<User>(USERS_FILE)
      return users.find(u => u.email === email) || null
    },
    
    async findById(id: string): Promise<User | null> {
      const users = await readFile<User>(USERS_FILE)
      return users.find(u => u.id === id) || null
    },
    
    async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
      const users = await readFile<User>(USERS_FILE)
      const now = new Date().toISOString()
      const user: User = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      users.push(user)
      await writeFile(USERS_FILE, users)
      return user
    },
  },

  idea: {
    async findMany(userId: string): Promise<Idea[]> {
      const ideas = await readFile<Idea>(IDEAS_FILE)
      return ideas.filter(i => i.userId === userId)
    },
    
    async findById(id: string, userId: string): Promise<Idea | null> {
      const ideas = await readFile<Idea>(IDEAS_FILE)
      return ideas.find(i => i.id === id && i.userId === userId) || null
    },
    
    async create(data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
      const ideas = await readFile<Idea>(IDEAS_FILE)
      const now = new Date().toISOString()
      const idea: Idea = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      ideas.push(idea)
      await writeFile(IDEAS_FILE, ideas)
      return idea
    },
    
    async update(id: string, userId: string, data: Partial<Omit<Idea, 'id' | 'createdAt' | 'userId'>>): Promise<Idea | null> {
      const ideas = await readFile<Idea>(IDEAS_FILE)
      const index = ideas.findIndex(i => i.id === id && i.userId === userId)
      if (index === -1) return null
      
      ideas[index] = {
        ...ideas[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      await writeFile(IDEAS_FILE, ideas)
      return ideas[index]
    },
    
    async delete(id: string, userId: string): Promise<boolean> {
      const ideas = await readFile<Idea>(IDEAS_FILE)
      const filtered = ideas.filter(i => !(i.id === id && i.userId === userId))
      if (filtered.length === ideas.length) return false
      await writeFile(IDEAS_FILE, filtered)
      return true
    },
  },

  subscription: {
    async findMany(userId: string): Promise<Subscription[]> {
      const subscriptions = await readFile<Subscription>(SUBSCRIPTIONS_FILE)
      return subscriptions.filter(s => s.userId === userId)
    },
    
    async findById(id: string, userId: string): Promise<Subscription | null> {
      const subscriptions = await readFile<Subscription>(SUBSCRIPTIONS_FILE)
      return subscriptions.find(s => s.id === id && s.userId === userId) || null
    },
    
    async create(data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
      const subscriptions = await readFile<Subscription>(SUBSCRIPTIONS_FILE)
      const now = new Date().toISOString()
      const subscription: Subscription = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      subscriptions.push(subscription)
      await writeFile(SUBSCRIPTIONS_FILE, subscriptions)
      return subscription
    },
    
    async update(id: string, userId: string, data: Partial<Omit<Subscription, 'id' | 'createdAt' | 'userId'>>): Promise<Subscription | null> {
      const subscriptions = await readFile<Subscription>(SUBSCRIPTIONS_FILE)
      const index = subscriptions.findIndex(s => s.id === id && s.userId === userId)
      if (index === -1) return null
      
      subscriptions[index] = {
        ...subscriptions[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      await writeFile(SUBSCRIPTIONS_FILE, subscriptions)
      return subscriptions[index]
    },
    
    async delete(id: string, userId: string): Promise<boolean> {
      const subscriptions = await readFile<Subscription>(SUBSCRIPTIONS_FILE)
      const filtered = subscriptions.filter(s => !(s.id === id && s.userId === userId))
      if (filtered.length === subscriptions.length) return false
      await writeFile(SUBSCRIPTIONS_FILE, filtered)
      return true
    },
  },
}
