"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const PAGE_SIZE = 10

export type ResultsSort =
  | "newest"
  | "oldest"
  | "score_high"
  | "score_low"
  | "published_first"
  | "pending_first"

export type ResultsStatus = "all" | "published" | "pending"

type ActionResult = {
  ok: boolean
  message: string
}

function normalizePage(value: string | number | null | undefined) {
  const page = Number(value ?? 1)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function normalizeSort(value: string | null | undefined): ResultsSort {
  const allowed: ResultsSort[] = [
    "newest",
    "oldest",
    "score_high",
    "score_low",
    "published_first",
    "pending_first",
  ]

  return allowed.includes(value as ResultsSort)
    ? (value as ResultsSort)
    : "newest"
}

function normalizeStatus(value: string | null | undefined): ResultsStatus {
  const allowed: ResultsStatus[] = ["all", "published", "pending"]

  return allowed.includes(value as ResultsStatus)
    ? (value as ResultsStatus)
    : "all"
}

export async function getResultsStats() {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_dashboard_stats")

  if (error) {
    console.error("getResultsStats error:", error.message)

    return {
      totalResults: 0,
      publishedResults: 0,
      pendingResults: 0,
      averageScore: 0,
    }
  }

  return {
    totalResults: Number(data?.totalResults ?? 0),
    publishedResults: Number(data?.publishedResults ?? 0),
    pendingResults: Number(data?.pendingResults ?? 0),
    averageScore: Number(data?.averageScore ?? 0),
  }
}

export async function getResultsPage(params: {
  query?: string
  page?: string | number
  sort?: string
  status?: string
}) {
  const supabase = await createClient()

  const query = String(params.query ?? "").trim()
  const page = normalizePage(params.page)
  const sort = normalizeSort(params.sort)
  const status = normalizeStatus(params.status)

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let applicantIds: number[] = []
  let scheduleIds: number[] = []

  if (query) {
    const [applicantResult, scheduleResult] = await Promise.all([
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
        .limit(100),

      supabase
        .from("test_schedules")
        .select("id")
        .ilike("name", `%${query}%`)
        .limit(100),
    ])

    if (applicantResult.error) {
      throw new Error(applicantResult.error.message)
    }

    if (scheduleResult.error) {
      throw new Error(scheduleResult.error.message)
    }

    applicantIds = (applicantResult.data ?? []).map((item) => Number(item.id))
    scheduleIds = (scheduleResult.data ?? []).map((item) => Number(item.id))

    if (applicantIds.length === 0 && scheduleIds.length === 0) {
      return {
        rows: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        totalPages: 1,
        query,
        sort,
        status,
      }
    }
  }

  let countQuery = supabase
    .from("results")
    .select("id", { count: "exact", head: true })

  let dataQuery = supabase.from("results").select(`
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
  `)

  if (status === "published") {
    countQuery = countQuery.eq("is_published", true)
    dataQuery = dataQuery.eq("is_published", true)
  }

  if (status === "pending") {
    countQuery = countQuery.eq("is_published", false)
    dataQuery = dataQuery.eq("is_published", false)
  }

  if (query) {
    if (applicantIds.length > 0 && scheduleIds.length > 0) {
      const filter = `applicant_id.in.(${applicantIds.join(
        ","
      )}),test_schedule_id.in.(${scheduleIds.join(",")})`

      countQuery = countQuery.or(filter)
      dataQuery = dataQuery.or(filter)
    } else if (applicantIds.length > 0) {
      countQuery = countQuery.in("applicant_id", applicantIds)
      dataQuery = dataQuery.in("applicant_id", applicantIds)
    } else if (scheduleIds.length > 0) {
      countQuery = countQuery.in("test_schedule_id", scheduleIds)
      dataQuery = dataQuery.in("test_schedule_id", scheduleIds)
    }
  }

  if (sort === "newest") {
    dataQuery = dataQuery.order("created_at", { ascending: false })
  }

  if (sort === "oldest") {
    dataQuery = dataQuery.order("created_at", { ascending: true })
  }

  if (sort === "score_high") {
    dataQuery = dataQuery.order("overall_percentage", { ascending: false })
  }

  if (sort === "score_low") {
    dataQuery = dataQuery.order("overall_percentage", { ascending: true })
  }

  if (sort === "published_first") {
    dataQuery = dataQuery.order("is_published", { ascending: false })
  }

  if (sort === "pending_first") {
    dataQuery = dataQuery.order("is_published", { ascending: true })
  }

  const [countResult, dataResult] = await Promise.all([
    countQuery,
    dataQuery.range(from, to),
  ])

  if (countResult.error) {
    throw new Error(countResult.error.message)
  }

  if (dataResult.error) {
    throw new Error(dataResult.error.message)
  }

  const total = countResult.count ?? 0

  return {
    rows: dataResult.data ?? [],
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    query,
    sort,
    status,
  }
}

export async function toggleResultPublish(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const id = Number(formData.get("id"))
  const nextValue = String(formData.get("next_value")) === "true"

  if (!id) {
    return {
      ok: false,
      message: "Result ID is required.",
    }
  }

  const { error } = await supabase
    .from("results")
    .update({ is_published: nextValue })
    .eq("id", id)

  if (error) {
    return {
      ok: false,
      message: error.message,
    }
  }

  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")

  return {
    ok: true,
    message: nextValue
      ? "Result released successfully."
      : "Result hidden successfully.",
  }
}

export async function deleteResult(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const id = Number(formData.get("id"))

  if (!id) {
    return {
      ok: false,
      message: "Result ID is required.",
    }
  }

  const { error } = await supabase.from("results").delete().eq("id", id)

  if (error) {
    return {
      ok: false,
      message: error.message,
    }
  }

  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")

  return {
    ok: true,
    message: "Result deleted successfully.",
  }
}