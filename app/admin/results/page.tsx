import Link from "next/link"
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Search,
  TrendingUp,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import {
  deleteResult,
  getResultsPage,
  getResultsStats,
  toggleResultPublish,
} from "./actions"

type SearchParams = Promise<{
  q?: string
  page?: string
}>

function buildPageHref(query: string, page: number) {
  const params = new URLSearchParams()

  if (query) {
    params.set("q", query)
  }

  params.set("page", String(page))

  return `/admin/results?${params.toString()}`
}

function formatName(applicant: {
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
}) {
  return [applicant.first_name, applicant.middle_name, applicant.last_name]
    .filter(Boolean)
    .join(" ")
}

function formatDate(date: string) {
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
    red: "border-red-100 bg-red-50 text-red-600",
    green: "border-green-100 bg-green-50 text-green-600",
    amber: "border-amber-100 bg-amber-50 text-amber-600",
    blue: "border-blue-100 bg-blue-50 text-blue-600",
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneMap[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function PublishButton({
  id,
  isPublished,
}: {
  id: number
  isPublished: boolean
}) {
  return (
    <form action={toggleResultPublish}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="next_value" value={String(!isPublished)} />
      <button
        type="submit"
        className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition ${
          isPublished
            ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {isPublished ? (
          <>
            <EyeOff className="h-4 w-4" />
            Unpublish
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Publish
          </>
        )}
      </button>
    </form>
  )
}

function DeleteButton({ id }: { id: number }) {
  return (
    <form action={deleteResult}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </form>
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

  const [stats, resultsPage] = await Promise.all([
    getResultsStats(),
    getResultsPage({ query, page }),
  ])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-red-100 bg-gradient-to-br from-white via-white to-red-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
              <Sparkles className="h-3.5 w-3.5" />
              Results management
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Student Results
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Search, review, publish, and manage student results with a cleaner
              table layout, smoother interactions, and better admin visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[360px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Current Query</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {resultsPage.query || "Showing all results"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Page</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {resultsPage.page} of {resultsPage.totalPages}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Total Results"
          value={stats.totalResults}
          subtitle="All generated results"
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          title="Published"
          value={stats.publishedResults}
          subtitle="Visible to students"
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

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Result Records</p>
            <p className="mt-1 text-sm text-slate-500">
              Search by applicant name, reference number, email, or schedule
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative min-w-0 sm:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={resultsPage.query}
                placeholder="Search results..."
                className="h-11 w-full rounded-2xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.99]"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Results Table</p>
            <p className="mt-1 text-sm text-slate-500">
              {resultsPage.total} total record{resultsPage.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {resultsPage.rows.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Applicant
                    </th>
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Reference No.
                    </th>
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Schedule
                    </th>
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Exam Date
                    </th>
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Score
                    </th>
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Actions
                    </th>
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
                        className="border-b border-slate-100 transition-colors hover:bg-red-50/30"
                      >
                        <td className="py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {applicant ? formatName(applicant) : "Unknown applicant"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {applicant?.email || "No email"}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 text-sm text-slate-700">
                          {applicant?.reference_number || "—"}
                        </td>

                        <td className="py-4 text-sm text-slate-700">
                          {schedule?.name || "—"}
                        </td>

                        <td className="py-4 text-sm text-slate-500">
                          {schedule?.exam_date ? formatDate(schedule.exam_date) : "—"}
                        </td>

                        <td className="py-4">
                          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                            {Number(row.overall_percentage ?? 0)}%
                          </span>
                        </td>

                        <td className="py-4">
                          {row.is_published ? (
                            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <PublishButton
                              id={Number(row.id)}
                              isPublished={Boolean(row.is_published)}
                            />
                            <DeleteButton id={Number(row.id)} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing page {resultsPage.page} of {resultsPage.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Link
                  href={buildPageHref(
                    resultsPage.query,
                    Math.max(1, resultsPage.page - 1)
                  )}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                    resultsPage.page <= 1
                      ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>

                <Link
                  href={buildPageHref(
                    resultsPage.query,
                    Math.min(resultsPage.totalPages, resultsPage.page + 1)
                  )}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                    resultsPage.page >= resultsPage.totalPages
                      ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
            No result records found.
          </div>
        )}
      </section>
    </div>
  )
}