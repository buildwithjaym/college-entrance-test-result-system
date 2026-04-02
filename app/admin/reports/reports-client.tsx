"use client"

import { useMemo, useState } from "react"
import { Download, FileText, Trophy } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { ReportRow, SchoolYearOption } from "./actions"
import { showError, showInfo, showSuccess } from "@/lib/toast"

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

function buildRankedRows(rows: ReportRow[]): RankedRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.overall_percentage !== a.overall_percentage) {
      return b.overall_percentage - a.overall_percentage
    }

    if (a.last_name !== b.last_name) {
      return a.last_name.localeCompare(b.last_name)
    }

    if (a.first_name !== b.first_name) {
      return a.first_name.localeCompare(b.first_name)
    }

    return a.applicant_id - b.applicant_id
  })

  let previousScore: number | null = null
  let previousRank = 0

  return sorted.map((row, index) => {
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
}

function formatReference(value: string | null) {
  return value?.trim() ? value : "—"
}

function formatDate(value: string | null) {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getRankTone(rank: number) {
  if (rank === 1) {
    return "bg-amber-50 text-amber-700"
  }
  if (rank === 2) {
    return "bg-slate-100 text-slate-700"
  }
  if (rank === 3) {
    return "bg-orange-50 text-orange-700"
  }
  return "bg-red-50 text-red-700"
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

  const selectedSchoolYear = useMemo(() => {
    return schoolYears.find((item) => item.id === selectedSchoolYearId) ?? null
  }, [schoolYears, selectedSchoolYearId])

  const filteredRows = useMemo(() => {
    if (!selectedSchoolYearId) {
      return []
    }

    return rows.filter((row) => row.school_year_id === selectedSchoolYearId)
  }, [rows, selectedSchoolYearId])

  const rankedRows = useMemo(() => {
    return buildRankedRows(filteredRows)
  }, [filteredRows])

  const topStudent = rankedRows[0] ?? null

  function handleDownloadPdf() {
    if (!selectedSchoolYear) {
      showError("Please select a school year.")
      return
    }

    if (rankedRows.length === 0) {
      showInfo("No report rows available for this school year.")
      return
    }

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
      doc.text("Basis: Overall Percentage", 14, 40)
      doc.text(`Generated Rows: ${rankedRows.length}`, 14, 46)

      autoTable(doc, {
        startY: 52,
        head: [["Rank", "Student Name", "Average"]],
        body: rankedRows.map((row) => [
          row.rank,
          row.full_name,
          `${row.overall_percentage.toFixed(2)}%`,
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: "middle",
        },
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 22, halign: "center" },
          1: { cellWidth: 120 },
          2: { cellWidth: 35, halign: "right" },
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

      showSuccess("PDF downloaded successfully.")
    } catch {
      showError("Failed to generate PDF.")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[280px_180px_220px]">
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
            <p className="mt-1 text-lg font-bold text-slate-900">
              {topStudent ? `${topStudent.overall_percentage.toFixed(2)}%` : "—"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.99]"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
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
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Rank
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Reference No.
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Family Name
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    First Name
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Middle Name
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Schedule
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Exam Date
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Average
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                    Status
                  </th>
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
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
          No ranked results found for this school year.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p>
            The table shows full admin details, while the PDF includes only the
            official ranking fields: <span className="font-medium text-slate-700">Rank</span>,{" "}
            <span className="font-medium text-slate-700">Student Name</span>, and{" "}
            <span className="font-medium text-slate-700">Average</span>.
          </p>
        </div>
      </div>
    </div>
  )
}