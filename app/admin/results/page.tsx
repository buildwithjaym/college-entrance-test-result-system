import Link from "next/link"
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { ResultActions } from "@/components/admin/result-actions"
import { getResultsPage, getResultsStats } from "./actions"

type SearchParams = Promise<{
  q?: string
  page?: string
  sort?: string
  status?: string
}>

function buildPageHref({
  query,
  page,
  sort,
  status,
}: {
  query: string
  page: number
  sort: string
  status: string
}) {
  const params = new URLSearchParams()

  if (query) params.set("q", query)
  if (sort) params.set("sort", sort)
  if (status && status !== "all") params.set("status", status)

  params.set("page", String(page))

  return `/admin/results?${params.toString()}`
}

function formatName(applicant: {
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
}) {
  const name = [applicant.first_name, applicant.middle_name, applicant.last_name]
    .filter(Boolean)
    .join(" ")

  return name || "Unknown Applicant"
}

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl sm:p-5">
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

export default async function ResultsPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const params = await searchParams

  const query = params?.q ?? ""
  const page = params?.page ?? "1"
  const sort = params?.sort ?? "newest"
  const status = params?.status ?? "all"

  const [stats, resultsPage] = await Promise.all([
    getResultsStats(),
    getResultsPage({ query, page, sort, status }),
  ])

  const publishRate =
    stats.totalResults > 0
      ? Math.round((stats.publishedResults / stats.totalResults) * 100)
      : 0

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-4 text-white shadow-sm sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              Results Management
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">
              Student Results
            </h1>

            <p className="mt-3 text-sm leading-6 text-red-50">
              Search, filter, sort, release, and manage CET result records.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[460px]">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Total</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {stats.totalResults}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Published</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {stats.publishedResults}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Progress</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {publishRate}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Total Results"
          value={stats.totalResults}
          subtitle="All generated result records"
          icon={ClipboardList}
          tone="blue"
        />

        <StatCard
          title="Published"
          value={stats.publishedResults}
          subtitle="Visible to applicants"
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          title="Pending"
          value={stats.pendingResults}
          subtitle="Waiting for release"
          icon={BarChart3}
          tone="amber"
        />

        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Across all results"
          icon={TrendingUp}
          tone="red"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <form method="GET" className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <p className="text-sm font-bold text-slate-950">Result Records</p>
            <p className="mt-1 text-sm text-slate-500">
              Search by name, reference number, email, or schedule.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,360px)_180px_180px_auto]">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={resultsPage.query}
                placeholder="Search results..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <select
              name="status"
              defaultValue={resultsPage.status}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
            </select>

            <select
              name="sort"
              defaultValue={resultsPage.sort}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="score_high">Highest score</option>
              <option value="score_low">Lowest score</option>
              <option value="published_first">Published first</option>
              <option value="pending_first">Pending first</option>
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 active:scale-[0.99] sm:col-span-2 lg:col-span-1"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-950">Results Table</p>
            <p className="mt-1 text-sm text-slate-500">
              Showing {resultsPage.rows.length} of {resultsPage.total} record
              {resultsPage.total !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Page {resultsPage.page} of {resultsPage.totalPages}
          </div>
        </div>

        {resultsPage.rows.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1080px] text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    {[
                      "Applicant",
                      "Reference No.",
                      "Schedule",
                      "Exam Date",
                      "Score",
                      "Status",
                      "Actions",
                    ].map((head) => (
                      <th
                        key={head}
                        className="pb-4 text-sm font-semibold text-slate-500"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {resultsPage.rows.map((row) => {
                    const applicant = Array.isArray(row.applicants)
                      ? row.applicants[0]
                      : row.applicants

                    const schedule = Array.isArray(row.test_schedules)
                      ? row.test_schedules[0]
                      : row.test_schedules

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 transition hover:bg-red-50/40"
                      >
                        <td className="py-4">
                          <p className="font-semibold text-slate-950">
                            {applicant
                              ? formatName(applicant)
                              : "Unknown applicant"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {applicant?.email || "No email"}
                          </p>
                        </td>

                        <td className="py-4 text-sm text-slate-700">
                          {applicant?.reference_number || "—"}
                        </td>

                        <td className="py-4 text-sm text-slate-700">
                          {schedule?.name || "—"}
                        </td>

                        <td className="py-4 text-sm text-slate-500">
                          {formatDate(schedule?.exam_date)}
                        </td>

                        <td className="py-4">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                            {Number(row.overall_percentage ?? 0)}%
                          </span>
                        </td>

                        <td className="py-4">
                          {row.is_published ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              Published
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="py-4">
                          <ResultActions
                            id={Number(row.id)}
                            isPublished={Boolean(row.is_published)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {resultsPage.rows.map((row) => {
                const applicant = Array.isArray(row.applicants)
                  ? row.applicants[0]
                  : row.applicants

                const schedule = Array.isArray(row.test_schedules)
                  ? row.test_schedules[0]
                  : row.test_schedules

                return (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-3xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950">
                          {applicant
                            ? formatName(applicant)
                            : "Unknown Applicant"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {applicant?.reference_number || "No reference"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                        {Number(row.overall_percentage ?? 0)}%
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Schedule:</span>{" "}
                        {schedule?.name || "—"}
                      </p>
                      <p>
                        <span className="font-semibold">Exam Date:</span>{" "}
                        {formatDate(schedule?.exam_date)}
                      </p>
                      <p className="break-words">
                        <span className="font-semibold">Email:</span>{" "}
                        {applicant?.email || "No email"}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {row.is_published ? (
                        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Published
                        </span>
                      ) : (
                        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          Pending
                        </span>
                      )}

                      <ResultActions
                        id={Number(row.id)}
                        isPublished={Boolean(row.is_published)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {resultsPage.page} of {resultsPage.totalPages}
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Link
                  href={buildPageHref({
                    query: resultsPage.query,
                    page: Math.max(1, resultsPage.page - 1),
                    sort: resultsPage.sort,
                    status: resultsPage.status,
                  })}
                  className={
                    resultsPage.page <= 1
                      ? "pointer-events-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
                      : "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>

                <Link
                  href={buildPageHref({
                    query: resultsPage.query,
                    page: Math.min(resultsPage.totalPages, resultsPage.page + 1),
                    sort: resultsPage.sort,
                    status: resultsPage.status,
                  })}
                  className={
                    resultsPage.page >= resultsPage.totalPages
                      ? "pointer-events-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
                      : "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-14 text-center sm:rounded-3xl">
            <p className="font-semibold text-slate-700">No results found</p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing the search keyword, status filter, or sorting option.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}