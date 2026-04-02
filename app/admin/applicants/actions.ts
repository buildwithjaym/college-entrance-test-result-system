"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import * as XLSX from "xlsx"

function clean(value: FormDataEntryValue | null) {
  return String(value || "").trim()
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function buildFullName(firstName: string, middleName: string, lastName: string) {
  return [firstName, middleName, lastName].filter(Boolean).join(" ")
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function getLatestReferenceBase() {
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const { data, error } = await supabase
    .from("applicants")
    .select("reference_number")
    .ilike("reference_number", `BASC-${year}-%`)
    .order("reference_number", { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }

  const latest = data?.[0]?.reference_number
  return latest ? Number(latest.split("-").pop()) || 0 : 0
}

async function generateReferenceNumber() {
  const year = new Date().getFullYear()
  const latestBase = await getLatestReferenceBase()
  const nextNumber = String(latestBase + 1).padStart(6, "0")
  return `BASC-${year}-${nextNumber}`
}

async function ensureUniqueApplicantInputs(
  email: string,
  referenceNumber: string,
  ignoreApplicantId?: string
) {
  const supabase = await createClient()

  let emailQuery = supabase
    .from("applicants")
    .select("id")
    .eq("email", email)
    .limit(1)

  let refQuery = supabase
    .from("applicants")
    .select("id")
    .eq("reference_number", referenceNumber)
    .limit(1)

  if (ignoreApplicantId) {
    emailQuery = emailQuery.neq("id", ignoreApplicantId)
    refQuery = refQuery.neq("id", ignoreApplicantId)
  }

  const [{ data: emailMatch, error: emailError }, { data: refMatch, error: refError }] =
    await Promise.all([emailQuery, refQuery])

  if (emailError) throw new Error(emailError.message)
  if (refError) throw new Error(refError.message)

  if (emailMatch?.length) {
    throw new Error("Email is already assigned to another applicant.")
  }

  if (refMatch?.length) {
    throw new Error("Reference number already exists.")
  }
}

export async function createApplicant(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  let referenceNumber = clean(formData.get("reference_number"))
  const firstName = clean(formData.get("first_name"))
  const middleName = clean(formData.get("middle_name"))
  const lastName = clean(formData.get("last_name"))
  const email = normalizeEmail(clean(formData.get("email")))

  if (!firstName) throw new Error("First name is required.")
  if (!lastName) throw new Error("Last name is required.")
  if (!email) throw new Error("Email is required.")
  if (!isValidEmail(email)) throw new Error("Please enter a valid email address.")

  if (!referenceNumber) {
    referenceNumber = await generateReferenceNumber()
  }

  await ensureUniqueApplicantInputs(email, referenceNumber)

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: referenceNumber,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Failed to create authentication user.")
  }

  const userId = authData.user.id
  const fullName = buildFullName(firstName, middleName, lastName)

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email,
    full_name: fullName,
    role: "applicant",
    must_change_password: true,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    throw new Error(profileError.message)
  }

  const { error: applicantError } = await supabase.from("applicants").insert({
    user_id: userId,
    reference_number: referenceNumber,
    first_name: firstName,
    middle_name: middleName || null,
    last_name: lastName,
    email,
  })

  if (applicantError) {
    await supabase.from("profiles").delete().eq("id", userId)
    await admin.auth.admin.deleteUser(userId)
    throw new Error(applicantError.message)
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}

export async function updateApplicant(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const id = clean(formData.get("id"))
  const referenceNumber = clean(formData.get("reference_number"))
  const firstName = clean(formData.get("first_name"))
  const middleName = clean(formData.get("middle_name"))
  const lastName = clean(formData.get("last_name"))
  const email = normalizeEmail(clean(formData.get("email")))

  if (!id) throw new Error("Applicant ID is required.")
  if (!referenceNumber) throw new Error("Reference number is required.")
  if (!firstName) throw new Error("First name is required.")
  if (!lastName) throw new Error("Last name is required.")
  if (!email) throw new Error("Email is required.")
  if (!isValidEmail(email)) throw new Error("Please enter a valid email address.")

  await ensureUniqueApplicantInputs(email, referenceNumber, id)

  const { data: applicant, error: fetchError } = await supabase
    .from("applicants")
    .select("id, user_id")
    .eq("id", id)
    .single()

  if (fetchError || !applicant) {
    throw new Error(fetchError?.message || "Applicant not found.")
  }

  const fullName = buildFullName(firstName, middleName, lastName)

  const { error: applicantError } = await supabase
    .from("applicants")
    .update({
      reference_number: referenceNumber,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      email,
    })
    .eq("id", id)

  if (applicantError) {
    throw new Error(applicantError.message)
  }

  if (applicant.user_id) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email,
        full_name: fullName,
      })
      .eq("id", applicant.user_id)

    if (profileError) {
      throw new Error(profileError.message)
    }

    const { error: authUpdateError } = await admin.auth.admin.updateUserById(
      applicant.user_id,
      {
        email,
      }
    )

    if (authUpdateError) {
      throw new Error(authUpdateError.message)
    }
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}

