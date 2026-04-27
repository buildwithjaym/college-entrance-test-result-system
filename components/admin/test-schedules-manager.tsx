"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  NotebookText,
  Plus,
  School,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react"

import type {
  ScheduleRow,
  SchoolYearRow,
} from "@/app/admin/test-schedules/page"
import {
  createTestSchedule,
  deleteTestSchedule,
  updateTestSchedule,
} from "@/app/admin/test-schedules/actions"

type ToastState = {
  type: "success" | "error"
  message: string
} | null

type ScheduleFormState = {
  id?: number
  school_year_id: string
  name: string
  exam_date: string
  notes: string
}

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getSchoolYear(schedule: ScheduleRow) {
  return Array.isArray(schedule.school_years)
    ? schedule.school_years[0] ?? null
    : schedule.school_years
}

function getSchoolYearLabel(schedule: ScheduleRow) {
  return getSchoolYear(schedule)?.label ?? "Unknown"
}

function getSchoolYearId(schedule: ScheduleRow) {
  return getSchoolYear(schedule)?.id ?? null
}

function getInitialFormState(activeSchoolYearId?: number | null): ScheduleFormState {
  return {
    school_year_id: activeSchoolYearId ? String(activeSchoolYearId) : "",
    name: "",
    exam_date: "",
    notes: "",
  }
}

function buildFormData(values: ScheduleFormState) {
  const formData = new FormData()

  if (values.id) {
    formData.set("id", String(values.id))
  }

  formData.set("school_year_id", values.school_year_id)
  formData.set("name", values.name)
  formData.set("exam_date", values.exam_date)
  formData.set("notes", values.notes)

  return formData
}

function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null

  return (
    <div className="fixed bottom-5 right-5 z-[70] w-[calc(100%-2.5rem)] max-w-sm">
      <div
        className={
          toast.type === "success"
            ? "flex items-start gap-3 rounded-2xl border border-green-200 bg-white p-4 text-green-800 shadow-2xl"
            : "flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 text-red-800 shadow-2xl"
        }
      >
        {toast.type === "success" ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
        )}

        <div>
          <p className="text-sm font-bold">
            {toast.type === "success" ? "Success" : "Action failed"}
          </p>
          <p className="mt-1 text-sm">{toast.message}</p>
        </div>
      </div>
    </div>
  )
}

