import { createClient } from "@/lib/supabase/server"
import { TestSchedulesManager } from "@/components/admin/test-schedules-manager"

export type SchoolYearRow = {
  id: number
  label: string
  is_active: boolean
}

export type ScheduleRow = {
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

  return (
    <TestSchedulesManager
      schoolYears={(schoolYears ?? []) as SchoolYearRow[]}
      schedules={(schedules ?? []) as ScheduleRow[]}
    />
  )
}