export default function DeviceSkeleton() {
  return (
    <div className="min-h-screen px-4 py-10 space-y-10 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card detail device */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gray-800">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Card statistik */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gray-800">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card area */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gray-800">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-60 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
