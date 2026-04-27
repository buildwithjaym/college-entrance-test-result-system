// app/admin/dashboard/loading.tsx

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl bg-gray-100"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="h-96 animate-pulse rounded-3xl bg-gray-100 xl:col-span-8" />
        <div className="h-96 animate-pulse rounded-3xl bg-gray-100 xl:col-span-4" />
      </div>
    </div>
  )
}