"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  Trophy,
  Users,
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import type {
  ReportRow,
  ReportSort,
  ReportStatus,
  SchoolYearOption,
} from "./actions"
import { showError, showInfo, showSuccess } from "@/lib/toast"

type ReportsClientProps = {
  schoolYears: SchoolYearOption[]
  rows: ReportRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  query: string
  selectedSchoolYearId: number | null
  status: ReportStatus
  sort: ReportSort
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

function buildPageHref({
  query,
  schoolYearId,
  status,
  sort,
  page,
  pageSize,
}: {
  query: string
  schoolYearId: number | null
  status: string
  sort: string
  page: number
  pageSize: number
}) {
  const params = new URLSearchParams()

  if (query) params.set("q", query)
  if (schoolYearId) params.set("schoolYearId", String(schoolYearId))
  if (status !== "published") params.set("status", status)
  if (sort !== "score_high") params.set("sort", sort)

  params.set("page", String(page))
  params.set("pageSize", String(pageSize))

  return `/admin/reports?${params.toString()}`
}

function formatName(row: ReportRow) {
  return [row.first_name, row.middle_name, row.last_name]
    .filter(Boolean)
    .join(" ")
}

function formatDate(date?: string | null) {
  if (!date) return "—"

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getQualification(score: number) {
  return score >= 35
    ? {
        label: "Qualifier",
        className: "bg-green-50 text-green-700 ring-green-100",
      }
    : {
        label: "Non-Qualifier",
        className: "bg-slate-100 text-slate-600 ring-slate-200",
      }
}

function getStatusLabel(status: ReportStatus) {
  if (status === "published") return "Released only"
  if (status === "pending") return "Pending only"
  return "All statuses"
}

function getSortLabel(sort: ReportSort) {
  const labels: Record<ReportSort, string> = {
    score_high: "Highest score",
    score_low: "Lowest score",
    name_asc: "Name A-Z",
    name_desc: "Name Z-A",
    exam_newest: "Newest exam",
    exam_oldest: "Oldest exam",
  }

  return labels[sort]
}

export function ReportsClient({
  schoolYears,
  rows,
  total,
  page,
  pageSize,
  totalPages,
  query,
  selectedSchoolYearId,
  status,
  sort,
}: ReportsClientProps) {
  const [downloading, setDownloading] = useState(false)

  const selectedSchoolYear = useMemo(() => {
    return schoolYears.find((item) => item.id === selectedSchoolYearId) ?? null
  }, [schoolYears, selectedSchoolYearId])

  const topScore = useMemo(() => {
    if (rows.length === 0) return 0
    return Math.max(...rows.map((row) => row.overall_percentage))
  }, [rows])

  const qualifiers = useMemo(() => {
    return rows.filter((row) => row.overall_percentage >= 35).length
  }, [rows])

  const nonQualifiers = useMemo(() => {
    return rows.filter((row) => row.overall_percentage < 35).length
  }, [rows])

  const averageScore = useMemo(() => {
    if (rows.length === 0) return 0

    const totalScore = rows.reduce(
      (sum, row) => sum + row.overall_percentage,
      0,
    )

    return Math.round(totalScore / rows.length)
  }, [rows])

  const currentStart = rows.length > 0 ? (page - 1) * pageSize + 1 : 0

  const currentEnd = Math.min((page - 1) * pageSize + rows.length, total)

  const hasFilters =
    Boolean(query) ||
    Boolean(selectedSchoolYearId) ||
    status !== "published" ||
    sort !== "score_high" ||
    pageSize !== 20

  const previousHref = buildPageHref({
    query,
    schoolYearId: selectedSchoolYearId,
    status,
    sort,
    page: Math.max(1, page - 1),
    pageSize,
  })

  const nextHref = buildPageHref({
    query,
    schoolYearId: selectedSchoolYearId,
    status,
    sort,
    page: Math.min(totalPages, page + 1),
    pageSize,
  })

  async function handleDownloadPdf() {
    if (rows.length === 0) {
      showInfo("No report rows available for the current filter.")
      return
    }

    setDownloading(true)
    showInfo("Preparing ranking PDF...")

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const title = "College Entrance Test Ranking Report"
      const yearLabel = selectedSchoolYear?.label ?? "All School Years"

      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("Basilan State College", 105, 16, { align: "center" })

      doc.setFontSize(13)
      doc.text(title, 105, 24, { align: "center" })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`School Year: ${yearLabel}`, 14, 36)
      doc.text(`Status: ${getStatusLabel(status)}`, 14, 42)
      doc.text(`Sort: ${getSortLabel(sort)}`, 14, 48)
      doc.text(`Page: ${page} of ${totalPages}`, 14, 54)
      doc.text(`Rows in PDF: ${rows.length}`, 14, 60)

      autoTable(doc, {
        startY: 68,
        head: [
          [
            "Rank",
            "Reference No.",
            "Student Name",
            "School Year",
            "Average",
            "Qualification",
            "Status",
          ],
        ],
        body: rows.map((row, index) => [
          `#${(page - 1) * pageSize + index + 1}`,
          row.reference_number || "—",
          formatName(row),
          row.school_year_label,
          `${row.overall_percentage.toFixed(2)}%`,
          row.overall_percentage >= 35 ? "Qualifier" : "Non-Qualifier",
          row.is_published ? "Released" : "Pending",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          valign: "middle",
        },
        headStyles: {
          fillColor: [185, 28, 28],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: {
          top: 12,
          right: 10,
          bottom: 14,
          left: 10,
        },
      })

      const filename = `cet-ranking-report-${yearLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "all-years"}.pdf`

      doc.save(filename)
      showSuccess("Ranking PDF downloaded successfully.")
    } catch {
      showError("Failed to generate PDF report.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Records on Page</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {rows.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Average Score</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {averageScore}%
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Qualifiers</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {qualifiers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Top Score</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {topScore}%
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-base font-bold text-slate-950">
                Filter Ranking Reports
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Narrow the report by keyword, school year, release status, score
                order, and page size.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hasFilters ? (
                <Link
                  href="/admin/reports"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Link>
              ) : null}

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          <form method="GET">
            <input type="hidden" name="page" value="1" />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_160px_170px_140px_120px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search student, email, reference no..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>

              <select
                name="schoolYearId"
                defaultValue={selectedSchoolYearId ?? ""}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                <option value="">All School Years</option>

                {schoolYears.map((schoolYear) => (
                  <option key={schoolYear.id} value={schoolYear.id}>
                    {schoolYear.label}
                    {schoolYear.is_active ? " (Active)" : ""}
                  </option>
                ))}
              </select>

              <select
                name="status"
                defaultValue={status}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                <option value="published">Released Only</option>
                <option value="pending">Pending Only</option>
                <option value="all">All Status</option>
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                <option value="score_high">Highest Score</option>
                <option value="score_low">Lowest Score</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="exam_newest">Newest Exam</option>
                <option value="exam_oldest">Oldest Exam</option>
              </select>

              <select
                name="pageSize"
                defaultValue={String(pageSize)}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
              >
                <Filter className="h-4 w-4" />
                Apply
              </button>
            </div>
          </form>

          {hasFilters ? (
            <div className="flex flex-wrap gap-2">
              {query ? (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                  Search: “{query}”
                </span>
              ) : null}

              {selectedSchoolYear ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {selectedSchoolYear.label}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  All school years
                </span>
              )}

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {getStatusLabel(status)}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {getSortLabel(sort)}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {pageSize} per page
              </span>
            </div>
          ) : null}

          {query && rows.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              No report record matched “
              <span className="font-semibold">{query}</span>”. Try a shorter
              keyword, reference number, email address, or schedule name.
            </div>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-bold text-slate-950">
                Ranking Records
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Showing {currentStart}-{currentEnd} of {total} records
              </p>
            </div>

            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>

        {rows.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1200px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    {[
                      "Rank",
                      "Student",
                      "Reference No.",
                      "School Year",
                      "Schedule",
                      "Exam Date",
                      "Score",
                      "Qualification",
                      "Status",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-5 py-4 text-sm font-semibold text-slate-500"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => {
                    const qualification = getQualification(
                      row.overall_percentage,
                    )

                    return (
                      <tr
                        key={row.result_id}
                        className="border-b border-slate-100 transition hover:bg-red-50/40"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                            #{(page - 1) * pageSize + index + 1}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">
                            {formatName(row)}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {row.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {row.reference_number || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {row.school_year_label}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {row.schedule_name || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(row.exam_date)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                            {row.overall_percentage}%
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${qualification.className}`}
                          >
                            {qualification.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {row.is_published ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-green-100">
                              Released
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
                              Hidden
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 lg:hidden">
              {rows.map((row, index) => {
                const qualification = getQualification(
                  row.overall_percentage,
                )

                return (
                  <div
                    key={row.result_id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-950">
                          {formatName(row)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {row.reference_number || "No reference"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                        #{(page - 1) * pageSize + index + 1}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold">Score:</span>{" "}
                        {row.overall_percentage}%
                      </p>

                      <p>
                        <span className="font-semibold">Schedule:</span>{" "}
                        {row.schedule_name || "—"}
                      </p>

                      <p>
                        <span className="font-semibold">School Year:</span>{" "}
                        {row.school_year_label}
                      </p>

                      <p>
                        <span className="font-semibold">Exam Date:</span>{" "}
                        {formatDate(row.exam_date)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${qualification.className}`}
                      >
                        {qualification.label}
                      </span>

                      {row.is_published ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          Released
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-slate-200 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {currentStart}-{currentEnd} of {total}
                </p>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <Link
                    href={previousHref}
                    className={
                      page <= 1
                        ? "pointer-events-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
                        : "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>

                  <Link
                    href={nextHref}
                    className={
                      page >= totalPages
                        ? "pointer-events-none inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
                        : "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileText className="h-5 w-5" />
            </div>

            <p className="mt-4 font-semibold text-slate-800">
              No report records found
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try changing your keyword, school year, release status, or sorting
              preference.
            </p>

            {hasFilters ? (
              <Link
                href="/admin/reports"
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                <RotateCcw className="h-4 w-4" />
                Reset filters
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}