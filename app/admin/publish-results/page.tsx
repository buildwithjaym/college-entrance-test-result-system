import { Sparkles } from "lucide-react"
import {
  getPublishResultsContext,
  searchApplicantsForPublishing,
} from "./actions"
import { PublishResultsClient } from "./publish-results-client"

export default async function PublishResultsPage() {
  const context = await getPublishResultsContext()

  const initialRows = await searchApplicantsForPublishing({
    query: "",
    schoolYearId: context.activeSchoolYear?.id ?? null,
    limit: 20,
  })

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-red-100 bg-gradient-to-br from-white via-white to-red-50 p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
            <Sparkles className="h-3.5 w-3.5" />
            Publish results
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Add and Publish Results
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Search applicants instantly, open a focused modal, add result
            details, and publish from one clean workspace.
          </p>
        </div>
      </section>

      <PublishResultsClient
        schoolYears={context.schoolYears}
        schedules={context.schedules}
        activeSchoolYear={context.activeSchoolYear}
        initialRows={initialRows}
      />
    </div>
  )
}