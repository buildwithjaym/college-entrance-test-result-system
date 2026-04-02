import {
  Users,
  FileCheck2,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  School,
  Activity,
  ArrowUpRight,
  Clock3,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  getDashboardStats,
  getRecentResults,
  getResultTrends,
} from "@/lib/dashboard"

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>
type TrendItem = Awaited<ReturnType<typeof getResultTrends>>[number]
type RecentResultItem = Awaited<ReturnType<typeof getRecentResults>>[number]

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  tone?: "red" | "green" | "amber" | "blue"
}

type PublishingStatusProps = {
  total: number
  published: number
  pending: number
}

type BarGraphProps = {
  data: TrendItem[]
}

type TrendOverviewProps = {
  data: TrendItem[]
}

type RecentResultsProps = {
  data: RecentResultItem[]
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  red: "bg-red-50 text-red-600 border-red-100",
  green: "bg-green-50 text-green-600 border-green-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "red",
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
          ) : null}
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneStyles[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function PublishingStatus({
  total,
  published,
  pending,
}: PublishingStatusProps) {
  const percent = total > 0 ? Math.round((published / total) * 100) : 0

  return (
    <div className="rounded-[28px] border border-red-100 bg-gradient-to-br from-white via-white to-red-50 p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Publication Overview
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {percent}% of results are already published
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This gives admins an instant view of what is already visible to
            applicants and what still needs review or release.
          </p>
        </div>

        <div className="grid min-w-[280px] grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-center">
            <p className="text-xs font-medium text-green-700">Published</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {published}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
            <p className="text-xs font-medium text-amber-700">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{pending}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-600">Publishing progress</span>
          <span className="font-semibold text-red-600">{percent}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-red-100">
          <div
            className="h-full rounded-full bg-red-600 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function TrendOverview({ data }: TrendOverviewProps) {
  const max = Math.max(...data.map((item) => item.average), 100)

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Average Performance Trend
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Quick visual comparison of schedule averages
          </p>
        </div>
        <div className="rounded-2xl bg-red-50 p-2 text-red-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-8 flex h-56 items-end gap-3">
        {data.map((item) => {
          const height = Math.max((item.average / max) * 100, 10)

          return (
            <div
              key={item.label}
              className="flex flex-1 flex-col items-center justify-end"
            >
              <div className="mb-2 text-xs font-semibold text-red-600">
                {item.average}%
              </div>
              <div className="flex h-44 w-full items-end rounded-2xl bg-gray-100 p-1">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-red-600 to-red-400 transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="mt-3 text-center text-xs font-medium text-gray-600">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BarGraph({ data }: BarGraphProps) {
  const max = Math.max(...data.map((d) => d.average), 100)

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Performance by Schedule
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Ranked progress bars for fast comparison
          </p>
        </div>
        <div className="rounded-2xl bg-blue-50 p-2 text-blue-600">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {data.map((item) => {
          const width = (item.average / max) * 100

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="font-semibold text-red-600">
                  {item.average}%
                </span>
              </div>

              <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentResults({ data }: RecentResultsProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Recent Results</p>
          <p className="mt-1 text-sm text-gray-500">
            Latest applicant result activity
          </p>
        </div>
        <div className="rounded-2xl bg-gray-100 p-2 text-gray-700">
          <Clock3 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No recent results found.
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {item.fullName}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Ref #: {item.referenceNumber}
                </p>
              </div>

              <div className="ml-4 text-right">
                <p className="text-lg font-bold text-red-600">
                  {item.overallPercentage}%
                </p>
                <p
                  className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.isPublished
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.isPublished ? "Published" : "Pending"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function QuickInsights({
  stats,
  trends,
}: {
  stats: DashboardStats
  trends: TrendItem[]
}) {
  const highestTrend = trends.reduce<TrendItem | null>(
    (best, current) =>
      !best || current.average > best.average ? current : best,
    null
  )

  const publishRate =
    stats.totalResults > 0
      ? Math.round((stats.publishedResults / stats.totalResults) * 100)
      : 0

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Admin Snapshot</p>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-50 p-2 text-red-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Publish rate
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {publishRate}% of all generated results are already published.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <School className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Best performing schedule
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {highestTrend
                  ? `${highestTrend.label} leads with an average of ${highestTrend.average}%.`
                  : "No trend data available yet."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-green-50 p-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Operational focus
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Prioritize unpublished results so the admin team can reduce
                pending releases faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const [stats, trends, recentResults] = await Promise.all([
    getDashboardStats(),
    getResultTrends(),
    getRecentResults(),
  ])

  return (
    <div className="space-y-6">
      <PublishingStatus
        total={stats.totalResults}
        published={stats.publishedResults}
        pending={stats.unpublishedResults}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applicants"
          value={stats.totalApplicants}
          subtitle="Total registered applicants"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Results"
          value={stats.totalResults}
          subtitle="Generated result records"
          icon={FileCheck2}
          tone="red"
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
          value={stats.unpublishedResults}
          subtitle="Awaiting release"
          icon={ClipboardList}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrendOverview data={trends} />
        </div>
        <div>
          <QuickInsights stats={stats} trends={trends} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BarGraph data={trends} />
        <RecentResults data={recentResults} />
      </div>
    </div>
  )
}