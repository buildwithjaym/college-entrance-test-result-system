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
    totalResults: number
    publishedResults: number
    unpublishedResults: number
  }
  trends: Array<{
    label: string
    average: number
  }>
}

type ChartDatum = {
  label: string
  average: number
}

type PieDatum = {
  name: string
  value: number
}

const LINE_COLOR = "#dc2626"
const GRID_COLOR = "#e5e7eb"
const AXIS_TEXT_COLOR = "#6b7280"
const GREEN_COLOR = "#16a34a"
const AMBER_COLOR = "#f59e0b"

function buildTrendData(
  trends: DashboardChartsProps["trends"]
): ChartDatum[] {
  if (!Array.isArray(trends)) {
    return []
  }

  return trends.map((item) => ({
    label: String(item?.label ?? "Unknown"),
    average: Number(item?.average ?? 0),
  }))
}

function buildPublishData(stats: DashboardChartsProps["stats"]): PieDatum[] {
  return [
    {
      name: "Published",
      value: Number(stats?.publishedResults ?? 0),
    },
    {
      name: "Pending",
      value: Number(stats?.unpublishedResults ?? 0),
    },
  ]
}

function buildSummaryData(stats: DashboardChartsProps["stats"]): PieDatum[] {
  return [
    {
      name: "Total",
      value: Number(stats?.totalResults ?? 0),
    },
    {
      name: "Published",
      value: Number(stats?.publishedResults ?? 0),
    },
    {
      name: "Pending",
      value: Number(stats?.unpublishedResults ?? 0),
    },
  ]
}

function formatTooltipValue(value: number | string) {
  const numericValue = Number(value ?? 0)
  return [`${numericValue}%`, "Average"]
}

function hasMeaningfulData(items: PieDatum[]) {
  return items.some((item) => item.value > 0)
}

export function DashboardCharts({
  stats,
  trends,
}: DashboardChartsProps) {
  const trendData = buildTrendData(trends)
  const publishData = buildPublishData(stats)
  const summaryData = buildSummaryData(stats)

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 2xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-900">
              Average Performance Trend
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Line graph showing the average result trend per schedule
            </p>
          </div>

          <div className="h-[280px] w-full sm:h-[340px]">
            {trendData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-500">
                No trend data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={GRID_COLOR}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: AXIS_TEXT_COLOR }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value ?? 0)}%`, "Average"]}
                    contentStyle={{
                      borderRadius: 16,
                      border: `1px solid ${GRID_COLOR}`,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke={LINE_COLOR}
                    strokeWidth={3}
                    dot={{ r: 4, fill: LINE_COLOR }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-900">
              Publication Breakdown
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Donut chart for published and pending results
            </p>
          </div>

          <div className="h-[280px] w-full sm:h-[340px]">
            {!hasMeaningfulData(publishData) ? (
              <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-500">
                No publication data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={publishData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="85%"
                    paddingAngle={3}
                  >
                    <Cell fill={GREEN_COLOR} />
                    <Cell fill={AMBER_COLOR} />
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: `1px solid ${GRID_COLOR}`,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
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

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-900">
            Dashboard Summary
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Overall count distribution across total, published, and pending
          </p>
        </div>

        <div className="h-[300px] w-full sm:h-[360px]">
          {!hasMeaningfulData(summaryData) ? (
            <div className="flex h-full items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-500">
              No summary data available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="84%"
                  paddingAngle={3}
                >
                  <Cell fill={LINE_COLOR} />
                  <Cell fill={GREEN_COLOR} />
                  <Cell fill={AMBER_COLOR} />
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: `1px solid ${GRID_COLOR}`,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
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