'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/ideas', icon: '💡', label: 'Ideas' },
    { href: '/subscriptions', icon: '💳', label: 'Subscriptions' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 sm:p-4">
      {/* Mobile - Horizontal scroll */}
      <ul className="flex lg:flex-col gap-1 sm:gap-2 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          
          return (
            <li key={link.href} className="flex-shrink-0 lg:flex-shrink">
              <Link
                href={link.href}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-base sm:text-xl">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}