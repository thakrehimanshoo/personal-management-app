import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      <LoadingSkeleton />
    </div>
  )
}