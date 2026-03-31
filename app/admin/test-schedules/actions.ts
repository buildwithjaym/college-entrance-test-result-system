"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createTestSchedule(formData: FormData) {
  const supabase = await createClient()

  const schoolYearId = Number(formData.get("school_year_id"))
  const name = String(formData.get("name") || "").trim()
  const examDate = String(formData.get("exam_date") || "").trim()
  const notes = String(formData.get("notes") || "").trim()

  if (!schoolYearId) {
    throw new Error("School year is required.")
  }

  if (!name) {
    throw new Error("Schedule name is required.")
  }

  if (!examDate) {
    throw new Error("Exam date is required.")
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