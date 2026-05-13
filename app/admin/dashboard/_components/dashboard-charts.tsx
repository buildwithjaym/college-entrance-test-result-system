"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type DashboardChartsProps = {
  stats: {
    totalResults: number
    publishedResults: number
    unpublishedResults: number
    averageScore: number
  }
  trends: Array<{
    label: string
    average: number
  }>
  batchBreakdown: Array<{
    batch: string
    released: number
    pending: number
  }>
  qualifierData: Array<{
    name: string
    value: number
  }>
}

const RED = "#b91c1c"
const GREEN = "#16a34a"
const AMBER = "#f59e0b"
const SLATE = "#64748b"
const GRID = "#e5e7eb"

const tooltipStyle = {
  borderRadius: 16,
  border: `1px solid ${GRID}`,
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
}

export function DashboardCharts({
  stats,
  trends,
  batchBreakdown,
  qualifierData,
}: DashboardChartsProps) {
  const releaseData = [
    { name: "Released", value: stats.publishedResults },
    { name: "Pending", value: stats.unpublishedResults },
  ]

  const hasReleaseData = releaseData.some((item) => item.value > 0)
  const hasQualifierData = qualifierData.some((item) => item.value > 0)
  const hasBatchData = batchBreakdown.length > 0
  const hasTrendData = trends.length > 0

  useEffect(() => {
    if (stats.totalResults === 0) return

    if (stats.unpublishedResults > 0) {
      toast.warning(`${stats.unpublishedResults} result(s) are still pending.`)
      return
    }

    toast.success("All generated results are already released.")
  }, [stats.totalResults, stats.unpublishedResults])

  return (
    <section className="grid grid-cols-1 gap-4 sm:gap-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Qualifiers vs Non-Qualifiers"
          description="Applicants with 35% and above are Qualifiers. Below 35% are Non-Qualifiers."
        >
          {!hasQualifierData ? (
            <EmptyChart message="No qualification data available." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualifierData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={5}
                >
                  <Cell fill={GREEN} />
                  <Cell fill={SLATE} />
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Release Breakdown"
          description="Shows how many result records are already released and still pending."
        >
          {!hasReleaseData ? (
            <EmptyChart message="No release data available." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={releaseData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={5}
                >
                  <Cell fill={GREEN} />
                  <Cell fill={AMBER} />
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="Average Performance Trend"
          description="Average result percentage per recent test schedule."
        >
          {!hasTrendData ? (
            <EmptyChart message="No trend data available." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trends}
                margin={{ top: 10, right: 16, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value)}%`, "Average"]}
                  contentStyle={tooltipStyle}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke={RED}
                  strokeWidth={3}
                  dot={{ r: 4, fill: RED }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Results Per Batch"
          description="Compares released and pending records by test batch."
        >
          {!hasBatchData ? (
            <EmptyChart message="No batch data available." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={batchBreakdown}
                margin={{ top: 10, right: 16, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis
                  dataKey="batch"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Bar
                  dataKey="released"
                  name="Released"
                  fill={GREEN}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill={AMBER}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </section>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl sm:p-6">
      <div className="mb-5">
        <p className="text-sm font-bold text-slate-950 sm:text-base">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>

      <div className="h-[260px] sm:h-[320px] lg:h-[360px]">{children}</div>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 px-4 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}