import { createClient } from "@/lib/supabase/server"
import { ApplicantsToolbar } from "@/components/admin/applicants-toolbar"
import { ApplicantsList } from "@/components/admin/applicants-list"

const PAGE_SIZE = 10

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>
}) {
  const params = (await searchParams) || {}
  const query = params.q?.trim() || ""
  const currentPage = Math.max(Number(params.page || "1"), 1)

  const supabase = await createClient()

  let request = supabase
    .from("applicants")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (query) {
    request = request.or(
      `reference_number.ilike.%${query}%,first_name.ilike.%${query}%,middle_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
    )
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: applicants, error, count } = await request.range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const totalApplicants = count ?? 0
  const totalPages = Math.max(Math.ceil(totalApplicants / PAGE_SIZE), 1)
  const latestApplicant = applicants?.[0] ?? null

  return (
    <div className="space-y-5">
      <ApplicantsToolbar
        totalApplicants={totalApplicants}
        latestApplicantName={
          latestApplicant
            ? `${latestApplicant.first_name} ${latestApplicant.last_name}`
            : "No applicants yet"
        }
        query={query}
      />

      <ApplicantsList
        applicants={applicants ?? []}
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
      />
    </div>
  )
}