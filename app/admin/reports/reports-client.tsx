"use client"

import { useMemo, useState } from "react"
import {
  ArrowDownAZ,
  CalendarDays,
  Download,
  FileText,
  Filter,
  Trophy,
} from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import type { ReportRow, SchoolYearOption } from "./actions"
import { showError, showInfo, showSuccess } from "@/lib/toast"

type SortBy =
  | "score_high"
  | "score_low"
  | "name_asc"
  | "name_desc"
  | "exam_newest"
  | "exam_oldest"

type StatusFilter = "all" | "published" | "pending"

type RankedRow = ReportRow & {
  rank: number
  full_name: string
}

function getInitialSchoolYearId(schoolYears: SchoolYearOption[]) {
  const active = schoolYears.find((item) => item.is_active)
  return active?.id ?? schoolYears[0]?.id ?? null
}

function buildFullName(row: ReportRow) {
  const middle = row.middle_name?.trim() ? ` ${row.middle_name.trim()}` : ""
  return `${row.last_name}, ${row.first_name}${middle}`
}

function formatReference(value: string | null) {
  return value?.trim() ? value : "—"
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getRankTone(rank: number) {
  if (rank === 1) return "bg-amber-50 text-amber-700"
  if (rank === 2) return "bg-slate-100 text-slate-700"
  if (rank === 3) return "bg-orange-50 text-orange-700"
  return "bg-red-50 text-red-700"
}

function buildRankedRows(rows: ReportRow[], sortBy: SortBy): RankedRow[] {
  const rankedBase = [...rows].sort((a, b) => {
    if (b.overall_percentage !== a.overall_percentage) {
      return b.overall_percentage - a.overall_percentage
    }

    const last = a.last_name.localeCompare(b.last_name)
    if (last !== 0) return last

    const first = a.first_name.localeCompare(b.first_name)
    if (first !== 0) return first

    return a.applicant_id - b.applicant_id
  })

  let previousScore: number | null = null
  let previousRank = 0

  const ranked = rankedBase.map((row, index) => {
    const rank =
      previousScore !== null && row.overall_percentage === previousScore
        ? previousRank
        : index + 1

    previousScore = row.overall_percentage
    previousRank = rank

    return {
      ...row,
      rank,
      full_name: buildFullName(row),
    }
  })

  return ranked.sort((a, b) => {
    if (sortBy === "score_high") return b.overall_percentage - a.overall_percentage
    if (sortBy === "score_low") return a.overall_percentage - b.overall_percentage
    if (sortBy === "name_asc") return a.full_name.localeCompare(b.full_name)
    if (sortBy === "name_desc") return b.full_name.localeCompare(a.full_name)

    if (sortBy === "exam_newest") {
      return (
        new Date(b.exam_date ?? 0).getTime() -
        new Date(a.exam_date ?? 0).getTime()
      )
    }

    if (sortBy === "exam_oldest") {
      return (
        new Date(a.exam_date ?? 0).getTime() -
        new Date(b.exam_date ?? 0).getTime()
      )
    }

    return 0
  })
}

export function ReportsClient({
  schoolYears,
  rows,
}: {
  schoolYears: SchoolYearOption[]
  rows: ReportRow[]
}) {
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<number | null>(
    getInitialSchoolYearId(schoolYears)
  )
  const [sortBy, setSortBy] = useState<SortBy>("score_high")
  const [status, setStatus] = useState<StatusFilter>("published")
  const [downloading, setDownloading] = useState(false)

  const selectedSchoolYear = useMemo(() => {
    return schoolYears.find((item) => item.id === selectedSchoolYearId) ?? null
  }, [schoolYears, selectedSchoolYearId])

  const filteredRows = useMemo(() => {
    if (!selectedSchoolYearId) return []

    return rows.filter((row) => {
      const matchesSchoolYear = row.school_year_id === selectedSchoolYearId
      const matchesStatus =
        status === "all"
          ? true
          : status === "published"
            ? row.is_published
            : !row.is_published

      return matchesSchoolYear && matchesStatus
    })
  }, [rows, selectedSchoolYearId, status])

  const rankedRows = useMemo(() => {
    return buildRankedRows(filteredRows, sortBy)
  }, [filteredRows, sortBy])

  const topStudent = useMemo(() => {
    return buildRankedRows(filteredRows, "score_high")[0] ?? null
  }, [filteredRows])

  const averageScore =
    rankedRows.length > 0
      ? rankedRows.reduce((sum, row) => sum + row.overall_percentage, 0) /
        rankedRows.length
      : 0

  async function handleDownloadPdf() {
    if (!selectedSchoolYear) {
      showError("Please select a school year.")
      return
    }

    if (rankedRows.length === 0) {
      showInfo("No report rows available for this filter.")
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

      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("Basilan State College", 105, 16, { align: "center" })

      doc.setFontSize(13)
      doc.text("College Entrance Test Ranking Report", 105, 23, {
        align: "center",
      })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`School Year: ${selectedSchoolYear.label}`, 14, 34)
      doc.text(`Status: ${status.toUpperCase()}`, 14, 40)
      doc.text(`Sort: ${sortBy.replace("_", " ").toUpperCase()}`, 14, 46)
      doc.text(`Generated Rows: ${rankedRows.length}`, 14, 52)

      autoTable(doc, {
        startY: 58,
        head: [["Rank", "Reference No.", "Student Name", "Average", "Status"]],
        body: rankedRows.map((row) => [
          row.rank,
          formatReference(row.reference_number),
          row.full_name,
          `${row.overall_percentage.toFixed(2)}%`,
          row.is_published ? "Published" : "Pending",
        ]),
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          valign: "middle",
        },
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 18, halign: "center" },
          1: { cellWidth: 42 },
          2: { cellWidth: 75 },
          3: { cellWidth: 28, halign: "right" },
          4: { cellWidth: 28 },
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

      doc.save(
        `ranking-report-${selectedSchoolYear.label.replace(/\s+/g, "-")}.pdf`
      )

      showSuccess("Ranking PDF downloaded successfully.")
    } catch {
      showError("Failed to generate PDF.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,320px)_180px_220px_1fr] lg:items-end">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            School Year
          </label>
          <select
            value={selectedSchoolYearId ?? ""}
            onChange={(e) =>
              setSelectedSchoolYearId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
          >
            {schoolYears.map((schoolYear) => (
              <option key={schoolYear.id} value={schoolYear.id}>
                {schoolYear.label}
                {schoolYear.is_active ? " (Active)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
          >
            <option value="score_high">Highest Average</option>
            <option value="score_low">Lowest Average</option>
            <option value="name_asc">Student Name A-Z</option>
            <option value="name_desc">Student Name Z-A</option>
            <option value="exam_newest">Newest Exam Date</option>
            <option value="exam_oldest">Oldest Exam Date</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 lg:justify-self-end"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Preparing PDF..." : "Download PDF"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Ranked Students
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {rankedRows.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Top Average
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {topStudent ? `${topStudent.overall_percentage.toFixed(2)}%` : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Average Score
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {rankedRows.length ? `${averageScore.toFixed(2)}%` : "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Report Filter
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-900">
            {status === "all"
              ? "All Results"
              : status === "published"
                ? "Published Results"
                : "Pending Results"}
          </p>
        </div>
      </div>

      {topStudent ? (
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Trophy className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                Top Ranked Student
              </p>
              <p className="mt-1 truncate text-lg font-bold text-slate-900">
                {topStudent.full_name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Average: {topStudent.overall_percentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {rankedRows.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Rank",
                      "Reference No.",
                      "Family Name",
                      "First Name",
                      "Middle Name",
                      "Schedule",
                      "Exam Date",
                      "Average",
                      "Status",
                    ].map((head) => (
                      <th
                        key={head}
                        className="px-4 py-4 text-sm font-semibold text-slate-500"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rankedRows.map((row) => (
                    <tr
                      key={row.result_id}
                      className="border-t border-slate-100 transition-colors hover:bg-red-50/20"
                    >
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex min-w-[48px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getRankTone(
                            row.rank
                          )}`}
                        >
                          #{row.rank}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {formatReference(row.reference_number)}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {row.last_name}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {row.first_name}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {row.middle_name?.trim() || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {row.schedule_name ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(row.exam_date)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {row.overall_percentage.toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {row.is_published ? (
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-3 lg:hidden">
            {rankedRows.map((row) => (
              <div
                key={row.result_id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">
                      {row.full_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatReference(row.reference_number)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getRankTone(
                      row.rank
                    )}`}
                  >
                    #{row.rank}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold">Schedule:</span>{" "}
                    {row.schedule_name ?? "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Exam Date:</span>{" "}
                    {formatDate(row.exam_date)}
                  </p>
                  <p>
                    <span className="font-semibold">Average:</span>{" "}
                    {row.overall_percentage.toFixed(2)}%
                  </p>
                </div>

                <div className="mt-4">
                  {row.is_published ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <ArrowDownAZ className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-700">
            No ranked results found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try changing the school year, status filter, or sorting option.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p>
            The screen shows full admin ranking details, while the PDF is
            generated from the currently selected school year, status, and sort
            option.
          </p>
        </div>
      </div>
    </div>
  )
}