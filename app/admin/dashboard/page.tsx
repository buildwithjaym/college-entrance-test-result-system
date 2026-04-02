import {
  Users,
  FileCheck2,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  School,
} from "lucide-react"
import {
  getDashboardStats,
  getRecentResults,
  getResultTrends,
} from "@/lib/dashboard"

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <Icon className="h-4 w-4 text-red-600" />
      </div>

      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

/* 🔥 IMPORTANT CARD: Publishing Status */
function PublishingStatus({ total, published, pending }) {
  const percent = total > 0 ? Math.round((published / total) * 100) : 0

  return (
    <div className="rounded-3xl border border-red-100 bg-white p-6">
      <p className="text-sm font-semibold text-red-600">
        Result Publication Status
      </p>

      <h2 className="mt-2 text-xl font-bold text-gray-900">
        {percent}% Published
      </h2>

      <div className="mt-4 h-3 rounded-full bg-red-100">
        <div
          className="h-full rounded-full bg-red-600"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-green-600">{published} Published</span>
        <span className="text-amber-600">{pending} Pending</span>
      </div>
    </div>
  )
}

/* 🔥 BAR GRAPH (KEY FEATURE) */
function BarGraph({ data }) {
  const max = Math.max(...data.map((d) => d.average), 100)

  return (
    <div className="rounded-3xl border bg-white p-6">
      <p className="text-sm font-semibold text-red-600">
        Performance by Schedule
      </p>

      <div className="mt-6 space-y-4">
        {data.map((item) => {
          const width = (item.average / max) * 100

          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-semibold text-red-600">
                  {item.average}%
                </span>
              </div>

              <div className="mt-1 h-3 bg-red-100 rounded-full">
                <div
                  className="h-full bg-red-600 rounded-full"
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

/* RECENT RESULTS */
function RecentResults({ data }) {
  return (
    <div className="rounded-3xl border bg-white p-6">
      <p className="text-sm font-semibold text-red-600">
        Recent Results
      </p>

      <div className="mt-4 space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border p-3 rounded-xl"
          >
            <div>
              <p className="font-medium">{item.fullName}</p>
              <p className="text-sm text-gray-500">
                {item.referenceNumber}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-red-600">
                {item.overallPercentage}%
              </p>

              <p
                className={`text-xs ${
                  item.isPublished
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {item.isPublished ? "Published" : "Pending"}
              </p>
            </div>
          </div>
        ))}
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

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Testing Center Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of applicants, results, and publishing status
        </p>
      </div>

      {/* 🔥 CRITICAL STATUS */}
      <PublishingStatus
        total={stats.totalResults}
        published={stats.publishedResults}
        pending={stats.unpublishedResults}
      />

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Applicants" value={stats.totalApplicants} icon={Users} />
        <StatCard title="Results" value={stats.totalResults} icon={FileCheck2} />
        <StatCard title="Published" value={stats.publishedResults} icon={CheckCircle2} />
        <StatCard title="Pending" value={stats.unpublishedResults} icon={ClipboardList} />
      </div>

      {/* 🔥 DATA VISUALIZATION */}
      <BarGraph data={trends} />

      {/* RECENT */}
      <RecentResults data={recentResults} />

    </div>
  )
}