import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  School,
  Users,
  FileCheck2,
} from "lucide-react"
import {
  getDashboardStats,
  getRecentResults,
  getResultTrends,
} from "@/lib/dashboard"

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
}: {
  title: string
  value: string
  subtext: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-3xl border border-primary/10 bg-white/95 p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {subtext}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function TrendChart({
  data,
}: {
  data: { label: string; count: number; average: number }[]
}) {
  const maxAverage = Math.max(...data.map((item) => item.average), 100)

  return (
    <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Result Trend
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          Average performance by schedule
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Live overview of uploaded result averages across recent schedules.
        </p>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-8 text-center text-sm text-muted-foreground">
            No result trend data available yet.
          </div>
        ) : (
          data.map((item) => {
            const width = `${Math.max((item.average / maxAverage) * 100, 8)}%`

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} result{item.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-primary">
                    {item.average}%
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-red-900 transition-all"
                    style={{ width }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function RecentResults({
  data,
}: {
  data: {
    id: number
    referenceNumber: string
    fullName: string
    overallPercentage: number
    isPublished: boolean
    examDate: string | null
  }[]
}) {
  return (
    <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Recent Results
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          Latest uploaded records
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-8 text-center text-sm text-muted-foreground">
          No recent uploaded results yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {item.fullName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.referenceNumber}
                  {item.examDate
                    ? ` • ${new Date(item.examDate).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary shadow-sm">
                  {item.overallPercentage}%
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
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
      <section className="rounded-[2rem] border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Testing Center Command Center
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Monitor applicant records, uploaded results, publication status, and
          student-ready downloadable result workflows from one responsive admin
          workspace.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Active School Year"
          value={stats.activeSchoolYear ?? "Not set"}
          subtext="Currently selected admission cycle"
          icon={School}
        />
        <StatCard
          title="Applicants"
          value={stats.totalApplicants.toString()}
          subtext="Total applicant records in the system"
          icon={Users}
        />
        <StatCard
          title="Uploaded Results"
          value={stats.totalResults.toString()}
          subtext="All encoded result records"
          icon={FileCheck2}
        />
        <StatCard
          title="Published"
          value={stats.publishedResults.toString()}
          subtext="Visible to students online"
          icon={CheckCircle2}
        />
        <StatCard
          title="Pending"
          value={stats.unpublishedResults.toString()}
          subtext="Still in draft or for review"
          icon={ClipboardList}
        />
        <StatCard
          title="Average Result"
          value={`${stats.averageOverallPercentage}%`}
          subtext="Average overall uploaded score"
          icon={BarChart3}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TrendChart data={trends} />
        <RecentResults data={recentResults} />
      </section>
    </div>
  )
}