export async function deleteApplicant(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const id = clean(formData.get("id"))
  if (!id) throw new Error("Applicant ID is required.")

  const { data: applicant, error: fetchError } = await supabase
    .from("applicants")
    .select("id, user_id")
    .eq("id", id)
    .single()

  if (fetchError || !applicant) {
    throw new Error(fetchError?.message || "Applicant not found.")
  }

  const { error: deleteApplicantError } = await supabase
    .from("applicants")
    .delete()
    .eq("id", id)

  if (deleteApplicantError) {
    throw new Error(deleteApplicantError.message)
  }

  if (applicant.user_id) {
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(
      applicant.user_id
    )

    if (authDeleteError) {
      throw new Error(authDeleteError.message)
    }
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}

export async function bulkImportApplicants(formData: FormData) {
  const rowsRaw = clean(formData.get("rows_json"))
  if (!rowsRaw) {
    throw new Error("No preview rows were submitted.")
  }

  let rows: Array<{
    reference_number?: string
    first_name: string
    middle_name?: string
    last_name: string
    email?: string
  }> = []

  try {
    rows = JSON.parse(rowsRaw)
  } catch {
    throw new Error("Invalid import payload.")
  }

  if (!rows.length) {
    throw new Error("No valid applicant rows were found.")
  }

  for (const row of rows) {
    const firstName = String(row.first_name || "").trim()
    const lastName = String(row.last_name || "").trim()
    const email = normalizeEmail(String(row.email || "").trim())

    if (!firstName) throw new Error("Each imported row must have a first name.")
    if (!lastName) throw new Error("Each imported row must have a last name.")
    if (!email) throw new Error("Each imported row must have an email.")
    if (!isValidEmail(email)) {
      throw new Error(`Invalid email found in import: ${email}`)
    }
  }

  for (const row of rows) {
    const rowEmail = normalizeEmail(String(row.email || "").trim())
    const rowRef = String(row.reference_number || "").trim()

    if (rowRef) {
      await ensureUniqueApplicantInputs(rowEmail, rowRef)
    }
  }

  for (const row of rows) {
    const form = new FormData()
    form.set("reference_number", String(row.reference_number || "").trim())
    form.set("first_name", String(row.first_name || "").trim())
    form.set("middle_name", String(row.middle_name || "").trim())
    form.set("last_name", String(row.last_name || "").trim())
    form.set("email", normalizeEmail(String(row.email || "").trim()))
    await createApplicant(form)
  }

  revalidatePath("/admin/applicants")
  revalidatePath("/admin/dashboard")
}

export async function getApplicantsForExport() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("applicants")
    .select("reference_number, first_name, middle_name, last_name, email, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function parseApplicantsExcel(formData: FormData) {
  const file = formData.get("file") as File | null

  if (!file) {
    throw new Error("Excel file is required.")
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet)

  if (!rows.length) {
    throw new Error("The uploaded file is empty.")
  }

  const parsedRows = rows
    .map((row, index) => {
      const firstName = String(row.first_name ?? row["First Name"] ?? "").trim()
      const middleName = String(row.middle_name ?? row["Middle Name"] ?? "").trim()
      const lastName = String(row.last_name ?? row["Last Name"] ?? "").trim()
      const email = normalizeEmail(String(row.email ?? row["Email"] ?? "").trim())
      const referenceNumber = String(
        row.reference_number ?? row["Reference Number"] ?? ""
      ).trim()

      const errors: string[] = []

      if (!firstName) errors.push("Missing first name")
      if (!lastName) errors.push("Missing last name")
      if (!email) errors.push("Missing email")
      if (email && !isValidEmail(email)) errors.push("Invalid email")

      return {
        row_number: index + 2,
        reference_number: referenceNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email,
        valid: errors.length === 0,
        errors,
      }
    })
    .filter((row) => {
      return (
        row.reference_number ||
        row.first_name ||
        row.middle_name ||
        row.last_name ||
        row.email
      )
    })

  if (!parsedRows.length) {
    throw new Error("No readable rows were found in the file.")
  }

  return parsedRows
}