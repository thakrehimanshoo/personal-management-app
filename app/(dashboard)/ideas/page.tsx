import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { IdeasList } from './ideas-list'

export default async function IdeasPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const ideas = await db.idea.findMany(session.userId)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Ideas Tracker
        </h1>
        <Link
          href="/ideas/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Idea
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No ideas yet. Start tracking your brilliant ideas!
          </p>
          <Link
            href="/ideas/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your First Idea
          </Link>
        </div>
      ) : (
        <IdeasList ideas={ideas} />
      )}
    </div>
  )
}