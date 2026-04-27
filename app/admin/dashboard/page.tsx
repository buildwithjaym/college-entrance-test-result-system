import Link from "next/link"
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  TrendingUp,
} from "lucide-react"

import { getDashboardData } from "@/lib/dashboard"

function formatDate(date?: string | null) {
  if (!date) return "—"

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 sm:h-11 sm:w-11 ${toneMap[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const { stats, recentResults, releaseRate } = await getDashboardData()

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 px-0 sm:space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-4 text-white shadow-sm sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-red-100 sm:text-sm">
              Admin Dashboard
            </p>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
              CET Results Overview
            </h1>

            <p className="mt-3 text-sm leading-6 text-red-50">
              Monitor generated results, release progress, pending records, and
              recent CET result activity.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[460px]">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Total Results</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {stats.totalResults}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Released</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {stats.publishedResults}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Release Rate</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {releaseRate}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Total Results"
          value={stats.totalResults}
          subtitle="All generated CET result records"
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          title="Released Results"
          value={stats.publishedResults}
          subtitle="Visible to applicants"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Pending Results"
          value={stats.pendingResults}
          subtitle="Waiting for release"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Across all result records"
          icon={TrendingUp}
          tone="red"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Recent Result Activity
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Latest generated CET result records.
              </p>
            </div>

            <Link
              href="/admin/results"
              className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 sm:w-auto"
            >
              View records
            </Link>
          </div>

          {recentResults.length > 0 ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Applicant
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Schedule
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Score
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentResults.map((result) => (
                      <tr
                        key={result.id}
                        className="border-b border-slate-100 transition hover:bg-red-50/40"
                      >
                        <td className="py-4">
                          <p className="font-semibold text-slate-950">
                            {result.applicant_name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {result.reference_number ?? "No reference"}
                          </p>
                        </td>

                        <td className="py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {result.schedule_name ?? "—"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(result.exam_date)}
                          </p>
                        </td>

                        <td className="py-4">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                            {Number(result.overall_percentage ?? 0)}%
                          </span>
                        </td>

                        <td className="py-4">
                          {result.is_published ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              Released
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 lg:hidden">
                {recentResults.map((result) => (
                  <div
                    key={result.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950">
                          {result.applicant_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {result.reference_number ?? "No reference"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                        {Number(result.overall_percentage ?? 0)}%
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Schedule:</span>{" "}
                        {result.schedule_name ?? "—"}
                      </p>
                      <p>
                        <span className="font-semibold">Exam Date:</span>{" "}
                        {formatDate(result.exam_date)}
                      </p>
                    </div>

                    <div className="mt-4">
                      {result.is_published ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Released
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center sm:rounded-3xl">
              <p className="font-semibold text-slate-700">No results yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Generated CET results will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-100">
                <BarChart3 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-950">
                  Release Progress
                </p>
                <p className="text-sm text-slate-500">
                  {releaseRate}% of results are visible.
                </p>
              </div>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-red-700"
                style={{ width: `${releaseRate}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-xs font-semibold text-green-700">Released</p>
                <p className="mt-1 text-xl font-bold text-green-800">
                  {stats.publishedResults}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">Pending</p>
                <p className="mt-1 text-xl font-bold text-amber-800">
                  {stats.pendingResults}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <FileText className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-950">
                  Result Records
                </p>
                <p className="text-sm text-slate-500">
                  Manage searching, sorting, releasing, and deletion.
                </p>
              </div>
            </div>

            <Link
              href="/admin/results"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open result records
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}