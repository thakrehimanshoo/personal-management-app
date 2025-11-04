import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-9 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Cost Summary Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      </div>

      <LoadingSkeleton />
    </div>
  )
}