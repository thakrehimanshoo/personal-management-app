'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
export default function EditSubscriptionPage() {
    const router = useRouter()
    const params = useParams()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: '',
        currency: 'INR',
        billingCycle: 'monthly',
        renewalDate: '',
        category: '',
        status: 'active',
        website: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        // Fetch the subscription
        const fetchSubscription = async () => {
            try {
                const response = await fetch(`/api/subscriptions/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    const sub = data.subscription

                    // Format date for input[type="date"]
                    const date = new Date(sub.renewalDate)
                    const formattedDate = date.toISOString().split('T')[0]

                    setFormData({
                        name: sub.name,
                        description: sub.description || '',
                        cost: sub.cost.toString(),
                        currency: sub.currency,
                        billingCycle: sub.billingCycle,
                        renewalDate: formattedDate,
                        category: sub.category || '',
                        status: sub.status,
                        website: sub.website || '',
                    })
                } else {
                    setError('Failed to load subscription')
                }
            } catch (err) {
                setError('Something went wrong')
            } finally {
                setLoading(false)
            }
        }

        fetchSubscription()
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.name || !formData.cost || !formData.renewalDate) {
            setError('Name, cost, and renewal date are required')
            return
        }

        setSaving(true)

        try {
            const response = await fetch(`/api/subscriptions/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description || undefined,
                    cost: parseFloat(formData.cost),
                    currency: formData.currency,
                    billingCycle: formData.billingCycle,
                    renewalDate: formData.renewalDate,
                    category: formData.category || undefined,
                    status: formData.status,
                    website: formData.website || undefined,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.error || 'Failed to update subscription')
                toast.error('Failed to update subscription')
                return
            }

            toast.success('Subscription updated successfully!')
            router.push('/subscriptions')
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }



// Replace the loading return:
if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subscription...</p>
    </div>
  )
}

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/subscriptions"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    ← Back to Subscriptions
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Edit Subscription
            </h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Netflix, Spotify, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Additional details..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cost *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="9.99"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Currency
                            </label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="INR">INR</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Billing Cycle
                            </label>
                            <select
                                value={formData.billingCycle}
                                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Renewal Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.renewalDate}
                                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., Entertainment, Productivity, Utilities"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="paused">Paused</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Website (optional)
                        </label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link
                            href="/subscriptions"
                            className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}