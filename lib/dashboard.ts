import { createClient } from "@/lib/supabase/server"

export type DashboardStats = {
  totalResults: number
  publishedResults: number
  pendingResults: number
  averageScore: number
}

export type RecentDashboardResult = {
  id: number
  overall_percentage: number
  is_published: boolean
  created_at: string | null
  applicant_name: string
  reference_number: string | null
  schedule_name: string | null
  exam_date: string | null
}

export type DashboardTrend = {
  label: string
  average: number
}

export type DashboardBatchBreakdown = {
  batch: string
  released: number
  pending: number
}

function normalizeStats(data: unknown): DashboardStats {
  const stats = data as Partial<DashboardStats> | null

  return {
    totalResults: Number(stats?.totalResults ?? 0),
    publishedResults: Number(stats?.publishedResults ?? 0),
    pendingResults: Number(stats?.pendingResults ?? 0),
    averageScore: Number(stats?.averageScore ?? 0),
  }
}

function formatApplicantName(applicant: {
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
} | null) {
  if (!applicant) return "Unknown Applicant"

  const name = [
    applicant.first_name,
    applicant.middle_name,
    applicant.last_name,
  ]
    .filter(Boolean)
    .join(" ")

  return name || "Unknown Applicant"
}

function formatScheduleLabel(name?: string | null, date?: string | null) {
  if (name) return name

  if (!date) return "No Schedule"

  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  })
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_dashboard_stats")

  if (error) {
    console.error("getDashboardStats error:", error.message)

    return {
      totalResults: 0,
      publishedResults: 0,
      pendingResults: 0,
      averageScore: 0,
    }
  }

  return normalizeStats(data)
}

export async function getRecentDashboardResults(
  limit = 5,
): Promise<RecentDashboardResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("results")
    .select(
      `
      id,
      overall_percentage,
      is_published,
      created_at,
      applicants (
        first_name,
        middle_name,
        last_name,
        reference_number
      ),
      test_schedules (
        name,
        exam_date
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("getRecentDashboardResults error:", error.message)
    return []
  }

  return (data ?? []).map((row) => {
    const applicant = Array.isArray(row.applicants)
      ? row.applicants[0]
      : row.applicants

    const schedule = Array.isArray(row.test_schedules)
      ? row.test_schedules[0]
      : row.test_schedules

    return {
      id: Number(row.id),
      overall_percentage: Number(row.overall_percentage ?? 0),
      is_published: Boolean(row.is_published),
      created_at: row.created_at ?? null,
      applicant_name: formatApplicantName(applicant),
      reference_number: applicant?.reference_number ?? null,
      schedule_name: schedule?.name ?? null,
      exam_date: schedule?.exam_date ?? null,
    }
  })
}

export async function getDashboardChartData(): Promise<{
  trends: DashboardTrend[]
  batchBreakdown: DashboardBatchBreakdown[]
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("results")
    .select(
      `
      overall_percentage,
      is_published,
      test_schedules (
        name,
        exam_date
      )
    `,
    )

  if (error) {
    console.error("getDashboardChartData error:", error.message)

    return {
      trends: [],
      batchBreakdown: [],
    }
  }

  const grouped = new Map<
    string,
    {
      batch: string
      totalScore: number
      totalCount: number
      released: number
      pending: number
      examDate: string | null
    }
  >()

  for (const row of data ?? []) {
    const schedule = Array.isArray(row.test_schedules)
      ? row.test_schedules[0]
      : row.test_schedules

    const batch = formatScheduleLabel(schedule?.name, schedule?.exam_date)

    const existing =
      grouped.get(batch) ??
      {
        batch,
        totalScore: 0,
        totalCount: 0,
        released: 0,
        pending: 0,
        examDate: schedule?.exam_date ?? null,
      }

    existing.totalScore += Number(row.overall_percentage ?? 0)
    existing.totalCount += 1

    if (row.is_published) {
      existing.released += 1
    } else {
      existing.pending += 1
    }

    grouped.set(batch, existing)
  }

  const sortedGroups = Array.from(grouped.values()).sort((a, b) => {
    if (!a.examDate && !b.examDate) return a.batch.localeCompare(b.batch)
    if (!a.examDate) return 1
    if (!b.examDate) return -1

    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  })

  const trends = sortedGroups.map((item) => ({
    label: item.batch,
    average:
      item.totalCount > 0
        ? Math.round(item.totalScore / item.totalCount)
        : 0,
  }))

  const batchBreakdown = sortedGroups.map((item) => ({
    batch: item.batch,
    released: item.released,
    pending: item.pending,
  }))

  return {
    trends,
    batchBreakdown,
  }
}

export async function getDashboardData() {
  const [stats, recentResults, chartData] = await Promise.all([
    getDashboardStats(),
    getRecentDashboardResults(),
    getDashboardChartData(),
  ])

  const releaseRate =
    stats.totalResults > 0
      ? Math.round((stats.publishedResults / stats.totalResults) * 100)
      : 0

  return {
    stats,
    recentResults,
    releaseRate,
    trends: chartData.trends,
    batchBreakdown: chartData.batchBreakdown,
  }
}