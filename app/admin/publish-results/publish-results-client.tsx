"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import {
  CalendarDays,
  CheckCircle2,
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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
    if (!open || !applicant) {
      return
    }

    setSelectedScheduleId(schedules[0]?.id ? String(schedules[0].id) : "")
    setOverallPercentage(
      applicant.overall_percentage !== null
        ? String(applicant.overall_percentage)
        : ""
    )
    setRemarks("")
    setPublishNow(!applicant.has_result || applicant.is_published)
  }, [open, applicant, schedules])

  if (!open || !applicant) {
    return null
  }

  function handleSubmit() {
    const currentApplicant = applicant

    if (!currentApplicant) {
      showError("Please select an applicant.")
      return
    }

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
    formData.append("applicant_id", String(currentApplicant.id))
    formData.append("test_schedule_id", selectedScheduleId)
    formData.append("overall_percentage", String(score))
    formData.append("remarks", remarks)
    formData.append("publish_now", String(publishNow))

    const toastId = showLoading(
      publishNow ? "Saving and publishing result..." : "Saving result..."
    )

    startSubmitting(async () => {
      try {
        await createOrUpdateResult(formData)
        dismissToast(toastId)
        showSuccess(
          publishNow
            ? "Result saved and published successfully."
            : "Result saved successfully."
        )
        await onSaved()
        onClose()
      } catch (error) {
        dismissToast(toastId)
        showError(
          error instanceof Error ? error.message : "Failed to save result."
        )
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
              Add Result
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {applicant.full_name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {applicant.reference_number || "No reference number"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Test Schedule
              </label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
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
                onChange={(e) => setOverallPercentage(e.target.value)}
                placeholder="Enter score"
                className="h-11 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Remarks
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
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
  initialRows,
}: {
  schoolYears: SchoolYearRow[]
  schedules: ScheduleRow[]
  activeSchoolYear: SchoolYearRow | null
  initialRows: ApplicantRow[]
}) {
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<number | null>(
    activeSchoolYear?.id ?? schoolYears[0]?.id ?? null
  )
  const [query, setQuery] = useState("")
  const [rows, setRows] = useState<ApplicantRow[]>(initialRows)
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRow | null>(
    null
  )
  const [modalOpen, setModalOpen] = useState(false)

  const [isSearching, startSearching] = useTransition()
  const [isPublishing, startPublishing] = useTransition()

  const filteredSchedules = useMemo(() => {
    if (!selectedSchoolYearId) {
      return schedules
    }

    return schedules.filter(
      (schedule) => Number(schedule.school_year_id) === Number(selectedSchoolYearId)
    )
  }, [schedules, selectedSchoolYearId])

  async function refreshRows(
    nextQuery = query,
    nextSchoolYearId = selectedSchoolYearId
  ) {
    const data = await searchApplicantsForPublishing({
      query: nextQuery,
      schoolYearId: nextSchoolYearId,
      limit: 20,
    })
    setRows(data)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      startSearching(async () => {
        try {
          await refreshRows(query, selectedSchoolYearId)
        } catch (error) {
          showError(
            error instanceof Error ? error.message : "Failed to search applicants."
          )
        }
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query, selectedSchoolYearId])

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
      row.is_published ? "Unpublishing result..." : "Publishing result..."
    )

    startPublishing(async () => {
      try {
        await togglePublishResult(formData)
        dismissToast(toastId)
        showSuccess(
          row.is_published
            ? "Result unpublished successfully."
            : "Result published successfully."
        )
        await refreshRows()
      } catch (error) {
        dismissToast(toastId)
        showError(
          error instanceof Error
            ? error.message
            : "Failed to update result status."
        )
      }
    })
  }

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
                Minimal, fast, and focused on adding or publishing results.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative min-w-0 sm:w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search applicant..."
                  className="h-11 w-full rounded-2xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedSchoolYearId ?? ""}
                  onChange={(e) =>
                    setSelectedSchoolYearId(
                      e.target.value ? Number(e.target.value) : null
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
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Applicants</p>
              <p className="mt-1 text-sm text-slate-500">
                Search updates automatically after 0.3 seconds
              </p>
            </div>

            {isSearching ? (
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Searching...
              </div>
            ) : (
              <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {rows.length} record{rows.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
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
                      Status
                    </th>
                    <th className="pb-4 text-sm font-semibold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 transition-colors duration-150 hover:bg-red-50/30"
                    >
                      <td className="py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {row.full_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Added {formatDate(row.created_at)}
                          </p>
                        </div>
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
                            {row.has_result ? "Edit Result" : "Add Result"}
                          </button>

                          {row.has_result ? (
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(row)}
                              disabled={isPublishing}
                              className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition ${
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
                  ))}
                </tbody>
              </table>
            </div>
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