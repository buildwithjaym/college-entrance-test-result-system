import Link from "next/link"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Users,
} from "lucide-react"

import {
  getDashboardStats,
  getRecentResults,
  getResultTrends,
} from "@/lib/dashboard"
import { DashboardCharts } from "./_components/dashboard-charts"

function formatNumber(value: number) {
  return value.toLocaleString("en-PH")
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
            {typeof value === "number" ? formatNumber(value) : value}
          </h3>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>

        <div className="rounded-2xl bg-red-50 p-3 text-red-700 ring-1 ring-red-100">
          <Icon className="h-5 w-5" />
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

  const publishRate =
    stats.totalResults > 0
      ? Math.round((stats.publishedResults / stats.totalResults) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] border border-red-100 bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-red-100">
              Testing and Evaluation Center
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
              Dashboard Overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50">
              Monitor applicants, CET result records, publication status, and
              performance trends in one centralized admin dashboard.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
            <p className="text-xs text-red-100">Active Academic Year</p>
            <p className="mt-1 text-lg font-bold">
              {stats.activeSchoolYear ?? "Not set"}
            </p>
          </div>
        </div>
      </section>

      {/* Alert */}
      {stats.unpublishedResults > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-amber-900">
                  Pending results need attention
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  There are {formatNumber(stats.unpublishedResults)} result
                  records waiting to be released.
                </p>
              </div>
            </div>

            <Link
              href="/admin/publish-results"
              className="rounded-2xl bg-amber-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Review Results
            </Link>
          </div>
        </section>
      )}

      {/* Main Status */}
      <section className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">
              Publication Progress
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
              {publishRate}% of CET results are published
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              This helps the admin quickly identify how many results are already
              visible to applicants and how many still require action.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="mt-1 text-xl font-bold text-gray-950">
                {formatNumber(stats.totalResults)}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4 text-center">
              <p className="text-xs text-green-700">Published</p>
              <p className="mt-1 text-xl font-bold text-green-700">
                {formatNumber(stats.publishedResults)}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4 text-center">
              <p className="text-xs text-amber-700">Pending</p>
              <p className="mt-1 text-xl font-bold text-amber-700">
                {formatNumber(stats.unpublishedResults)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500 transition-all"
            style={{ width: `${publishRate}%` }}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applicants"
          value={stats.totalApplicants}
          description="Total registered CET applicants"
          icon={Users}
        />
        <StatCard
          title="Generated Results"
          value={stats.totalResults}
          description="Total encoded result records"
          icon={FileCheck2}
        />
        <StatCard
          title="Published"
          value={stats.publishedResults}
          description="Visible to applicants"
          icon={CheckCircle2}
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageOverallPercentage}%`}
          description="Overall performance average"
          icon={BarChart3}
        />
      </section>

      {/* Charts + Recent */}
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DashboardCharts stats={stats} trends={trends} />
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-950">Recent Results</p>
              <p className="text-sm text-gray-500">Latest encoded records</p>
            </div>

            <div className="rounded-2xl bg-red-50 p-3 text-red-700">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            {recentResults.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                No recent results yet.
              </div>
            ) : (
              recentResults.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-950">
                        {item.fullName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Ref: {item.referenceNumber}
                      </p>
                    </div>

                    <p className="font-bold text-red-700">
                      {item.overallPercentage}%
                    </p>
                  </div>

                  <div className="mt-3">
                    <span
                      className={
                        item.isPublished
                          ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                          : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                      }
                    >
                      {item.isPublished ? "Published" : "Pending"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}