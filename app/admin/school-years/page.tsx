import { CalendarRange, CheckCircle2, Plus, School } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createSchoolYear, setActiveSchoolYear } from "./actions"

export default async function SchoolYearsPage() {
  const supabase = await createClient()

  const { data: schoolYears, error } = await supabase
    .from("school_years")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const activeSchoolYear =
    schoolYears?.find((item) => item.is_active) ?? null

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Setup
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          School Years
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Manage admission cycles and set the active school year used across
          schedules, applicants, results, and publishing workflows.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Current Status
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">
                Active School Year
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Current active cycle</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {activeSchoolYear?.label ?? "Not set"}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Only one school year should be active at a time for a clean and
              organized admissions workflow.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/10 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <School className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Total School Years
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {schoolYears?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Ready for Schedules
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {activeSchoolYear ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Create School Year
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Add a new admission cycle
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Example format: <span className="font-medium">2025-2026</span>
            </p>
          </div>

          <form action={createSchoolYear} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="label"
                className="text-sm font-medium text-foreground"
              >
                School Year Label
              </label>
              <input
                id="label"
                name="label"
                type="text"
                placeholder="e.g. 2025-2026"
                required
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add School Year
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
            Existing school years
          </h2>
        </div>

        {schoolYears && schoolYears.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="pb-4 text-sm font-semibold text-muted-foreground">
                    Label
                  </th>
                  <th className="pb-4 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-4 text-sm font-semibold text-muted-foreground">
                    Created
                  </th>
                  <th className="pb-4 text-right text-sm font-semibold text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {schoolYears.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-primary/5 last:border-b-0"
                  >
                    <td className="py-4">
                      <p className="font-medium text-foreground">{item.label}</p>
                    </td>

                    <td className="py-4">
                      {item.is_active ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-4 text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="py-4 text-right">
                      {!item.is_active ? (
                        <form action={setActiveSchoolYear} className="inline">
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-primary/15 bg-white px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-primary hover:text-primary-foreground"
                          >
                            Set Active
                          </button>
                        </form>
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          Current
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-10 text-center text-sm text-muted-foreground">
            No school years have been added yet.
          </div>
        )}
      </section>
    </div>
  )
}