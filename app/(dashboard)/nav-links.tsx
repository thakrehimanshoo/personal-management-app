'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', icon: '📊', label: 'Home' },
    { href: '/ideas', icon: '💡', label: 'Ideas' },
    { href: '/subscriptions', icon: '💳', label: 'Subs' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <nav>
      {/* Desktop - Sidebar */}
      <ul className="hidden lg:flex lg:flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Mobile - iOS Style Bottom Tab Bar */}
      <div className="lg:hidden">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center min-w-0 flex-1"
              >
                <div className={`flex flex-col items-center justify-center transition-all ${
                  isActive ? 'transform scale-110' : ''
                }`}>
                  <div className={`text-2xl mb-1 transition-all ${
                    isActive ? 'opacity-100' : 'opacity-60'
                  }`}>
                    {link.icon}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {link.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}