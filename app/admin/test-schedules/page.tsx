import {
  CalendarDays,
  Clock3,
  Plus,
  School,
  NotebookText,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createTestSchedule } from "./actions"

type SchoolYearRow = {
  id: number
  label: string
  is_active: boolean
}

type ScheduleRow = {
  id: number
  name: string
  exam_date: string
  notes: string | null
  created_at: string
  school_years:
    | {
        id: number
        label: string
      }
    | {
        id: number
        label: string
      }[]
    | null
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

function getSchoolYearLabel(schedule: ScheduleRow) {
  const schoolYear = Array.isArray(schedule.school_years)
    ? schedule.school_years[0]
    : schedule.school_years

  return schoolYear?.label ?? "Unknown"
}

export default async function TestSchedulesPage() {
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
          name,
          exam_date,
          notes,
          created_at,
          school_years (
            id,
            label
          )
        `
      )
      .order("exam_date", { ascending: false }),
  ])

  if (schoolYearsError) {
    throw new Error(schoolYearsError.message)
  }

  if (schedulesError) {
    throw new Error(schedulesError.message)
  }

  const safeSchoolYears: SchoolYearRow[] = schoolYears ?? []
  const safeSchedules: ScheduleRow[] = schedules ?? []

  const activeSchoolYear =
    safeSchoolYears.find((item) => item.is_active) ?? null

  const totalSchedules = safeSchedules.length
  const latestSchedule = safeSchedules[0] ?? null

  const upcomingSchedules = [...safeSchedules]
    .sort(
      (a, b) =>
        new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
    )
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary ring-1 ring-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Result Operations
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
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

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
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
                <p className="text-sm text-muted-foreground">Active School Year</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {activeSchoolYear?.label ?? "Not set"}
                </p>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                <p className="text-sm text-muted-foreground">Total Schedules</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {totalSchedules}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/10 bg-white p-5">
              <p className="text-sm text-muted-foreground">Latest Exam Schedule</p>
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

          <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
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

                      <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/10">
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

        <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Create Schedule
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Add a new exam schedule
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Link each schedule to a school year and assign the official exam
              date.
            </p>
          </div>

          <form action={createTestSchedule} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="school_year_id"
                className="text-sm font-medium text-foreground"
              >
                School Year
              </label>
              <select
                id="school_year_id"
                name="school_year_id"
                required
                defaultValue={activeSchoolYear?.id ?? ""}
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>
                  Select school year
                </option>
                {safeSchoolYears.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                    {item.is_active ? " (Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Schedule Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Main Batch A"
                required
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="exam_date"
                className="text-sm font-medium text-foreground"
              >
                Exam Date
              </label>
              <input
                id="exam_date"
                name="exam_date"
                type="date"
                required
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Add schedule notes or reminders..."
                className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Test Schedule
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
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

        {safeSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
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
                </tr>
              </thead>
              <tbody>
                {safeSchedules.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-primary/5 last:border-b-0"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Clock3 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-sm text-foreground">
                      {getSchoolYearLabel(item)}
                    </td>

                    <td className="py-4 text-sm text-muted-foreground">
                      {formatShortDate(item.exam_date)}
                    </td>

                    <td className="py-4 text-sm text-muted-foreground">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-10 text-center text-sm text-muted-foreground">
            No test schedules have been added yet.
          </div>
        )}
      </section>
    </div>
  )
}