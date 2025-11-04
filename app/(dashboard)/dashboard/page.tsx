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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's an overview of your ideas and subscriptions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Ideas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ideas</h3>
            <span className="text-2xl">💡</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{ideas.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeIdeas} active · {completedIdeas} completed
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</h3>
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{activeSubscriptions.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subscriptions.length} total
          </p>
        </div>

        {/* Monthly Cost */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-100">Monthly Cost</h3>
            <span className="text-2xl">₹</span>
          </div>
          <p className="text-3xl font-bold mb-1">₹{totalMonthlyCost.toFixed(2)}</p>
          <p className="text-sm text-blue-100">
            Across {activeSubscriptions.length} subscription{activeSubscriptions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ideas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Ideas</h2>
            <Link href="/ideas" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
              View all →
            </Link>
          </div>
          {ideas.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No ideas yet. Create your first one!</p>
          ) : (
            <div className="space-y-3">
              {ideas.slice(0, 5).map((idea: Idea) => (
                <div key={idea.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{idea.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      idea.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      idea.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {idea.status}
                    </span>
                    {idea.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">📁 {idea.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Renewals</h2>
            <Link href="/subscriptions" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
              View all →
            </Link>
          </div>
          {upcomingRenewals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No renewals in the next 30 days</p>
          ) : (
            <div className="space-y-3">
              {upcomingRenewals.slice(0, 5).map((sub: Subscription) => {
                const renewalDate = new Date(sub.renewalDate)
                const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={sub.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">{sub.name}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-600 dark:text-orange-400">
                        ⚠️ Renews in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {sub.currency === 'INR' ? '₹' : sub.currency === 'EUR' ? '€' : sub.currency === 'GBP' ? '£' : '$'}
                        {sub.cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
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