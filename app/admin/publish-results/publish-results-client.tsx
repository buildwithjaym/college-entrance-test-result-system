"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react"

import {
  createOrUpdateResult,
  searchApplicantsForPublishing,
  togglePublishResult,
  type ApplicantRow,
  type PaginatedApplicantRows,
  type ScheduleRow,
  type SchoolYearRow,
} from "./actions"

import {
  dismissToast,
  showError,
  showInfo,
  showLoading,
  showSuccess,
} from "@/lib/toast"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

function formatDate(date?: string | null) {
  if (!date) return "—"

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getQualification(score: number | null) {
  const safeScore = Number(score ?? 0)

  return safeScore >= 35
    ? {
        label: "Qualifier",
        className: "bg-green-50 text-green-700",
      }
    : {
        label: "Non-Qualifier",
        className: "bg-slate-100 text-slate-600",
      }
}

function ResultModal({
  open,
  onClose,
  applicant,
  schedules,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  applicant: ApplicantRow | null
  schedules: ScheduleRow[]
  onSaved: () => Promise<void>
}) {
  const [selectedScheduleId, setSelectedScheduleId] = useState("")
  const [overallPercentage, setOverallPercentage] = useState("")
  const [remarks, setRemarks] = useState("")
  const [publishNow, setPublishNow] = useState(true)
  const [isSubmitting, startSubmitting] = useTransition()

  useEffect(() => {
    if (!open || !applicant) return

    setSelectedScheduleId(schedules[0]?.id ? String(schedules[0].id) : "")
    setOverallPercentage(
      applicant.overall_percentage !== null
        ? String(applicant.overall_percentage)
        : "",
    )
    setRemarks("")
    setPublishNow(!applicant.has_result || applicant.is_published)
  }, [open, applicant, schedules])

  if (!open || !applicant) return null

  function handleSubmit() {
    if (!selectedScheduleId) {
      showError("Please select a test schedule.")
      return
    }

    if (overallPercentage.trim() === "") {
      showError("Please enter an overall percentage.")
      return
    }

    const score = Number(overallPercentage)

    if (!Number.isFinite(score) || score < 0 || score > 100) {
      showError("Overall percentage must be between 0 and 100.")
      return
    }

    const formData = new FormData()
    formData.append("applicant_id", String(applicant?.id ?? ""))
    formData.append("test_schedule_id", selectedScheduleId)
    formData.append("overall_percentage", String(score))
    formData.append("remarks", remarks)
    formData.append("publish_now", String(publishNow))

    const toastId = showLoading(
      publishNow ? "Saving and publishing result..." : "Saving result...",
    )

    startSubmitting(async () => {
      try {
        await createOrUpdateResult(formData)
        dismissToast(toastId)
        showSuccess(
          publishNow
            ? "Result saved and published successfully."
            : "Result saved successfully.",
        )
        await onSaved()
        onClose()
      } catch (error) {
        dismissToast(toastId)
        showError(
          error instanceof Error ? error.message : "Failed to save result.",
        )
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
              Result Entry
            </p>
            <h2 className="mt-1 truncate text-2xl font-bold text-slate-900">
              {applicant.full_name || "Unknown Applicant"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {applicant.reference_number || "No reference number"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[62vh] space-y-5 overflow-y-auto p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Test Schedule
              </label>
              <select
                value={selectedScheduleId}
                onChange={(event) => setSelectedScheduleId(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              >
                <option value="">Select schedule</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name} • {formatDate(schedule.exam_date)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Overall Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={overallPercentage}
                onChange={(event) => setOverallPercentage(event.target.value)}
                placeholder="Enter score"
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
              <p className="text-xs text-slate-500">
                35% and above = Qualifier. Below 35% = Non-Qualifier.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Remarks
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Optional remarks..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(event) => setPublishNow(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Publish immediately
              </p>
              <p className="text-xs text-slate-500">
                Turn this off if you only want to save the result first.
              </p>
            </div>
          </label>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {publishNow ? "Save & Publish" : "Save Result"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PublishResultsClient({
  schoolYears,
  schedules,
  activeSchoolYear,
  initialData,
}: {
  schoolYears: SchoolYearRow[]
  schedules: ScheduleRow[]
  activeSchoolYear: SchoolYearRow | null
  initialData: PaginatedApplicantRows
}) {
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<
    number | null
  >(activeSchoolYear?.id ?? schoolYears[0]?.id ?? null)

  const [query, setQuery] = useState("")
  const [rows, setRows] = useState<ApplicantRow[]>(initialData.rows)
  const [total, setTotal] = useState(initialData.total)
  const [page, setPage] = useState(initialData.page)
  const [pageSize, setPageSize] = useState(initialData.pageSize)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)

  const [selectedApplicant, setSelectedApplicant] =
    useState<ApplicantRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [isSearching, startSearching] = useTransition()
  const [isPublishing, startPublishing] = useTransition()

  const filteredSchedules = useMemo(() => {
    if (!selectedSchoolYearId) return schedules

    return schedules.filter(
      (schedule) =>
        Number(schedule.school_year_id) === Number(selectedSchoolYearId),
    )
  }, [schedules, selectedSchoolYearId])

  async function refreshRows({
    nextQuery = query,
    nextSchoolYearId = selectedSchoolYearId,
    nextPage = page,
    nextPageSize = pageSize,
  }: {
    nextQuery?: string
    nextSchoolYearId?: number | null
    nextPage?: number
    nextPageSize?: number
  } = {}) {
    const data = await searchApplicantsForPublishing({
      query: nextQuery,
      schoolYearId: nextSchoolYearId,
      page: nextPage,
      pageSize: nextPageSize,
    })

    setRows(data.rows)
    setTotal(data.total)
    setPage(data.page)
    setPageSize(data.pageSize)
    setTotalPages(data.totalPages)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      startSearching(async () => {
        try {
          await refreshRows({
            nextQuery: query,
            nextSchoolYearId: selectedSchoolYearId,
            nextPage: 1,
            nextPageSize: pageSize,
          })
        } catch (error) {
          showError(
            error instanceof Error
              ? error.message
              : "Failed to search applicants.",
          )
        }
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query, selectedSchoolYearId, pageSize])

  function handleOpenModal(applicant: ApplicantRow) {
    setSelectedApplicant(applicant)
    setModalOpen(true)
  }

  function handleTogglePublish(row: ApplicantRow) {
    if (!row.result_id) {
      showInfo("Add a result first.")
      return
    }

    const formData = new FormData()
    formData.append("result_id", String(row.result_id))
    formData.append("next_value", String(!row.is_published))

    const toastId = showLoading(
      row.is_published ? "Unpublishing result..." : "Publishing result...",
    )

    startPublishing(async () => {
      try {
        await togglePublishResult(formData)
        dismissToast(toastId)
        showSuccess(
          row.is_published
            ? "Result unpublished successfully."
            : "Result published successfully.",
        )
        await refreshRows()
      } catch (error) {
        dismissToast(toastId)
        showError(
          error instanceof Error
            ? error.message
            : "Failed to update result status.",
        )
      }
    })
  }

  const currentStart = rows.length > 0 ? (page - 1) * pageSize + 1 : 0
  const currentEnd = Math.min((page - 1) * pageSize + rows.length, total)

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Result Publishing Workspace
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Search, paginate, add results, and publish records without
                loading thousands of applicants at once.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[320px_220px]">
              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search applicant..."
                  className="h-11 w-full rounded-2xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedSchoolYearId ?? ""}
                  onChange={(event) =>
                    setSelectedSchoolYearId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                >
                  {schoolYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.label}
                      {year.is_active ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Applicants
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Showing {currentStart}-{currentEnd} of {total} applicants.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {isSearching ? (
                <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Page {page} of {totalPages}
                </div>
              )}

              <select
                value={pageSize}
                onChange={(event) => {
                  const nextPageSize = Number(event.target.value)

                  startSearching(async () => {
                    try {
                      await refreshRows({
                        nextPage: 1,
                        nextPageSize,
                      })
                    } catch (error) {
                      showError(
                        error instanceof Error
                          ? error.message
                          : "Failed to change page size.",
                      )
                    }
                  })
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rows.length > 0 ? (
            <>
              <div className="hidden overflow-x-auto xl:block">
                <table className="w-full min-w-[1080px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Applicant
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Reference No.
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Email
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Result
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Qualification
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Status
                      </th>
                      <th className="pb-4 text-sm font-semibold text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => {
                      const qualification = getQualification(
                        row.overall_percentage,
                      )

                      return (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 transition-colors duration-150 hover:bg-red-50/30"
                        >
                          <td className="py-4">
                            <p className="font-semibold text-slate-900">
                              {row.full_name || "Unknown Applicant"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Added {formatDate(row.created_at)}
                            </p>
                          </td>

                          <td className="py-4 text-sm text-slate-700">
                            {row.reference_number || "—"}
                          </td>

                          <td className="py-4 text-sm text-slate-500">
                            {row.email || "No email"}
                          </td>

                          <td className="py-4">
                            {row.has_result ? (
                              <div>
                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                  {row.overall_percentage}% score
                                </span>
                                <p className="mt-1 text-xs text-slate-500">
                                  {row.schedule_name || "Assigned schedule"}
                                </p>
                              </div>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                No result
                              </span>
                            )}
                          </td>

                          <td className="py-4">
                            {row.has_result ? (
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${qualification.className}`}
                              >
                                {qualification.label}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-4">
                            {row.has_result ? (
                              row.is_published ? (
                                <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                  Saved only
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenModal(row)}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-medium text-white transition hover:bg-red-700 active:scale-[0.99]"
                              >
                                <Plus className="h-4 w-4" />
                                {row.has_result ? "Edit" : "Add"}
                              </button>

                              {row.has_result ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(row)}
                                  disabled={isPublishing}
                                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                    row.is_published
                                      ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                      : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                  }`}
                                >
                                  {row.is_published ? (
                                    <>
                                      <EyeOff className="h-4 w-4" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4" />
                                      Publish
                                    </>
                                  )}
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 xl:hidden">
                {rows.map((row) => {
                  const qualification = getQualification(row.overall_percentage)

                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950">
                            {row.full_name || "Unknown Applicant"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.reference_number || "No reference"}
                          </p>
                        </div>

                        {row.has_result ? (
                          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            {row.overall_percentage}%
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold">Email:</span>{" "}
                          {row.email || "No email"}
                        </p>
                        <p>
                          <span className="font-semibold">Added:</span>{" "}
                          {formatDate(row.created_at)}
                        </p>
                        <p>
                          <span className="font-semibold">Schedule:</span>{" "}
                          {row.schedule_name || "—"}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {row.has_result ? (
                          <>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${qualification.className}`}
                            >
                              {qualification.label}
                            </span>

                            {row.is_published ? (
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                Published
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                Saved only
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                            No result
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(row)}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                          <Plus className="h-4 w-4" />
                          {row.has_result ? "Edit Result" : "Add Result"}
                        </button>

                        {row.has_result ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(row)}
                            disabled={isPublishing}
                            className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              row.is_published
                                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {row.is_published ? (
                              <>
                                <EyeOff className="h-4 w-4" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                Publish
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {currentStart}-{currentEnd} of {total}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startSearching(async () => {
                        await refreshRows({
                          nextPage: Math.max(1, page - 1),
                        })
                      })
                    }
                    disabled={page === 1 || isSearching}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      startSearching(async () => {
                        await refreshRows({
                          nextPage: Math.min(totalPages, page + 1),
                        })
                      })
                    }
                    disabled={page >= totalPages || isSearching}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              No applicants found for this search.
            </div>
          )}
        </section>
      </div>

      <ResultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        applicant={selectedApplicant}
        schedules={filteredSchedules}
        onSaved={async () => {
          await refreshRows()
        }}
      />
    </>
  )
}