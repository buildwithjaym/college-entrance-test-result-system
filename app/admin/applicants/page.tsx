import { Mail, Plus, UserRound, Users, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createApplicant } from "./actions"

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const query = searchParams?.q?.trim() || ""

  const supabase = await createClient()

  let request = supabase
    .from("applicants")
    .select("*")
    .order("created_at", { ascending: false })

  if (query) {
    request = request.or(
      `reference_number.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`
    )
  }

  const { data: applicants, error } = await request

  if (error) throw new Error(error.message)

  const totalApplicants = applicants?.length ?? 0
  const latestApplicant = applicants?.[0]

  return (
    <div className="space-y-6">

      {/* HERO */}
      <section className="rounded-[2rem] border border-red-100 bg-gradient-to-r from-red-50 to-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Applicants
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage and register examinees for CET processing.
        </p>
      </section>

      {/* MAIN GRID */}
      <section className="grid gap-6 xl:grid-cols-[360px_1fr]">

        {/* LEFT: QUICK ADD */}
        <div className="rounded-3xl border border-red-100 bg-white p-5">
          <p className="text-sm font-semibold text-red-600 uppercase">
            Quick Add
          </p>

          <h2 className="text-lg font-bold mt-1">
            New Applicant
          </h2>

          <form action={createApplicant} className="space-y-4 mt-4">

            <input
              name="reference_number"
              placeholder="Reference Number"
              required
              className="h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:ring-red-200"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                name="first_name"
                placeholder="First Name"
                required
                className="h-11 rounded-xl border px-3 text-sm focus:ring-2 focus:ring-red-200"
              />
              <input
                name="last_name"
                placeholder="Last Name"
                required
                className="h-11 rounded-xl border px-3 text-sm focus:ring-2 focus:ring-red-200"
              />
            </div>

            <input
              name="middle_name"
              placeholder="Middle Name (optional)"
              className="h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:ring-red-200"
            />

            <input
              name="email"
              placeholder="Email (optional)"
              className="h-11 w-full rounded-xl border px-3 text-sm focus:ring-2 focus:ring-red-200"
            />

            <button className="w-full h-11 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Add Applicant
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {/* SEARCH + STATS */}
          <div className="rounded-3xl border bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm text-gray-500">Total Applicants</p>
                <p className="text-2xl font-bold">{totalApplicants}</p>
              </div>

              <form className="w-full max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="Search applicant..."
                    className="w-full h-10 pl-10 rounded-xl border text-sm focus:ring-2 focus:ring-red-200"
                  />
                </div>
              </form>

            </div>
          </div>

          {/* LIST (CARD STYLE - BETTER UX THAN TABLE) */}
          <div className="rounded-3xl border bg-white p-5 space-y-3">

            {applicants?.length ? (
              applicants.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border p-4 hover:bg-red-50/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl">
                      <UserRound className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {[item.first_name, item.middle_name, item.last_name]
                          .filter(Boolean)
                          .join(" ")}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.reference_number}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    {item.email ? (
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {item.email}
                      </span>
                    ) : (
                      "No email"
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-500 py-10">
                No applicants yet.
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  )
}