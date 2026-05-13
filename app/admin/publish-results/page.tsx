import { Sparkles } from "lucide-react"

import {
  getPublishResultsContext,
  searchApplicantsForPublishing,
} from "./actions"

import { PublishResultsClient } from "./publish-results-client"

export default async function PublishResultsPage() {
  const context = await getPublishResultsContext()

  const initialData = await searchApplicantsForPublishing({
    query: "",
    schoolYearId: context.activeSchoolYear?.id ?? null,
    page: 1,
    pageSize: 20,
  })

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-red-100 bg-gradient-to-br from-white via-white to-red-50 p-5 shadow-sm sm:p-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
            <Sparkles className="h-3.5 w-3.5" />
            Release results
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Add and Release Results
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Search applicants, add CET scores, save drafts, publish results,
            and manage large applicant lists with pagination.
          </p>
        </div>
      </section>

      <PublishResultsClient
        schoolYears={context.schoolYears}
        schedules={context.schedules}
        activeSchoolYear={context.activeSchoolYear}
        initialData={initialData}
      />
    </div>
  )
}