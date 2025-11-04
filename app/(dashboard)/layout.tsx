import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { NavLinks } from './nav-links'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      {/* Desktop Layout - Original Working Version */}
      <div className="hidden lg:flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Fixed Header */}
        <header className="bg-white dark:bg-gray-800 shadow flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              Personal Management
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                {session.email}
              </span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full">
              {/* Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <NavLinks />
              </aside>

              {/* Main Content - Scrollable */}
              <main className="flex-1 overflow-y-auto">
                <div className="lg:pr-4">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Made with <span className="text-red-500">❤️</span> by{' '}
              <span className="font-semibold text-gray-900 dark:text-white">Himanshoo</span>
            </p>
          </div>
        </footer>
      </div>

      {/* Mobile Layout - New Scrollable Version */}
      <div className="lg:hidden bg-gray-50 dark:bg-gray-900">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              Personal Management
            </h1>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Sticky Navigation */}
        <div className="sticky top-[52px] z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2">
            <NavLinks />
          </div>
        </div>

        {/* Main Content - Free Scrolling */}
        <main className="px-4 py-4 pb-20">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Made with <span className="text-red-500">❤️</span> by{' '}
              <span className="font-semibold text-gray-900 dark:text-white">Himanshoo</span>
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}