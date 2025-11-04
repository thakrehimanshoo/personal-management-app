import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import type { Idea, Subscription } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    return null
  }

  // Get user's data
  const ideas = await db.idea.findMany(session.userId)
  const subscriptions = await db.subscription.findMany(session.userId)

  // Calculate stats
  const activeIdeas = ideas.filter((idea: Idea) => idea.status === 'active').length
  const completedIdeas = ideas.filter((idea: Idea) => idea.status === 'completed').length
  const activeSubscriptions = subscriptions.filter((sub: Subscription) => sub.status === 'active')

  // Get currency rates
  const uniqueCurrencies = Array.from(
    new Set(subscriptions.map((s: Subscription) => s.currency).filter(Boolean))
  ) as string[]

  const rates = await getRatesMap(uniqueCurrencies)

  // Calculate total monthly cost in INR
  const totalMonthlyCost = activeSubscriptions.reduce((total: number, sub: Subscription) => {
    const rate = rates[sub.currency] || 1
    let monthlyCost = sub.cost * rate

    if (sub.billingCycle === 'yearly') {
      monthlyCost = monthlyCost / 12
    } else if (sub.billingCycle === 'quarterly') {
      monthlyCost = monthlyCost / 3
    }

    return total + monthlyCost
  }, 0)

  // Get upcoming renewals (next 30 days)
  const today = new Date()
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const upcomingRenewals = activeSubscriptions.filter((sub: Subscription) => {
    const renewalDate = new Date(sub.renewalDate)
    return renewalDate >= today && renewalDate <= thirtyDaysLater
  })

  return (
    <div className="space-y-4">
      {/* Header - Mobile Optimized */}
      <div className="mb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here's your overview
        </p>
      </div>

      {/* Stats Cards - Mobile Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Ideas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">💡</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{ideas.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ideas</p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">💳</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{activeSubscriptions.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
        </div>

        {/* Monthly Cost */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-sm p-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">₹</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">₹{Math.round(totalMonthlyCost)}</p>
            <p className="text-xs text-blue-100">Per Month</p>
          </div>
        </div>
      </div>

      {/* Recent Ideas Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Ideas</h2>
          <Link href="/ideas" className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            View all →
          </Link>
        </div>
        {ideas.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">💡</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No ideas yet</p>
            <Link href="/ideas/new" className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2 inline-block">
              Create your first idea
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {ideas.slice(0, 3).map((idea: Idea) => (
              <div key={idea.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 flex-1">
                    {idea.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    idea.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    idea.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {idea.status}
                  </span>
                </div>
                {idea.category && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">📁 {idea.category}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Renewals Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Renewals</h2>
          <Link href="/subscriptions" className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            View all →
          </Link>
        </div>
        {upcomingRenewals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No renewals in next 30 days</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingRenewals.slice(0, 3).map((sub: Subscription) => {
              const renewalDate = new Date(sub.renewalDate)
              const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={sub.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{sub.name}</h3>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        ⏰ Renews in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {sub.currency === 'INR' ? '₹' : '$'}{sub.cost}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {sub.billingCycle}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

}

// Helper function to get exchange rates
async function getRatesMap(currencies: string[]): Promise<Record<string, number>> {
  if (currencies.length === 0 || (currencies.length === 1 && currencies[0] === 'INR')) {
    return { INR: 1 }
  }

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/INR`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
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