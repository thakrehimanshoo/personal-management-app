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

{/* Mobile Layout - iOS Style */}
      <div className="lg:hidden min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                Personal Manager
              </span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-4">
          {children}
        </main>

        {/* Bottom Navigation - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95">
          <div className="safe-area-inset-bottom">
            <NavLinks />
          </div>
        </div>
      </div>
    </>
  )
}