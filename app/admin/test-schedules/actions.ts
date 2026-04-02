"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function normalizeDate(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ""
  }

  const parsed = new Date(trimmed)

  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  return trimmed
}

export async function createTestSchedule(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const schoolYearId = Number(formData.get("school_year_id"))
  const name = String(formData.get("name") ?? "").trim()
  const examDate = normalizeDate(String(formData.get("exam_date") ?? ""))
  const notes = String(formData.get("notes") ?? "").trim()

  if (!schoolYearId || Number.isNaN(schoolYearId)) {
    throw new Error("School year is required.")
  }

  if (!name) {
    throw new Error("Schedule name is required.")
  }

  if (!examDate) {
    throw new Error("A valid exam date is required.")
  }

  const { data: existingSchedule, error: existingScheduleError } = await supabase
    .from("test_schedules")
    .select("id")
    .eq("school_year_id", schoolYearId)
    .eq("name", name)
    .eq("exam_date", examDate)
    .maybeSingle()

  if (existingScheduleError) {
    throw new Error(existingScheduleError.message)
  }

  if (existingSchedule) {
    throw new Error("This test schedule already exists.")
  }

  const { error } = await supabase.from("test_schedules").insert({
    school_year_id: schoolYearId,
    name,
    exam_date: examDate,
    notes: notes || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/test-schedules")
  revalidatePath("/admin/dashboard")
}