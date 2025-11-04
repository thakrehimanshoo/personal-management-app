import Link from 'next/link'

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-3xl">PM</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Personal Management App
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Track your ideas, manage subscriptions, and organize your life in one simple platform
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-2">💡</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ideas Tracker</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💳</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subscriptions</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-600 dark:hover:border-blue-600 transition-colors font-medium"
          >
            Register
          </Link>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500 dark:text-gray-500">
          Made with <span className="text-red-500">❤️</span> by <span className="font-semibold text-gray-700 dark:text-gray-300">Himanshoo</span>
        </div>
      </div>
    </div>
  )
}