function ScheduleModal({
  mode,
  open,
  values,
  schoolYears,
  isPending,
  onClose,
  onChange,
  onSubmit,
}: {
  mode: "create" | "edit"
  open: boolean
  values: ScheduleFormState
  schoolYears: SchoolYearRow[]
  isPending: boolean
  onClose: () => void
  onChange: (values: ScheduleFormState) => void
  onSubmit: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-slate-950">
              {mode === "create" ? "Create test schedule" : "Edit test schedule"}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Set the school year, schedule name, official exam date, and notes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              School Year
            </label>
            <select
              value={values.school_year_id}
              onChange={(event) =>
                onChange({
                  ...values,
                  school_year_id: event.target.value,
                })
              }
              disabled={isPending}
              className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              <option value="" disabled>
                Select school year
              </option>
              {schoolYears.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.is_active ? " (Active)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              Schedule Name
            </label>
            <input
              type="text"
              value={values.name}
              onChange={(event) =>
                onChange({
                  ...values,
                  name: event.target.value,
                })
              }
              disabled={isPending}
              placeholder="e.g. Batch 1"
              className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              Exam Date
            </label>
            <input
              type="date"
              value={values.exam_date}
              onChange={(event) =>
                onChange({
                  ...values,
                  exam_date: event.target.value,
                })
              }
              disabled={isPending}
              className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">
              Notes <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={values.notes}
              onChange={(event) =>
                onChange({
                  ...values,
                  notes: event.target.value,
                })
              }
              disabled={isPending}
              placeholder="Add schedule notes or reminders..."
              className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === "create" ? (
              <>
                <Plus className="h-4 w-4" />
                Create schedule
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({
  open,
  schedule,
  isPending,
  onClose,
  onConfirm,
}: {
  open: boolean
  schedule: ScheduleRow | null
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open || !schedule) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-slate-950">
              Delete test schedule?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will remove <span className="font-semibold">{schedule.name}</span>.
              This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          If this schedule is already linked to result records, deletion will be
          blocked for data safety.
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TestSchedulesManager({
  schoolYears,
  schedules,
}: {
  schoolYears: SchoolYearRow[]
  schedules: ScheduleRow[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<ToastState>(null)

  const activeSchoolYear = schoolYears.find((item) => item.is_active) ?? null
  const totalSchedules = schedules.length
  const latestSchedule = schedules[0] ?? null

  const upcomingSchedules = useMemo(() => {
    const now = new Date()

    return [...schedules]
      .filter((item) => new Date(item.exam_date).getTime() >= now.getTime())
      .sort(
        (a, b) =>
          new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
      )
      .slice(0, 3)
  }, [schedules])

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [formValues, setFormValues] = useState<ScheduleFormState>(
    getInitialFormState(activeSchoolYear?.id)
  )

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleRow | null>(
    null
  )

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    window.setTimeout(() => setToast(null), 3500)
  }

  function openCreateModal() {
    setModalMode("create")
    setFormValues(getInitialFormState(activeSchoolYear?.id))
    setModalOpen(true)
  }

  function openEditModal(schedule: ScheduleRow) {
    setModalMode("edit")
    setFormValues({
      id: schedule.id,
      school_year_id: String(getSchoolYearId(schedule) ?? ""),
      name: schedule.name,
      exam_date: schedule.exam_date,
      notes: schedule.notes ?? "",
    })
    setModalOpen(true)
  }

  function openDeleteModal(schedule: ScheduleRow) {
    setSelectedSchedule(schedule)
    setDeleteOpen(true)
  }

  function closeModals() {
    if (isPending) return
    setModalOpen(false)
    setDeleteOpen(false)
    setSelectedSchedule(null)
  }

  function handleSubmitSchedule() {
    startTransition(async () => {
      const action =
        modalMode === "create" ? createTestSchedule : updateTestSchedule

      const result = await action(buildFormData(formValues))

      showToast(result.ok ? "success" : "error", result.message)

      if (result.ok) {
        setModalOpen(false)
        router.refresh()
      }
    })
  }

  function handleConfirmDelete() {
    if (!selectedSchedule) return

    startTransition(async () => {
      const formData = new FormData()
      formData.set("id", String(selectedSchedule.id))

      const result = await deleteTestSchedule(formData)

      showToast(result.ok ? "success" : "error", result.message)

      if (result.ok) {
        setDeleteOpen(false)
        setSelectedSchedule(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-6">
        <section className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 shadow-sm sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary ring-1 ring-primary/10">
                <Sparkles className="h-3.5 w-3.5" />
                Result Operations
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Test Schedules
              </h1>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Manage exam schedules by school year so applicant results can be
                organized, published, and downloaded correctly.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
              <div className="rounded-2xl border border-primary/10 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Active School Year
                </p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {activeSchoolYear?.label ?? "Not set"}
                </p>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Total Schedules
                </p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {totalSchedules}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Overview
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">
                    Schedule Status
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <p className="text-sm text-muted-foreground">
                    Active School Year
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {activeSchoolYear?.label ?? "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <p className="text-sm text-muted-foreground">
                    Total Schedules
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {totalSchedules}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-primary/10 bg-white p-5">
                <p className="text-sm text-muted-foreground">
                  Latest Exam Schedule
                </p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {latestSchedule?.name ?? "No schedules yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {latestSchedule?.exam_date
                    ? formatLongDate(latestSchedule.exam_date)
                    : "Add your first schedule to continue"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Upcoming
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">
                    Next schedules
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <School className="h-5 w-5" />
                </div>
              </div>

              {upcomingSchedules.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSchedules.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-primary/10 bg-primary/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getSchoolYearLabel(item)}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/10">
                          {formatShortDate(item.exam_date)}
                        </div>
                      </div>

                      {item.notes ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {item.notes}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-10 text-center text-sm text-muted-foreground">
                  No upcoming schedules available.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-sm sm:rounded-3xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Schedule CRUD
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  Manage exam schedules
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create, edit, and delete schedules through safe modal actions.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Schedule
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <p className="font-semibold text-foreground">
                Safer schedule management
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Schedules connected to result records are protected from
                accidental deletion.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Records
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                Existing schedules
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <NotebookText className="h-5 w-5" />
            </div>
          </div>

          {schedules.length > 0 ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-primary/10">
                      <th className="pb-4 text-sm font-semibold text-muted-foreground">
                        Schedule Name
                      </th>
                      <th className="pb-4 text-sm font-semibold text-muted-foreground">
                        School Year
                      </th>
                      <th className="pb-4 text-sm font-semibold text-muted-foreground">
                        Exam Date
                      </th>
                      <th className="pb-4 text-sm font-semibold text-muted-foreground">
                        Notes
                      </th>
                      <th className="pb-4 text-sm font-semibold text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {schedules.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-primary/5 last:border-b-0"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <Clock3 className="h-4 w-4" />
                            </div>
                            <p className="font-medium text-foreground">
                              {item.name}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 text-sm text-foreground">
                          {getSchoolYearLabel(item)}
                        </td>

                        <td className="py-4 text-sm text-muted-foreground">
                          {formatShortDate(item.exam_date)}
                        </td>

                        <td className="max-w-[260px] truncate py-4 text-sm text-muted-foreground">
                          {item.notes || "—"}
                        </td>

                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(item)}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 lg:hidden">
                {schedules.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-primary/10 bg-primary/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {getSchoolYearLabel(item)}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/10">
                        {formatShortDate(item.exam_date)}
                      </div>
                    </div>

                    {item.notes ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {item.notes}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(item)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-10 text-center text-sm text-muted-foreground">
              No test schedules have been added yet.
            </div>
          )}
        </section>
      </div>

      <ScheduleModal
        mode={modalMode}
        open={modalOpen}
        values={formValues}
        schoolYears={schoolYears}
        isPending={isPending}
        onClose={closeModals}
        onChange={setFormValues}
        onSubmit={handleSubmitSchedule}
      />

      <DeleteModal
        open={deleteOpen}
        schedule={selectedSchedule}
        isPending={isPending}
        onClose={closeModals}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} />
    </>
  )
}