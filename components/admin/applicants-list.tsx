"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Edit3, Loader2, Save, Trash2, X } from "lucide-react"
import {
  deleteApplicant,
  updateApplicant,
} from "@/app/admin/applicants/actions"
import {
  dismissToast,
  showError,
  showInfo,
  showLoading,
  showSuccess,
} from "@/lib/toast"

type Applicant = {
  id: number
  user_id?: string | null
  reference_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  email: string
  created_at: string
}

const GMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@gmail\.com$/

function isValidGmail(email: string) {
  return GMAIL_PATTERN.test(email)
}

function getApplicantName(applicant: Applicant | null) {
  if (!applicant) return ""

  return [applicant.first_name, applicant.middle_name, applicant.last_name]
    .filter(Boolean)
    .join(" ")
}

function EditApplicantModal({
  applicant,
  pending,
  onClose,
  onSubmit,
}: {
  applicant: Applicant | null
  pending: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}) {
  if (!applicant) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Edit Applicant
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Update applicant details. Gmail format is required.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={onSubmit} className="space-y-4 p-6">
          <input type="hidden" name="id" value={applicant.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Reference Number
              </label>
              <input
                name="reference_number"
                defaultValue={applicant.reference_number}
                disabled={pending}
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Gmail Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="name@gmail.com"
                defaultValue={applicant.email}
                disabled={pending}
                required
                pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                title="Please enter a valid Gmail address like name@gmail.com"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                Example: name@gmail.com
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                First Name
              </label>
              <input
                name="first_name"
                defaultValue={applicant.first_name}
                disabled={pending}
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Middle Name
              </label>
              <input
                name="middle_name"
                defaultValue={applicant.middle_name ?? ""}
                disabled={pending}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                name="last_name"
                defaultValue={applicant.last_name}
                disabled={pending}
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  applicant,
  pending,
  onClose,
  onConfirm,
}: {
  applicant: Applicant | null
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!applicant) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">
          Delete applicant?
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          You are about to delete{" "}
          <span className="font-semibold text-slate-800">
            {getApplicantName(applicant)}
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function ApplicantRow({
  applicant,
  onEdit,
  onDelete,
}: {
  applicant: Applicant
  onEdit: (applicant: Applicant) => void
  onDelete: (applicant: Applicant) => void
}) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/70">
      <td className="px-4 py-4 text-sm font-medium text-slate-900">
        {applicant.reference_number}
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">
        {applicant.first_name}
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">
        {applicant.middle_name || "—"}
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">
        {applicant.last_name}
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">
        {applicant.email}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              onEdit(applicant)
              showInfo("Edit modal opened.")
            }}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(applicant)}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export function ApplicantsList({
  applicants,
  currentPage,
  totalPages,
  query,
}: {
  applicants: Applicant[]
  currentPage: number
  totalPages: number
  query: string
}) {
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null)
  const [deletingApplicant, setDeletingApplicant] = useState<Applicant | null>(
    null
  )
  const [savePending, setSavePending] = useState(false)
  const [deletePending, setDeletePending] = useState(false)

  const normalizedTotalPages = Math.max(totalPages, 1)

  const pageSummary = useMemo(() => {
    return `Page ${currentPage} of ${normalizedTotalPages}`
  }, [currentPage, normalizedTotalPages])

  function buildPageLink(page: number) {
    const params = new URLSearchParams()

    if (query) params.set("q", query)
    params.set("page", String(page))

    return `/admin/applicants?${params.toString()}`
  }

  async function handleUpdate(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim()
    const referenceNumber = String(
      formData.get("reference_number") ?? ""
    ).trim()
    const firstName = String(formData.get("first_name") ?? "").trim()
    const middleName = String(formData.get("middle_name") ?? "").trim()
    const lastName = String(formData.get("last_name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim().toLowerCase()

    if (!id) {
      showError("Applicant ID is missing.")
      return
    }

    if (!referenceNumber) {
      showError("Reference number is required.")
      return
    }

    if (!firstName) {
      showError("First name is required.")
      return
    }

    if (!lastName) {
      showError("Last name is required.")
      return
    }

    if (!email) {
      showError("Email is required.")
      return
    }

    if (!isValidGmail(email)) {
      showError(
        "Invalid Gmail format. Please use a valid Gmail address like name@gmail.com."
      )
      return
    }

    formData.set("id", id)
    formData.set("reference_number", referenceNumber)
    formData.set("first_name", firstName)
    formData.set("middle_name", middleName)
    formData.set("last_name", lastName)
    formData.set("email", email)

    setSavePending(true)
    const toastId = showLoading("Updating applicant...")

    try {
      await updateApplicant(formData)

      dismissToast(toastId)
      showSuccess("Applicant updated successfully.")
      setEditingApplicant(null)
    } catch (error) {
      dismissToast(toastId)
      showError(
        error instanceof Error ? error.message : "Failed to update applicant."
      )
    } finally {
      setSavePending(false)
    }
  }

  async function handleDeleteConfirmed() {
    if (!deletingApplicant || deletePending) return

    setDeletePending(true)
    const toastId = showLoading("Deleting applicant...")

    try {
      const formData = new FormData()
      formData.set("id", String(deletingApplicant.id))

      await deleteApplicant(formData)

      dismissToast(toastId)
      showSuccess("Applicant deleted successfully.")
      setDeletingApplicant(null)
    } catch (error) {
      dismissToast(toastId)
      showError(
        error instanceof Error ? error.message : "Failed to delete applicant."
      )
    } finally {
      setDeletePending(false)
    }
  }

  if (!applicants.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
        No applicant records found.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                  Reference Number
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                  First Name
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                  Middle Name
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                  Last Name
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-slate-500">
                  Email
                </th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {applicants.map((applicant) => (
                <ApplicantRow
                  key={applicant.id}
                  applicant={applicant}
                  onEdit={setEditingApplicant}
                  onDelete={setDeletingApplicant}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">{pageSummary}</p>

          <div className="flex items-center gap-2">
            <Link
              href={buildPageLink(Math.max(currentPage - 1, 1))}
              className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                currentPage <= 1
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Previous
            </Link>

            <Link
              href={buildPageLink(
                Math.min(currentPage + 1, normalizedTotalPages)
              )}
              className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                currentPage >= normalizedTotalPages
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>

      <EditApplicantModal
        applicant={editingApplicant}
        pending={savePending}
        onClose={() => {
          if (!savePending) setEditingApplicant(null)
        }}
        onSubmit={handleUpdate}
      />

      <DeleteConfirmModal
        applicant={deletingApplicant}
        pending={deletePending}
        onClose={() => {
          if (!deletePending) setDeletingApplicant(null)
        }}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  )
}