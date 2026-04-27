export default function ResultsLoading() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-red-50" />
        <div className="relative space-y-4">
          <div className="h-6 w-40 animate-pulse rounded-full bg-red-100" />
          <div className="h-10 w-64 animate-pulse rounded-2xl bg-red-200" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-red-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-red-100" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-red-100 bg-gradient-to-br from-white to-red-50 shadow-sm"
          />
        ))}
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="mb-5 h-12 animate-pulse rounded-2xl bg-red-50" />

        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-gradient-to-r from-red-50 via-white to-red-50"
            />
          ))}
        </div>
      </section>
    </div>
  )
}