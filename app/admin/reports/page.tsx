import { FileBarChart2, Sparkles } from "lucide-react"
import { getReportsData } from "./actions"
import { ReportsClient } from "./reports-client"

export default async function ReportsPage() {
  const { schoolYears, rows } = await getReportsData()

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-white via-white to-red-50 p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
            <Sparkles className="h-3.5 w-3.5" />
            Reports
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Ranking Reports
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            View ranked student results per school year, sort records, filter
            status, and download a clean PDF report for official use.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <FileBarChart2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              School Year Ranking Report
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Manage ranking reports by school year, status, score, name, and
              exam date.
            </p>
          </div>
        </div>

        <ReportsClient schoolYears={schoolYears} rows={rows} />
      </section>
    </div>
  )
}