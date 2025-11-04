'use client'

import { useState } from 'react'
import { IdeaCard } from './idea-card'
import type { Idea } from '@/lib/db'

export function IdeasList({ ideas }: { ideas: Idea[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and search logic
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort logic
  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0)

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
                placeholder="Search ideas..."
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
            <div className="grid grid-cols-2 gap-3 mt-3">
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
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
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
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setSortBy('newest')
                }}
                className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results Count - Always visible */}
        <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{sortedIdeas.length}</span> of <span className="font-semibold text-gray-700 dark:text-gray-300">{ideas.length}</span> ideas
          </p>
        </div>
      </div>

      {/* Ideas Grid */}
      {sortedIdeas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {searchTerm || statusFilter !== 'all' 
              ? 'No ideas match your filters' 
              : 'No ideas yet. Start tracking your brilliant ideas!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedIdeas.map((idea, index) => (
            <div 
              key={idea.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="animate-slide-in"
            >
              <IdeaCard idea={idea} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}