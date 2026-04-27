"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

type DashboardChartsProps = {
  stats: {
    publishedResults: number
    unpublishedResults: number
  }
  trends: Array<{
    label: string
    average: number
  }>
}

const RED = "#b91c1c"
const GREEN = "#16a34a"
const AMBER = "#f59e0b"
const GRID = "#e5e7eb"

export function DashboardCharts({ stats, trends }: DashboardChartsProps) {
  const publicationData = [
    { name: "Published", value: stats.publishedResults },
    { name: "Pending", value: stats.unpublishedResults },
  ]

  const hasPublicationData = publicationData.some((item) => item.value > 0)

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <p className="font-bold text-gray-950">Average Performance Trend</p>
          <p className="mt-1 text-sm text-gray-500">
            Average result percentage per recent test schedule.
          </p>
        </div>

        <div className="h-[280px] sm:h-[340px]">
          {trends.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-500">
              No trend data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trends}
                margin={{ top: 10, right: 14, left: -18, bottom: 0 }}
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
                  contentStyle={{
                    borderRadius: 16,
                    border: `1px solid ${GRID}`,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
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
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <p className="font-bold text-gray-950">Publication Breakdown</p>
          <p className="mt-1 text-sm text-gray-500">
            Published versus pending result records.
          </p>
        </div>

        <div className="h-[280px] sm:h-[330px]">
          {!hasPublicationData ? (
            <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-500">
              No publication data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={publicationData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="82%"
                  paddingAngle={4}
                >
                  <Cell fill={GREEN} />
                  <Cell fill={AMBER} />
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: `1px solid ${GRID}`,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  )
}