import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { getRatesMap, toINR } from '@/lib/currency'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const ideas = await db.idea.findMany(session.userId)
  const subscriptions = await db.subscription.findMany(session.userId)

  // Get currency rates
  const uniqueCurrencies = Array.from(
    new Set(subscriptions.map((s) => s.currency || 'INR'))
  )
  const rates = await getRatesMap(uniqueCurrencies)

  // Calculate stats with currency conversion
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const monthlyCost = activeSubscriptions.reduce((total, sub) => {
    const baseINR = toINR(sub.cost, sub.currency, rates)
    if (sub.billingCycle === 'monthly') return total + baseINR
    if (sub.billingCycle === 'yearly') return total + baseINR / 12
    if (sub.billingCycle === 'quarterly') return total + baseINR / 3
    return total
  }, 0)

  // Get recent ideas (last 5)
  const recentIdeas = ideas.slice(-5).reverse()

  // Get upcoming renewals (within next 30 days)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const upcomingRenewals = activeSubscriptions
    .filter(sub => {
      const renewalDate = new Date(sub.renewalDate)
      return renewalDate >= today && renewalDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
    .slice(0, 5)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/ideas" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
            Total Ideas
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{ideas.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {ideas.filter(i => i.status === 'active').length} active
          </p>
        </Link>

        <Link href="/subscriptions" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
            Active Subscriptions
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeSubscriptions.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {subscriptions.length} total
          </p>
        </Link>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
          <h3 className="text-sm font-medium mb-2 opacity-90">
            Monthly Cost
          </h3>
          <p className="text-3xl font-bold">₹{monthlyCost.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-2">
            ₹{(monthlyCost * 12).toFixed(2)} per year
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Ideas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Ideas
            </h2>
            <Link href="/ideas" className="text-blue-600 hover:text-blue-700 text-sm">
              View all →
            </Link>
          </div>
          {recentIdeas.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No ideas yet. Start adding some!</p>
          ) : (
            <div className="space-y-3">
              {recentIdeas.map((idea) => (
                <Link
                  key={idea.id}
                  href="/ideas"
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 dark:text-white">{idea.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${idea.status === 'active' ? 'bg-green-100 text-green-800' :
                        idea.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          idea.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                      }`}>
                      {idea.status}
                    </span>
                  </div>
                  {idea.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                      {idea.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upcoming Renewals
            </h2>
            <Link href="/subscriptions" className="text-blue-600 hover:text-blue-700 text-sm">
              View all →
            </Link>
          </div>
          {upcomingRenewals.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No upcoming renewals in the next 30 days.</p>
          ) : (
            <div className="space-y-3">
              {upcomingRenewals.map((sub) => {
                const renewalDate = new Date(sub.renewalDate)
                const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const costInINR = toINR(sub.cost, sub.currency, rates)
                return (
                  <Link
                    key={sub.id}
                    href="/subscriptions"
                    className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{sub.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{costInINR.toFixed(2)} • {renewalDate.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${daysUntil <= 7 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {daysUntil}d
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}