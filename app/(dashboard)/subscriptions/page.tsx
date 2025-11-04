import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { SubscriptionsList } from './subscriptions-list'
import { getRatesMap, toINR } from '@/lib/currency'

export default async function SubscriptionsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const subscriptions = await db.subscription.findMany(session.userId)

  // Get currency rates
  const uniqueCurrencies = Array.from(
    new Set(subscriptions.map((s) => s.currency || 'INR'))
  )
  const rates = await getRatesMap(uniqueCurrencies)

  // Calculate total costs (normalized to INR)
  const monthlyCost = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((total, sub) => {
      const baseINR = toINR(sub.cost, sub.currency, rates)
      if (sub.billingCycle === 'monthly') return total + baseINR
      if (sub.billingCycle === 'yearly') return total + baseINR / 12
      if (sub.billingCycle === 'quarterly') return total + baseINR / 3
      return total
    }, 0)

  const yearlyCost = monthlyCost * 12

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Subscriptions Manager
        </h1>
        <Link
          href="/subscriptions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Subscription
        </Link>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">Monthly Cost</h3>
          <p className="text-4xl font-bold">₹{monthlyCost.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium mb-2 opacity-90">Yearly Cost</h3>
          <p className="text-4xl font-bold">₹{yearlyCost.toFixed(2)}</p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No subscriptions yet. Start tracking your subscriptions!
          </p>
          <Link
            href="/subscriptions/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Your First Subscription
          </Link>
        </div>
      ) : (
        <SubscriptionsList subscriptions={subscriptions} />
      )}
    </div>
  )
}