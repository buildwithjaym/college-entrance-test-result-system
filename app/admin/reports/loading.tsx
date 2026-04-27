import { FileBarChart2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">
      <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <div className="h-6 w-24 animate-pulse rounded-full bg-red-100" />
        <div className="mt-5 h-8 w-64 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <FileBarChart2 className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-72 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <div className="h-11 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-11 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-11 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-11 animate-pulse rounded-2xl bg-red-100" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>

        <div className="mt-5 h-28 animate-pulse rounded-2xl bg-amber-50" />

        <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-200 lg:block">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse border-b border-slate-100 bg-slate-50"
            />
          ))}
        </div>

        <div className="mt-5 grid gap-3 lg:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </section>
    </div>
  )
}