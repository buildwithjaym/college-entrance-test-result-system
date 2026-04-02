"use client"

import { useState } from "react"
import { Edit3, Loader2, Save, Trash2, X } from "lucide-react"
import {
  deleteApplicant,
  updateApplicant,
} from "@/app/admin/applicants/actions"
import { useFormStatus } from "react-dom"

type Applicant = {
  id: number
  reference_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  email: string | null
  created_at: string
}

function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
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

function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </>
      )}
    </button>
  )
}

function ApplicantCard({ applicant }: { applicant: Applicant }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
        <form action={updateApplicant} className="space-y-4">
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
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                defaultValue={applicant.email ?? ""}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
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
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SaveButton />

            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-red-200 hover:bg-red-50/20 xl:flex-row xl:items-center xl:justify-between">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-slate-900">
          {[applicant.first_name, applicant.middle_name, applicant.last_name]
            .filter(Boolean)
            .join(" ")}
        </p>

        <div className="mt-1 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span>{applicant.reference_number}</span>
          <span>{applicant.email || "No email"}</span>
          <span>
            Added{" "}
            {new Date(applicant.created_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Edit
        </button>

        <form action={deleteApplicant}>
          <input type="hidden" name="id" value={applicant.id} />
          <DeleteButton />
        </form>
      </div>
    </div>
  )
}

export function ApplicantsList({ applicants }: { applicants: Applicant[] }) {
  if (!applicants.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
        No applicant records found.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {applicants.map((applicant) => (
        <ApplicantCard key={applicant.id} applicant={applicant} />
      ))}
    </div>
  )
}