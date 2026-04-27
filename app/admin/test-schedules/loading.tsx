import { CalendarDays } from "lucide-react"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">
      <section className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
        <div className="h-6 w-44 animate-pulse rounded-full bg-primary/10" />
        <div className="mt-5 h-9 w-72 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-[420px]">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-primary/10" />
                <div className="h-6 w-44 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5 animate-pulse" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>

            <div className="mt-4 h-28 animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="mb-6 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-primary/10" />
              <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-6 space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-primary/10" />
            <div className="h-6 w-52 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="grid gap-3">
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 w-48 animate-pulse rounded-2xl bg-primary/20" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="mb-6 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-primary/10" />
          <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="hidden overflow-hidden rounded-3xl border border-slate-200 lg:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse border-b border-slate-100 bg-slate-50"
            />
          ))}
        </div>

        <div className="grid gap-3 lg:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </section>
    </div>
  )
}