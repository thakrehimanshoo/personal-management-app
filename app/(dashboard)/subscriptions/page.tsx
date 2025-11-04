import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import type { Subscription } from '@/lib/db'
import Link from 'next/link'
import { SubscriptionsList } from './subscriptions-list'

export default async function SubscriptionsPage() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const subscriptions = await db.subscription.findMany(session.userId)

  // Get currency rates
  const uniqueCurrencies = Array.from(
    new Set(subscriptions.map((s: Subscription) => s.currency || 'INR'))
  ) as string[]
  
  const rates = await getRatesMap(uniqueCurrencies)

  // Calculate total monthly cost
  const activeSubs = subscriptions.filter((s: Subscription) => s.status === 'active')
  const totalMonthlyCost = activeSubs.reduce((total: number, sub: Subscription) => {
    const rate = rates[sub.currency] || 1
    let monthlyCost = sub.cost * rate

    if (sub.billingCycle === 'yearly') {
      monthlyCost = monthlyCost / 12
    } else if (sub.billingCycle === 'quarterly') {
      monthlyCost = monthlyCost / 3
    }

    return total + monthlyCost
  }, 0)

  // Calculate yearly cost
  const totalYearlyCost = totalMonthlyCost * 12

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Subscriptions Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage all your recurring subscriptions
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
        >
          + New Subscription
        </Link>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-600 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-sm font-medium text-blue-100 mb-2">Monthly Cost</h3>
          <p className="text-4xl font-bold mb-1">₹{totalMonthlyCost.toFixed(2)}</p>
          <p className="text-sm text-blue-100">
            Across {activeSubs.length} active subscription{activeSubs.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-purple-600 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-sm font-medium text-purple-100 mb-2">Yearly Cost</h3>
          <p className="text-4xl font-bold mb-1">₹{totalYearlyCost.toFixed(2)}</p>
          <p className="text-sm text-purple-100">
            Estimated annual spending
          </p>
        </div>
      </div>

      {/* Subscriptions List */}
      <SubscriptionsList subscriptions={subscriptions} />
    </div>
  )
}

async function getRatesMap(currencies: string[]): Promise<Record<string, number>> {
  if (currencies.length === 0 || (currencies.length === 1 && currencies[0] === 'INR')) {
    return { INR: 1 }
  }

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/INR`,
      { next: { revalidate: 3600 } }
    )
    const data = await response.json()
    
    const rates: Record<string, number> = { INR: 1 }
    currencies.forEach((currency: string) => {
      if (currency !== 'INR') {
        rates[currency] = data.rates[currency] ? 1 / data.rates[currency] : 1
      }
    })
    
    return rates
  } catch (error) {
    console.error('Failed to fetch rates:', error)
    return { INR: 1, USD: 83, EUR: 90, GBP: 105 }
  }
}