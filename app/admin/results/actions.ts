"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createResult(formData: FormData) {
  const supabase = await createClient()

  const applicantId = Number(formData.get("applicant_id"))
  const schoolYearId = Number(formData.get("school_year_id"))
  const testScheduleId = Number(formData.get("test_schedule_id"))
  const overallPercentage = Number(formData.get("overall_percentage"))

  const remarks = String(formData.get("remarks") || "").trim()
  const isPublished = formData.get("is_published") === "on"

  if (!applicantId) throw new Error("Applicant is required.")
  if (!schoolYearId) throw new Error("School year is required.")
  if (!testScheduleId) throw new Error("Test schedule is required.")

  if (
    Number.isNaN(overallPercentage) ||
    overallPercentage < 0 ||
    overallPercentage > 100
  ) {
    throw new Error("Overall percentage must be between 0 and 100.")
  }

  const { error } = await supabase.from("results").insert({
    applicant_id: applicantId,
    school_year_id: schoolYearId,
    test_schedule_id: testScheduleId,
    overall_percentage: overallPercentage,
    remarks: remarks || null,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")
}

export async function togglePublishResult(formData: FormData) {
  const supabase = await createClient()

  const id = Number(formData.get("id"))
  const nextPublished = formData.get("next_published") === "true"

  if (!id) {
    throw new Error("Invalid result record.")
  }

  const { error } = await supabase
    .from("results")
    .update({
      is_published: nextPublished,
      published_at: nextPublished ? new Date().toISOString() : null,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/results")
  revalidatePath("/admin/dashboard")
}