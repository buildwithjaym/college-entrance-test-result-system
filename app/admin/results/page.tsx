import { CheckCircle2, ClipboardList, FileCheck2, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createResult, togglePublishResult } from "./actions"

export default async function ResultsPage() {
  const supabase = await createClient()

  const [
    { data: applicants, error: applicantsError },
    { data: schoolYears, error: schoolYearsError },
    { data: schedules, error: schedulesError },
    { data: results, error: resultsError },
  ] = await Promise.all([
    supabase
      .from("applicants")
      .select("id, reference_number, first_name, middle_name, last_name")
      .order("created_at", { ascending: false }),
    supabase
      .from("school_years")
      .select("id, label, is_active")
      .order("created_at", { ascending: false }),
    supabase
      .from("test_schedules")
      .select("id, name, exam_date, school_year_id")
      .order("exam_date", { ascending: false }),
    supabase
      .from("results")
      .select(`
        id,
        overall_percentage,
        remarks,
        is_published,
        created_at,
        applicants (
          id,
          reference_number,
          first_name,
          middle_name,
          last_name
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
      .order("created_at", { ascending: false }),
  ])

  if (applicantsError) throw new Error(applicantsError.message)
  if (schoolYearsError) throw new Error(schoolYearsError.message)
  if (schedulesError) throw new Error(schedulesError.message)
  if (resultsError) throw new Error(resultsError.message)

  const activeSchoolYear = schoolYears?.find((item) => item.is_active) ?? null
  const totalResults = results?.length ?? 0
  const publishedResults = results?.filter((item) => item.is_published).length ?? 0
  const draftResults = totalResults - publishedResults

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Result Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Results
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Create, manage, and publish applicant results for online viewing and
          downloadable student access.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-primary/10 bg-white/95 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Results</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{totalResults}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/95 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{publishedResults}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/95 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{draftResults}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Create Result
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Add a new result record
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Link a result to an applicant, school year, and exam schedule.
            </p>
          </div>

          <form action={createResult} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="applicant_id" className="text-sm font-medium text-foreground">
                Applicant
              </label>
              <select
                id="applicant_id"
                name="applicant_id"
                required
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select applicant</option>
                {applicants?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.reference_number} — {[item.first_name, item.middle_name, item.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="school_year_id" className="text-sm font-medium text-foreground">
                  School Year
                </label>
                <select
                  id="school_year_id"
                  name="school_year_id"
                  required
                  defaultValue={activeSchoolYear?.id ?? ""}
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select school year</option>
                  {schoolYears?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}{item.is_active ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="test_schedule_id" className="text-sm font-medium text-foreground">
                  Test Schedule
                </label>
                <select
                  id="test_schedule_id"
                  name="test_schedule_id"
                  required
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select schedule</option>
                  {schedules?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {new Date(item.exam_date).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="overall_percentage" className="text-sm font-medium text-foreground">
                Overall Percentage
              </label>
              <input
                id="overall_percentage"
                name="overall_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 86.50"
                required
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="math_percentage" className="text-sm font-medium text-foreground">
                  Math % <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="math_percentage"
                  name="math_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="english_percentage" className="text-sm font-medium text-foreground">
                  English % <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="english_percentage"
                  name="english_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="science_percentage" className="text-sm font-medium text-foreground">
                  Science % <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="science_percentage"
                  name="science_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="verbal_percentage" className="text-sm font-medium text-foreground">
                  Verbal % <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="verbal_percentage"
                  name="verbal_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="remarks" className="text-sm font-medium text-foreground">
                Remarks <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="remarks"
                name="remarks"
                rows={4}
                placeholder="Add remarks for this result..."
                className="w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground">
              <input
                type="checkbox"
                name="is_published"
                className="h-4 w-4 accent-red-600"
              />
              Publish this result immediately
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Save Result
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Records
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Existing result records
            </h2>
          </div>

          {results && results.length > 0 ? (
            <div className="space-y-3">
              {results.map((item) => {
                const applicant = Array.isArray(item.applicants)
                  ? item.applicants[0]
                  : item.applicants

                const schoolYear = Array.isArray(item.school_years)
                  ? item.school_years[0]
                  : item.school_years

                const schedule = Array.isArray(item.test_schedules)
                  ? item.test_schedules[0]
                  : item.test_schedules

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-primary/10 bg-primary/5 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {[applicant?.first_name, applicant?.middle_name, applicant?.last_name]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {applicant?.reference_number} • {schoolYear?.label} • {schedule?.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {schedule?.exam_date
                            ? new Date(schedule.exam_date).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : ""}
                        </p>
                        {item.remarks ? (
                          <p className="mt-2 text-sm text-foreground">{item.remarks}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <div className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary shadow-sm">
                          {Number(item.overall_percentage).toFixed(2)}%
                        </div>

                        <form action={togglePublishResult}>
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="hidden"
                            name="next_published"
                            value={String(!item.is_published)}
                          />
                          <button
                            type="submit"
                            className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium shadow-sm transition ${
                              item.is_published
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            {item.is_published ? "Published" : "Draft"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-10 text-center text-sm text-muted-foreground">
              No results have been added yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}