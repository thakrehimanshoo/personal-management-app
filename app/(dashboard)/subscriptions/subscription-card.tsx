'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { Subscription } from '@/lib/db'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Subscription deleted successfully!')
        setShowConfirm(false)
        router.refresh()
      } else {
        toast.error('Failed to delete subscription')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setDeleting(false)
    }
  }

  const renewalDate = new Date(subscription.renewalDate)
  const daysUntilRenewal = Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isUpcoming = daysUntilRenewal <= 7 && daysUntilRenewal >= 0

  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    paused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      INR: '₹',
      USD: '$'
    }
    return symbols[currency] || '$'
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 pr-2">
            {subscription.name}
          </h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColors[subscription.status as keyof typeof statusColors]}`}>
            {subscription.status}
          </span>
        </div>

        {/* Description */}
        <div className="flex-1 mb-4">
          {subscription.description ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {subscription.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              No description
            </p>
          )}
        </div>

        {/* Cost Info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Cost</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {getCurrencySymbol(subscription.currency)}{(
  (typeof subscription.cost === 'number' && Number.isFinite(subscription.cost))
    ? subscription.cost
    : Number(String(subscription.cost).replace(/[^\d.\-]/g, '')) || 0
).toFixed(2)}

            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Billing</span>
            <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
              {subscription.billingCycle}
            </span>
          </div>
        </div>

        {/* Renewal Alert */}
        {isUpcoming && subscription.status === 'active' && (
          <div className="mb-3 p-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 dark:text-orange-400 text-sm">⚠️</span>
              <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                Renews in {daysUntilRenewal} day{daysUntilRenewal !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {subscription.category && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">📁</span>
              <span className="text-gray-600 dark:text-gray-400 truncate">{subscription.category}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>📅</span>
            <span>Next: {renewalDate.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link 
            href={`/subscriptions/${subscription.id}/edit`} 
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
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        isLoading={deleting}
      />
    </>
  )
}