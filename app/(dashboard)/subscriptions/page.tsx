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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your recurring expenses
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="w-12 h-12 lg:w-auto lg:h-auto lg:px-4 lg:py-2 bg-blue-600 text-white rounded-full lg:rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl lg:text-base">+</span>
          <span className="hidden lg:inline ml-2">New</span>
        </Link>
      </div>

      {/* Cost Summary - Redesigned */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">₹</span>
            </div>
            <span className="text-xs text-blue-100 font-medium">Monthly</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">₹{Math.round(totalMonthlyCost)}</p>
          <p className="text-xs text-blue-100">{activeSubs.length} active subscription{activeSubs.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">₹</span>
            </div>
            <span className="text-xs text-purple-100 font-medium">Yearly</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">₹{Math.round(totalYearlyCost)}</p>
          <p className="text-xs text-purple-100">Estimated annual cost</p>
        </div>
      </div>

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