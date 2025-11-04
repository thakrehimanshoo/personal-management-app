import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'

// GET all subscriptions
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subscriptions = await db.subscription.findMany(session.userId)

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// POST create new subscription
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
    const { name, description, cost, currency, billingCycle, renewalDate, category, status, website } = body

    if (!name || !cost || !renewalDate) {
      return NextResponse.json(
        { error: 'Name, cost, and renewal date are required' },
        { status: 400 }
      )
    }

    const subscription = await db.subscription.create({
      name,
      description,
      cost,
      currency: currency || 'USD',
      billingCycle,
      renewalDate,
      category,
      status: status || 'active',
      website,
      userId: session.userId,
    })

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}