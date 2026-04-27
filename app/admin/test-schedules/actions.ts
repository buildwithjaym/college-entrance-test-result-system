"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

type ActionResult = {
  ok: boolean
  message: string
}

function normalizeDate(value: string) {
  const trimmed = value.trim()

  if (!trimmed) return ""

  const parsed = new Date(trimmed)

  if (Number.isNaN(parsed.getTime())) return ""

  return trimmed
}

function normalizeId(value: FormDataEntryValue | null) {
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

function revalidateTestSchedules() {
  revalidatePath("/admin/test-schedules")
  revalidatePath("/admin/dashboard")
}

export async function createTestSchedule(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const schoolYearId = normalizeId(formData.get("school_year_id"))
  const name = String(formData.get("name") ?? "").trim()
  const examDate = normalizeDate(String(formData.get("exam_date") ?? ""))
  const notes = String(formData.get("notes") ?? "").trim()

  if (!schoolYearId) {
    return {
      ok: false,
      message: "School year is required.",
    }
  }

  if (!name) {
    return {
      ok: false,
      message: "Schedule name is required.",
    }
  }

  if (!examDate) {
    return {
      ok: false,
      message: "A valid exam date is required.",
    }
  }

  const { data: existingSchedule, error: existingScheduleError } = await supabase
    .from("test_schedules")
    .select("id")
    .eq("school_year_id", schoolYearId)
    .eq("name", name)
    .eq("exam_date", examDate)
    .maybeSingle()

  if (existingScheduleError) {
    return {
      ok: false,
      message: existingScheduleError.message,
    }
  }

  if (existingSchedule) {
    return {
      ok: false,
      message: "This test schedule already exists.",
    }
  }

  const { error } = await supabase.from("test_schedules").insert({
    school_year_id: schoolYearId,
    name,
    exam_date: examDate,
    notes: notes || null,
  })

  if (error) {
    return {
      ok: false,
      message: error.message,
    }
  }

  revalidateTestSchedules()

  return {
    ok: true,
    message: "Test schedule created successfully.",
  }
}

export async function updateTestSchedule(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const id = normalizeId(formData.get("id"))
  const schoolYearId = normalizeId(formData.get("school_year_id"))
  const name = String(formData.get("name") ?? "").trim()
  const examDate = normalizeDate(String(formData.get("exam_date") ?? ""))
  const notes = String(formData.get("notes") ?? "").trim()

  if (!id) {
    return {
      ok: false,
      message: "Schedule ID is required.",
    }
  }

  if (!schoolYearId) {
    return {
      ok: false,
      message: "School year is required.",
    }
  }

  if (!name) {
    return {
      ok: false,
      message: "Schedule name is required.",
    }
  }

  if (!examDate) {
    return {
      ok: false,
      message: "A valid exam date is required.",
    }
  }

  const { data: existingSchedule, error: existingScheduleError } = await supabase
    .from("test_schedules")
    .select("id")
    .eq("school_year_id", schoolYearId)
    .eq("name", name)
    .eq("exam_date", examDate)
    .neq("id", id)
    .maybeSingle()

  if (existingScheduleError) {
    return {
      ok: false,
      message: existingScheduleError.message,
    }
  }

  if (existingSchedule) {
    return {
      ok: false,
      message: "Another schedule already uses the same school year, name, and exam date.",
    }
  }

  const { error } = await supabase
    .from("test_schedules")
    .update({
      school_year_id: schoolYearId,
      name,
      exam_date: examDate,
      notes: notes || null,
    })
    .eq("id", id)

  if (error) {
    return {
      ok: false,
      message: error.message,
    }
  }

  revalidateTestSchedules()

  return {
    ok: true,
    message: "Test schedule updated successfully.",
  }
}

export async function deleteTestSchedule(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const id = normalizeId(formData.get("id"))

  if (!id) {
    return {
      ok: false,
      message: "Schedule ID is required.",
    }
  }

  const { count, error: resultCountError } = await supabase
    .from("results")
    .select("id", { count: "exact", head: true })
    .eq("test_schedule_id", id)

  if (resultCountError) {
    return {
      ok: false,
      message: resultCountError.message,
    }
  }

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      message:
        "This schedule cannot be deleted because it is already linked to result records.",
    }
  }

  const { error } = await supabase.from("test_schedules").delete().eq("id", id)

  if (error) {
    return {
      ok: false,
      message: error.message,
    }
  }

  revalidateTestSchedules()

  return {
    ok: true,
    message: "Test schedule deleted successfully.",
  }
}