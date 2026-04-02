import { createClient } from "@/lib/supabase/server"
import { ApplicantsToolbar } from "@/components/admin/applicants-toolbar"
import { ApplicantsList } from "@/components/admin/applicants-list"

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>
}) {
  const params = (await searchParams) || {}
  const query = params.q?.trim() || ""

  const supabase = await createClient()

  let request = supabase
    .from("applicants")
    .select("*")
    .order("created_at", { ascending: false })

  if (query) {
    request = request.or(
      `reference_number.ilike.%${query}%,first_name.ilike.%${query}%,middle_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
    )
  }

  const { data: applicants, error } = await request

  if (error) {
    throw new Error(error.message)
  }

  const totalApplicants = applicants?.length ?? 0
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

      <ApplicantsList applicants={applicants ?? []} />
    </div>
  )
}