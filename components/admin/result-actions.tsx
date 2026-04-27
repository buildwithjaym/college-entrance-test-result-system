"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { CheckCircle2, Eye, EyeOff, Loader2, Trash2, X, XCircle } from "lucide-react"

import { deleteResult, toggleResultPublish } from "@/app/admin/results/actions"

export function ResultActions({
  id,
  isPublished,
}: {
  id: number
  isPublished: boolean
}) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const [isPending, startTransition] = useTransition()

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })

    window.setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  function handlePublish() {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("id", String(id))
      formData.set("next_value", String(!isPublished))

      const result = await toggleResultPublish(formData)

      showToast(result.ok ? "success" : "error", result.message)

      if (result.ok) {
        router.refresh()
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("id", String(id))

      const result = await deleteResult(formData)

      showToast(result.ok ? "success" : "error", result.message)

      if (result.ok) {
        setDeleteOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className={
            isPublished
              ? "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              : "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPublished ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}

          {isPublished ? "Hide" : "Release"}
        </button>

        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-950">
                  Delete result record?
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This will permanently remove this CET result record. This
                  action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={isPending}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete result
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-5 right-5 z-[60] w-[calc(100%-2.5rem)] max-w-sm">
          <div
            className={
              toast.type === "success"
                ? "flex items-start gap-3 rounded-2xl border border-green-200 bg-white p-4 text-green-800 shadow-2xl"
                : "flex items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 text-red-800 shadow-2xl"
            }
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <div className="min-w-0">
              <p className="text-sm font-bold">
                {toast.type === "success" ? "Success" : "Something went wrong"}
              </p>
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}