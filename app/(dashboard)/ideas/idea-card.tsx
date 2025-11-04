'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Idea } from '@/lib/db'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function IdeaCard({ idea }: { idea: Idea }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Idea deleted successfully!')
        setShowConfirm(false)
        router.refresh()
      } else {
        toast.error('Failed to delete idea')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setDeleting(false)
    }
  }

  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 pr-2">
            {idea.title}
          </h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColors[idea.status as keyof typeof statusColors]}`}>
            {idea.status}
          </span>
        </div>

        {/* Description */}
        <div className="flex-1 mb-4">
          {idea.description ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {idea.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No description
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {idea.category && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">📁</span>
              <span className="text-gray-600 dark:text-gray-400 truncate">{idea.category}</span>
            </div>
          )}
          
          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {idea.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-800"
                >
                  #{tag}
                </span>
              ))}
              {idea.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                  +{idea.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={`/ideas/${idea.id}/edit`}
            className="flex-1 text-center px-4 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 px-4 py-2 text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Idea"
        message="Are you sure you want to delete this idea? This action cannot be undone."
        isLoading={deleting}
      />
    </>
  )
}