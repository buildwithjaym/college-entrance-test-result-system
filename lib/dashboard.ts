import { createClient } from "@/lib/supabase/server"

export type DashboardStat = {
  activeSchoolYear: string | null
  totalApplicants: number
  totalResults: number
  publishedResults: number
  unpublishedResults: number
  averageOverallPercentage: number
}

export type ResultTrendItem = {
  label: string
  count: number
  average: number
}

export type RecentResultItem = {
  id: number
  referenceNumber: string
  fullName: string
  overallPercentage: number
  isPublished: boolean
  examDate: string | null
}

export async function getDashboardStats(): Promise<DashboardStat> {
  const supabase = await createClient()

  const { data: activeSchoolYear } = await supabase
    .from("school_years")
    .select("label")
    .eq("is_active", true)
    .maybeSingle()

  const { count: totalApplicants } = await supabase
    .from("applicants")
    .select("*", { count: "exact", head: true })

  const { count: totalResults } = await supabase
    .from("results")
    .select("*", { count: "exact", head: true })

  const { count: publishedResults } = await supabase
    .from("results")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: unpublishedResults } = await supabase
    .from("results")
    .select("*", { count: "exact", head: true })
    .eq("is_published", false)

  const { data: averageRows } = await supabase
    .from("results")
    .select("overall_percentage")

  const averageOverallPercentage =
    averageRows && averageRows.length > 0
      ? Number(
          (
            averageRows.reduce(
              (sum, row) => sum + Number(row.overall_percentage),
              0
            ) / averageRows.length
          ).toFixed(2)
        )
      : 0

  return {
    activeSchoolYear: activeSchoolYear?.label ?? null,
    totalApplicants: totalApplicants ?? 0,
    totalResults: totalResults ?? 0,
    publishedResults: publishedResults ?? 0,
    unpublishedResults: unpublishedResults ?? 0,
    averageOverallPercentage,
  }
}

export async function getResultTrends(): Promise<ResultTrendItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("results")
    .select(`
      id,
      overall_percentage,
      test_schedules (
        name,
        exam_date
      )
    `)
    .order("created_at", { ascending: true })

  if (error || !data) return []

  const grouped = new Map<string, { count: number; total: number }>()

  for (const row of data) {
    const schedule = Array.isArray(row.test_schedules)
      ? row.test_schedules[0]
      : row.test_schedules

    const label =
      schedule?.name ||
      (schedule?.exam_date
        ? new Date(schedule.exam_date).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
          })
        : "Unknown")

    const existing = grouped.get(label) ?? { count: 0, total: 0 }
    existing.count += 1
    existing.total += Number(row.overall_percentage ?? 0)
    grouped.set(label, existing)
  }

  return Array.from(grouped.entries())
    .map(([label, value]) => ({
      label,
      count: value.count,
      average: Number((value.total / value.count).toFixed(2)),
    }))
    .slice(-6)
}

export async function getRecentResults(): Promise<RecentResultItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("results")
    .select(`
      id,
      overall_percentage,
      is_published,
      applicants (
        reference_number,
        first_name,
        middle_name,
        last_name
      ),
      test_schedules (
        exam_date
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error || !data) return []

  return data.map((row) => {
    const applicant = Array.isArray(row.applicants)
      ? row.applicants[0]
      : row.applicants

    const schedule = Array.isArray(row.test_schedules)
      ? row.test_schedules[0]
      : row.test_schedules

    const fullName = [
      applicant?.first_name,
      applicant?.middle_name,
      applicant?.last_name,
    ]
      .filter(Boolean)
      .join(" ")

    return {
      id: row.id,
      referenceNumber: applicant?.reference_number ?? "N/A",
      fullName: fullName || "Unknown Applicant",
      overallPercentage: Number(row.overall_percentage ?? 0),
      isPublished: Boolean(row.is_published),
      examDate: schedule?.exam_date ?? null,
    }
  })
}