import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/toast-provider'

export const metadata: Metadata = {
  title: 'Personal Management App',
  description: 'Manage your ideas, subscriptions, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}