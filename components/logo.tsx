export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`${sizes[size]} bg-blue-600 rounded-2xl flex items-center justify-center relative overflow-hidden group`}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icon */}
        <div className="relative z-10 font-bold text-white">
          <svg viewBox="0 0 24 24" fill="none" className="w-2/3 h-2/3 mx-auto" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12h6m-6 4h6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {size !== 'sm' && (
        <div className="text-left">
          <div className="font-bold text-gray-900 dark:text-white leading-tight" style={{ fontSize: size === 'lg' ? '1.5rem' : '1.25rem' }}>
            Personal
          </div>
          <div className="font-bold text-blue-600 leading-tight" style={{ fontSize: size === 'lg' ? '1.5rem' : '1.25rem' }}>
            Manager
          </div>
        </div>
      )}
    </div>
  )
}