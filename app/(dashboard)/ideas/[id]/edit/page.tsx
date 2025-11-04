'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function EditIdeaPage() {
    const router = useRouter()
    const params = useParams()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'draft',
        category: '',
        tags: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        // Fetch the idea
        const fetchIdea = async () => {
            try {
                const response = await fetch(`/api/ideas/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setFormData({
                        title: data.idea.title,
                        description: data.idea.description || '',
                        status: data.idea.status,
                        category: data.idea.category || '',
                        tags: data.idea.tags.join(', '),
                    })
                } else {
                    setError('Failed to load idea')
                }
            } catch (err) {
                setError('Something went wrong')
            } finally {
                setLoading(false)
            }
        }

        fetchIdea()
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.title) {
            setError('Title is required')
            return
        }

        setSaving(true)

        try {
            const response = await fetch(`/api/ideas/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || undefined,
                    status: formData.status,
                    category: formData.category || undefined,
                    tags: formData.tags
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0),
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.error || 'Failed to update idea')
                toast.error('Failed to update idea')
                return
            }

            toast.success('Idea updated successfully!')
            router.push('/ideas')
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading idea...</p>
    </div>
  )
}

    return (
        <div>
            <div className="mb-6">
                <Link
                    href="/ideas"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    ← Back to Ideas
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Edit Idea
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
                            Title *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="My brilliant idea..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Describe your idea in detail..."
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
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="archived">Archived</option>
                        </select>
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
                            placeholder="e.g., Work, Personal, Business"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="e.g., urgent, creative, revenue"
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
                            href="/ideas"
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