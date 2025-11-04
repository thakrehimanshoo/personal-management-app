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
      {/* Mobile - Horizontal scroll, Desktop - Vertical */}
      <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 scrollbar-hide">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          
          return (
            <li key={link.href} className="flex-shrink-0 lg:flex-shrink">
              <Link
                href={link.href}
                className={`flex items-center justify-center lg:justify-start gap-2 sm:gap-3 px-4 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}