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
  limit = 5
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
    `
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

export async function getDashboardData() {
  const stats = await getDashboardStats()
  const recentResults = await getRecentDashboardResults()

  const releaseRate =
    stats.totalResults > 0
      ? Math.round((stats.publishedResults / stats.totalResults) * 100)
      : 0

  return {
    stats,
    recentResults,
    releaseRate,
  }
}