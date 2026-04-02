"use server"

import { createClient } from "@/lib/supabase/server"

export type ReportRow = {
  result_id: number
  school_year_id: number
  school_year_label: string
  applicant_id: number
  reference_number: string | null
  last_name: string
  first_name: string
  middle_name: string | null
  email: string | null
  overall_percentage: number
  is_published: boolean
  exam_date: string | null
  schedule_name: string | null
}

export type SchoolYearOption = {
  id: number
  label: string
  is_active: boolean
}

export async function getReportsData() {
  const supabase = await createClient()

  const [
    { data: schoolYears, error: schoolYearsError },
    { data: results, error: resultsError },
  ] = await Promise.all([
    supabase
      .from("school_years")
      .select("id, label, is_active")
      .order("created_at", { ascending: false }),
    supabase
      .from("results")
      .select(
        `
          id,
          school_year_id,
          overall_percentage,
          is_published,
          applicants (
            id,
            reference_number,
            first_name,
            middle_name,
            last_name,
            email
          ),
          school_years (
            id,
            label
          ),
          test_schedules (
            id,
            name,
            exam_date
          )
        `
      )
      .order("overall_percentage", { ascending: false }),
  ])

  if (schoolYearsError) {
    throw new Error(schoolYearsError.message)
  }

  if (resultsError) {
    throw new Error(resultsError.message)
  }

  const safeSchoolYears: SchoolYearOption[] = (schoolYears ?? []).map((item) => ({
    id: Number(item.id),
    label: String(item.label),
    is_active: Boolean(item.is_active),
  }))

  const rows: ReportRow[] = (results ?? []).flatMap((item) => {
    const applicant = Array.isArray(item.applicants)
      ? item.applicants[0]
      : item.applicants

    const schoolYear = Array.isArray(item.school_years)
      ? item.school_years[0]
      : item.school_years

    const schedule = Array.isArray(item.test_schedules)
      ? item.test_schedules[0]
      : item.test_schedules

    if (!applicant || !schoolYear) {
      return []
    }

    return [
      {
        result_id: Number(item.id),
        school_year_id: Number(item.school_year_id),
        school_year_label: String(schoolYear.label),
        applicant_id: Number(applicant.id),
        reference_number: applicant.reference_number ?? null,
        last_name: String(applicant.last_name ?? ""),
        first_name: String(applicant.first_name ?? ""),
        middle_name: applicant.middle_name ?? null,
        email: applicant.email ?? null,
        overall_percentage: Number(item.overall_percentage ?? 0),
        is_published: Boolean(item.is_published),
        exam_date: schedule?.exam_date ?? null,
        schedule_name: schedule?.name ?? null,
      },
    ]
  })

  return {
    schoolYears: safeSchoolYears,
    rows,
  }
}