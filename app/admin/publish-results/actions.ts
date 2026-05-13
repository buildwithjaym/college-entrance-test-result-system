"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type SearchApplicantsParams = {
  query?: string
  schoolYearId?: number | null
  page?: number
  pageSize?: number
}

export type SchoolYearRow = {
  id: number
  label: string
  is_active: boolean
}

export type ScheduleRow = {
  id: number
  school_year_id: number
  name: string
  exam_date: string
  school_years:
    | {
        id: number
        label: string
        is_active?: boolean
      }
    | {
        id: number
        label: string
        is_active?: boolean
      }[]
    | null
}

export type ApplicantRow = {
  id: number
  reference_number: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  email: string | null
  created_at: string
  full_name: string
  has_result: boolean
  result_id: number | null
  is_published: boolean
  overall_percentage: number | null
  schedule_name: string | null
  exam_date: string | null
}

export type PaginatedApplicantRows = {
  rows: ApplicantRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function normalizePercentage(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0)

  if (!Number.isFinite(parsed)) return 0

  return Math.max(0, Math.min(100, parsed))
}

function buildFullName(applicant: {
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
}) {
  return [applicant.first_name, applicant.middle_name, applicant.last_name]
    .filter(Boolean)
    .join(" ")
}

function cleanSearchQuery(query: string) {
  return query.trim().replaceAll(",", " ")
}

export async function getPublishResultsContext(): Promise<{
  schoolYears: SchoolYearRow[]
  schedules: ScheduleRow[]
  activeSchoolYear: SchoolYearRow | null
}> {
  const supabase = await createClient()

  const [
    { data: schoolYears, error: schoolYearsError },
    { data: schedules, error: schedulesError },
  ] = await Promise.all([
    supabase
      .from("school_years")
      .select("id, label, is_active")
      .order("created_at", { ascending: false }),
    supabase
      .from("test_schedules")
      .select(
        `
        id,
        school_year_id,
        name,
        exam_date,
        school_years (
          id,
          label,
          is_active
        )
      `,
      )
      .order("exam_date", { ascending: false }),
  ])

  if (schoolYearsError) throw new Error(schoolYearsError.message)
  if (schedulesError) throw new Error(schedulesError.message)

  const safeSchoolYears: SchoolYearRow[] = (schoolYears ?? []).map((item) => ({
    id: Number(item.id),
    label: String(item.label),
    is_active: Boolean(item.is_active),
  }))

  const safeSchedules: ScheduleRow[] = (schedules ?? []).map((item) => ({
    id: Number(item.id),
    school_year_id: Number(item.school_year_id),
    name: String(item.name),
    exam_date: String(item.exam_date),
    school_years: item.school_years ?? null,
  }))

  const activeSchoolYear =
    safeSchoolYears.find((item) => item.is_active) ?? safeSchoolYears[0] ?? null

  return {
    schoolYears: safeSchoolYears,
    schedules: safeSchedules,
    activeSchoolYear,
  }
}

