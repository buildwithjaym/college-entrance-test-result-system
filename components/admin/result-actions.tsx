"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react"

import { deleteResult, toggleResultPublish } from "@/app/admin/results/actions"
import {
  dismissToast,
  showError,
  showLoading,
  showSuccess,
} from "@/lib/toast"

export function ResultActions({
  id,
  isPublished,
}: {
  id: number
  isPublished: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handlePublish() {
    const formData = new FormData()
    formData.set("id", String(id))
    formData.set("next_value", String(!isPublished))

    const toastId = showLoading(
      isPublished ? "Hiding result..." : "Releasing result...",
    )

    startTransition(async () => {
      try {
        const result = await toggleResultPublish(formData)

        dismissToast(toastId)

        if (!result.ok) {
          showError(result.message)
          return
        }

        showSuccess(result.message)
        router.refresh()
      } catch (error) {
        dismissToast(toastId)
        showError(
          error instanceof Error
            ? error.message
            : "Failed to update result status.",
        )
      }
    })
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this result record? This action cannot be undone.",
    )

    if (!confirmed) return

    const formData = new FormData()
    formData.set("id", String(id))

    const toastId = showLoading("Deleting result...")

    startTransition(async () => {
      try {
        const result = await deleteResult(formData)

        dismissToast(toastId)

        if (!result.ok) {
          showError(result.message)
          return
        }

        showSuccess(result.message)
        router.refresh()
      } catch (error) {
        dismissToast(toastId)
        showError(
          error instanceof Error ? error.message : "Failed to delete result.",
        )
      }
    })
  }

  return (
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
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  )
}