"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const PAGE_SIZE = 10

function normalizePage(value: string | null | undefined) {
  const page = Number(value ?? 1)

  if (!Number.isFinite(page) || page < 1) {
    return 1
  }

  return page
}

export async function getResultsStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("results")
    .select("id, is_published, overall_percentage")

  if (error) {
    throw new Error(error.message)
  }

  const rows = data ?? []
  const totalResults = rows.length
  const publishedResults = rows.filter((item) => Boolean(item.is_published)).length
  const pendingResults = totalResults - publishedResults

  const averageScore =
    totalResults > 0
      ? Math.round(
          rows.reduce(
            (sum, item) => sum + Number(item.overall_percentage ?? 0),
            0
          ) / totalResults
        )
      : 0

  return {
    totalResults,
    publishedResults,
    pendingResults,
    averageScore,
  }
}

export async function getResultsPage(params: {
  query?: string
  page?: string | number
}) {
  const supabase = await createClient()

  const query = String(params.query ?? "").trim()
  const page = normalizePage(String(params.page ?? 1))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let applicantIds: number[] = []
  let scheduleIds: number[] = []

  if (query) {
    const [
      { data: applicantMatches, error: applicantError },
      { data: scheduleMatches, error: scheduleError },
    ] = await Promise.all([
      supabase
        .from("applicants")
        .select("id")
        .or(
          [
            `first_name.ilike.%${query}%`,
            `middle_name.ilike.%${query}%`,
            `last_name.ilike.%${query}%`,
            `reference_number.ilike.%${query}%`,
            `email.ilike.%${query}%`,
          ].join(",")
        )
        .limit(200),
      supabase
        .from("test_schedules")
        .select("id")
        .ilike("name", `%${query}%`)
        .limit(200),
    ])

    if (applicantError) {
      throw new Error(applicantError.message)
    }

    if (scheduleError) {
      throw new Error(scheduleError.message)
    }

    applicantIds = (applicantMatches ?? []).map((item) => Number(item.id))
    scheduleIds = (scheduleMatches ?? []).map((item) => Number(item.id))

    if (applicantIds.length === 0 && scheduleIds.length === 0) {
      return {
        rows: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        totalPages: 1,
        query,
      }
    }
  }

  let countQuery = supabase
    .from("results")
    .select("id", { count: "exact", head: true })

  let dataQuery = supabase
    .from("results")
    .select(
      `
        id,
        overall_percentage,
        is_published,
        created_at,
        applicants (
          id,
          reference_number,
          first_name,
          middle_name,
          last_name,
          email
        ),
        test_schedules (
          id,
          name,
          exam_date
        )
      `
    )
    .order("created_at", { ascending: false })

  if (query) {
    const hasApplicantIds = applicantIds.length > 0
    const hasScheduleIds = scheduleIds.length > 0

    if (hasApplicantIds && hasScheduleIds) {
      const filter = `applicant_id.in.(${applicantIds.join(",")}),test_schedule_id.in.(${scheduleIds.join(",")})`
      countQuery = countQuery.or(filter)
      dataQuery = dataQuery.or(filter)
    } else if (hasApplicantIds) {
      countQuery = countQuery.in("applicant_id", applicantIds)
      dataQuery = dataQuery.in("applicant_id", applicantIds)
    } else if (hasScheduleIds) {
      countQuery = countQuery.in("test_schedule_id", scheduleIds)
      dataQuery = dataQuery.in("test_schedule_id", scheduleIds)
    }
  }

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    countQuery,
    dataQuery.range(from, to),
  ])

  if (countError) {
    throw new Error(countError.message)
  }

  if (error) {
    throw new Error(error.message)
  }

  return {
    rows: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
    query,
  }
}

export async function toggleResultPublish(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = Number(formData.get("id"))
  const nextValue = String(formData.get("next_value")) === "true"

  if (!id) {
    throw new Error("Result ID is required.")
  }

  const { error } = await supabase
    .from("results")
    .update({
      is_published: nextValue,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")
}

export async function deleteResult(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const id = Number(formData.get("id"))

  if (!id) {
    throw new Error("Result ID is required.")
  }

  const { error } = await supabase
    .from("results")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")
}