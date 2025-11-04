'use client'

import { useState, useEffect, useMemo } from 'react'
import { SubscriptionCard } from './subscription-card'
import type { Subscription } from '@/lib/db'

export function SubscriptionsList({ subscriptions }: { subscriptions: Subscription[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // === NEW: currency rates (match Dashboard logic) ===========================
  const uniqueCurrencies = useMemo(
    () => Array.from(new Set(subscriptions.map(s => s.currency).filter(Boolean))) as string[],
    [subscriptions]
  )

  const [rates, setRates] = useState<Record<string, number>>({ INR: 1 })

  useEffect(() => {
    async function getRatesMap(currencies: string[]): Promise<Record<string, number>> {
      if (currencies.length === 0 || (currencies.length === 1 && currencies[0] === 'INR')) {
        return { INR: 1 }
      }
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/INR', { cache: 'force-cache' })
        const data = await res.json()
        const map: Record<string, number> = { INR: 1 }
        currencies.forEach(cur => {
          if (cur !== 'INR') map[cur] = data?.rates?.[cur] ? 1 / data.rates[cur] : 1
        })
        return map
      } catch {
        // same fallback as Dashboard
        return { INR: 1, USD: 83, EUR: 90, GBP: 105 }
      }
    }

    getRatesMap(uniqueCurrencies).then(setRates)
  }, [uniqueCurrencies])
  // ==========================================================================

  // Get unique categories
  const categories = Array.from(new Set(subscriptions.map(s => s.category).filter(Boolean)))

  // Filter and search logic
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Sort logic
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'name':
        return a.name.localeCompare(b.name)
      case 'cost-high':
        return (typeof b.cost === 'number' ? b.cost : Number(b.cost)) - (typeof a.cost === 'number' ? a.cost : Number(a.cost))
      case 'cost-low':
        return (typeof a.cost === 'number' ? a.cost : Number(a.cost)) - (typeof b.cost === 'number' ? b.cost : Number(b.cost))
      case 'renewal':
        return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
      default:
        return 0
    }
  })

  // Calculate filtered stats
  const activeCount = filteredSubscriptions.filter(s => s.status === 'active').length

  const totalCost = filteredSubscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, sub) => {
      // ensure numeric cost
      const baseCost =
        typeof sub.cost === 'number'
          ? sub.cost
          : Number(String(sub.cost).replace(/[^\d.\-]/g, '')) || 0

      // convert to INR using same mapping as Dashboard
      const rate = rates[sub.currency] ?? 1
      let monthly = baseCost * rate

      if (sub.billingCycle === 'yearly') monthly = monthly / 12
      else if (sub.billingCycle === 'quarterly') monthly = monthly / 3

      return sum + monthly
    }, 0)

  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Compact Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Bar - Always visible */}
        <div className="p-3 sm:p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <span className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 dark:border-gray-700 animate-slide-in">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="all">All</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name</option>
                  <option value="cost-high">Cost (High)</option>
                  <option value="cost-low">Cost (Low)</option>
                  <option value="renewal">Renewal</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setCategoryFilter('all')
                  setSortBy('newest')
                }}
                className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results Summary - Always visible */}
        <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{sortedSubscriptions.length}</span> of <span className="font-semibold text-gray-700 dark:text-gray-300">{subscriptions.length}</span>
            {activeCount > 0 && <span> • <span className="font-semibold text-gray-700 dark:text-gray-300">{activeCount}</span> active</span>}
          </p>
          {activeCount > 0 && (
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              ₹{totalCost.toFixed(2)}/mo
            </p>
          )}
        </div>
      </div>

      {/* Subscriptions Grid */}
      {sortedSubscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No subscriptions match your filters' 
              : 'No subscriptions yet. Start tracking your subscriptions!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedSubscriptions.map((subscription, index) => (
            <div 
              key={subscription.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="animate-slide-in"
            >
              <SubscriptionCard subscription={subscription} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
