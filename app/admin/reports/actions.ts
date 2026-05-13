"use server"

import { createClient } from "@/lib/supabase/server"

const DEFAULT_PAGE_SIZE = 20
const MIN_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

export type ReportSort =
  | "score_high"
  | "score_low"
  | "name_asc"
  | "name_desc"
  | "exam_newest"
  | "exam_oldest"

export type ReportStatus = "all" | "published" | "pending"

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

export type ReportsPageParams = {
  query?: string
  schoolYearId?: string | number | null
  status?: string
  sort?: string
  page?: string | number
  pageSize?: string | number
}

export type PaginatedReportsData = {
  rows: ReportRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  query: string
  schoolYearId: number | null
  status: ReportStatus
  sort: ReportSort
}

function normalizePage(value: string | number | null | undefined) {
  const page = Number(value ?? 1)
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

function normalizePageSize(value: string | number | null | undefined) {
  const pageSize = Number(value ?? DEFAULT_PAGE_SIZE)

  if (!Number.isFinite(pageSize)) return DEFAULT_PAGE_SIZE

  return Math.min(Math.max(Math.floor(pageSize), MIN_PAGE_SIZE), MAX_PAGE_SIZE)
}

function normalizeSchoolYearId(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null

  const id = Number(value)

  return Number.isFinite(id) && id > 0 ? id : null
}

function normalizeStatus(value: string | null | undefined): ReportStatus {
  const allowed: ReportStatus[] = ["all", "published", "pending"]

  return allowed.includes(value as ReportStatus)
    ? (value as ReportStatus)
    : "published"
}

function normalizeSort(value: string | null | undefined): ReportSort {
  const allowed: ReportSort[] = [
    "score_high",
    "score_low",
    "name_asc",
    "name_desc",
    "exam_newest",
    "exam_oldest",
  ]

  return allowed.includes(value as ReportSort)
    ? (value as ReportSort)
    : "score_high"
}

function cleanSearchQuery(query: string) {
  return query.trim().replaceAll(",", " ")
}

function mapReportRows(data: unknown[]): ReportRow[] {
  return data.flatMap((item) => {
    const row = item as {
      id?: number | string
      school_year_id?: number | string
      overall_percentage?: number | string | null
      is_published?: boolean | null
      applicants?:
        | {
            id?: number | string
            reference_number?: string | null
            first_name?: string | null
            middle_name?: string | null
            last_name?: string | null
            email?: string | null
          }
        | {
            id?: number | string
            reference_number?: string | null
            first_name?: string | null
            middle_name?: string | null
            last_name?: string | null
            email?: string | null
          }[]
        | null
      school_years?:
        | {
            id?: number | string
            label?: string | null
          }
        | {
            id?: number | string
            label?: string | null
          }[]
        | null
      test_schedules?:
        | {
            id?: number | string
            name?: string | null
            exam_date?: string | null
          }
        | {
            id?: number | string
            name?: string | null
            exam_date?: string | null
          }[]
        | null
    }

    const applicant = Array.isArray(row.applicants)
      ? row.applicants[0]
      : row.applicants

    const schoolYear = Array.isArray(row.school_years)
      ? row.school_years[0]
      : row.school_years

    const schedule = Array.isArray(row.test_schedules)
      ? row.test_schedules[0]
      : row.test_schedules

    if (!applicant || !schoolYear) return []

    return [
      {
        result_id: Number(row.id),
        school_year_id: Number(row.school_year_id),
        school_year_label: String(schoolYear.label ?? ""),
        applicant_id: Number(applicant.id),
        reference_number: applicant.reference_number ?? null,
        last_name: String(applicant.last_name ?? ""),
        first_name: String(applicant.first_name ?? ""),
        middle_name: applicant.middle_name ?? null,
        email: applicant.email ?? null,
        overall_percentage: Number(row.overall_percentage ?? 0),
        is_published: Boolean(row.is_published),
        exam_date: schedule?.exam_date ?? null,
        schedule_name: schedule?.name ?? null,
      },
    ]
  })
}

export async function getSchoolYearsForReports(): Promise<SchoolYearOption[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("school_years")
    .select("id, label, is_active")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((item) => ({
    id: Number(item.id),
    label: String(item.label),
    is_active: Boolean(item.is_active),
  }))
}

export async function getReportsPage(
  params: ReportsPageParams,
): Promise<PaginatedReportsData> {
  const supabase = await createClient()

  const query = cleanSearchQuery(String(params.query ?? ""))
  const page = normalizePage(params.page)
  const pageSize = normalizePageSize(params.pageSize)
  const schoolYearId = normalizeSchoolYearId(params.schoolYearId)
  const status = normalizeStatus(params.status)
  const sort = normalizeSort(params.sort)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

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
          ].join(","),
        )
        .limit(500),

      supabase
        .from("test_schedules")
        .select("id")
        .ilike("name", `%${query}%`)
        .limit(500),
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
        pageSize,
        totalPages: 1,
        query,
        schoolYearId,
        status,
        sort,
      }
    }
  }

  let countQuery = supabase
    .from("results")
    .select("id", { count: "exact", head: true })

  let dataQuery = supabase.from("results").select(`
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
  `)

  if (schoolYearId) {
    countQuery = countQuery.eq("school_year_id", schoolYearId)
    dataQuery = dataQuery.eq("school_year_id", schoolYearId)
  }

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
        ",",
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

  if (sort === "score_high") {
    dataQuery = dataQuery.order("overall_percentage", { ascending: false })
  }

  if (sort === "score_low") {
    dataQuery = dataQuery.order("overall_percentage", { ascending: true })
  }

  if (sort === "exam_newest") {
    dataQuery = dataQuery.order("exam_date", {
      ascending: false,
      referencedTable: "test_schedules",
    })
  }

  if (sort === "exam_oldest") {
    dataQuery = dataQuery.order("exam_date", {
      ascending: true,
      referencedTable: "test_schedules",
    })
  }

  if (sort === "name_asc" || sort === "name_desc") {
    dataQuery = dataQuery.order("last_name", {
      ascending: sort === "name_asc",
      referencedTable: "applicants",
    })
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)

  return {
    rows: mapReportRows((dataResult.data ?? []) as unknown[]),
    total,
    page: safePage,
    pageSize,
    totalPages,
    query,
    schoolYearId,
    status,
    sort,
  }
}

export async function getReportsData(params: ReportsPageParams = {}) {
  const [schoolYears, pageData] = await Promise.all([
    getSchoolYearsForReports(),
    getReportsPage(params),
  ])

  return {
    schoolYears,
    ...pageData,
  }
}