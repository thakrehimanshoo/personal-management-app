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
    <div className="space-y-4">
      {/* Header with Action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Ideas</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track and organize your ideas
          </p>
        </div>
        <Link
          href="/ideas/new"
          className="w-12 h-12 lg:w-auto lg:h-auto lg:px-4 lg:py-2 bg-blue-600 text-white rounded-full lg:rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl lg:text-base">+</span>
          <span className="hidden lg:inline ml-2">New Idea</span>
        </Link>
      </div>

      <IdeasList ideas={ideas} />
    </div>
  )
}