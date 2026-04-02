import {
  Users,
  FileCheck2,
  ClipboardList,
  CheckCircle2,
  ArrowUpRight,
  Clock3,
  School,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  getDashboardStats,
  getRecentResults,
  getResultTrends,
} from "@/lib/dashboard"
import { DashboardCharts } from "./_components/dashboard-charts"

type RawDashboardStats = Awaited<ReturnType<typeof getDashboardStats>>

type DashboardStats = {
  totalApplicants: number
  totalResults: number
  publishedResults: number
  unpublishedResults: number
}
type TrendItem = Awaited<ReturnType<typeof getResultTrends>>[number]
type RecentResultItem = Awaited<ReturnType<typeof getRecentResults>>[number]

type StatCardTone = "red" | "green" | "amber" | "blue"

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  tone?: StatCardTone
}

type PublishingStatusProps = {
  total: number
  published: number
  pending: number
}

type RecentResultsProps = {
  data: RecentResultItem[]
}

type QuickInsightsProps = {
  stats: DashboardStats
  trends: TrendItem[]
}

const toneStyles: Record<StatCardTone, string> = {
  red: "border-red-100 bg-red-50 text-red-600",
  green: "border-green-100 bg-green-50 text-green-600",
  amber: "border-amber-100 bg-amber-50 text-amber-600",
  blue: "border-blue-100 bg-blue-50 text-blue-600",
}

function formatValue(value: string | number): string | number {
  if (typeof value === "number") {
    return value.toLocaleString()
  }

  return value
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "red",
}: StatCardProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {formatValue(value)}
          </p>
          {subtitle ? (
            <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
          ) : null}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneStyles[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  )
}

function PublishingStatus({
  total,
  published,
  pending,
}: PublishingStatusProps) {
  const percent = total > 0 ? Math.round((published / total) * 100) : 0

  return (
    <section className="overflow-hidden rounded-[30px] border border-red-100 bg-gradient-to-br from-white via-white to-red-50 p-5 shadow-sm sm:p-6 xl:p-7">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
            <Sparkles className="h-3.5 w-3.5" />
            Live publication overview
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {percent}% of results are already published
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
            Give admins an immediate summary of released results, pending
            records, and overall publication progress at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[420px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs font-medium text-gray-500">Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {total.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-center">
            <p className="text-xs font-medium text-green-700">Published</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {published.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
            <p className="text-xs font-medium text-amber-700">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {pending.toLocaleString()}
            </p>
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
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </section>
  )
}

function RecentResults({ data }: RecentResultsProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
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
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {item.fullName}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Ref #: {item.referenceNumber}
                </p>
              </div>

              <div className="text-left sm:text-right">
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
    </section>
  )
}

function QuickInsights({ stats, trends }: QuickInsightsProps) {
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
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
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
                Focus on unreleased results first so the admin team can reduce
                pending records faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default async function AdminDashboardPage() {
  const [stats, trends, recentResults] = await Promise.all([
    getDashboardStats(),
    getResultTrends(),
    getRecentResults(),
  ])

  const safeStats = {
    totalApplicants: Number(stats?.totalApplicants ?? 0),
    totalResults: Number(stats?.totalResults ?? 0),
    publishedResults: Number(stats?.publishedResults ?? 0),
    unpublishedResults: Number(stats?.unpublishedResults ?? 0),
  }

  const safeTrends = Array.isArray(trends) ? trends : []
  const safeRecentResults = Array.isArray(recentResults) ? recentResults : []

  return (
    <div className="space-y-6">
      <PublishingStatus
        total={safeStats.totalResults}
        published={safeStats.publishedResults}
        pending={safeStats.unpublishedResults}
      />

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Applicants"
          value={safeStats.totalApplicants}
          subtitle="Total registered applicants"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Results"
          value={safeStats.totalResults}
          subtitle="Generated result records"
          icon={FileCheck2}
          tone="red"
        />
        <StatCard
          title="Published"
          value={safeStats.publishedResults}
          subtitle="Visible to applicants"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Pending"
          value={safeStats.unpublishedResults}
          subtitle="Awaiting release"
          icon={ClipboardList}
          tone="amber"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DashboardCharts stats={safeStats} trends={safeTrends} />
        </div>

        <div className="xl:col-span-4">
          <QuickInsights stats={safeStats} trends={safeTrends} />
        </div>
      </section>

      <section>
        <RecentResults data={safeRecentResults} />
      </section>
    </div>
  )
}