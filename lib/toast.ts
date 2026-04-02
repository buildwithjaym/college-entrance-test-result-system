import { toast } from "sonner"

export function showSuccess(message: string) {
  toast.success(message)
}

export function showError(message: string) {
  toast.error(message)
}

export function showInfo(message: string) {
  toast.info(message)
}

export function showWarning(message: string) {
  toast.warning(message)
}

export function showLoading(message: string) {
  return toast.loading(message)
}

export function dismissToast(id?: string | number) {
  toast.dismiss(id)
}