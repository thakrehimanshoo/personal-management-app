import { query } from './mysql'
import crypto from 'crypto'

function generateId(): string {
  return crypto.randomBytes(16).toString('hex')
}

export const mysqlDb = {
  user: {
    async findByEmail(email: string) {
      const results: any = await query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      )
      return results[0] || null
    },

    async findById(id: string) {
      const results: any = await query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      )
      return results[0] || null
    },

    async create(data: { email: string; passwordHash: string; name?: string }) {
      const id = generateId()
      await query(
        'INSERT INTO users (id, email, passwordHash, name) VALUES (?, ?, ?, ?)',
        [id, data.email, data.passwordHash, data.name || null]
      )
      return this.findById(id)
    },

    async updatePassword(id: string, passwordHash: string) {
      await query(
        'UPDATE users SET passwordHash = ? WHERE id = ?',
        [passwordHash, id]
      )
      return this.findById(id)
    },
  },

  idea: {
    async findMany(userId: string) {
      const results: any = await query(
        'SELECT * FROM ideas WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      )
      return results.map((idea: any) => ({
        ...idea,
        tags: JSON.parse(idea.tags || '[]'),
      }))
    },

    async findById(id: string, userId: string) {
      const results: any = await query(
        'SELECT * FROM ideas WHERE id = ? AND userId = ?',
        [id, userId]
      )
      if (results[0]) {
        return {
          ...results[0],
          tags: JSON.parse(results[0].tags || '[]'),
        }
      }
      return null
    },

    async create(data: {
      title: string
      description?: string
      status: string
      category?: string
      tags: string[]
      userId: string
    }) {
      const id = generateId()
      await query(
        'INSERT INTO ideas (id, title, description, status, category, tags, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          data.title,
          data.description || null,
          data.status,
          data.category || null,
          JSON.stringify(data.tags),
          data.userId,
        ]
      )
      return this.findById(id, data.userId)
    },

    async update(
      id: string,
      userId: string,
      data: {
        title?: string
        description?: string
        status?: string
        category?: string
        tags?: string[]
      }
    ) {
      const updates: string[] = []
      const values: any[] = []

      if (data.title !== undefined) {
        updates.push('title = ?')
        values.push(data.title)
      }
      if (data.description !== undefined) {
        updates.push('description = ?')
        values.push(data.description)
      }
      if (data.status !== undefined) {
        updates.push('status = ?')
        values.push(data.status)
      }
      if (data.category !== undefined) {
        updates.push('category = ?')
        values.push(data.category)
      }
      if (data.tags !== undefined) {
        updates.push('tags = ?')
        values.push(JSON.stringify(data.tags))
      }

      if (updates.length === 0) return this.findById(id, userId)

      values.push(id, userId)
      await query(
        `UPDATE ideas SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
        values
      )
      return this.findById(id, userId)
    },

    async delete(id: string, userId: string) {
      const result: any = await query(
        'DELETE FROM ideas WHERE id = ? AND userId = ?',
        [id, userId]
      )
      return result.affectedRows > 0
    },
  },

  subscription: {
    async findMany(userId: string) {
      const results: any = await query(
        'SELECT * FROM subscriptions WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      )
      return results
    },

    async findById(id: string, userId: string) {
      const results: any = await query(
        'SELECT * FROM subscriptions WHERE id = ? AND userId = ?',
        [id, userId]
      )
      return results[0] || null
    },

    async create(data: {
      name: string
      description?: string
      cost: number
      currency: string
      billingCycle: string
      renewalDate: string
      category?: string
      status: string
      website?: string
      userId: string
    }) {
      const id = generateId()
      await query(
        'INSERT INTO subscriptions (id, name, description, cost, currency, billingCycle, renewalDate, category, status, website, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          data.name,
          data.description || null,
          data.cost,
          data.currency,
          data.billingCycle,
          data.renewalDate,
          data.category || null,
          data.status,
          data.website || null,
          data.userId,
        ]
      )
      return this.findById(id, data.userId)
    },

    async update(
      id: string,
      userId: string,
      data: {
        name?: string
        description?: string
        cost?: number
        currency?: string
        billingCycle?: string
        renewalDate?: string
        category?: string
        status?: string
        website?: string
      }
    ) {
      const updates: string[] = []
      const values: any[] = []

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`)
          values.push(value)
        }
      })

      if (updates.length === 0) return this.findById(id, userId)

      values.push(id, userId)
      await query(
        `UPDATE subscriptions SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
        values
      )
      return this.findById(id, userId)
    },

    async delete(id: string, userId: string) {
      const result: any = await query(
        'DELETE FROM subscriptions WHERE id = ? AND userId = ?',
        [id, userId]
      )
      return result.affectedRows > 0
    },
  },
}