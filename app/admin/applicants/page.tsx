import { Mail, Plus, UserRound, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createApplicant } from "./actions"

export default async function ApplicantsPage() {
  const supabase = await createClient()

  const { data: applicants, error } = await supabase
    .from("applicants")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const totalApplicants = applicants?.length ?? 0
  const latestApplicant = applicants?.[0] ?? null

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Result Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Applicants
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Manage applicant records used for result lookup, publication, and
          downloadable student result access.
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
                Applicant Records
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">Total Applicants</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {totalApplicants}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <p className="text-sm text-muted-foreground">Latest Applicant</p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {latestApplicant
                  ? `${latestApplicant.first_name} ${latestApplicant.last_name}`
                  : "No applicants yet"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-primary/10 bg-white p-5">
            <p className="text-sm text-muted-foreground">Latest Reference Number</p>
            <p className="mt-2 text-lg font-bold text-foreground">
              {latestApplicant?.reference_number ?? "Not available"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Applicant records are used for online result searching and matching.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/10 bg-white/95 p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Create Applicant
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              Add a new applicant
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter applicant information that will later connect to uploaded results.
            </p>
          </div>

          <form action={createApplicant} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="reference_number"
                className="text-sm font-medium text-foreground"
              >
                Reference Number
              </label>
              <input
                id="reference_number"
                name="reference_number"
                type="text"
                placeholder="e.g. BASC-2025-0001"
                required
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="first_name"
                  className="text-sm font-medium text-foreground"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="Enter first name"
                  required
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="middle_name"
                  className="text-sm font-medium text-foreground"
                >
                  Middle Name <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="middle_name"
                  name="middle_name"
                  type="text"
                  placeholder="Enter middle name"
                  className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="last_name"
                className="text-sm font-medium text-foreground"
              >
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Enter last name"
                required
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                className="h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm shadow-sm outline-none transition focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Applicant
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
            Existing applicants
          </h2>
        </div>

        {applicants && applicants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="pb-4 text-sm font-semibold text-muted-foreground">
                    Applicant
                  </th>
                  <th className="pb-4 text-sm font-semibold text-muted-foreground">
                    Reference Number
                  </th>
                  <th className="pb-4 text-sm font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="pb-4 text-sm font-semibold text-muted-foreground">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-primary/5 last:border-b-0"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {[item.first_name, item.middle_name, item.last_name]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-sm font-medium text-foreground">
                      {item.reference_number}
                    </td>

                    <td className="py-4 text-sm text-muted-foreground">
                      {item.email ? (
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {item.email}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="py-4 text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-primary/15 bg-primary/5 px-4 py-10 text-center text-sm text-muted-foreground">
            No applicants have been added yet.
          </div>
        )}
      </section>
    </div>
  )
}