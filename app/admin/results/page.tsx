import Link from "next/link"
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react"

import { ResultActions } from "@/components/admin/result-actions"
import { getResultsPage, getResultsStats } from "./actions"

type SearchParams = Promise<{
  q?: string
  page?: string
  pageSize?: string
  sort?: string
  status?: string
}>

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

function buildPageHref({
  query,
  page,
  pageSize,
  sort,
  status,
}: {
  query: string
  page: number
  pageSize: number
  sort: string
  status: string
}) {
  const params = new URLSearchParams()

  if (query) params.set("q", query)
  if (sort && sort !== "newest") params.set("sort", sort)
  if (status && status !== "all") params.set("status", status)

  params.set("page", String(page))
  params.set("pageSize", String(pageSize))

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

function getQualification(score?: number | null) {
  const safeScore = Number(score ?? 0)

  return safeScore >= 35
    ? {
        label: "Qualifier",
        className: "bg-green-50 text-green-700 ring-green-100",
      }
    : {
        label: "Non-Qualifier",
        className: "bg-slate-100 text-slate-600 ring-slate-200",
      }
}

function getStatusLabel(status: string) {
  if (status === "published") return "Published only"
  if (status === "pending") return "Pending only"
  return "All statuses"
}

function getSortLabel(sort: string) {
  const labels: Record<string, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    score_high: "Highest score",
    score_low: "Lowest score",
    published_first: "Published first",
    pending_first: "Pending first",
  }

  return labels[sort] ?? "Newest first"
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
  const pageSize = params?.pageSize ?? "10"
  const sort = params?.sort ?? "newest"
  const status = params?.status ?? "all"

  const [stats, resultsPage] = await Promise.all([
    getResultsStats(),
    getResultsPage({ query, page, pageSize, sort, status }),
  ])

  const publishRate =
    stats.totalResults > 0
      ? Math.round((stats.publishedResults / stats.totalResults) * 100)
      : 0

  const currentStart =
    resultsPage.rows.length > 0
      ? (resultsPage.page - 1) * resultsPage.pageSize + 1
      : 0

  const currentEnd = Math.min(
    (resultsPage.page - 1) * resultsPage.pageSize + resultsPage.rows.length,
    resultsPage.total,
  )

  const hasFilters =
    Boolean(resultsPage.query) ||
    resultsPage.status !== "all" ||
    resultsPage.sort !== "newest" ||
    resultsPage.pageSize !== 10

  const previousHref = buildPageHref({
    query: resultsPage.query,
    page: Math.max(1, resultsPage.page - 1),
    pageSize: resultsPage.pageSize,
    sort: resultsPage.sort,
    status: resultsPage.status,
  })

  const nextHref = buildPageHref({
    query: resultsPage.query,
    page: Math.min(resultsPage.totalPages, resultsPage.page + 1),
    pageSize: resultsPage.pageSize,
    sort: resultsPage.sort,
    status: resultsPage.status,
  })

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
              Review CET records, release qualified results, hide incorrect
              entries, and keep student result visibility under control.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-[500px]">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-red-100">Total Records</p>
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
          subtitle="All CET result records in the system"
          icon={ClipboardList}
          tone="blue"
        />

        <StatCard
          title="Released Results"
          value={stats.publishedResults}
          subtitle="Currently visible to students"
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          title="Pending Results"
          value={stats.pendingResults}
          subtitle="Saved but not yet released"
          icon={BarChart3}
          tone="amber"
        />

        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Overall average across result records"
          icon={TrendingUp}
          tone="red"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-base font-bold text-slate-950">
                Find Result Records
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Search by applicant name, reference number, email address, or
                test schedule.
              </p>
            </div>

            {hasFilters ? (
              <Link
                href="/admin/results"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-fit"
              >
                <RotateCcw className="h-4 w-4" />
                Reset filters
              </Link>
            ) : null}
          </div>

          <form method="GET" className="space-y-4">
            <input type="hidden" name="page" value="1" />

            <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_170px_190px_190px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="q"
                  defaultValue={resultsPage.query}
                  placeholder="Search applicant, email, reference no..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>

              <select
                name="status"
                defaultValue={resultsPage.status}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                <option value="all">All Status</option>
                <option value="published">Released Only</option>
                <option value="pending">Pending Only</option>
              </select>

              <select
                name="sort"
                defaultValue={resultsPage.sort}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score_high">Highest Score</option>
                <option value="score_low">Lowest Score</option>
                <option value="published_first">Released First</option>
                <option value="pending_first">Pending First</option>
              </select>

              <select
                name="pageSize"
                defaultValue={String(resultsPage.pageSize)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 active:scale-[0.99]"
              >
                <Filter className="h-4 w-4" />
                Apply
              </button>
            </div>
          </form>

          {hasFilters ? (
            <div className="flex flex-wrap gap-2">
              {resultsPage.query ? (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                  Search: “{resultsPage.query}”
                </span>
              ) : null}

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {getStatusLabel(resultsPage.status)}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {getSortLabel(resultsPage.sort)}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {resultsPage.pageSize} per page
              </span>
            </div>
          ) : null}

          {resultsPage.query && resultsPage.rows.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              No record matched “
              <span className="font-semibold">{resultsPage.query}</span>”.
              Try a shorter keyword, reference number, email, or schedule name.
            </div>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-bold text-slate-950">
                Result Records
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Showing {currentStart}-{currentEnd} of {resultsPage.total}{" "}
                record{resultsPage.total !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Page {resultsPage.page} of {resultsPage.totalPages}
            </div>
          </div>
        </div>

        {resultsPage.rows.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1160px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    {[
                      "Applicant",
                      "Reference No.",
                      "Schedule",
                      "Exam Date",
                      "Score",
                      "Qualification",
                      "Visibility",
                      "Actions",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-5 py-4 text-sm font-semibold text-slate-500"
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

                    const score = Number(row.overall_percentage ?? 0)
                    const qualification = getQualification(score)

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 transition hover:bg-red-50/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">
                            {applicant
                              ? formatName(applicant)
                              : "Unknown applicant"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {applicant?.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {applicant?.reference_number || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {schedule?.name || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(schedule?.exam_date)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                            {score}%
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${qualification.className}`}
                          >
                            {qualification.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {row.is_published ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-green-100">
                              Released
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
                              Hidden
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
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

            <div className="grid gap-4 p-4 lg:hidden">
              {resultsPage.rows.map((row) => {
                const applicant = Array.isArray(row.applicants)
                  ? row.applicants[0]
                  : row.applicants

                const schedule = Array.isArray(row.test_schedules)
                  ? row.test_schedules[0]
                  : row.test_schedules

                const score = Number(row.overall_percentage ?? 0)
                const qualification = getQualification(score)

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
                        {score}%
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${qualification.className}`}
                      >
                        {qualification.label}
                      </span>

                      {row.is_published ? (
                        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Released
                        </span>
                      ) : (
                        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <ResultActions
                        id={Number(row.id)}
                        isPublished={Boolean(row.is_published)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {currentStart}-{currentEnd} of {resultsPage.total}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <Link
                    href={previousHref}
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
                    href={nextHref}
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
            </div>
          </>
        ) : (
          <div className="px-4 py-16 text-center sm:px-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Search className="h-5 w-5" />
            </div>

            <p className="mt-4 font-semibold text-slate-800">
              No result records found
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Adjust your keyword, status, sorting, or page size. You can also
              reset the filters to return to the full results list.
            </p>

            {hasFilters ? (
              <Link
                href="/admin/results"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                <RotateCcw className="h-4 w-4" />
                Reset filters
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}