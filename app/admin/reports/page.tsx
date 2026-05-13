import {
  FileBarChart2,
  Sparkles,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react"

import { getReportsData } from "./actions"
import { ReportsClient } from "./reports-client"

type SearchParams = Promise<{
  q?: string
  schoolYearId?: string
  status?: string
  sort?: string
  page?: string
  pageSize?: string
}>

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  tone: "red" | "green" | "amber" | "blue"
}) {
  const toneMap = {
    red: "bg-red-50 text-red-700 ring-red-100",
    green: "bg-green-50 text-green-700 ring-green-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${toneMap[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = await searchParams

  const reportData = await getReportsData({
    query: params?.q ?? "",
    schoolYearId: params?.schoolYearId ?? null,
    status: params?.status ?? "published",
    sort: params?.sort ?? "score_high",
    page: params?.page ?? "1",
    pageSize: params?.pageSize ?? "20",
  })

  const qualifiers = reportData.rows.filter(
    (row) => row.overall_percentage >= 35,
  ).length

  const nonQualifiers = reportData.rows.filter(
    (row) => row.overall_percentage < 35,
  ).length

  const averageScore =
    reportData.rows.length > 0
      ? Math.round(
          reportData.rows.reduce(
            (sum, row) => sum + row.overall_percentage,
            0,
          ) / reportData.rows.length,
        )
      : 0

  const topScore =
    reportData.rows.length > 0
      ? Math.max(...reportData.rows.map((row) => row.overall_percentage))
      : 0

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-5 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              Reports & Rankings
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              CET Ranking Reports
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50">
              Generate scalable ranking reports, review qualifiers and
              non-qualifiers, analyze score performance, and prepare printable
              result summaries for official school use.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 xl:max-w-[620px]">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Loaded Records</p>

              <p className="mt-1 text-2xl font-bold">
                {reportData.rows.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Qualifiers</p>

              <p className="mt-1 text-2xl font-bold">{qualifiers}</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Average</p>

              <p className="mt-1 text-2xl font-bold">
                {averageScore}%
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Top Score</p>

              <p className="mt-1 text-2xl font-bold">
                {topScore}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ranking Records"
          value={reportData.total}
          subtitle="Total report entries matching filters"
          icon={FileBarChart2}
          tone="blue"
        />

        <StatCard
          title="Qualifiers"
          value={qualifiers}
          subtitle="Students scoring 35% and above"
          icon={Users}
          tone="green"
        />

        <StatCard
          title="Non-Qualifiers"
          value={nonQualifiers}
          subtitle="Students below qualification threshold"
          icon={Users}
          tone="amber"
        />

        <StatCard
          title="Performance Average"
          value={`${averageScore}%`}
          subtitle="Average score for current records"
          icon={TrendingUp}
          tone="red"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <Trophy className="h-5 w-5" />
          </div>

          <div>
            <p className="text-base font-bold text-slate-950">
              Ranking Report Workspace
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Search students, rank records by performance, filter school years,
              review qualification status, and export printable reports without
              loading all result entries into the browser.
            </p>
          </div>
        </div>

        <ReportsClient
          schoolYears={reportData.schoolYears}
          rows={reportData.rows}
          total={reportData.total}
          page={reportData.page}
          pageSize={reportData.pageSize}
          totalPages={reportData.totalPages}
          query={reportData.query}
          selectedSchoolYearId={reportData.schoolYearId}
          status={reportData.status}
          sort={reportData.sort}
        />
      </section>
    </div>
  )
}