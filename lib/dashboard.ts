import { cache } from "react"
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

export const getDashboardStats = cache(async (): Promise<DashboardStat> => {
  const supabase = await createClient()

  const [
    activeSchoolYearRes,
    totalApplicantsRes,
    totalResultsRes,
    publishedResultsRes,
    unpublishedResultsRes,
    averageRowsRes,
  ] = await Promise.all([
    supabase
      .from("school_years")
      .select("label")
      .eq("is_active", true)
      .maybeSingle(),

    supabase
      .from("applicants")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("results")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("results")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),

    supabase
      .from("results")
      .select("*", { count: "exact", head: true })
      .eq("is_published", false),

    supabase
      .from("results")
      .select("overall_percentage"),
  ])

  const averageRows = averageRowsRes.data ?? []

  const averageOverallPercentage =
    averageRows.length > 0
      ? Number(
          (
            averageRows.reduce(
              (sum, row) => sum + Number(row.overall_percentage ?? 0),
              0
            ) / averageRows.length
          ).toFixed(2)
        )
      : 0

  return {
    activeSchoolYear: activeSchoolYearRes.data?.label ?? null,
    totalApplicants: totalApplicantsRes.count ?? 0,
    totalResults: totalResultsRes.count ?? 0,
    publishedResults: publishedResultsRes.count ?? 0,
    unpublishedResults: unpublishedResultsRes.count ?? 0,
    averageOverallPercentage,
  }
})

export const getResultTrends = cache(async (): Promise<ResultTrendItem[]> => {
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
})

export const getRecentResults = cache(async (): Promise<RecentResultItem[]> => {
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
})