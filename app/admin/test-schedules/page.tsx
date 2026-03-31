import { CalendarDays, Clock3, Plus, School } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createTestSchedule } from "./actions"

export default async function TestSchedulesPage() {
  const supabase = await createClient()

  const [{ data: schoolYears, error: schoolYearsError }, { data: schedules, error: schedulesError }] =
    await Promise.all([
      supabase
        .from("school_years")
        .select("id, label, is_active")
        .order("created_at", { ascending: false }),
      supabase
        .from("test_schedules")
        .select(`
          id,
          name,
          exam_date,
          notes,
          created_at,
          school_years (
            id,
            label
          )
        `)
        .order("exam_date", { ascending: false }),
    ])

  if (schoolYearsError) {
    throw new Error(schoolYearsError.message)
  }

  if (schedulesError) {
    throw new Error(schedulesError.message)
  }

  const activeSchoolYear =
    schoolYears?.find((item) => item.is_active) ?? null

  const totalSchedules = schedules?.length ?? 0
  const latestSchedule = schedules?.[0] ?? null

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Result Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Test Schedules
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Manage exam schedules by school year so applicant results can be
          organized, published, and downloaded correctly.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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
                ? new Date(latestSchedule.exam_date).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Add your first schedule to continue"}
            </p>
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
              Link each schedule to a school year and assign the official exam date.
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
                {schoolYears?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                    {item.is_active ? " (Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
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
              <label
                htmlFor="notes"
                className="text-sm font-medium text-foreground"
              >
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
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Records
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            Existing schedules
          </h2>
        </div>

        {schedules && schedules.length > 0 ? (
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
                {schedules.map((item) => {
                  const schoolYear = Array.isArray(item.school_years)
                    ? item.school_years[0]
                    : item.school_years

                  return (
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
                            <p className="font-medium text-foreground">
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 text-sm text-foreground">
                        {schoolYear?.label ?? "Unknown"}
                      </td>

                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(item.exam_date).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-4 text-sm text-muted-foreground">
                        {item.notes ? item.notes : "—"}
                      </td>
                    </tr>
                  )
                })}
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