export async function searchApplicantsForPublishing({
  query = "",
  schoolYearId,
  page = 1,
  pageSize = 20,
}: SearchApplicantsParams): Promise<PaginatedApplicantRows> {
  const supabase = await createClient()

  const safePage = Math.max(1, page)
  const safePageSize = Math.min(Math.max(10, pageSize), 100)
  const from = (safePage - 1) * safePageSize
  const to = from + safePageSize - 1
  const cleanQuery = cleanSearchQuery(query)

  let applicantsQuery = supabase
    .from("applicants")
    .select(
      `
      id,
      reference_number,
      first_name,
      middle_name,
      last_name,
      email,
      created_at
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (cleanQuery) {
    applicantsQuery = applicantsQuery.or(
      [
        `first_name.ilike.%${cleanQuery}%`,
        `middle_name.ilike.%${cleanQuery}%`,
        `last_name.ilike.%${cleanQuery}%`,
        `reference_number.ilike.%${cleanQuery}%`,
        `email.ilike.%${cleanQuery}%`,
      ].join(","),
    )
  }

  const { data: applicants, error: applicantsError, count } =
    await applicantsQuery

  if (applicantsError) throw new Error(applicantsError.message)

  const safeApplicants = applicants ?? []
  const applicantIds = safeApplicants.map((item) => Number(item.id))

  let resultsMap = new Map<
    number,
    {
      id: number
      is_published: boolean
      overall_percentage: number
      schedule_name: string | null
      exam_date: string | null
    }
  >()

  if (applicantIds.length > 0 && schoolYearId) {
    const { data: existingResults, error: resultsError } = await supabase
      .from("results")
      .select(
        `
        id,
        applicant_id,
        is_published,
        overall_percentage,
        test_schedules (
          id,
          name,
          exam_date
        )
      `,
      )
      .eq("school_year_id", schoolYearId)
      .in("applicant_id", applicantIds)
      .order("created_at", { ascending: false })

    if (resultsError) throw new Error(resultsError.message)

    resultsMap = new Map(
      (existingResults ?? []).map((item) => {
        const schedule = Array.isArray(item.test_schedules)
          ? item.test_schedules[0]
          : item.test_schedules

        return [
          Number(item.applicant_id),
          {
            id: Number(item.id),
            is_published: Boolean(item.is_published),
            overall_percentage: Number(item.overall_percentage ?? 0),
            schedule_name: schedule?.name ?? null,
            exam_date: schedule?.exam_date ?? null,
          },
        ]
      }),
    )
  }

  const rows = safeApplicants.map((applicant) => {
    const existing = resultsMap.get(Number(applicant.id))
    const fullName = buildFullName(applicant)

    return {
      id: Number(applicant.id),
      reference_number: applicant.reference_number ?? null,
      first_name: applicant.first_name ?? null,
      middle_name: applicant.middle_name ?? null,
      last_name: applicant.last_name ?? null,
      email: applicant.email ?? null,
      created_at: String(applicant.created_at),
      full_name: fullName || "Unnamed Applicant",
      has_result: Boolean(existing),
      result_id: existing?.id ?? null,
      is_published: existing?.is_published ?? false,
      overall_percentage: existing?.overall_percentage ?? null,
      schedule_name: existing?.schedule_name ?? null,
      exam_date: existing?.exam_date ?? null,
    }
  })

  const total = count ?? 0

  return {
    rows,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  }
}

export async function createOrUpdateResult(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const applicantId = Number(formData.get("applicant_id"))
  const testScheduleId = Number(formData.get("test_schedule_id"))
  const overallPercentage = normalizePercentage(
    formData.get("overall_percentage"),
  )
  const remarks = String(formData.get("remarks") ?? "").trim()
  const publishNow = String(formData.get("publish_now") ?? "") === "true"

  if (!applicantId) throw new Error("Applicant is required.")
  if (!testScheduleId) throw new Error("Test schedule is required.")

  const { data: schedule, error: scheduleError } = await supabase
    .from("test_schedules")
    .select("id, school_year_id")
    .eq("id", testScheduleId)
    .single()

  if (scheduleError) throw new Error(scheduleError.message)
  if (!schedule?.school_year_id) {
    throw new Error("Selected schedule has no school year.")
  }

  const schoolYearId = Number(schedule.school_year_id)

  const payload = {
    applicant_id: applicantId,
    school_year_id: schoolYearId,
    test_schedule_id: testScheduleId,
    overall_percentage: overallPercentage,
    remarks: remarks || null,
    is_published: publishNow,
    published_at: publishNow ? new Date().toISOString() : null,
  }

  const { data: existingResult, error: existingError } = await supabase
    .from("results")
    .select("id")
    .eq("applicant_id", applicantId)
    .eq("school_year_id", schoolYearId)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)

  if (existingResult) {
    const { error: updateError } = await supabase
      .from("results")
      .update(payload)
      .eq("id", Number(existingResult.id))

    if (updateError) throw new Error(updateError.message)
  } else {
    const { error: insertError } = await supabase.from("results").insert(payload)

    if (insertError) throw new Error(insertError.message)
  }

  revalidatePath("/admin/publish-results")
  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")
}

export async function togglePublishResult(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const resultId = Number(formData.get("result_id"))
  const nextValue = String(formData.get("next_value")) === "true"

  if (!resultId) throw new Error("Result ID is required.")

  const { error } = await supabase
    .from("results")
    .update({
      is_published: nextValue,
      published_at: nextValue ? new Date().toISOString() : null,
    })
    .eq("id", resultId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/publish-results")
  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")
}