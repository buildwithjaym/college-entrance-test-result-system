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

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save
        </>
      )}
    </button>
  )
}

function DeleteConfirmModal({
  open,
  applicantName,
  pending,
  onClose,
  onConfirm,
}: {
  open: boolean
  applicantName: string
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Delete applicant?</h3>
        <p className="mt-2 text-sm text-slate-500">
          You are about to delete{" "}
          <span className="font-semibold">{applicantName}</span>. This will also
          remove their login account and profile.
        </p>

        <div className="mt-6 flex justify-end gap-2">
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
  onAskDelete,
}: {
  applicant: Applicant
  onAskDelete: (applicant: Applicant) => void
}) {
  const [editing, setEditing] = useState(false)
  const [savePending, setSavePending] = useState(false)

  async function handleUpdate(formData: FormData) {
    const firstName = String(formData.get("first_name") ?? "").trim()
    const lastName = String(formData.get("last_name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim().toLowerCase()

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.")
      return
    }

    formData.set("email", email)

    setSavePending(true)
    const toastId = showLoading("Updating applicant...")

    try {
      await updateApplicant(formData)
      dismissToast(toastId)
      showSuccess("Applicant updated successfully.")
      setEditing(false)
    } catch (error) {
      dismissToast(toastId)
      showError(
        error instanceof Error ? error.message : "Failed to update applicant."
      )
    } finally {
      setSavePending(false)
    }
  }

  if (editing) {
    return (
      <tr className="border-b border-slate-100 bg-red-50/30">
        <td colSpan={6} className="p-4">
          <form action={handleUpdate} className="space-y-4">
            <input type="hidden" name="id" value={applicant.id} />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Reference Number
                </label>
                <input
                  name="reference_number"
                  defaultValue={applicant.reference_number}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  required
                  disabled={savePending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={applicant.email}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  required
                  disabled={savePending}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  name="first_name"
                  defaultValue={applicant.first_name}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  required
                  disabled={savePending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Middle Name
                </label>
                <input
                  name="middle_name"
                  defaultValue={applicant.middle_name ?? ""}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  disabled={savePending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  name="last_name"
                  defaultValue={applicant.last_name}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  required
                  disabled={savePending}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SaveButton pending={savePending} />

              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  showInfo("Edit cancelled.")
                }}
                disabled={savePending}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/70">
      <td className="px-4 py-4 text-sm font-medium text-slate-900">
        {applicant.reference_number}
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">{applicant.first_name}</td>
      <td className="px-4 py-4 text-sm text-slate-700">
        {applicant.middle_name || "—"}
      </td>
      <td className="px-4 py-4 text-sm text-slate-700">{applicant.last_name}</td>
      <td className="px-4 py-4 text-sm text-slate-700">{applicant.email}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(true)
              showInfo("Edit mode opened.")
            }}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onAskDelete(applicant)}
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
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const applicantName = useMemo(() => {
    if (!selectedApplicant) return ""
    return [
      selectedApplicant.first_name,
      selectedApplicant.middle_name,
      selectedApplicant.last_name,
    ]
      .filter(Boolean)
      .join(" ")
  }, [selectedApplicant])

  const buildPageLink = (page: number) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    params.set("page", String(page))
    return `/admin/applicants?${params.toString()}`
  }

  async function handleDeleteConfirmed() {
    if (!selectedApplicant) return

    setDeletePending(true)
    const toastId = showLoading("Deleting applicant...")

    try {
      const formData = new FormData()
      formData.set("id", String(selectedApplicant.id))
      await deleteApplicant(formData)
      dismissToast(toastId)
      showSuccess("Applicant deleted successfully.")
      setSelectedApplicant(null)
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
                  onAskDelete={setSelectedApplicant}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>

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
              href={buildPageLink(Math.min(currentPage + 1, totalPages))}
              className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${
                currentPage >= totalPages
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={!!selectedApplicant}
        applicantName={applicantName}
        pending={deletePending}
        onClose={() => !deletePending && setSelectedApplicant(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  )
}